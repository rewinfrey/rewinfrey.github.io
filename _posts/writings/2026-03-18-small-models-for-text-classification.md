---
layout: writing
group: Writings
title: "Small Models for On-Device Text Classification"
summary: "LLMs are powerful classifiers, but they require API calls, cost money per request, and can't run offline. This post explores the landscape of small models, from bag-of-words to transformers to contrastive learning, that can classify text entirely on a phone or tablet."
date: 2026-03-18 12:00:00
categories:
- writings
---

Imagine you've built a text classification system. It takes short incident descriptions like "EE hurt back lifting patient" and "forklift struck shelving unit in warehouse" and classifies them into one of fifteen safety categories. You've been using Claude or GPT to do this, and it works well: 85-90% accuracy, with the model reasoning through each classification. But every prediction requires an API call, costs money, and needs an internet connection. What if you could ship a model small enough to run entirely on a phone?

This is the **on-device inference problem**, and it sits at the intersection of natural language processing, model compression, and mobile engineering. The goal is to take the classification intelligence of a large language model and distill it into something that fits in a 20-50MB app bundle and runs in milliseconds on consumer hardware.

This post walks through the landscape of small text classification models, covering what they are, how they work, and the architectural ideas that make them possible. We'll start from the simplest approaches and build toward the transformer-based methods that currently represent the state of the art for compact classifiers. By the end, you'll understand each component in the pipeline below and how they fit together to get a classifier onto a mobile device.

<div style="text-align: center; margin: 2rem 0 0.25rem; font-family: 'Libre Baskerville', Georgia, serif; font-size: 0.95rem; font-weight: 600; color: #3d3a36;">From Transformer to On-Device Classifier</div>
<div style="text-align: center; margin-bottom: 1rem; font-size: 0.8rem; color: #8b7355;">Each step builds on the previous one.</div>
<svg viewBox="0 0 680 460" style="width: 100%; max-width: 680px; display: block; margin: 0 auto 1.5rem;" xmlns="http://www.w3.org/2000/svg">

  <!-- Transformers (accent) -->
  <rect x="145" y="6" width="390" height="56" rx="6" fill="rgba(196,90,59,0.05)" stroke="rgba(196,90,59,0.2)" stroke-width="1"/>
  <text x="340" y="29" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="16" font-weight="600" fill="#3d3a36">Attention / Transformers</text>
  <text x="340" y="49" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="13.5" fill="#8b7355">Context-dependent representations</text>

  <line x1="340" y1="62" x2="340" y2="78" stroke="#3d3a36" stroke-width="1" opacity="0.2"/>

  <!-- BERT -->
  <rect x="175" y="78" width="330" height="56" rx="6" fill="rgba(61,58,54,0.04)" stroke="rgba(61,58,54,0.15)" stroke-width="1"/>
  <text x="340" y="101" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="16" font-weight="600" fill="#3d3a36">BERT</text>
  <text x="340" y="121" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="13.5" fill="#8b7355">Pre-trained bidirectional encoder</text>

  <line x1="340" y1="134" x2="340" y2="150" stroke="#3d3a36" stroke-width="1" opacity="0.2"/>

  <!-- Model Compression -->
  <rect x="100" y="150" width="480" height="72" rx="6" fill="rgba(61,58,54,0.04)" stroke="rgba(61,58,54,0.15)" stroke-width="1"/>
  <text x="340" y="174" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="16" font-weight="600" fill="#3d3a36">Model Compression</text>
  <text x="340" y="194" text-anchor="middle" font-family="'Source Code Pro', monospace" font-size="12" fill="#5a5550">DistilBERT · TinyBERT · MobileBERT</text>
  <text x="340" y="212" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="13.5" fill="#8b7355">Shrinks the encoder for mobile</text>

  <line x1="340" y1="222" x2="340" y2="238" stroke="#3d3a36" stroke-width="1" opacity="0.2"/>

  <!-- Sentence Transformers -->
  <rect x="95" y="238" width="490" height="56" rx="6" fill="rgba(61,58,54,0.04)" stroke="rgba(61,58,54,0.15)" stroke-width="1"/>
  <text x="340" y="261" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="16" font-weight="600" fill="#3d3a36">Sentence Transformer Training</text>
  <text x="340" y="281" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="13.5" fill="#8b7355">Fine-tunes for similarity-optimized embeddings</text>

  <line x1="340" y1="294" x2="340" y2="310" stroke="#3d3a36" stroke-width="1" opacity="0.2"/>

  <!-- SetFit (accent) -->
  <rect x="170" y="310" width="340" height="56" rx="6" fill="rgba(196,90,59,0.05)" stroke="rgba(196,90,59,0.2)" stroke-width="1"/>
  <text x="340" y="333" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="16" font-weight="600" fill="#3d3a36">SetFit</text>
  <text x="340" y="353" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="13.5" fill="#8b7355">Few-shot contrastive fine-tuning</text>

  <line x1="340" y1="366" x2="340" y2="382" stroke="#3d3a36" stroke-width="1" opacity="0.2"/>

  <!-- On-Device Classifier (strong accent) -->
  <rect x="150" y="382" width="380" height="56" rx="6" fill="rgba(196,90,59,0.08)" stroke="rgba(196,90,59,0.25)" stroke-width="1"/>
  <text x="340" y="405" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="16" font-weight="600" fill="#c45a3b">On-Device Classifier</text>
  <text x="340" y="425" text-anchor="middle" font-family="'Source Serif 4', Georgia, serif" font-size="13.5" fill="#8b7355">Runs entirely on a phone or tablet</text>
</svg>

---

## From Words to Numbers

Every text classification model, no matter how sophisticated, must solve the same foundational problem: converting variable-length text into a fixed-length numerical representation that a classifier can consume. The history of NLP is largely the history of increasingly powerful solutions to this problem.

### Bag of Words

The simplest approach ignores word order entirely. Build a vocabulary of all words in your training data, then represent each document as a vector of word counts. If your vocabulary has 10,000 words, every document becomes a 10,000-dimensional vector, mostly filled with zeros.

A variant called **TF-IDF** (term frequency-inverse document frequency) improves on raw counts by weighting words that appear in fewer documents more heavily. The word "forklift" appearing in an incident description is far more informative than the word "the," and TF-IDF captures this.

Pair these representations with a logistic regression or support vector machine, and you have a text classifier that is:

- **Tiny**: The model is a vocabulary mapping plus a weight matrix. A few megabytes at most.
- **Fast**: Classification is a sparse vector dot product. Microseconds on any hardware.
- **Surprisingly competitive**: For domain-specific tasks with distinctive vocabulary, TF-IDF classifiers can produce strong baselines.

The limitation is that bag-of-words representations discard all semantic structure. "The forklift struck the worker" and "The worker struck the forklift" produce identical vectors, despite describing very different incidents. To do better, we need representations that understand meaning.

### Word Embeddings

In 2013, Tomas Mikolov and colleagues at Google published **Word2Vec**,<span class="cdc-cite"><a href="#ref-1">[1]</a></span> a method for learning dense vector representations of words from large text corpora. The key insight was that words appearing in similar contexts should have similar representations. The model learns 100-300 dimensional vectors for each word such that semantic relationships are encoded as geometric relationships in the vector space.

Consider the famous example. The vector for "king" minus "man" plus "woman" lands near "queen." These aren't hand-crafted rules. They emerge from training on billions of words of text.

For classification, you can average the word embeddings of all words in a document to produce a single vector, then feed that to a classifier. This is the approach behind **FastText**,<span class="cdc-cite"><a href="#ref-2">[2]</a></span> released by Facebook in 2016. FastText goes further by also learning embeddings for character n-grams (subword units), which helps it handle misspellings and rare words. This is a significant advantage for messy, real-world text like incident reports.

FastText models are remarkably small (1-10MB), fast to train, and fast at inference. For many practical classification tasks, they represent an excellent trade-off between accuracy and simplicity. But they still average over word order, and they assign each word a single fixed embedding regardless of context. The word "bank" gets the same vector whether it appears in "river bank" or "bank account."

### Contextual Embeddings and the Attention Mechanism

The breakthrough that changed everything was the **attention mechanism**, introduced in 2017 by Vaswani et al. in the paper "Attention Is All You Need."<span class="cdc-cite"><a href="#ref-3">[3]</a></span>

Instead of representing a word with a single fixed vector, compute its representation dynamically based on every other word in the sentence. When processing the word "bank" in "flooded river bank," the model attends to "river" and "flooded" and produces a representation that captures the waterway meaning. In "opened a bank account," the same word attends to "account" and "opened" and produces a completely different representation.

Mechanically, attention works through three learned projections of each word's embedding: a **query** (what am I looking for?), a **key** (what do I contain?), and a **value** (what information do I provide). The attention score between two words is the dot product of one word's query with another's key, normalized by a softmax. High scores mean "these words are relevant to each other." The output for each word is a weighted sum of all values, where the weights are the attention scores.

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{T}}{\sqrt{d_k}}\right)V$$

This is **self-attention**, where the sequence attends to itself. Stack multiple layers of self-attention with feedforward networks between them, and you get a **transformer**, a model that builds increasingly abstract contextual representations of text through successive layers of attention.

---

## The Transformer Family Tree

The original transformer was designed for translation (sequence-to-sequence). But researchers quickly discovered that the architecture, or pieces of it, could be adapted for many tasks, producing three major branches.

1. **Encoder-only** (BERT and descendants): Read the entire input at once, attending to words both before and after each position. Best for classification and understanding tasks.
2. **Decoder-only** (GPT family): Process text left-to-right, generating one token at a time. Best for text generation.
3. **Encoder-decoder** (T5, BART): Use both halves. Best for tasks that transform input text into different output text.

For text classification, we care about **encoder-only** models. These read the entire input and produce a single representation that captures its meaning, which is exactly what a classifier needs.

### BERT: The Foundation

**BERT** (Bidirectional Encoder Representations from Transformers)<span class="cdc-cite"><a href="#ref-4">[4]</a></span> was released by Google in 2018 and became the foundation for a generation of NLP models. BERT-base has 12 transformer layers, 768-dimensional hidden states, 12 attention heads, and 110 million parameters. BERT-large doubles most of these dimensions to 340 million parameters.

BERT is pre-trained on a massive text corpus using two objectives: **masked language modeling** (predict randomly masked words from context) and **next sentence prediction** (determine if two sentences are consecutive in the original text). This pre-training teaches the model general language understanding. You then **fine-tune** BERT on your specific classification task by adding a small classification head on top and training for a few epochs on labeled examples.

Fine-tuning BERT typically achieves state-of-the-art results on text classification benchmarks, but the model is too large for mobile deployment. At 440MB (FP32), BERT-base alone exceeds reasonable app size budgets, and inference requires significant compute.

### Making Transformers Smaller

The quest to shrink BERT while preserving its capabilities has produced a rich landscape of techniques. These fall into several families.

#### Knowledge Distillation

The idea behind distillation<span class="cdc-cite"><a href="#ref-5">[5]</a></span> is to train a small **student** model to mimic the behavior of a large **teacher** model. Instead of training the student on hard labels (class 0 or class 1), you train it on the teacher's soft probability distribution over all classes. These soft targets carry more information than hard labels. A teacher that assigns 70% to the correct class and 20% to a related class is teaching the student about inter-class similarity.

**DistilBERT**<span class="cdc-cite"><a href="#ref-6">[6]</a></span> applied this to BERT, producing a 6-layer model (compared to BERT's 12) that retains 97% of BERT's language understanding while being 60% smaller and 60% faster. At 66 million parameters, it's a meaningful reduction but still large for mobile.

**TinyBERT**<span class="cdc-cite"><a href="#ref-7">[7]</a></span> uses a more aggressive distillation method that matches not just the teacher's output probabilities but also its intermediate representations, including attention matrices and hidden states at each layer. This richer supervision signal is what allows TinyBERT to compress into a much smaller architecture (6 layers, 14.5 million parameters) while still retaining useful behavior. The better the distillation, the smaller you can make the student.

#### Architectural Efficiency

**ALBERT**<span class="cdc-cite"><a href="#ref-8">[8]</a></span> (A Lite BERT) takes a different approach by sharing parameters across layers. Instead of having unique weight matrices for each transformer layer, ALBERT shares weights across layers. The same parameters are applied repeatedly, like an unrolled recurrent network. ALBERT also factorizes the embedding matrix, separating the vocabulary embedding size from the hidden layer size. ALBERT-tiny achieves dramatic parameter reduction (4 million parameters) at the cost of some accuracy.

**MobileBERT**<span class="cdc-cite"><a href="#ref-9">[9]</a></span> was designed specifically for mobile deployment. It uses a "bottleneck" architecture where each transformer layer has a narrow hidden size (128 dimensions) with wider feedforward blocks, maintaining representational capacity while reducing the parameter count. At 25 million parameters, MobileBERT fits comfortably in a mobile app.

#### Sentence Transformers

The compressed models above give us smaller encoders, but classification requires one more step. A classifier needs a single fixed-length vector for each input, and it needs similar inputs to land near each other in the vector space so that decision boundaries are easy to draw. Standard BERT produces a separate vector for each token in the input. You can collapse these into a single vector by using the special `[CLS]` token (a dedicated token BERT prepends to every input, whose output vector is trained to represent the entire sequence), or by averaging all token vectors. But these representations are not optimized for similarity between inputs, so texts with the same label don't necessarily cluster together. (Note that despite the name "sentence transformers," these models work on any text up to their token limit, typically 512 tokens, which covers paragraphs and short documents.)

**Sentence-BERT** (SBERT)<span class="cdc-cite"><a href="#ref-10">[10]</a></span> fine-tunes BERT specifically to produce high-quality sentence embeddings. It uses a **siamese network** architecture in which the same BERT model processes two sentences independently, then a loss function pushes similar sentences together and dissimilar sentences apart in the embedding space.

The **[sentence-transformers](https://www.sbert.net/)** library provides a family of pre-trained models optimized this way. The choice between them is primarily a size-vs-quality trade-off, shaped by your deployment constraints.

<div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 1.5rem 0;">
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">all-MiniLM-L6-v2</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">22M params · 384-dim · ~22 MB quantized</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">The default starting point for mobile. Small enough to bundle in an app, fast inference on-device, and strong enough for most domain-specific classification tasks. Start here and only move up if your eval accuracy plateaus.</div>
  </div>
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">all-MiniLM-L12-v2</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">33M params · 384-dim · ~33 MB quantized</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">The upgrade path from L6. Doubles the transformer layers (6 → 12) while keeping the same 384-dim embedding, so your downstream pipeline stays unchanged. Only the encoder grows. Worth trying when L6 accuracy isn't enough.</div>
  </div>
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://huggingface.co/BAAI/bge-small-en-v1.5" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">bge-small-en-v1.5</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">33M params · 384-dim · ~33 MB quantized</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">Trained with a different objective (retrieval-focused) that produces embeddings better at distinguishing subtle semantic similarity. A good choice when your categories overlap, e.g., separating "struck by object" from "caught between objects" in safety classification.</div>
  </div>
  <div style="background: rgba(196,90,59,0.06); border: 1px solid rgba(196,90,59,0.2); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg> <a href="https://huggingface.co/sentence-transformers/all-mpnet-base-v2" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">all-mpnet-base-v2</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">110M params · 768-dim · ~110 MB quantized</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">Too large for mobile deployment. Useful server-side as a high-quality teacher for knowledge distillation, or when you need the best possible embeddings and model size doesn't matter. Think of it as the quality ceiling to benchmark against.</div>
  </div>
</div>

These sentence transformers are the building blocks for the approach we'll explore next.

---

## SetFit: Few-Shot Classification Without Prompts

Traditional fine-tuning requires hundreds or thousands of labeled examples per class to be effective. For many real-world tasks, labeled data is scarce and expensive to obtain. **SetFit** (Sentence Transformer Fine-tuning)<span class="cdc-cite"><a href="#ref-11">[11]</a></span> addresses this with a two-phase training approach designed for few-shot scenarios.

### Phase 1: Contrastive Learning

SetFit generates pairs of sentences from your training data.

- **Positive pairs**: Two sentences with the same label.
- **Negative pairs**: Two sentences with different labels.

To make this concrete, imagine a training set with three labeled examples:

<div style="margin: 1.25rem 0; font-size: 0.88rem; line-height: 1.7;">
<div style="padding: 0.6rem 1rem; background: rgba(61,58,54,0.04); border-left: 3px solid #8b7355; margin-bottom: 0.4rem; border-radius: 0 4px 4px 0;">
  <strong style="color: #8b7355;">A.</strong> "EE hurt back lifting patient" &rarr; <strong>Strain/Sprain</strong>
</div>
<div style="padding: 0.6rem 1rem; background: rgba(61,58,54,0.04); border-left: 3px solid #8b7355; margin-bottom: 0.4rem; border-radius: 0 4px 4px 0;">
  <strong style="color: #8b7355;">B.</strong> "Nurse strained shoulder moving bed" &rarr; <strong>Strain/Sprain</strong>
</div>
<div style="padding: 0.6rem 1rem; background: rgba(61,58,54,0.04); border-left: 3px solid #c45a3b; border-radius: 0 4px 4px 0;">
  <strong style="color: #c45a3b;">C.</strong> "Forklift struck shelving in warehouse" &rarr; <strong>Struck By</strong>
</div>
</div>

SetFit generates pairs from these examples:

<div style="margin: 1.25rem 0; font-size: 0.85rem; font-family: 'Source Code Pro', 'Fira Code', monospace;">
<div style="padding: 0.5rem 1rem; background: rgba(139,115,85,0.08); border-radius: 4px; margin-bottom: 0.35rem; color: #3d3a36;">
  <span style="color: #8b7355; font-weight: 600;">Positive:</span> (A, B) &mdash; both Strain/Sprain &rarr; push embeddings <em>closer</em>
</div>
<div style="padding: 0.5rem 1rem; background: rgba(196,90,59,0.08); border-radius: 4px; margin-bottom: 0.35rem; color: #3d3a36;">
  <span style="color: #c45a3b; font-weight: 600;">Negative:</span> (A, C) &mdash; Strain/Sprain vs. Struck By &rarr; push embeddings <em>apart</em>
</div>
<div style="padding: 0.5rem 1rem; background: rgba(196,90,59,0.08); border-radius: 4px; color: #3d3a36;">
  <span style="color: #c45a3b; font-weight: 600;">Negative:</span> (B, C) &mdash; Strain/Sprain vs. Struck By &rarr; push embeddings <em>apart</em>
</div>
</div>

Three examples produce three pairs. With 10 examples per class across 5 classes, you get thousands of pairs. This combinatorial amplification is what makes SetFit effective with limited labeled data, because the model sees many more training signals than the raw label count suggests.

It then fine-tunes a pre-trained sentence transformer using a contrastive loss that pulls positive-pair embeddings together and pushes negative-pair embeddings apart. This phase reshapes the embedding space so that sentences of the same class cluster together.

### Phase 2: Classification Head

After the embedding space has been reshaped, SetFit trains a simple classification head (typically logistic regression) on the fine-tuned embeddings. This head learns the decision boundaries between the clusters that Phase 1 created.

To visualize what this looks like, imagine projecting the 384-dimensional embeddings down to two dimensions. Before contrastive fine-tuning, incidents from different categories are scattered and overlapping. After Phase 1, they form distinct clusters.

<div style="text-align: center; margin: 1.5rem 0 0.25rem; font-family: 'Libre Baskerville', Georgia, serif; font-size: 0.95rem; font-weight: 600; color: #3d3a36;">Embedding Space After Contrastive Fine-Tuning</div>
<div style="text-align: center; margin-bottom: 1rem; font-size: 0.8rem; color: #8b7355;">Each sphere is one incident description. Nearby points share similar meaning.</div>
<svg viewBox="0 0 580 420" style="width: 100%; max-width: 580px; display: block; margin: 0 auto 1.5rem;" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Near (foreground) sphere gradients — full saturation, strong highlight -->
    <radialGradient id="sn-br" cx="30%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#d4b888"/><stop offset="40%" stop-color="#8b7355"/><stop offset="100%" stop-color="#5a4a35"/>
    </radialGradient>
    <radialGradient id="sn-te" cx="30%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f09070"/><stop offset="40%" stop-color="#c45a3b"/><stop offset="100%" stop-color="#7a2f1a"/>
    </radialGradient>
    <radialGradient id="sn-gr" cx="30%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#8a8580"/><stop offset="40%" stop-color="#5a5550"/><stop offset="100%" stop-color="#2d2a26"/>
    </radialGradient>
    <!-- Mid sphere gradients -->
    <radialGradient id="sm-br" cx="32%" cy="32%" r="60%">
      <stop offset="0%" stop-color="#c0a67a"/><stop offset="50%" stop-color="#9a8362"/><stop offset="100%" stop-color="#7a6548"/>
    </radialGradient>
    <radialGradient id="sm-te" cx="32%" cy="32%" r="60%">
      <stop offset="0%" stop-color="#e08868"/><stop offset="50%" stop-color="#c86850"/><stop offset="100%" stop-color="#a04830"/>
    </radialGradient>
    <radialGradient id="sm-gr" cx="32%" cy="32%" r="60%">
      <stop offset="0%" stop-color="#807b76"/><stop offset="50%" stop-color="#6a6560"/><stop offset="100%" stop-color="#4a4540"/>
    </radialGradient>
    <!-- Far (background) sphere gradients — washed out, flat -->
    <radialGradient id="sf-br" cx="40%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#d0c4ae"/><stop offset="60%" stop-color="#bfb49a"/><stop offset="100%" stop-color="#b0a48c"/>
    </radialGradient>
    <radialGradient id="sf-te" cx="40%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#e8b0a0"/><stop offset="60%" stop-color="#d8a090"/><stop offset="100%" stop-color="#c89080"/>
    </radialGradient>
    <radialGradient id="sf-gr" cx="40%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#b5b0ab"/><stop offset="60%" stop-color="#a5a09b"/><stop offset="100%" stop-color="#959088"/>
    </radialGradient>
  </defs>

  <!-- Axes from origin at (80, 370) -->
  <line x1="80" y1="370" x2="555" y2="370" stroke="#3d3a36" stroke-width="1.2" opacity="0.2"/>
  <line x1="80" y1="370" x2="80" y2="25" stroke="#3d3a36" stroke-width="1.2" opacity="0.2"/>
  <line x1="80" y1="370" x2="15" y2="408" stroke="#3d3a36" stroke-width="1.2" opacity="0.2"/>
  <polygon points="555,370 548,367 548,373" fill="#3d3a36" opacity="0.2"/>
  <polygon points="80,25 77,32 83,32" fill="#3d3a36" opacity="0.2"/>
  <polygon points="15,408 23,403 20,396" fill="#3d3a36" opacity="0.2"/>

  <!-- ================================================ -->
  <!-- BACKGROUND DUST — layered far → mid → near       -->
  <!-- Size range: 1.5 (far) to 4 (near)                -->
  <!-- ================================================ -->

  <!-- Far dust (small, faint) -->
  <circle cx="115" cy="320" r="1.5" fill="url(#sf-gr)" opacity="0.18"/>
  <circle cx="305" cy="348" r="1.5" fill="url(#sf-br)" opacity="0.16"/>
  <circle cx="425" cy="340" r="1.5" fill="url(#sf-te)" opacity="0.16"/>
  <circle cx="345" cy="55" r="1.5" fill="url(#sf-gr)" opacity="0.18"/>
  <circle cx="138" cy="138" r="1.5" fill="url(#sf-br)" opacity="0.16"/>
  <circle cx="535" cy="148" r="1.5" fill="url(#sf-te)" opacity="0.16"/>
  <circle cx="275" cy="65" r="1.5" fill="url(#sf-gr)" opacity="0.18"/>
  <circle cx="100" cy="250" r="1.5" fill="url(#sf-br)" opacity="0.16"/>
  <circle cx="320" cy="190" r="1.5" fill="url(#sf-te)" opacity="0.16"/>
  <circle cx="410" cy="65" r="1.5" fill="url(#sf-gr)" opacity="0.17"/>
  <circle cx="510" cy="360" r="1.5" fill="url(#sf-br)" opacity="0.16"/>
  <circle cx="550" cy="80" r="1.5" fill="url(#sf-te)" opacity="0.15"/>
  <circle cx="90" cy="355" r="1.5" fill="url(#sf-gr)" opacity="0.16"/>
  <circle cx="450" cy="50" r="1.5" fill="url(#sf-br)" opacity="0.17"/>
  <circle cx="210" cy="380" r="1.5" fill="url(#sf-te)" opacity="0.15"/>
  <circle cx="170" cy="50" r="1.5" fill="url(#sf-gr)" opacity="0.16"/>

  <!-- Mid dust -->
  <circle cx="485" cy="175" r="2.5" fill="url(#sm-gr)" opacity="0.30"/>
  <circle cx="195" cy="85" r="2.5" fill="url(#sm-br)" opacity="0.28"/>
  <circle cx="515" cy="290" r="2.5" fill="url(#sm-te)" opacity="0.28"/>
  <circle cx="248" cy="315" r="2.5" fill="url(#sm-br)" opacity="0.30"/>
  <circle cx="375" cy="300" r="2.5" fill="url(#sm-te)" opacity="0.28"/>
  <circle cx="540" cy="225" r="2.5" fill="url(#sm-gr)" opacity="0.28"/>
  <circle cx="130" cy="170" r="2.5" fill="url(#sm-te)" opacity="0.26"/>
  <circle cx="305" cy="90" r="2.5" fill="url(#sm-gr)" opacity="0.28"/>
  <circle cx="520" cy="185" r="2.5" fill="url(#sm-br)" opacity="0.27"/>
  <circle cx="240" cy="175" r="2.5" fill="url(#sm-te)" opacity="0.28"/>
  <circle cx="420" cy="310" r="2.5" fill="url(#sm-gr)" opacity="0.26"/>
  <circle cx="155" cy="340" r="2.5" fill="url(#sm-br)" opacity="0.28"/>
  <circle cx="495" cy="55" r="2.5" fill="url(#sm-te)" opacity="0.27"/>

  <!-- Near dust (close to viewer, but modest size) -->
  <circle cx="465" cy="95" r="3.5" fill="url(#sn-gr)" opacity="0.30"/>
  <circle cx="155" cy="205" r="3.5" fill="url(#sn-br)" opacity="0.28"/>
  <circle cx="495" cy="345" r="3.5" fill="url(#sn-gr)" opacity="0.26"/>
  <circle cx="295" cy="365" r="4" fill="url(#sn-te)" opacity="0.28"/>
  <circle cx="530" cy="120" r="3.5" fill="url(#sn-br)" opacity="0.26"/>
  <circle cx="360" cy="355" r="3.5" fill="url(#sn-gr)" opacity="0.27"/>
  <circle cx="108" cy="290" r="4" fill="url(#sn-te)" opacity="0.28"/>
  <circle cx="545" cy="310" r="3.5" fill="url(#sn-br)" opacity="0.26"/>
  <circle cx="225" cy="48" r="3.5" fill="url(#sn-gr)" opacity="0.27"/>
  <circle cx="440" cy="375" r="3.5" fill="url(#sn-te)" opacity="0.26"/>

  <!-- ================================================ -->
  <!-- STRAIN/SPRAIN CLUSTER (lower-left)               -->
  <!-- Size range: 2 (far) to 6 (near)                  -->
  <!-- ================================================ -->

  <!-- Far points -->
  <circle cx="148" cy="255" r="2" fill="url(#sf-br)" opacity="0.40"/>
  <circle cx="218" cy="288" r="2" fill="url(#sf-br)" opacity="0.38"/>
  <circle cx="232" cy="252" r="2" fill="url(#sf-br)" opacity="0.40"/>
  <circle cx="170" cy="242" r="2" fill="url(#sf-br)" opacity="0.38"/>
  <circle cx="200" cy="248" r="2" fill="url(#sf-br)" opacity="0.36"/>
  <circle cx="225" cy="265" r="2" fill="url(#sf-br)" opacity="0.38"/>

  <!-- Cluster envelope -->
  <ellipse cx="185" cy="268" rx="72" ry="48" fill="rgba(139,115,85,0.05)" stroke="rgba(139,115,85,0.15)" stroke-width="1" transform="rotate(-8, 185, 268)"/>

  <!-- Mid points -->
  <circle cx="192" cy="258" r="3.5" fill="url(#sm-br)" opacity="0.70"/>
  <circle cx="168" cy="278" r="3.5" fill="url(#sm-br)" opacity="0.65"/>
  <circle cx="210" cy="272" r="3.5" fill="url(#sm-br)" opacity="0.70"/>
  <circle cx="145" cy="272" r="3" fill="url(#sm-br)" opacity="0.60"/>
  <circle cx="215" cy="258" r="3" fill="url(#sm-br)" opacity="0.65"/>

  <!-- Near points -->
  <circle cx="178" cy="270" r="5.5" fill="url(#sn-br)"/>
  <circle cx="202" cy="282" r="6" fill="url(#sn-br)"/>
  <circle cx="158" cy="262" r="5.5" fill="url(#sn-br)"/>
  <circle cx="188" cy="285" r="5" fill="url(#sn-br)"/>

  <!-- Label -->
  <text x="185" y="334" text-anchor="middle" fill="#8b7355" font-size="13" font-weight="700" font-family="'Source Serif 4', Georgia, serif">Strain/Sprain</text>

  <!-- ================================================ -->
  <!-- STRUCK BY CLUSTER (upper-center)                 -->
  <!-- ================================================ -->

  <!-- Far points -->
  <circle cx="330" cy="142" r="2" fill="url(#sf-te)" opacity="0.40"/>
  <circle cx="390" cy="115" r="2" fill="url(#sf-te)" opacity="0.38"/>
  <circle cx="348" cy="105" r="2" fill="url(#sf-te)" opacity="0.42"/>
  <circle cx="375" cy="148" r="2" fill="url(#sf-te)" opacity="0.36"/>
  <circle cx="365" cy="108" r="2" fill="url(#sf-te)" opacity="0.38"/>
  <circle cx="340" cy="150" r="2" fill="url(#sf-te)" opacity="0.37"/>

  <!-- Cluster envelope -->
  <ellipse cx="358" cy="128" rx="65" ry="42" fill="rgba(196,90,59,0.05)" stroke="rgba(196,90,59,0.15)" stroke-width="1" transform="rotate(5, 358, 128)"/>

  <!-- Mid points -->
  <circle cx="362" cy="135" r="3.5" fill="url(#sm-te)" opacity="0.70"/>
  <circle cx="345" cy="120" r="3.5" fill="url(#sm-te)" opacity="0.65"/>
  <circle cx="380" cy="128" r="3.5" fill="url(#sm-te)" opacity="0.70"/>
  <circle cx="392" cy="138" r="3" fill="url(#sm-te)" opacity="0.60"/>
  <circle cx="350" cy="140" r="3" fill="url(#sm-te)" opacity="0.65"/>

  <!-- Near points -->
  <circle cx="355" cy="145" r="5.5" fill="url(#sn-te)"/>
  <circle cx="370" cy="125" r="6" fill="url(#sn-te)"/>
  <circle cx="338" cy="130" r="5.5" fill="url(#sn-te)"/>
  <circle cx="375" cy="140" r="5" fill="url(#sn-te)"/>

  <!-- Label -->
  <text x="358" y="82" text-anchor="middle" fill="#c45a3b" font-size="13" font-weight="700" font-family="'Source Serif 4', Georgia, serif">Struck By</text>

  <!-- ================================================ -->
  <!-- FALL CLUSTER (right-mid)                         -->
  <!-- ================================================ -->

  <!-- Far points -->
  <circle cx="438" cy="222" r="2" fill="url(#sf-gr)" opacity="0.40"/>
  <circle cx="482" cy="252" r="2" fill="url(#sf-gr)" opacity="0.38"/>
  <circle cx="458" cy="258" r="2" fill="url(#sf-gr)" opacity="0.40"/>
  <circle cx="472" cy="218" r="2" fill="url(#sf-gr)" opacity="0.36"/>
  <circle cx="445" cy="250" r="2" fill="url(#sf-gr)" opacity="0.38"/>

  <!-- Cluster envelope -->
  <ellipse cx="462" cy="238" rx="55" ry="38" fill="rgba(90,85,80,0.05)" stroke="rgba(90,85,80,0.15)" stroke-width="1" transform="rotate(-3, 462, 238)"/>

  <!-- Mid points -->
  <circle cx="470" cy="232" r="3.5" fill="url(#sm-gr)" opacity="0.70"/>
  <circle cx="450" cy="248" r="3.5" fill="url(#sm-gr)" opacity="0.65"/>
  <circle cx="442" cy="235" r="3" fill="url(#sm-gr)" opacity="0.60"/>
  <circle cx="478" cy="248" r="3" fill="url(#sm-gr)" opacity="0.65"/>

  <!-- Near points -->
  <circle cx="465" cy="220" r="5.5" fill="url(#sn-gr)"/>
  <circle cx="455" cy="242" r="6" fill="url(#sn-gr)"/>
  <circle cx="478" cy="238" r="5.5" fill="url(#sn-gr)"/>
  <circle cx="460" cy="250" r="5" fill="url(#sn-gr)"/>

  <!-- Label -->
  <text x="462" y="292" text-anchor="middle" fill="#5a5550" font-size="13" font-weight="700" font-family="'Source Serif 4', Georgia, serif">Fall</text>
</svg>

The classification head (Phase 2) then draws decision boundaries between these clusters. Because the clusters are well-separated, a simple logistic regression is enough. No deep network needed.

The classification head is tiny, just a weight matrix and bias vector. For 15 classes with 384-dimensional embeddings, the head is 15 x 384 = 5,760 parameters. The overwhelming majority of the model's parameters are in the sentence transformer backbone.

### Why SetFit Works Well for Small Models

SetFit's architecture is naturally suited to on-device deployment.

1. **The backbone is a standard sentence transformer**, which can be exported to ONNX, Core ML, or TensorFlow Lite using well-established tooling.
2. **The classification head is trivially small**, adding negligible size.
3. **Inference is two steps.** Embed the text (one forward pass through the transformer), then classify the embedding (one matrix multiply). No autoregressive generation, no beam search.
4. **Quantization is straightforward.** Sentence transformers respond well to INT8 quantization, typically losing less than 1% accuracy while reducing model size by 4x.

A SetFit model built on all-MiniLM-L6-v2, quantized to INT8, is approximately **22MB**, comfortably within mobile app size budgets.

---

## The Practical Landscape

Putting this together, here is the spectrum of approaches for on-device text classification, ordered from simplest to most capable.

<div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 1.5rem 0;">
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> TF-IDF + Logistic Regression</div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">No neural network · 1-5 MB · No quantization needed</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">Trivial to deploy with no runtime dependencies beyond basic linear algebra. A sparse vocabulary mapping plus a weight matrix. Excellent baseline to benchmark against before reaching for anything more complex.</div>
  </div>
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://fasttext.cc/" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">FastText</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">Shallow network · 1-10 MB · Prunable vocabulary for size control</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">Native mobile SDKs available for both iOS and Android. Handles misspellings and rare words well thanks to subword embeddings. The strongest option that doesn't require an ONNX or CoreML runtime.</div>
  </div>
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://huggingface.co/huawei-noah/TinyBERT_General_6L_768D" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">SetFit (TinyBERT backbone)</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">14.5M params · 6 layers · ~15 MB INT8 · ONNX / CoreML / TFLite</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">The smallest transformer-based option. TinyBERT's aggressive distillation from BERT produces a compact encoder that benefits from SetFit's contrastive fine-tuning. Requires ONNX or CoreML runtime in your app.</div>
  </div>
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">SetFit (MiniLM-L6 backbone)</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">22M params · 6 layers · 384-dim · ~22 MB INT8 · ONNX / CoreML / TFLite</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">The sweet spot for most on-device classification. Well-tested sentence transformer backbone, strong community support, and a good balance of size, speed, and accuracy. This is the approach we use for SIFp.</div>
  </div>
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://huggingface.co/BAAI/bge-small-en-v1.5" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">SetFit (bge-small backbone)</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">33M params · 12 layers · 384-dim · ~33 MB INT8 · ONNX / CoreML / TFLite</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">Worth trying if MiniLM-L6 struggles with semantically overlapping categories. The retrieval-optimized embeddings can better separate subtle distinctions, at the cost of a larger bundle.</div>
  </div>
  <div style="background: rgba(61,58,54,0.04); border: 1px solid rgba(61,58,54,0.12); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> <a href="https://huggingface.co/google/mobilebert-uncased" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">Fine-tuned MobileBERT</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">25M params · 24 layers · 512-dim · ~25 MB INT8 · ONNX / CoreML / TFLite</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">Designed from the ground up for mobile. Its bottleneck architecture trades embedding quality for inference speed. A good alternative to SetFit when you have enough labeled data for traditional fine-tuning (hundreds+ examples per class).</div>
  </div>
  <div style="background: rgba(196,90,59,0.06); border: 1px solid rgba(196,90,59,0.2); border-radius: 8px; padding: 1.1rem 1.25rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.95rem; color: #3d3a36; margin-bottom: 0.15rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7355" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg> <a href="https://huggingface.co/distilbert/distilbert-base-uncased" style="color: #3d3a36; text-decoration: none; border-bottom: 1px solid #8b7355;">Fine-tuned DistilBERT</a></div>
    <div style="font-size: 0.8rem; color: #8b7355; margin-bottom: 0.7rem;">66M params · 6 layers · 768-dim · ~65 MB INT8 · ONNX / CoreML / TFLite</div>
    <div style="font-size: 0.85rem; color: #3d3a36; line-height: 1.5;">Pushing the upper bound of what fits in a mobile bundle. Highest accuracy of the group, but the 65 MB size may be prohibitive depending on your app's size budget. Consider server-side deployment or as a distillation teacher.</div>
  </div>
</div>

Which model you choose depends on your deployment constraints. A strict app size budget pushes you toward TF-IDF or FastText; a need for contextual understanding with limited labeled data pushes you toward SetFit. Each step up in model size buys more representational power, but the accuracy gain is not uniform. The right trade-off depends on your application, including how much ambiguity exists between classes, how messy the input text is, and how much labeled data you can afford to produce.

### Deployment Formats

Regardless of which model you choose, getting it onto a mobile device requires converting it from a training framework (PyTorch) to a mobile inference format.

- **ONNX Runtime Mobile**: Cross-platform, supports iOS and Android, good quantization support. Probably the most pragmatic choice for cross-platform apps.
- **Core ML**: Apple's native format. Runs on the Neural Engine for maximum performance on iOS devices. Only works on Apple platforms.
- **TensorFlow Lite**: Google's mobile format. Strong Android support, also works on iOS. Mature quantization tools.

The conversion pipeline typically looks like:

<div class="sm-pipeline" style="display: flex; align-items: center; justify-content: center; gap: 0.35rem; flex-wrap: wrap; margin: 2rem 0; font-family: 'Source Serif 4', Georgia, serif; font-size: 0.85rem;">
  <span class="sm-pipeline-step" style="background: rgba(61,58,54,0.08); border: 1px solid rgba(61,58,54,0.15); border-radius: 6px; padding: 0.5rem 0.85rem; color: #3d3a36; font-weight: 600;">PyTorch Model</span>
  <span style="color: #8b7355;">&#8594;</span>
  <span class="sm-pipeline-step" style="background: rgba(61,58,54,0.08); border: 1px solid rgba(61,58,54,0.15); border-radius: 6px; padding: 0.5rem 0.85rem; color: #3d3a36;">Export to ONNX</span>
  <span style="color: #8b7355;">&#8594;</span>
  <span class="sm-pipeline-step" style="background: rgba(61,58,54,0.08); border: 1px solid rgba(61,58,54,0.15); border-radius: 6px; padding: 0.5rem 0.85rem; color: #3d3a36;">Quantize (FP32 &#8594; INT8)</span>
  <span style="color: #8b7355;">&#8594;</span>
  <span class="sm-pipeline-step" style="background: rgba(61,58,54,0.08); border: 1px solid rgba(61,58,54,0.15); border-radius: 6px; padding: 0.5rem 0.85rem; color: #3d3a36;">CoreML / TFLite</span>
  <span style="color: #8b7355;">&#8594;</span>
  <span class="sm-pipeline-step" style="background: rgba(196,90,59,0.1); border: 1px solid rgba(196,90,59,0.3); border-radius: 6px; padding: 0.5rem 0.85rem; color: #c45a3b; font-weight: 600;">Bundle in App</span>
</div>

### What About Non-Transformer Alternatives?

For some tasks, the simplest approach is the best one. Before committing to a transformer-based model, it's worth benchmarking TF-IDF or FastText on your specific task. If a 2MB FastText model achieves 85% accuracy and a 22MB MiniLM SetFit model achieves 89%, the 4 percentage points may not justify the additional complexity, size, and inference latency.

The advantage of transformer-based approaches becomes most pronounced in a few situations.
- Your text is **semantically ambiguous** and word order matters (bag-of-words fails).
- You have **limited labeled data** (SetFit's contrastive learning amplifies small datasets).
- You need to handle **linguistic diversity** like misspellings, abbreviations, multilingual input, and terse vs. verbose descriptions.

For workplace incident reports, which are often terse, full of abbreviations, grammatically imperfect, and span multiple industries, the contextual understanding of a transformer tends to matter.

---

## Looking Forward

The small model landscape is evolving rapidly. A few directions are worth watching:

**Structured pruning** removes entire attention heads or feedforward neurons that contribute least to task performance, producing models that are architecturally smaller (not just numerically compressed). Unlike quantization, pruning reduces actual computation at inference time.

**Matryoshka embeddings**<span class="cdc-cite"><a href="#ref-12">[12]</a></span> train models to produce embeddings that are useful at multiple dimensionalities. The first 64 dimensions are optimized to be as informative as possible, then the first 128, then the first 256. This allows deploying the same model at different quality/size trade-offs by simply truncating the embedding vector.

**On-device fine-tuning** is beginning to emerge in frameworks like Core ML and TensorFlow Lite. The idea is to personalize a pre-shipped model based on the user's specific data, without sending that data to a server. For safety classification, this could mean a base model that improves as a client reviews and corrects predictions.

The trajectory is clear. Capable models are getting smaller, and the tooling for deploying them on consumer devices is maturing. For text classification tasks, where the input is short, the output is a discrete label, and the model architecture is a simple encoder, we're already at the point where on-device inference is practical, performant, and cost-free at the point of use.

---

### References

See the <a href="/references/small-models">annotated bibliography</a> for notes on each paper and additional links.

<script>
MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>

<ol class="cdc-references">
  <li id="ref-1">Mikolov, T., Chen, K., Corrado, G., & Dean, J. (2013). <em>Efficient estimation of word representations in vector space.</em> <a href="https://arxiv.org/abs/1301.3781">arXiv:1301.3781</a></li>
  <li id="ref-2">Joulin, A., Grave, E., Bojanowski, P., & Mikolov, T. (2017). <em>Bag of tricks for efficient text classification.</em> <a href="https://arxiv.org/abs/1607.01759">arXiv:1607.01759</a></li>
  <li id="ref-3">Vaswani, A., et al. (2017). <em>Attention is all you need.</em> NeurIPS 2017. <a href="https://arxiv.org/abs/1706.03762">arXiv:1706.03762</a></li>
  <li id="ref-4">Devlin, J., Chang, M., Lee, K., & Toutanova, K. (2019). <em>BERT: Pre-training of deep bidirectional transformers for language understanding.</em> <a href="https://arxiv.org/abs/1810.04805">arXiv:1810.04805</a></li>
  <li id="ref-5">Hinton, G., Vinyals, O., & Dean, J. (2015). <em>Distilling the knowledge in a neural network.</em> <a href="https://arxiv.org/abs/1503.02531">arXiv:1503.02531</a></li>
  <li id="ref-6">Sanh, V., Debut, L., Chaumond, J., & Wolf, T. (2019). <em>DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter.</em> <a href="https://arxiv.org/abs/1910.01108">arXiv:1910.01108</a></li>
  <li id="ref-7">Jiao, X., et al. (2020). <em>TinyBERT: Distilling BERT for natural language understanding.</em> <a href="https://arxiv.org/abs/1909.10351">arXiv:1909.10351</a></li>
  <li id="ref-8">Lan, Z., et al. (2020). <em>ALBERT: A lite BERT for self-supervised learning of language representations.</em> <a href="https://arxiv.org/abs/1909.11942">arXiv:1909.11942</a></li>
  <li id="ref-9">Sun, Z., et al. (2020). <em>MobileBERT: a compact task-agnostic BERT for resource-limited devices.</em> <a href="https://arxiv.org/abs/2004.02984">arXiv:2004.02984</a></li>
  <li id="ref-10">Reimers, N. & Gurevych, I. (2019). <em>Sentence-BERT: Sentence embeddings using Siamese BERT-networks.</em> <a href="https://arxiv.org/abs/1908.10084">arXiv:1908.10084</a></li>
  <li id="ref-11">Tunstall, L., et al. (2022). <em>Efficient few-shot learning without prompts.</em> <a href="https://arxiv.org/abs/2209.11055">arXiv:2209.11055</a></li>
  <li id="ref-12">Kusupati, A., et al. (2022). <em>Matryoshka representation learning.</em> <a href="https://arxiv.org/abs/2205.13147">arXiv:2205.13147</a></li>
</ol>
