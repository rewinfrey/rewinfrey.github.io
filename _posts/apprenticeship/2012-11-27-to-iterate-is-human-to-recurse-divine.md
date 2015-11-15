---
layout: writing
group: Apprenticeship
title: "To Iterate Is Human, To Recurse Divine"
description: ""
categories:
- apprenticeship
---

[L Peter Deutsch](http://en.wikipedia.org/wiki/L_Peter_Deutsch) originally penned the title of this post. I've often heard people describe understanding recursion as one of those "got it" moments, when the universe opened its secret stores of knowledge and gifted the mind of a burgeoning developer with a very powerful tool. For me, recursion has always been hard. Each time I'm able to peer more into its murky depths, I am humbled to see how little I feel like I really appreciate and understand its power and elegance. I liken it to learning that one can be aware of awareness being aware of awareness.

So in order to help flex that recursive muscle in my brain, I sat down this morning to tackle implementing a recursive [Minimax](http://en.wikipedia.org/wiki/Minimax#Minimax_algorithm_with_alternate_moves) algorithm to serve as the AI for an unbeatable Tic Tac Toe game. I spent the previous night reading an older artifical intelligence book a friend gave me, all the wikipedia articles I could find about Minimax, [Negamax](http://en.wikipedia.org/wiki/Negamax), [Negascout](http://en.wikipedia.org/wiki/Negascout) and I even ended up reading about [MTD-f](http://en.wikipedia.org/wiki/MTD-f), a variant of the Minimax algorithm family used today for evaluating chess game trees.

But things weren't clicking. Several questions were coming to mind as I read over descriptions and psuedocode. After thinking more about where my confusion was stemming from, I realized I didn't have a sufficiently clear mental model of how a recursive Minimax solution accounted for intermediate game states. I kept thinking - don't I need to associate intermediate game states in the game tree created by the recursive calls somehow? And how in the world do I do that? My mind started dreaming up crazy data structures - my tell-tell sign that I surely had missed something.

As if my mind wanted to taunt me, previous examples of recursion I had seen kept flashing in my head. All of them shared a similar striking feature:  elegance.

One of the first recursive functions I ever learned was calculating the [Fibonnaci Numbers](http://en.wikipedia.org/wiki/Fibonacci_number):

{% highlight ruby linenos %}
def fib(n)
  n < 2 ? n : fib(n - 1) + fib(n - 2)
end
{% endhighlight %}

At one level of thinking, recursion is pretty simple. Unless we want the recursive method to infinitely call itself, we need a way to tell the method to return. This represents our base case. In the above Fibonnaci method, the base case is n < 2. If n < 2, we simply return n, and stop recursively calling fib(n). The base case is always dependent on the context of the problem we're solving.

In the case of Minimax applied to Tic Tac Toe, we aren't generating a sequence of numbers, but instead a [game tree](http://www.ocf.berkeley.edu/~yosenl/extras/alphabeta/alphabeta.html) of possible game states. For my implementation this means creating a separate game tree for each possible next move using a [depth-first search strategy](http://en.wikipedia.org/wiki/Depth-first_search). In this context, my base case is essentially figuring out if any more moves can be made.

So far so good, but I also have to keep track of score so I can determine what move is best to make. Well, determining how to evaluate the board can involve some complicated heuristics, but really all we need is a simple evaluation of the final board state after constructing our game trees. This is when our base case is satisfied: there are no more moves available. If the game results in me winning, that's good, so it's +1. If it's a loss for me, that's bad, so that's -1. If the game's final state is a draw, it's not really good or bad, so it's 0.

Now I have a score and I'm ready to return that value. Since we've been constructing the game tree recursively by calling our Minimax method again if there are more moves to make, the [call stack](http://en.wikipedia.org/wiki/Call_stack) is probably several layers deep by the time we satisfy the base case. For games like Tic Tac Toe that have relatively small game trees, this is probably fine. If we consider a game like chess, however, the number of possible next game states as a function of possible game moves for a given game state is a very very large number. At this time though, we're not programming a chess AI, so we can forget that, and figure out how we translate the score into a move.

Since I've satisfied the base case, and have returned the score, I want that score to return all the way back through my call stack. Think of it like walking backwards. I made this move, then this move, and so on, until I couldn't make any more moves - but the important question is where did I start from? And this is the question that racked my brain for most of the morning, until I spoke with [Ryan Verner](http://www.ryanverner.com/), another 8th Light apprentice. In talking about recursion with him, I was finally able to see what I needed to do in order to walk back through the call stack so I could translate a score into a move. I don't want to spoil the fun for someone working on their own Minimax implementation of Tic Tac Toe, so I'll leave that to the reader to discover.

When I finally saw how to handle the return value and translate it into a move on the board my questions were answered. It was one of those "got it" moments, but sadly, I did not experience the universe opening up its secret stores of knowledge. Understanding the question of how to handle the return value turned the Minimax into a straightforward problem, rather than a mysterious recursive problem. This also gave me the footing I needed to accomplish another personal goal: explore [alpha / beta pruning](http://en.wikipedia.org/wiki/Alpha-beta_pruning) and use it to create a more efficient implementation. Today was great not only for getting a small taste of the divinity of recursion, nor because of alpha and beta values, but mainly because I got to meet the other 8th Light apprentices for the first time, play a 5 0 game of chess with [Paul Pagel](http://www.8thlight.com/our-team/paul-pagel), and also pair with him on an application he's working on to help with scheduling. All of this leaves me feeling thankful to be here, and thankful for the very smart people around me.
