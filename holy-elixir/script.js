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
      const body = 'Name: ' + fields.get('name') + '\nEmail: ' + fields.get('email') + '\nPhone: ' + (fields.get('phone') || 'Not provided') + '\nCity / postcode: ' + fields.get('city') + '\n\n' + fields.get('message');
      window.location.href = 'mailto:Info@holy-elixir.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      document.getElementById('form-status').textContent = 'Your email draft is ready to open. Review and send it in your email app. If no app opens, email Info@holy-elixir.com directly.';
    });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
});
