---
layout: writing
group: writings
title: "10 lessons from 10 years at GitHub"
date: 2025-07-04 14:00:00
categories:
- writings-in-progress
---

After nearly a decade at GitHub as a software engineer, I've decided to pass the baton and begin a new adventure.

While I worked on GitHub's Rails monolith, most of my focus was building code intelligence services external to it.

This included contributing to <a href="https://tree-sitter.github.io/tree-sitter/">Tree-sitter</a> grammars and its runtime, helping build a research program analysis library in Haskell called <a href="https://github.com/github/semantic">Semantic</a>, and shipping GitHub's first <a href="https://docs.github.com/en/repositories/working-with-files/using-files/navigating-code-on-github">code navigation</a> service powering jump-to-definition and find-all-references features.

Later, I helped evolve the system into zero-config precise code navigation using <a href="https://github.com/github/stack-graphs">Stack Graphs</a>. With the rise of generative AI, I contributed to Copilot Chat for the web and authored the prompt-building library that powers its dynamic context logic.

Most recently, I spent the last two years working on GitHub's world-class code search system, <a href="https://github.blog/engineering/architecture-optimization/the-technology-behind-githubs-new-code-search/">Blackbird</a>.

Over these years, I've learned a lot. Here are the 10 most important lessons I'm taking with me.

---

### 1. The core is the moat

GitHub's platform is indispensable, but only because its core experience is stable, fast, and reliable.

People often describe “moats” in terms of features, data, or network effects. But none of that matters if your foundation is broken. A product with 1,000 features has little value if 900 are buggy or slow.

The real moat is consistently nailing the core experience. Always.

---

### 2. Build first for customers

Before GitHub's 2018 acquisition by Microsoft, the [Dear GitHub](https://github.com/dear-github/dear-github) letter captured widespread frustration with the platform. Under Nat Friedman's leadership, a “paper cuts” initiative helped rebuild trust with the open source community by fixing small but painful issues.

The lesson? Dogfooding is good, but over-relying on internal usage can lead to blind spots. You risk overfitting your product to narrow needs and ignoring broader customer pain.

If you're lucky, customers will tell you what's broken. If you're not, they'll leave without saying a word.

---

### 3. Make it work. Make it scale. Make it faster.

Kent Beck's classic advice, “make it work, make it right, make it fast”, holds true. But at scale, I've found another ordering works better: “Make it work, make it scale, make it faster.”

When I joined the code search team, our backfill job, responsible for keeping our 120+ million repository index fresh, was taking five days to complete. This bottleneck made experimentation risky and recovery from failure slow.

After several weeks of optimization, I cut the process from 5 days to 34 hours, a 72% improvement. It instantly increased trust in our system and unlocked team velocity.

Speed builds trust. Whether its for internal tools or user-facing products, faster wins every time.

---

### 4. Know your tools, especially the ones you build

In dev tools, there's no substitute for real usage. If you're not using your own product, you're building on assumptions.

Great engineers don't just use tools, they study them, tweak them, master them. They invest in their craft by continuously learning, challenging assumptions, and experimenting with new workflows and tools.

Follow your curiosity. Stay uncomfortable. Keep tinkering. Remember to play. Our craft improves with care.

---

### 5. Good telemetry is priceless. Bad telemetry is noise.

If you can't measure it, you can't fix it. But if you measure everything, you can't see anything.

Over-logging and dashboard overload create fog, not clarity. The best observability isn't about quantity, it's about relevance.

Keep dashboards lean. Prune aggressively. During every incident, ask:

- What helped us resolve this faster?
- What slowed us down?

Telemetry should evolve with your systems, or it'll betray you when it matters most.

---

### 6. Legacy code is a historic renovation project

Legacy systems carry the business. Customers rely on them. Maintaining them is an honor, not a chore.

In software, unlike architecture, you can renovate without permits. But that requires discipline: knowing what to preserve and what to rework.

Leaders who overlook this work during performance reviews risk starving the systems that got them here. Refactoring legacy systems is hard, risky, and essential. It should be celebrated and rewarded.

---

### 7. Software is a team sport

No matter how skilled you are, your impact depends on how well you collaborate, within your team and across functions.

Some career-changing lessons I've learned:

- Deliver consistently.
- Own what you commit.
- Reflect while building, not just after.
- Learn from teammates' strengths and share your own.
- Communicate with care, it costs others time and energy.

Growth isn't just about skill. It's about trust, connection, and shared momentum.

---

### 8. Value is subjective

The best tech doesn't always win. That's because value is rarely objective.

Influence matters. And influence starts with making the case:
- Show the business impact.
- Prove it with demos and results.
- Tell a compelling story. Repeat it.

Even then, your best ideas might not win. That's okay. Influence is a game with uneven footing, some seats are closer to the decision-maker. Play with integrity, and once the decision is made, commit and move forward.

---

### 9. Read the research

With the explosion of generative AI, the gap between what's published and what's productized is wider than ever.

Amazing ideas are freely available on <a href="https://arxiv.org">Arxiv</a>. You don't have to read everything, just skim abstracts to spot patterns.

But if you go deeper, ask:
- What's the key insight behind this result?
- Can it apply to other domains?
- How does it build on or challenge prior work?

My favorite trick: use AI to summarize a paper's bibliography and trace its intellectual lineage. Research is a superpower. Use it.

---

### 10. Be flexible enough to adapt. Be focused enough to matter.

One of the best pieces of advice I got at GitHub: “Some degree of fungibility is good.”

Adaptability unlocks opportunities. Specialization gives you the leverage to pursue them.

If fungibility gets you in the room, depth helps you lead once you're there.

After 10 years specializing in code intelligence, I'm excited to join <a href="https://nuanced.dev">Nuanced</a> to help apply program analysis and static analysis techniques to improve code generation workflows for AI.

This is a significant, unsolved problem, especially for large, complex codebases, and I'm excited to bring everything I've learned at GitHub to help solve it.

---
