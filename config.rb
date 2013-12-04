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

activate :chorus
activate :directory_indexes

people = YAML::load_file('data/people.yml')

people.each do |person|
  proxy "/#{person['slug']}/index.html", "index.html", :locals => { :person => person }
end

# Build-specific configuration
configure :build do
  activate :minify_css
  activate :minify_javascript
end
