---
layout: writing
group: Apprenticeship
title: "Building SOLID Foundations of OOP, Part 2: OCP"
description: ""
categories:
- apprenticeship
---

To continue on with our tour of SOLID, today we'll look at the O of SOLID, the [Open / Closed Principle](https://docs.google.com/a/8thlight.com/file/d/0BwhCYaYDn8EgN2M5MTkwM2EtNWFkZC00ZTI3LWFjZTUtNTFhZGZiYmUzODc1/edit?hl=en). Let's start with the canonical definition according to Uncle Bob:

> Software entitites (classes, modules, functions, etc.) should be open for extension, but closed for modification.

So what does this really mean?

Carrying on with yesterday's theme that abstraction is our friend in Obect Oriented Programming, the Open / Closed Principle is probably most easiest to think about in terms of how do we best abstract the parts of our application that are likely to change? We want to look for general patterns or behaviors that lend themselves well to being defined as an abstract class or interface. Whenever we code ourselves into a corner in Object Oriented Programming, we do so usually by creating [concrete classes when an abstract class should be used to define overall behavior](http://docs.oracle.com/javase/tutorial/java/IandI/abstract.html), or forgetting that providing an [abstract interface](http://www.differencebetween.com/difference-between-abstract-class-and-vs-concrete-class/) to inherit from will allow us greater flexibility in the future. Here we could also talk about dependencies, but that's coming up at the end of the week.

All of this description of abstract classes is fairly abstract though, so let's consider a simple, physical example of the Open / Closed Principle: Power tools!

[<div style="width: 500px; margin: auto;"><img src='http://www.bookshelfboyfriend.com/wp-content/uploads/2011/10/569drill-diagram-4.jpg' /></div>](http://www.bookshelfboyfriend.com/wp-content/uploads/2011/10/569drill-diagram-4.jpg)

This electric drill is a very useful tool in the right context because it greatly reduces the amount of work we have to do as a user, but it is also _open_ for extension, while being _closed_ to modification. We can _extend_ the usefulness of this drill because its chuck can accomodate a variety of different sizes of drill bits. It is _closed_ for modification meaning that each time we want to use this drill with a new bit, we don't have to take it apart, adjust the electric motor, put on a special chuck made specifically for the drill bit we want to use, etc. This electric drill, to an extent, is a good example of the Open / Closed Principle. If we think about our code like an electric drill, especially when we consider what responsibilities parts of our code have, then we should be careful in designing our code so that it preserves the ability to _extend_ its responsibilities to account for currently unknown, yet still related requirements (think drill bits), while not requiring us to _change_ the implementation of our code in order to do so (think take apart the drill and retool the motor).

Now with a somewhat physical object example in mind, let's see how it works with a simple code example. In [yesterday's post](http://selfless-singleton.rickwinfrey.com/2012/12/03/building-solid-foundations-of-oop/), we looked at SRP with a simple checking account example:

    class CheckingAccount
      attr_accessor :owner, :balance, :account_num, :routing_num
      def initialize(options)
        self.owner       = options[:owner]
        self.balance     = options[:balance]
        self.account_num = options[:account_number]
        self.routing_num = options[:routing_number]
      end

      def debit(amount)
        self.balance -= amount
      end

      def deposit(amount)
        self.balance += amount
      end
    end

We also segmented MonthlyPayment, a new requirement, into its own class rather than add it to CheckingAccount:

    class MonthlyPayment
      def initialize(options)
        ...
      end

      def new_monthly_payment
        ...
      end

      def verify_monthly_payment
        ...
      end

      def schedule_monthly_payment
        ...
      end

      def make_monthly_payment
        ...
      end

      ...
    end

And then we added a new monthly_payments instance variable to CheckingAccount:

    class CheckingAccount
      attr_accessor :owner, :balance, :account_num, :routing_num, :monthly_payments
      def initialize(options)
        self.monthly_payments = options[:monthly_payments_collection]
        self.owner            = options[:owner]
        self.balance          = options[:balance]
        self.account_num      = options[:account_number]
        self.routing_num      = options[:routing_number]
      end

      ...
    end

Wait a minute, something smells funny here...didn't we just get done saying our classes should be _open_ for extension, but _closed_ for modification? Yep, and this change to our CheckingAccount class violates the Open / Closed Principle. In case you were wondering what happens if we violate OCP, well the good news is that Domo-kun doesn't eat your finger, but it can make implementing future requirements nearly impossible, or hasten [code rot](http://en.wikipedia.org/wiki/Software_rot). OCP violations over time build up a wall of complexity around the original single responsibility of a code segment often creating a [spaghetti code](http://en.wikipedia.org/wiki/Spaghetti_code) hell. This unfortunately sets us up to experience an intense mixture of confusion and frustration when tasked with implementing a new feature involving such a class. A wall of complexity built by OCP violations prevents us from understanding how to even open the door of our metaphorical class, with a tight deadline hanging over our heads:

[<div style="width: 500px; margin: 20px auto;"><img src="http://www.urban75.org/blog/images/brixton-riot-aftermath-26.jpg" /></div>](http://www.urban75.org/blog/images/brixton-riot-aftermath-26.jpg)

First, let's review the user story that prompted us to make the MonthlyPayment class:

    As a CheckingAccount holder
    I want the ability to schedule automatic withdrawals from my account to pay bills.

Okay, we need a way for our MonthlyPayment class to talk with our CheckingAccount class when a debit occurs. Originally we thought we could add an instance variable containing our monthly payments to CheckingAccount, but we don't want potential future confusion and frustration. In these moments, I like to ask myself, What Would Bob Ross Do?

[<div style="width: 500px; margin: 20px auto;"><img src="http://dl.dropbox.com/u/19042234/happy-little-trees.png" /></div>](http://dl.dropbox.com/u/19042234/happy-little-trees.png)

Happy little interfaces will provide us a solution! If you take a step back and apply the patterns of abstraction associated with OOP, it is possible to make some interesting correlations between painting various objects of landscape scenes like those of Bob Ross to the patterns and principles defined by SOLID in our applications, but first let's implement our interface:

    class CheckingAccountMonthlyPaymentInterface
      attr_accessor :checking_account, :monthly_payment
      def initialize(options)
        self.checking_account = options[:checking_account]
        self.monthly_payment  = options[:monthly_payment]
      end

      def apply_monthly_payment
        checking_account.debit(monthly_payment.amount)
      end

      ...
    end

That was easy, and relatively painless. Essentially we've created a new space inside our application where both our checking account and monthly payment objects can talk with each other, but without violating any of the SOLID principles we've looked at so far. Interfaces in this way could be thought of somewhat like chaperones. They make sure the objects of our application have a good time, but not _too_ good of a time.

With the addition of this interface, we've sufficiently satisfied the user story and maintained both SRP and now OCP. We were able to achieve this with a simple abstract interface that applies the monthly payment to our checking account. This allowed us to _extend_ CheckingAccount without _modifying_ it. Later this week, we will look at interfaces more specifically with the Interface Segregation Principle, but for now we can enjoy the satisfaction of knowing our code is easier to work with, easier to understand and utilizes abstraction to prevent breaking encapsulation of our CheckingAccount and MonthlyPayment classes.
