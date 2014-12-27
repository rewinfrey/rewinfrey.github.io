---
layout: writing
group: Archive
title: "ServerSockets vs Sockets"
date: 2013-01-24 17:00:00
categories:
- archive
---

[ServerSockets](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/ServerSocket.html) and [Sockets](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/Socket.html) are classes found in the [java.net package](http://docs.oracle.com/javase/1.5.0/docs/api/java/net/package-summary.html). They both implement the [SocketOptions interface](http://docs.oracle.com/javase/1.4.2/docs/api/java/net/SocketOptions.html) and extend [Object](http://docs.oracle.com/javase/1.4.2/docs/api/java/lang/Object.html). ServerSocket and Socket both inherit from the abstract class [SocketImpl](http://docs.oracle.com/javase/1.4.2/docs/api/java/net/SocketImpl.html), which is responsible for implementing the SocketOptions interface. What this means practically is that ServerSocket and Socket are essentially the same class, yet there is a key difference in their expected behavior.

From the ServerSocket documentation:
> This class implements server sockets. A server socket waits for requests to come in over the network. It performs some operation based on that request, and then possibly returns a result to the requester.

ServerSocket is what makes it possible for a socket to be bound to a port and listen for any connection requests. If you enjoyed [yesterday's post about a socket story](http://selfless-singleton.rickwinfrey.com/2013/01/23/a-sockets-story/), a ServerSocket represents the bird, transmitting the alert to the girl that a new message was received at her port (or mailbox).

Regular sockets are more simple than ServerSockets in that they only make requests and receive responses. They are bound to ports, but cannot listen indefinitely for incoming requests. From the Socket documentation:

>This class implements client sockets (also called just "sockets"). A socket is an endpoint for communication between two machines.

In the process of building a Java webserver - it's important to know this distinction - or else it will be very difficult to get past the initialization of the server!

If you're curious about sockets, and what you can do with them and how to program with them, this book has been wonderful to read: [Working With TCP Sockets](http://workingwithtcpsockets.com/) by Jesse Storimer. He also has another book all about [Working With Unix Processes](http://workingwithunixprocesses.com/) that filled in lots of gaps I didn't know I even had about some of the fundamentals of Unix.
