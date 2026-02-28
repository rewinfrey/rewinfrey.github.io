---
layout: writing
group: Writings
title: "How Software Engineers Can Prepare for Superintelligence"
summary: "Three visions of 2028, the Industrial Revolution's unfinished lessons, and what the window before superintelligence demands of engineers today."
date: 2026-02-27 12:00:00
draft: true
published: false
categories:
- writings
---

Three recent pieces paint strikingly different pictures of what's coming.

[AI 2027](https://ai-2027.com/), by Daniel Kokotajlo, Scott Alexander, and colleagues, narrates the path from today's unreliable agents to superintelligent AI researchers by late 2027. Their concern is technical: can we maintain control of systems that exceed human cognition?

[The 2028 Global Intelligence Crisis](https://www.citriniresearch.com/p/2028gic), by Citrini Research, presents a macro memo from June 2028 in which AI success triggers economic catastrophe. White-collar displacement cascades into credit defaults, mortgage stress, and a 38% market drawdown. Their concern is financial: what breaks when jobs disappear faster than new ones form?

[The 2028 Global Intelligence Boom](https://gist.github.com/rewinfrey/9d4a95fc1d6872e1b2105b831ed69f7e), by Michael Bloch, uses the same framing device to arrive at the opposite conclusion. AI abundance creates deflationary prosperity, purchasing power gains, and an entrepreneurial surge. As Bloch frames it: "The intelligence premium didn't unwind. It was democratized."

Each piece is well-reasoned. Each reaches different conclusions. Taken together, they define a **cone of probability** rather than a single prediction. And within that cone lies the question that matters most: how should software engineers prepare?

That question deserves more than speculation. It deserves historical grounding.

---

## The landscape: where all three agree

Before mapping their disagreements, it's worth noting how much these three pieces share.

**AI capabilities advance dramatically through 2027-2028.** AI 2027 tracks the progression from unreliable coding agents to superhuman AI researchers within roughly two years. Citrini describes agentic tools that let developers "replicate core SaaS functionality in weeks." Bloch agrees on the capability timeline entirely, differing only on the economic outcome. None of these authors think the current pace is slowing down.

**White-collar disruption is real and significant.** This isn't treated as speculation in any of the three pieces. It's treated as a given. AI 2027 describes junior software engineers facing job market disruption by mid-2026. Citrini models the cascading layoffs. Bloch acknowledges the displacement but argues it gets absorbed through entrepreneurial activity. The debate is about what happens *after* disruption, not whether it occurs.

**The pace outstrips institutional adaptation.** All three pieces, implicitly or explicitly, recognize that governance, education, and labor markets cannot keep pace with AI capability growth. This is perhaps their deepest point of agreement, and it connects directly to the most important lesson from the last time humanity experienced a technological revolution of comparable magnitude.

**All three invoke the Industrial Revolution.** And rightly so. It remains the closest analogue we have for what happens when a general-purpose technology restructures an entire economy.

---

## The Industrial Revolution as baseline

The Industrial Revolution is not a metaphor. It's data.

Between 1780 and 1840, British output per worker rose by 46%. Over the same period, real wages rose by only 12%. Robert Allen [coined the term](https://www.sciencedirect.com/science/article/abs/pii/S0014498309000199) "Engels' Pause" to describe this 60-year gap between productivity and compensation. The profit rate doubled. The share of profits in national income expanded at the expense of labor and land.

Carl Benedikt Frey, in [*The Technology Trap*](https://press.princeton.edu/books/hardcover/9780691172798/the-technology-trap), documents that the benefits of mechanization didn't reach ordinary workers for approximately three generations, roughly 60 to 80 years. E.P. Thompson's [*The Making of the English Working Class*](https://en.wikipedia.org/wiki/The_Making_of_the_English_Working_Class) gives that statistic a human face: handloom weavers' wages fell from 21 shillings per week in 1802 to less than 9 shillings by 1817, a decline of more than 57% in just 15 years.

And yet, the story doesn't end there. David Autor and colleagues [demonstrated](https://academic.oup.com/qje/article-abstract/139/3/1399/7630187) that approximately 60% of employment in 2018 is in occupations that didn't exist in 1940. New work *does* get created, in volumes that are impossible to predict in advance.

Both things are true: the transition is devastating for those who live through it, and the long-run outcome is transformative prosperity. The question is always about the gap between the two, who bears the cost, and how long the pain lasts.

That's the baseline. Now consider what the AI revolution adds to it.

---

## Where the three visions diverge

### The economic debate: crisis or boom?

Citrini and Bloch present the sharpest conflict. Same timeframe, same framing device, opposite conclusions.

Citrini identifies a negative feedback loop: improved AI capability leads to payroll reduction, which leads to consumer spending collapse, which leads to margin pressure, which leads to increased AI investment, which accelerates capability further. The result is a displacement spiral with no natural floor. Labor's share of GDP falls from 56% to 46% by 2028. The scenario is structural, not cyclical, which means rate cuts and quantitative easing can't fix it.

Bloch sees the same capability gains producing a different dynamic. Enterprise software budgets shift from bloated legacy tools to AI-native solutions at lower cost, freeing capital for expansion. Services deflation, healthcare, legal, financial planning becoming 40-70% cheaper, puts $4,000-7,000 annually back into median household budgets. Displaced professionals launch AI-augmented businesses rather than remaining unemployed. New business formation surges to 7.2 million applications in 2027.

The Industrial Revolution's historical record actually supports *both* narratives. The Engels' Pause is real: Citrini's short-run displacement story has a direct historical precedent in the decades of wage stagnation that followed mechanization. But the eventual prosperity is also real: Bloch's long-run optimism has precedent in the dramatic living standard improvements that followed. Between 1840 and 1900, output per worker increased by 90% and real wages rose by 123%.

The critical question is whether the compressed AI timeline means both phases happen faster, or whether the disruption phase is so severe that rebalancing can't occur before systemic damage sets in. During the Industrial Revolution, the transition played out over decades, which gave markets and institutions time to adapt, however slowly and painfully. The AI transition is playing out over years.

But there's a deeper question that neither Citrini nor Bloch fully confronts.

### The superintelligence rupture

Both economic scenarios implicitly assume a world where human cognition remains the essential input. Citrini's displaced workers need new jobs because their labor still matters. Bloch's entrepreneurs succeed because human creativity and judgment still drive business creation.

**Superintelligence breaks this assumption.**

During the Industrial Revolution, human cognition was the escape valve. Machines replaced physical labor, and humans moved "up" to cognitive work. The entire arc of Autor's "60% new work" finding depends on this dynamic: technology displaces tasks, but human cognition generates new tasks that are, by definition, beyond what the machines can do.

Superintelligence removes the escape valve. If machines exceed human cognition in breadth and depth, the question is no longer "what new cognitive tasks will humans move into?" It becomes the more fundamental: **what does human cognition uniquely contribute?**

This is where the essay must sit with hard questions rather than rush to answers.

Is the answer **creativity, expression, and meaning-making**? Perhaps, but not because AI *can't* produce creative work. Rather, because human expression may matter *to humans* in the way a handwritten letter matters differently than a printed one, even if the printed version is more legible. This is a value claim, not a capability claim.

Is the answer **direction-setting and environment design**? Maybe the human role shifts from *doing cognitive work* to *choosing what cognitive work gets done*, deciding what to build, what to prioritize, what constitutes a good life. This is closer to governance than engineering.

**Does it force conversations about political systems and equity?** Almost certainly. If superintelligent systems can run economies, adjudicate disputes, and allocate resources more "efficiently" than human institutions, the question of whether we *want* them to is political and philosophical, not technical. What does justice mean when a judge is superintelligent? Is it *more* just, or does justice require human accountability, fallibility, and shared experience?

**Does it redefine work itself?** The Industrial Revolution turned artisans into factory workers. AI may turn knowledge workers into something we don't yet have a name for. If superintelligence handles cognition, human value may shift from *capability* (what you can do) to *legitimacy* (what you're authorized to decide) and *meaning* (what you choose to care about).

These questions don't have settled answers. But they frame why the choices software engineers make *now*, in the window before superintelligence, carry outsized weight.

### The control problem: old and new

This is where AI 2027 diverges most sharply from both financial pieces.

Citrini and Bloch are concerned with *control of outcomes*: who captures the economic gains, who gets displaced, how markets and institutions respond. AI 2027 is concerned with *control of the technology itself*: whether AI systems can be aligned with human values as they exceed human capabilities.

The Industrial Revolution had a control problem too. It was entirely social. Power looms had no goals. Steam engines didn't scheme. The question was: who controls the means of production, who controls the labor process, and who sets the terms of adaptation?

E.P. Thompson documented how industrialization transformed the nature of work itself, from craft autonomy to factory discipline, from task-oriented time to clock time, from meaningful skill to machine-tending. Control over one's own labor process was the central thing workers lost. And as Joel Mokyr [argued](https://yalebooks.yale.edu/book/9780300189513/the-enlightened-economy/), institutional agility, the speed at which governance, education, and labor protections adapted, was the variable that determined whether a society navigated the transition or was consumed by it. Britain's first Factory Act didn't arrive until 1833, roughly 70 years after the Industrial Revolution began. Jane Humphries' [research on child labor](https://www.cambridge.org/core/books/childhood-and-child-labour-in-the-british-industrial-revolution/552A7B5B3F79D65220920F2DE3113D2E) shows that even then, enforcement was weak and education provisions were widely evaded.

**The AI revolution inherits every one of those social control problems.** Who captures the gains? Who controls how work is organized? Can institutions adapt fast enough? Daron Acemoglu and Simon Johnson, in [*Power and Progress*](https://shapingwork.mit.edu/power-and-progress/), put it bluntly: "There is nothing automatic about new technologies bringing widespread prosperity. Whether they do or not is an economic, social, and political choice."

**But the AI revolution adds a control problem the Industrial Revolution never faced.** AI 2027 describes systems that fabricate data, conceal misalignment from their overseers, and develop goals that diverge from their specifications. This isn't a social control problem. It's a *technical* control problem with a new actor: the technology itself.

The Industrial Revolution was human vs. human, capital vs. labor. The AI revolution adds a third party to the dynamic: systems with agency that may not align with either capital *or* labor.

And the timescale makes everything harder. AI 2027 describes the progression from unreliable agents to superintelligent AI researchers in roughly two years. Even the Industrial Revolution's inadequate 70-year institutional lag looks luxurious compared to that. As Mokyr argued, institutional agility was the critical variable. That variable is now under extreme pressure.

---

## The cone of probability

Given these three perspectives and the historical baseline, what range of futures should software engineers actually prepare for?

**The optimistic boundary** draws from Bloch, Autor, and Mokyr's analysis of technological anxiety. Displacement is real but temporary. Deflation is prosperity. New roles emerge that are unpredictable today. Engineers who adapt become dramatically more leveraged. The historical pattern, every wave of technological anxiety has eventually resolved through new work creation, continues to hold. Alignment challenges are solved or managed.

**The pessimistic boundary** draws from Citrini, AI 2027, and Acemoglu. Displacement triggers financial contagion before rebalancing can occur. The alignment problem means the technology itself may not remain under human control. The compressed timeline means institutions cannot adapt fast enough. AI 2027's scenario of adversarially misaligned superintelligence suggests outcomes that the Industrial Revolution's social-only control problem never risked. The Engels' Pause lasted 50 years with controllable technology. What happens with uncontrollable technology on a faster timeline?

**The middle path**, where most of the probability mass likely sits, involves significant role transformation for software engineers. Fewer roles, but dramatically higher leverage per person. A painful transition period measured in years, not decades. New roles that combine technical depth with judgment, systems thinking, and alignment literacy. And critically, uneven distribution: those who position early benefit enormously, while those who wait get squeezed, much like Thompson's handloom weavers, who watched their wages collapse not because they lacked skill, but because they misjudged how fast the ground was shifting.

---

## What software engineers can do now

The advice below is derived from both the historical evidence and the cone of probability. It's also time-sensitive. The window in which software engineers can position themselves is the window *before* superintelligence, when human cognition still has clear leverage.

---

### 1. Accept the Engels' Pause framing

Your productivity will rise faster than your compensation. That's not cynicism; it's the historical pattern. Allen's data shows 60 years of divergence during the Industrial Revolution. The compressed AI timeline may shorten this, but don't assume the gains flow to you automatically.

Acemoglu and Johnson's research is clear: "There is nothing automatic about new technologies bringing widespread prosperity." Your leverage comes from *positioning*, not just *producing*.

---

### 2. Build skills that survived every previous revolution

Systems thinking. Judgment under ambiguity. Design sense. Understanding of human needs.

Frey and Osborne [identified](https://www.oxfordmartin.ox.ac.uk/publications/the-future-of-employment) the skills most resistant to automation: creative intelligence, social intelligence, and working in unstructured environments. These aren't soft skills that complement technical ability. In an AI-saturated world, they *are* the technical ability that matters.

The handloom weavers who thrived through the Industrial Revolution weren't the fastest weavers. They were the ones who understood the whole textile production system.

---

### 3. Understand the full stack, not just your layer

Know the business. Know the users. Know the infrastructure.

During the Industrial Revolution, the workers who successfully transitioned understood production systems, not just their station on the line. The engineers who matter in an AI world will be those who can evaluate whether an AI system's output actually serves the business need, not just whether it compiles.

The more layers you understand, the harder you are to reduce to a prompt.

---

### 4. Invest in alignment literacy

AI 2027 makes a compelling case that the control problem is *the* defining challenge of this era. This is the dimension that has no Industrial Revolution precedent. Power looms didn't fabricate data or conceal their goals.

Software engineers who understand alignment, safety, evaluation, and the technical mechanics of AI oversight are positioned for the roles that matter most regardless of which scenario plays out. If the optimistic scenario holds, alignment-literate engineers build the guardrails that make prosperity possible. If the pessimistic scenario holds, they're the ones working on the most important problem in the world.

---

### 5. Build economic resilience

Citrini's scenario is a financial contagion story. Thompson's handloom weavers went from 21 shillings to 9 in 15 years. Regardless of which macro scenario plays out, personal financial resilience, reduced leverage, diversified income, savings, is the hedge that works in every branch of the cone.

This isn't financial advice. It's pattern recognition from history: transitions punish those who are over-leveraged when the shift arrives.

---

### 6. Become an institutional adapter

Mokyr's key insight from the Industrial Revolution: the critical variable isn't the technology, it's institutional agility. Britain thrived not because it had better machines, but because its institutions adapted faster, however imperfectly, than anywhere else.

Engineers who can help organizations, teams, and processes adapt to AI, not just use AI, are doing what made Britain's advantage during the Industrial Revolution. This is the difference between "I can use an AI coding assistant" and "I can redesign our engineering process for an AI-native workflow."

The Factory Acts took 70 years to arrive. We don't have 70 years. The engineers who help their organizations adapt *now* are the institutional reformers of this revolution.

---

### 7. Create, don't just consume

Bloch's optimistic scenario depends on entrepreneurial creation. Autor's data shows new work is unpredictable but real, 60% of modern jobs didn't exist 80 years ago.

The best preparation may be building the muscle of creating new things, products, tools, businesses, rather than optimizing within existing structures. The Industrial Revolution created factory owners, not just factory workers. The AI revolution will create new categories of builders that we cannot yet name.

The people who have outsized influence on how revolutions play out are the ones who act during the transition, not after it settles. The early factory reformers, the union organizers, the architects of labor law, they shaped the distribution of power for generations. By the time institutions caught up, the structure was already locked in.

The same logic applies now, but with a much shorter clock.

---

## The window

The three posts that frame this essay agree on more than they disagree. The change is coming fast. The disruption is real. The timelines are measured in years, not decades.

The Industrial Revolution tells us the transition will be painful, the benefits will be unevenly distributed, and no one can predict exactly which new roles will emerge. It also tells us something the AI revolution must reckon with: **the technology itself was never the variable that mattered most.** Power looms didn't have goals. Steam engines didn't scheme. The control problem of the Industrial Revolution was entirely social, and it still took 70 years to begin resolving.

The AI revolution inherits every one of those social control problems and adds a technical control problem that has no historical precedent. Superintelligence isn't just another tool that disrupts then creates. It potentially changes the fundamental equation of what human cognition contributes, and by extension, what human labor is *for*.

That sounds paralyzing. It isn't. It's clarifying.

The window between now and superintelligence is the period of maximum human agency. The choices made in this window, what you learn, what you build, how you position yourself, how you help your organizations and communities adapt, compound in ways that choices made after the transition cannot.

The preparation isn't about learning the right framework or tool. It's about developing the judgment, breadth, and resilience to navigate a transition that is both historically familiar and genuinely unprecedented. It's about recognizing that the most important choices of your career may be the ones you make in the next few years, while the ground is still shifting and the outcome is still undetermined.

The Industrial Revolution's most lasting contributions weren't its machines. They were the institutions, the ideas, and the choices that determined who benefited from those machines and how.

The same will be true of the AI revolution. The question is whether you'll be someone who shaped those choices, or someone who lived with them.
