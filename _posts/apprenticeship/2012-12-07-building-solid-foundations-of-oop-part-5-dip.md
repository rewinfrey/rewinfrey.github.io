---
layout: writing
group: Apprenticeship
title: "Building SOLID Foundations of OOP, Part 5: DIP"
description: ""
categories:
- apprenticeship
---

It's certainly been a SOLID week. On a personal note, I was successful in refactoring my Ruby tic tac toe program to not violate any of the SOLID principles. I also added in the ability for the player to choose between an easy, medium or hard AI to play against. Currently I'm extending my base classes to make possible playing 4x4 tic tac toe, to be followed by a 3D implementation. Because I've managed to preserve SOLID principles, particularly the Liskov Substitution Principle, the Interface Segregation Principle and the Open / Closed Principle, I'm easily able to extend my application to account for these new game types. Mostly I'm able to achieve this by utilizing the three benefits of OOP we've talked about this week (encapsulation, inheritance and polymorphism), and creating abstract interfaces for how various objects of my application talk with each other. It is rewarding to learn about these ideas and have the opportunity to implement them in a way that verifies their purported benefits.

To cap off the week, we will look at the final SOLID principle, the [Dependency Inversion Principle](https://docs.google.com/a/8thlight.com/file/d/0BwhCYaYDn8EgMjdlMWIzNGUtZTQ0NC00ZjQ5LTkwYzQtZjRhMDRlNTQ3ZGMz/edit?hl=en). This is perhaps one of the most powerful ideas of the bunch, because in order to preserve this principle it relies on successfully implementing the other four principles. As I've grappled with these ideas this week, I've seen that the underlying connections between these principles creates a self-supporting architecture of concepts, and is a beautiful structure in itself.

Let's first look at the formal definition of the Dependency Inversion Principle:

> a. High-level modules should not depend on low-level modules. Both should depend on abstractions.

> b. Abstractions should not depend on details. Details should depend on abstractions.

I like to think of levels of abstraction as a hierarchy. At the top is the highest level of abstraction, and it most generally defines behavior for any class or module that may inherit from it. At each successive level of abstraction, the implementation details grow gradually more concrete, until we arrive at the bottom levels of abstraction which strictly concern themselves with the concrete details of implementation.

To see this in action, let's revisit our very simple banking application we've developed throughout the week. First, let's look at our interface for calculating monthly interest rates:

    class AccountCalcMonthlyInterestInterface
      attr_accessor :account, :calc_monthly_interest
      def initialize(options)
        self.account               = options[:account]
        self.calc_monthly_interest = CalcMonthlyInterest.new
      end

      def apply_interest
      end
    end

This represents our highest level of abstraction so far for calculating monthly interest rates for various types of accounts. In the most general way possible we define behavior, not through actual implementation, but by idea. We leave the `apply_interest` method defined in name only, but without any further clues as to how to define that particular behavior. This is done so that as we inherit from this abstract interface, we know what we need to implement in a lower-level abstraction, such as the CheckingInterestInterface we created [yesterday](http://selfless-singleton.rickwinfrey.com/2012/12/06/building-solid-foundations-of-oop-part-4-isp/):

    class CheckingInterestInterface < AccountCalcMonthlyInterestInterface
      def apply_interest
        calc_monthly_interest.for_checking(account)
      end
    end

In this context, we are one level of abstraction lower than the interface we inherit from, so we would expect this level to provide a greater level of concrete detail in implementation when compared with its parent (AccountCalcMonthlyInterestInterface). That's precisely what we do.

There exists a problem with this implementation, however, and it squarely violates the Dependency Inversion Principle. Did you spot it yet? Let's look again at our highest level of abstraction:

    class AccountCalcMonthlyInterestInterface
      attr_accessor :account, :calc_monthly_interest
      def initialize(options)
        self.account               = options[:account]
        self.calc_monthly_interest = CalcMonthlyInterest.new
      end

      def apply_interest
      end
    end

If we recall what DIP says, then we remember that "High-level modules should not depend on low-level modules." Yet, our intialize method `self.calc_monthly_interest = CalcMonthlyInterest.new` is a prime example of a high-level module (our interface) depending on a low-level module (CalcMonthlyInterest). While this might not at this time be a problem, it will be if we remember OCP - our segment of code should be _open_ for extension but _closed_ for modification. In this instance, if we wish at some point in the future to give bank customers a choice of monthly interest rate schemes, which also requires us to be able to calculate interest rates differently depending on the customer, and not just on the account type, we will have to violate OCP in order to implement that new requirement. We will also violate the Interface Segregation Principle in order to determine what kind of interest rate scheme a particular account needs, and provide some form of conditional checking to determine how to process that interest calculation.

All of sudden, this small violation of the Dependency Inversion Principle could potentially spawn two other SOLID principle violations. A few more violation chains like this, and our code starts to rot. This won't be immediatley apparent, but over time, the code rot will continue to spread throughout the application. One compromise here leads to another compromise there. It's a sad but very stark reality that a company's most important piece of software can succumb to this fate. When the code rot reaches a certain level, it becomes nearly impossible to work with the code base, bugs go unfixed, users stop paying and the company suffers a prolonged disintegration.

It's interesting that the Dependency Inversion Principle contains the word inversion. Here, our abstract interface depends on CalcMonthlyInterest, but what if we _inverted_ that dependency? What would that look like? Well, in Ruby, it's extremely simple, we can simply pass in an object to our abstract class that we wish to use as a subtype for the general behavior we want the more concrete classes to implement, like so:

    class AccountCalcMonthlyInterestInterface
      attr_accessor :account, :calc_monthly_interest
      def initialize(options)
        self.account               = options[:account]
        self.calc_monthly_interest = options[:interest_scheme].new
      end

      def apply_interest
      end
    end

It's a bit subtle, but very powerful. Now our AccountCalcMonthlyInterestInterface doesn't care what _kind_ of interest rate scheme we use, all it is concerned with is that there is one provided to it when the interface is used. Now we can easily use this interface with any number of interest rate schemes and various account types. This code is simple and flexible, it does not violate any of the SOLID principles, and it utilizes the three benefits of OOP.

That wraps up this week's tour of SOLID. For any present and future readers, I hope that this introduction, as simple as it is, gives you greater clarity in understanding and greater ability in applying these ideas. When we step back and consider the moral and ethical weights our role in society as a programmer entails, it's important to remember that our code does not simply touch and reach out to every human or machine that interacts with that code, but it also influences in a very real way the livelihoods and occupations of those arround us. Whew, that was heavy, but it's not a weight we have to burden our shoulders with ([sitting for many hours a day will do that for you](http://health.yahoo.net/experts/menshealth/most-dangerous-thing-youll-do-all-day)) when we remember a few principles and guidelines for how to write good, clean code. So smile, relax and think of your favorite cat:

[<div style="width: 200px; margin: 20px auto;"><img src="http://i.imgur.com/J5Z7I.jpg" /></div>](http://i.imgur.com/J5Z7I.jpg)

<div style="text-align: center;">
Happy coding<br />^______________^
</div>
