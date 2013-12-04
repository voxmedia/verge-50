module CustomHelpers

  def page_title(person)
    if person.nil?
      "The Verge Fifty"
    else
      "The Verge Fifty &ndash; #{person['name']}"
    end
  end

end 