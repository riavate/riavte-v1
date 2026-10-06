(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && window.Shopify.designMode) return;

  var sectionNodes = document.querySelectorAll(
    '#MainContent > .shopify-section, main > section, body > section, .site-footer'
  );

  function visible(el) {
    return el && el.getClientRects && el.getClientRects().length > 0;
  }

  function pieces(section) {
    var root = section;
    if (section.classList.contains('shopify-section')) {
      root = section.querySelector('section, footer') || section;
    }

    var list = root.querySelector(':scope > ul, :scope > ol');
    if (list && list.children.length > 1) {
      return Array.prototype.filter.call(list.children, visible);
    }

    var kids = Array.prototype.filter.call(root.children, visible);
    if (kids.length > 1 && kids.length <= 6) return kids;

    if (kids.length === 1) {
      var nested = Array.prototype.filter.call(kids[0].children, visible);
      if (nested.length > 1 && nested.length <= 6) return nested;
    }

    return [root];
  }

  var items = [];
  var seen = new Set();

  Array.prototype.forEach.call(sectionNodes, function (section) {
    pieces(section).forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);
      items.push(el);
    });
  });

  if (!items.length) return;

  var viewHeight = window.innerHeight || document.documentElement.clientHeight;
  var waiting = [];
  var groups = new Map();

  items.forEach(function (el) {
    var parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach(function (group) {
    group.forEach(function (el, index) {
      el.style.animationDelay = Math.min(index, 4) * 90 + 'ms';
    });
  });

  items.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    var onScreen = rect.top < viewHeight * 0.9 && rect.bottom > 0;
    el.classList.add('reveal');
    if (onScreen) {
      el.classList.add('is-in');
    } else {
      waiting.push(el);
    }
  });

  function show(el) {
    if (el.classList.contains('is-in')) return;
    var group = groups.get(el.parentElement) || [];
    var index = group.indexOf(el);
    el.style.animationDelay = Math.min(Math.max(index, 0), 4) * 90 + 'ms';
    el.classList.add('is-in');
  }

  function showVisible() {
    var height = window.innerHeight || document.documentElement.clientHeight;
    waiting.forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < height * 0.92 && rect.bottom > 24) show(el);
    });
  }

  if (waiting.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px 12% 0px', threshold: 0 }
    );

    waiting.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    waiting.forEach(show);
  }

  window.addEventListener('scroll', showVisible, { passive: true });
  window.addEventListener('resize', showVisible);
  window.setTimeout(showVisible, 400);
})();
