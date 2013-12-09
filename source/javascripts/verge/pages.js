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
      page_class = 'm-pages__page',
      total_pages_seen = 0,
      last_seen_ad_page_index = -1,
      ad_was_shown_last = false,
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
    console.log("insertAdBeforePage | at index: " + index);

    // var htmls = $(ad_html).ht;
    console.log("insertAdBeforePage | html: ", ad_html, "class: " + page_class);
    var li = document.createElement('li');
        li.className = page_class +' m-pages__ad';
        li.id = 'ad_'+index;
        li.innerHTML = ad_html;
    var $adUnit = $(li);

    $adUnit.data().original_class = $adUnit.attr('class');
    $adUnit.data('page-url',"advertisement");

    // jam this in right before this page
    console.log("insertAdBeforePage | inserting", $adUnit);
    console.log("insertAdBeforePage | will be inserted before: ", $pages.eq(index));
    $adUnit.insertBefore($pages.eq(index));
    last_seen_ad_page_index = index;
    ad_was_shown_last = true;
    // Rebuild the $pages array
    setupPages();
    console.log("insertAdBeforePage | inserted", $adUnit[0]);
  }

  function removeAdIfWasJustSeen(previous_index) {
    // console.log("removeAdIfWasJustSeen | checking if we can remove ads");
    if (previous_index === last_seen_ad_page_index) {
      console.log("doing something...");
      var $adPage = $pages.eq(last_seen_ad_page_index);
      console.log("removeAdIfWasJustSeen | trying to remove!", $adPage.get(0));
      $adPage.remove();
      // Rebuild the $pages array
      setupPages();
      console.log("removeAdIfWasJustSeen | current: ", current);
      ad_was_shown_last = false;
      lastSeenAdPage = -1;
    }
  }

  var checkForAdContent = function(desired_page_index){
    console.log("checkForAdContent | desired_page_index: " + desired_page_index +" current: " + current);
    var handleAdCodeInjection = function(e, ad_html) {
      // Handle the backward case
      if (desired_page_index < current) {
        console.log("moving backwards?");
        desired_page_index -= 1;
      }
      // this does the actual heavy lifting of inserting ad stuffs
      console.log("handleAdCodeInjection | index: " + desired_page_index, " current: " + current);
      insertAdBeforePage(ad_html, desired_page_index);
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
    // ==========================================================================================
    return desired_page_index;
  };

  /* ------- End - Ad Handling ------------------------*/

  var goToPage = function (index) {
    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    console.log("goToPage | at: " + current + " going to: " + index + " of: " + pages_count);
    var $current_page, $next_page, out_class, in_class;

    console.log("is_animating: " + is_animating);
    if (is_animating) {
      return false;
    }

    if (index >= pages_count || index < 0 || index === current) {
      goToSamePage(index);
      return false;
    }

    total_pages_seen += 1;

    console.log("goToPage | current: " + current);

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

    // Check and inject ads, can modify index value
    index = checkForAdContent(index);

    current = index;
    $next_page = $pages.eq(current).removeAttr('style').addClass('current');
    console.log("goToPage | now current: " + current);


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
    console.log('------------------------------');
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
    }
  };

  var onEndAnimation = function($in_page, $out_page) {
    console.log('onEndAnimation $in_page:',$in_page,' $out_page', $out_page);
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

  // Load up all em pages!
  var setupPages = function(){
    $pages = $main.children('li');
    pages_count = $pages.length;
    console.log("setupPages length: " + pages_count);
  };

  var picturefill = function ($page) {
    var picture = $page.find('.picturefill');
    if (!!window.picturefill && picture.length > 0 && typeof picture.attr('data-picture') === 'undefined') {
      picture.attr('data-picture', '');
      window.picturefill();
    }
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
    $('.m-header__logo').click('a', function (e) {
      if (e.which === 1 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        goToPage(0);
      }
    });

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
  };

  init();

  return {
    nextPage : nextPage,
    previousPage : previousPage,
    goToPage : goToPage
  };

})(jQuery);