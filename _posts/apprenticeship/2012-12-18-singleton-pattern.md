---
layout: writing
group: Apprenticeship
title: "Singleton Pattern"
description: ""
categories:
- apprenticeship
---

One thing I've learned is that some topics have very deep rabbit holes, and it's important to know where to stop. The other day I was thinking it would be interesting to explore the design patterns in the [Gof book](http://en.wikipedia.org/wiki/Design_Patterns). I wanted to explore something a little different, so I settled on the [Singleton Pattern](http://en.wikipedia.org/wiki/Singleton_pattern). This probably wasn't the best one to dive into from the start, but in reading the many criticisms about the Singleton Pattern, I thought it would be a fun challenge to create a context that would justify its use, and also do it in a way that limits how gross it sometimes appears.

Most of the common examples I've seen describing when to use the Singleton Pattern deal with logging. Generally, when logging occurs we write to files. And when we write to files, it's considered a good idea to restrict the file buffer to a single buffer. In the context of logging, then it's probably going to be advantageous if we can restrict the logging file buffer to one instance, so that all writing happens in the same buffer to avoid potential data corruption. So let's use the Singleton Pattern to implement different log files, but that have one access point (the singleton), and make calls on that instance that corresponds to different log files.

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

We have a base Logger class that is the parent class of DataBaseLogger, ServerLogger and ServiceLogger. We limit the instances of these three logging classes to a single instance through SystemLogger, a wrapper class of the various logs we have for our system. SystemLogger uses Ruby's ||= to lazy load a new instance of a logging class when needed. The nature of ||= ensures that we'll only ever have one instance of each Logger subclass defined for the SystemLogger class at any given time, and because we've defined these instances of Logger subclasses as instance variables of a class that cannot be instantiated, we are able to ensure that there will never be more than one instance of each of the Logger subclasses. In other words, we take advantage of the fact that everything is an Object in Ruby, including classes. Because we are restricted to using only class methods with SystemLogger, we only provide access to the class namespace to our system. This means that at any time in our system, when we make a call like so:

    SystemLogger.service_log("this is a new log message")

SystemLogger will always be the same instance regardless of when and where we are in our system.

Originally for this post I was working on a fun metaprogramming example that dynamically creates a new Logger subclass based on the [Abstract Factory Pattern](http://en.wikipedia.org/wiki/Abstract_factory_pattern), but I need a little more time to complete it. I feel like metaprogramming is super fun, although it's one of those things that's best not to use much in production code.

* To see the source of Rail's ActiveSupport::Inflector, which contains a lot of interesting methods, go [here](http://en.wikipedia.org/wiki/Abstract_factory_pattern).
