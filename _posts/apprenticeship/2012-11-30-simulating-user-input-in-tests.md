---
layout: writing
group: Apprenticeship
title: "Simulating User Input In Tests"
description: ""
categories:
- apprenticeship
---

A couple days ago I was struggling to find a way to write tests to simulate user input for my CLI Ruby tic tac toe game. My application structure uses a presenter class, called `TTT::View`, that serves as an interface for the user output and input that talks with my game. `TTT::Game` looks something like this:

    module TTT
      class Game
        def initialize(options)
          view:  options[:view]
          board: options[:board]
        end

        ...
      end
    end

Based on this structure, I send view and board objects to my `TTT::Game` class when a new game object is instantiated. The reason for this is so that my `TTT::Game` class can be ignorant of how the board and the view objects implement the messages they're expected to receive. I got this idea from [Sandi Metz'](http://sandimetz.com/) wonderful book [Practical Object Oriented Design in Ruby](http://www.poodr.info/).

The `TTT::View` class I'm using is currently configured for a command line interface, and looks like this:

    module TTT
      class View
        def initialize(options)
          instream:  options.fetch(options[:input], $stdin)
          outstream: options.fetch(options[:output], $stdout)
        end

        def input
          instream.gets
        end

        def output
          outstream.puts
        end

        private
        attr_accessor :instream, :outstream
      end
    end

Using an options hash to instantiate a new object allows me a good deal of flexibility with how I create that object. In this case, I'm saying if I don't provide an :input or :output key/value pair, then instantiate the `TTT::View` object's instream and outstream instance variables to [$stdin and $stdout](http://zetcode.com/lang/rubytutorial/io/) (Ruby global variables), respectively.

Being new to RSpec left me scratching my head when it came to testing a simulation of the game where user input is predefined. So after trying a few things but seeing nothing but red test results:

[<br /><div style="width: 500px; margin: auto;"><img src="http://i.ytimg.com/vi/4RCT3NX55Sk/0.jpg" /></div><br />](http://i.ytimg.com/vi/4RCT3NX55Sk/0.jpg)

I asked craftsman [Michael Baker](http://www.8thlight.com/our-team/michael-baker) if he could give me some clues. He told me that Ruby's [StringIO](http://www.ruby-doc.org/stdlib-1.9.3/libdoc/stringio/rdoc/StringIO.html) class was what I should look into, and that it was possible to instantiate a new `StringIO` object with a string of predefined input. Aha! That allowed me to write a test like this:

    module TTT
      describe Game do
        describe "#start"
          it "simulates the setup of a game"
            # user is first prompted to establish player type for players 1 and 2:
            # h = human, c = computer
            # and to complete setup user is prompted for player 1 side (x or o)
            input  = StringIO.new("h\nc\nx\n")
            output = StringIO.new
            view   = View.new(instream: input, outstream: output)
            board  = Board.new
            game   = Game.new(view: view, board: board)
            game.start_game
            game.player1.class.should == Human
            game.player2.class.should == AI
            game.player1.side.should  == "x"
          end
        end
      end
    end

Because my `TTT::View` class allows me to specify what instream and outstream are, I can make them be whatever I want, so long as they respond to `gets` and `puts`. With this new found knowledge of `StringIO`, I can predefine the input I want to send to my game object when I invoke game.start. This allows me to determine if the "h\n" correctly assigned player 1 to a new instance of `TTT::Human`. The "c\n" maps to player 2 being instantiated from `TTT::AI`. And finally, I can verify that player 1's side was correctly set to "x".

This works because `StringIO` responds to `gets` and `puts`. When `gets` is called on a `StringIO` object instantiated with a string (e.g. "h\nc\nx\n"), it returns the portion of the string before the first '\n'. Alternatively I could have used `getc`:

    module TTT
      class View
        ...
        def input
          instream.getc
        end
      end
    end

What I've realized is that knowing how to write tests is just a small obstacle to the real joy that is enjoying the knowledge that one's code works. I'm quickly coming to the opinion that writing code without tests seems dirty, or like cheating, and makes me feel uncomfortable. Alas, I'm afraid my [cowboy coding](http://c2.com/cgi/wiki?CowboyCoding) days are coming to a close.

[<br /><div style="width: 242px; margin: auto;"><img src="http://www.troll.me/images/cowboy-dos-equis/i-dont-always-test-my-code-but-when-i-do-i-do-it-in-production-stay-on-call-my-friends-thumb.jpg" /></div><br />](http://www.troll.me/images/cowboy-dos-equis/i-dont-always-test-my-code-but-when-i-do-i-do-it-in-production-stay-on-call-my-friends-thumb.jpg)

To finish up my first week as an apprentice at 8th Light, I'd like to share one of my favorite Sandi Metz' quotes:

> The Ruby crowd is a fierce meritocracy where everyone is scary smart and each believes that everyone else is slightly smarter. They're chasing perfection and claiming ignorance. They love a good idea. They want to change the world.

That's how it feels to be at 8th Light, and in general how it feels to be part of the Ruby community. I feel like the commitment to craftsmanship at 8th Light, and the incredible creativity and expressiveness of the Ruby community in general represents something akin to [Shambhala](http://en.wikipedia.org/wiki/Shambhala) for developers, and I couldn't be happier to have been allowed to _mixin_ and learn from the talented and smart craftsmen at 8th Light.
