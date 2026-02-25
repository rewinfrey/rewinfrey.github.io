---
layout: writing
group: Writings
title: "Content-Defined Chunking, Part 4: From Chunks to Containers"
summary: "CDC chunks are the right logical unit for deduplication, but storing them as individual objects is ruinously expensive. This post explores containers, the storage abstraction that makes CDC viable at scale, and the fragmentation, garbage collection, and restore challenges they introduce."
date: 2026-02-23 12:00:00
categories:
- writings
---

<style>
/* ==========================================================================
   CDC Animation Styles
   ========================================================================== */

/* Demo container */
.cdc-demo {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
}

.cdc-demo canvas {
  display: block;
  width: 100%;
  background: #faf9f7;
  border-radius: 8px 8px 0 0;
}

/* Text/Block visualization container */
.cdc-viz {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-radius: 8px;
  margin: 1.5rem 0;
}

.cdc-viz-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(61, 58, 54, 0.1);
}

.cdc-viz-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3d3a36;
}

.cdc-viz-hint {
  width: 100%;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.75rem;
  color: #8b7355;
  margin: 0.25rem 0 0 0;
  line-height: 1.4;
}

/* Parametric controls */
.parametric-control-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.parametric-control-row input[type="range"] {
  flex: 1;
  min-width: 120px;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #d4a574, #c45a3b);
  border-radius: 3px;
  outline: none;
}

.parametric-control-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #c45a3b;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.15s ease;
}

.parametric-control-row input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.parametric-control-row input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #c45a3b;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.parametric-control-row input[type="range"]:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.parametric-control-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  color: #3d3a36;
  white-space: nowrap;
}

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

/* Citation style */
.cdc-cite {
  font-size: 0.8em;
  vertical-align: super;
}

.cdc-cite a {
  color: #c45a3b;
  text-decoration: none;
  font-weight: 600;
}

.cdc-cite a:hover {
  text-decoration: underline;
}

/* References */
.cdc-references {
  margin-top: 1.5rem;
}

.cdc-references .bib-entry {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(61, 58, 54, 0.06);
}

.cdc-references .bib-entry:last-child {
  border-bottom: none;
}

.cdc-references .bib-number {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #c45a3b;
  margin-bottom: 0.3rem;
}

.cdc-references .bib-citation {
  font-size: 0.9rem;
  color: #3d3a36;
  line-height: 1.7;
}

.cdc-references .bib-citation em {
  color: #5a5550;
}

.cdc-references .bib-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.cdc-references .bib-link {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  text-decoration: none;
  border: none;
  transition: all 0.2s ease;
}

.cdc-references .bib-link.external {
  background: rgba(61, 58, 54, 0.06);
  color: #5a5550;
}

.cdc-references .bib-link.external:hover {
  background: rgba(61, 58, 54, 0.12);
}

/* Callout box */
.cdc-callout {
  position: relative;
  margin: 1.5rem 0;
  padding: 1.25rem 1.5rem 1.25rem 1.25rem;
  background: linear-gradient(135deg, rgba(196, 90, 59, 0.06) 0%, rgba(212, 165, 116, 0.08) 100%);
  border-left: 3px solid #c45a3b;
  border-radius: 0 6px 6px 0;
  font-style: italic;
  color: #3d3a36;
  line-height: 1.6;
}

.cdc-callout::before {
  content: attr(data-label);
  position: absolute;
  top: -0.6rem;
  left: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c45a3b;
  background: #faf9f7;
  padding: 0 0.4rem;
}

/* Series navigation */
.cdc-series-nav {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  color: #8b7355;
  padding: 0.75rem 1rem;
  background: rgba(61, 58, 54, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(61, 58, 54, 0.06);
  margin: 1.5rem 0;
}
.cdc-series-nav a { color: #c45a3b; text-decoration: none; }
.cdc-series-nav a:hover { text-decoration: underline; }

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
Part 4 of 4 in a series on Content-Defined Chunking. Previous: <a href="/writings/content-defined-chunking-part-3">Part 3: Deduplication in Action</a>
</div>

In [Part 3](/writings/content-defined-chunking-part-3), we built a deduplication pipeline and explored its cost tradeoffs. The cloud cost explorer revealed a surprising result: when every chunk lives as a separate object on cloud storage, the per-operation pricing model means API calls (PUT and GET) dominate total cost, not storage. Shrinking chunks improves deduplication ratio but multiplies operations costs by orders of magnitude. At 1 KB average chunk size, operations cost hundreds of thousands of dollars per month for a workload where storage itself costs only tens of thousands.

We ended that post with a single paragraph introducing containers as the fix: grouping many small chunks into larger, fixed-size storage objects, writing one object per container instead of one per chunk. But that paragraph glossed over a lot. How do containers actually work? How much do they save? And what new problems do they create?

This post answers those questions. We will start with the container abstraction as it was defined in the research literature, build an interactive cost model that shows exactly how much containers save, and then explore the three major problems containers introduce: fragmentation, garbage collection, and restore performance degradation. Each of these has been the subject of over a decade of focused research at venues like USENIX FAST, ACM SYSTOR, and EuroSys. The arc of this post is a recurring one in systems design: a solution to one problem creates new problems at the next layer of abstraction.

### What Containers Are

The Data Domain paper by Zhu et al. (FAST '08) defined the container abstraction that the field has used ever since.<span class="cdc-cite"><a href="#ref-16">[16]</a></span> A container is a self-describing, immutable, fixed-size storage unit, typically a few megabytes, that groups many variable-size chunks together. Instead of storing each chunk as its own object, the system packs hundreds or thousands of chunks into a single container and writes that container as one I/O operation.

A container has two sections. The **metadata section** contains the fingerprint (cryptographic hash) of every chunk in the container, along with each chunk's byte offset and length within the data section. The **data section** holds the actual chunk bytes, often compressed. The metadata section is compact enough to be read independently, which lets the system know what a container holds without reading the full data. This separation is critical for the optimizations that make container-based deduplication practical.

The **write path** works as follows. Incoming unique chunks, those that pass the deduplication check and are confirmed to be new, are buffered in memory. When enough chunks have accumulated to fill a container, they are packed together (metadata header followed by chunk data), and the entire container is written as a single I/O operation: one PUT on object storage, one sequential write on disk. After the write, the chunk index is updated to map each chunk's hash to a tuple of (container_id, byte_offset, length). The buffering amortizes the cost of a write across many chunks. At 4 KB average chunk size and 4 MB container size, a single write covers roughly 1,000 chunks.

The **read path** inverts this. To retrieve a chunk, the system looks up its container_id, offset, and length in the chunk index, then issues a byte-range request on that container (a range GET on S3, or a positioned read on local disk). If multiple chunks from the same container are needed, a single read can fetch them all. In practice, restoring a file often requires chunks from several containers, so the system issues a set of range reads in parallel.

Zhu et al. introduced a key optimization that exploits container structure: **locality-preserved caching**.<span class="cdc-cite"><a href="#ref-16">[16]</a></span> When the system reads a container's metadata section to check whether it contains a particular chunk, it caches all the fingerprints from that container in memory. Because backup streams have locality, consecutive chunks in the input tend to end up in the same or nearby containers, this prefetches fingerprints for upcoming deduplication lookups. Combined with a Bloom filter (which the Data Domain paper calls a "summary vector") for quickly rejecting chunks that are definitely new, this locality-preserved caching eliminated 99% of on-disk index lookups during deduplication. The Bloom filter handles the common case (most incoming chunks are new and can be rejected without a disk seek), while the container metadata cache handles the remaining case (chunks that might be duplicates are likely co-located with recently seen duplicates).

A note on terminology: the deduplication research literature consistently uses the term "container" for this abstraction (Zhu et al., Lillibridge et al., Xia et al., and others).<span class="cdc-cite"><a href="#ref-16">[16]</a></span><span class="cdc-cite"><a href="#ref-18">[18]</a></span><span class="cdc-cite"><a href="#ref-15">[15]</a></span> Backup tools like Restic and Git use "packfile" for a similar concept. Git's packfile format serves a somewhat different purpose (it includes delta compression between objects, not just packing), so this post uses the literature's term to avoid conflation.

The key insight of the container abstraction is that it **decouples logical chunk granularity from physical object count**. You can have billions of 4 KB chunks but only millions of 4 MB containers. The chunk index grows with the number of unique chunks, but the storage layer deals with far fewer, larger objects. The CDC algorithm does not need to change. The same Gear hash or Rabin fingerprint that produces variable-size chunks feeds into the same deduplication lookup. The container is purely a storage-layer concern, invisible to the chunking logic above it.

### The Cost Comparison

The Part 3 cloud cost explorer modeled a naive architecture where every chunk is stored as a separate object on cloud storage. That is the worst case for API operations cost, and it is what you would get if you took a textbook CDC pipeline and deployed it directly on S3 without any storage-layer optimization. With containers, the math changes fundamentally: instead of one PUT per unique chunk, you write one PUT per container (which holds hundreds or thousands of chunks). Instead of one GET per chunk during reads, you issue range requests on containers, and if the chunks you need happen to be co-located, a single request can serve many chunks at once.

The explorer below uses the same workload assumptions as Part 3 (100M users, 1 PB total data, 1B document reads per month, 50 edits per user per month) but adds a container packing toggle. Enable it to see how containers collapse operations costs.

<div class="cdc-viz" id="container-cost-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Container Cost Explorer</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Average Chunk Size: <strong id="container-cost-chunk-value">32 KB</strong>
    </span>
    <input type="range" id="container-cost-chunk-slider" min="0" max="100" value="50" step="1">
  </div>
  <div class="parametric-control-row">
    <label class="container-toggle">
      <input type="checkbox" id="container-cost-packing-toggle">
      <span>Enable container packing</span>
    </label>
    <span class="parametric-control-label">
      Container Size: <strong id="container-cost-container-value">4 MB</strong>
    </span>
    <input type="range" id="container-cost-container-slider" min="0" max="2" value="0" step="1" disabled>
  </div>
  <div class="cost-cloud-section" id="container-cost-cloud-section">
  </div>
  <div class="cdc-viz-hint">
    Toggle container packing to see how grouping chunks into containers changes cloud costs. Try sliding chunk size to 1 KB with packing off, then enable packing.
  </div>
</div>

The savings are dramatic. At 4 KB average chunk size with 4 MB containers, each container holds roughly 1,000 chunks. That means PUT operations drop by a factor of 1,000, and GET operations drop similarly (assuming reasonable locality, where chunks needed for a read tend to cluster in the same containers). Storage cost is identical in both modes because the same bytes are stored either way. But operations cost goes from dominating the monthly bill to being negligible.

This is why container packing is not an optimization. It is a **prerequisite** for running CDC-based deduplication on cloud object storage at any meaningful scale. Without it, the per-operation pricing model of S3, GCS, and Azure Blob Storage makes fine-grained chunking economically impossible. With it, the system can use whatever chunk size gives the best deduplication ratio, because the storage layer absorbs the object-count explosion transparently.

### When CDC Is Not the Right Choice

Not every system chooses CDC, and the cost explorer above helps explain why. CDC optimizes for one thing above all: stable chunk boundaries across edits. That stability enables fine-grained deduplication, but it comes at a cost, and not every application prioritizes deduplication over other concerns.

Dropbox is the most prominent example. Their architecture uses fixed-size 4 MiB blocks with SHA-256 hashing, and has since the early days of the product.<span class="cdc-cite"><a href="#ref-23">[23]</a></span> Dropbox's primary engineering challenge was not deduplication, it was *transport*: syncing files across hundreds of millions of devices as fast as possible while keeping infrastructure costs predictable.

Fixed-size blocks give Dropbox properties that CDC cannot. Block *N* always starts at offset `N * 4 MiB`, so a client can request any block without first receiving a boundary list. Upload work can be split across threads by byte offset with zero coordination, because boundaries are known before the content is read. The receiver knows when each block ends, enabling Dropbox's streaming sync architecture where downloads begin before the upload finishes, achieving up to 2x improvement on large file sync.<span class="cdc-cite"><a href="#ref-23">[23]</a></span> And because every block is exactly 4 MiB (except the last), memory allocation, I/O scheduling, and storage alignment are all simple to model and predict at scale.

There is also the metadata question. CDC's chunk index must be backed by a persistent, highly available data store once it outgrows a single machine. For Dropbox, serving hundreds of millions of users, the difference between a fixed-size block index and a variable-size CDC chunk index is not just memory; it is the size and complexity of the metadata infrastructure required to support it. Fixed-size blocks produce fewer, more predictable index entries, which simplifies that infrastructure considerably.

The tradeoff is real. The QuickSync study found that a minor edit in Dropbox can generate sync traffic 10x the size of the actual modification, because insertions shift every subsequent block boundary.<span class="cdc-cite"><a href="#ref-25">[25]</a></span> This is precisely the boundary-shift problem that CDC was designed to solve, as we explored in [Part 1](/writings/content-defined-chunking-part-1). But Dropbox chose to absorb that cost and compensate elsewhere: their Broccoli compression encoder achieves ~33% upload bandwidth savings<span class="cdc-cite"><a href="#ref-24">[24]</a></span>, and the streaming sync architecture pipelines work so effectively that the extra bytes matter less than they otherwise would.

In short, Dropbox traded storage efficiency for transport speed and operational simplicity. Fixed-size blocks mean a predictable, easily modeled object count, which is critical when your storage bill depends on API call volume. The ability to parallelize everything without content-dependent coordination was worth more than the deduplication gains CDC would have provided.

Containers show that this choice is not binary. One way to recover some of Dropbox's transport advantages while keeping CDC is container packing. Instead of fetching each chunk individually, the system retrieves a container holding multiple chunks in a single request. This reduces both the number of API operations and the number of network round trips, while giving the storage layer predictable I/O sizes to work with. **Seafile**, an open-source file sync platform, demonstrates this approach: it uses Rabin fingerprint-based CDC with ~1 MB average chunks to achieve block-level deduplication across file versions and libraries.<span class="cdc-cite"><a href="#ref-26">[26]</a></span> Where Dropbox chose to optimize purely for transport, Seafile shows that CDC-based sync systems can work in practice.

But containers introduce their own tradeoffs. A container will often hold more bytes than you need for a given request, since not every chunk in the container is relevant. And if deduplication is working well, the chunks you need may be scattered across many different containers, because they were originally written at different times alongside different neighbors. In the worst case, you end up fetching just as many distinct containers as you would have fetched individual chunks, each carrying extra bytes you will discard. The efficiency of container packing depends heavily on chunk locality: how often the chunks you need happen to be co-located in the same container. This is the fragmentation problem, and it has been the subject of over a decade of focused research.

### The Fragmentation Problem

Containers solve the operations cost problem elegantly. But they introduce a new problem that the research community has spent over a decade working on: **fragmentation**.

The setup is straightforward. Deduplication works by sharing chunks across backups and file versions. If a chunk from the current version already exists in the store, the new version simply references it rather than storing it again. This sharing is the entire point of deduplication. But it means the chunks needed to reconstruct the latest version of a file are physically scattered across containers that were written at different times, alongside chunks from unrelated files and earlier versions.

This fragmentation worsens predictably over time. When you write the first backup, all of its chunks are new, so they go into containers sequentially with perfect locality. Restoring that first backup means reading containers in order, each one packed with relevant data. The second backup deduplicates most of its chunks against the first, so very few new containers are written. The chunks that are new land in fresh containers alongside other new chunks from that backup cycle. So far, so good. But by the hundredth backup, the latest version's chunks are scattered across containers written during every prior backup cycle. Some containers hold mostly chunks from version 1. Others hold chunks from version 47. Restoring the current version now requires reading dozens or hundreds of containers, each containing mostly irrelevant chunks that happen to share a container with one or two chunks you need. This is **read amplification**: to get the bytes you want, you must read far more bytes than you need.

Lillibridge et al. (FAST '13) quantified this problem precisely.<span class="cdc-cite"><a href="#ref-30">[30]</a></span> They found that restore speeds for the most recent backup can degrade by orders of magnitude over a system's lifetime as fragmentation accumulates. Each new backup cycle scatters its few new chunks across fresh containers, while the majority of its chunks (the deduplicated ones) point back to increasingly dispersed old containers.

The first mitigation came from Kaczmarczyk et al. (SYSTOR '12), who proposed **Context-Based Rewriting (CBR)**.<span class="cdc-cite"><a href="#ref-29">[29]</a></span> The idea is to intervene at ingest time: as chunks are being written, identify those that would land in containers with poor locality (containers where most other chunks are not part of the current backup stream), and selectively *rewrite* those duplicate chunks into new containers alongside their neighbors. The key insight is that rewriting a small fraction of duplicates can dramatically improve restore locality. CBR rewrote only about 5% of duplicate chunks and reduced the restore performance degradation from 12-55% to only 4-7%. The cost is a modest reduction in deduplication ratio (since those rewritten chunks now exist in two places), but the restore improvement far outweighs the extra storage.

Lillibridge et al. followed up with two complementary techniques in their FAST '13 paper.<span class="cdc-cite"><a href="#ref-30">[30]</a></span> **Container capping** limits how many distinct old containers a new backup is allowed to reference. When the backup stream would reference too many distinct containers (meaning restore would require reading too many containers), the system rewrites some duplicate chunks into fresh containers to bring the count down. This sacrifices roughly 8% of the deduplication ratio in exchange for a 2-6x restore speed improvement. The second technique, **forward assembly**, operates at restore time rather than ingest time. It exploits the fact that at restore time, the system has perfect knowledge of which chunks are needed (from the backup recipe or manifest). Instead of using a simple LRU cache for container data, forward assembly prefetches containers in the order they will be needed, evicting container data the moment all required chunks from it have been consumed. This achieved 2-4x restore improvement with the same RAM budget as naive LRU caching, without modifying any stored data.

Fu et al. (ATC '14) proposed **History-Aware Rewriting (HAR)**, which exploits historical backup information to identify fragmented chunks more precisely.<span class="cdc-cite"><a href="#ref-31">[31]</a></span> Rather than applying a uniform rewriting threshold, HAR analyzes the backup history to determine which specific chunks are causing the worst restore performance and rewrites only those. This targeted approach achieves similar restore improvements to CBR and container capping while rewriting fewer chunks, preserving more of the deduplication ratio.

The most recent major advance is **MFDedup** by Zou et al. (FAST '21), which claimed to resolve the deduplication-versus-locality dilemma that had defined the previous decade of research.<span class="cdc-cite"><a href="#ref-32">[32]</a></span> Their key observation was that most duplicate chunks in a backup come from the immediately previous backup version, not from distant history. MFDedup exploits this with two techniques: **NDF (Neighbor-Duplicate-Focus)** indexing, which deduplicates primarily against the previous version rather than the entire history, and **AVAR (Across-Version-Aware Reorganization)**, which rearranges chunks after ingest into a compact sequential layout optimized for restore. The result: 1.1-2.2x higher deduplication ratio *and* 2.6-11.6x faster restore compared to previous approaches. MFDedup achieves this by recognizing that the traditional approach of deduplicating against all prior versions creates unnecessarily scattered references, when deduplicating against only the most recent version captures most of the savings while preserving far better locality.

The progression from CBR (2012) through container capping (2013) to HAR (2014) to MFDedup (2021) shows a field converging on a clear principle: **ingest-time layout decisions are the primary lever for controlling fragmentation**. You cannot fix fragmentation after the fact without rewriting data. The question is how much to rewrite and when. Early approaches (CBR, capping) used simple heuristics applied uniformly. Later approaches (HAR) added historical context for more targeted rewriting. MFDedup went further by rethinking the deduplication target itself, shifting from "deduplicate against everything" to "deduplicate against the most relevant prior version." Each step reduced the tradeoff between deduplication ratio and restore locality.

### Garbage Collection

Containers solve the operations cost problem but make deletion hard. In a non-deduplicated system, deleting a file or an old backup version frees its storage immediately. In a deduplicated system, deleting a file only removes *references* to chunks. A chunk can only be freed when no remaining file or backup version references it. And because chunks live inside containers, a container can only be freed when *every* chunk in it is unreferenced. A single surviving chunk, perhaps shared by one remaining backup version, keeps the entire container alive. As old versions are deleted over time, containers accumulate dead space: unreferenced chunks that waste storage but cannot be reclaimed because they share a container with at least one live chunk.

**Logical garbage collection** is the traditional approach. Walk the file-level metadata (backup manifests, file recipes) to determine which chunks are still referenced by at least one live file or version. Mark all unreferenced chunks. Then identify containers where all chunks are unreferenced and reclaim those containers entirely. Containers with a mix of live and dead chunks present a choice: leave them as-is (wasting the dead space) or "compact" them by reading out the live chunks, packing them into new containers, and freeing the old ones. Compaction reclaims dead space but costs I/O: you must read the old containers, write new ones, and update the chunk index. At scale, the metadata walk itself is expensive because it must traverse every manifest in the system.

Douglis et al. (FAST '17) introduced a fundamentally different approach: **physical garbage collection**.<span class="cdc-cite"><a href="#ref-33">[33]</a></span> Instead of walking metadata top-down (enumerating all references to determine which chunks are live), physical GC walks the raw container storage bottom-up with sequential I/O. For each container, it reads the metadata section and checks which chunks are still live by consulting a compact liveness structure. This inverts the access pattern: instead of many random lookups into metadata, the system does one sequential scan of container storage. Physical GC was up to two orders of magnitude faster than logical GC for extreme workloads (very high dedup ratios or millions of small files) and 10-60% faster in common cases. The key insight is that when dedup ratios are high, the number of containers is much smaller than the number of metadata references, so scanning containers is cheaper than scanning references.

The connection between GC and fragmentation is deeper than it first appears. GC rewrites containers to reclaim dead chunks. Defragmentation rewrites containers to improve chunk locality for restores. Both involve reading, filtering, and rewriting containers. They are, in a sense, the same operation applied with different goals.

**GCCDF** by Xia et al. (EuroSys '25) made this connection explicit by unifying GC and defragmentation into a single pass.<span class="cdc-cite"><a href="#ref-34">[34]</a></span> During GC's container rewriting pass (where live chunks are extracted from partially-dead containers and repacked), the system simultaneously reorders chunks for better restore locality. One pass through the data, two benefits: reclaimed dead space and improved read performance. This piggybacking approach avoids the overhead of running GC and defragmentation as separate operations, each with its own I/O cost.

On cloud object storage, GC takes on additional economic significance. Dead chunks in containers waste both storage cost (you pay per GB for bytes that no live file references) and operations cost (range reads that include dead bytes are still charged, and every container that survives because of one live chunk is an object you continue to pay to store). But compaction itself costs operations: reading old containers and writing new ones. There is a break-even point where the monthly savings from reclaiming dead space justify the one-time compaction cost, and finding that point requires modeling the specific pricing of the cloud provider in use.

### Design Tradeoffs

Container size interacts with every other parameter in the system. Larger containers mean fewer API operations (fewer PUTs on write, fewer objects to manage) but more read amplification: when you fetch a range from a large container, the irrelevant bytes surrounding the chunks you need are more numerous. Smaller containers reduce waste per read but increase the total object count and the metadata overhead of tracking more containers. Fu et al. (FAST '15) systematically explored this parameter space, varying chunk size, container size, dedup index structure, and rewriting aggressiveness across multiple backup workloads.<span class="cdc-cite"><a href="#ref-35">[35]</a></span> Their central finding was that no single configuration dominates across all workloads. The right tradeoff depends on whether your system is write-heavy or read-heavy, whether restores are frequent or rare, and whether you care more about storage cost or throughput.

The Data Domain Cloud Tier paper by Duggal et al. (ATC '19) extended the container model specifically to cloud object storage.<span class="cdc-cite"><a href="#ref-36">[36]</a></span> Their architecture addresses the unique constraints of cloud storage: high latency for individual operations, the need for cost-aware GC (where the decision to compact a container factors in the cloud operations cost of doing so), and restore from cloud (where the system must reconstitute data from containers stored on a high-latency, pay-per-request backend). The paper demonstrates that the container abstraction, originally designed for local disk, translates to cloud storage with targeted modifications for latency tolerance and cost modeling.

These are not independent knobs. Container size, chunk size, rewriting aggressiveness, GC frequency, cache budget, and index structure all interact. The FAST '15 paper found that tuning one parameter without considering the others can produce worse results than the untuned default, because improving one dimension (say, dedup ratio via smaller chunks) can degrade another (restore speed via increased fragmentation). This interdependence is why the research community has spent over a decade refining the relationships between these parameters, and why production systems like Data Domain have developed sophisticated auto-tuning mechanisms rather than exposing raw knobs to operators.

## Conclusion

Every solution at one layer of abstraction creates problems at the next. In [Part 1](/writings/content-defined-chunking-part-1), we started with a simple observation: fixed-size chunking breaks down when data is inserted or deleted, because every boundary after the edit shifts. Content-Defined Chunking solves this by letting the data itself determine where boundaries fall. In [Part 2](/writings/content-defined-chunking-part-2), we took a deep dive into FastCDC and saw how normalized chunking with dual masks produces tighter, more predictable chunk size distributions. In [Part 3](/writings/content-defined-chunking-part-3), we built a deduplication pipeline and explored the system-level costs that chunk size controls. In this post, we saw that deploying CDC on cloud object storage reveals a new cost dimension: per-operation pricing makes fine-grained chunks ruinously expensive. Containers solved that by decoupling logical chunk granularity from physical object count. But containers introduced fragmentation, made garbage collection hard, and created a design space where container size, rewriting strategy, and GC policy all interact.

The field has largely converged on how to manage these tradeoffs. MFDedup's insight that deduplicating against the most recent version preserves locality while capturing most savings, GCCDF's unification of garbage collection and defragmentation into a single I/O pass, and the Data Domain Cloud Tier's cost-aware adaptation of containers to object storage: these represent a maturing understanding of container-based deduplication. The fundamental tension between dedup ratio and read locality is well-characterized. The research community has developed a toolkit of techniques, including rewriting, container capping, forward assembly, and piggybacked defragmentation, for managing it. The question is no longer whether these problems are solvable, but which combination of techniques best fits a given workload.

The beauty of the container abstraction is that it is invisible to the CDC layer. The chunking algorithm does not need to know whether chunks will be stored individually or packed into containers. This separation of concerns is what makes CDC so durable as a technique. The same Rabin or Gear hash that LBFS used in 2001 works just as well in a 2025 cloud storage system with container packing, locality-preserved caching, and piggybacked GC-defragmentation. The chunking logic and the storage logic are cleanly decoupled. Each can evolve independently, and that modularity is why both have continued to improve over more than two decades.

Content-Defined Chunking is one of those algorithms that seems almost too simple to work: slide a window, compute a hash, check some bits. Yet this simplicity belies remarkable power. Chunk boundaries rely only on neighboring content (**locality**), the same content will always be chunked to produce the same results (**determinism**), and a variety of techniques across the family of CDC algorithms achieves remarkable **efficiency** and throughput. From Rabin's 1981 fingerprinting to VectorCDC's 2025 SIMD acceleration to structure-aware chunking for source code, the core idea has proven remarkably durable and adaptable.

### References

<div class="cdc-references">

<div class="bib-entry" id="ref-15">
  <div class="bib-number">[15]</div>
  <div class="bib-citation">W. Xia, H. Jiang, D. Feng, F. Douglis, P. Shilane, Y. Hua, M. Fu, Y. Zhang &amp; Y. Zhou, "A Comprehensive Study of the Past, Present, and Future of Data Deduplication," <em>Proceedings of the IEEE</em>, vol. 104, no. 9, pp. 1681-1710, September 2016.</div>
  <div class="bib-links">
    <a href="https://ieeexplore.ieee.org/document/7529062" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> IEEE</a>
  </div>
</div>

<div class="bib-entry" id="ref-16">
  <div class="bib-number">[16]</div>
  <div class="bib-citation">B. Zhu, K. Li &amp; H. Patterson, "Avoiding the Disk Bottleneck in the Data Domain Deduplication File System," <em>6th USENIX Conference on File and Storage Technologies (FAST '08)</em>, San Jose, CA, February 2008.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/legacy/event/fast08/tech/full_papers/zhu/zhu.pdf" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> PDF</a>
  </div>
</div>

<div class="bib-entry" id="ref-18">
  <div class="bib-number">[18]</div>
  <div class="bib-citation">M. Lillibridge, K. Eshghi, D. Bhagwat, V. Deolalikar, G. Trezise &amp; P. Camble, "Sparse Indexing: Large Scale, Inline Deduplication Using Sampling and Locality," <em>7th USENIX Conference on File and Storage Technologies (FAST '09)</em>, San Jose, CA, February 2009.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/fast-09/sparse-indexing-large-scale-inline-deduplication-using-sampling-and-locality" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-23">
  <div class="bib-number">[23]</div>
  <div class="bib-citation">N. Koorapati, "Streaming File Synchronization," <em>Dropbox Tech Blog</em>, July 2014.</div>
  <div class="bib-links">
    <a href="https://dropbox.tech/infrastructure/streaming-file-synchronization" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Blog</a>
  </div>
</div>

<div class="bib-entry" id="ref-24">
  <div class="bib-number">[24]</div>
  <div class="bib-citation">R. Jain &amp; D. R. Horn, "Broccoli: Syncing Faster by Syncing Less," <em>Dropbox Tech Blog</em>, August 2020.</div>
  <div class="bib-links">
    <a href="https://dropbox.tech/infrastructure/-broccoli--syncing-faster-by-syncing-less" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Blog</a>
  </div>
</div>

<div class="bib-entry" id="ref-25">
  <div class="bib-number">[25]</div>
  <div class="bib-citation">Y. Cui, Z. Lai, N. Dai &amp; X. Wang, "QuickSync: Improving Synchronization Efficiency for Mobile Cloud Storage Services," <em>IEEE Transactions on Mobile Computing</em>, vol. 16, no. 12, pp. 3513-3526, 2017.</div>
  <div class="bib-links">
    <a href="https://ieeexplore.ieee.org/document/7898362" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> IEEE</a>
  </div>
</div>

<div class="bib-entry" id="ref-26">
  <div class="bib-number">[26]</div>
  <div class="bib-citation">Seafile Ltd., "Data Model," <em>Seafile Administration Manual</em>. CDC implementation: <a href="https://github.com/haiwen/seafile-server/blob/master/common/cdc/cdc.c">seafile-server/common/cdc/cdc.c</a>.</div>
  <div class="bib-links">
    <a href="https://manual.seafile.com/latest/develop/data_model/" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Docs</a>
    <a href="https://github.com/haiwen/seafile-server" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
  </div>
</div>

<div class="bib-entry" id="ref-29">
  <div class="bib-number">[29]</div>
  <div class="bib-citation">M. Kaczmarczyk, M. Barczynski, W. Kilian &amp; C. Dubnicki, "Reducing Impact of Data Fragmentation Caused by In-line Deduplication," <em>SYSTOR '12</em>, Haifa, Israel, June 2012.</div>
  <div class="bib-links">
    <a href="https://dl.acm.org/doi/10.1145/2367589.2367600" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> ACM</a>
  </div>
</div>

<div class="bib-entry" id="ref-30">
  <div class="bib-number">[30]</div>
  <div class="bib-citation">M. Lillibridge, K. Eshghi &amp; D. Bhagwat, "Improving Restore Speed for Backup Systems that Use Inline Chunk-Based Deduplication," <em>11th USENIX Conference on File and Storage Technologies (FAST '13)</em>, San Jose, CA, February 2013.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/fast13/technical-sessions/presentation/lillibridge" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-31">
  <div class="bib-number">[31]</div>
  <div class="bib-citation">M. Fu, D. Feng, Y. Hua, X. He, Z. Chen, W. Xia, Y. Zhang &amp; Y. Tan, "Accelerating Restore and Garbage Collection in Deduplication-based Backup Systems via Exploiting Historical Information," <em>USENIX ATC '14</em>, Philadelphia, PA, June 2014.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/atc14/technical-sessions/presentation/fu_min" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-32">
  <div class="bib-number">[32]</div>
  <div class="bib-citation">X. Zou et al., "The Dilemma between Deduplication and Locality: Can Both be Achieved?" <em>19th USENIX Conference on File and Storage Technologies (FAST '21)</em>, February 2021.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/fast21/presentation/zou" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-33">
  <div class="bib-number">[33]</div>
  <div class="bib-citation">F. Douglis, A. Duggal, P. Shilane, T. Wong, S. Yan &amp; F. Botelho, "The Logic of Physical Garbage Collection in Deduplicating Storage," <em>15th USENIX Conference on File and Storage Technologies (FAST '17)</em>, Santa Clara, CA, February 2017.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/fast17/technical-sessions/presentation/douglis" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-34">
  <div class="bib-number">[34]</div>
  <div class="bib-citation">W. Xia et al., "Garbage Collection Does Not Only Collect Garbage: Piggybacking-Style Defragmentation for Deduplicated Backup Storage," <em>EuroSys '25</em>, 2025.</div>
  <div class="bib-links">
    <a href="https://dl.acm.org/doi/10.1145/3689031.3717493" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> ACM</a>
  </div>
</div>

<div class="bib-entry" id="ref-35">
  <div class="bib-number">[35]</div>
  <div class="bib-citation">M. Fu, D. Feng, Y. Hua, X. He, Z. Chen, W. Xia, Y. Zhang &amp; Y. Tan, "Design Tradeoffs for Data Deduplication Performance in Backup Workloads," <em>13th USENIX Conference on File and Storage Technologies (FAST '15)</em>, Santa Clara, CA, February 2015.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/fast15/technical-sessions/presentation/fu" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-36">
  <div class="bib-number">[36]</div>
  <div class="bib-citation">A. Duggal, F. Jenkins, P. Shilane, R. Chinthekindi, R. Shah &amp; M. Kamat, "Data Domain Cloud Tier: Backup here, backup there, deduplicated everywhere!" <em>USENIX ATC '19</em>, Renton, WA, July 2019.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/atc19/presentation/duggal" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

</div>

<div class="cdc-series-nav">
&larr; <a href="/writings/content-defined-chunking-part-3">Part 3: Deduplication in Action</a> &middot; Back to <a href="/writings/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
