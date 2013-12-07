compass_config do |config|
  config.output_style = :compressed
end

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

set :url_prefix, ''
set :absolute_prefix, 'http://localhost:4567'
set :app_name, 'The Verge 50'

set :facebook_app_id, '179668695452017'
set :twitter, 'verge'
set :twitter_account_id, '1465737598'

activate :directory_indexes


require 'helpers/data_helpers'
helpers DataHelpers
load_spreadsheet("people","0AveeZxA0SOM1dGdSWWFZdHJGc091Q3FrUERVdG1rRWc")

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
  activate :asset_hash, :exts => %w(.css .js)
  activate :minify_javascript
  activate :minify_css
end

after_build do 
  system "rm -f source/images/sprites/*.png"
end
