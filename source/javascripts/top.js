//= require_tree ./top
var Verge = Verge || {};


Vox.EditorialApps.Ads.setup();

// Will be called when Hymnal is going to give you html to insert
function insertAdCode(ev,adCode){
  console.log('hymnal gave me code!',adCode);
  var html = "<li class='m_pages_page ad'>" + adCode + "</li>";
  jQuery().ready(function(){
    console.log('inserting into',adCode);
    jQuery(html).insertAfter('li.ad_next');
    console.log(jQuery('li.ad')[0]);
  });
  // should probably NOT call page builder before this
}

jQuery(document).on('Hymnal.insertAdCode',insertAdCode);


// Test with
jQuery(document).trigger('Hymnal.insertAdCode',"<h1>Hi</h1>");