---
layout: writing
group: Apprenticeship
title: "Building SOLID Foundations of OOP, Part 4: ISP"
description: ""
categories:
- apprenticeship
---

So far this week we've looked at the Single Reponsibility Principle, the Open / Closed Principle and the Liskov Substitution Principle. Today we'll look at the I of SOLID, the Interface Segregation Principle.

Let's start with Uncle Bob's definition:

> Clients should not be forced to depend on methods that they do not use.

When we build interfaces, we want interfaces that have <a href="http://en.wikipedia.org/wiki/Cohesion_(computer_science)">high cohesion</a>. This means that a class or module has a clearly defined single responsibility and contains methods only to achieve that responsibility. When we build interfaces, our interfaces have specific purposes in the context of our application, but sometimes we may make interfaces that are generic enough so that multiple clients speak to that interface. When we make an interface general enough, and multiple clients speak to that interface, then some clients will be exposed to methods of the interface the client doesn't need. The trouble here is if a change to one of those other methods in the interface also requires the client to change, then we have required a cascading set of changes throughout our application. This would be a violation of the Interface Substitution Principle.

This principle is easy to understand if we consider how to structure interfaces in such a way, that they maintain high cohesion, while also taking full advantage of the benefits of OOP (encapsulation, inheritance and polymorphism). Let's revisit our CheckingAccount and SavingsAccount interface from [yesterday's post](http://selfless-singleton.rickwinfrey.com/2012/12/05/building-solid-foundations-of-oop-part-3-lsp/) about LSP:

    class AccountCalcMonthlyInterestInterface
      attr_accessor :account, :calc_monthly_interest
      def initialize(options)
        self.account               = options[:account]
        self.calc_monthly_interest = CalcMonthlyInterest.new
      end

      def apply_interest
        if account.class == "CheckingAccount"
          calc_monthly_interest.apply_checking_interest(account)
        else
          calc_monthly_interest.apply_savings_interest(account)
        end
      end
    end

We have an interface with high cohesion, but we're not happy with the "if" conditional in `apply_interest`. Because checking accounts and savings accounts have different interest rates, our interface has to know something about the account its servicing. Now that our interface is required to know what it's speaking with, we have an interface segregation violation.

How can we fix that?

1. Create an abstract interface for accounts and monthly interest rate.
2. Create specific interfaces for checking and savings accounts that inherit from our abstract interface.
3. Override the `apply_interest` for both checking and savings account interfaces.

Let's do it:

    class AccountCalcMonthlyInterestInterface
      attr_accessor :account, :calc_monthly_interest
      def initialize(options)
        self.account               = options[:account]
        self.calc_monthly_interest = CalcMonthlyInterest.new
      end

      def apply_interest
      end
    end

    class CheckingInterestInterface < AccountCalcMonthlyInterestInterface
      def apply_interest
        calc_monthly_interest.for_checking(account)
      end
    end

    class SavingsInterestInterface < AccountCalcMonthlyInterestInterface
      def apply_interest
        calc_monthly_interest.for_savings(account)
      end
    end

We have segregated our interfaces for checking and savings accounts, so that now, our interfaces have higher cohesion than before, and our clients (checking and savings accounts) are now only exposed to the specific methods they need. We still don't feel comfortable with our interfaces just yet though, because there is something about this hard dependency on CalcMonthlyInterest that is troubling. What happens if that class gets changed somehow? Or what if we want to use a different way of calculating interest? Tomorrow, we are going to look at the last of the SOLID principles, the Dependency Inversion Principle, which will give us a way to solve this problem.
