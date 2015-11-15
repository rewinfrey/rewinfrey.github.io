---
layout: writing
group: Apprenticeship
title: "$: == $LOAD_PATH"
description: ""
categories:
- apprenticeship
---

Over the course of the apprenticeship, I've been confronted on a daily basis in all the areas of my Ruby understanding that are insufficient. Ruby's load path was something I sort of understood, but didn't really appreciate until I was given the task of first extending my tic tac toe application in Rails, and now with Limelight. In including my tic tac toe library in both Rails and Limelight, my shaky understanding of Ruby's load path has improved, and I'd like to summarize as a reference for others struggling to understand the mysteries of $:.

First off, let's make something clear. Ruby has a number of special pre-defined variables (similar to Perl). For an exhuastive list, I've found Ryan Davis' [Ruby reference](http://www.zenspider.com/Languages/Ruby/QuickRef.html#pre-defined-variables) to be a wonderful resource to know about. In this case though, $: is the pre-defined variable for the load path, whereas $LOAD_PATH is Ruby's environmental variable for the load path. Don't let this confuse you, they are the same thing:


    $LOAD_PATH == $:  # => true


To see your Ruby's load path, open a terminal window and enter the following:

    $ ruby -e 'puts $LOAD_PATH'

You should see an array of strings, similar to this:

[<div style="width: 800px; margin: 20px auto;"><img src='http://i.imgur.com/VUw3w.png' /></div>](http://i.imgur.com/VUw3w.png)

Like the [$PATH environment variable in Unix](http://www.cyberciti.biz/faq/howto-print-path-variable/), Ruby's load path contains a list of locations for the Ruby interpreter to look in when searching for files that have been required by the code we execute. When working with external libraries, properly setting up the Ruby load path is essential.

There are two common ways of adding a directory to $LOAD_PATH:

    $:.unshift File.expand_path '../lib', __FILE__
    $: << File.expand_path '../lib', __FILE__

[Unshift](http://ruby-doc.org/core-1.9.3/Array.html#method-i-unshift) is a useful method defined on the Array class that prepends a parameter to the front of an array. The '<<' operator appends a parameter to the end of an array. If I'm adding a directory to the load path, I prefer unshift, so that I can be certain when the files I'm requiring will be found. This avoids possible confusion with a directory of the same name later in the load path being used to load a file I think is being loaded from the correct directory. This kind of thing is unlikely, but trouble shooting load path issues is not fun, so I've learned to use unshift by default to prevent this from happening.

Say I have a simple project that has the following directory structure:

    .
    └── lib
        ├── some_module
        │   ├── current_file.rb
        │   └── other_file.rb
        └── another_module
            ├── bar.rb
            └── foo.rb


So our project is contained in a 'lib' directory and contains two module sub-directories. Inside each module sub-directory is our application code. What's the best way of altering the load path so that we are able to require any one of the files found in our modules?

It's common in the Ruby community when requiring files to respect module name spacing. Otherwise, if our project is large and we include another file by the same name, but have no way of distinguishing between the two then unexpected behavior can occur. So, for the sake of clarity, we will want to add the 'lib' directory to our load path, and stop there. This means our require statements will have the following form:

    require 'some_module/current_file.rb'
    require 'another_module/bar.rb'

This makes it explicit that 'current_file.rb' belongs in 'some_module' and 'bar.rb' belongs to 'another_module'. For a small example like this, the helpfulness of this approach isn't immediately apparent. But for large projects, it is very helpful in understanding where to go look for a particular method definition, or just to understand the structure of the code base. Alternatively, you could use [ctags](http://andrew-stewart.ca/2012/10/31/vim-ctags)!

In order to achieve this, if my perspective is how to alter the load path from the context of 'current_file.rb', then I can unshift the $LOAD_PATH like so:

    $:.unshift File.expand_path '../..', __FILE__

This is saying give me the full path of 'current_file.rb' (which is represented by `__FILE__` ), and then go back two directories '../..'. Altering the load path in this way is the easiest way to deal with the load path I've found. An alternative to this approach would be:

    $:.unshift File.expand_path(Fil.dirname(__FILE__) + "../../lib")

Let's see how this works in context, starting with our original $LOAD_PATH:

    puts $:
    # >> /Users/rickwinfrey/Library/Application Support/TextMate/Managed/Bundles/Ruby.tmbundle/Support/vendor/rcodetools/lib
    # >> /Users/rickwinfrey/Library/Application Support/TextMate/Managed/Bundles/Bundle Support.tmbundle/Support/shared/lib
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/site_ruby/1.9.1
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/site_ruby/1.9.1/x86_64-darwin11.2.0
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/site_ruby
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/vendor_ruby/1.9.1
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/vendor_ruby/1.9.1/x86_64-darwin11.2.0
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/vendor_ruby
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/1.9.1
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/1.9.1/x86_64-darwin11.2.0

Then we unshift:

    $:.unshift File.expand_path '../..', __FILE__

And check our $LOAD_PATH to see if the correct directory was prepended:

    puts $:
    # >> /Users/rickwinfrey/Play/delete_me/load_path_example/lib
    # >> /Users/rickwinfrey/Library/Application Support/TextMate/Managed/Bundles/Ruby.tmbundle/Support/vendor/rcodetools/lib
    # >> /Users/rickwinfrey/Library/Application Support/TextMate/Managed/Bundles/Bundle Support.tmbundle/Support/shared/lib
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/site_ruby/1.9.1
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/site_ruby/1.9.1/x86_64-darwin11.2.0
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/site_ruby
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/vendor_ruby/1.9.1
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/vendor_ruby/1.9.1/x86_64-darwin11.2.0
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/vendor_ruby
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/1.9.1
    # >> /Users/rickwinfrey/.rvm/rubies/ruby-1.9.3-p0/lib/ruby/1.9.1/x86_64-darwin11.2.0

Yep, it's there as the first path listed. Now, inside 'current_file.rb', we can simply require any file we want within our project knowing that we make our require statement relative to the 'lib' directory, like so:

    require 'another_module/bar.rb'
    require 'another_module/foo.rb'

In this way, we've managed to tell the Ruby interpreter where to look for the code we want to execute by giving the files in our project priority over the load paths in our system, and we've preserved the namespace of the modules our code belongs to in our require statements so we understand what file belongs to what module. If you're feeling confused about File.expand_path or File.dirname, or if you're confused about require statements, Micah wrote a great [blog post](http://blog.8thlight.com/micah-martin/2007/10/08/micah%27s-general-guidelines-on-ruby-require.html) about this topic. It helped me clarify some missing pieces when I was first getting my Ruby tic tac toe library loaded into my Limelight project.
