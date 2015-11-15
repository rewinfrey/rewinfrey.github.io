---
layout: writing
group: Apprenticeship
title: "Serialization in Rails"
description: ""
categories:
- apprenticeship
---

In working on the Rails wrapper for my tic tac toe application, I talked in [yesterday's post](http://selfless-singleton.rickwinfrey.com/2012/12/11/debug-params/) about the problem of HTTP being stateless. This is a problem when we make objects that contain some kind of state data (in this context it's the game board). So to get around that, I decided to write the game data to the database and then pull it out for each request, reinitialize a series of objects needed to facilitate the next move of the game, and repeat until the game is finished.

Last night I was curious if there was another way to think about this problem, so I asked my roommate [Josh Cheek](http://www.joshcheek.com/) what he thought about my solution. He said it makes sense, but why not use [serialization](http://en.wikipedia.org/wiki/Serialization)? I knew that serialization was a thing, but didn't know how to use it or what its benefits were. So we walked through a simple example, and I was very happy to learn that by serializing objects to a database in Rails, I can pull that object back out of the database and it will be a clone of that object! The process of taking a serialized object and reconstituting back as an object is called deserialization. That made me very happy to learn, because now I can streamline my Rails code to simply pull out a game object that has previously been serialized.

Let's take a look at how to serialize an object in Rails (using the Rails' serialize approach rather than [Marshalling](http://www.ruby-doc.org/core-1.9.3/Marshal.html)):

    class Game < ActiveRecord::Base
      serialize :board
    end

    class Board
      def initialize(board = Array.new(9) { |i| i })
        @board = board
      end
    end

    board = Board.new
    game = Game.create! turn: 1, board: board
    Game.first.board # => #<Board:0x007fca442908b8 @board=[0, 1, 2, 3, 4, 5, 6, 7, 8]>
    board            # => #<Board:0x007fca441185f8 @board=[0, 1, 2, 3, 4, 5, 6, 7, 8]>

    board.to_YAML    # => "--- !ruby/object:Board\nboard:\n- 0\n- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n"

In this case, my model is Game, and I'm interested in serializing the game board, so I include `serialize :board` in the Game model. Then, in my Board class, I can create a new board instance. When I create a new Game instance with a board, the board object is serialized to the database as YAML. When I retrieve this record out of the database, the board is deserialized as a board object with the same object id! This is done through some ActiveRecord magic, but I'm guessing it is probably using YAML::load(data) when it pull out a record that is serialized.

To understand more about how YAML serialization works, here's an example of how to implement your own serialization of an object using YAML and then deserialize it.

    require 'YAML'

    class RetainAttributeOfToYAML
      attr_accessor :name
      def initialize(name)
        @name = "Hi, my name is #{name}."
      end
    end

    class ToYAML
      attr_accessor :attribute_to_retain
      def initialize(attribute)
        @attribute_to_retain = attribute
      end
    end

Given this structure, we can create a new RetainAttributeOfToYAML object, and instantiate a ToYAML object with our RetainAttributeOfToYAML object. This will allow us to show that when serializing, any objects that are part of the object we are serializing are also serialized. Here's the process:

    attribute1 = RetainAttributeOfToYAML.new("Schrodinger")
    attribute2 = RetainAttributeOfToYAML.new("Cat")

    ex1 = ToYAML.new(attribute1)
    ex2 = ToYAML.new(attribute2)

Now that we have ex1 and ex2, which look like this:

    ex1.inspect                         # => "#<ToYAML:0x007f9832826208 @attribute_to_retain=#<RetainAttributeOfToYAML:0x007f9832826bb8
                                        @name=\"Hi, my name is Schrodinger.\">>"

    ex2.inspect                         # => "#<ToYAML:0x007f9832826140 @attribute_to_retain=#<RetainAttributeOfToYAML:0x007f9832826320
                                        @name=\"Hi, my name is Cat.\">>"

Let's first serialize the data. We'll use YAML::dump to do this:

    ex1_serialized   = YAML::dump(ex1)

    ex2_serialized   = YAML::dump(ex2)

This produces a YAML serialized version of ex1 and ex2 that is human readable:

    ex1_serialized.inspect              # => "\"--- !ruby/object:ToYAML\\nattribute_to_retain: !ruby/object:RetainAttributeOfToYAML\\n
                                        name: Hi, my name is Schrodinger.\\n\""

    ex2_serialized.inspect              # => "\"--- !ruby/object:ToYAML\\nattribute_to_retain: !ruby/object:RetainAttributeOfToYAML\\n
                                        name: Hi, my name is Cat.\\n\""

At this point we could write this to a database or to a file. Let's say we did, and that at some point in the future, we want to get the serialized ex1 and ex2 objects back into their object form so we access their attributes. We can use YAML::load like so:

    ex1_deserialized = YAML::load(ex1_serialized)

    ex2_deserialized = YAML::load(ex2_serialized)

This gives us back an object again, that is nearly identical to our original ex1 and ex2 objects:

    ex1_deserialized.inspect            # => "#<ToYAML:0x007f9832822108 @attribute_to_retain=#<RetainAttributeOfToYAML:0x007f9832821f28
                                        @name=\"Hi, my name is Schrodinger.\">>"

    ex2_deserialized.inspect            # => "#<ToYAML:0x007f9832821578 @attribute_to_retain=#<RetainAttributeOfToYAML:0x007f98328213e8
                                        @name=\"Hi, my name is Cat.\">>"

The only difference between our original objects and our deserialized objects is the object id. This is because we've actually created new objects:

    ex1.object_id                             # => 70145695875260
    ex1_deserialized.object_id                # => 70145695863100

    ex2.object_id                             # => 70361052403020
    ex2_deserialized.object_id                # => 70361052391960

Yet they still function in the same way and encapsulate the same data:

    ex1.attribute_to_retain.name              # => "Hi, my name is Schrodinger."
    ex1_deserialized.attribute_to_retain.name # => "Hi, my name is Schrodinger."

    ex2.attribute_to_retain.name              # => "Hi, my name is Cat."
    ex2_deserialized.attribute_to_retain.name # => "Hi, my name is Cat."

And that's it for serializing things with YAML. I found this [post](http://www.skorks.com/2010/04/serializing-and-deserializing-objects-with-ruby/) very helpful in understanding how YAML works, and it also has a great explanation of how to do a similar thing with JSON and Marshal.

After getting more of my user stories done, I'm going to play around with the idea of [serializing closures](http://yehudakatz.com/2011/11/19/how-to-marshal-procs-using-rubinius/).
