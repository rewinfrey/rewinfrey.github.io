---
layout: writing
group: Writings
title: "CDC at Scale on a Budget"
subtitle: "Content-Defined Chunking, Part 5"
summary: "Cloud object storage can be expensive for CDC at scale. This post explores cost-saving alternatives: newcomer storage providers with radically different pricing, and the role caching plays under Zipf access patterns to drive costs down further."
date: 2026-02-26 12:00:00
interactive: true
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

/* Override global _layout.scss last-child rules */
.cost-cloud-table td:last-child,
.cost-cloud-table th:last-child {
  border-left: 1px solid #cfcfcf;
  font-weight: inherit;
  background-color: inherit;
}

.cost-cloud-table.cost-has-totals tr:last-child td {
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
.cost-ref-table td {
  font-weight: normal;
}
.cost-ref-table tr:last-child td {
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

/* Provider comparison table (transposed) */
.provider-avg-row td {
  font-weight: bold !important;
  border-top: 2px solid rgba(61, 58, 54, 0.2) !important;
  border-bottom: 2px solid rgba(61, 58, 54, 0.2) !important;
}

.provider-newcomer-row td:last-child .cost-cell-calc {
  color: #2d7a4f;
  font-weight: 600;
}

/* Zipf cache visualization */
.zipf-chart-container {
  padding: 0.5rem 1.25rem 0;
}

.zipf-chart-container canvas {
  width: 100%;
  display: block;
}

.zipf-readout {
  text-align: center;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  color: #2d7a4f;
  font-size: 0.95rem;
}

/* Footnote */
.cdc-fn-ref {
  text-decoration: none;
  color: #a89b8c;
  font-size: 0.8rem;
}

.cdc-footnote {
  font-size: 0.85rem;
  color: #6b6560;
  border-top: 1px solid rgba(61, 58, 54, 0.15);
  padding-top: 1rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Comprehensive cost model: cache table + matrix spacing */
.comprehensive-cache-header {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(61, 58, 54, 0.1);
}

#comprehensive-cost-section {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

.cost-matrix-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.cost-matrix-table {
  min-width: 72rem;
}

.cost-matrix-table th:first-child,
.cost-matrix-table td:first-child {
  position: sticky;
  left: 0;
  background: #faf9f7;
  z-index: 1;
}

.cost-matrix-cell {
  text-align: center;
  min-width: 6.5rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.cost-matrix-cell .cost-cell-value {
  display: block;
}

.cost-matrix-cell .cost-cell-calc {
  display: block;
  white-space: nowrap;
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
Part 5 of 5 in a series on Content-Defined Chunking. Previous: <a href="/writings/content-defined-chunking-part-4">Part 4: CDC in the Cloud</a>
</div>

[Part 4](/writings/content-defined-chunking-part-4) showed that containers are a prerequisite for CDC on cloud object storage, collapsing per-operation costs by orders of magnitude. But the major providers still charge for every PUT, GET, and byte of egress. Can we do better? A newer generation of S3-compatible services has emerged with pricing models that eliminate or sharply reduce these costs, and caching can cut read expenses further still. This post explores both, then wraps up the series with a look at what motivated this deep dive in the first place.

---

### The Cost Comparison Continued

The dominance of per-operation costs on major cloud providers is what makes container packing essential. But a newer generation of S3-compatible storage services has emerged with pricing models that eliminate or sharply reduce the very cost dimensions that punish CDC. [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) charges zero egress. [Backblaze B2](https://www.backblaze.com/cloud-storage) offers free uploads and storage at a fraction of S3's price. [Wasabi](https://wasabi.com/) charges no per-operation fees and no egress fees at all. The explorer below applies the same workload to these newcomers.

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
      <input type="checkbox" id="newcomer-cost-packing-toggle" checked>
      <span>Container packing</span>
    </label>
    <span class="parametric-control-label">
      Container Size: <strong id="newcomer-cost-container-value">4 MB</strong>
    </span>
    <input type="range" id="newcomer-cost-container-slider" min="1" max="64" value="4" step="1">
  </div>
  <div class="cost-cloud-section" id="newcomer-cost-cloud-section">
  </div>
</div>

The savings over traditional providers are substantial. Each newcomer eliminates a different cost dimension: R2 kills egress, B2 offers free uploads and cheap storage, and Wasabi removes both operations and egress fees entirely. The explorer below puts all six providers side by side so you can compare directly.

<div class="cdc-viz" id="provider-comparison-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Provider Cost Comparison</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Average Chunk Size: <strong id="provider-comparison-chunk-value">8 KB</strong>
    </span>
    <input type="range" id="provider-comparison-chunk-slider" min="0" max="100" value="30" step="1">
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Container Size: <strong id="provider-comparison-container-value">4 MB</strong>
    </span>
    <input type="range" id="provider-comparison-container-slider" min="1" max="64" value="4" step="1">
  </div>
  <div class="cost-cloud-section" id="provider-comparison-cloud-section">
  </div>
</div>

Egress dominates the traditional provider bills, and the newcomers that eliminate it see the largest absolute savings. Wasabi's model is the most aggressive: with no per-operation or egress fees, the only cost is storage itself. However, Wasabi's pricing comes with constraints. There is a 90-day minimum storage duration (deleting data sooner still incurs the full charge), a 1 TB minimum storage volume, and a fair-use egress policy that caps monthly egress at your total storage volume. For read-heavy workloads where egress significantly exceeds stored data, the "free egress" claim may not hold.

### Reducing Costs through Caching

The cost explorers above model a direct path: chunks flow from the writer to storage and from storage to the reader. But production systems rarely work that way. A read-through cache between readers and the storage backend can dramatically reduce both operations costs and egress, the two cost dimensions that dominate at scale.

CDC chunks are unusually well-suited for caching. Every chunk is immutable and content-addressed: its hash *is* its identity. There is no invalidation problem, because a chunk's content never changes. If chunk `a7f3e9...` is in the cache, it will be correct forever. And because deduplication shrinks the working set (many files share the same chunks), the effective cache hit rate is higher than it would be for opaque file-based caching. Popular files that share chunks with other popular files all benefit from the same cached data.

A key question for any cache is how much data must be stored to achieve a given hit rate. The answer depends on the access distribution. Breslau et al. showed that web request frequencies follow a Zipf distribution, where the *k*-th most popular item is accessed with probability proportional to 1/*k*<sup><em>&alpha;</em></sup>.<span class="cdc-cite"><a href="#ref-37">[37]</a></span> The <em>&alpha;</em> parameter controls how skewed the popularity curve is. At <em>&alpha;</em> = 0, every item is equally popular and caching provides no advantage. As <em>&alpha;</em> increases, popularity concentrates: a small number of items account for a disproportionate share of requests, which is exactly the condition where caching thrives. Breslau et al. measured <em>&alpha;</em> values between 0.64 and 0.83 for web traffic. More recent measurements by Berger et al. on real CDN and web application traces found <em>&alpha;</em> values between 0.85 and 1.0, indicating that modern access patterns are even more skewed.<span class="cdc-cite"><a href="#ref-38">[38]</a></span>

The measure of skewness, <em>&alpha;</em>, can be seen by dragging the skewness slider in the visualization below. High <em>&alpha;</em> values represent the condition in which a high percentage of requests occur for a few very popular items (high skew), while low <em>&alpha;</em> values represent traffic spread more equally across all items (low skew).

In the visualization below, each bar represents an item, like a file or chunk, ranked by popularity as a measure of how frequently it is requested. The height of each bar is its overall percentage share of total requests.

<div class="cdc-viz" id="zipf-distribution-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Zipf Popularity Distribution</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Skewness (&alpha;): <strong id="zipf-dist-alpha-value">0.60</strong>
    </span>
    <input type="range" id="zipf-dist-alpha-slider" min="0" max="100" value="60" step="1">
  </div>
  <div class="zipf-chart-container">
    <canvas id="zipf-dist-canvas"></canvas>
  </div>
  <div class="zipf-readout" id="zipf-dist-readout"></div>
</div>

That skewed distribution is exactly why caching works. If you cache only the most popular items, you can serve a disproportionate share of requests without touching the storage backend. Measured <em>&alpha;</em> values for web and CDN traffic typically fall between 0.64 and 1.0, but not all workloads follow a Zipf distribution, and yours may differ. Measuring <em>&alpha;</em> for a specific workload is feasible but out of scope for this post; see the footnote<sup><a href="#fn-alpha" class="cdc-fn-ref">†</a></sup> for pointers on how it's done. The next visualization shows this relationship directly: given a skewness level and a target hit rate, how much unique data do you actually need to cache?

<div class="cdc-viz" id="zipf-cache-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Cache Size vs. Hit Rate</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Skewness (&alpha;): <strong id="zipf-cache-alpha-value">0.60</strong>
    </span>
    <input type="range" id="zipf-cache-alpha-slider" min="0" max="100" value="60" step="1">
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Target Hit Rate: <strong id="zipf-cache-hitrate-value">50%</strong>
    </span>
    <input type="range" id="zipf-cache-hitrate-slider" min="1" max="99" value="50" step="1">
  </div>
  <div class="zipf-chart-container">
    <canvas id="zipf-cache-canvas"></canvas>
  </div>
  <div class="zipf-readout" id="zipf-cache-readout"></div>
</div>

Under a Zipf distribution, the cache size needed for a target hit rate *h* is approximately *h*<sup>1/(1-<em>&alpha;</em>)</sup> of the total unique data. The explorers below use <em>&alpha;</em> = 0.6 (below the measured range, deliberately conservative), giving a cache fraction of *h*<sup>2.5</sup>. This overstates how much cache capacity is needed: with Berger's higher <em>&alpha;</em> values, real caches would require less data for the same hit rate.

The relationship between hit rate and cache size is worth pausing on, because it is not immediately intuitive. A 50% hit rate means serving half of all *requests* from cache. Because access patterns are skewed, the most popular 18% of unique data accounts for 50% of all requests -- those chunks get hit over and over. To reach a 90% hit rate, you need to also cache the moderately popular long tail, which requires about 77% of unique data. And reaching 99% means caching nearly everything (98%), because that last 9% of requests comes from rarely-accessed chunks that each contribute only a small share of traffic.

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
    Provisioned Redis (ElastiCache, Memorystore, Azure Cache) charges for memory regardless of hit rate. CDN edges (CloudFront, Cloud CDN, Azure CDN) charge per-request and per-GB delivered. Both reduce origin GET and egress costs, but the break-even hit rate differs sharply between the two models.
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

### All Costs Considered

The individual explorers above isolate several cost dimensions: storage provider pricing, per-operation and egress fees, cache provider models, hit rates, and their sensitivity to the Zipf access distribution. Six storage providers, nine cache options, chunk size, and container packing create a large enough configuration space that cost-based decisions are difficult to make by intuition alone. The comprehensive model below puts all of these dimensions into a single view.

<div class="cdc-viz" id="comprehensive-cost-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Comprehensive Cost Model</span>
  </div>
  <div class="cost-cloud-section" id="comprehensive-cost-section">
  </div>
</div>

The cost landscape has a few clear takeaways. First, provider choice dominates: newcomer storage providers with free egress and zero per-operation fees can reduce the monthly bill by 90% or more compared to traditional providers at the same chunk size and container configuration. Second, caching interacts with provider choice in non-obvious ways. A CDN cache in front of a traditional provider offloads expensive egress and read operations, producing large absolute savings. But the same cache in front of a free-egress provider like R2 or Wasabi adds cost without offsetting much, because there was little egress cost to begin with. Third, container packing remains essential regardless of provider or cache layer. Without it, per-operation costs at small chunk sizes overwhelm every other line item. The container abstraction from [Part 4](/writings/content-defined-chunking-part-4) is not optional; it is a prerequisite for making CDC economically viable on any cloud object store.

### Why I Care About This

This series grew out of my master's thesis research, where I'm evaluating structure-aware chunking as a deduplication strategy for source code files on large version control platforms. Source code is a particularly interesting domain for chunking because individual files are typically small<span class="cdc-cite"><a href="#ref-27">[27]</a></span> and edits tend to be localized, small changes concentrated in specific functions or blocks<span class="cdc-cite"><a href="#ref-28">[28]</a></span>. This means even smaller chunk sizes may be appropriate since the overhead is bounded by the small file sizes involved.

If edits concentrate in specific functions and blocks, the natural extension of content-defined chunking is to define boundaries using the structure of the source code itself: functions, methods, classes, and modules. Instead of using a rolling hash window to identify chunk boundaries, you can parse the code into its syntactic units and chunk along those boundaries directly. **cAST** (chunking via abstract syntax tree; Zhang et al., 2025)<span class="cdc-cite"><a href="#ref-14">[14]</a></span> does exactly this in the context of retrieval-augmented code generation (RAG): It parses source code into an AST, recursively splitting large nodes and merging small siblings to produce chunks that align with function, class, and module boundaries. The result is semantically coherent chunks aligned to syntax nodes that improve both retrieval precision and generation quality across diverse programming languages.

My thesis asks whether aligning chunk boundaries to syntactic structures like functions, classes, and modules via AST parsing can outperform byte-level CDC for deduplicating source code across versions on large version control platforms. To understand the benefits cAST offers for source code deduplication, I'm comparing it against **whole-file content-addressable storage** as a baseline, modeling Git's approach without its packfile and delta compression layers, and **FastCDC v2020** from the BSW family for byte-level content-defined chunking. The comparison spans ten programming languages across hundreds of public repositories with large commit histories, over a range of target chunk sizes, building an empirical cost model for the traditional tradeoffs between system resources (CPU and memory), network, and storage. The cost model should help clarify the tradeoffs across system resources, network, and storage, and evaluate when the additional overhead of AST parsing adds value and how much along each cost axis, compared to byte-level chunking and whole-file content-addressable storage.

### Conclusion

Every solution at one layer of abstraction creates problems at the next. Content-defined chunking solves fixed-size chunking's fatal sensitivity to insertions and deletions by letting data determine its own boundaries. But deploying CDC at scale reveals that the chunking algorithm is only the beginning. Chunk size controls a web of interacting costs: storage efficiency, per-operation pricing, network egress, CPU overhead, and memory pressure. Containers decouple logical chunk granularity from physical object count, but at the cost of fragmentation, complex garbage collection, and a design space where container size, rewriting strategy, and GC policy all interact. Caching under Zipf access patterns can dramatically reduce read and egress costs, but the savings depend on provider pricing models that vary by orders of magnitude.

The deeper insight running through this series is that CDC's power comes from its modularity. The chunking layer and the storage layer are cleanly separated. A chunking algorithm does not need to know whether its output will be stored as individual objects or packed into containers, cached at the edge or served from origin, priced per-operation or per-gigabyte. This separation of concerns is why the same core idea from Rabin's 1981 fingerprinting still works in a 2025 cloud storage system with container packing, locality-preserved caching, and piggybacked GC-defragmentation. Each layer can evolve independently, and both have.

That modularity also points toward where the field goes next. Structure-aware chunking, like cAST's use of abstract syntax trees for source code, raises an obvious question: what other domains have exploitable structure? Document formats, configuration files, database snapshots, and serialized protocol buffers all have internal structure that byte-level chunking ignores. On the performance side, VectorCDC's SIMD acceleration shows that hardware-aware algorithm design can push throughput far beyond what scalar implementations achieve, and as instruction sets widen further, the gap will only grow. Beyond text and code, deduplication for images, video, and other binary formats remains largely unexplored territory where content-aware boundary detection could take entirely different forms.

Perhaps the most consequential open question is what role deduplication plays in the AI revolution ahead. Retrieval-augmented generation systems depend on chunking strategies that balance retrieval precision against chunk coherence. Model checkpointing, distributed training state, and inference caching all generate enormous volumes of partially redundant data. As AI workloads continue to scale, the economics of storing and transferring deduplicated data will only become more critical. The algorithm that lets data decide its own boundaries may have its most important work still ahead.

<div class="cdc-footnote" id="fn-alpha">
<sup>†</sup> The <em>&alpha;</em> parameter is measured empirically by fitting real access logs to the Zipf model. The procedure is: collect access traces, rank items by frequency (most popular = rank 1), and plot log(rank) vs. log(frequency). If the access pattern follows a Zipf distribution, this log-log plot is approximately linear, and the slope of that line is &minus;<em>&alpha;</em>. A steeper slope means more skewed popularity. Breslau et al. and Berger et al. both used this fitting approach on web traffic and CDN traces to arrive at their measured <em>&alpha;</em> ranges.
</div>

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
&larr; <a href="/writings/content-defined-chunking-part-4">Part 4: CDC in the Cloud</a> &middot; Back to <a href="/writings/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
