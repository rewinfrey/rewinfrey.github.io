---
layout: writing
group: Archive
title: "Vegan Cheeses and Red Wine Cake"
date: 2013-01-11 17:00:00
categories:
- archive
---

At today's [8th Light University](http://university.8thlight.com/) I asked craftsman [Wai Lee](http://www.8thlight.com/our-team/wai-lee-chin-feman) for a blog post title, and that's what I was given to work with. I thought about how Vegan Cheeses and Red Wine Cake are related to programming, and decided that they both are applications, that in the context of our gastronomic interface, communicate with each other. This got me thinking about how I was refactoring parts of my Tic Tac Toe library so as to provide better communication between the core library and the external interfaces. And so it begins, a tale of a terrible gastronomic metaphor.

Having spent a good deal of time refactoring the individual parts of my Tic Tac Toe library, including the external interfaces that use it (Rails, Limelight and a command line interface), I realized the core library was in need of refactoring at the interface level. What I mean is I saw some problems with how the library and the external interfaces were communicating. I saw some code duplication and I saw places where my external interfaces knew more than they should about the core library. I refactored with the following goals in mind:

1. Remove all unnecessary duplication amongst external interfaces
2. Better define and formalize the public interface for the "core" library
3. Segregate hard dependencies in the core library to one place

Before diving in, I'd like to define the term application. In this context, application refers to a collection of related code that can be thought of as a single unit. In the case of my Tic Tac Toe library, the core library is one application, the external interfaces that depend on the core library are their own applications. In this way of thinking, my Rails external interface is its own application that communicates with the Tic Tac Toe application.

When we talk about [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself), it's usually in the context of an application. But DRY applies just as well to situations where different applications talk to one another. In establishing connections between applications some information needs to be shared. My current best thinking is that the directionality of sharing information from application to application should respect the SOLID principles while minimizing the need to duplicate code facilitating the connection between applications. To do this, it's important to ensure encapsulation of an application is not broken or is not leaky, and respect the roles of applications by not requiring them to do something that would require breaking encapsulation (SRP applied to the application level).

Previously my Tic Tac Toe library broke encapsulation by requiring the Limelight, Rails and CLI interfaces to know what player types and board types are defined by the Tic Tac Toe library. This in turn meant that Limelight, Rails and the CLI interfaces had their own configuration and setup code. I realized that requiring these applications to do their own configuration and setup breaks encapsulation of the Tic Tac Toe library, violates DRY, and also introduces a Dependency Inversion Principle violation at the application level. Not good.

The approach I took was to define a single, common public interface for the Tic Tac Toe library that the external applications all talk with when configuring a new game. I call the Tic Tac Toe configuration interface `TTT::Setup` and reasoned that it needs to perform a few simple responsibilities:

`TTT::Setup` should provide any external application the ability to
1. request a list of available player types.
2. request a list of available board types.
3. send a player type selection.
4. send a board type selection.
5. request a new game object.

Responsibility #5 is the most important for maintaining encapsulation and preventing DRY violations amongst my external applications. To achieve this, I reasoned that I should add two classes and a configuration file to the Tic Tac Toe application:

    #lib/ttt/configuration.rb

    BOARDS                 = [TTT::ThreeByThree, TTT::FourByFour, TTT::ThreeByThreeByThree]
    HUMAN_READABLE_BOARDS  = %w(3x3 4x4 3x3x3)

    PLAYERS                = [TTT::Human, TTT::AIEasy, TTT::AIMedium, TTT::AIHard]
    HUMAN_READABLE_PLAYERS = ["Human", "AI Easy", "AI Medium", "AI Hard"]
    __END__

    module TTT
      class ConfigHelper
        def self.player_types
          HUMAN_READABLE_PLAYERS # => ['Human', 'AI Easy', 'AI Medium', 'AI Hard']
        end

        def self.board_types
          BOARD_TYPES            # => ['3x3, '4x4', '3x3x3']
        end

        def self.get_player_const(player_type)
          PLAYERS[HUMAN_READABLE_PLAYERS.index(player_type)] # => returns related player_type class constant
        end

        def self.get_board_const(board_type)
          BOARDS[HUMAN_READABLE_BOARDS.index(board_type)]    # => returns related board_type class constant
        end
      end

      class Setup
        def player_types
          ConfigHelper.player_types
        end

        def board_types
          ConfigHelper.board_types
        end

        def new_game(options)
          Game.new(player1: create_player(options, 1), player2: create_player(options, 2), board: create_board(options))
        end

        private

        def create_player(options, player_num)
          ConfigHelper.get_player_const(options["player#{player_num}".to_sym]).new
        end

        def create_board(options)
          ConfigHelper.get_board_const(options[:board]).new
        end
      end
    end

I like that `TTT::ConfigHelper`'s responsibilities are only concerned with reading the configuration file. It doesn't know anything else about the application. It has no notion of state, and has no behavior. That is why I made the decision to write `TTT::ConfigHelper` as having only class methods. It stands behind `TTT::Setup`, and if I were to make `TTT::ConfigHelper` an object, it increases the risk that an external application could break encapsulation by accessing that object. I feel like the extent of `TTT::Setup`'s responsibilities are well balanced. It is responsible for simply providing appropriate responses to an external application's requests - whether that is for information about what player types are supported by the library, or responding with a new game object. This means that all external applications just need communicate with `TTT::Setup`, which has a very simple public interface that does not break encapsulation at any level. Once the game object has been passed onto the external application, `TTT::Game`'s public interface becomes the point of connection between the library and the external application.

What this also does is solve problem 1 listed above. My external applications previously carried configuration information about the Tic Tac Toe application. This meant that each external application performed a similar series of steps in determining player types and board type. Now there is one place this operation occurs, and it has the beneficial side effect of also helping solve problem 2.

Now the "core" library only has two points of contact - setup and game play. A setup class exists for the game setup communication, and the game play communication occurs through a game object. I like that the public interface for the Tic Tac Toe application is now well defined, and both vectors of communication are bounded by strict object boundaries. In one case, with setting up a new game, the communication vector need only concern itself with how to create a game, but it doesn't need to know how games are played. In the second case, the game play vector only cares about how to make moves and determine the board state. It doesn't need to know what kind of players there are, or what kind of boards there are. By creating classes that represent responsibilities in the Tic Tac Toe application, this had the beneficial side-effect of solving problem 3.

Having hard dependencies in an application is usually unavoidable. At some level, there is a hard dependency. But, we can do things to help us better manage the extent to which those hard dependencies are known throughout an application. In this case, simply creating a configuration file and allowing only one point of contact with that configuration file in the application worked well for segregating the hard dependencies into one place. Now if I want to add or remove player or board types in the future, there is only one file I need to edit.

So no matter where in the gastronomic interface that Vegan Cheese or piece of Red Wine Cake are - the rules that determine good communication between applications apply just the same to what determines good internal communication for a single application.
