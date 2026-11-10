'use strict';
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.querySelector('.menu-toggle');
  const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
  const mobile = window.matchMedia('(max-width:760px)');
  function closeNavigation(returnFocus) {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    dropdowns.forEach(d => d.open = false);
    if (returnFocus && open) menuButton.focus();
  }
  menuButton.hidden = false;
  menuButton.addEventListener('click', function () {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (!open) dropdowns.forEach(d => d.open = false);
  });
  dropdowns.forEach(dropdown => dropdown.addEventListener('toggle', function () {
    if (dropdown.open) dropdowns.forEach(other => { if (other !== dropdown) other.open = false; });
  }));
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.site-header')) closeNavigation(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      const activeDropdown = dropdowns.find(d => d.open);
      if (activeDropdown) { activeDropdown.open = false; activeDropdown.querySelector('summary').focus(); }
      else closeNavigation(true);
    }
  });
  mobile.addEventListener('change', () => closeNavigation(false));

  const heroStage = document.querySelector('[data-hero-depth]');
  if (heroStage) {
    const canTilt = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let pendingFrame = 0;

    function resetTilt() {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
      heroStage.style.removeProperty('--hero-tilt-x');
      heroStage.style.removeProperty('--hero-tilt-y');
    }

    heroStage.addEventListener('pointermove', function (event) {
      if (!canTilt.matches || event.pointerType === 'touch') return;
      cancelAnimationFrame(pendingFrame);
      const { clientX, clientY } = event;
      pendingFrame = requestAnimationFrame(function () {
        pendingFrame = 0;
        const box = heroStage.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (clientX - box.left) / Math.max(1, box.width)));
        const y = Math.min(1, Math.max(0, (clientY - box.top) / Math.max(1, box.height)));
        heroStage.style.setProperty('--hero-tilt-x', `${((.5 - y) * 6).toFixed(2)}deg`);
        heroStage.style.setProperty('--hero-tilt-y', `${((x - .5) * 6).toFixed(2)}deg`);
      });
    }, { passive: true });
    heroStage.addEventListener('pointerleave', resetTilt);
    heroStage.addEventListener('pointercancel', resetTilt);
    canTilt.addEventListener('change', resetTilt);
    window.addEventListener('blur', resetTilt);
  }

  const heroGallery = document.querySelector('[data-hero-gallery]');
  if (heroGallery) {
    const controls = heroGallery.querySelector('.zubrex-product__slide-controls');
    const slideButtons = Array.from(controls.querySelectorAll('button'));
    slideButtons.forEach(button => {
      button.addEventListener('click', () => {
        slideButtons.forEach(choice => {
          const selected = choice === button;
          choice.setAttribute('aria-pressed', String(selected));
          document.getElementById(choice.getAttribute('aria-controls')).hidden = !selected;
        });
      });
    });
    controls.hidden = false;
  }

  const packViewer = document.getElementById('pack-viewer');
  const packZoom = document.querySelector('[data-pack-zoom]');
  if (packViewer && packZoom && typeof packViewer.showModal === 'function') {
    packZoom.hidden = false;
    packZoom.addEventListener('click', () => packViewer.showModal());
    packViewer.addEventListener('click', function (event) {
      if (event.target === packViewer) {
        const r = packViewer.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) packViewer.close();
      }
    });
  }

  const searchButton = document.querySelector('.search-toggle');
  const searchDialog = document.getElementById('site-search');
  const query = document.getElementById('site-query');
  const results = searchDialog.querySelector('.search-results');
  const count = searchDialog.querySelector('.search-count');
  function searchPages() {
    const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = (window.sitePages || []).filter(page => terms.every(term => (page.title + ' ' + page.description + ' ' + page.group).toLowerCase().includes(term)));
    if (terms.length) matches.sort((a, b) => terms.filter(term => b.title.toLowerCase().includes(term)).length - terms.filter(term => a.title.toLowerCase().includes(term)).length);
    const shown = terms.length ? matches : matches.filter(p => ['products.html','benefits.html','faq.html','contact.html'].includes(p.url));
    results.replaceChildren();
    count.textContent = terms.length ? (matches.length ? matches.length + ' page' + (matches.length === 1 ? '' : 's') + ' found' : 'No pages found. Try a product name, serving, or contact.') : 'A few useful places to begin';
    shown.forEach(function (page) {
      const a = document.createElement('a'); a.href = page.url;
      const group = document.createElement('small'); group.textContent = page.group;
      const title = document.createElement('strong'); title.textContent = page.title + ' ↗';
      const description = document.createElement('p'); description.textContent = page.description;
      a.append(group, title, description); results.append(a);
    });
  }
  if (typeof searchDialog.showModal === 'function') {
    searchButton.hidden = false;
    searchButton.addEventListener('click', () => { closeNavigation(false); searchPages(); searchDialog.showModal(); query.focus(); });
    query.addEventListener('input', searchPages);
    searchDialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); searchDialog.close(); } });
    searchDialog.addEventListener('click', e => { if (e.target === searchDialog) { const r = searchDialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) searchDialog.close(); } });
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    const interest = form.querySelector('select');
    const preferred = new URLSearchParams(window.location.search).get('interest');
    if (Array.from(interest.options).some(o => o.value === preferred)) interest.value = preferred;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const subject = 'Holy Elixir enquiry: ' + interest.options[interest.selectedIndex].text;
      const details = ['Name: ' + fields.get('name'), 'Email: ' + fields.get('email')];
      const phone = fields.get('phone').trim();
      const city = fields.get('city').trim();
      if (phone) details.push('Phone: ' + phone);
      if (city) details.push('City / postcode: ' + city);
      const body = details.join('\n') + '\n\n' + fields.get('message');
      window.location.href = 'mailto:Info@holy-elixir.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      document.getElementById('form-status').textContent = 'Review and send the draft in your email app. If it did not open, email Info@holy-elixir.com directly.';
    });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
});
