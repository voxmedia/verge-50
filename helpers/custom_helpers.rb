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
      "#{data.content.pages.find{ |p| p.name == page }.title} | #{app_name}"
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
      "#{url_prefix}/#{data.content.pages.find{ |p| p.name == page }.slug}"
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
      "#{absolute_prefix}#{url_prefix}/#{data.content.pages.find{ |p| p.name == page }.slug}"
    end
  end

  # Oh god this is horrible
  def rel_prev_next_links(page = nil, person = nil)
    puts data.inspect
    if !person.nil?
      page = 'list'
    end

    case page
    when 'index'
      "<link rel='next' href='#{absolute_page_url('intro')}' />"
    when 'intro'
      "<link rel='prev' href='#{absolute_page_url('index')}' />\n" \
      "<link rel='next' href='#{absolute_page_url('list', data.content.people.first)}' />"
    when 'full-list'
      "<link rel='prev' href='#{absolute_page_url('list', data.content.people.last)}' />\n" \
      "<link rel='next' href='#{absolute_page_url('credits')}' />"
    when 'credits'
      "<link rel='prev' href='#{absolute_page_url('full-list')}' />"
    when 'list'
      index = data.content.people.index(person)
      if index == 0
        "<link rel='prev' href='#{absolute_page_url('intro')}' />\n" \
        "<link rel='next' href='#{absolute_page_url('list', data.content.people[index + 1])}' />"
      elsif index == data.content.people.size - 1
        "<link rel='prev' href='#{absolute_page_url('list', data.content.people[index - 1])}' />\n" \
        "<link rel='next' href='#{absolute_page_url('full-list')}' />"
      else
        "<link rel='prev' href='#{absolute_page_url('list', data.content.people[index - 1])}' />\n" \
        "<link rel='next' href='#{absolute_page_url('list', data.content.people[index + 1])}' />"
      end
    end
  end

  def formatted_names(name)
    formatted_names = ""
    name.split('&').each do |n|
      names = n.split(' ')
      if names.size > 1
        last = names.pop
        first = names.join(' ')
        formatted_names += "#{first} <i>#{last}</i>"
      else
        formatted_names += "<i>#{n}</i>"
      end
    end
    formatted_names
  end

  def zero_padded(n)
    number = n.to_i
    if number < 10
      number = "0" + number.to_s
    end
    number
  end
end
