---
layout: writing
group: Archive
title: "First Dance With Riak"
date: 2013-01-09 17:00:00
categories:
- archive
---

[Riak](http://docs.basho.com/) is a document database that is used by companies like Google, BestBuy, Github and several others. In reference to the [CAP theorem](http://en.wikipedia.org/wiki/CAP_theorem), Riak would be classified as a distributed database system and belongs to the P camp (meaning it favors persistence over consistency). [For more info on the CAP theorem, check out craftsman Myles Megyesi's 8th Light University talk](http://vimeo.com/56786670).

I'm not a database expert, but there were a few things that Riak does that struck me as being wonderful to work with right off the bat.

* Riak provides an HTTP API that accepts any form of HTTP request (PUT, POST, GET, DELETE).

* Riak also allows the HTTP requests to be structured so that documents can be easily obtained from a cluster. This means I can just structure a url request, properly formatted, to see all of the information in a document in my browser.

* Riak has a cluster management tool that is very similar to the way Git's version control system works. It uses a system of changes, that are then planned (staged), and then committed in order to take affect (like joining independent nodes together).

* Data is organized around the idea of "buckets", and each bucket can contain as many "keys" as we want. Each key can be thought of as the key of a hash that points to some value.

* Riak also natively supports serialization in JSON or YAML, and also has its own API for using your own serialization library.

To use Riak, I'd recommend downloading the source and building it yourself, as you'll have more flexible options with building clusters and configuring Riac nodes compared to using the homebrew formula. There are lots of good tutorials on the Riac website with the documentation. I chose Riac also in part because of the ['riac-client'](https://github.com/basho/riak-ruby-client) gem for Ruby. This library nicely wraps the Riac API in an easy to use way, and it makes connecting to a Riac cluster or node very simple.

I'll blog some more thoughts about Riac as the week goes on, but for now, I'm really enjoying it!
