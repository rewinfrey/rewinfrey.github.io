---
layout: writing
group: Apprenticeship
title: "Doubles, Mocks and Stubs"
description: ""
categories:
- apprenticeship
---

It's already the start of my third week as an apprentice, and I am loving it. Today I went to the Libertyville office and had my second iteration planning meeting with Micah. Over the weekend I was feeling motivated and interested in solving the 4x4 tic tac toe user story, which then turned into solving the 3x3x3 user story. I think because of a large scale refactoring of my application last week based around the ideas of SOLID, I was able to extend my tic tac toe application by simply creating a new 4x4 board class, writing the specs, and tweaking my minimax algorithm to account for the larger game tree. Seeing how smooth that went on Saturday, I started implementing the 3x3x3 on Sunday and was able to do the same thing in less than a couple hours. The tricky part was figuring out how to adjust my minimax algorithm so the first move of a 3x3x3 game wouldn't require 5 or more minutes. The nice thing about using alpha-beta pruning is that my algorithm was already eliminating several game tree paths, so I simply needed to adjust the max-ply value based on the number of available moves when the algorithm is first invoked. It look some playing around with knowing where to set the depths based on number of available moves, but soon the algorithm was cranking through 3x3x3 fairly quickly and beating me regularly.

Micah asked me how I felt about the application at the end of our meeting and I said I liked it, that it's the cleanest code I've ever written, and that the SOLID principles had changed the way I program. In contrast to my first tic tac toe attempt, I was really happy to show this code to Micah. I was also very happy when we started writing new user stories for the next iteration and my first task is to create a Rails web interface for my tic tac toe application.

So I started reading sections of the RSpec book I hadn't read yet (mostly the parts about Rails testing), and decided I'd allowed the ambiguity of mocks, doubles and stubs to exist for too long in my brain, and I wanted to clarify those terms.

###RSpec Doubles,  Mocks and Stubs###

We can create a test double like this:

    some_kind_of_test_double = double('some-kind-of-test-double')

And a test mock like this:

    some_kind_of_test_mock   = mock('some-kind-of-test-double')

Or even a test stub, like so:

    some_kind_of_test_stub   = stub('some-kind-of-test-double')

Confused? I was. They all seem the same, but like most things, the nuances are where all the fun is.

By the way,

    double
     mock
     stub

All come from RSpec::Mocks::Mock class.

####Doubles####

We can create test doubles to create objects needed for implementing a behavior we want to test. Doubles are the most generic of mocks and stubs, and are often used to create objects that facilitate necessary communication between objects and methods. After creating a test double of some object, we then can specify method stubs, or mock expectations on the test double. These two ideas carry slightly different implications when we analyze the intent of our tests.

####Method Stubs####

A method stub allows us to pre-define what a stubbed method's return value will be. It generally means we aren't too concerned about testing the stubbed method's behavior, but instead we're more interested in testing behavior our stub is a part of:

    describe Statement do
      it "uses the customer's name in the header" do
        customer = double('customer')
        customer.stub(:name).and_return("Toro")
        statement = Statement.new(customer)
        statement.generate.should =~ /^Statement for Toro/
      end
    end

In this case we're creating a test double named customer and stubbing a method called "name". We reveal the intent of our test based on where we assert our expectation (on statement), and not on "name", so a stub in this test is still testing the relevant code we wish to test. Stubs are useful for helping facilitate behavior when we aren't interested in setting expectations on what is being stubbed.

####Message Expectations (mock expectation)#####

A message expectation is a type of method stub that raises an error if it's never called.

    describe Statement do
      it "uses the customer's name in the header" do
        customer = double('customer')
        customer.should_receive(:name).and_return("Toro")
        statement = Statement.new(customer)
        statement.generate.should =~ /^Statement for Toro/
      end
    end

Again we create a 'customer' test double. Instead of a stub, we define a mock expectation on customer by setting the expectation that it should receive 'name' and return "Toro". Here we are still intending to test statement's "generate" method result, but with the caveat that we also expect Statement.new to call customer's "name" method.

####Mixing Message Stubs and Mock Expectations#####

Sometimes we want to focus on one particular behavior, so we can stub out tangential messages, while defining a mock expectation on behavior being tested.

    describe Statement do
      it "logs a message on generate()" do
        customer  = stub('customer')
        customer.stub(:name).and_return("Toro")
        logger    = mock('logger')
        statement = Statement.new(customer, logger)

        logger.should_receive(:log).with(/Statement generated for Toro/)

        statement.generate
      end
    end

The difference in creating a stub for customer and a mock for logger, is to reveal our test's intent. We want to verify that when a new statement is generated, our mocked logger receives a "log" message. Customer is only necessary in this case to provide the necessary object for the generation of a new statement as a filler necessary to test the behavior focused on in this test.

###Take Away###
>Double: use when a filler object is needed with the ability to define mocked methods or stubbed methods depending on intent.

>Mock: we expect something from the object or method, with the ability to define its return value.

>Stub: we don't expect anything from a stubbed method or object, but serves a useful purpose for facilitating behavior to be tested.
