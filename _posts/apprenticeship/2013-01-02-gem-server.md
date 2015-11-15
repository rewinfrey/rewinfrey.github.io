---
layout: writing
group: Apprenticeship
title: "Gem Server"
description: ""
categories:
- apprenticeship
---

TLDR >> So here's the real point of this long-winded blog post: [Gem Server](http://docs.rubygems.org/read/chapter/18)

If you want to see the RDocs for the gems installed on your system, simply entering the following command in the terminal:

    $ gem server

Will spin up a process that serves the RDocs for all gems installed on your machine. If you're using RVM or rbenv, you'll want to make sure you first switch to the version of Ruby to which the RDoc info for a gem is associated.

---

Happy New Year! It's the first post of the year. The break was great - really wonderful to see the family and relax. Highlights were seeing [The Hobbit](http://www.thehobbit.com/), explaining how an HTTP server worked to my brother, and other things I probably shouldn't mention on this blog related to whiskey consumption and eating way too much food. Enough of that though, it's time to get back to work!

This week I'm working on completing my user stories related to the Limelight interface for my Ruby Tic Tac Toe program. I'm finding the process to be a little tedious - having to start up the JVM whenever I want to test a new view in the Limelight interface isn't quite as fast and pleasant as working in a framework like Sinatra or Rails. I do enjoy the theater metaphors and they help my mind conceptualize the design of the interface in a new and interesting way. This process has reminded me of a learning process I learned while studying Japanese.

When learning something new it's often easiest to relate a new concept to older concepts or frameworks we've learned in the past. In the case of learning a langugage, like Japanese, most people tend to translate what they hear or read back into English to understand the meaning. When learning a new programming language, it's also common to relate the new language back to a previously learned language. Such is also true for frameworks. I originally learned [MVC](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) via PHP's [Codeigniter](http://ellislab.com/codeigniter) framework. When I first learned Rails, I kept translating the Rails "convention over configuration" back to things I understood in Codeigniter.

The problem with this learning style is that it automatically limits what we are able to see and appreciate with the new concept, language or framework. We might try to force fit old ideas we are already comfortable with onto a new idea that is more nuanced or subtle, or contains a good deal more flexibility than our old idea contains. At some point we have to stop translating and relating, and accepting and adopting the new concept, language or framework on its merits. When that transition point occurs, that is when the actualization of knowledge for me happens. It's at that moment when I feel like my mental fluency in whatever I'm learning is sufficient to begin to think entirely in that new concept, language or framework.

This time around with Limelight, mostly because I really enjoyed the theater metaphors, I opted to not try to relate it to anything and just think about it entirely as its own conceptual system. In doing so it's allowed me a greater flexibility in thinking about how to approach Limelight, and also to play with its naming conventions based on theater references to extend Limelight to suit my purposes. There are still a lot of aspects about Limelight that I don't have a grasp on, but I'm able to use Limelight well enough for the purpose of extending my Tic Tac Toe application and I feel like that is sufficient for this time.

Limelight documentation is kind of interesting to figure out. I have the [Limelight docs production](https://github.com/slagyr/limelight/downloads) requiring Limelight gem version 0.5.5 because I still have not been successful in opening the Limelight docs production with the newest gem version 0.6.19. Not to confuse matters, but most people told me developing with version 0.6.19 was nicer than version 0.5.5, and so I'm reading the old docs while developing with the new version of the library. As a curious side note, this requires using an older version of jRuby (1.6.6) with the new Limelight gem version 0.6.19 and a newer version of jRuby (1.6.8) with the old Limelight gem version 0.5.5 to look at the doc production.

However we learn though, I personally find it very helpful to see a list. When learning a new language, I like to see lists of data types the language natively supports, and lists of its core library classes. Like most people, I realize this is because my brain learns new information more rapidly when it's well-organized. I prefer books over blog posts, unless it's a question that I can find an answer for on StackOverflow. And that was my big struggle with Limelight. It wasn't the case that documentation is not present, but I wasn't finding a list of all classes and methods in the library. I didn't have [Pry](http://pryrepl.org/) to peek around because it's jRuby. The absence of a list left my mind constantly wondering not about "what is possible with this library?", but "how can I find out what is possible?".

<div style="text-align: center;">
  <br />
  <br />
...but Limelight is a Gem...and Gems have RDocs...
</div>

[<div style="width: 500px; margin: 20px auto 0 auto;"><img src="http://i.imgur.com/t21Kk.jpg" /></div>](http://i.imgur.com/t21Kk.jpg)

<div style="text-align: center;">
  <em>
  see Gem Server info above
  </em>
  <br />
  <br />
</div>
The take-home point is, if you're a list-learner like me, and are new to Limelight, check out Limelight's RDocs. They're incredibly helpful, and they answered many of my questions about what is possible to do with the library.
