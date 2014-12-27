---
layout: writing
group: Archive
title: "Ant Tool, Cob Specs and Rinda, Oh My"
date: 2013-02-07 17:00:00
categories:
- archive
---

At this point in the apprenticeship, everyday feels so full of new information it is difficult to describe. I also feel like I’m able to digest the amount of new information coming at me well enough to turn around and use it the next day. Today was one of those days.

Tuesday I had my IPM with Micah, which meant reviewing my Java Web Server. It was a little rough initially. My Ant build file didn’t work on his computer - and I didn’t really understand it. This taught me a valuable lesson - don’t rely on something that I don’t really understand. I leaned heavily on the Idea IntelliJ IDE for creating an Ant Build file but didn’t go through the file carefully to understand what the different sections were doing. When the build file failed and I couldn’t explain why - that was a disappointment I wish to never repeat again.

But it did give me the chance to witness Micah’s skill in action. I watched as Micah took an example Build file from the official Ant website and converted it into a working build file for my server project. Along the way, he talked me through the process, including a description about what each component is doing. I really appreciated that. The night before the IPM I felt a little overwhelmed by all the options and configuration required for creating a proper build file, and seeing a simple example configured in front of me was incredible to watch. It was also wonderful to see Micah’s thought process as he tackled the problem.

If you’re new to Ant - it is a tool used mainly by Java developers to make deploying Java projects to various platforms an easy operation. A build file provides the computer with instructions on how to compile an existing Java project, where to store the Java byte code classes and where to put the compiled Jar file. There are other tasks that Ant build files can carry out too, such as running a test suite or cleaning up a previously compiled build.

Here’s what my Java web server’s build file looks like:

	<project name="RicksHTTP" default="build" basedir=".">
	    <description>Rick's HTTP</description>
	    <property name="src" location="src"/>
	    <property name="classes" location="classes"/>

	    <path id="classpath">
	        <pathelement path="${classes}"/>
	        <fileset dir="lib">
	            <include name="*.jar"/>
	        </fileset>
	    </path>

	    <target name="compile" depends="" description="compile the source ">
	        <mkdir dir="classes"/>
	        <javac srcdir="${src}" destdir="${classes}" classpathref="classpath" includeantruntime="false"/>
	    </target>

	    <target name="build" depends="compile" description="generate the distribution">
	        <jar jarfile="rickhttp.jar" basedir="${classes}">
	            <manifest>
	                <attribute name="Main-Class" value="server.HttpServer"/>
	            </manifest>
	        </jar>
	    </target>

	    <target name="clean" description="clean up">
	        <delete dir="${classes}"/>
	    </target>

	    <target name="test" depends="compile" description="run the unit tests">
	         <junit fork="yes" printsummary="on" haltonfailure="yes" haltonerror="yes">
	             <classpath refid="classpath"/>
	             <formatter type="brief" usefile="false"/>
	             <test name="tests.TestSuite" haltonfailure="no"/>
	         </junit>
	     </target>

	</project>

As you can see, it’s XML containing a DSL containing instructions for how to build the project.

The good news was my server was feature complete (for this iteration), and had full test coverage except for two exceptions I had not covered by tests. Later, I would cover these exceptions - which taught me how to force exceptions when dealing with sockets and threads. This wasn’t easy for me at first, but after remembering the difficulty I had with trying to mock sockets, I realized I was making the task more difficult than I needed to. In the end, the test suite was passing consistently on my machine - but was still failing in strange ways on Micah’s computer. As a final test - craftsman Colin Jones kindly offered to download my project and run the test suite on his computer - and they passed.

I have a lot of confidence in my tests, but I also learned another valuable lesson from this exercise - don’t make fragile tests. What does that mean? There are certain behaviors in software that are difficult to ensure 100% consistency, like threads and sockets - especially when testing the status of a thread containing a socket. There is a lot of detail I don’t have a comfortable grasp on with threads, and at a low-level about how sockets bind to ports and how they are represented by a language like Java. Yet I learned when a test isn’t working 100% of the time, it’s better to scrap the test and redraw the testing conditions so that we can guarantee 100% consistency.

All of these things would be put to a different kind of test today when fellow apprentice Ryan Verner asked about getting the cob specs talking with his Java server. I had not looked at the cob specs yet, but had a rough idea of what they were. We dove in, and after prodding around and looking at the erros, we realized that the cob specs were not instantiating his server.

To figure out why - we looked at how the cob specs instantiated a server. From that code, we were able to call the same methods and discover that Ryan’s Java server was coupled to IntelliJ - and that his jar file could not be run independently. Out came the Ant file - and we made a similar Ant build file for Ryan’s server as Micah had made for me. This time though, I was able to explain what each component did.

With the cob specs now instantiating Ryan’s server - other problems came up. I won’t describe those in detail, but it forced us to look into the source code of the cob specs, and I got a superficial understanding of how the specs are structured and how they invoke Ruby scripts. Ryan and I had to adjust a complex regex in one of the tests to be more generic, and when we explained this to Micah he suggested we contribute to the cob specs. This reminded me of something I learned long ago about “always leave the kitchen in better shape than you found it” - and Ryan and I are planning to devote Waza time over the next few weeks to updating some of the tests, possibly adding more, and updating the styling and UI. This would give us a chance to use some of our newly acquired knowledge about Scss and Sass from design craftsman Stephanie Briones’ great presentation about using Sass and tools like Compass.

The other big thing of today was completing the stock market simulation using a Rinda server. This was a fun challenge given to the apprentices by craftsman and CEO, Paul Pagel. Paul provided us with his own Rinda server that contained a list of stocks, whose prices changed every two seconds. Our task was to write a process that would act as a broker and make decisions on which stocks to buy and which stocks to sell. Whoever had the most money at the end of an hour was deemed the winner. Having all the essential plumbing in place, my partner and I will work on this for Waza this Friday. The challenge for next week is to make a web view of the proces - that is updated continuously showing which stocks are purchased and the broker’s current balance. I think a simple sinatra web app would handle this well, and based on the simplicity of making jQuery ajax calls - I think we can achieve a fully functional asychnronous web view updating every time a buy is initiated. If we get really ambitious and think that we have more time than we really do - it would be great to throw Highcharts JS into the mix and provide the web view with some live-updating graphs.

I’m so happy to be at 8th Light - the experience is tremendous - made even more so by this view I enjoyed today from the treadmill standing desk at the Libertyville office.

<div style="width: 700px; margin: 20px auto;">
	<img src="http://i.imgur.com/ckV3JF8.jpg" />
</div>
