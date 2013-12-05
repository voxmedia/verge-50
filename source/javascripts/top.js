//= require_tree ./top

Verge.Ads.setup().after(function(){
  console.log("setup done!");
  Verge.Ads.showAd(463319);
});
