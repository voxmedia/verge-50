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

activate :google_drive, load_sheets: {
  verge50: "0AiUde9EuNIx9dElFT1RndGphWGtGeFA3NFc5bU1QVmc"
}

data.verge50['people'].each do |person|
  proxy "/#{person['slug']}/index.html", "index.html", :locals => { :slug => person['slug'], :title => person['name'], :page_type => 'person' }
end

data.verge50['pages'].each do |page|
  proxy "/#{page['slug']}/index.html", "index.html", :locals => { :slug => page['slug'], :title => page['title'], :page_type => page['name'] }
end

# Build-specific configuration
configure :build do
  puts "local build"
  # clear out sprites
  system "rm -f source/images/sprites/*.png"
  set :url_prefix, "/a/the-verge-50"
  set :absolute_prefix, "http://www.theverge.com"
  activate :asset_hash,:ignore=>[/sprites\/.+\.png$/]
  activate :minify_javascript
  activate :minify_css
end
