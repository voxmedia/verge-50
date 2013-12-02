// Mostly adapted from https://github.com/codrops/PageTransitions

var Verge = Verge || {};

Verge.PageTransitions = (function ($) {

  var $main = $('.m-pages'),
      $pages = $main.children('li'),
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
  };

  var previousPage = function () {
    goToPage(current - 1);
  };

  var goToPage = function (index) {
    var $current_page, $next_page, out_class, in_class;

    if (is_animating || index >= pages_count || index < 0 || index === current) {
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
      }
    });

    $next_page.addClass(in_class).on(animation_end_event, function() {
      $next_page.off(animation_end_event);
      end_next_page = true;
      if(end_current_page) {
        onEndAnimation($current_page, $next_page);
      }
    });

    if(!support) {
      onEndAnimation($current_page, $next_page);
    }
  };

  var onEndAnimation = function($out_page, $in_page) {
    end_current_page = false;
    end_next_page = false;
    is_animating = false;
    $out_page.attr({ class : page_class });
    $in_page.attr({ class : page_class + ' current' });
  };

  return {
    nextPage : nextPage,
    previousPage : previousPage,
    goToPage : goToPage
  };

})(jQuery);