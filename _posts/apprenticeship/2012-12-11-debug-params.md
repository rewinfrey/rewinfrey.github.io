---
layout: writing
group: Apprenticeship
title: "Debug Params"
description: ""
categories:
- apprenticeship
---

One of the things I really love about [pry](https://github.com/pry/pry) is its ability to drop you in any context in your application and poke around. The instant feedback it provides is super helpful in debugging bits of tricky code without needing to decipher logs or terminal output. If you're new to pry, and want to learn how to utilize it's many many features, craftsman [Josh Cheek](http://www.8thlight.com/our-team/josh-cheek) has created an excellent [screen cast](https://vimeo.com/26391171) explanining pry.

I mention this because today I remembered something I had read in [Michael Hartl's](http://www.michaelhartl.com/) [Ruby On Rails Tutorial](http://ruby.railstutorial.org/) about debugging the params hash. It's a simple little thing we can add to our Application Layout.

    <!DOCTYPE html>
    <html>
    <head>
      <title>Railsttt</title>
      <%= stylesheet_link_tag    "application", :media => "all" %>
      <%= javascript_include_tag "application" %>
      <%= csrf_meta_tags %>
    </head>
    <body>
      <%= yield %>
      <%= debug params if Rails.env == "development" %>
    </body>
    </html>

Here we use `debug params` if our Rails environment is "development". This means for every route our application responds to and renders a page, we see a dump of the params hash at the bottom of the web view. Having this kind of instant feedback about the state of params after hitting a route has been helpful for me in the past when trying to debug some complicated behavior involving multi-part forms.

I had a great conversation with fellow apprentice [Eric Kozlow](http://ekosz.github.com/) in strategizing how my Rails application should talk with my tic tac toe application. Since HTML is a stateless protocol, I was having a hard time seeing a good strategy for how to maintain some kind of state information about an existing game. This is because every new request made to Rails (e.g. a human player submits a move) wipes out any instance variables or objects I have in my controllers. To get around this, Eric offered the strategy of having each player prompt the other player for the next move. I thought about it, and could see the reason why this approach was useful in a stateless context, but ultimately I decided it would be best to save what I needed to know about a game in the database, and then retrieve that data when the next request occurs. I liked this solution the most because it allowed me to also make headway towards completing other user stories that are coming down the pipe, and I was uncomfortable making my players responsible for prompting the next move ([I really didn't want Domo-kun to eat any of my fingers for what was surely to be an SRP violation](http://selfless-singleton.rickwinfrey.com/2012/12/03/building-solid-foundations-of-oop/)). I'm not sure though if this approach is the best strategy, and I'll be really curious to hear Micah's feedback about this, and to also brainstorm other ways of tackling this problem.

Originally when I estimated how long it would take to build the Rails web-interface, I really didn't have any idea. I had never used an external module before with Rails, and I couldn't see clearly at the time how to tackle the problem. In the face of a lot of uncertainty, I estimated conservatively, but today I realized this challenge isn't going to take me very long. Currently my Rails application maintains a cookie for the user's current game, redirects that user back to the game at its last state if the user navigates away from the game, stores necessary game information in a database, and receives moves from an AI when it's the computer player's turn. In order to setup the game, I decided a form would be easiest to deal with and parse out the params. This allows a user to play all four game modes (human vs. computer, computer vs. human, computer vs. computer and human vs. human), while also allowing them to select the level of difficulty for the AI and the type of board they want to play on (3x3, 4x4 or a 3x3x3 board).

When the game setup form is submitted, I have it hit a controller action responsible for determining how to handle move input. In the case of a human player, I simply provide a form for the user to submit containing their desired move. In the case of an AI player, I send a request to the game object, which returns a new board including the AI player's move. This triggers a redirect to a show page, which displays the updated game board to the human player so they can submit their next move. This process repeats until the game is finished. The user is then redirected to the setup form, so they may start a new game if they wish.

In order to facilitate a move from the AI, I decided to add an extra method to my Game class called `next_move`. At this point, I've already determined in my controller that the current player is an AI player, so `next_move` simply sends a `move` message to the AI player. Once the move is returned from the AI player, game marks the board as it normally does, and then returns this updated board back to the controller. The controller then updates this in the database. I found this solution to be somewhat nice, in that it also addresses other user stories I will work on next week related to replaying game history for previously played games. The reason for this was I needed a way to send a single move request to the AI player.

The day concluded with spending some time at a new favorite coffee shop, [Filter](http://www.yelp.com/biz/filter-chicago), that a fellow apprentice, [Alfonzo Rush](http://thefonso.tumblr.com/), introduced me to. I also had fun showing Alfonzo an interesting [Ruby Tic-Tac-Toe quine](http://dame.dyndns.org/misc/rubykaigi2010/) I found as part of a listing of quine's for Japan's 2010 Ruby Kaigi. I'm supposed to give a lightning talk this Friday, so I think it will be fun to talk about the idea of [quines](http://www.nyx.net/~gthompso/quine.htm) and show a couple of quine's made by [Yusuke Endoh](http://mamememo.blogspot.com/). When I first saw some of Yusuke's quines I was completely blown away. I'm currently breaking down his Ruby tic-tac-toe quine to see if I can understand how it works, but it is intentionally written to be obscure and obfuscated and uses some fairly [esoteric](http://www.amazon.co.jp/Ruby%E3%81%A7%E4%BD%9C%E3%82%8B%E5%A5%87%E5%A6%99%E3%81%AA%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0%E8%A8%80%E8%AA%9E-~Esoteric-Language~-%E5%8E%9F-%E6%82%A0/dp/4839927847) aspects of Ruby.
