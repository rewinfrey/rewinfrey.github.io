---
layout: writing
group: Archive
title: "Limelight backstage_pass() and partials"
date: 2013-01-08 17:00:00
categories:
- archive
---

In yesterday's IPM Micah pointed out the code duplication in my scenes could be avoided through the use of partials and also moving players and styles that were shared amongst all scenes to the top-level of the Limelight interface directory. We also talked about a class I made to maintain game state for the current game being played. Basically the class existed like a giant data-structure full of static methods, and it looked pretty gross. I knew that Limelight supported a `backstage` feature that would allow you to store objects or data at any time as part of the production and could be accessed from anywhere within the production, but I wasn't sure how it worked. After sending an email to Micah asking about some of the problems I had run into but wasn't finding answers in the docs, Micah sent me some clarifying examples that highlighted what I was doing wrong. This allowed me to get partials implemented, and moved styles and players to the top-level, and also got a game object stored in the backstage area of the production so I can now access the current game from anywhere within the production. This means I can refactor the giant gross data-structure class into something that appears to be much more like an interface.

<h3>
  Partials in Limelight
</h3>
If you're familiar with the ideas of [partials](http://guides.rubyonrails.org/layouts_and_rendering.html#using-partials) in Rails, then Limelight's partials is essentially the same thing. However, there's one gotcha that confused me I'd like to share.

When using partials in Limelight, I took the Limelight doc's suggestion and just made a directory at the top level of my Limelight directory and named it partials. Then I created a 'some_partial.rb' inside the directory. The code I wish to use as a partial as a prop for a scene can then be placed inside a block like this:

    some_partial do
      title :id => "id", :text => "Tic Tac Toe!"
      move_history :id => "move_history", :text => "Move History"
    end

Next, to add this partial to my props file for a given scene, I need to `install` the partial to my scene's prop file like so:

    __install 'partials/some_partial.rb'

Now when my scene is loaded and its props.rb file is read, the partial is installed as part of the scene. The directory holding your partials can be named whatever you like, and to access those files from `__install`, you just have to give it a relative path to the particular partial file you wish to load respective to the 'production.rb' file at the top level of your Limelight production.

The gotcha I encountered was how to load multiple partials in the same props.rb file. There might be a way that isn't included in the docs that I have access to, but in looking at the source it's not clear to me why I shouldn't be able to load multiple files using `__install`. But, to get around this I linked one partial to the next. At the end of the first partial I install the next partial, and so on until all partials have been called. I really detest this kind of thing, but in the interest of preserving DRY, decided it was worth the obfuscation.

<h3>
  Backstage
</h3>
In our productions when we want to have some form of persistence or state throughout the production, we can use the backstage of a production to store objects or variables in memory. The great thing about the backstage is that we can have access to it via the `production` object anywhere inside our production we might need to access the stored object or variable.

In my 'production.rb' file I have something like this:

    on_production_loaded do
      backstage_pass :game
    end

By including this `on_production_loaded` hook in my 'production.rb' file, I ensure that as soon as my production is loaded into memory this code is run. Here, `backstage_pass :game` is simply storing the key `game` as part of the production map/hash that is generated for a production. Then, at some other point in my production if I want to set this `game` key on my production, I can do so very simply like this:

    production.game = Game.new

Or I can simply get the value by calling

    production.game

I can call this `production.game` in a scene context, or a prop or player context, basically anywhere inside my Limelight application.

Using partials and the backstage area of a production allows you to write some efficient scene code and enjoy persistance across a production. I still have a little refactoring to finish up now that I can take advantage of the backstage feature of Limelight. Next up is to try to my hand at [Riak](http://docs.basho.com/riak/latest/) as a datastore for my Tic Tac Toe library. Depending on how well that goes tomorrow will determine if I switch to using PostGres instead. I'm excited though, I've never used a document database before and I'm curious to see how they work, and how querying doc datastores feels. It might turn out to be a horrible mistake for my application, and I'm sure it's way overkill for what I'm doing, but it's not the point really - I'm just looking forward to learning something new. :)
