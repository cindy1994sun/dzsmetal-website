"""Optional browser smoke checks for a running DZS Metal development server."""
import os
import shutil
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright

BASE = os.environ.get("TEST_URL", "http://127.0.0.1:3000/").rstrip("/") + "/"
PAGES = ["", "services/casting.html", "services/cnc-machining.html", "services/forging.html", "services/sheet-metal-fabrication.html", "request-quote.html"]
OUT = Path("test-results")
OUT.mkdir(exist_ok=True)

with sync_playwright() as p:
    executable = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
    browser = p.chromium.launch(**({"executable_path": executable} if executable else {}))
    errors = []
    page = browser.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))
    for width, height in [(1440, 1000), (768, 1024), (390, 844), (320, 720)]:
        page.set_viewport_size({"width": width, "height": height})
        for route in PAGES:
            response = page.goto(BASE + route, wait_until="networkidle")
            assert response.status == 200, (width, route, response.status)
            assert page.locator("h1").count() == 1, route
            assert page.locator("main").is_visible(), route
            assert page.locator('meta[name="description"]').get_attribute("content"), route
            assert page.locator('link[rel="canonical"]').get_attribute("href").startswith("https://dzsmetal.com/"), route
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"Horizontal overflow at {width}px on {route}"
            assert page.evaluate("Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)"), route
            if width in (1440, 390) and route in ("", "request-quote.html"):
                label = "home" if not route else "quote"
                page.screenshot(path=str(OUT / f"{label}-{width}.png"), full_page=True)
        print(f"PASS: six pages at {width}px (content, metadata, assets, no overflow)")

    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(BASE)
    toggle = page.locator("[data-nav-toggle]")
    nav = page.locator("#site-nav")
    assert toggle.is_visible()
    assert not nav.is_visible()
    toggle.click()
    assert toggle.get_attribute("aria-expanded") == "true"
    assert nav.is_visible()
    page.keyboard.press("Escape")
    assert toggle.get_attribute("aria-expanded") == "false"
    assert not nav.is_visible()
    toggle.click()
    nav.get_by_role("link", name="Services", exact=True).click()
    assert page.url.endswith("#services")
    assert toggle.get_attribute("aria-expanded") == "false"
    print("PASS: mobile navigation opens, closes on Escape and follows service link")

    page.goto(BASE + "services/forging.html")
    page.get_by_role("link", name="Prepare your inquiry").click()
    assert page.locator("#service").input_value() == "forging"
    page.get_by_role("button", name="Prepare email inquiry").click()
    assert page.locator("#quote-form :invalid").count() > 0
    assert page.locator("[data-email-draft]").count() == 0
    page.locator("#name").fill("Ada Test")
    page.locator("#company").fill("North & South Manufacturing")
    page.locator("#email").fill("buyer@example.com")
    page.locator("#material").fill("Carbon steel")
    page.locator("#quantity").fill("500 pieces")
    page.locator("#message").fill("Please quote brackets.\nFinish: powder coat & inspect.")
    page.get_by_role("button", name="Prepare email inquiry").click()
    draft = page.locator("[data-email-draft]")
    draft.wait_for(state="visible")
    assert draft.get_attribute("target") == "_blank", "Keep form entries visible when the mail handler is unavailable"
    mail = urlparse(draft.get_attribute("href"))
    assert mail.scheme == "mailto"
    assert mail.path == "marketings@china-casting.com"
    query = parse_qs(mail.query)
    assert query.get("subject"), "Inquiry must have a subject"
    body = query["body"][0]
    for value in ["Ada Test", "North & South Manufacturing", "buyer@example.com", "Forging", "Carbon steel", "500 pieces", "powder coat & inspect."]:
        assert value in body, value
    assert page.locator("#message").input_value().startswith("Please quote brackets.")
    assert "send" in page.locator(".form-status").inner_text().lower()
    print("PASS: service preselection, required fields, encoded inquiry draft and preserved input")

    page.goto(BASE + "request-quote.html?service=unknown")
    assert page.locator("#service").input_value() == ""
    for route in [".git/config", "src/site.mjs", "missing.html"]:
        assert page.request.get(BASE + route).status == 404
    assert page.request.post(BASE).status == 405
    assert not errors, errors
    print("PASS: unknown service fallback, static server boundaries, no browser script errors")
    browser.close()
