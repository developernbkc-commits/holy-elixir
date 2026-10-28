'use strict';
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const notice = document.querySelector('.site-notice');
  const noticeButton = document.querySelector('.notice-pause');
  function measureNotice() {
    document.documentElement.style.setProperty('--notice-height', notice.offsetHeight + 'px');
  }
  function updateNotice() { noticeButton.hidden = reduced.matches; measureNotice(); }
  noticeButton.addEventListener('click', function () {
    const paused = notice.classList.toggle('is-paused');
    noticeButton.setAttribute('aria-pressed', String(paused));
    noticeButton.setAttribute('aria-label', (paused ? 'Resume' : 'Pause') + ' update notice');
    noticeButton.textContent = paused ? 'Resume' : 'Pause';
  });
  if ('ResizeObserver' in window) new ResizeObserver(measureNotice).observe(notice);
  window.addEventListener('resize', measureNotice);
  reduced.addEventListener('change', updateNotice);
  updateNotice();

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

  document.querySelectorAll('.moment-section').forEach(function (section) {
    const controls = section.querySelector('.moment-controls');
    controls.hidden = false;
    const buttons = Array.from(section.querySelectorAll('[data-moment]'));
    function selectMoment(button) {
      buttons.forEach(function (other) {
        const selected = other === button;
        other.setAttribute('aria-pressed', String(selected));
        document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
      });
    }
    buttons.forEach(function (button, i) {
      button.addEventListener('click', () => selectMoment(button));
      button.addEventListener('keydown', function (event) {
        let next;
        if (event.key === 'ArrowRight') next = (i + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); buttons[next].focus(); selectMoment(buttons[next]); }
      });
    });
  });

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

  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    reveals.forEach(el => observer.observe(el));
    reduced.addEventListener('change', function () { if (reduced.matches) { reveals.forEach(el => el.classList.add('is-visible')); observer.disconnect(); } });
  } else reveals.forEach(el => el.classList.add('is-visible'));

  const cinema = document.querySelector('.cinema');
  if (cinema) {
    const frames = Array.from(cinema.querySelectorAll('.cinema-frame'));
    const choices = Array.from(cinema.querySelectorAll('[data-scene-select]'));
    const pauseButton = cinema.querySelector('.motion-toggle');
    let current = 0;
    let userPaused = false;
    let timer;
    function show(index) {
      current = index;
      frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
      choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    }
    function schedule() {
      clearInterval(timer);
      const paused = userPaused || reduced.matches;
      cinema.classList.toggle('is-paused', paused || document.hidden);
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.textContent = paused ? 'Play motion' : 'Pause motion';
      pauseButton.disabled = reduced.matches;
      pauseButton.hidden = reduced.matches;
      if (!paused && !document.hidden && !cinema.contains(document.activeElement)) timer = setInterval(() => show((current + 1) % frames.length), 9000);
    }
    choices.forEach((button, i) => button.addEventListener('click', () => { show(i); schedule(); }));
    pauseButton.addEventListener('click', () => { userPaused = !userPaused; schedule(); });
    cinema.addEventListener('focusin', () => clearInterval(timer));
    cinema.addEventListener('focusout', () => setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', schedule);
    schedule();
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
