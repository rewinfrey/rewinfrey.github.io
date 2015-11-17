---
layout: writing
group: Writings
title:  "Distilling DDD Part 1 - Ubiquitous Language"
date:   2015-11-16 21:10:07
categories:
- writings
---

<p>
After working with software for a number of years, I've noticed a few patterns about
successful teams and teams that seem to always be stuck in a perpetual state of
reacting to problems. I recently found and purchased a copy of [*Implementing Domain-Driven Design*]()
by [Vaughn Vernon]() and highly recommend any software developer out there reading this
to pick up a copy and consider the ideas. The examination of Domain-Driven Design provided
by Vaughn Vernon is accessible to all experience levels, thorough yet not repetitive, and
provides a clarified, focused set of ideas, reasoning, technical and communicative strategies
for building better software. Interestingly, what I see at the heart of Domain-Driven Design
as featured by Vaughn Vernon is an emphasis on team building, communication, design, and not
just consideration of business issues modeled as domains, but a true appreciation for those
business domains and their inherit complexity. This rang true with my experiences as a software
developer and what I perceive to be hallmarks of successful teams vs teams that operate in
more or less a painful state of never quite getting it right.
</p>

<p>
Rather than diverge and talk about a certain Agile methodology based misunderstanding that
**any** upfront design is **bad**, I'd instead rather attempt to distill down the essence
of how Domain-Driven Design works, and why it helps teams be successful. To start, I'd like
to convey the importance of a specific form of communication that significantly enhance the
ability of various teams working together to solve business problems that have real business
value.
</p>

<p>
Like the spice in the sci-fi novel [*Dune*]() - communication must flow. And it simply is
not enough for that communication to flow in one direction. While there are many different
forms of communication we could explore in this post, I'm speaking to one of the most important
aspects of Domain-Driven Design -- **Ubiquitous Language**. Whether we recognize it or not,
every business creates shared languages to describe domains of the business.
These shared or ubiquitous languages consist of clearly and simply defined terms used consistently
across any given domain of a business. It's a language that is co-created by domain experts,
business analysts, stake holders, product managers, designers, developers, sales and any other
party of the business whose success is dependent on understanding how a particular domain of
the business functions. However, as a business, to successfully created ubiquitous language, I have
observed behaviours that either enhance or detract from the overall success of ubiquitous languages.
</p>

<p>
No one party is ever completely right. Co-creating a shared language that is consistent
and well defined means that input from each party is required, as well as the ability for each
party to listen and compromise when necessary. This probably sounds very obvious and matter
of fact, yet in practice, successful teams I've experienced in the past do this exceptionally
well. They not only succeed in compromising when co-creating this shared language, but they do
so quickly and efficiently without becoming embroiled in lengthy debates about pedantic
points of difference. Teams that struggle tend to do so not because various parties cannot
seem to agree on terms, but because they do not collect enough input from parties of the
business whose success depends on the ability to understand and utilize this shared language.
Often parties are not included in co-creating this ubiquitous language not out of a malicious
intent but usually from either lack of experience or perceived lack of time and / or bandwidth
(or most commonly - both).
</p>

<p>
To solve a problem is to define the problem, and to define the problem is to appreciate
the problem, and to appreciate the problem is the ability to accurately, concretely,
and systematically model and exhuast the problem space (which in turn requires exhuasting
the solution space). It just so happens that often the side-effect of modeling problems
such that the problem and solution spaces are satisfactorily exhuasted is the creation of a
special language that ideally anyone in the business can engage with and understand.
</p>

<p>
As software developers we also have an added responsibility of translating this ubiquitous
language into the code we create. If we fail to do this, it creates a disconnect between the
language in the code with regards to the agreed upon language of the business at large. This
might not seem like a big deal for existing developers who understand the implicit, yet
undocumented, mapping of terms between the ubiquitous language and the code's language. Yet,
this disconnect will inevitably create headaches. An easy scenario to help illustrate the pain
of this disconnect is onboarding a new developer to the project. If you've ever had to onboard
a new developer to a project whose code language uses terms that are different or are defined
inconsistenly compared with the ubiquitous language of the business, then you can probably
identify with the mental confusion and lengthy explanations that are required for the sake
of the new developer.
</p>

<p>
Unfortunately, I've seen veteran developers consider this a badge of honor, implying that
there is something good about the disconnect in the language in the code versus the ubiquitous
language of the business. I've heard comments that this means "I know a lot more than I realized"
or "it is what it is" or "it's all part of becoming an experienced software developer."  Instead
I'd challenge any developer to consider that onboarding a new
developer to your project should be as simple as introducing the domain using the ubiquitous language
to describe how the business works, and then showing the new developer how that ubiquitous language is
manifest in the code. Ideally we want the code to be caveat free, meaning the consistency of
the code's language is as close to identical with the ubiquitous language as possible in all
contexts for any given domain.
</p>

<p>
As product managers and business leaders we have an added responsibility of researching
and finding industry standard specific terms for the various domains of our business. We
should avoid making up new and novel terms (unless required because the solution is
innovative). Wherever possible we should seek to reduce the number of mental translations
of terms in this ubiquitous language across domains. Avoid redefining the same term from domain
to domain. Additionally, successful product teams do the discovery and creation of this
ubiquitous language along with necessary parties in the business prior to any development
or design work ever begins. This might sound obvious and straightforward, yet how many times
have you found yourself as a product manager creating stories for designers and developers
without having a clearly defined ubiquitous language?  The reality is that all teams eventually
create this ubiquitous language out of necessity. It just so happens that successful teams
create this language ahead of the implementation work. Not doing so often puts the success of
the project in jeopardy and will likely result in projects going over time and
over budget.
</p>

<p>
One final note about successful teams and their ubiquitous language practice is being
unafraid to communicate failure, and redefine the ubiquitous language whenever necessary.
I've observed teams form attachments to an ubiquitous language that was insufficient, and
rather than let go of that ubiquitous language instead dig their heels in and force fit the
language and perform gymnastics to make it work. Modeling the problem or solution space
correctly with an inadequate ubiquitous language often results in hours of extra and unnecessary
conversations to clarify stories and explain caveats and special exceptions to the ubiquitous
langage. Overtime, such teams demonstrate to the business that modeling the problems and defining
a ubiquitous language results in projects going over time and over budget, and perceive the
source of the problem the process of creating an ubiquitous language. If you are on a team
and communication feels like a waste of time, or terms mean different things within the same
business domain, those are powerful signals that the ubiquitous language needs to be reconsidered
or actively recreated.
</p>

<p>
The emphasis on communication cannot be underscored. Successful teams engage in co-creating
ubiquitous language out of necessity in order to properly model and define the problems
the business seeks to solve before any actual work begins. However, they do so with the
input of all parties of the business whose success is dependent on this language, and they
spend only enough time as is necessary to satisfactorily model the problem and solution space.
Any more or any less is either overkill or insufficient.
</p>
