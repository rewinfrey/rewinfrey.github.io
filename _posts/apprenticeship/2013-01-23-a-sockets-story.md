---
layout: writing
group: Apprenticeship
title: "A Socket's Story"
description: ""
categories:
- apprenticeship
---

Even as I write this blog post in a text editor, what is actually happening at a lower level in my computer is a stream of data transfer from the moment I input via the keyboard to the storage of these characters in a file. This basic flow essentially has four steps:

1. open a connection (between a sender and a receiver)
2. sender writes some data to the receiver
3. receiver reads some data from the sender
4. close the connection

In the coming days, I'll do a deep dive into sockets. There are a couple things about how sockets work that are fuzzy in my brain. Like, how actually do they encode data? How do sockets prepare data as TCP or UDP datagrams? Can sockets send and receive data simultaneously? What manages the queue for data being transmitted via sockets (on both the receiver and sender sides)?

But for today, I'd like to offer a fun picture explanation about the basics of how web sockets work. Enjoy!
<hr />
<p style="text-align: center;">In the middle of working on a tic tac toe challenge, Rick has a thought:</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/05WcNwb.jpg" />
</div>

<p style="text-align: center;">It's the most honest thought he could think to write.</p>

<div style="width: 360px; margin: 20px auto;">
  <img src="http://i.imgur.com/kjJgmTT.jpg" />
</div>

<p style="text-align: center;">Luckily, the friend lives close by, at Port Apt #8080.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/PDMaO9k.jpg" />
</div>

<p style="text-align: center;">Rick sends his message in the sending recepticle (the mail box).</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/NxuqdoM.jpg" />
</div>

<p style="text-align: center;">Away it goes, through a series of unknown channels and mysterious passages.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/15gF8Ol.jpg" />
</div>

<p style="text-align: center;">Until the message reaches Port Apt #8080.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/a77Zahm.jpg" />
</div>

<p style="text-align: center;">News of a message is a special alert reserved for just such an occasion.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/2EX8pow.jpg" />
</div>

<p style="text-align: center;">The message must be checked.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/RQF2wYg.jpg" />
</div>

<p style="text-align: center;">The message body is not as much a request as it is a means for establishing a connection it seems.</p>

<div style="width: 360px; margin: 20px auto;">
  <img src="http://i.imgur.com/GGwVOMq.jpg" />
</div>

<p style="text-align: center;">What to do?</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/5dtlpXo.jpg" />
</div>

<p style="text-align: center;">It's best to offer help even when it is not asked for.</p>

<div style="width: 360px; margin: 20px auto;">
  <img src="http://i.imgur.com/Uyw0pQI.jpg" />
</div>

<p style="text-align: center;">The reply message is packaged, with correct socket postage affixed.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/mwMU3uD.jpg" />
</div>

<p style="text-align: center;">And into the sending recepticle (also sometimes curiously functioning as the receiving recepticle, too) the response goes.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/dQe6S1g.jpg" />
</div>

<p style="text-align: center;">This time through a traceable path but whose loops and paths are so difficult to imagine.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/mCqX88i.jpg" />
</div>

<p style="text-align: center;">Until it comes to rest right back from where the original message was sent.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/jSyediY.jpg" />
</div>

<p style="text-align: center;">Anxiously awaiting the reply, news of the response is happy relief!</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/wjgYWXJ.jpg" />
</div>

<p style="text-align: center;">Its contents are so carefully unpacked, so as to make sure the intention of the message is perfectly understood.</p>

<div style="width: 480px; margin: 20px auto;">
  <img src="http://i.imgur.com/gTZ0zEJ.jpg" />
</div>

<p style="text-align: center;">Now the connection has been made, a real request can be sent back!</p>

<p style="text-align: center;">And so it is, a socket's story.</p>

<hr />

<div style="width: 480px; margin: 40px auto;">
  <img src="http://i.imgur.com/pvE4XTL.jpg" />
</div>

My own personal visualization of socket connections between senders (in) and receivers (out). Queues are built up for both the sending and receiving sides. When the input socket is ready to transmit more data, it takes the next thing from the input queue. This data is transferred using a few protocols like TCP, or UDP. These get broken down into smaller segments but we won't worry about that yet. Eventually the datagrams make their way to the intended receiver, but it looks like the receiver has an output queue, and it's currently serving process #81. Once the receiver has processed the sender's request, the receiver becomes the sender and responds with the appropriate data. It's a simple idea, whose implementation details grow complex very quickly. How do we ensure a request is received by the receiver? How do we ensure that datagrams hold their integrity while they criss-cross across all types of network links? Can we control the throughput of certain network links so we can manage the requests effectively? So many questions requiring answers if this thing called the internet is to work whenever we want it to.
