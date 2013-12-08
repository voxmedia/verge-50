// Mostly adapted from https://github.com/codrops/PageTransitions

var Verge = Verge || {};

Verge.Pages = (function ($) {

  var $main = $('.m-pages'),
      $pages = $main.children('li'),
      $next = $('.m-header__next'),
      $previous = $('.m-header__previous'),
      $page_links = $('a[data-page]'),
      $body = $('body'),
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

    $body.removeClass('open-nav');

    $current_page = $pages.eq(current);

    current = index;

    $next_page = $pages.eq(current).removeAttr('style').addClass('current');

    $current_page.addClass(out_class).on(animation_end_event, function() {
      $current_page.off(animation_end_event);
      end_current_page = true;
      if(end_next_page) {
        onEndAnimation($next_page, $current_page);
        updatePageTitle($next_page);
        updatePageUrl($next_page);
      }
    });

    $next_page.addClass(in_class).on(animation_end_event, function() {
      $next_page.off(animation_end_event);
      end_next_page = true;
      if(end_current_page) {
        onEndAnimation($next_page, $current_page);
        updatePageTitle($next_page);
        updatePageUrl($next_page);
      }
    });

    if(!support) {
      onEndAnimation($next_page, $current_page);
      updatePageTitle($next_page);
      updatePageUrl($next_page);
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
        onEndAnimation($current_page);
      });
    }
  };

  var keyboardNav = function (e) {
    var key = e.keyCode || e.which,
        keys = {
            left: 37,
            right: 39,
            up: 38,
            down: 40,
            j: 74,
            k: 75
        };
    switch (key) {
    case keys.j:
    case keys.left:
      previousPage();
      return false;  
      break;
    case keys.k:
    case keys.right:
      nextPage();
      return false;
      break;
  };

  var onEndAnimation = function($in_page, $out_page) {
    end_current_page = false;
    end_next_page = false;
    is_animating = false;
    $in_page.attr({ class : $in_page.data().original_class + ' current' });
    $in_page.css('overflow-y', 'auto');
    if (typeof $out_page !== 'undefined') {
      $out_page.attr({ class : $out_page.data().original_class }).scrollTop(0);
    }
    picturefill($in_page);
  };

  var updatePageUrl = function ($page) {
    var page_url, new_url, prefix, state;
    if (Modernizr.history) {
      page_url = $page.data('page-url');
      prefix = Verge.context.url_prefix === '' ? '/' : Verge.context.url_prefix;
      new_url = _.isUndefined(page_url) ? prefix : page_url;

      if (new_url === location.pathname) {
        return;
      }

      state = {
        id: _.uniqueId(),
        url: new_url
      };

      window.history.replaceState(state, '', new_url);
    }
  };

  var updatePageTitle = function ($page) {
    var id = $page.attr('id'),
        name = $page.data('name');
    if (id) {
      document.title = name + " | " + Verge.context.app_name;
    } else {
      document.title = Verge.context.app_name;
    }
  };

  var clickToPage = function (e) {
    var $link = $(this),
        page_id = $link.data('page');

    if (e.which === 1 && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      goToId(page_id);
    }

  };

  var picturefill = function ($page) {
    var picture = $page.find('.picturefill');
    if (!!window.picturefill && picture.length > 0 && typeof picture.attr('data-picture') === 'undefined') {
      picture.attr('data-picture', '');
      window.picturefill();
    }
  };

  var init = function () {
    var pathname_array = window.location.pathname.split('/'),
        pathname = pathname_array[pathname_array.length - 1],
        $current_page;

    $next.on('click', nextPage);
    $previous.on('click', previousPage);
    $page_links.on('click', clickToPage);
    $(document).on('keydown', keyboardNav);

    $pages.each(function() {
      var $page = $(this);
      $page.data().original_class = $page.attr('class');
    });

    if (pathname && $('#' + pathname).length > 0) {
      $current_page = $('#' + pathname).addClass('current').css('overflow-y', 'auto');
      current = $current_page.index();
    } else {
      $current_page = $pages.eq(current).addClass('current').css('overflow-y', 'auto');
    }

    picturefill($current_page);
  }

  init();

  return {
    nextPage : nextPage,
    previousPage : previousPage,
    goToPage : goToPage
  };

})(jQuery);