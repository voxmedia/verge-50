var Vox = Vox || {};
Vox.EditorialApps = Vox.EditorialApps || {};
Vox.EditorialApps.AdHelpers = Vox.EditorialApps.AdHelpers || {};

// Handy place to keep these ad unit id numbers
// Look in SBN config/openx.yml for a full listing

// All of these will be requested from OpenX
Vox.EditorialApps.AdHelpers.AdUnitIds = {
  VergeFishTank: 463319,
  // SomethingDorky: 1234567
};


// Namespaces for events that this will use to communicate
// with ad executions on this page

Vox.EditorialApps.AdHelpers.Events = {
  // This is used by Hymnal to let a vox property know that
  // there is HTML content ready to be inserted into the page
  AdResponseWithHTML: 'Vox.Ad.ResponseWithHTML',

  // This is used to let hymnal know that the page is ready to receive
  // ad code
  AdRequest:  'Hymnal.requestAd'
};


Vox.EditorialApps.Ads = (function() {

  // More tricky, view the source of the network to find this
  var network_umbel_api_key = 'lrjhazrpqbgtnrij';

  // Not a lot of options here (verge, polygon, sbnation)
  var network_name = 'verge';

  return {
    setup: function(){
      var SBN = window.SBN || {};
      if (typeof(OX) != "undefined") {
        // we have successfully loaded via the external OpenX JS
        SBN.OpenX = new OXH(); // OpenX helper/wrapper
        SBN.OpenX.setAdUnitScopes();
        SBN.OpenX.setAdUnitGroups();
        if (typeof Util === 'object' && Util.UserAgentProfiler) {
          SBN.OpenX.setPageScope({
            browser_width: Util.UserAgentProfiler.browserWidthForOpenX(),
            device_type:   Util.UserAgentProfiler.deviceTypeForOpenX()
          });
        }

        SBN.OpenX.addVariable('network', network_name);

        var ad_units_on_page = [];

        if(typeof(Vox.EditorialApps.AdHelpers.AdUnitIds) === "object"){
          for(var key in Vox.EditorialApps.AdHelpers.AdUnitIds){
            ad_units_on_page.push(Vox.EditorialApps.AdHelpers.AdUnitIds[key]);
          }
        }

        // These need to be fetched prior to when they are going to be placed on the page
        SBN.OpenX.setAdUnitsOnPage(ad_units_on_page);
        SBN.OpenX.fetchAds();

      } else {
        if (console && console.log) {
          console.log("Warning: OpenX did not load! Trying to fail gracefully.");
        }
        SBN.OpenX = {};
        SBN.OpenX.showAd = function(id) {
          if (console && console.log) {
            console.log("OpenX did not load so we cannot render ad " + id + ".");
          }
        };
      }
      window.SBN = SBN;

      // setup umbel
      window._umbel = window._umbel || [];
      (function() {
        var u = document.createElement('script');
        u.type = 'text/javascript';
        u.async = true;
        u.src = document.location.protocol + '//tags.api.umbel.com/'+network_umbel_api_key+'/w.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(u, s);
        var d = new Date();
        d.setDate(d.getDate() + 365);
        document.cookie = "umbel_api_key="+network_umbel_api_key+"; expires=" + d.toUTCString();
      })();

      return {
        after: function(thing_to_do_once_done){
          if(typeof(thing_to_do_once_done) === "function"){
            thing_to_do_once_done();
          }
        }
      };
    },

    // Call this where the ad should show up in the page
    show: function(ad_unit_id){
      // this is only valid after setup is called
      window.SBN.OpenX.showAd(ad_unit_id);
    },

    // just aliased
    render: function(auid){this.show(auid);},


  };
})();