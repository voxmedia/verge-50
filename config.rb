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

activate :chorus
activate :directory_indexes

require "vox/google_drive/client"
$google_drive_client = Vox::GoogleDrive::Client.new({})
options = {:format=>"text/csv",:file_id=>"0AveeZxA0SOM1dGdSWWFZdHJGc091Q3FrUERVdG1rRWc"}
csv = $google_drive_client.download!(options).body
require 'csv'
fields = []
values = []
csv.each_with_index do | line,index |
  line.strip!
  row = CSV.parse(line)[0]
  if index == 0
    fields = row
  else
    if row.size == fields.size
      row_value = {}
      fields.each_with_index do | field,i |
        value = row[i]
        row_value[field] = value  
      end
      values << row_value
    end
  end
end

d = YAML::load_file("data/foo.yml")
m  = {:people=>values}.merge(d)

File.open("data/content.json","w"){|f| f << JSON.dump(m)}

if File.exist?("oauth2.json")
  s = JSON.parse(File.read("oauth2.json"))
  s["authorization_uri"] = "https://accounts.google.com/o/oauth2/auth"
  s["token_credential_uri"] = "https://accounts.google.com/o/oauth2/token"
  File.open("oauth2.json","w"){|f| f << JSON.dump(s) } 
end


data = JSON.load(File.read('data/content.json'))


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
end
