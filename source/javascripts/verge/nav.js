var Verge = Verge || {};

Verge.Nav = (function ($) {

  var $nav = $('.m-nav'),
      $toggle = $('.m-header__nav-toggle'),
      $body = $('body'),
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
    return false;
  };

  var closeNav = function () {
    $body.removeClass(open_class);
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