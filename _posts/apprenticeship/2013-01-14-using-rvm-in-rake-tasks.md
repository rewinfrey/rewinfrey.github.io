---
layout: writing
group: Apprenticeship
title: "Using RVM in Rake Tasks"
description: ""
categories:
- apprenticeship
---

Last week Micah suggested I create a Rakefile that would run the specs for my Tic Tac Toe, CLI, Rails and Limelight specs. I thought that sounded like a great idea, and much easier than running four groups of specs separately. I wasn't sure how RVM would behave in a Rake context though, and not surprisingly, RVM does not allow by default the ability to switch versions of Ruby in a Rake task.

But the answer to "why?" wasn't all that clear to me initially, and I did some digging. I started with the error RVM gave me when I tried making a Ruby Kernel#system call, like so:

    system('rvm use default')

    error: RVM is not a function, selecting rubies with 'rvm use ...' will not work.

    You need to change your terminal emulator preferences to allow login shell.
    Sometimes it is required to use `/bin/bash --login` as the command.
    Please visit https://rvm.io/integration/gnome-terminal/ for a example.

In my searching I read a lot of the man pages for `bash`, including its description about what a `login shell` means:

>When bash is invoked as an interactive login shell, or as a non-interactive shell with the --login option, it first reads and executes commands from the file /etc/profile, if that file exists. After reading that file, it looks for ~/.bash_profile, ~/.bash_login, and ~/.profile, in that order, and reads and executes commands from the first one that exists and is readable. (man pages)

This means that Ruby Kernel#system is not executing system commands inside a login shell. So I checked the docs and found out the Kernel#system launches a subshell, and is not an interactive shell (meaning it does not load profiles). I figured that since RVM complains when it's invoked from a non-login shell it requires access to the various profile files that would normally be read when a login shell process begins. Yup (it's very dependent on ~/.bash_profile).

So, luckily, bash supports the ability to launch a new login shell with the `-i` flag like so:

    bash -i

And I can pass this to Kernel#system like this:

    system('bash -i')


But this isn't quite enough just yet. When I try to send an RVM command with the previous call, I still don't get the expected result:

    system('bash -i "rvm use default"') # => false

The answer is to use the `-c` option:

    system('bash -i -c "rvm use default"')

It took me awhile to understand why `-c` is necessary. What I reason is that when we invoke a new bash shell with the `-i` flag, how is it possible for that shell process to receive input from a string if it's not told to expect STDIN as a string argument being passed to the shell's invocation? And so the `-c` flag is required, with a string argument, so as to allow a string of commands to be passed to a newly invoked shell process. This is what allows us to evaluate `rvm use default` in the context of this newly invoked login shell, whereas without the `-c` option it is simply invoked in the existing subshell of Kernel#system (after the newly invoked shell we just created closed because it had nothing to do).

For another read on the `-c` option, here is the corresponding man page entry:

>-c string: If  the  -c option is present, then commands are read from string.  If there are arguments after the string, they are assigned to the positional parameters, starting with $0.

My final solution ended up looking like this:

    system "bash -l -c 'cd limelight; rspec spec'"

The reason this works is because I'm relying on `limelight/.rvmrc` to automatically adjust the version of Ruby and set the required gemset for me when `cd limelight` occurs.

And happily, RVM is working inside the context of my Rakefile now, and I no longer need to run four separate specs. And a special thank you to my roommate [Josh Cheek](http://www.8thlight.com/our-team/josh-cheek) for working on the Rakefile with me!

<div style="width: 400px; margin: 20px auto;">
  <a href="http://i.telegraph.co.uk/multimedia/archive/02388/koala-laptop_2388626k.jpg">
    <img src="http://i.telegraph.co.uk/multimedia/archive/02388/koala-laptop_2388626k.jpg" />
  </a>
</div>
