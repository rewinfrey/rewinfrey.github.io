---
layout: writing
group: Archive
title: "Throw It In Another Thread"
date: 2013-01-25 17:00:00
categories:
- archive
---

I find testing to be a very difficult task to do well. I also find testing to be probably the best programming practice I've ever been exposed to. That's why I've got a special date with Josh Cheek to go over some ideas about testing this weekend, so I can hopefully build a better mental model of how to test more effectively and efficiently.

But, today I found myself in a situation where I had no idea how to test the initialization my Java HTTP server. The problem was that starting the web server meant the ServerSocket sat in an infinite loop waiting for an incoming request. If I tried to test this directly, the test would be swallowed by the infinite loop.

What was the solution? I was already spinning off incoming requests into their own threads, so why not put the server process in its own thread and test the state of the server thread? That was a great suggestion by Josh Cheek, and I had it implemented in a couple of minutes. In fact, running processes in threads is fairly simple in Java thanks to the [Runnable](http://docs.oracle.com/javase/1.4.2/docs/api/java/lang/Runnable.html) interface.

I then had tests passing verifying the threads were alive, and active - and I felt like the indirect test was sufficient for verifying the server initialization code worked. Java also requires us to do extensive exception handling - and my code throws the specific IOException if the ServerSocket is not initialized correctly, serving as another form of verification that the ServerSocket was in the very least initialized without producing an exception.

I've realized for awhile now that testing is an art of its own - one I am working hard at so I don't feel like such a dufus when I want to test something a little more complex than a typical method. I realize that my mental model of testing is limited to one month of experience, the RSpec book, and many hours of struggling to devise strategies for testing well. That leaves a lot of room for improvement.
