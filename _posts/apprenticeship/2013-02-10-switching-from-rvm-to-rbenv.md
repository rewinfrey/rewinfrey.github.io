---
layout: writing
group: Apprenticeship
title: "Switching From RVM to rbenv"
description: ""
categories:
- apprenticeship
---

Recently my early 2011 Mac Book Pro has become nearly unusable due to some hardware issues. It randomly freezes, shuts down, and gives me a 3 beep error signal. This supposedly has something to do with memory, but after replacing the memory with two different sets of memory, running memory test diagnostics on my memory and seeing no errors - I'm suspicious that it isn't something else. Luckily, I have Apple Care coverage so I will send it to Apple and see if they can figure out what's causing my beloved machine to die up to 10 times a day.

In the meantime, 8th Light was kind to offer me a laptop to borrow while mine is repaired. This meant over the weekend starting over with a fresh install of Mountain Lion and getting the environment setup. When it came time to install RVM, I realized that I would have to install XCode in order to install different versions of Ruby. I couldn't stomache the four gig XCode download - then follow the complicated updating procedure to ensure I would end up with GCC4.1 and not GCC4.2. I found the whole work around to be unacceptible, so I started reading about [rbenv](https://github.com/sstephenson/rbenv).

From what I understand, RVM and rbenv both append themselves to your $PATH and create shims that intercept any Ruby related commands and directs them to the appropriate version of Ruby. The idea is really simple, but RVM takes it a step further with gemsets, whereas rbenv stays as unintrusive as possible.

I have never experienced any of the strange RVM errors that some of my friends have described experiencing, but I like the idea of a tool doing one thing and one thing well - rather than trying to do multiple things at the expense of being quite intrusive and potentially causing difficult bugs to track down. But what really sold me on rbenv was that I didn't need to install XCode in order to install different versions of Ruby.

To see a list of installed Rubies:

	$ rbenv versions

To install a new version of Ruby:

	$ rbenv install 1.9.3-p385

rbenv keeps track of global, local and shell Ruby versions for our system. The order of precendence is:

- use global unless local
- use local  unless shell


To set global, local and shell Rubies:

	$ rbenv global 1.9.3-p385
	$ rbenv local 1.9.3-p385
	$ rbenv shell 1.9.3-p385

You can also unset Ruby versions:

	$ rbenv global --unset
	$ rbenv local --unset
	$ rbenv shell --unset

If you ever need to set your Ruby back to the system Ruby:

	$ rbenv global system

The only gotcha to be aware of is that after installing gems to a specific version of Ruby, you'll want to rehash your shim:

	$ rbenv rehash

This updates any path related changes made to the current version of Ruby.

But the great bonus of the switch was that I was able to find a way that didn't require me to use XCode to install different versions of Ruby (thanks to StackOverflow):

	$ env CC=/usr/bin/gcc rbenv install 1.9.3-p385


If you're thinking of making a switch from RVM to rbenv, I found this [article](http://cantina.co/2011/10/08/managing-ruby-moving-from-rvm-to-rbenv/) helpful. So far I'm enjoying using rbenv and as long as I remember to rehash, I'm finding it very simple and easy to use.
