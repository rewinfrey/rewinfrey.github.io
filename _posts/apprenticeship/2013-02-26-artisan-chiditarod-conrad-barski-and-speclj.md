---
layout: writing
group: Apprenticeship
title: "Artisan, Chiditarod, Conrad Barski and Speclj"
description: ""
categories:
- apprenticeship
---

The past couple of weeks have been wonderfully intense. I was able to complete my [Java Web Server](https://github.com/rewinfrey/JavaWebServer), make my [Ruby Tic Tac Toe](https://github.com/rewinfrey/ruby-ttt) into a gem, and build a [Web Interface](https://github.com/rewinfrey/JavaRubyTTTInterface) that combined my Java Server as a jar and my Ruby Tic Tac Toe library as a gem that allows you to play Tic Tac Toe via JRuby. There was a lot of learning, late nights, and many cups of coffee -- but the experience was exactly why I signed up for an apprenticeship at 8th Light -- it's helping me become a better developer more quickly and better with the help of my mentor and other craftsmen than I would be able to on my own.

Along the way, I've received a lot of amazing help. Micah showed me an elegant design pattern for the Java Server that still leaves me feeling in love with that code. Craftsmen Wai Lee helped me track down a strange bug in my tests that was causing the tests to fail about 10% of the time (the missing piece for me was adding a [join()](http://docs.oracle.com/javase/1.5.0/docs/api/java/lang/Thread.html) method to the thread containing the server). I've also greatly benefited from many conversations with Josh Cheek about object boundaries and OOP design.

And then there are days like today, where I admittedly do not achieve much progress towards the stories I've committed to complete for the next iteration, but the learning and experiences are wonderful.

Today started with an interesting puzzle [Ryan Verner](http://ryanverner.com/) was experiencing after upgrading his version of RVM. Something in his environment was altered and was preventing Jasmine specs for an internal 8th Light application from passing when they should. We tried a lot of things, including tracing through the stack trace to determine where the error was generating and why. We'd fix one thing but another problem would arise. It was a good lesson in the fragility of environments, and how to switch one's thinking from problem solver to sleuth.

Next Kelly asked for some help with some specs that were troubling her, and we walked through the relevant parts of her tic tac toe application. Structuring code to make it easy to test is not an easy thing to learn - and something I work on improving every time I write code - but having been through tic tac toe, we were able to work out a plan for how to handle the flow control of her Tic Tac Toe application so that it will be easier to test.

From there I joined [Ryan Verner](http://ryanverner.com/) for a GeekFest talk at Groupon given by [Conrad Barski](http://lisperati.com/) about Lisp, Clojure and Haskell. That was very cool, and even though a good chunk of his examples were over my head, I did walk away with a keener sense of what makes each langauge stand apart from the others and what their relative strengths are.

After braving the snow, I returned to help [Rylan Dirksen](http://www.rylandirksen.com/) out with the [Chiditarod app](http://www.chiditarod.org/) 8th Light is building for the actual race day. Together we helped abstract out some of the authorization logic into a module that could be mixed into the base application class. Weighing on my mind was Josh Cheek's [blog post about modules](http://blog.8thlight.com/josh-cheek/2012/02/03/modules-called-they-want-their-integrity-back.html) as we included it - but I feel justified with the pollution from the inclusion of the module by how frequently it is called throughout the application. It also allowed the authorization logic code in the controller classes to read fairly nicely with clear intent.

While working with Rylan, craftsman [Stephanie Briones](http://www.8thlight.com/our-team/stephanie-briones) was having a problem getting the Rails asset-pipeline resources to clear its cache. So we updated the configuration settings, and also removed the cached files so she and resident apprentice [Adam Kaplan](http://adamkaplandesign.com/) could redesign the 8th Light university site.

These experiences today were so satisfying and rewarding. It always feels good to help someone out, and as the old saying goes - the teacher always learns more than the student. I really appreciate the opportunity to be a part of 8th Light as an apprentice, and to have experiences like today that grant everyone involved with an environment that fosters growth and craftsmanship.

Now I will devote the rest of the evening to learning [Speclj](https://github.com/slagyr/speclj), a TDD/BDD framework for testing Clojure code. I'm excited to learn this framework, not only because it is written by my mentor, [Micah Martin](http://www.8thlight.com/our-team/micah-martin), but also because I am excited to learn how to start testing functional code.
