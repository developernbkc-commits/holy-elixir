document.addEventListener('DOMContentLoaded', function () {
  var showcase = document.getElementById('collection-showcase');
  if (showcase) {
    var showcaseOptions = {
      collection: { image: 'assets/images/lifestyle/hero-terrace-1440.webp', alt: 'Friends enjoying a Black Drink moment on a garden terrace', caption: 'Good company. A fresh moment.', link: 'products.html', label: 'Explore the collection' },
      water: { image: 'assets/images/lifestyle/water-morning-1440.webp', alt: 'A man enjoying Zubrex alkaline water on a daylight balcony', caption: 'Alkaline water. Your everyday refreshment.', link: 'products.html#alkaline-water', label: 'Explore alkaline water' },
      ionizer: { image: 'assets/images/lifestyle/ionizer-home-1440.webp', alt: 'A woman filling a glass at a Zubrex home ionizer', caption: 'A considered setup for the place you call home.', link: 'products.html#ionizers', label: 'Explore home ionizers' }
    };
    showcase.querySelectorAll('[data-showcase]').forEach(function (button) {
      button.addEventListener('click', function () {
        var option = showcaseOptions[button.getAttribute('data-showcase')];
        if (!option) return;
        var image = showcase.querySelector('img');
        image.src = option.image;
        image.srcset = option.image.replace('-1440.webp', '-640.webp') + ' 640w, ' + option.image + ' 1440w';
        showcase.querySelector('img').alt = option.alt;
        showcase.querySelector('.showcase-caption').textContent = option.caption;
        var explore = showcase.querySelector('.showcase-explore');
        explore.href = option.link;
        explore.setAttribute('aria-label', option.label);
        showcase.querySelectorAll('[data-showcase]').forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
      });
    });
  }

  var notice = document.querySelector('.site-notice');
  if (notice) {
    var noticePause = notice.querySelector('.site-notice-pause');
    var noticeMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function measureNotice() {
      document.documentElement.style.setProperty('--notice-height', notice.offsetHeight + 'px');
    }
    function setNoticeMotion() {
      notice.classList.toggle('is-scrolling', !noticeMotion.matches);
      noticePause.hidden = noticeMotion.matches;
      measureNotice();
    }
    noticePause.addEventListener('click', function () {
      var paused = notice.classList.toggle('is-paused');
      noticePause.setAttribute('aria-pressed', String(paused));
      noticePause.setAttribute('aria-label', paused ? 'Resume update notice' : 'Pause update notice');
      noticePause.textContent = paused ? 'Resume' : 'Pause';
    });
    noticeMotion.addEventListener('change', setNoticeMotion);
    if (window.ResizeObserver) new ResizeObserver(measureNotice).observe(notice);
    window.addEventListener('resize', measureNotice);
    setNoticeMotion();
  }

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
