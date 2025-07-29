---
layout: writing
group: writings
title: "AI Evals: Fundamentals & Lifecycle LLM Application Evaluation"
date: 2025-07-22 14:00:00
categories:
- writings-in-progress
---

How well do you know your AI application? Can you describe its failure modes beyond personal anecdotes and support tickets? Do you know how your customers are using your AI application? Can you describe the main use cases for your customers?

Anyone building AI applications has likely grappled with these questions in some form or another. When developing, and when using AI applications, some degree of volatility and inconsistency is bound to occur. But how do we detect and measure when things go wrong? How do we move beyond personal experience and support tickets and make meaningful, systematic improvements to our AI applications? How do we prioritize improvements? And how do we continue to make iterative improvement over time?

These questions, and other related processes and techniques, are the main subject of the course <a href="https://maven.com/parlance-labs/evals">AI Evals for Engineers & PMs</a> led by industry veteran, Hamel Husain, and AI researcher at UC Berkeley, Shreya Shankar. This is the first of a series of posts to distill what I learn in this course, focusing on the main themes and ideas. But please don't mistake this as a substitute for attending the course, the sessions are packed with detail and insight from Hamel and Shreya's personal experience evaluating a wide range of AI applications. If these questions and problems interest you, I highly recommend this course.

### What do we mean by "AI application"?

Broadly speaking, an AI application in this context is a system with the following parts:

* Some user input (i.e. query)
* Some AI pipeline (i.e. prompts, context management, agents, tools, etc.)
* The generated output

Most AI applications additionally have to manage many other concerns, like model access, authn and authz, rate limiting, storage and retrieval, and others. While those concerns are critical and important to the success of AI applications, these aspects are external to the heart of the focus of AI application evaluation.

In the context of this post, when I refer to AI applications, I'm speaking about the concrete inputs, the AI pipeline that processes those inputs, and the resulting output.

### What do we mean by "systematic evaluation"?

Systematic evaluation means a repeatable and consistent process to measure AI pipeline quality.

Depending on the AI application and its current state of development, there are potentially many measurements we may care about:

* How reliable, safe, and trust-worthy is the system?
* What value and how much value does the system offer?
* How easy is it to detect regressions in these areas?
* How can we reliably and consistently make incremental improvement to the system?

For anyone that has previously built an AI application, you have probably considered similar questions. However, developing AI applications is not like building standard applications. So the core question of this course is what processes and techniques enable this systematic evaluation?

### But first, why is developing AI applications so hard?

In the research paper, "Steering Semantic Data Processing With DocWrangler", Shankar and team describe three challenges, or gulfs, that arise when developing AI applications.

* Gulf of comprehension
* Gulf of specification
* Gulf of generalization


