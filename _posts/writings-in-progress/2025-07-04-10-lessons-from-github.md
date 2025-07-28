---
layout: writing
group: writings
title: "10 lessons after 10 years at GitHub"
date: 2025-07-04 14:00:00
categories:
- writings-in-progress
---

After nearly a decade working at GitHub as a software engineer, I've decided to pass the baton and begin a new adventure.

I've worked on GitHub's Rails monolith, but most of my engineering focus was on building code intelligence services and features external to the Rails application.

This included many contributions to Tree-sitter language grammars and the Tree-sitter library / runtime.
I helped build a R&D program analysis library in Haskell named <a href="https://github.com/github/semantic">Semantic</a>.
Shipped GitHub's first version of code navigation powering jump-to-definition and find-all-references.
Next I helped evolve the code navigation service to offer zero-config precise code navigation, powered by the underlying technology we created at GitHub named <a href="https://github.com/github/stack-graphs">Stack Graphs</a>.
With the rise of generative AI I contributed to bringing Copilot Chat to the web, and was the primary author of the prompt-building library to manage dynamic contexts, and is still used today.
Most recently, I've spent the past ~two years focused on GitHub's amazing code search system, Blackbird.

There are many lessons learned over these past 10 years, but after some reflection here are the top 10 lessons I've distilled.

### 1. The core is the moat

GitHub's platform is an indispensable service for the companies and individual engineers world wide that host their code there. None of that matters if the core functionality of the platform is buggy, slow, or has poor user experience.

I often see people describe "moats" in terms of specific features, data, or users, but I think these perspectives often overthink the simple rule that any product or platform company's moat is its core functionality. 1000 features have little to no value if 900 have spotty availability, are buggy, and most importantly, are slow.

### 2. Build first for customers

Leading up to the 2018 acquisition of GitHub by Microsoft, the [dear GitHub](https://github.com/dear-github/dear-github) letter became an infamous example of users asking for legitimate features to address friction and pain around maintaining open source projects. In 2018, under Nat Friedman's tour as CEO of GitHub, a "paper cuts" initiative was launched to help address these pain points and other items of friction. This was largely successful and helped to re-establish good will and trust between the open source community and GitHub.

This example highlights a tension within product and platform companies in which internal usage patterns dictate product priorities for extended periods of time. This is "dogfooding" to the extreme. When internal usage patterns dominate product or platform direction, businesses risk over-fitting to a narrowed cone of use-cases.

At some point, after enough over-fitting, if your business is lucky like GitHub, customers may offer a "dear x" letter carefully outlining their product frustrations and requests. If your business is unlucky, your customers will churn without any feedback, making it hard to understand and predict, but is likely because a competitor is building what customers want.

### 3. Make it work, make it scale, make it faster

Kent Beck coined the infamous "Make it work, make it right, make it fast", and is as true today as when it was first written. But for large-scale platforms like GitHub, I learned that there is a slightly different formula that works well. That is "Make it work, make it scale, make it faster".

Shortly after joining the code search team, I saw an opportunity to optimize one of the core processes for maintaining the health and stability of GitHub's code search system, the "backfill" process. This process iterated over 120+ million repositories and produced an up-to-date index for code search.

Over time, changes to the system along with ingesting more and more repos (120+ million repos is _a lot_ of repos), resulted in backfill durations of ~5 days. This made failures in the process particularly painful and costly in terms of time lost. Long backfill durations also represented an availability risk in case there was catastrophic data loss. It also reduced team velocity in our ability to ship experimental new features or make index breaking changes.

Speed is a form of trust in software systems. Software that provides fast feedback loops are always preferred over slow systems that make developers wait. The same is just as true of the systems and tools we build for internal development as it is for the systems and products that generate revenue.

After a few weeks of CPU and memory profile guided optimization work, I reduced backfill duration from 5 days to 34 hours, a 72% improvement. We immediately felt the benefits on the team. Backfills were no longer a pain point that reduced trust in our systems. Speedier backfills increased not only the team's trust in our systems, but also increased our team's velocity.

The main takeaway for me is there is no end to "make it faster". Optimization work, when prioritized and done well, reaps benefits that reverberate through all layers of the business, from product and sales to application, service, and infrastructure engineering teams. Most of all, "making it faster" always enhances the customer experience and builds trust in the product.

### 4. Know your tools, especially the ones you build

Especially in developer tools, you can’t afford to treat tools as abstract concepts. You have to use them, internalize them, and master them so you understand the layers of experience they provide firsthand.

If you're building a product or tool you don't use, you're building on assumptions. If you're lucky, you'll build something valuable. But more likely than not, you'll end up building something that works for a limited perspective that misses the mark for your customers.

Similarly, the best engineers I know don't just know their development tools, they invest heavily in them.

Follow your curiosity! Make friends with discomfort! Keep experimenting, learning, refining, and playing.

Craft, like product, improves with curiosity.

### 5. There's no substitute for good telemetry, but too much can hurt you

If you can't measure what your system is doing, you're flying blind. But if you measure everything, you're flying through fog.

Too much telemetry creates noise. It buries signals in irrelevant stats, clutters dashboards, and leads you to chase red herrings during incidents. Logging and metrics aren't just about collection, they're about clarity.

Dashboards and logs should be continuously curated, pruned, with shared ownership by the whole team. This requires all members to be equally invested in understanding the purpose of logs and metrics. When those logs and metrics no longer provide clarity, remove them!

Otherwise, pretty dashboards with pretty graphs that make things look sophisticated and complex are performative, but don't help when it actually matters.

Every incident is a chance to ask:

* What logging / metrics slowed things down?
* What logging / metrics helped speed debugging up?

Telemetry must evolve with your system, or it will fail you when you need it most.

### 6. Treat legacy code like a historic renovation project

That legacy system carried the business. Customers depend on it. Renovating it is a privilege, not a burden. Treat legacy code as precious. It is! But always remember that in the digital world, unlike the physical world, code is extremely malleable, and that invites continual improvement and refactoring over time.

Renovating legacy code requires finesse. Knowing what to preserve and what to modernize without breaking trust.

Leaders that overlook this work, especially during performance reviews, are failing their business and engineering organizations. You cannot run successful software companies that only build new features without ever reinvesting in the software that first made the business successful.

Legacy code renovation is some of the most challenging and risky engineering work there is, and should be rewarded and lauded just as much as new feature work.

### 7. Software is a team sport

No matter how skilled you are, your impact (and growth) will always be shaped by how well you work with others within your team, across teams, and across layers of the business.

Some of the most pivotal lessons in my career came from:

* Every day stand and deliver.
* Be upfront and honest about what is working and what is not working.
* Hold yourself accountable for everything you commit to doing.
* Steal workflows and tips from people whose work was exceptional.
* Always take the long-view when building relationships.
* Don't want until a project is complete to reflect. Continuously reflect and touch base with others on the work while it is happening.
* Identify the strengths of your teammates and learn from them.
* Be generous with sharing your strengths to help and aid your teammates.
* Communication is time and energy. Be mindful and considerate of what you're asking of others when communicating.

Advancing as an engineer isn't just about knowledge and skill. It's also about your relationships, the quality of those connections, your ability and willingness to play to your team's strengths and look for opportunities to fill in gaps. It takes continuous reflection and a daily commitment to foster excellence. All of these factors combined make for a powerful career accelerator because it provides a foundation built on ability, trust, and camaraderie, and will open doors for better and more valuable opportunities.

### 8. Value is subjective

The best technology does not always win. There are many reasons for why this happens, but I'd argue that most reasons stem from a simple truth - value is subjective. Don't assume others will see the same value you see in your best technology.

Instead, I've come to appreciate that effective influence often wins. What do I mean by effective influence? In this context, it means influencing the perceived value of something. How can we do that? Show the business case. Lead by demonstration. Prove the impact. Repeat.

And still, don't be surprised when your best technology still doesn't win. Always remember that influence is an arena. Some seats are closer to the decision maker than others. That’s the game. Always play it with integrity.

### 9. Read the research

This lesson was especially acute to me with the sudden rise of generative AI. Incredible research happening at an accelerated rate is freely available on sites like <a https://arxiv.org>Arxiv</a>. This ranges from interaction design patterns for AI systems, to orchestration schemes combining multiple LLMs, to changes in transformer model attention to better suit a specific problem domain, etc. It's a huge untapped pool of ideas and exploration. So the first step is following and reading the research. You don't have to read everything, usually an abstract will tell you enough to understand the direction and value proposition. But if you're intimiated to read computer science research papers, take a look at <a href="https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf">How to Read a Paper</a>.

While reading and staying up with research is already ahead of the curve for most developers, we can go farther still. We can go deeper, and probe why a research experiment succeeded, and ask questions like:

* What characteristics of the underlying algorithms contributed to this outcome?
* How can these algorithms or solution be synthesized into seemingly unrelated domains?
* What connections does this research have with other current research?

One of my favorite things to do with generative AI is to summarize research papers. Not only to provide high level summary of the important points from each section, but to also use "deep research" features to exhaust the resources in the research paper's bibliography, and summarize the backing research in two important wants:

* What contribution did this backing research make to the current research paper?
* Where does the backing research differ or contradict the current research paper?

Actively reading and internalizing existing research is a super power, but to really tap the value we need to push for more and discover intersections that no one's mapped yet.

### 10. Be flexible enough to adapt. Be focused enough to matter

Finally, one of the best pieces of advice I ever received was from a senior leader at GitHub, who pushed me to consider that "as an engineer, some degree of fungibility is good". No matter where our careers take us and how we specialize over time, it's surprisingly refreshing and helpful to remember that we are fungible to some degree!

This idea of fungibility is half of the picture. What I internalize from being fungible is the idea of being flexible and adaptable. But these skills augment our career's specialization and depth! When adaptability and specialization combine, it opens the door to explore new problems no one else has solved. If fungibility is the ticket to accessing these new problems, then depth and specialization is the vehicle to explore and solve them.

That's why after 10 years of diving deep and specializing in code intelligence at GitHub, I’m joining <a href="https://nuanced.dev>Nuanced</a> to help bring to bear program language and static analysis techniques to help curate and provide effective code intelligence for AI code generation workflows. This is a huge unsolved problem, particularly for large, complex codebases, and will leverage all of my 10 years of experience learnings from GitHub. I couldn't be more excited.
