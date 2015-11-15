---
layout: writing
group: Apprenticeship
title: "What is Quality?"
description: ""
categories:
- apprenticeship
---

For [8th Light University](university.8thlight.com) today, Micah gave a talk about what he calls the "Absolute Priority Premise." This idea is based on [Uncle Bob's Transformation Priority Premise](http://cleancoder.posterous.com/the-transformation-priority-premise). If you're unfamiliar with TPP, the goal is to try to identify a generalization or rule we can derive about how to best transform our code. Uncle Bob describes how certain transformations are heavier than others (e.g. assigning some literal to a variable is a less heavy transformation than adding in a conditional branch to a method), and that heavier transformations ought to be avoided when a lighter transformation can be used instead. Uncle Bob also suggests that the process of TDD, when done while also considering the weight of transformations we may add to our application, can help us write code that is consistently less heavy. Code that is less heavy is considered to be better - although the specifics of context and rules about how to quantify weight of transformations are both things Uncle Bob says he is unsure about and remain open questions. (at least, as far as the blog post linked to is concerned)

Micah's talk builds on the ideas of TPP by first asking the question "what is quality?". For anyone familiar with *Zen and the Art of Motorcycle Maintenance*, you know this question of "quality" may drive some insane, but for others, to define "quality" is actually the process of defining experience in terms of its romantic qualities (or unquantifiable qualities) and also defining experience in terms of its technical qualities (or quantifiable qualities). Micah used the terms "dynamic" to describe the unquantifiable domain of experience and the term "static" to describe the quantifiable, objective, fact-based domain of experience. Considering this framing of the question of "quality", Micah's "Absolute Priority Premise" asks the question - can we identify a "static" system of code analysis based on the transformations defined by TPP?

Throughout the talk Micah presented slides of code examples to the audience and a few selected volunteers. Each slide contained two code samples placed side by side implying a comparison. The volunteers were asked to evaluate which of the two code samples was of "higher" quality. Micah would ask the volunteer for the rational they used in determining higher quality. Interestingly the majority of answers were based on "dynamic" qualities of the code (i.e. methods are too long, too dense, hard to read, don't understand what the code is trying to do), rather than "static" qualities (i.e. this code is bad because it mutates the original list, several nested if statements increase the stack size because of branching, overuse of more expensive CPU processes when less expensive processes could be used). Micah had anticipated that this would happen, and finished the talk by asking how do we take these dynamic qualities we identify as being good, or bad, and generalize them as static definitions? We will have to wait until the second session (in two weeks), to find out if it's even possible to do what the question is suggesting - and if so, how?

I was also lucky to pair with craftsman [Michael Baker](http://www.8thlight.com/our-team/michael-baker) on a Haskell application he is writing. Because I know close to nothing about Haskell, Michael gave me some high level explanations about what is happening with the code that clued me in a little about how to think in Haskell. We also spent some time talking about design and structure of my tic tac toe library, and Michael gave me a few of his guidelines he uses when designing an application. I particularly like an idea I got from that conversation about intermediate classes not persisting objects that the client and the library use. Instead, the intermediate layer is just a caller and receiver - and transports whatever objects it needs to when invoking methods.

I learned a lot this week. I also discovered the book "I Am A Strange Loop" by Douglas Hofstadter, which I am very excited to read - after the apprenticeship. After talking with Michael about Haskell and seeing a few of its syntactical peculiarities, I'm looking forward to diving into it when time is more abundant. For now though, I'm enjoying Vim keybindings in IntelliJ and practicing the bowling game kata while completing the tic tac toe library.