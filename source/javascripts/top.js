//= require_tree ./top
var Verge = Verge || {};


Vox.EditorialApps.Ads.setup();

// Will be called when Hymnal is going to give you code
function insertAdCode(adCode){
  console.log('hymnal gave me code!');
  var $before_ad = jQuery('li.ad_next');
}

jQuery.ready(function(){
  console.log('ready');
  jQuery(document).on('Hymnal.insertAdCode',insertAdCode);
});