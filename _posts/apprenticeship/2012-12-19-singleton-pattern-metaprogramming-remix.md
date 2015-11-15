---
layout: post
title: "Singleton Pattern (Metaprogramming Remix)"
description: ""
categories:
- apprenticeship
---

There are some days I don't accomplish as much as I want, but I still gain a lot of new information and understanding that will allow me in the future to be faster and more productive. Today was one of those days. I'm not as far with my Limelight interface as I had hoped to be by this point in the week, but the struggles I've had with it so far have given me a confident understanding in how it works. I also had a good experience showing Spencer Davis, a fellow apprentice, how the files are structured and how things link up. That's when I knew I was feeling comfortable in Limelight's context, and how to go about extending my tic tac toe application via a Limelight interface.

In the back of my mind I was also feeling troubled by the Singleton Pattern example I posted [yesterday](http://selfless-singleton.rickwinfrey.com/2012/12/18/singleton-pattern/) because I knew it had problems. I mentioned in yesterday's post that I had originally worked on a metaprogramming solution but hadn't completed it. I had reached a point that left me wondering how to proceed, and whether it was possible to do what I wanted to do. At times like that, I feel very thankful to live with [Josh Cheek](http://www.8thlight.com/our-team/josh-cheek) because of his penchant for all things Ruby, and especially metaprogramming. So tonight we found a bit of time to talk about my approach, and we walked through some examples, refactored some code to make the task I was attempting less harrowing, and in the end found an elegant solution using metaprogramming that accomplished everything I intended.

I like to think of this blog as serving as a useful reference for me in the future, so I'd like to walk through the refactorings, and share some of Josh's thoughts and opinions about parts of my code that needed help, and also explain some of the reasons for approaching this example in the way I did. Ideally the lessons I learned might also be of benefit for you dear reader, too.

To start, I'd like to explain the high-level goal of this logger. I want a logger that can accept (within certain restrictions) a message to log something that hasn't been defined in the context of the application yet, and for that message to create a new log class and its corresponding text file used to capture its related log messages. The idea is that I am able to create a new log on the fly, whenever I want in the context of my application without needing to worry about configuration files or creating those log classes myself.

For example, say I have already defined a 'service log' (the ServiceLog class already exists). Then I can write to its log file like so:

    SystemLogger.service_log("some message about the service")

Now in the context of writing my application, a new feature is requested that requires the addition of a new service. At this time I don't have a NewServiceLog class defined, but I'd still like to be able to use my SystemLogger without defining the NewServiceLog class myself, like so:

    SystemLogger.new_service_log("some message about the new service")

Even though the new_service_log message is identifical in structure to the previous service_log example, I expect SystemLogger to handle these two requests very differently. For the existing class, it's a straightforward message to log a message to the appropriate log file. For the second example, I want SystemLogger to dynamically create the new log class, instantiate it as a singleton along with its log file, and then deliver the message to that log file. I recognize there are problems with this approach, and so I preface what I'm about to explore with the rather large caveat that this is __something I would not probably do in production__.

Let's look at a bit of yesterday's code:

    class SystemLogger
      @db_log      ||= DataBaseLogger.new
      @server_log  ||= ServerLogger.new
      @service_log ||= ServiceLogger.new

      def self.db_log(message)
        @db_log.log(time_stamp(message))
      end

      def self.server_log(message)
        @server_log.log(time_stamp(message))
      end

      def self.service_log(message)
        @service_log.log(time_stamp(message))
      end

      private

      def self.time_stamp(message)
        "#{Time.now} #{message}"
      end
    end

SystemLogger at this point is intended to be a singleton, is defined as a class but cannot be instantiated, and whose methods are invoked on the class constant itself (e.g. SystemLogger.server_log(message)). This is not bad, but it's not great. There are [Dependency Inversion Principle](http://selfless-singleton.rickwinfrey.com/2012/12/07/building-solid-foundations-of-oop-part-5-dip/) violations here that could be handled easily with a configuration file of some kind. As it stands now though, there is no way to add new log classes to SystemLogger.

Moving onto the individual logger classes, yesterday's code was in this shape:

    class Logger
      def initialize
        self.log_buffer = File.open("#{underscore(self)}.txt", "a")
      end

      def log(message)
        self.log_buffer.write(message)
      end

      private
      attr_accessor :log_buffer

      # Logger#underscore is based on Rail's ActiveSupport::Inflector#underscore with a few modifications
      def underscore(camel_cased_word)
        word = camel_cased_word.to_s.dup
        word.gsub!(/::/, '/')
        word.gsub!(/([A-Z\d]+)([A-Z][a-z])/,'\1_\2')
        word.gsub!(/([a-z\d])([A-Z])/,'\1_\2')
        word.gsub!(/(#<)|(:.*)|([0-9]+)/, '')
        word.tr!("-", "_")
        word.downcase!
        word
      end
    end

    class DataBaseLogger < Logger
    end

    class ServerLogger < Logger
    end

    class ServiceLogger < Logger
    end

This is where the refactoring started. Using reflection is a useful and effective tool in the right context, but Josh pointed out that I am not providing a way to over-ride the behavior that sets the name of a log file based on the class name of the logger:

    class Logger
      def initialize
        self.log_buffer = File.open("#{underscore(self)}.txt", "a")
      end
      ...

We reasoned that this could become problematic in the future if I need to concatenate log files or if I want two different logger classes to write to the same file. So, the solution we came up with passes the intended log file name when that log class is instantiated, like this:

    class Logger
      def initialize(name)
        self.log_buffer = File.open("#{name}.txt", "a")
      end

This refactoring had the nice side-effect of allowing my metaprogramming to essentially work as it existed, because handling the dynamically set file name based on a new class being created was proving to be a lot more difficult than I realized. This also removed the fairly gross underscore method I was using to parse the class constant into a file name format.

Next was the Logger#log method refactoring. Originally it was defined like this:

    def log(message)
      self.log_buffer.write(message)
    end

There are two problems here. One is that `write` on an IO object does not append a '\n' character to the end of a line. The other problem is that it's not clear when the buffer is actually written to the file. To account for both of these problems, we refactored this method like this:

    def log(message)
      log_buffer.puts(message)
      log_buffer.flush
    end

Using `puts` here means that a '\n' character is appended to every message that the logger writes to the log file. The `flush` method defined on Ruby's IO class means that the buffer is written to the lower level OS buffer each time `log` is invoked. This removes any uncertainty about the log file being updated appropriately if the application were to quit unexpectedly.

Next we refactored SystemLogger. Josh and I talked about approaches other people use to ensure that a class cannot be instantiated (to preserve the Singleton Pattern requirement) is to generally define that class as a module. I had thought of this, but decided that since a module is really defined in Ruby's object model as a class, that I didn't gain anything by using a module over an uninstantiable class (uninstantiable is not a word in my Mac's dictionary, but it totally should be). If you don't know what I mean, then try this experiment in TextMate:

    module SomeModule
      def some_method
        puts "yo"
      end
    end

    SomeModule.class # => Module
    Module.class     # => Class
    Class.class      # => Class

What does this mean? It means that every module is an instance of Class. It also means that every Class is an instance of Class. In Ruby's object model, this is how we can easily "open" up a given classe's singleton class. If we consider that every class we define is an instance of Class, then we realize that _every class is actually defined as a singleton class of Class_, but that's another discussion for another day.

But then Josh threw something at me I didn't know was "a thing" in Ruby. He asked why not just define SystemLogger in terms of Object (the base object of Ruby's object model)? We came up with this:

    SystemLogger = Object.new

Okay, but what about methods and behavior? No problem, since every Object has a singleton class, let's open it up and define behavior there:

    class << SystemLogger
      ...
    end

Now, let's dive into the fun stuff - metaprogramming!

My original approach used an override hack of `method_missing` to define a new logger class dynamically. I'll post the final result here, because it's dense enough to warrant it's own look without the added complication of the refactoring process of my original metaprogramming approach:

    def method_missing(new_log, message=nil, *rest)
      if new_log.to_s.end_with?('_log') && message.kind_of?(String) && rest.empty?
        add_logger(new_log)
        send(new_log, message)
      else
        super
      end
    end

The important take away for me here is that when over-riding `method_missing` it's important to retain as much of its original meaning as possible (I'll point out again that this is __not something I would do in production__). Although I would point out that when used in certain contexts, over-riding `method_missing` can be an [incredibly powerful tool](https://peepcode.com/blog/2009/shell-method-missing)!

The above `method_missing` over-ride contains an initial check to determine if the undefined method invoked on SystemLogger meets certain criteria. The undefined method must end with "_log", its class must be String and the 'rest' paramater should not contain any arguments. If these three conditions are satisfied, we felt comfortable in asuming that the undefined method was a new logger class we want to dynamically add to SystemLogger. In that case, we pass the new_log argument to `add_logger`. If not, then we want `method_missing` to do what it does best - raise an error! We accomplish this by simply calling `super` which retains `method_missing`'s original functionality.

Now that we have this `method_missing` hook to begin dynamically creating a new logger class, let's see how we actually do that with the `add_logger` method:

    def add_logger(method_name, file_name = "#{method_name}.txt")
      ivar   = "@#{method_name}"
      logger = Logger.new file_name
      instance_variable_set ivar, logger
      define_singleton_method method_name do |message|
        instance_variable_get(ivar).log(time_stamp(message))
      end
    end

First we want to create a new instance variable representing the class we are about to create for SystemLogger, which is stored as ivar. Next create a new Logger object. We then set our newly created instance variable to the value of the newly instantiated Logger object. The final bit of metaprogramming here is the most important:

    define_singleton_method method_name do |message|
      instance_variable_get(ivar).log(time_stamp(message))
    end

This is where things get the most magical. We are defining a new method on SystemLogger's singleton class. This is equivalent to saying:

    klass = class << self; self; end
    klass.define_method method_name do |message|
      instance_variable_get(ivar).log(time_stamp(message))
    end

The above approach was required in Ruby 1.8 before `define_singleton_method` was introduced in Ruby 1.9. If you're having any trouble understanding the idea of a Singleton Class, this [post](http://www.devalot.com/articles/2008/09/ruby-singleton) is exhuastive in explaining how to conceptualize it. The PragProg book [Metaprogramming Ruby](http://pragprog.com/book/ppmetr/metaprogramming-ruby) has a great description of the Singleton Class, too.

What the above method does is take our dynamically created instance variable (ivar), which was set to the value of a newly instantiated Logger object, and bind it to a method with the definition:

    <new_log>.log(time_stamp(message))

The final result, all together is like this:

    class Logger
      def initialize(log_file)
        self.log_file   = log_file
        self.log_buffer = File.open(log_file, "a")
      end

      def log(message)
        log_buffer.puts(message)
        log_buffer.flush
      end

      # for debugging purposes
      def to_s
        "#<#{self.class} log_file=#{log_file.inspect}>"
      end

      private
      attr_accessor :log_buffer # !> private attribute?
      attr_accessor :log_file # !> private attribute?
    end

    SystemLogger = Object.new
    class << SystemLogger
      def add_logger(method_name, file_name = "#{method_name}.txt")
        ivar   = "@#{method_name}"
        logger = Logger.new file_name
        instance_variable_set ivar, logger
        define_singleton_method method_name do |message|
          instance_variable_get(ivar).log(time_stamp(message))
        end
      end

      private

      def time_stamp(message)
        "#{Time.now} #{message}"
      end

      def method_missing(new_log, message=nil, *rest)
        if new_log.to_s.end_with?('_log') && message.kind_of?(String) && rest.empty?
          add_logger(new_log)
          send(new_log, message)
        else
          super
        end
      end
    end

Now, we can make the following calls for our original log use cases for the first time, without having any dependency inversion principle violations or needing a configuration file (return values are included to demonstrate where log files are defined, and where the log methods are defined (as singleton methods)):

    SystemLogger.db_log("new record generated")                         # => #<File:db_log.txt>
    SystemLogger.server_log("request received for service")             # => #<File:server_log.txt>
    SystemLogger.service_log("service successfully launched")           # => #<File:service_log.txt>
    SystemLogger.new_service_log("new service successfully launched")   # => #<File:new_service_log.txt>

    File.read 'server_log.txt'       # => "2012-12-19 22:37:48 -0600 request received for service\n"
    File.read 'db_log.txt'           # => "2012-12-19 22:37:48 -0600 new record generated\n"
    File.read 'service_log.txt'      # => "2012-12-19 22:37:48 -0600 service successfully launched\n"
    File.read 'new_service_log.txt'  # => "2012-12-19 22:37:48 -0600 new service successfully launched\n"

    SystemLogger.singleton_methods   # => [:add_logger, :db_log, :server_log, :service_log, :new_service_log]

<div style="text-align: center">
And that is some Ruby Magic<br />
^_______________________^</div>

[<div style="width: 300px; margin: 20px auto;"><img src="http://i.imgur.com/Nft37.jpg" /></div>](http://i.imgur.com/Nft37.jpg)
