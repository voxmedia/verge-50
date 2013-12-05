module CustomHelpers

  def page_title(page = nil, person = nil)
    if !person.nil?
      page = 'list'
    end

    case page
    when 'list'
      "#{app_name} &ndash; #{person['name']}"
    when 'index'
      app_name
    else
      "#{app_name} &ndash; #{data.content.pages.find{ |p| p.slug == page }.title}"
    end
  end

  def page_url(page = nil, person = nil)
    if !person.nil?
      page = 'list'
    end

    case page
    when 'index'
      url_prefix
    when 'list'
      "#{url_prefix}/#{person['slug']}"
    else
      "#{url_prefix}/#{data.content.pages.find{ |p| p.slug == page }.slug}"
    end
  end

  def absolute_page_url(page = nil, person = nil)
    if !person.nil?
      page = 'list'
    end

    case page
    when 'index'
      "#{absolute_prefix}#{url_prefix}"
    when 'list'
      "#{absolute_prefix}#{url_prefix}/#{person['slug']}"
    else
      "#{absolute_prefix}#{url_prefix}/#{data.content.pages.find{ |p| p.slug == page }.slug}"
    end
  end

    end
  end
end
