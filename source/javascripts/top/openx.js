/*global OX, SBN */
/*
 * OpenX helper that provides a wrapper around the OpenX JavaScript API.
 *
 * An optional config object can be given as the first argument. Properties that can be set
 * on this object are as follows.
 *
 *   ox - An instance of of the OpenX API obtained by including the "jstag" script and calling
 *        the global OX() function that it defines. If config.ox is not set then the OX() function
 *        will be called directly to obtain the API instance.
 */
var OXH = function (config) {

  this._ox = config && config.ox;
  if (!this._ox) {
    this._ox = OX();
  }

  this._contentTopics = {};
  this._customVariables = {};
  this._adUnitsToShow = null;
  this._pageScope = null;
  this._adUnitScopes = null;
  this._adUnitGroups = null;
  this._debugging = false;
  this._fetchDisabled = false;

  // Dealing w dependency, instead of assuming load order/timing
  this.log_to_console = function(msg) {
    if (typeof SBN !== 'undefined' && SBN.Campaigns) {
      SBN.Campaigns.log(msg);
    }
  };

  // Disables requests to the remote OpenX server
  this.disableFetch = function() {
    this._fetchDisabled = true;
  };

  this.addContentTopic = function(k, v) {
    this._contentTopics[k] = v;
    this._ox.addContentTopic(k);
  };
  
  this.addVariable = function(k, v) {
    this._customVariables[k] = v;
    this._ox.addVariable(k, v);
  };
  
  this.removeVariable = function(k) {
    delete this._customVariables[k];
    // it appears that OpenX's public API does not allow deleting, per se
    this._ox.addVariable(k, null);
  };

  this.contentTopics = function() {
    return this._contentTopics;
  };

  this.customVariables = function() {
    return this._customVariables;
  };
  
  this.setAdUnitScopes = function(scopes) {
    this._adUnitScopes = scopes;
  };
  
  this.setAdUnitGroups = function(groups) {
    this._adUnitGroups = groups;
  };
  
  this.setPageScope = function(pageScope) {
    this._pageScope = pageScope;
    for (var scopeKey in pageScope) {
      this.addVariable(scopeKey, pageScope[scopeKey]);      
    }
  };
  
  this.getPageScope = function(key) {
    if (this._pageScope === null) {
      return null;
    } else {
      return this._pageScope[key];
    }
  };
  
  this.setAdUnitsOnPage = function(adUnits) {
    this._adUnitsOnPage = adUnits;
  };
  
  this.addAdUnitToPage = function(adUnit) {
    var units = this._adUnitsOnPage.concat(adUnit);
    var unique = [];
    for (var i=0;i<units.length;i++) {
      var this_unit = units[i];
      if (unique.indexOf(this_unit) === -1) {
        unique.push(this_unit);
      }
    }
    this._adUnitsOnPage = unique;
  };

  this.isAdUnitInScope = function(unitId) {

    // if we're not using scope, then all ads should be shown.
    if (!this.isUsingScope()) {
      return true;
    }

    // browser_width, device_type, etc.
    var adUnitScopeTypes = this._adUnitScopes[unitId];
    
    // this ad unit sets no scope. it should show all the time.
    if (!adUnitScopeTypes) {
      return true;
    }

    // browser_width, device_type, etc.
    for (var pageScopeType in this._pageScope) {
      if (this._pageScope.hasOwnProperty(pageScopeType)) {
        // medium, large, etc.
        var pageScopeValue = this._pageScope[pageScopeType];

        // scope values for which this ad unit should be shown.
        var adUnitScopeValues = adUnitScopeTypes[pageScopeType];

        // if this ad unit specifies no value for the given scope type, then it should be shown regardless
        if (adUnitScopeValues) {
          // if the ad unit does specify a value for this scope type, but not the current page scope
          // value, then the ad unit should not be shown
          if (!this.arrayInclude(adUnitScopeValues, pageScopeValue)) {
            var skippedUnitText = 'Ad unit ' + unitId + ' skipped for scope "' + pageScopeValue + '". Available values are: ' + adUnitScopeValues.join(', ') + '.';
            this.log_to_console(skippedUnitText);
            jQuery('#openx_info_ad_units_skipped').append(' ' + unitId);
            return false;
          }
        }
      }
    }

    // if we made it this far, then we passed all the scope checks the ad can be shown
    return true;
  };

  this.isUsingScope = function() {
    return (this._pageScope !== null && this._adUnitScopes !== null);
  };

  // find intersection of ad units on page and ad units in scope
  this.getActiveAdUnits = function() {
    var activeAdUnits = [];
    if (typeof this._adUnitsOnPage === 'undefined') {
      return;
    }
    for (var i = 0; i < this._adUnitsOnPage.length; ++i) {
      var adUnit = this._adUnitsOnPage[i];
      if (this.isAdUnitInScope(adUnit)) {
        activeAdUnits.push(adUnit);
      }
    }
    return activeAdUnits;
  };

  // Displays the given ad in the page, if it was fetched (i.e., if it was in scope).
  // Invoked by the view. Must be proceeded by a call to #fetchAds().
  this.showAd = function(unitId) {
     // return false;
    if (this._adUnitsToShow && this.arrayInclude(this._adUnitsToShow, unitId)) {
      this._ox.showAdUnit(unitId);
    }
  };

  // Add the specific groups we want to fetch to the 
  // internal OpenX object. This should be one of the last steps
  // before initiating the fetch.
  this.addGroups = function(groupIds) {
    for (var i = 0; i < groupIds.length; ++i) {
      this._ox.addPage(groupIds[i]);      
    }
  };
  
  // Add the specific ad untis we want to fetch to the
  // internal OpenX object. This should be one of the last steps
  // before initiating the fetch.  
  this.addUnits = function(unitIds) {
    for (var i = 0; i < unitIds.length; ++i) {
      this._ox.addAdUnit(unitIds[i]);
    }
  };

  // Figures out the specifc ad units and ad groups to fetch from
  // OpenX, given the screen size, ads on the page, etc., and
  // then initiates the fetch to OpenX.
  this.fetchAds = function() {    

    // loop over all the ad unit groups, and look for any that we can
    // use, given the active ad units   

    var adUnitsToShow = this.getActiveAdUnits();    
    var adUnitsToFetch = adUnitsToShow.slice(0);
    var groupsToFetch = [];
    
    for (var group in this._adUnitGroups) {
      var groupAdUnits = this._adUnitGroups[group];
      var missingAdUnits = this.arraySubtract(groupAdUnits, adUnitsToFetch);
      if (missingAdUnits.length === 0) {
        groupsToFetch.push(group);
        adUnitsToFetch = this.arraySubtract(adUnitsToFetch, groupAdUnits);
      }
    }    
        
    if (this._debugging && (typeof this.log_to_console !== 'undefined')) {
      this.log_to_console("==========");
      this.log_to_console("OPENX INFO");
      this.log_to_console("Custom variables:", this._customVariables);
      this.log_to_console("Content topics:", this._contentTopics);
      this.log_to_console("Page scope:", this._pageScope);
      this.log_to_console("Ad unit scopes:", this._adUnitScopes);
      this.log_to_console("All ad unit groups:", this._adUnitGroups);
      this.log_to_console("All ad units on page:", this._adUnitsOnPage);
      this.log_to_console("Ad units in scope:", this.getActiveAdUnits());
      this.log_to_console("-----");
      this.log_to_console("Fetching ad unit groups:", groupsToFetch);
      this.log_to_console("Fetching ad units:", adUnitsToFetch);
      this.log_to_console("==========");
    }

    this.addGroups(groupsToFetch);
    this.addUnits(adUnitsToFetch);
    
    if (!this._fetchDisabled) {
      this._ox.fetchAds();
      this._adUnitsToShow = adUnitsToShow;      
    }
  };

  
  // array util functions 

  this.arraySubtract = function(array1, array2) {
    var newArray = [];
    for (var i = 0; i < array1.length; ++i) {
      var found = false;
      for (var j = 0; j < array2.length; ++j) {
        if (array1[i] === array2[j]) {
          found = true;
          break;
        }        
      }
      if (!found) {
        newArray.push(array1[i]);
      }
    }
    return newArray;
  };
  
  this.arrayIntersection = function(array1, array2) {
    var newArray = [];
    for (var i = 0; i < array1.length; ++i) {
      for (var j = 0; j < array2.length; ++j) {
        if (array1[i] === array2[j] && (!this.arrayInclude(newArray, array1[i]))) {
          newArray.push(array1[i]);
          break;
        }
      }
    }
    return newArray;
  };
  
  this.arrayIndexOf = function(arr, obj) {
    for (var i = 0, j = arr.length; i < j; i++) {
      if (arr[i] === obj) { return i; }
    }
    return -1;
  };
  
  this.arrayInclude = function(arr, obj) {
    return this.arrayIndexOf(arr, obj) !== -1;
  };

};