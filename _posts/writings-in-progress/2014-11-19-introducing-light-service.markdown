---
layout: writing
group: Writings-In-Progress
title:  "Introducing Light-Service"
date:   2014-11-19 23:04:07
categories:
- writings-in-progress
---

Who is this post for?
  - Rails developers interested in abstracting their business logic from their application code / web framework
  - People interested in learning how to implement clean architecture at a practical level
  - People that are not interested in doing the prescribed Rails methods for solving problems in Rails

This post assumes you need not be convinced of the merits of abstracting your web application's business logic
from the framework serving your web application. If you need convincing, I would suggest starting with
[Clean Architecture](http://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html), followed by a detailed
practical example of how to apply the ideas of Clean Architecture in a Rails context described in
[7 steps to get started with Clean Architecture in Ruby](https://medium.com/@fbzga/clean-architecture-in-ruby-7eb3cd0fc145).

I'd like to share 6 months of experience working in [Light-Service](http://github.com/adomokos/light-service) in a Rails context.
Light-Service contains a detailed README so I won't duplicate that info here, but instead I'd like to walk through a series of
examples, starting with no business logic abstraction, to creating a rudimentary abstraction, and finally using Light-Service.

Let's begin with a very simple controller context.
<script src="https://gist.github.com/rewinfrey/36d2e6f6e791cef28207.js"></script>

Ignoring the security issues here for the moment, this solution works fine in the beginning of our project. However, conditions change,
and we need our create method to be a little more intelligent. We decide to add logic that first determines whether or not the user's email address is valid using a regex.
By the way, [this is generally a bad idea](http://davidcel.is/blog/2012/09/06/stop-validating-email-addresses-with-regex/), but serves as a useful example.
If the email is valid, then we want to create the user record, but if it is not a valid email address, then we do not want to create the user record and instead
return a flash error message indicating that a valid email address is required.
<script src="https://gist.github.com/rewinfrey/df23615e68244cae7d6c.js"></script>

This works well for our needs, but again conditions change, and we realize that when we create a new user, we also want to send the user a
welcome email. We decide that we will process the email asynchronously using Resque and Redis.

<script src="https://gist.github.com/rewinfrey/2b98d99e3dd57b1d61af.js"></script>

If you're not familiar with the conventions of Resque, the details are unimportant for this example, but if you are curious how it works, this
[tutorial](http://tutorials.jumpstartlab.com/topics/performance/background_jobs.html) gives you the overview.

We step back and look at our code and think so far so good. A week goes by, and everything is working as we expect. And then, suddenly everything changes.
Business owners have decided that they would like to send out marketing emails to specific users depending on where they live. To start, business owners want
to send marketing emails first to California state and New York state residents only. We look at the existing code and continue with
the approach that is already there, but with the addition of two new conditional branches to determine which marketing email to send, if any.

<script src="https://gist.github.com/rewinfrey/5ac73ca2ce2926b01699.js"></script>
