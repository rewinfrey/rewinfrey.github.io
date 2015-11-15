---
layout: writing
group: Apprenticeship
title: "Chopping Wood and Carrying Water"
description: ""
categories:
- apprenticeship
---

Four months ago, I had the good fortune of visiting 8th Light and meeting some of the craftsmen. What I saw and learned about the company and its culture that day instantly attracted me to the idea of software craftsmenship. Also having previously studied Japanese, I felt an instant affinity towards the Japanese martial-arts language-infused traditions of the company (e.g. Waza, Dojo, code Katas...). Now, it's the end of my first day as a resident apprentice under [Micah Martin](http://www.8thlight.com/our-team/micah-martin), and it is an amazing feeling to be writing my first blog post.

In a conversation this morning with Micah, we talked about chopping wood and carrying water. It's a phrase slightly adapted from "Zen is chopping wood and carrying water." This phrase has many interpretations, but at its essence is the idea that understanding and clarity come about through repetition and focus (or more simply put "Zen is doing ordinary things with joy."). These ideas were on my mind after reading [Uncle Bob's](http://www.8thlight.com/our-team/robert-martin) book [_The Clean Coder_](http://www.amazon.com/Clean-Coder-Conduct-Professional-Programmers/dp/0137081073) over the weekend. Reading the descriptions about how professional programmers engage their craft, the strategies used in communicating deadlines and expectations, along with the anecdotal stories from Uncle Bob's past confirming the utility and benefit of Test Driven Development and Pair Programming, cemented in my mind even more that I feel very fortunate to be an apprentice at 8th Light.

My first task is to redo my Tic Tac Toe program in Ruby (my original implmentation is in JavaScript), and it will also be my first TDD experience. Having read through most of [_The RSpec Book_](http://pragprog.com/book/achbd/the-rspec-book) over the weekend and creating a [list of common expectations](https://gist.github.com/4152978) RSpec conveniently provides, I was thrilled to finally get a good taste of TDD today. To help shore up my TDD deficiency, Micah reviewed the three laws of TDD with me. In _The Clean Coder_, Uncle Bob describes these as:

>1. You are not allowed to write any production code until you have first written a failing unit test.
>2. You are not allowed to write more of a unit test than is sufficient to fail—and not compiling is failing.
>3. You are not allowed to write more production code that is sufficient to pass the currently failing unit test.

At first I was worried that getting aquainted with the TDD process would feel too much like relearning how to do something my mind impatiently already knew how to do - yet I was thrilled with the feedback loop created as a result of the short cycles of [red, green, refactor](http://www.jamesshore.com/Blog/Red-Green-Refactor.html). I was struck by the noticable cleanness of the code the TDD cycle was propelling me to write. My classes and methods were consistently shorter and respected the [Single Responsbility Principle](http://en.wikipedia.org/wiki/Single_responsibility_principle) with less refactoring required. It also made refactoring an enjoyable experience knowing that if a change in implementation caused something to break, I had my tests to notify me. This repetitive cycle of write a failing test, write just enough code to make the test pass, refactor the code, repeat - reminded me again of Chopping Wood and Carrying Water. Although with TDD, the benefit is well understood from the onset, and my hands are blister and splinter free.

I've spent the past several months reading 8th Light's apprentices' blogs - and I know I have big shoes to fill. I have so much to learn, but I hope this blog will help someone get inspired to take their craft to the next level - just as the many excellent blog posts from past and present apprentices have inspired me.
