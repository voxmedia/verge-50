var Verge = Verge || {};

Verge.Nav = (function ($) {

  var $nav = $('.m-nav'),
      $toggle = $('.m-header__nav-toggle'),
      $body = $('body'),
      $document = $(document),
      $wrap = $('.l-inner-wrap'),
      open_class = 'open-nav';
      transition_end_events = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'OTransition' : 'oTransitionEnd',
        'msTransition' : 'MSTransitionEnd',
        'transition' : 'transitionend'
      },
      transition_end_event = transition_end_events[Modernizr.prefixed('transition')];

  var openNav = function () {
    $nav.removeAttr('style').scrollTop(0);
    $body.addClass(open_class);
    if (!Modernizr.csstransitions) {
      setOverflowManuallyBecauseSafariFuckingSucks();
    }
    _gaq.push(['_trackEvent', Verge.Context.app_name, 'Open Nav']);
    return false;
  };

  var closeNav = function () {
    $body.removeClass(open_class);
    _gaq.push(['_trackEvent', Verge.Context.app_name, 'Close Nav']);
    return false;
  };

  var toggleNav = function () {
    if ($body.hasClass(open_class)) {
      closeNav();
    } else {
      openNav();
    }
    return false;
  };

  var setOverflowManuallyBecauseSafariFuckingSucks = function () {
    $nav.css('overflow-y', 'auto');
  };

  var init = function () {
    $toggle.on('click', toggleNav);
    $document.on('click', closeNav);

    if (Modernizr.csstransitions) {
      $wrap.on(transition_end_event, setOverflowManuallyBecauseSafariFuckingSucks);
    }
    
  };

  init();

  return {
    openNav : openNav,
    closeNav : closeNav,
    toggleNav : toggleNav
  }
})(jQuery);