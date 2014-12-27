---
layout: writing
group: Archive
title: "Mocking Sockets"
date: 2013-02-05 17:00:00
categories:
- archive
---

Based on the title of this post, you would be correct in thinking I'm going to talk about how to mock sockets. In a way I am, but I'm not actually going to mock a Socket. Instead, I'm going to break up that Socket into the two things I care about (in terms of my Java server), and mock those. What are they? The Socket's input stream buffer and output stream buffer.

It took me awhile to realize that Sockets aren't real. They're not even objects. We can't really describe them in physical terms, but we can use useful metaphors like pipes or tubes. When I realized that a Socket is a *state* of connection between two endpoints, rather than an *object* bridging two endpoints, I understood why mocking sockets is not a trivial task.

Originally I wanted to make a MockSocket class. It would on initialization override the existing getOutputStream() and getInputStream() methods so that I could supply my own stream objects. My thinking was I could pass the request socket through my server application and access the input stream or the output stream when needed. I thought it was certainly possible to mock this behavior out for the specific contexts I would be passing sockets to in my server, but there was a fundamental piece of the puzzle I wasn't seeing.

Sockets aren't things. They describe a connection between two endpoints. In between those two endpoints is data that is being streamed via an input or output stream. At any give instant the input stream and output stream could have data or not. It's impossible to know what will be in an output or input stream without looking at the traffic at the network layer. However we can send bytes through the streams and check to make sure we get the same bytes out on the other side of the socket. This makes mocking sockets very tough, and ultimately I realized that my thinking of sockets in terms of traditional object behavior was wildly inaccurate. I was going to have to find another way.

This propelled me to think about how to deconstruct what I wanted. I wanted a socket, but what did I *really* want? I only wanted the input stream and the output stream from the Socket. I didn't need anything else for my server to function. I also realized that passing the input stream and the output stream through my server would be far more efficient and less code duplication. There would be no need to get the input stream from the socket in my router, and then get it again in my request parser.

But the most important thing was that by deconstructing what I needed from a Socket made it possible to test what I wanted the various parts of my server to do. I could preload the input or output streams with byte arrays and drop them into specific contexts and verify the router methods did what I wanted, or my parser was correctly deciphering the request line becuase I could control exactly how it was received by the parser. I modeled everything as closely as possible to how the HTTP headers would be received by my server.

Once I had overcome the hurdle of being able to easily establish *context* - the tests practically wrote themselves. I did have to get creative in a few parts and learn some new aspects of the Java core library, but in the end I felt like the code I was able to create was clean, had clear and distinct object boundaries that prevented SOLID violations.

I'm looking forward to the next round of challenges which involves linking my Tic Tac Toe library and serving it using my Java server. I'll get to test how well I can extend my server without modifying it (OCP), and I will also have to utilzie the Liskov Substitution Principle to register routes for the game logic on my server.

The take home points for today's post are:

1. When mocking or establishing context becomes difficult in our tests, this is usually a sign that our objects or contexts are too busy or complex. Break objects apart into the bits we need - it's easier to mock subparts than entire complex objects.

2. Breaking apart objects also reveals more clearly what we need for a given context. This reveals greater intention in our tests.

3. By providing our methods only what we need, rather than passing through large, complex objects, we help maintain leaner methods that know only what they absolutely need to know.

4. In general the more primitive the data types we work with are, the easier it is to abstract our methods and promote greater reusability. Think programming to interfaces, but instead programming to data types (the more primitive the better).
