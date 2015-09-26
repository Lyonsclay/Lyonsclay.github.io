---
layout: post
custom_css: a_pattern
custom_js: a_pattern
title: "Finally, a pattern I can live with."
date: 2015-09-06 21:32:00
categories: rails models logic
img: ../public/assets/images/avocets.jpg
---
So where **do** you put the logic for models in Rails?

What I really want to do is keep any code in my models that relates to creating
a particular model. So lets say I have a `Raygun` model that has a lot 
of configuration code. I've extracted that logic into a
`raygun_builder.rb` and `beam_loader.rb`. Where do these files
go? How about creating a folder in the `app/models` folder that is
named after the model they are serving.  
<pre>
  <code class="language-bash" data-lang="bash">
app
│
└───models
    │
    └───raygun
        │
        ├───raygun.rb
        │
        ├───raygun_builder.rb
        │
        └───beam_loader.rb
  </code>
</pre>

{% highlight ruby %}
class Raygun < ActiveRecord::Base
  has_many :capacitors
  has_many :batterys
  belongs_to :arsenal
  
  validates :blasts, numericality: {greater_than: 0}
end
{% endhighlight %}
If there is some code that is used for creating or managing
a number of models well then I might put that in the lib or public folder. Some
advocate creating a separate application folder for this purpose.

