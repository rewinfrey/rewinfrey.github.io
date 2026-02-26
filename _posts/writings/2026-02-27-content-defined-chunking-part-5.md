---
layout: writing
group: Writings
title: "Content-Defined Chunking, Part 5: The Cost of CDC at Scale"
summary: "What does CDC actually cost on cloud storage? This post models the full cost picture across seven storage providers, six cache providers, and the interplay of chunk size, container packing, and cache hit rate."
date: 2026-02-27 12:00:00
categories:
- writings
---

<style>
/* ==========================================================================
   CDC Animation Styles
/* Cloud cost table */
.cost-cloud-section {
  padding: 0 1.25rem 0.5rem;
  border-top: 1px solid rgba(61, 58, 54, 0.1);
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.cost-cloud-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.cost-cloud-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  font-weight: bold;
  color: #3d3a36;
}

.cost-cloud-workload {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.7rem;
  color: #8b7355;
}

.cost-cloud-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
}

.cost-cloud-table th {
  font-weight: bold;
  color: #3d3a36;
  text-align: right;
  padding: 0.35rem 0.5rem;
  border-bottom: 2px solid rgba(61, 58, 54, 0.15);
}

.cost-cloud-table th:first-child {
  text-align: left;
}

.cost-cloud-table td {
  padding: 0.35rem 0.5rem;
  text-align: right;
  color: #3d3a36;
  border-bottom: 1px solid rgba(61, 58, 54, 0.07);
}

.cost-cloud-table td:first-child {
  text-align: left;
  color: #8b7355;
}

.cost-cloud-table tr:last-child td {
  font-weight: bold;
  border-top: 2px solid rgba(61, 58, 54, 0.15);
  border-bottom: none;
}

.cost-cell-value {
  display: block;
}

.cost-cell-calc {
  display: block;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  color: #a08b6e;
  line-height: 1.3;
}

.cost-cloud-assumptions {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.65rem;
  color: #8b7355;
  line-height: 1.5;
}

.cost-cloud-assumptions a {
  color: #c45a3b;
}

.cost-pricing-ref {
  margin: 0.5rem 0 0.75rem;
}
.cost-pricing-ref summary {
  cursor: pointer;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.7rem;
  color: #8b7355;
  list-style: none;
  padding: 0.25rem 0;
}
.cost-pricing-ref summary::-webkit-details-marker { display: none; }
.cost-pricing-ref summary::marker { display: none; }
.cost-pricing-ref summary::before {
  content: "\25B8  ";
  display: inline-block;
  transition: transform 0.2s;
}
.cost-pricing-ref[open] summary::before {
  transform: rotate(90deg);
}
.cost-ref-table tr:last-child td {
  font-weight: normal;
  border-top: none;
  border-bottom: 1px solid rgba(61, 58, 54, 0.07);
}

/* Container packing toggle */
.container-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  color: #3d3a36;
}

.container-toggle input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  width: 36px;
  height: 20px;
  background: rgba(61, 58, 54, 0.2);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.container-toggle input[type="checkbox"]::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.container-toggle input[type="checkbox"]:checked {
  background: #2d7a4f;
}

.container-toggle input[type="checkbox"]:checked::after {
  transform: translateX(16px);
}

/* Savings row highlight */
.container-savings-row td {
  font-weight: bold !important;
  border-top: 2px solid rgba(45, 122, 79, 0.2) !important;
  border-bottom: none !important;
}

/* Jazz Cloud single-column table */
.jazz-cost-table {
  max-width: 24rem;
}

/* Comprehensive / single-column cost table */
.comprehensive-cost-table {
  max-width: 28rem;
}

/* Styled provider select dropdowns */
.cost-provider-select {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.8rem;
  color: #3d3a36;
  background: #fff;
  border: 1px solid rgba(61, 58, 54, 0.2);
  border-radius: 6px;
  padding: 0.35rem 2rem 0.35rem 0.6rem;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b7355'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.cost-provider-select:hover {
  border-color: rgba(61, 58, 54, 0.4);
}

.cost-provider-select:focus {
  outline: none;
  border-color: #c45a3b;
  box-shadow: 0 0 0 2px rgba(196, 90, 59, 0.15);
}

.cost-provider-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 42em) {
  .cost-cloud-table {
    font-size: 0.65rem;
  }
  .cost-cloud-table th,
  .cost-cloud-table td {
    padding: 0.25rem 0.3rem;
  }
  .cost-cell-calc {
    display: none;
  }
}
</style>

<div class="cdc-series-nav">
Part 5 of 5 in a series on Content-Defined Chunking. Previous: <a href="/writings/content-defined-chunking-part-4">Part 4: From Chunks to Containers</a>
</div>

In [Part 3](/writings/content-defined-chunking-part-3), the cloud cost explorer showed that when every chunk is stored as a separate object, API operations dominate the monthly bill. In [Part 4](/writings/content-defined-chunking-part-4), the Container Cost Explorer showed how packing chunks into fixed-size containers collapses that operations cost by orders of magnitude. With the container abstraction in hand, we can now explore the full cost landscape: how different storage providers, caching layers, and container configurations combine to determine what CDC actually costs at scale. This post also wraps up the series with a look at what motivated this deep dive in the first place.

---

### The Cost Comparison Continued

The dominance of per-operation costs on major cloud providers is what makes container packing essential. But a newer generation of S3-compatible storage services has emerged with pricing models that eliminate or sharply reduce the very cost dimensions that punish CDC. [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) charges zero egress. [Backblaze B2](https://www.backblaze.com/cloud-storage) offers free uploads and storage at a fraction of S3's price. [Wasabi](https://wasabi.com/) charges no per-operation fees and no egress fees at all. [Tigris](https://www.tigrisdata.com/) is S3-compatible with zero egress and built-in global edge caching that transparently serves objects from locations close to the reader. The explorer below applies the same workload to these newcomers.

<div class="cdc-viz" id="newcomer-cost-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Newcomer Cost Explorer</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Average Chunk Size: <strong id="newcomer-cost-chunk-value">32 KB</strong>
    </span>
    <input type="range" id="newcomer-cost-chunk-slider" min="0" max="100" value="50" step="1">
  </div>
  <div class="parametric-control-row">
    <label class="container-toggle">
      <input type="checkbox" id="newcomer-cost-packing-toggle">
      <span>Enable container packing</span>
    </label>
    <span class="parametric-control-label">
      Container Size: <strong id="newcomer-cost-container-value">4 MB</strong>
    </span>
    <input type="range" id="newcomer-cost-container-slider" min="0" max="2" value="0" step="1" disabled>
  </div>
  <div class="cost-cloud-section" id="newcomer-cost-cloud-section">
  </div>
  <div class="cdc-viz-hint">
    Compare with the classic providers in Part 4. Each newcomer eliminates a different cost dimension: R2 kills egress, B2 offers free uploads and cheap storage, Wasabi removes both operations and egress fees entirely, and Tigris combines zero egress with built-in edge caching.
  </div>
</div>

Beyond traditional object storage, [Jazz Cloud](https://jazz.tools/) takes a different approach entirely. Jazz is a collaborative data platform rather than a general-purpose object store, but its pricing model charges only for storage and blob egress with no per-operation fees.

<div class="cdc-viz" id="jazz-cost-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Jazz Cloud Cost Explorer</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Average Chunk Size: <strong id="jazz-cost-chunk-value">32 KB</strong>
    </span>
    <input type="range" id="jazz-cost-chunk-slider" min="0" max="100" value="50" step="1">
  </div>
  <div class="cost-cloud-section" id="jazz-cost-cloud-section">
  </div>
  <div class="cdc-viz-hint">
    Jazz Cloud is not a traditional object store, but its zero per-operation pricing illustrates what happens when that cost dimension is removed entirely.
  </div>
</div>

### Reducing Costs through Caching

The cost explorers above model a direct path: chunks flow from the writer to storage and from storage to the reader. But production systems rarely work that way. A read-through cache between readers and the storage backend can dramatically reduce both operations costs and egress, the two cost dimensions that dominate at scale.

CDC chunks are unusually well-suited for caching. Every chunk is immutable and content-addressed: its hash *is* its identity. There is no invalidation problem, because a chunk's content never changes. If chunk `a7f3e9...` is in the cache, it will be correct forever. And because deduplication shrinks the working set (many files share the same chunks), the effective cache hit rate is higher than it would be for opaque file-based caching. Popular files that share chunks with other popular files all benefit from the same cached data.

A key question for any cache is how much data must be stored to achieve a given hit rate. The answer depends on the access distribution. Breslau et al. showed that web request frequencies follow a Zipf distribution, where the *k*-th most popular item is accessed with probability proportional to 1/*k*<sup>*&alpha;*</sup>, with measured *&alpha;* values between 0.64 and 0.83.<span class="cdc-cite"><a href="#ref-37">[37]</a></span> More recent measurements by Berger et al. on real CDN and web application traces found *&alpha;* values between 0.85 and 1.0, indicating that modern access patterns are even more skewed: a small cache covers an even larger share of requests.<span class="cdc-cite"><a href="#ref-38">[38]</a></span> Under a Zipf distribution, the cache size needed for a target hit rate *h* is approximately *h*<sup>1/(1-*&alpha;*)</sup> of the total unique data. The explorers below use *&alpha;* = 0.6 (the conservative end of the Breslau range), giving a cache fraction of *h*<sup>2.5</sup>. This deliberately overstates how much cache capacity is needed: with Berger's higher *&alpha;* values, real caches would require less data for the same hit rate. At 50% hit rate, the conservative model means caching about 18% of unique data; at 90%, about 77%; and at 99%, about 98%.

The cost impact depends heavily on the pricing model. Traditional cache providers charge for provisioned capacity: you pay for memory whether it is hit or not. Newer providers charge per-request: you pay only for the operations you use, with no idle cost.

<div class="cdc-viz" id="cache-traditional-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Traditional Cache Providers</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Cache Hit Rate: <strong id="cache-traditional-hit-value">50%</strong>
    </span>
    <input type="range" id="cache-traditional-hit-slider" min="0" max="99" value="50" step="1">
  </div>
  <div class="cost-cloud-section" id="cache-traditional-section">
  </div>
  <div class="cdc-viz-hint">
    ElastiCache charges for provisioned memory regardless of hit rate. CloudFront charges per-request and per-GB at the edge. Both reduce origin GET and egress costs, but the break-even hit rate differs sharply between the two models.
  </div>
</div>

The per-request cache providers invert the cost structure. Instead of provisioning memory upfront, you pay for each cache read (hit) and each cache write (miss that populates the cache). Storage costs, if any, scale with the actual cached data volume.

<div class="cdc-viz" id="cache-newcomer-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Per-Request Cache Providers</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Cache Hit Rate: <strong id="cache-newcomer-hit-value">50%</strong>
    </span>
    <input type="range" id="cache-newcomer-hit-slider" min="0" max="99" value="50" step="1">
  </div>
  <div class="cost-cloud-section" id="cache-newcomer-section">
  </div>
  <div class="cdc-viz-hint">
    Per-request pricing means you pay nothing when the cache is cold and costs scale linearly with usage. Compare the net impact at different hit rates: lower per-read prices (Momento, Workers KV) break even earlier than higher per-read prices (Upstash).
  </div>
</div>

The individual explorers above isolate each cost dimension. But the real question for a system architect is: *what does the total bill look like when you combine a specific storage provider, a specific cache provider, a chunk size, and container packing?* The explorer below lets you answer that question directly.

<div class="cdc-viz" id="comprehensive-cost-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Comprehensive Cost Model</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">Storage:</span>
    <select class="cost-provider-select" id="comprehensive-storage-select">
      <option value="0">AWS S3</option>
      <option value="1">GCP</option>
      <option value="2">Azure</option>
      <option value="3">Cloudflare R2</option>
      <option value="4">Backblaze B2</option>
      <option value="5">Wasabi</option>
      <option value="6">Tigris</option>
    </select>
    <span class="parametric-control-label">Cache:</span>
    <select class="cost-provider-select" id="comprehensive-cache-select">
      <option value="0">None</option>
      <option value="1">CloudFront</option>
      <option value="2">ElastiCache</option>
      <option value="3">Upstash</option>
      <option value="4">Momento</option>
      <option value="5">Workers KV</option>
    </select>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Cache Hit Rate: <strong id="comprehensive-hit-value">0%</strong>
    </span>
    <input type="range" id="comprehensive-hit-slider" min="0" max="99" value="0" step="1" disabled>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Average Chunk Size: <strong id="comprehensive-chunk-value">32 KB</strong>
    </span>
    <input type="range" id="comprehensive-chunk-slider" min="0" max="100" value="50" step="1">
  </div>
  <div class="parametric-control-row">
    <label class="container-toggle">
      <input type="checkbox" id="comprehensive-packing-toggle">
      <span>Enable container packing</span>
    </label>
    <span class="parametric-control-label">
      Container Size: <strong id="comprehensive-container-value">4 MB</strong>
    </span>
    <input type="range" id="comprehensive-container-slider" min="0" max="2" value="0" step="1" disabled>
  </div>
  <div class="cost-cloud-section" id="comprehensive-cost-section">
  </div>
  <div class="cdc-viz-hint">
    With cache set to "None", this explorer matches the per-provider cost explorers above. Select a cache provider and adjust the hit rate to see how caching reduces origin read operations and egress while adding its own cost line. Try combining a zero-egress storage provider (R2, Wasabi) with a CDN cache to see why egress-free storage changes the cache calculus.
  </div>
</div>

### Why I Care About This

This series grew out of my master's thesis research, where I'm evaluating structure-aware chunking as a deduplication strategy for source code files on large version control platforms. Source code is a particularly interesting domain for chunking because individual files are typically small<span class="cdc-cite"><a href="#ref-27">[27]</a></span> and edits tend to be localized, small changes concentrated in specific functions or blocks<span class="cdc-cite"><a href="#ref-28">[28]</a></span>. This means even smaller chunk sizes may be appropriate since the overhead is bounded by the small file sizes involved.

If edits concentrate in specific functions and blocks, the natural extension of content-defined chunking is to define boundaries using the structure of the source code itself: functions, methods, classes, and modules. Rather than scanning bytes for rolling hash matches, you can parse the code into its syntactic units and chunk along those boundaries directly. **cAST** (Zhang et al., 2025)<span class="cdc-cite"><a href="#ref-14">[14]</a></span> does exactly this for retrieval-augmented code generation (RAG): it parses source code into an Abstract Syntax Tree and recursively splits large AST nodes while merging small siblings, producing chunks that respect function, class, and module boundaries. The result is semantically coherent code fragments that improve both retrieval precision and downstream generation quality across diverse programming languages and tasks.

My thesis asks whether this same structure-awareness can improve deduplication for source code on large version control platforms. Can syntax-aware chunk boundaries, aligned to functions, classes, and modules via AST parsing, outperform byte-level CDC for deduplicating code across versions? I'm comparing three approaches along a granularity spectrum: **whole-file content-addressable storage** as a baseline, modeling Git's approach without its packfile and delta compression layers, then **FastCDC** for byte-level content-defined chunking, and finally **cAST-style structural chunking** with AST-aware boundaries. Each makes a different tradeoff between deduplication ratio, metadata overhead, and language independence. The results should help answer whether the added cost of parsing source code into an AST pays for itself in storage savings compared to language-agnostic byte-level chunking, or whether whole-file storage with delta compression remains the pragmatic choice.

### Conclusion

Every solution at one layer of abstraction creates problems at the next. In [Part 1](/writings/content-defined-chunking-part-1), we started with a simple observation: fixed-size chunking breaks down when data is inserted or deleted, because every boundary after the edit shifts. Content-Defined Chunking solves this by letting the data itself determine where boundaries fall. In [Part 2](/writings/content-defined-chunking-part-2), we took a deep dive into FastCDC and saw how normalized chunking with dual masks produces tighter, more predictable chunk size distributions. In [Part 3](/writings/content-defined-chunking-part-3), we built a deduplication pipeline, explored the system-level costs that chunk size controls, and surveyed where CDC is used in practice and where it is not. In [Part 4](/writings/content-defined-chunking-part-4), we saw that deploying CDC on cloud object storage reveals a new cost dimension: per-operation pricing makes fine-grained chunks ruinously expensive. Containers solved that by decoupling logical chunk granularity from physical object count, but they introduced fragmentation, made garbage collection hard, and created a design space where container size, rewriting strategy, and GC policy all interact. In this post, we explored the full cost landscape across storage providers and caching layers.

The field has largely converged on how to manage these tradeoffs. MFDedup's insight that deduplicating against the most recent version preserves locality while capturing most savings, GCCDF's unification of garbage collection and defragmentation into a single I/O pass, and the Data Domain Cloud Tier's cost-aware adaptation of containers to object storage: these represent a maturing understanding of container-based deduplication. The fundamental tension between dedup ratio and read locality is well-characterized. The research community has developed a toolkit of techniques, including rewriting, container capping, forward assembly, and piggybacked defragmentation, for managing it. The question is no longer whether these problems are solvable, but which combination of techniques best fits a given workload.

The beauty of the container abstraction is that it is invisible to the CDC layer. The chunking algorithm does not need to know whether chunks will be stored individually or packed into containers. This separation of concerns is what makes CDC so durable as a technique. The same Rabin or Gear hash that LBFS used in 2001 works just as well in a 2025 cloud storage system with container packing, locality-preserved caching, and piggybacked GC-defragmentation. The chunking logic and the storage logic are cleanly decoupled. Each can evolve independently, and that modularity is why both have continued to improve over more than two decades.

Content-Defined Chunking is one of those algorithms that seems almost too simple to work: slide a window, compute a hash, check some bits. Yet this simplicity belies remarkable power. Chunk boundaries rely only on neighboring content (**locality**), the same content will always be chunked to produce the same results (**determinism**), and a variety of techniques across the family of CDC algorithms achieves remarkable **efficiency** and throughput. From Rabin's 1981 fingerprinting to VectorCDC's 2025 SIMD acceleration to structure-aware chunking for source code, the core idea has proven remarkably durable and adaptable.

### References

<div class="cdc-references">

<div class="bib-entry" id="ref-14">
  <div class="bib-number">[14]</div>
  <div class="bib-citation">Y. Zhang, X. Zhao, Z. Z. Wang, C. Yang, J. Wei &amp; T. Wu, "cAST: Enhancing Code Retrieval-Augmented Generation with Structural Chunking via Abstract Syntax Tree," <em>arXiv:2506.15655</em>, 2025.</div>
  <div class="bib-links">
    <a href="https://arxiv.org/abs/2506.15655" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> arXiv</a>
  </div>
</div>

<div class="bib-entry" id="ref-27">
  <div class="bib-number">[27]</div>
  <div class="bib-citation">I. Herraiz, D. M. German &amp; A. E. Hassan, "On the Distribution of Source Code File Sizes," <em>6th International Conference on Software and Data Technologies (ICSOFT '11)</em>, 2011.</div>
  <div class="bib-links">
    <a href="https://www.researchgate.net/publication/220737991_On_the_Distribution_of_Source_Code_File_Sizes" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> ResearchGate</a>
  </div>
</div>

<div class="bib-entry" id="ref-28">
  <div class="bib-number">[28]</div>
  <div class="bib-citation">O. Arafat &amp; D. Riehle, "The Commit Size Distribution of Open Source Software," <em>42nd Hawaii International Conference on System Sciences (HICSS-42)</em>, 2009.</div>
  <div class="bib-links">
    <a href="https://ieeexplore.ieee.org/document/4755633" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> IEEE</a>
  </div>
</div>

<div class="bib-entry" id="ref-37">
  <div class="bib-number">[37]</div>
  <div class="bib-citation">L. Breslau, P. Cao, L. Fan, G. Phillips &amp; S. Shenker, "Web Caching and Zipf-like Distributions: Evidence and Implications," <em>IEEE INFOCOM '99</em>, 1999.</div>
  <div class="bib-links">
    <a href="https://ieeexplore.ieee.org/document/749260" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> IEEE</a>
  </div>
</div>

<div class="bib-entry" id="ref-38">
  <div class="bib-number">[38]</div>
  <div class="bib-citation">D. S. Berger, N. Beckmann &amp; M. Harchol-Balter, "Practical Bounds on Optimal Caching with Variable Object Sizes," <em>Proceedings of the ACM on Measurement and Analysis of Computing Systems (POMACS)</em>, Vol. 2, No. 2, 2018.</div>
  <div class="bib-links">
    <a href="https://dl.acm.org/doi/10.1145/3224427" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> ACM</a>
  </div>
</div>

</div>

<div class="cdc-series-nav">
&larr; <a href="/writings/content-defined-chunking-part-4">Part 4: From Chunks to Containers</a> &middot; Back to <a href="/writings/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
