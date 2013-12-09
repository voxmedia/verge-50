var Verge = Verge || {};

Verge.Social = (function ($) {

  var $buttons = $('a[data-social]');

  var openShareWindow = function (e) {
    var $link = $(this);
    _gaq.push(['_trackEvent', Verge.Context.app_name, $link.data('social'), $link.data('shared')]);
    if (e.which === 1 && !e.metaKey && !e.ctrlKey) {
      window.open($link.attr('href'),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
      return false;
    }
  }

  var init = function () {
    $buttons.on('click', openShareWindow);
  };

  init();

})(jQuery);