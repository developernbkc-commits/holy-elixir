document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var menu = document.getElementById('site-menu');
  if (menuButton && menu) {
    menuButton.hidden = false;
    function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); }
    menuButton.addEventListener('click', function () {
      menuButton.setAttribute('aria-expanded', menuButton.getAttribute('aria-expanded') !== 'true' ? 'true' : 'false');
    });
    menu.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
    });
    document.addEventListener('click', function (event) { if (!event.target.closest('nav')) closeMenu(); });
  }
  var slider = document.querySelector('.hero-slider');
  if (slider) {
    var slides = Array.from(slider.querySelectorAll('.slide'));
    var controls = document.querySelector('.slider-controls');
    var current = 0;
    var interval;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var paused = reducedMotion.matches;
    var pause = document.createElement('button');
    pause.type = 'button'; pause.className = 'pause';
    controls.appendChild(pause);
    slider.setAttribute('aria-roledescription', 'carousel');
    slider.setAttribute('aria-label', 'Holy Elixir collection');
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
        slide.setAttribute('aria-hidden', String(i !== current));
        slide.inert = i !== current;
      });
    }
    function stop() { clearInterval(interval); }
    function start() {
      stop();
      pause.textContent = paused ? 'Play' : 'Pause';
      pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      if (!paused && !document.hidden && !slider.parentElement.contains(document.activeElement)) {
        interval = setInterval(function () { show(current + 1); }, 8000);
      }
    }
    controls.querySelector('.next').addEventListener('click', function () { show(current + 1); start(); });
    controls.querySelector('.prev').addEventListener('click', function () { show(current - 1); start(); });
    pause.addEventListener('click', function () { paused = !paused; start(); });
    slider.parentElement.addEventListener('focusin', stop);
    slider.parentElement.addEventListener('focusout', function () { setTimeout(start, 0); });
    slider.parentElement.addEventListener('mouseenter', stop);
    slider.parentElement.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', function (event) { paused = event.matches; start(); });
    show(0); start();
  }
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var fields = new FormData(form);
      var interest = form.querySelector('select');
      var subject = 'Holy Elixir enquiry: ' + (interest.options[interest.selectedIndex].text || 'Product information');
      var body = 'Name: ' + fields.get('name') + '\nEmail: ' + fields.get('email') + '\nPhone: ' + (fields.get('phone') || 'Not provided') + '\n\n' + fields.get('message');
      window.location.href = 'mailto:Info@holy-elixir.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      document.getElementById('form-status').textContent = 'Your email draft is ready to open. Send it from your email app, or contact Info@holy-elixir.com directly if no app opens.';
    });
  }
});
