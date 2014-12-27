---
layout: writing
group: Archive
title: "Better Errors"
date: 2012-12-13 17:00:00
categories:
- archive
---

If you're just starting out with Ruby or want to stay in the loop as to what's happening in the Ruby community, [Ruby Weekly](http://rubyweekly.com/) is a must read. Alongside Ruby Weekly is [Ruby Inside](http://www.rubyinside.com/), which is also a good resource. This morning I looked through the newest Ruby Weekly and saw a gem called "[Better Errors](https://github.com/charliesome/better_errors)" that sparked my interest. Lately I've been thinking a lot about how to better display errors based on some conversations with [Josh Cheek](http://www.8thlight.com/our-team/josh-cheek) about a possible project to work on together that would provide more useful stack trace information for the command line. We have a few requirements in mind:

* error output should be color coded
* drop the user in a pry-like console bound to the context in which the error occurred
* parse out a lot of the miscellaneous info that a typical stack trace provides but is not very useful

To my delight, Better Errors does this for Rails. I just dropped the gem into my Gemfile as part of my :development group, ran bundle and everything was configured automatically for an easy to read errors page. I also added the gem [binding_of_caller](https://rubygems.org/gems/binding_of_caller) so that the errors page produced by Better Errors would also provide a live console similar to a pry console. It's pretty amazing how it works, considering that it allows a user to have instant feedback in an easy to read way when a Rails error occurs, while also giving the user the ability to poke around in the context producing the error and check the values of variables or run methods in that context. Awesome!

Here's a screen shot of what it looks like in action:

[<div style="width: 800px; margin: 20px auto;"><img src="http://i.imgur.com/Yieor.png"></div>](http://i.imgur.com/Yieor.png)

I will be using this by default in my Rails applications going forward, considering that it provides the same functionality as pry and is much easier to read than the traditional errors page. This also potentially saves me the additional work flow step of adding `binding.pry` to a controller action where an error is occurring.

[<div style="width: 500px; margin: 20px auto;"><img src="http://i.imgur.com/zXvRx.jpg"></div>](http://i.imgur.com/zXvRx.jpg)
