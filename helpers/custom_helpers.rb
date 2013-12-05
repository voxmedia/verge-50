module CustomHelpers

  def page_title(person)
    if person.nil?
      "The Verge Fifty"
    else
      "The Verge Fifty &ndash; #{person['name']}"
    end
  end

  def feature_url(person = nil)
    if person.nil?
      return "#{url_prefix}"
    else
      return "#{url_prefix}/#{person['slug']}"
    end
  end

  def absolute_feature_url(person = nil)
    if person.nil?
      return "#{absolute_prefix}#{url_prefix}"
    else
      return "#{absolute_prefix}#{url_prefix}/#{person['slug']}"
    end
  end
end
