---
layout: writing
group: Apprenticeship
title: "Testing in Limelight"
description: ""
categories:
- apprenticeship
---

Mondays are great. I get up a little earlier than usual to head north to 8th Light's Libertyville office. This is when I also get to have my iteration planning meeting with my mentor, Micah. Today I got to show Micah my progress on the Limelight interface for my Tic Tac Toe library. When Micah asked to see my specs, I was embarrassed to admit I didn't have any, as I was having a lot of trouble getting the Limelight specs to work. In the face of the frustration of not getting the specs to work, and also feeling the pressure to make progress on the stories I agreed to take for the last iteration, I continued to spike out the interface. Micah and I talked about strategies to prevent that from happening in the future which were really helpful, and we also reviewed how the apprenticeship was going so far. I was able to share what I was happy with and what I wasn't happy with, and Micah gave me great feedback. After that it took me about an hour to figure out why my specs weren't working, and it came down to a single line require statement that was missing that gave me access to the Limelight RSpec specific helper methods.

    require 'limelight/specs/spec_helper'

Because this line above was missing from my 'spec_helper.rb' file, I wasn't able to isolate the 'scene' context of my Limelight interface in order to properly test what was happening inside that context, like this:

    uses_limelight :scene => "three_by_three", :hidden => true

Without this context I could test tangential methods that don't require knowing about a scene or something else associated with Limelight, but the more important things in a Limelight production are the internals of a scene.

The way I ended up figuring out what was wrong was creating a new, stock Limelight production and looking at the default 'spec_helper.rb' file created. As soon as I opened it up and saw the missing require statement I knew that had to be it...it just made sense that the reason I was getting a MethodMissing error every time I tried calling `uses_limelight` was because RSpec didn't know where to look for that method invocation. I dropped in the `require 'limelight/specs/spec_helper'` and I was finally off writing the specs for my scenes.

I also tried figuring out how to use the backstage area of a Limelight production so I could pass an object from one scene to another, but I wasn't successful in getting it set up correctly. I think that's one I'll have to ask Micah about tomorrow, because unfortunatley the RDocs for `backstage_pass()` and `backstage()` are completely blank.

All in all, it was a big relief to finally get the specs working for Limelight, and now I feel good again about the interface. I was able to get most the Limelight interface covered by tests today, and I'll finish those up tonight.

I told Micah I'm very happy to be at 8th Light, and to have him for my mentor. It's such an amazing place to be, to learn in, and to think that I also get to be surrounded by such an interesting and intelligent group of people everyday - it's hard to imagine a better work place. If you're at all interested in 8th Light, you should definitely come to an [8LU (8th Light University)](http://university.8thlight.com/) on Friday. After lunch and a presentation, you can meet the developers, pair up with them, and talk about apprenticeships if you're interested.
