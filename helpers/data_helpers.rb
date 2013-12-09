module DataHelpers

  def load_spreadsheet(namespace,file_id)
    puts "loading #{file_id} into #{namespace}"
    require "vox/google_drive/client"
    if File.exist?("/home/gitserver/chorus-git-server/voxdocs-privatekey.p12")
      $google_drive_client = Vox::GoogleDrive::Client.new({
        :client_email=>"999943839632@developer.gserviceaccount.com",
        :person=>"chorus-app@sbnation.com",
        :client_key_path=>"/home/gitserver/chorus-git-server/voxdocs-privatekey.p12"
      })
    else
      $google_drive_client = Vox::GoogleDrive::Client.new({})
    end
    options = {:format=>"text/tsv",:file_id=>file_id}
    csv = $google_drive_client.download!(options).body.split("\n")
    puts csv
    fields = []
    values = []
    csv.each_with_index do | line,index |
      puts "working on #{index} - #{line[0,40]}"
      line.strip!
      row = line.split("\t")
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
    puts "Writing to #{namespace}.json"
    File.open("data/#{namespace}.json","w") do | f |
      f << JSON.dump(values)
    end
    data.touch_file("data/#{namespace}.json")
    if File.exist?("oauth2.json")
      s = JSON.parse(File.read("oauth2.json"))
      s["authorization_uri"] = "https://accounts.google.com/o/oauth2/auth"
      s["token_credential_uri"] = "https://accounts.google.com/o/oauth2/token"
      File.open("oauth2.json","w"){|f| f << JSON.dump(s) }
    end
    values
  end

end
