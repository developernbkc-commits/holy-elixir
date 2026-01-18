/*
 * Simple JavaScript utilities for the Holy Elixir site
 *
 * This script handles two tasks:
 *   1. Cycling the hero slider on the homepage and responding to
 *      previous/next button clicks.
 *   2. Toggling FAQ answers open and closed on the FAQ page.
 */

document.addEventListener('DOMContentLoaded', function () {
  // Hero slider logic
  var slider = document.querySelector('.hero-slider');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var dots = slider.querySelectorAll('.slider-dot');
    var current = 0;
    var nextBtn = document.querySelector('.slider-controls .next');
    var prevBtn = document.querySelector('.slider-controls .prev');

    function showSlide(index) {
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      if (dots && dots.length) {
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }
      current = index;
    }

    function nextSlide() {
      var nextIndex = (current + 1) % slides.length;
      showSlide(nextIndex);
    }

    function prevSlide() {
      var prevIndex = (current - 1 + slides.length) % slides.length;
      showSlide(prevIndex);
    }

    var autoInterval = setInterval(nextSlide, 6000);

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener('click', function () {
        clearInterval(autoInterval);
        nextSlide();
        autoInterval = setInterval(nextSlide, 6000);
      });
      prevBtn.addEventListener('click', function () {
        clearInterval(autoInterval);
        prevSlide();
        autoInterval = setInterval(nextSlide, 6000);
      });
    }

    // Dot navigation
    if (dots && dots.length) {
      dots.forEach(function (dot, idx) {
        dot.addEventListener('click', function () {
          clearInterval(autoInterval);
          showSlide(idx);
          autoInterval = setInterval(nextSlide, 6000);
        });
      });
    }
  }

  // FAQ toggle
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    question && question.addEventListener('click', function () {
      item.classList.toggle('open');
    });
  });

  // Animated counters in stats section
  var counters = document.querySelectorAll('.stat-number');
  if (counters && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-target'));
          if (isNaN(target)) {
            // fallback: extract numeric part from current content
            var match = el.textContent.replace(/[^0-9.-]/g, '');
            target = parseFloat(match) || 0;
          }
          var hasPlus = /\+/.test(el.textContent);
          var start = 0;
          var duration = 1500;
          var startTime = null;
          function animateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = timestamp - startTime;
            var value = Math.min((progress / duration) * target, target);
            // format value: keep decimals if original contained decimal
            var decimals = (target % 1 !== 0) ? 1 : 0;
            var formatted = decimals ? value.toFixed(1) : Math.round(value);
            el.textContent = formatted + (hasPlus ? '+' : '');
            if (progress < duration) {
              requestAnimationFrame(animateCounter);
            } else {
              el.textContent = (target % 1 !== 0 ? target.toFixed(1) : target) + (hasPlus ? '+' : '');
              observer.unobserve(el);
            }
          }
          requestAnimationFrame(animateCounter);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (cnt) {
      counterObserver.observe(cnt);
    });
  }
});