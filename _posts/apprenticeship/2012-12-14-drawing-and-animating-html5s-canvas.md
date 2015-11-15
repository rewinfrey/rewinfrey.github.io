---
layout: writing
group: Apprenticeship
title: "Drawing and Animating HTML5's Canvas"
description: ""
categories:
- apprenticeship
---
Last week the apprentices met with craftsmen [Dave Moore](http://www.8thlight.com/our-team/dave-moore) and [Colin Jones](http://www.8thlight.com/our-team/colin-jones) to talk about how to make the most out of the apprenticeship experience. A lot of good ideas were shared along with the idea to start having apprentices give a couple of  Lightning Talks on Friday afternoons. Today I was slated to give a Lightning Talk, but 8th Light's Christmas Party is today, and several things are already happening, so we've decided to wait and do them next Friday. My topic is to describe how drawing and animation work with HTML5's [canvas](http://www.w3schools.com/html/html5_canvas.asp) element, and give a few simple examples showing the powerful and easy to use Javascript API for manipulating the canvas.

Basically, the canvas element is just like it sounds, a canvas. On that canvas we can draw a variety of shapes, gradients, text, shadows, opacity, etc., and it's all fairly easy to do. The following is a very simple walk through the most basic methods of the Javascript API for manipulating the canvas. I've also provided a few links at the bottom of personal things I've done to learn how to animate in Javascript using canvas for anyone who is interested.

Let's start by first drawing a canvas and giving it a simple background color:
<div style="width: 800px; margin: 20px auto;"><canvas id="canvas1" height="200" width="800">Your browser does not support HTML5 :(</canvas></div>

To accomplish this, we first need to get a canvas "context", like so (in Javascript):

    canvas_example = document.getElementById("canvas_example").getContext("2d");

Now, canvas_example is a `CanvasRenderingContext2D` object, that gives us access to a [large library of canvas methods](http://www.w3schools.com/tags/ref_canvas.asp). We can take advantage of this to supply a background color for our canvas. First we set a color we want to fill the canvas with, and then specify how we want to fill the canvas (in this case we use the fillRect() method, which draws a rectangle):

    canvas_example.fillStyle = "#454545"

    // fillRect(start_x_pos, start_y_pos, width, height)
    canvas_example.fillRect(0,0,800,200)

That is all we need in order to produce the above canvas example.

Let's consider another simple example. Let's add a rectangle to our canvas element:

    // get the context
    canvas_example2 = document.getElementById("canvas_example2").getContext("2d");

    // creates the background
    canvas_example2.fillStyle = "#454545";
    canvas_example2.fillRect(0, 0, 800, 200);

    // draws orange rectangle
    canvas_example2.fillStyle = "#FF7C1E";
    canvas_example2.fillRect(300, 75, 50, 100);

<div style="width: 800px; margin: 20px auto;"><canvas id="canvas2" height="200" width="800">Your browser does not support HTML5 :(</canvas></div>

How about a circle?

    // get the context
    canvas_example3 = document.getElementById("canvas_example3").getContext("2d");

    // creates the background
    canvas_example3.fillStyle = "#454545";
    canvas_example3.fillRect(0, 0, 800, 200);

    // draws orange circle
    canvas_example3.fillStyle = "#FF7C1E";
    canvas_example3.beginPath();
    canvas_example3.arc(380, 100, 50, 0*Math.PI, 2*Math.PI);
    canvas_exaampe3.fill();
    canvas_example3.closePath();

<div style="width: 800px; margin: 20px auto;"><canvas id="canvas3" height="200" width="800">Your browser does not support HTML5 :(</canvas></div>

In this example, we're using a few new methods specifically related to more complicated "paths", or the lines that constitute a shape we eventually "fill". Let's break down how to draw a circle:

    // start a new path
    canvas_example3.beginPath();

    // arc(start_x_pos, start_y_pos, radius, start angle of arc, end angle of arc)
    canvas_example3.arc(380, 100, 50, 0*Math.PI, 2*Math.PI);

    // fills in the path using the predefined fillStyle
    canvas_example3.fill();

    // closes the current path (allows us to create a new path without clobbering the current path)
    canvas_example3.closePath();

If you want to go deeper in understanding how canvas works, you can dust off that [linear algebra](http://en.wikipedia.org/wiki/Linear_algebra) knowledge and apply [transformations](http://www.w3schools.com/tags/canvas_transform.asp) to your canvas element prior to drawing to it to achieve interesting results with a minimum of code. I'll leave that to the reader to discover, as that topic itself is worthy of an entire week of posts. ^_________^

Considering these basics, it is possible to begin animating our canvas elements with dynamic data. I'll save this topic for its own blog post for next week, but in the meantime, if you're curious about what kinds of things can be animated with Javascript and canvas, here are some examples I've done in the past month:

* [<div style="width: 200px; display: inline-block">Bubble-sort</div>](http://visual-bubble-sort.rickwinfrey.com) [code](http://github.com/rewinfrey/visual-bubble-sort)
* [<div style="width: 200px; display: inline-block">Selection-sort</div>](http://visual-selection-sort.rickwinfrey.com)  [code](http://github.com/rewinfrey/visual-selection-sort)
* [<div style="width: 200px; display: inline-block">Quick-sort</div>](http://visual-quick-sort.rickwinfrey.com)              [code](http://github.com/rewinfrey/visual-quick-sort)
* [<div style="width: 200px; display: inline-block">Conway's Game of Life</div>](http://visual-game-of-life.rickwinfrey.com) [code](http://github.com/rewinfrey/game-of-life)
* [<div style="width: 200px; display: inline-block">Maze Solver</div>](http://maze-solver.rickwinfrey.com)                   [code](http://github.com/rewinfrey/maze_solver)

Another week has flown by! I'm learning a ton every day, and couldn't be happier to be an apprentice at 8th Light. A big thanks to my mentor, Micah, for taking me on and giving me a good dose of new challenges every week. The feedback and the help are very appreciated!
