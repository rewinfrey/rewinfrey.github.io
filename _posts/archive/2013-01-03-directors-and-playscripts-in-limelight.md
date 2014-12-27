---
layout: writing
group: Archive
title: "Directors and Playscripts in Limelight"
date: 2013-01-03 17:00:00
categories:
- archive
---

In [yesterday's post](http://selfless-singleton.rickwinfrey.com/2013/01/02/gem-server/) I described a couple styles of learning that I find helpful for me - including an approach to learning Limelight that has allowed me to think about it without relating it to frameworks I've used in the past. I mentioned that Limelight's use of a theater metaphor allowed me to conceptualize the design of the Limelight interface for my Tic Tac Toe program in a new and interesting way (for me), and today I'd like to show the structure of the approach I took.

To understand what I did, we'll first need to understand how Limelight is structured. The Limelight default directory structure looks something like this:

    example_production/
    ├── default_scene
    │   ├── players
    │   │   ├── actor1.rb
    │   │   └── actor2.rb
    │   ├── props.rb
    │   └── styles.rb
    ├── production.rb
    ├── spec
    │   ├── default_scene
    │   │   └── default_scene_spec.rb
    │   └── spec_helper.rb
    ├── stages.rb
    └── styles.rb

Here I've created a new Limelight production and given it the name "example_production". As you can see, it contains two directories and a number of files. What's important to note here is that Limelight uses "stages" which represent a GUI window. What we display on each stage is a "scene". A Limelight production can have any number of stages and associated scenes. These stages and scenes all belong to a "production", and so when our Limelight application is first launched, the production.rb file is automatically run.

Looking at the 'default_scene' directory structure reveals a couple of other interesting things:

    ├── default_scene
    │   ├── players
    │   │   ├── actor1.rb
    │   │   └── actor2.rb
    │   ├── props.rb
    │   └── styles.rb

Every scene is its own directory. Inside each scene directory contains another directory called "players". We can think of players as the actors, or components of our GUI window (the scene), as having a special role to play in the greater context of our production (application). Our players generally interact with the props of our scene, defined by the file, props.rb. Our props should be styled appropriately for the context of our production, and we can define the styles (similar to CSS) in the file, styles.rb. Each scene contains this information so that when it is loaded at the appropriate time in the context of our production, our GUI window displays the necessary props, styled accordingly, with players whose behavior has been defined in the corresponding files in the players directory.

I really like this structure. I enjoy the clear separation of roles and responsibilities, and having each scene well encapsulated in this way makes it very easy for me to go immediately to the appropriate file when I want to edit something. There's no thinking about where this component of this GUI window is, and the CSS-like DSL provided by the Limelight library to style props makes it very intuitive and easy to style the props of a scene as one would expect if one is comfortable or familiar with the rules of CSS.

The biggest hurdle I faced in first writing the Limelight interface was deciding on how I wanted to maintain a game's state. When a human player moves, it's a simple matter of listening to a mouse event on the GUI window and receiving the move input and updating the board, but if the other player is a computer, I need to somehow ask the Tic Tac Toe library for the next move. Knowing when to receive a human move and a computer move requires having some state information about a game. I knew it would be easiest if I maintained the state of a game as an object, so I could write an interface between my Tic Tac Toe game library and the Limelight production code. In the end, I knew what I wanted was a high level game object that was visible to a scene, but figuring out how to add it to the default Limelight structure was a challenge. So, I decided to extend the theater metaphor, and reasoned that every production has directors and playscripts.

So now, my Limelight production structure looks something like this:

    ├── directors
    │   ├── board_selection_director.rb
    │   ├── game_setup_director.rb
    │   ├── player_selection_director.rb
    │   └── production_director.rb
    ├── playscripts
    │   └── game_playscript.rb
    ├── new_game
    │   ├── players
    │   │   ├── board_type.rb
    │   │   ├── player_type.rb
    │   │   └── setup_button.rb
    │   ├── props.rb
    │   └── styles.rb
    ├── production.rb

The first thing I added was a "directors" directory. I reasoned that directors are mostly responsible for helping assign players to their roles, and are most active before a production starts. They help prepare a production for the actual performance, and help keep things going from one act to the next. They aren't necessarily involved with the players when a player is performing in front of an audience (the user), so I reasoned that directors should be responsible for helping me setup a new game (and hence create a new game object).

The second thing I added was a "playscripts" directory. The term playscript is less commonly used compared to the term script, but since 'script' is already loaded with meaning in the programming world, I thought it best to use "playscripts" as the name of the directory. The playscripts directory is responsible for guiding the players in the various scenes. I think of a playscript as providing the rules of behavior, or sets of expectations, that players have when they are performing in a scene. Here, I have only one playscript, which determines the behavior of the game, to which all players "read" from. In the context of OOP, this really means that the messages or "lines" of the playscript for game determine how game behaves. Since game contains players, I reasoned that every player in this production should read from the same playscript, the game playscript.

What this structure allows me to do is generate 3x3, 4x4 or 3x3x3 boards and create game objects for each of them that use the same modular code. I am able to define the behavior in one place for all three game types with the game playscript. My game setup process simply uses the various directors to determine how to setup a new game. And the file, production_director.rb, acts as a production-wide configuration file that allows me to easily add new player types, board types or game types to this production. In approaching the Limelight interface in this way, I was able to ensure that I avoided any Dependency Inversion Principle or Liskov Substitution Principle violations.
