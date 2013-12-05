module CustomHelpers

  def page_title(page = nil, person = nil)
    if !person.nil?
      page = 'list'
    end

    case page
    when 'list'
      "#{person['name']} | #{app_name}"
    when 'index'
      app_name
    else
      "#{data.content.pages.find{ |p| p.slug == page }.title} | #{app_name}"
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

  # Oh god this is horrible
  def rel_prev_next_links(page = nil, person = nil)
    if !person.nil?
      page = 'list'
    end

    case page
    when 'index'
      "<link rel='next' href='#{absolute_page_url('intro')}' />"
    when 'intro'
      "<link rel='prev' href='#{absolute_page_url('index')}' />\n" \
      "<link rel='next' href='#{absolute_page_url('list', data.content.people.first)}' />"
    when 'credits'
      "<link rel='prev' href='#{absolute_page_url('list', data.content.people.last)}' />"
    when 'list'
      index = data.content.people.index(person)
      if index == 0
        "<link rel='prev' href='#{absolute_page_url('intro')}' />\n" \
        "<link rel='next' href='#{absolute_page_url('list', data.content.people[index + 1])}' />"
      elsif index == data.content.people.size - 1
        "<link rel='prev' href='#{absolute_page_url('list', data.content.people[index - 1])}' />\n" \
        "<link rel='next' href='#{absolute_page_url('credits')}' />"
      else
        "<link rel='prev' href='#{absolute_page_url('list', data.content.people[index - 1])}' />\n" \
        "<link rel='next' href='#{absolute_page_url('list', data.content.people[index + 1])}' />"
      end
    end
  end
end
