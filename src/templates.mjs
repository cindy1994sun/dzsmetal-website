import { brand, email } from './site.mjs';
import { services } from './services.mjs';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[c]);
const e = escapeHtml;
const icon = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const link = (prefix, service) => `${prefix}services/${service.slug}.html`;

function layout({ path, title, description, body, type = 'home', siteUrl = '', schema = {} }) {
  const prefix = path.includes('/') ? '../' : './';
  const canonical = siteUrl ? new URL(path === 'index.html' ? './' : path, siteUrl).href : '';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'service' ? 'Service' : 'Organization',
    name: brand,
    ...(canonical ? { url: canonical } : {}),
    ...(type !== 'service' ? { email } : { provider: { '@type': 'Organization', name: brand, email } }),
    ...schema
  };
  const json = JSON.stringify(structuredData).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="description" content="${e(description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#1b2529">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="${brand}">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta name="twitter:card" content="summary">
  ${canonical ? `<link rel="canonical" href="${e(canonical)}">\n  <meta property="og:url" content="${e(canonical)}">` : ''}
  <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}assets/styles.css">
  <script type="application/ld+json">${json}</script>
  <script src="${prefix}assets/site.js" defer></script>
</head>
<body class="page-${type}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${prefix}index.html" aria-label="DZS Metal home">
        <span class="brand-mark" aria-hidden="true">D</span>
        <span><span class="brand-name">DZS METAL</span><span class="brand-subtitle">CUSTOM METAL MANUFACTURING</span></span>
      </a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-controls="site-nav" aria-expanded="false">Menu <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
      <nav class="site-nav" id="site-nav" aria-label="Main navigation">
        <a href="${prefix}index.html"${type === 'home' ? ' aria-current="page"' : ''}>Home</a>
        <a href="${prefix}index.html#services">Services</a>
        <a href="${prefix}index.html#process">How we work</a>
        <a class="button button-small" href="${prefix}request-quote.html"${type === 'quote' ? ' aria-current="page"' : ''}>Request a quote ${icon}</a>
      </nav>
    </div>
  </header>
  <main id="main">${body}</main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div><a class="brand footer-brand" href="${prefix}index.html"><span class="brand-mark" aria-hidden="true">D</span><span class="brand-name">DZS METAL</span></a><p>Custom metal manufacturing.<br>Clear requirements. Practical solutions.</p></div>
      <div><h2>Our services</h2><ul class="footer-links">${services.map(s => `<li><a href="${link(prefix, s)}">${e(s.name)}</a></li>`).join('')}</ul></div>
      <div><h2>Start a conversation</h2><p>Share your drawing and project requirements.</p><a class="text-link" href="mailto:${email}">${email}</a><p><a class="text-link" href="${prefix}request-quote.html">Prepare an inquiry ${icon}</a></p></div>
    </div>
    <div class="container footer-bottom"><span>© ${new Date().getUTCFullYear()} DZS Metal. All rights reserved.</span><span>Made for the details that matter.</span></div>
  </footer>
</body>
</html>\n`;
}

function home(siteUrl) {
  return layout({ path: 'index.html', siteUrl,
    title: 'Custom Metal Manufacturing for Your Next Project | DZS Metal',
    description: 'Explore custom metal manufacturing with DZS Metal. Share drawings, material specifications and order quantities to request a project-specific quotation.',
    body: `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy"><p class="eyebrow">YOUR DRAWING. OUR STARTING POINT.</p><h1>Good parts start<br>with the details.</h1><p class="lead">Custom metal manufacturing for buyers who need a practical path from design to finished part.</p><div class="hero-actions"><a class="button" href="./request-quote.html">Discuss your project ${icon}</a><a class="button button-secondary" href="#services">Explore our services <span aria-hidden="true">↓</span></a></div><p class="hero-note">Tell us the material, quantity and requirements. We’ll take it from there.</p></div>
        <div class="hero-media"><img src="./assets/metal-forms.svg" alt="Illustrated metal components with machined surfaces and geometric profiles" width="680" height="640" fetchpriority="high"><div class="media-caption"><span>PRECISION IN THE PROCESS</span><span aria-hidden="true">01 / DZS</span></div></div>
      </div>
    </section>
    <div class="trust-strip"><div class="container trust-grid"><span><strong>Drawing-led</strong> project review</span><span><strong>Material-aware</strong> process selection</span><span><strong>Clear communication</strong> from the start</span></div></div>
    <section class="section" id="services"><div class="container"><div class="section-heading section-heading-row"><div><p class="eyebrow">WHAT WE DO</p><h2>Find the right process.<br>Build the right part.</h2></div><p class="section-intro">Explore our manufacturing services. Your geometry, material and order quantity guide the next step.</p></div><div class="service-grid">${services.map((s, i) => `<a class="service-card" href="${link('./', s)}"><div><span class="card-number">0${i + 1}</span><span class="card-arrow">${icon}</span></div><h3>${e(s.name)}</h3><p>${e(s.description)}</p><span class="text-link">Explore service <span aria-hidden="true">→</span></span></a>`).join('')}</div></div></section>
    <section class="section section-muted"><div class="container split-grid"><div class="section-copy"><p class="eyebrow">BUILT AROUND YOUR REQUIREMENTS</p><h2>More clarity.<br>Fewer assumptions.</h2><p class="lead">A useful quotation begins with a shared understanding of the part you need.</p><a class="text-link" href="./request-quote.html">Tell us what you’re making ${icon}</a></div><ul class="feature-list"><li><span class="step-number">01</span><div><h3>Start with your drawing</h3><p>Share dimensions, critical features and revision details so the project can be reviewed against your specification.</p></div></li><li><span class="step-number">02</span><div><h3>Consider the whole part</h3><p>Material, finish, function and quantity all affect the manufacturing route. Include the details that matter to your application.</p></div></li><li><span class="step-number">03</span><div><h3>Confirm before production</h3><p>Agree on the scope, inspection requirements, packaging and delivery terms as part of the quotation process.</p></div></li></ul></div></section>
    <section class="section" id="process"><div class="container"><div class="section-heading"><p class="eyebrow">HOW WE WORK</p><h2>From first drawing<br>to a clear next step.</h2></div><div class="process-grid"><div class="process-step"><span class="step-number">01 / SHARE</span><h3>Send your requirements</h3><p>Prepare your drawing, material grade, quantity and any critical specifications.</p></div><div class="process-step"><span class="step-number">02 / REVIEW</span><h3>Discuss the approach</h3><p>Clarify the process, finishing needs and details that affect the quotation.</p></div><div class="process-step"><span class="step-number">03 / CONFIRM</span><h3>Agree on the scope</h3><p>Review the proposed specifications, commercial terms and next steps before placing an order.</p></div></div></div></section>
    ${cta('./')}` });
}

function cta(prefix) {
  return `<section class="cta-band"><div class="container cta-inner"><div><p class="eyebrow">LET’S TALK ABOUT YOUR PART</p><h2>Have a drawing?<br>Let’s start there.</h2></div><a class="button" href="${prefix}request-quote.html">Request a quotation ${icon}</a></div></section>`;
}

function servicePage(service, siteUrl) {
  const s = service;
  return layout({ path: `services/${s.slug}.html`, siteUrl, type: 'service',
    title: `${s.name} Services | DZS Metal`, description: s.description,
    schema: { name: `${s.name} Services`, serviceType: s.name, description: s.description },
    body: `
    <section class="page-hero"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a><span aria-hidden="true">/</span><a href="../index.html#services">Services</a><span aria-hidden="true">/</span><span aria-current="page">${e(s.name)}</span></nav><div class="page-hero-grid"><div><p class="eyebrow">${e(s.eyebrow)}</p><h1>${e(s.name)}</h1><p class="lead">${e(s.intro)}</p><a class="button" href="../request-quote.html?service=${encodeURIComponent(s.slug)}">Discuss a ${e(s.shortName.toLowerCase())} project ${icon}</a></div><aside class="service-aside"><span class="card-number">PROCESS / 0${services.indexOf(s) + 1}</span><p>${e(s.heroNote)}</p><span class="eyebrow">SPECIFICATION FIRST. PROCESS SECOND.</span></aside></div></div></section>
    <section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">PROCESS OVERVIEW</p><h2>A route from design<br>to the part you need.</h2><p class="section-intro">${e(s.overview)}</p></div><div class="capability-grid">${s.capabilities.map(c => `<div class="capability-card"><h3>${e(c.title)}</h3><p>${e(c.text)}</p></div>`).join('')}</div></div></section>
    <section class="section section-muted"><div class="container two-column"><div class="info-panel"><p class="eyebrow">MATERIALS TO DISCUSS</p><h2>Match the material<br>to the application.</h2><div class="tag-list">${s.materials.map(m => `<span class="tag">${e(m)}</span>`).join('')}</div><p>Specify the exact grade and any relevant standard. Suitability and availability are confirmed during project review.</p></div><div class="info-panel"><p class="eyebrow">TYPICAL APPLICATIONS</p><h2>Where this process<br>can fit.</h2><ul class="check-list">${s.applications.map(a => `<li>${e(a)}</li>`).join('')}</ul></div></div></section>
    <section class="section"><div class="container two-column"><div class="section-copy"><p class="eyebrow">A BETTER START TO YOUR QUOTE</p><h2>Send the details<br>that make a difference.</h2><p>These details help define the scope and identify questions before a quotation is prepared.</p><ul class="check-list">${s.quoteChecklist.map(c => `<li>${e(c)}</li>`).join('')}</ul><a class="text-link" href="../request-quote.html?service=${encodeURIComponent(s.slug)}">Prepare your inquiry ${icon}</a></div><div><p class="eyebrow">COMMON QUESTIONS</p><div class="faq-list">${s.faqs.map(f => `<details><summary>${e(f.question)}</summary><p>${e(f.answer)}</p></details>`).join('')}</div></div></div></section>
    ${cta('../')}` });
}

function quote(siteUrl) {
  return layout({ path: 'request-quote.html', siteUrl, type: 'quote',
    title: 'Request a Metal Manufacturing Quote | DZS Metal',
    description: `Request a quotation for your custom metal project. Send drawings, material details and quantities to DZS Metal at ${email}.`,
    body: `<section class="page-hero"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="./index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Request a quote</span></nav><p class="eyebrow">YOUR NEXT PROJECT STARTS HERE</p><h1>Let’s talk details.</h1><p class="lead">Tell us about your part. Start with what you know; we can discuss the rest.</p></div></section>
    <section class="section"><div class="container quote-grid"><form class="quote-form" id="quote-form" action="mailto:${email}" method="post" enctype="text/plain"><h2>Project inquiry</h2><p class="form-note">Fields marked * are required. This form prepares an email draft; send it from your email application. Choose “Open email draft” after preparing your inquiry. You can attach drawings there.</p><div class="form-grid">
    <div class="field"><label for="name">Your name *</label><input id="name" name="name" autocomplete="name" maxlength="100" required></div>
    <div class="field"><label for="company">Company</label><input id="company" name="company" autocomplete="organization" maxlength="160"></div>
    <div class="field"><label for="email">Email address *</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required></div>
    <div class="field"><label for="service">Service</label><select id="service" name="service"><option value="">Help me choose a process</option>${services.map(s => `<option value="${e(s.slug)}">${e(s.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="material">Material / grade</label><input id="material" name="material" placeholder="e.g. stainless steel, grade to be confirmed" maxlength="160"></div>
    <div class="field"><label for="quantity">Estimated quantity</label><input id="quantity" name="quantity" placeholder="e.g. 500 pieces per order" maxlength="100"></div>
    <div class="field field-full"><label for="message">Project details *</label><textarea id="message" name="message" rows="7" maxlength="4000" placeholder="Part function, dimensions, critical features, finish, inspection requirements and target schedule…" required></textarea></div>
    </div><p class="form-note">We use the details you send to discuss your inquiry. This page does not upload files or store your form entries on a server.</p><button class="button" type="submit">Prepare email inquiry ${icon}</button><p class="form-status" role="status" aria-live="polite"></p><noscript><p>JavaScript is disabled. You can email your project details directly to <a href="mailto:${email}">${email}</a>.</p></noscript></form>
    <aside class="quote-aside"><div class="contact-card"><p class="eyebrow">PREFER TO EMAIL DIRECTLY?</p><h2>Your drawing is<br>a great introduction.</h2><a class="text-link" href="mailto:${email}">${email}</a><p>If an email application is not configured, copy this address into your preferred email service.</p></div><div class="contact-card"><h3>For a useful quotation</h3><ul class="check-list"><li>Attach a drawing with its revision number.</li><li>Specify the material grade and finish.</li><li>Include the order quantity and expected demand.</li><li>Highlight critical dimensions and inspection needs.</li><li>Tell us your delivery destination and target schedule.</li></ul><p class="form-note">Please attach files in your email application after the draft opens.</p></div></aside></div></section>` });
}

export function renderPages(siteUrl = '') {
  return new Map([
    ['index.html', home(siteUrl)],
    ...services.map(s => [`services/${s.slug}.html`, servicePage(s, siteUrl)]),
    ['request-quote.html', quote(siteUrl)]
  ]);
}
