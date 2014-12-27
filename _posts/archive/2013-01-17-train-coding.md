---
layout: writing
group: Archive
title: "Train Coding"
date: 2013-01-17 17:00:00
categories:
- archive
---

Going to the Libertyville office is a 70 minute train ride one way. It takes me about 20 minutes to walk to the train station from my apartment, so round trip total time is 3 hours. This might seem like a substantial amount of time to devote to commuting, but aside for the time spent walking, I get to enjoy train coding.

<div style="margin: 20px auto; width: 500px;">
  <img src="http://i.imgur.com/LQOlZ.jpg?1" />
</div>

Most of the time I try to write my blog on the train ride home. It gives me a cap on how long to spend on a post, so I don't over do it. In the mornings the train ride in gives me a chance to warm up my brain. I've started working on the bowling game kata, and I'll use the train ride in as a way to practice that.

I'm doing the bowling game kata in Java, so today I found myself getting a lot more comfortable with the [IntelliJ Idea IDE](http://www.jetbrains.com/idea/). I wish my Java instructor had told us about this IDE when I took Java in college - it puts Eclipse or NetBeans to shame. The only part of using Idea I'm not crazy about is the key bindings are so different than what I'm used to in Vim and a little different than TextMate. [Craig Demyanovich](http://www.8thlight.com/our-team/craig-demyanovich) told me Idea offers a Vim key-bindings plugin. I've downloaded it, but am having some trouble getting it to install correctly. I'll play with it over the weekend.

Today there wasn't one thing that stood out to me as being a great new insight or answer to a problem. Today was a day I got to get a lot of code time in, refactored many of the mistakes I talked about in [yesterday's post](http://selfless-singleton.rickwinfrey.com/2013/01/16/owning-mistakes/), and created some new abstractions to better define the responsibility of some objects. A strange test condition gave me the idea to instantiate a class from inside its own instance, and I played around with that idea a little in Ruby to see how it would work. The first time I did it, I inadvertently setup an infinite loop - and saw "stack level too deep". That reminded me of how I wish the "stack level too deep" error message was a little more nuanced, because it's not clear if it's a stack overflow due to an infinite loop (like a class instantiating itself over and over again), or if it's because the process actually requires too much memory to complete the task.

Tomorrow is Friday! And that means [8th Light University](http://university.8thlight.com/) and Waza. I'm really looking forward to hearing Micah's talk about the "Absolute Priority Premise," and in general getting to work towards finishing the tic tac toe library.
