// Mostly adapted from https://github.com/codrops/PageTransitions

var Verge = Verge || {};

Verge.Pages = (function ($) {

  var $main = $('.m-pages'),
      $pages = null,
      $next = $('.m-header__next'),
      $previous = $('.m-header__previous'),
      $page_links = $('a[data-page]'),
      pages_count = 0,
      page_class = 'm-pages__page',
      total_pages_seen = 0,
      last_seen_ad_page_index = -1,
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

  /* ------- Start - Ad Handling ------------------------*/
  // Insert the ad markup and a fake menu item before the specified page
  function insertAdBeforePage(ad_html, index) {
    console.log("insertAdBeforePage at index: " + index);

    var htmls = $(ad_html).html();
    // // figure out what kind of thing this is
    // if(ad_html instanceof jQuery){
    //   htmls = ad_html.html();
    // } else {
    //   htmls = ad_html;
    // }

    var $adUnit = $('<li class="m-pages__page ad">' + htmls + '</li>');
    // jam this in right before this page
    console.log("inserting",$adUnit);
    console.log("will be inserted before: ", $pages.eq(index));
    $adUnit.insertBefore($pages.eq(index));
    last_seen_ad_page_index = index;
    // Rebuild the $pages array
    setupPages();
  }

  function removeAdIfWasJustSeen(previous_index) {
    if (previous_index === last_seen_ad_page_index) {
      var $adPage = $pages.eq(previous_index);
      $adPage.remove();
      // Rebuild the $pages array
      setupPages();
      lastSeenAdPage = null;
    }
  }
  /* ------- End - Ad Handling ------------------------*/

  var goToPage = function (index) {
    var $current_page, $next_page, out_class, in_class;

    if (is_animating) {
      return false;
    }

    if (index >= pages_count || index < 0 || index === current) {
      goToSamePage(index);
      return false;
    }

    total_pages_seen += 1;

    if (index > current) {
      out_class = 'to-left';
      in_class = 'from-right';
    } else {
      out_class = 'to-right';
      in_class = 'from-left';
    }

    is_animating = true;

    var handleAdCodeInjection = function(e, ad_html) {
      // Handle the backward case
      if (index < current) {
        index += 1;
      }
      // this does the actual heavy lifting of inserting ad stuffs
      console.log("handleAdCodeInjection index: " + index, " current: " + current);
      insertAdBeforePage(ad_html, index);
    };

    // check to see if we should show an ad here
    // Get ready for an event from hymnal
    //  to see if hymnal has anything for us
    $(document).on(Vox.EditorialApps.AdHelpers.Events.AdResponseWithHTML, handleAdCodeInjection);
    $(document).triggerHandler(Vox.EditorialApps.AdHelpers.Events.AdRequest, {
      pagesSeen: total_pages_seen,
      currentPage: current
    });
    $(document).off(Vox.EditorialApps.AdHelpers.Events.AdResponseWithHTML, handleAdCodeInjection);
    // -- ^^ -- END - Ad code functions -----------------------------------------

    $current_page = $pages.eq(current);

    // Might need to be moved a bit...
    removeAdIfWasJustSeen(current);

    current = index;

    $next_page = $pages.eq(current).addClass('current');

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
      nextPage();
      break;
    }
  };

  var onEndAnimation = function($in_page, $out_page) {
    end_current_page = false;
    end_next_page = false;
    is_animating = false;
    $in_page.attr({ class : $in_page.data().original_class + ' current' }).css('overflowY', 'hidden');
    _.delay(function () { $in_page.css('overflowY', 'scroll')}, 10);
    if (typeof $out_page !== 'undefined') {
      $out_page.attr({ class : $out_page.data().original_class }).scrollTop(0);
    }
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

  var clickToPage = function () {
    var $link = $(this),
        page_id = $link.data('page');

    goToId(page_id);
    return false;
  };

  // Load up all em pages!
  var setupPages = function(){
    $pages = $main.children('li');
    pages_count = $pages.length;
    console.log("setupPages called: ", $pages, "length: " + pages_count);
  };

  var init = function () {
    setupPages();

    var pathname_array = window.location.pathname.split('/'),
        pathname = pathname_array[pathname_array.length - 1];

    $next.on('click', nextPage);
    $previous.on('click', previousPage);
    $page_links.on('click', clickToPage);
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