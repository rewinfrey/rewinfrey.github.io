---
layout: writing
group: Apprenticeship
title: "Mixing Java And Ruby"
description: ""
categories:
- apprenticeship
---

[JRuby](http://jruby.org/) is Ruby implemented in Java. This means that it is capable of accessing Java jars and classes just like a vanilla Java module or project with Ruby syntax. From Ruby land, I can instantiate a new object from a Java class. Or, included as its own jar in an existing Java project or module, the JRuby ScriptingContainer class allows you to make calls to Ruby. What this means is very nice interoperability between the two languages and their worlds. The tremendemous amount of work this required by the JRuby team is highly praisworthy.

But you might be wondering why use JRuby? There are lots of reasons, but let's look at the two most common.

#### Ruby Allows For Easy Extension
Maybe you have some Java code that's pretty slick, runs fast because it rides the JVM, and you want to extend it. Ruby allows for generally faster development time compared with Java because of its dynamic typing. JRuby will let you levarage your core business application written in Java - but extended for ease and speed with Ruby. If you're worried about performance loss due to Ruby - you should know that JRuby rides the JVM just the same as a standard Java application. In fact, JRuby precompiles Ruby files into Java byetcode as they are needed. This means there is no interpreter loss aside for compilation time. What you have is an end product that is written partially in Ruby, but runs as native Java code. This is amazing.

#### Java Has Powerful Libraries
You have an idea, but can't find an existing Ruby library that handles parts of your logic that you're not interested in writing (those parts aren't the meat of the idea). Instead you search around for other languages to see if a library exists, and sure enough a Java jar exists matching your use case and needs. Don't fret, you can use your beloved Ruby and simply require the jar, and you'll be able to instantiate an object from Java and treat it like a Ruby object.

For a great jump into JRuby, you can't go wrong with [Using JRuby](http://pragprog.com/book/jruby/using-jruby) published as part of the [Pragmatic Bookshelf](http://pragprog.com/). It's written by the JRuby core team:

* [Charles Oliver Nutter](http://blog.headius.com/)
* [Thomas Enebo](http://blog.enebo.com/)
* [Nick Sieger](http://blog.nicksieger.com/)
* [Ola Bini](http://olabini.com/blog/) - a Chicago native
