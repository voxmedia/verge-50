####
# Compass
####

# Change Compass configuration
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

activate :chorus
activate :directory_indexes

data = YAML::load_file('data/content.yml')
data['people'].each do |person|
  proxy "/#{person['slug']}/index.html", "index.html", :locals => { :person => person, :page => 'list' }
end

data['pages'].each do |page|
  proxy "/#{page['slug']}/index.html", "index.html", :locals => { :page => page['name'] }
end

# Build-specific configuration
configure :build do
  set :url_prefix, "/a/the-verge-50"
  set :absolute_prefix, "http://www.theverge.com"
  activate :minify_css
  activate :asset_hash
  activate :minify_javascript
end
