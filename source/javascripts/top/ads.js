var Verge = Verge || {};

Verge.Ads = (function() {
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

        SBN.OpenX.addVariable('network', 'verge');

        // no Criteo on this network

        SBN.OpenX.setAdUnitsOnPage([463319]);
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

      // setup umbel
      window._umbel = window._umbel || [];
      (function() {
        var u = document.createElement('script');
        u.type = 'text/javascript';
        u.async = true;
        u.src = document.location.protocol + '//tags.api.umbel.com/lcojgvtzjxmbjdgh/w.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(u, s);
        var d = new Date();
        d.setDate(d.getDate() + 365);
        document.cookie = "umbel_api_key=lcojgvtzjxmbjdgh; expires=" + d.toUTCString();
      })();
    },

    showAd: function(id){
      // this is only valid after setup is called
      window.SBN.OpenX.showAd(id);
    }

  };
})();