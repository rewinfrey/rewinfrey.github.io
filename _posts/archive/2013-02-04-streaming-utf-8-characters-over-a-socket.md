---
layout: writing
group: Archive
title: "Streaming UTF 8 Characters Over A Socket"
date: 2013-02-04 17:00:00
categories:
- archive
---

I've been working on building a Java web server from scratch. All that means is I'm not using any of the Http libraries Java provides in its newer SDK's, and instead talking with ServerSockets and Sockets directly. It's a fun challenge with many details to consider. One such detail is how to stream Japanese character strings via a Socket?

I'm kind of kooky and wanted my server to display a 404 not found error page in Japanese. Because I want my server to be runnable on any platform with a JVM, and also be able to serve the 404 page in Japanese on any platform, I need to generate the 404 page html on the fly. What this ultimately means is that I'm stuck using Java's String classes to contain the Japanese characters I want to send over a Socket, and that created my problem.

Transmitting Japanese characters requires me to write those characters as bytes encoded as UTF-8 characters. This is a problem because the String Class [default character encoding is UTF-16](http://docs.oracle.com/javase/1.5.0/docs/api/java/lang/String.html) (rather than UTF-8). I needed some way of getting a string to be converted into UTF-8 when writing to a Socket's Output Stream.

Java offers a few different ways of writing to a Socket's [Output Stream](http://docs.oracle.com/javase/1.4.2/docs/api/java/io/OutputStream.html). The important thing to remember is that when data is transferred via a socket, it's transferred as binary. That means any character or text we push through the Socket must first be converted to binary. For the majority of the Socket Output Stream writing my server does, I can simply use [DataOutputStream](http://docs.oracle.com/javase/1.4.2/docs/api/java/io/DataOutputStream.html) which provides an easy to use interface for writing either Byte arrays or Strings to the Output Stream of a Socket. However, it does not let you change the encoding type - a big drawback for me.

But then I stumbled on the [OutputStreamWriter](http://docs.oracle.com/javase/1.5.0/docs/api/java/io/OutputStreamWriter.html) class. The opening line of its Java Docs states:

> An OutputStreamWriter is a bridge from character streams to byte streams: Characters written to it are encoded into bytes using a specified charset. The charset that it uses may be specified by name or may be given explicitely, or the platform's default charset may be accepted.

Bingo! A little rewiring of the way my server was writing to a connected Socket and I soon had a properly encoded 404 page with Japanese characters!

<div style="width: 700px; margin: 20px auto;">
  <img src="http://i.imgur.com/7aHfFxp.png" />
</div>

The moral of this story was Java's IO objects can be confusing because there are so many - but it also means that whatever you're attempting to do with characters and streams can probably be done by a single class you've yet to find. Also, praise to documentation - for without it I would not have a 404 page in Japanese and my life would not feel as complete.






