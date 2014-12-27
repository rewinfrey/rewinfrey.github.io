---
layout: writing
group: Archive
title: "Stocks, Katas, Corey Haines and Abstract Factories"
date: 2013-02-13 17:00:00
categories:
- archive
---

The past two days I've been working on building a more complex stock analysis tool for use with the apprenticeship Rindlet stock challenge. This also involves a web front end for displaying stock activity. I'm calling the stock analyzer BiggieCode$ as a tribute to Biggie Smalls' [Mo Money Mo Problems](http://www.youtube.com/watch?v=xZ4tNmnuMgQ).

The idea is simple. Take all the stocks that exist in the market (for our simulation this means about 15 stocks), and track their prices. Each "tick" of the simulation (about 2 seconds) represents a day. When a sufficient amount of data is collected, BiggieCode$ (acting as a stock broker), generates the day's stock report. The stock report contains the list of stocks and their prices for the day. BiggieCode$ sends this report to an evaluator to evaluate the stocks.

The evaluator is currently doing two things (see note about SRP violation below). It maintains historical data about each stock's performance for the monthy, quarter and year. As more data comes in, the evaluator generates averages for each month, which are then averaged for each quarter, and again averaged for each year when enough data has been accumulated. There are sophisticated stock analysis techniques, but simply maintaining a list of averages allowed me to get an idea of the momentum of a stock in relation to its history, and in relation to the other stocks in the market place.

After the evaluator calculates the averages, it then classifies the stocks into four categories: "solid-buy", "prime-buy", "prime-sell", "solid-sell". Solid buy represents the strongest performing stocks, and solid sell represents the poorest performing stocks. After each stock has been classified, the evaluator bundles this up into its own report, and is sent back to BiggieCode$. The SRP violation is clear here - the evaluator is supposed to classify stocks (meaning evalute them), and I should have a separate class that is dedicated to calculating averages.

BiggieCode$ doesn't know what to do with this data, because all BiggieCode$ knows is how to buy and sell stocks - so BiggieCode$ sends the evaluator report to a recommender. The recommender takes the evaluator report and makes decisions about which stocks to own, and which stocks to sell. This part is kind of complicated, so I'll skip the explanation. The end result is that a recommendation report is sent back to BiggieCode$ that contains a simple list of instructions of what stock and how many shares to buy, and what stock and how many shares to sell. I'm about halfway through writing the recommender.

After I finish the recommender, I'll flush out the web view. I have scaffolding in place provided by Sinatra. The idea is to have specific routes that generate the html for the various data sections of the web view. JavaScript timeout functions will continuously hit those routes in order to update the page via Ajax. These Ajax requests will serve as the drivers to query a BiggieCode$ singleton object, and also remind BiggieCode$ to do his thing on each "tick" of the simulation. All in all, over the weekend and spilling over into the first part of the week I dumped about 40 hours into this project, and have really loved doing it TDD every step of the way. It's very refreshing to know that all the code works - and I took extra time and care to make sure my specs had a good dose of acceptance tests so that things are wired up correctly, too.

Last week Micah asked me to prepare a Kata to present in front of 8th Light. There are many katas to choose from, but I was inspired by Josh Cheek's [StringScanner Kata](http://vimeo.com/29823879) to make up my own kata. Because I've recently completed building my Java Web Server and I'd like to provide the craftsmen and apprentices at 8th Light with something different, I thought it would be interesting to make a kata setting up a simple multi-threaded web server.

Micah also said the kata should communicate an idea, and that everything I do in the kata should reinforce that idea. I've settled on the idea that "small ideas lead to big things." The orientation of this kata is to show that by starting with a few simple tests showing a server socket is bound to a port, that we can generate a multi-threaded web server via TDD using small transformations and refactorings.

I have the kata sketched out, meaning I know what steps I want to make, and how to test each step and the refactorings I want to do along the way. The testing to demonstrate that the server is actually threaded and can handle multiple requests is an interesting one that I will probably change, but currently it involves using a loop to issue 100 cURL commands in rapid fire to the server, who passes it to a very simple Handler that has a sleep function. I time the length of time it takes to complete the process to show that the length of time required to complete 100 cURL requests with the sleep delay using threads is substantially lower than if each request was blocking. I also verify that the response received is what I expect.

I was also lucky today to speak with [Corey Haines](http://coreyhaines.com/) about my server kata idea and get his feedback. He gave me some interesting advice. He said if it were him, he would start with a working Handler and a test to determine if the server can pass a request to the handler and receive the expected response. He said this brings with it the good benefit that my handler is now decoupled from my server - and that I can pass in whatever handler I want to the server when I instantiate the server. This was a new and exciting idea for me I had not considered. Here's Mr. Haine's sketch from the talk this afternoon:

<div style="width: 600px; margin: 20px auto;">
	<img src="http://i.imgur.com/meLG0mT.jpg" />
</div>

Today was also filled with an incredible 15 minute crash-course in the [abstract factory-pattern](http://en.wikipedia.org/wiki/Abstract_factory_pattern) by Josh Cheek. If you're curious what that looks like, Josh posted the code example he used to explain it to me as a [gist](https://gist.github.com/JoshCheek/4950348). Moving from there I'll be able to create a better way of tying together my Ruby tic-tac-toe library with my Java Web Server. I'm looking forward to using the abstract factory pattern to help generate the routes my Java Web Server will use to communicate with a jRuby interface to link up my Ruby Tic Tac Toe library.
