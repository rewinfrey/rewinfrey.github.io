---
layout: writing
group: Archive
title: "LimeLight Configuration"
date: 2012-12-17 17:00:00
categoies:
- archive
---

Today I met with Micah at the Libertyville office and we had our second iteration meeting. Apart from Waza, which happens on Friday afternoons and is open-coding, I think the iteration planning meetings are my favorite part of the week. I really enjoy getting the feedback and suggestions from Micah, especially about those parts of my code that I can see are smelly, but where I'm not able to see just yet how to make that code great. It's amazing how quickly Micah can look at some code and instantly see what's wrong with it, or what's good about it.

I also enjoy iteration planning meetings because it means a new round of user stories or requirements to complete for the next week. It sets the tone of what I'll do for the rest of the week, and it also gives me an idea of what I'll be learning. This week, the new big thing for me to tackle is using [LimeLight](http://limelight.8thlight.com/), a jRuby library Micah built that provides a GUI for Ruby code. I'm excited about using LimeLight, and because I was able to knock out two user stories today, I've given myself a good amount of time to really explore LimeLight and get my head wrapped around it. LimeLight uses an extended theater production metaphor, including it's [name](http://www.britannica.com/EBchecked/topic/341313/limelight). If you're curious about how LimeLight works, Micah's [screen cast](http://limelight.8thlight.com/screencasts/CalculatorProductIn10min.mov) is a great introduction.

At the moment the Limelight library exists as two versions. I wasn't able to get my computer's environment configured properly to use the newest version, so instead I'm using the older version. Getting the older version set up and configured was a bit confusing, so I thought I'd post the configuration settings here for future reference for other apprentices who will most likely do their own LimeLight production at some point.

Note: this is for LimeLight version 0.5.5:

First download [limelight_docs.llp](https://github.com/slagyr/limelight/downloads)

    $ rvm install jruby-1.6.8

    $ rvm use jruby-1.6.8

    $ gem install limelight -v 0.5.5

    $ limelight open limelight_docs.llp

And you'll be set!
