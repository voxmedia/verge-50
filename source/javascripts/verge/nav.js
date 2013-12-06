var Verge = Verge || {};

Verge.Nav = (function ($) {

  var $nav = $('.m-nav'),
      $toggle = $('.m-header__nav-toggle'),
      $body = $('body'),
      open_class = 'open-nav';

  var openNav = function () {
    $body.addClass(open_class);
    $nav.css('overflowY', 'hidden');
    _.delay(function () { $nav.css('overflowY', 'scroll')}, 10);
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

  var init = function () {
    $toggle.on('click', toggleNav);
  };

  init();

  return {
    openNav : openNav,
    closeNav : closeNav,
    toggleNav : toggleNav
  }
})(jQuery);