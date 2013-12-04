// Mostly adapted from https://github.com/codrops/PageTransitions

var Verge = Verge || {};

Verge.Pages = (function ($) {

  var $main = $('.m-pages'),
      $pages = $main.children('li'),
      $next = $('.m-header__next'),
      $previous = $('.m-header__previous'),
      pages_count = $pages.length,
      page_class = 'm-pages__page',
      current = 0,
      is_animating = false,
      end_current_page = false,
      end_next_page = false,
      animation_end_events = {
        'WebkitAnimation' : 'webkitAnimationEnd',
        'OAnimation' : 'oAnimationEnd',
        'msAnimation' : 'MSAnimationEnd',
        'animation' : 'animationend'
      },
      animation_end_event = animation_end_events[Modernizr.prefixed('animation')],
      support = Modernizr.cssanimations;

  var nextPage = function () {
    goToPage(current + 1);
    return false;
  };

  var previousPage = function () {
    goToPage(current - 1);
    return false;
  };

  var goToId = function (id) {
    var index = $('#' + id).index();
    goToPage(index);
    return false;
  };

  var goToPage = function (index) {
    var $current_page, $next_page, out_class, in_class;

    if (is_animating) {
      return false;
    }

    if (index >= pages_count || index < 0 || index === current) {
      goToSamePage(index);
      return false;
    }

    if (index > current) {
      out_class = 'to-left';
      in_class = 'from-right';
    } else {
      out_class = 'to-right';
      in_class = 'from-left';
    }

    is_animating = true;

    $current_page = $pages.eq(current);

    current = index;

    $next_page = $pages.eq(current).addClass('current');

    $current_page.addClass(out_class).on(animation_end_event, function() {
      $current_page.off(animation_end_event);
      end_current_page = true;
      if(end_next_page) {
        onEndAnimation($current_page, $next_page);
        updatePageTitle($next_page);
      }
    });

    $next_page.addClass(in_class).on(animation_end_event, function() {
      $next_page.off(animation_end_event);
      end_next_page = true;
      if(end_current_page) {
        onEndAnimation($current_page, $next_page);
        updatePageTitle($next_page);
      }
    });

    if(!support) {
      onEndAnimation($current_page, $next_page);
      updatePageTitle($next_page);
    }
  };

  var goToSamePage = function (index) {
    var $current_page = $pages.eq(current),
        animation_class;

    is_animating = true;

    if (index < 0) {
      animation_class = 'bounce-right';
    } else {
      animation_class = 'bounce-left';
    }

    if(support) {
      $current_page.addClass(animation_class).on(animation_end_event, function() {
        $current_page.off(animation_end_event);
        onEndAnimation($current_page, $current_page);
      });
    }
  };

  var keyboardNav = function (e) {
    var key = e.keyCode || e.which,
        keys = {
            left: 37,
            right: 39,
            j: 74,
            k: 75
        };
    switch (key) {
    case keys.j:
    case keys.left:
      previousPage();  
      break;
    case keys.k:
    case keys.right:
      nextPage()
      break;
    }
  };

  var onEndAnimation = function($out_page, $in_page) {
    end_current_page = false;
    end_next_page = false;
    is_animating = false;
    $out_page.attr({ class : $out_page.data().original_class });
    $in_page.attr({ class : $in_page.data().original_class + ' current' });
  };

  var updatePageTitle = function ($page) {
    var id = $page.attr('id'),
        name = $page.data('name');
    if (id) {
      document.title = "The Verge Fifty" + " – " + name;
    } else {
      document.title = "The Verge Fifty";
    }
  };

  var init = function () {
    var pathname_array = window.location.pathname.split('/'),
        pathname = pathname_array[pathname_array.length - 1];

    $next.on('click', nextPage);
    $previous.on('click', previousPage);
    $(document).on('keydown', keyboardNav);

    $pages.each(function() {
      var $page = $(this);
      $page.data().original_class = $page.attr('class');
    });

    if (pathname && $('#' + pathname).length > 0) {
      $('#' + pathname).addClass('current');
      current = $('#' + pathname).index();
    } else {
      $pages.eq(current).addClass('current');
    }
  }

  init();

  return {
    nextPage : nextPage,
    previousPage : previousPage,
    goToPage : goToPage
  };

})(jQuery);