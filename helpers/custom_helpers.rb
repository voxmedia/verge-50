module CustomHelpers

  def page_title(person)
    if person.nil?
      "The Verge Fifty"
    else
      "The Verge Fifty &ndash; #{person['name']}"
    end
  end

  def page_url(person)
    if person.nil?
      "http://www.theverge.com#{url_for("/")}"
    else
      "http://www.theverge.com/#{url_for(person['slug'], :relative => true)}"
    end
  end
end
