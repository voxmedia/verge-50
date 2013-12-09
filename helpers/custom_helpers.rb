module CustomHelpers

  # Formats the page <title>
  def page_title(title = nil)
    if title.nil?
      app_name
    else
      "#{title} | #{app_name}"
    end
  end

  # Gets the correct relative url for a given slug
  def page_url(slug = nil)
    if slug.nil?
      url_prefix
    else
      "#{url_prefix}/#{slug}"
    end
  end

  # Same as above, but absolute
  def absolute_page_url(slug = nil)
    if slug.nil?
      "#{absolute_prefix}#{url_prefix}"
    else
      "#{absolute_prefix}#{url_prefix}/#{slug}"
    end
  end

  # Oh god this is horrible but I can't think of a better way of generating these links
  def rel_prev_next_links(slug = nil, page_type = 'index')
    case page_type
    when 'index'
      "<link rel='next' href='#{absolute_page_url(data.pages.find{ |p| p.name == 'intro' }.slug)}' />"
    when 'intro'
      "<link rel='prev' href='#{absolute_page_url}' />\n" \
      "<link rel='next' href='#{absolute_page_url(data.people.first.slug)}' />"
    when 'person'
      index = data.people.index{ |p| p.slug == slug }
      if index == 0
        "<link rel='prev' href='#{absolute_page_url(data.pages.find{ |p| p.name == 'intro' }.slug)}' />\n" \
        "<link rel='next' href='#{absolute_page_url(data.people[index + 1].slug)}' />"
      elsif index == data.people.size - 1
        "<link rel='prev' href='#{absolute_page_url(data.people[index - 1].slug)}' />\n" \
        "<link rel='next' href='#{absolute_page_url(data.pages.find{ |p| p.name == 'full-list' }.slug)}' />"
      else
        "<link rel='prev' href='#{absolute_page_url(data.people[index - 1].slug)}' />\n" \
        "<link rel='next' href='#{absolute_page_url(data.people[index + 1].slug)}' />"
      end
    when 'full-list'
      "<link rel='prev' href='#{absolute_page_url(data.people.last.slug)}' />\n" \
      "<link rel='next' href='#{absolute_page_url(data.pages.find{ |p| p.name == 'credits' }.slug)}' />"
    when 'credits'
      "<link rel='prev' href='#{absolute_page_url(data.pages.find{ |p| p.name == 'full-list' }.slug)}' />"
    end
  end

  # Parses people's names and makes sure that everyone's last name is
  # wrapped in <i> for styling.
  def formatted_names(name)
    formatted_names = []
    name.split(' and ').each do |n|
      names = n.split(' ')
      if names.size > 1
        last = names.pop
        first = names.join(' ')
        formatted_names << "#{first} <i>#{last}</i>"
      else
        formatted_names << "<i>#{n}</i>"
      end
    end
    formatted_names.join(' and ')
  end

  def zero_padded(n)
    number = n.to_i
    if number < 10
      number = "0" + number.to_s
    end
    number
  end

  # Link to share a link on twitter
  def tweet(slug = nil, text = nil)
    url = absolute_page_url(slug)
    via = twitter
    text ||= app_name

    "https://twitter.com/share?url=#{CGI.escape(url)}&amp;via=#{CGI.escape(via)}&amp;text=#{CGI.escape(text)}"
  end

  # Link to share a link on facebook
  def facebook(slug = nil)
    url = absolute_page_url(slug)
    "https://www.facebook.com/sharer/sharer.php?u=#{CGI.escape(url)}"
  end

  # Link to share a link on g+
  def google_plus(slug = nil)
    url = absolute_page_url(slug)
    "https://plus.google.com/share?url=#{CGI.escape(url)}"
  end

  # Render a string in Markdown
  def markdown(text)
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
    markdown.render(text)
  end

  # Returns a class that changes the layout of each person's profile
  # depending on how far down the list they are
  def list_tier(position)
    if position <= 10
      "tier_1"
    elsif position <= 20
      "tier_2"
    else
      "tier_3"
    end
  end

  def resize_text(name)
    if name.size >= 29
      "smallest"
    elsif name.size >= 25
      "tiny"
    elsif name.size >= 20
      "very-small"
    elsif name.size >= 15
      "smaller"
    elsif name.size >= 10
      "small"
    end
  end

  def mq(query, retina = false)
    if retina
      "(#{query}) and (-webkit-min-device-pixel-ratio: 1.3), (#{query}) and (min-device-pixel-ratio: 1.3), (#{query}) and (min-resolution: '124.8dpi')"
    else
      "(#{query})"
    end
  end
end
