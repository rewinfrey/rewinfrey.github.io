---
layout: writing
group: Apprenticeship
title: "undef_method vs remove_method in Ruby"
description: ""
categories:
- apprenticeship
---

Although it was a short week, I was able to get quite a bit finished on my Limelight interface and feel good about the progress on my user stories. I still have a couple bigger challenges left to implement, but I'm looking forward to them. The end result will be a Tic Tac Toe library that has a command line interface (CLI), Rails interface and a Limelight interface. The library supports viewing a game's move history, or the ability to load a previously played game. There are three levels of AI to play against (easy, medium and unbeatable). There are also three different types of boards to play on (3x3, 4x4 or a 3x3x3).

Today I learned the difference between Ruby's `undef_method` and `remove_method`. Both methods affect the method defined list of a class, but there is an important difference in how the method lookup operation occurs when a method has been undefined or removed.

Let's use an example:

    class Parent
      def who_am_i?
        puts "This is parent."
      end
    end

    class Child1 < Parent
      def who_am_i?
        puts "This is child1."
      end
    end

    class Child2 < Parent
      def who_am_i?
        puts "This is child2."
      end
    end

    child1 = Child1.new
    child2 = Child2.new

    child1.who_am_i? # => "This is child1."
    child2.who_am_i? # => "This is child2."

This is a simple example showing that both Child1 and Child2 classes have redefined the method `who_am_i?` they've inherited from the Parent class.

Let's see what happens when we use `undef_method` on Child1:

    class Child1
      undef_method :who_am_i?
    end

    child1.who_am_i? # => undefined method `who_am_i?' for #<Child1:0x007f991188ff48> (NoMethodError)

But what happens if we use `remove_method` on child2:

    class Child2
      remove_method :who_am_i?
    end

    child2.who_am_i? # => "This is parent."

The difference is important. With `undef_method` the method is removed from the class, and when that method is invoked a NoMethodError is raised. With `remove_method` the method is also removed from the class, but if that method is defined by an ancestor of the class, then the ancestor defined method is invoked. That's why `child2.who_am_i?` returns "This is parent" but `child1.who_am_i?` raises a NoMethodError.
