compass_config do |config|
  config.output_style = :compressed
end

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

set :url_prefix, ''
set :absolute_prefix, 'http://localhost:4567'
set :app_name, 'The Verge 50'
set :app_meta_description, 'The Verge 50'

set :facebook_app_id, '179668695452017'
set :twitter, 'verge'
set :twitter_account_id, '1465737598'

set :break_small, 400
set :break_medium, 720
set :break_large, 975

activate :directory_indexes


helpers Middleman::Chorus::GoogleDrive::Helpers
load_spreadsheet("people","0AveeZxA0SOM1dGdSWWFZdHJGc091Q3FrUERVdG1rRWc")
load_spreadsheet("pages", "0AmBvdyiOpUoSdGtKLVc2ZlRPUXYwOERpT0FYWWs2alE")

data['people'].each do |person|
  proxy "/#{person['slug']}/index.html", "index.html", :locals => { :slug => person['slug'], :title => person['name'], :page_type => 'person' }
end

data['pages'].each do |page|
  proxy "/#{page['slug']}/index.html", "index.html", :locals => { :slug => page['slug'], :title => page['title'], :page_type => page['name'] }
end

# Build-specific configuration
configure :build do
  set :url_prefix, "/a/the-verge-50"
  set :absolute_prefix, "http://www.theverge.com"
  activate :asset_hash
  activate :chorus
  activate :minify_javascript
  activate :minify_css
end

# after_build do 
#   system "rm -f source/images/sprites/*.png"
# end
