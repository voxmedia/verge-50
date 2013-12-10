// Mostly adapted from https://github.com/codrops/PageTransitions

var Verge = Verge || {};

Verge.Pages = (function ($) {

  var $main = $('.m-pages'),
      $pages = [],
      $next = $('.m-header__next'),
      $previous = $('.m-header__previous'),
      $page_links = $('a[data-page]'),
      pages_count = 0, // set later
      $body = $('body'),
      $list_toggles = $('.m-full-list__toggle'),
      $full_list = $('.m-full-list'),
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
      support = Modernizr.cssanimations,
      url_prefix = Verge.Context.url_prefix === '' ? '/' : Verge.Context.url_prefix;

  // Goes to the next page, duh.
  var nextPage = function () {
    goToPage(current + 1);
    _gaq.push(['_trackEvent', Verge.Context.app_name, 'Navigation', 'Next']);
    return false;
  };

  // Same as above, but backwards.
  var previousPage = function () {
    goToPage(current - 1);
    _gaq.push(['_trackEvent', Verge.Context.app_name, 'Navigation', 'Previous']);
    return false;
  };

  // Goes to the page with the given ID.
  var goToId = function (id) {
    var index = $('#' + id).index();
    goToPage(index);
    return false;
  };

  /* ------- Start - Ad Handling ------------------------*/
  // Insert the ad markup and a fake menu item before the specified page
  function insertAdBeforePage(ad_html, index) {

    var li = document.createElement('li');
        li.className = page_class +' m-pages__ad';
        li.id = 'ad_'+index;
        li.innerHTML = ad_html;
    var $adUnit = $(li);

    // Magic data elements this framework needs
    $adUnit.data().original_class = $adUnit.attr('class');
    $adUnit.data('page-url', url_prefix);
    $adUnit.data('name', 'Advertisement');

    // Place this in the corret place in the DOM
    console.log("insertAdBeforePage | inserting", $adUnit);
    $adUnit.insertBefore($pages.eq(index));

    // Record this to remove later
    last_seen_ad_page_index = index;

    // Rebuild the $pages array
    setupPages();
  }

  function removeAdIfWasJustSeen(previous_index) {
    if (previous_index === last_seen_ad_page_index) {
      var $adPage = $pages.eq(last_seen_ad_page_index);
      console.log("removeAdIfWasJustSeen | removing. previous_index: " + previous_index + " current: " + current);
      $adPage.remove();
      // Rebuild the $pages array
      setupPages();

      var pages_moved_since_ad = Math.abs(last_seen_ad_page_index-current);
      // Going backwards
      if(pages_moved_since_ad == 1){
        if(last_seen_ad_page_index < current){
          // reset index if moving forward only
          current-=1;
        }
      }

      last_seen_ad_page_index = -1;
    }
  }

  var checkForAdContent = function(desired_page_index){
    var handleAdCodeInjection = function(e, ad_html) {
      // Handle the backward case
      if (desired_page_index < current) {
        desired_page_index +=1;
      }
      // this does the actual heavy lifting of inserting ad stuffs
      insertAdBeforePage(ad_html, desired_page_index);
    };

    // check to see if we should show an ad here
    // Get ready for an event from hymnal
    //  to see if hymnal has anything for us
    $(document).on(Vox.EditorialApps.AdHelpers.Events.AdResponseWithHTML, handleAdCodeInjection);
    $(document).triggerHandler(Vox.EditorialApps.AdHelpers.Events.AdRequest, {
      // How many pages have they seen
      pagesSeen: total_pages_seen,
      // Where are they now?
      currentPage: current,
      // Where are they going?
      nextPage: desired_page_index,
    });
    $(document).off(Vox.EditorialApps.AdHelpers.Events.AdResponseWithHTML, handleAdCodeInjection);
    // ==========================================================================================
    return desired_page_index;
  };

  /* ------- End - Ad Handling ------------------------*/

  var goToPage = function (index) {
    var $current_page, $next_page, out_class, in_class;

    // If the page is already animating, GTFO.
    if (is_animating) {
      return false;
    }

    // If going to the same page I'm already in, or the desired page
    // is before the first one or after the last one,
    // call the function that triggers the rubber band animation and GTFO.
    if (index >= pages_count || index < 0 || index === current) {
      goToSamePage(index);
      return false;
    }

    total_pages_seen += 1;

    // These classes determine the direction of the animations, depending
    // on which direction I'm moving.
    if (index > current) {
      out_class = 'to-left';
      in_class = 'from-right';
    } else {
      out_class = 'to-right';
      in_class = 'from-left';
    }

    is_animating = true;

    // Close the nav.
    $body.removeClass('open-nav');

    // Get the currently visible page.
    $current_page = $pages.eq(current);

    // Check to see if it is time to inject an ad
    // Note this might need to modify index value
    index = checkForAdContent(index);

    current = index;

    // Make the new page the current page.
    $next_page = $pages.eq(current).removeAttr('style').addClass('current');

    // Animates the current page out of view
    $current_page.addClass(out_class).on(animation_end_event, function() {
      $current_page.off(animation_end_event);
      end_current_page = true;
      // Callbacks fire only after both pages stop animating.
      if(end_next_page) {
        onEndAnimation($next_page, $current_page);
        onNewPageView($next_page);
      }
    });

    // Animates the new page into view.
    $next_page.addClass(in_class).on(animation_end_event, function() {
      $next_page.off(animation_end_event);
      end_next_page = true;
      // Callbacks fire only after both pages stop animating.
      if(end_current_page) {
        onEndAnimation($next_page, $current_page);
        onNewPageView($next_page);
      }
    });

    // If browser does not support CSS animations, fire post-animation callbacks
    // immediately.
    if(!support) {
      onEndAnimation($next_page, $current_page);
      onNewPageView($next_page);
    }
  };

  // If going to the same page, does a simple "rubber band bounce"
  // animation.
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

  // Adds navigation via left/right and j/k keys.
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
    }
  };

  // After animation ends:
  // 1. Remove ad if it was just seen
  // 2. Reset pre-animation variables
  // 3. Mark new page as current
  // 4. Manually set overflow-y:auto to new page to deal with Safari overflow bug
  // 5. Scroll previous page to the top (so it starts at the top if animated back into view)
  // 6. Call picturefill to load new page's images.
  var onEndAnimation = function($in_page, $out_page) {
    removeAdIfWasJustSeen($pages.index($out_page));
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

  // After new page is animated into view:
  // 1. Update the document <title>
  // 2. Update the browser's URL
  // 3. Track the new page view in GA
  // 4. Track how many pages the user has seen in GA.
  var onNewPageView = function ($page) {
    var page_url, new_url;

    page_url = $page.data('page-url');
    new_url = _.isUndefined(page_url) ? url_prefix : page_url;

    updatePageTitle($page);
    updatePageUrl(new_url);

    _gaq.push(['_trackPageview', new_url]);
    _gaq.push(['_setCustomVar', 3, Verge.Context.app_name + ' pages seen', total_pages_seen, 2]);
  }

  // Updates browser's URL if it supports HTML5 History API.
  var updatePageUrl = function (url) {
    var state;

    if (Modernizr.history) {

      if (url === location.pathname) {
        return;
      }

      state = {
        id: _.uniqueId(),
        url: url
      };

      window.history.replaceState(state, '', url);
    }
  };

  // Updates the document <title>
  var updatePageTitle = function ($page) {
    var id = $page.attr('id'),
        name = $page.data('name');
    if (id) {
      document.title = name + " | " + Verge.Context.app_name;
    } else {
      document.title = Verge.Context.app_name;
    }
  };

  // Handles links to pages in side menu and full-list page.
  var clickToPage = function (e) {
    var $link = $(this),
        page_id = $link.data('page');

    if (e.which === 1 && !e.metaKey && !e.ctrlKey) {
      goToId(page_id);
      _gaq.push(['_trackEvent', Verge.Context.app_name, 'Menu Navigation', page_id]);
      return false;
    }

  };

  // Load up all em pages!
  var setupPages = function(){
    $pages = $main.children('li');
    pages_count = $pages.length;
  };

  // Triggers picturefill on the given $page.
  var picturefill = function ($page) {
    var picture = $page.find('.picturefill');
    if (!!window.picturefill && picture.length > 0 && typeof picture.attr('data-picture') === 'undefined') {
      picture.attr('data-picture', '');
      window.picturefill();
    }
  };

  var toggleListLayout = function () {
    var $link = $(this),
        css_class = $link.attr('href').replace('#', '');
    $full_list.removeClass('position category').addClass(css_class);
    return false;
  };

  var init = function () {
    setupPages();

    var pathname_array = window.location.pathname.split('/'),
        pathname = pathname_array[pathname_array.length - 1],
        $current_page;

    $next.on('click', nextPage);
    $previous.on('click', previousPage);
    $page_links.on('click', clickToPage);
    $(document).on('keydown', keyboardNav);
    $list_toggles.on('click', toggleListLayout);

    $('.m-header__logo').click('a', function (e) {
      if (e.which === 1 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        _gaq.push(['_trackEvent', Verge.Context.app_name, 'Navigation', 'Home']);
        goToPage(0);
      }
    });

    // Stores each page's CSS class as a data attribute so I can reset it after
    // animating it.
    $pages.each(function() {
      var $page = $(this);
      $page.data().original_class = $page.attr('class');
    });

    // If I land at a page's URL, mark that page as current, and do the overflow
    // thing to fix Safari. Else, go to the first page.
    if (pathname && $('#' + pathname).length > 0) {
      $current_page = $('#' + pathname).addClass('current').css('overflow-y', 'auto');
      current = $current_page.index();
    } else {
      $current_page = $pages.eq(current).addClass('current').css('overflow-y', 'auto');
    }

    // Call picture fill on the current page.
    picturefill($current_page);
  };

  init();

  return {
    nextPage : nextPage,
    previousPage : previousPage,
    goToPage : goToPage
  };

})(jQuery);