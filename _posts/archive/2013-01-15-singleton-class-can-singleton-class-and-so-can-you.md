---
layout: writing
group: Archive
title: "Singleton Class Can Singleton Class And So Can You"
date: 2013-01-15 17:00:00
categories:
- archive
---

Singleton Classes are one of my favorite things about Ruby. They're not commonly used, and it is hard to justify using them in many contexts. But, they represent an idea that is intrinsic to the structure of the Ruby Object Model. I contend understanding Ruby's Singleton Classes is a top tier requisite for understanding the Ruby Object Model.

What's a Singleton Class? It's a class, defined uniquely for every object in Ruby. Every object in Ruby has one Singleton Class. Every object's Singleton Class is only visible to the object to which it belongs. No object can see another object's Singleton Class. In other words, a Singleton Class is space bound to one object, that allows us to define methods or variables on that object. It's so simple, it's complicated.

But we should be wise to remember that *almost* everything is an object in Ruby. Is the Singleton Class of an object also an object? Yup. Singleton Classes are objects, or instances of, the class Class, which itself is just an instance of class Class (that's a fun one to consider) - whose ancestor is the grandmother of all Ruby objects - Object. Another way to think of it is that every class is an instance of Class, including the class Class. Class defines Class. Paradox? Nah, they're all just objects defined by Object!

This means that every Singleton Class can have its own Singleton Class. Below is an example to show that a generic object can have a Singleton Class, whose Singleton Class has a Singleton Class, and so on. Yet, the generic object can only see its Singleton Class, but not its Singleton Class' Singleton Class.

    class GenericClass
      def initialize
        "Hello, I'm the generic object for this example"
      end
    end

    generic_object = GenericClass.new

    # 'opening up' generic_object's Singleton Class
    class << generic_object
      def first_singleton_level
        puts "My singleton class = #{self.singleton_class}"
        "generic_object's singleton class"
      end

      # 'opening up' generic_object's Singleton Class' Singleton Class (second level Singleton Class)
      # self here is generic_object's Singleton Class
      class << self
        def second_singleton_level
          puts "First singleton class' singleton class = #{self.singleton_class}"
          "generic_object's singleton class' singleton class"
        end

        # 'opening up' generic_object's Singleton Class' Singleton Class' Singleton Class (third level Singleton Class)
        # self here is the Singleton Class of generic_object's Singleton Class
        class << self
          def third_singleton_level
            puts "Second singleton class' singleton class = #{self.singleton_class}"
            "generic_object's singleton class' singleton class' singleton class"
          end
        end
      end
    end

Our example object here, generic_object can see it's Singleton Class:

    generic_object.first_singleton_level
    # => My singleton class = #<Class:#<GenericClass:0x007fce13114a48>>
    # => "generic_object's singleton class"

Our generic_object's Singleton Class also has a Singleton Class:

    generic_object.singleton_class.second_singleton_level
    # => First singleton class' singleton class = #<Class:#<Class:#<GenericClass:0x007fce13114a48>>>
    # => "generic_object's singleton class' singleton class"

However, our generic_object cannot see its Singleton Class' Singleton Class:

    generic_object.second_singleton_level
    # => undefined method `second_singleton_level' for #<GenericClass:0x007faf1c08e670> (NoMethodError)

Yet, our "second level" Singleton Class can see the "third level" Singleton Class:

    generic_object.singleton_class.singleton_class.third_singleton_level
    # => Second singleton class' singleton class = #<Class:#<Class:#<Class:#<SingletonsOfSingletons:0x007fce13114a48>>>>
    # => "generic_object's singleton class' singleton class' singleton class"

And just to show that there is no magic here - and our model is consistent, the "first level" Singleton Class (generic_object's Singleton Class) cannot see the "third level" Singleton Class:

    generic_object.singleton_class.third_singleton_level
    # => undefined method `third_singleton_level' for #<Class:#<GenericClass:0x007fce13114a48>> (NoMethodError)

I'd like to thank craftsman [Wai Lee](http://www.8thlight.com/our-team/wai-lee-chin-feman) for this blog post idea - and for the interesting conversation on the train ride home from Libertyville talking about functions that can see their functional components (aware of the source code) and also execute those components.
