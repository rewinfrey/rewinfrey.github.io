---
layout: writing
group: Archive
title: "Owning Mistakes"
date: 2013-01-16 17:00:00
categories:
- archive
---

It was the best of days of the apprenticeship because I got to pair with Micah.

First we worked on solving a strange issue with my Limelight production not loading all the files it needed. Several things looked right - and it seemed like things were being loaded correctly - which made the stack trace more baffling. In the end, it was just a simple matter of requiring "rubygems" - something that in using Ruby version 1.9.3 I take for granted - but in jRuby version 1.6.6 - is not something that can be optionally omitted. What I appreciated about Micah's approach was his patience, and having the persistence to follow the stack trace until the root of the problem could be inferred.

That gave way to an overall code review of my tic tac toe library.

There were problems with code duplication, a command-query violation, some poorly named methods, some ill-defined classes, and a few places where I allowed SRP violations to creep in (e.g. mixing business logic into controller actions). These are all decisions I can recall making in the interest of saving time. Well, I was wrong. There were good parts of the code too, but the real heart of deliberate learning is acknowledging where one's deficiencies are, and working towards shoring them up consistently everyday. What I appreciated about Micah's approach with the mistakes I made was he asked me why? My 5th grade teacher did that to us whenever we made a mistake, and I learned very quickly what it meant to "own" one's mistake. Today, I had to own my mistakes, and when I own my mistakes, there is no reason that can justify a sloppy decision here or lax code quality there. Owning mistakes for me means replacing any reason trying to justify the mistake with the determination to never make the same mistake again.

In reflecting on the mistakes we talked about today I realized how much I've been focused on what's next. In doing so, I let some discipline slip, and today served as a good reminder to refactor and check my code quality often - especially when I'm feeling in a hurry - because that's when it's easiest to make mistakes. It's not that I'm afraid Micah will turn into Hulk Hogan and smash a desk on my head, but as my mentor giving his time and energy to help me be a better programmer, I naturally want to show him my best possible effort. I don't feel like I accomplished that today, which is personally disappointing, but also makes me more motivated than ever to demonstrate what I can do and to simply not stop trying to tap every ounce of potential I can.

Ideally, I'd like my mentor to come away from our meetings with even more satisfaction than I feel from learning something new - in that I'm able to demonstrate the lessons learned from him back to him so that he can see his time was not for nil. I see it as a guiding principle for repaying a teacher for their time.

I think Micah is a craftsman that lives by the principles he teaches. He has the ability to elicit from others the overarching desire to be better - not just at programming - but  at life. That's a rare type of person to meet, and even more rare to get to learn from them and benefit from their teaching.

Sometimes at 8th Light I wonder if what I'm really learning is how to be a better human - how to think better - and how to engage with others more effectively, and with more intention and empathy. I feel so fortunate to be a part of 8th Light as an apprentice, and especially to work with Micah as my mentor. There's really no other place like it in the world.
