--- 
layout: post 
custom_css: a_pattern 
custom_js: a_pattern 
title: "Finally, a pattern I can live with." 
date: 2015-09-06 21:32:00 
categories: rails models logic
img: avocets.jpg 
--- 
So where **do** you put the business logic in Rails?

I'm going to share an aha I had after getting lost in a Rails app and needing a
way out. A typical story I'm sure, it all started with a few innocent methods
placed in the `helpers` folder and quickly grew into a full grown API loosely
construed as support for creating a model from a controller method. I was guilty
of violating every tenant of Rails possible and I knew it, but I just didn't
know where to put the nice classes and modules that were going to clean
everything up.

It turns out there are many contradictory views on this; checkout out this
[post](http://blog.codeclimate.com/blog/2012/02/07/what-code-goes-in-the-lib-directory/)
from Code Climate.  The discussion in the comments section highlights the fact
that there is no consensus about where to put application specific logic in a
Rails app. A number of different approaches have cropped up, which are often
attempting to keep both the models and the controllers to a minimal footprint.
The inherit tension of keeping models and controllers thin leads to putting the
logic somewhere else, thereby creating a fourth entity in the MVC framework, an
MBVC if you will.

Is augmenting MVC a problem? Not necessarily, but it is clunky from a conceptual
level and pushes the design toward a [Service Oriented
Architecture](https://tech.bellycard.com/blog/migrating-to-a-service-oriented-architecture-soa/)
pattern, which is an interesting proposition, but not what I was ideally going
for in my app that I wanted to keep simple, as in MVC simple. 

It's fairly clear why the controller should be skinny. It is essentially a
switch board that routes communication. It’s purview is well defined, and
there’s no reason to mess with that, but what about the model?

In a Rails app the model is typically an interface for a database table. Let’s
think about that for a second. Is Rails really a Database View Controller
framework?  No, its a [Model View
Controller](https://en.wikipedia.org/wiki/Model–view–controller) framework ,and
the model was designed with a broader, more crucial intent than just a database
store.

> “The model directly manages the data, logic and rules of the
application.”[<sup>1</sup>](https://en.wikipedia.org/wiki/Model–view–controller#Components)

I would argue that the model is an entity that manages a resource. The resource
is often represented in a database table and manipulated with basic
[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations.
This is essentially what Rails is optimized for.(see [Active Record
Pattern](https://en.wikipedia.org/wiki/Active_record_pattern)) 

The aha for me came when I began looking at the `ActiveRecord` class as a resource
that represents the model and not the entirety of the model. I will demonstrate
a way of implementing this insight with a made up Starwars app which does some
really cool stuff with rayguns.

Lets say I have a `Raygun` model that has a lot of configuration code. I've
extracted that logic into a `raygun_builder.rb` and `beam_loader.rb`. Where do
these files go? How about creating a folder in the `app/models` folder that is
named after the model they are serving.

<pre>
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
        ├───beam_loader.rb
        │
        └───beam_shooter.rb
</pre>

Putting all the raygun relevant files in the `models` folder feels conceptually
correct and it makes navigating the file hierarchy more efficient.

In order for this to work you have to tell Rails to look in `raygun` folder.
{% highlight ruby %} #config/application.rb

module Starwars
  class Application < Rails::Application 
    config.autoload_paths << Rails.root.join('app/models/raygun') 
  end
end
{% endhighlight %}

You could actually go further by subdividing files that relate to building and
operation, and put them in their own folders. You would just have to add a
reference to the paths to the additional folders and add them to
`config.autoload_paths`.

{% highlight ruby %} 
class `Raygun` < ActiveRecord::Base 
  has_many :batterys 
  belongs_to :arsenal

  validates :beam, presence: true 
  validates :blasts, numericality {greater_than: 0}

  def shoot
    BeamShooter::shoot 
  end 
end
{% endhighlight %}

A `Raygun` is instantiated with a `beam` that must be loaded from an external
api. Due to the complexity of this operation I will make a seperate class,
`RaygunBuilder`, for creating rayguns and a seperate module, `BeamLoader`, to
perform the api call. This abstraction has been designed with the
[Builder](https://en.wikipedia.org/wiki/Builder_pattern) pattern in mind.

> "The intent of the Builder design pattern is to separate the construction of a
complex object from its representation. By doing so the same construction
process can create different representations."[<sup>2</sup>](https://en.wikipedia.org/wiki/Builder_pattern)

{% highlight ruby %}
class RaygunBuilder
  attr_accessor :type, :beam

  def initialize(type) @type = type
    @beam = load_beam

    build 
  end

  def build 
    Raygun.create(beam: @beam, blasts: @type.blasts) 
  end

  def load_beam
    BeamLoader::load(@type)
  end
end
{% endhighlight %}

{% highlight ruby %} 
require 'net/http'

module BeamLoader 
  def load(type)
    uri = URI('http://starwars.io/' + type)

    res = Net::HTTP.get_response(uri)

    res.body 
  end 
end  
{% endhighlight %}

I placed the `beam_loader` and `beam_shooter` files in the `raygun` folder on
the assumption that only a `Raygun` will utilize those respective
functionalities. If, however, there is a light saber or other weapon that uses
the `BeamLoader` or `BeamShooter` I would strongly consider puting those files
in the `lib` folder. I think of the lib folder as a place for code that is more
general and might someday become it's own gem.

I'm curious to know what other Rails developers think about this approach, and
what you do when building out models that depend on external services or rely
on complicated internal code. So please leave a comment below!

