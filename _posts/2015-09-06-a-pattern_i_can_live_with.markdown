---
layout: post
custom_css: a_pattern
title: "Finally, a pattern I can live with."
date: 2015-09-06 21:32:00
categories: rails models logic
---
So where **do** you put the logic in rails?
<pre id="plain">
app
|
|__models
|  | 
|  |__raygun
|  |  |
|  |  |__raygun.rb
|  |  |
|  |  |__raygun_builder.rb
|  |  |
|  |  |__beam_loader.rb

app/models/ragun/raygun.rb
</pre>
{% highlight ruby %}
class Raygun < ActiveRecord::Base
  has_many :capacitors
  has_many :batterys
  belongs_to :arsenal
  
  validates :blasts, numericality: {greater_than: 0}
end
{% endhighlight %}

