module CustomHelpers

  def page_title(person)
    if person.nil?
      "The Verge Fifty"
    else
      "#{person['name']} &ndash; The Verge Fifty"
    end
  end

  def page_url(person)
    if person.nil?
      url_for("index.html")
    else
      url_for("#{person['slug']}.html")
    end
  end
end