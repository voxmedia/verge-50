compass_config do |config|
  config.output_style = :compressed
end

set :css_dir, 'stylesheets'

set :js_dir, 'javascripts'

set :images_dir, 'images'

set :url_prefix, ''
set :absolute_prefix, 'http://localhost:4567'
set :app_name, 'The Verge 50'

activate :directory_indexes


require 'helpers/data_helpers'
helpers DataHelpers
load_spreadsheet("people","0AveeZxA0SOM1dGdSWWFZdHJGc091Q3FrUERVdG1rRWc")

data['people'].each do |person|
  proxy "/#{person['slug']}/index.html", "index.html", :locals => { :person => person, :page => 'list' }
end


# Build-specific configuration
configure :build do
  set :url_prefix, "/a/the-verge-50"
  set :absolute_prefix, "http://www.theverge.com"
  activate :minify_css
  activate :asset_hash
  activate :minify_javascript
  activate :chorus
end
