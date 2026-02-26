---
layout: writing
group: Writings
title: "Content-Defined Chunking, Part 2: A Deep Dive into FastCDC"
summary: "An interactive exploration of FastCDC's GEAR hash, normalized chunking with dual masks, and the 2020 two-byte-per-iteration optimization, with code in pseudocode, Rust, and TypeScript."
date: 2026-02-09 12:00:00
categories:
- writings
---

<style>
/* ==========================================================================
   CDC Animation Styles
/* View mode tabs (Text / Blocks / Hex) */
.cdc-view-tabs {
  display: flex;
  gap: 0.25rem;
  background: rgba(61, 58, 54, 0.05);
  padding: 0.25rem;
  border-radius: 6px;
}

.cdc-view-tab {
  padding: 0.4rem 0.75rem;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 0.8rem;
  color: #8b7355;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cdc-view-tab:hover {
  color: #3d3a36;
}

.cdc-view-tab.active {
  background: #fff;
  color: #c45a3b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Content display area */
.cdc-content {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 1rem;
  line-height: 1.8;
  color: #3d3a36;
}

/* Text view with chunk highlighting */
.cdc-text-view {
  white-space: pre-wrap;
  word-break: break-word;
}

.cdc-text-view .chunk {
  display: inline;
  padding: 0.1rem 0;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

/* Chunk colors - warm palette matching site */
.cdc-text-view .chunk-0 { background-color: rgba(196, 90, 59, 0.15); }
.cdc-text-view .chunk-1 { background-color: rgba(212, 165, 116, 0.25); }
.cdc-text-view .chunk-2 { background-color: rgba(139, 115, 85, 0.15); }
.cdc-text-view .chunk-3 { background-color: rgba(196, 90, 59, 0.25); }
.cdc-text-view .chunk-4 { background-color: rgba(212, 165, 116, 0.15); }
.cdc-text-view .chunk-5 { background-color: rgba(139, 115, 85, 0.25); }

/* Block view */
.cdc-blocks-view {
  display: flex;
  align-items: stretch;
  gap: 2px;
  margin-top: 1rem;
  padding: 0.5rem 0;
  width: 100%;
}

.cdc-block {
  height: 24px;
  border-radius: 3px;
  transition: all 0.2s ease;
  position: relative;
}

.cdc-block.chunk-0 { background-color: #c45a3b; }
.cdc-block.chunk-1 { background-color: #d4a574; }
.cdc-block.chunk-2 { background-color: #8b7355; }
.cdc-block.chunk-3 { background-color: #c45a3b; opacity: 0.7; }
.cdc-block.chunk-4 { background-color: #d4a574; opacity: 0.7; }
.cdc-block.chunk-5 { background-color: #8b7355; opacity: 0.7; }

.cdc-block:hover {
  transform: scaleY(1.2);
  z-index: 1;
}

/* Hex view */
.cdc-hex-view {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.cdc-hex-byte {
  padding: 0.15rem 0.3rem;
  border-radius: 2px;
}

/* File icon visualization for fixed vs CDC comparison */
.cdc-file-icon {
  position: relative;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  padding: 1.5rem;
  padding-top: 2.25rem;
  margin: 0.75rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Folded corner effect */
.cdc-file-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 24px 24px 0;
  border-color: transparent #faf9f7 transparent transparent;
  filter: drop-shadow(-1px 1px 1px rgba(0, 0, 0, 0.1));
}

.cdc-file-corner::before {
  content: '';
  position: absolute;
  top: 0;
  right: -24px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 24px 24px;
  border-color: transparent transparent #e8e8e8 transparent;
}

.cdc-file-label {
  position: absolute;
  top: 0.6rem;
  left: 1rem;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: #8b7355;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cdc-file-content {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  line-height: 2.2;
  color: #3d3a36;
  white-space: pre-wrap;
  word-break: break-word;
}

.cdc-chunk-explanation {
  font-size: 0.8rem;
  color: #8b7355;
  margin: 0.25rem 0 0.5rem 0;
  font-style: italic;
}

/* Chunk spans with box styling - matches CHUNK_SOLID_COLORS from cdc-animations.js */
.cdc-chunk {
  padding: 0.2rem 0.35rem;
  border-radius: 3px;
  border: 2px solid;
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.cdc-chunk.chunk-a {
  background: rgba(196, 90, 59, 0.15);
  border-color: #c45a3b;
}

.cdc-chunk.chunk-b {
  background: rgba(90, 138, 90, 0.15);
  border-color: #5a8a5a;
}

.cdc-chunk.chunk-c {
  background: rgba(70, 110, 160, 0.15);
  border-color: #466ea0;
}

.cdc-chunk.chunk-d {
  background: rgba(160, 100, 50, 0.15);
  border-color: #a06432;
}

.cdc-chunk.chunk-e {
  background: rgba(130, 80, 150, 0.15);
  border-color: #825096;
}

/* New chunk - terracotta accent to match interactive demos */
.cdc-chunk.chunk-new {
  background: rgba(196, 90, 59, 0.2);
  border-color: #c45a3b;
  border-style: solid;
}

/* Unchanged chunk - muted gray, matches shared/dedup style in animations */
.cdc-chunk.unchanged {
  background: rgba(61, 58, 54, 0.06);
  border-color: rgba(61, 58, 54, 0.2);
  color: #8b8178;
}

/* Changed chunk - dashed border to signal the chunk content shifted */
.cdc-chunk.changed {
  border-style: dashed;
}

/* Chunk Comparison Demo (JS-powered before/after) */
.cdc-chunk-comparison-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: #8b7355;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.cdc-chunk-comparison-file {
  margin-bottom: 0.75rem;
}

.cdc-chunk-comparison-text {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 0.75rem;
  background: rgba(61, 58, 54, 0.02);
  border-radius: 6px;
  border: 1px solid rgba(61, 58, 54, 0.06);
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.6;
}

.cdc-cmp-chunk {
  padding: 0.15rem 0.25rem;
  border-radius: 3px;
  border: 2px solid;
  display: inline-block;
  cursor: default;
  transition: filter 0.1s ease;
}

.cdc-cmp-chunk.unchanged {
  background: rgba(61, 58, 54, 0.06);
  border-color: rgba(61, 58, 54, 0.2);
  color: #8b8178;
}

.cdc-cmp-chunk.new {
  border-style: solid;
}

.cdc-cmp-chunk.chunk-hover {
  filter: brightness(0.82);
  outline: 3px solid rgba(61, 58, 54, 0.5);
  outline-offset: 0px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
}

.cdc-cmp-chunk.unchanged.chunk-hover {
  filter: brightness(0.85);
  outline: 3px solid rgba(61, 58, 54, 0.4);
  background: rgba(61, 58, 54, 0.15);
}

/* Chunk wrapper: label above, text below */
.cdc-cmp-chunk-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: top;
  margin: 0.15rem 0.2rem;
}

.cdc-chunk-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: rgba(61, 58, 54, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(61, 58, 54, 0.06);
}

.cdc-chunk-summary-stat {
  text-align: center;
}

.cdc-chunk-summary-value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.2;
}

.cdc-chunk-summary-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.65rem;
  color: #8b7355;
  margin-top: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cdc-cmp-chunk-label {
  display: block;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.02em;
  margin-bottom: 0.15rem;
}

/* Edit indicator arrow */
.cdc-edit-indicator {
  text-align: center;
  font-size: 0.8rem;
  color: #8b7355;
  padding: 0.5rem 0;
}

/* Deduplication result */
.cdc-dedup-result {
  text-align: center;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
}

.cdc-dedup-result.bad {
  background: rgba(196, 90, 59, 0.1);
  color: #a84832;
}

.cdc-dedup-result.good {
  background: rgba(90, 160, 90, 0.1);
  color: #3d8b3d;
}

/* Rolling window indicator */
.cdc-window {
  position: absolute;
  height: 100%;
  background: rgba(196, 90, 59, 0.3);
  border: 2px solid #c45a3b;
  border-radius: 4px;
  pointer-events: none;
  transition: left 0.1s ease;
}

/* Hash display */
.cdc-hash-display {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.8rem;
  color: #8b7355;
  min-height: 1.4em;
}

.cdc-hash-display strong {
  color: #c45a3b;
}

/* Controls panel */
.cdc-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.25rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.cdc-control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cdc-control-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  color: #3d3a36;
}

.cdc-controls input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #d4a574, #c45a3b);
  border-radius: 3px;
  outline: none;
}

.cdc-controls input[type="range"]::-webkit-slider-thumb {
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

.cdc-controls input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.cdc-controls input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #c45a3b;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Playback controls */
.cdc-playback {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(61, 58, 54, 0.02);
  border-top: 1px solid rgba(61, 58, 54, 0.08);
}

.cdc-playback-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #c45a3b;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.cdc-playback-btn:hover {
  background: #a84832;
  transform: scale(1.05);
}

.cdc-playback-btn.secondary {
  background: rgba(61, 58, 54, 0.1);
  color: #3d3a36;
}

.cdc-playback-btn.secondary:hover {
  background: rgba(61, 58, 54, 0.2);
}

.cdc-speed-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.cdc-speed-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.8rem;
  color: #8b7355;
}

/* Progress indicator */
.cdc-progress {
  flex: 1;
  height: 4px;
  background: rgba(61, 58, 54, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 0.5rem;
}

.cdc-progress-bar {
  height: 100%;
  background: linear-gradient(to right, #d4a574, #c45a3b);
  border-radius: 2px;
  transition: width 0.1s ease;
}

/* Side-by-side comparison */
.cdc-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
}

@media (max-width: 50em) {
  .cdc-comparison {
    grid-template-columns: 1fr;
  }
}

.cdc-comparison-panel {
  padding: 1.25rem;
  background: #fff;
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-radius: 8px;
}

.cdc-comparison-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: #3d3a36;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(61, 58, 54, 0.1);
}

/* Chunk boundary marker */
.cdc-boundary-marker {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: #c45a3b;
  margin: 0 1px;
  vertical-align: middle;
  border-radius: 1px;
}

/* Stats display */
.cdc-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: rgba(61, 58, 54, 0.02);
  border-radius: 6px;
  margin-top: 1rem;
}

.cdc-stat {
  text-align: center;
}

.cdc-stat-value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 1.5rem;
  font-weight: 600;
  color: #c45a3b;
}

.cdc-stat-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.75rem;
  color: #8b7355;
  margin-top: 0.25rem;
}

/* Deduplication visualization */
.cdc-dedup-viz {
  margin: 2rem 0;
}

.cdc-dedup-files {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: start;
}

.cdc-dedup-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: #8b7355;
  font-size: 1.5rem;
}

.cdc-dedup-storage {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(196, 90, 59, 0.05) 0%, rgba(212, 165, 116, 0.08) 100%);
  border-radius: 8px;
}

.cdc-dedup-storage-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3d3a36;
  margin-bottom: 0.75rem;
}

.cdc-dedup-chunks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cdc-dedup-chunk {
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  color: #fff;
}

.cdc-dedup-chunk.shared {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
}

/* Versioned Dedup - Editor */
.cdc-dedup-editor { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }

.cdc-dedup-textarea {
  width: 100%; min-height: 80px; padding: 0.75rem;
  font-family: 'Source Serif 4', Georgia, serif; font-size: 0.9rem; line-height: 1.6;
  color: #3d3a36; background: #fff;
  border: 1px solid rgba(61, 58, 54, 0.2); border-radius: 6px;
  resize: vertical; box-sizing: border-box;
}
.cdc-dedup-textarea:focus { outline: none; border-color: #c45a3b; box-shadow: 0 0 0 2px rgba(196, 90, 59, 0.15); }

.cdc-dedup-save-btn {
  align-self: flex-start; padding: 0.5rem 1.25rem;
  font-family: 'Libre Baskerville', Georgia, serif; font-size: 0.85rem;
  color: #fff; background: #c45a3b; border: none; border-radius: 6px;
  cursor: pointer; transition: background 0.15s ease, transform 0.1s ease;
}
.cdc-dedup-save-btn:hover { background: #a84832; transform: translateY(-1px); }
.cdc-dedup-save-btn:active { transform: translateY(0); }

/* Versioned Dedup - Timeline */
.cdc-dedup-timeline { position: relative; margin-bottom: 1.5rem; }

.cdc-version-entry { display: flex; gap: 1rem; padding-bottom: 1.5rem; position: relative; }

.cdc-version-entry:not(:last-child)::before {
  content: ''; position: absolute; top: 15px; left: 5px;
  width: 2px; bottom: 0; background: rgba(61, 58, 54, 0.15);
}

.cdc-version-dot {
  position: relative; flex-shrink: 0;
  width: 12px; height: 12px; margin-top: 3px;
  background: #c45a3b; border-radius: 50%;
  border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(61, 58, 54, 0.2);
}

.cdc-version-content { flex: 1; min-width: 0; }

.cdc-version-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.9rem; font-weight: 600; color: #3d3a36; margin-bottom: 0.5rem;
}

.cdc-version-cols { display: grid; grid-template-columns: 1fr 180px; gap: 1rem; align-items: start; }

.cdc-version-text {
  white-space: pre-wrap; word-break: break-word;
  padding: 0.5rem; background: rgba(61, 58, 54, 0.02);
  border-radius: 6px; border: 1px solid rgba(61, 58, 54, 0.06);
}

.cdc-version-blocks { display: flex; flex-direction: column; gap: 0.5rem; }
.cdc-version-blocks .cdc-blocks-view { margin-top: 0; min-height: 24px; }

.cdc-version-stats {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.7rem; color: #8b7355; line-height: 1.4;
}

.cdc-dedup-timeline-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem; font-weight: 600; color: #8b7355;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
}

[data-chunk-hash].hash-hover {
  filter: brightness(0.85);
  outline: 2px solid rgba(61, 58, 54, 0.4);
  outline-offset: -1px;
}

@media (max-width: 42em) {
  .cdc-version-cols { grid-template-columns: 1fr; }
}

/* Beginner breadcrumb */
/* Table of Contents */
.cdc-toc {
  margin: 2rem 0;
  padding: 1.25rem 1.5rem;
  background: rgba(61, 58, 54, 0.03);
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-radius: 8px;
}

.cdc-toc strong {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.95rem;
  color: #3d3a36;
}

.cdc-toc ol {
  margin: 0.75rem 0 0 0;
  padding-left: 1.25rem;
}

.cdc-toc li {
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #5a564f;
}

.cdc-toc a {
  color: #c45a3b;
  text-decoration: none;
  font-weight: 600;
}

.cdc-toc a:hover {
  text-decoration: underline;
}

.cdc-toc ul {
  margin: 0.25rem 0 0.25rem 0;
  padding-left: 1.25rem;
  list-style: none;
}

.cdc-toc ul li {
  margin-bottom: 0.15rem;
  font-size: 0.82rem;
  color: #8b7355;
}

.cdc-toc ul li a {
  font-weight: 400;
  color: #8b7355;
}

.cdc-toc ul li a:hover {
  color: #c45a3b;
}

/* Taxonomy tree diagram */
.cdc-taxonomy {
  padding: 1.25rem 1.5rem;
  background: rgba(61, 58, 54, 0.03);
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-radius: 8px;
}

.cdc-taxonomy strong {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.95rem;
  color: #3d3a36;
}

.cdc-taxonomy-tree {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

/* Root node */
.cdc-tax-root {
  padding: 0.4rem 1rem;
  background: #3d3a36;
  color: #fff;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  text-align: center;
}

/* Vertical connector from root */
.cdc-tax-vline {
  width: 2px;
  height: 16px;
  background: rgba(61, 58, 54, 0.25);
}

/* Horizontal bar connecting the three families */
.cdc-tax-hbar {
  width: 80%;
  height: 2px;
  background: rgba(61, 58, 54, 0.25);
  position: relative;
}

/* Three-column family layout */
.cdc-tax-families {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0;
}

.cdc-tax-family {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

/* Vertical connector from hbar to family label */
.cdc-tax-family .cdc-tax-vline {
  height: 12px;
}

.cdc-tax-family-label {
  padding: 0.3rem 0.5rem;
  border-radius: 5px;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.cdc-tax-family-label.bsw {
  background: rgba(196, 90, 59, 0.12);
  color: #c45a3b;
  border: 1px solid rgba(196, 90, 59, 0.25);
}

.cdc-tax-family-label.extrema {
  background: rgba(42, 125, 79, 0.1);
  color: #2a7d4f;
  border: 1px solid rgba(42, 125, 79, 0.2);
}

.cdc-tax-family-label.statistical {
  background: rgba(139, 115, 85, 0.12);
  color: #8b7355;
  border: 1px solid rgba(139, 115, 85, 0.25);
}

.cdc-tax-algorithms {
  margin-top: 0.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.cdc-tax-algo {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.65rem;
  color: #5a564f;
  line-height: 1.3;
}

.cdc-tax-algo .cdc-tax-year {
  color: #a89b8c;
}

.cdc-learn-more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  padding: 0.4rem 0.75rem;
  background: rgba(212, 165, 116, 0.15);
  border-radius: 4px;
  font-size: 0.8rem;
  font-style: normal;
  color: #8b7355;
}

.cdc-learn-more::before {
  content: "💡";
}

/* Combined text + hex view */
.cdc-combined-view {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
}

.cdc-byte-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 2px;
  padding: 0.15rem 0.1rem;
}

.cdc-byte-char {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #3d3a36;
}

.cdc-byte-hex {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  line-height: 1;
  color: #8b7355;
  margin-top: 1px;
}

/* Block annotation bar (below text/hex views) */
.cdc-block-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cdc-block {
  width: 100%;
}

.cdc-block-annotation {
  width: 100%;
  position: relative;
  margin-top: 0.3rem;
}

.cdc-block-line {
  width: 100%;
  height: 0;
  border-top: 1.5px solid #8b7355;
  opacity: 0.5;
}

.cdc-block-tick {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 1.5px;
  height: 8px;
  background: #8b7355;
  opacity: 0.5;
}

.cdc-block-label {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  color: #8b7355;
  white-space: nowrap;
  user-select: none;
  line-height: 1;
  text-align: center;
  margin-top: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Fix chunk bar height in Gear Hash demo to prevent layout shift */
#gear-hash-demo .cdc-blocks-view {
  min-height: 60px;
}

/* Default text for Gear Hash demo */
#gear-hash-demo .cdc-byte-char {
  color: #000;
  font-weight: 600;
}
#gear-hash-demo .cdc-byte-hex {
  color: #6b5a42;
}

/* Chunk hover highlights */
.cdc-combined-view .cdc-byte-col.chunk-hover {
  filter: brightness(0.85);
  outline: 1px solid rgba(61, 58, 54, 0.25);
  outline-offset: -1px;
}

.cdc-block-wrapper.chunk-hover .cdc-block {
  filter: brightness(1.15);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
}

.cdc-block-wrapper.chunk-hover .cdc-block-label {
  color: #3d3a36;
  font-weight: 600;
}

.cdc-text-view .chunk.chunk-hover {
  filter: brightness(0.9);
  outline: 1px solid rgba(61, 58, 54, 0.3);
  outline-offset: -1px;
}

/* GEAR Lookup Table grid */
.gear-table-grid {
  display: grid;
  grid-template-columns: 1.2rem repeat(16, 1fr);
  grid-template-rows: 0.7rem repeat(16, 13px);
  gap: 1px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.gear-table-label {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.5rem;
  color: #8b7355;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  padding: 0 2px;
}

.gear-table-label.col-header {
  padding-bottom: 2px;
}

.gear-table-label.row-header {
  padding-right: 3px;
}

.gear-table-legend {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.55rem;
  color: #8b7355;
  margin-top: 0.4rem;
  text-align: center;
}

.gear-table-cell {
  min-height: 10px;
  border-radius: 1px;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.15s ease;
  position: relative;
}

.gear-table-cell:hover {
  transform: scale(1.4);
  z-index: 2;
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
}

.gear-table-cell.active {
  outline: 2px solid #c45a3b;
  outline-offset: 0px;
  box-shadow: 0 0 6px rgba(196, 90, 59, 0.5);
  z-index: 3;
  transform: scale(1.4);
}

.gear-table-readout {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.8rem;
  color: #8b7355;
  min-height: 2.8em;
}

.gear-table-readout strong {
  color: #c45a3b;
}

/* Rolling hash window strip */
.gear-hash-window {
  display: flex;
  gap: 1px;
  overflow-x: auto;
  padding: 0.25rem 0;
  margin-bottom: 0.5rem;
  min-height: 3.2rem;
}

.gear-hw-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2rem;
  padding: 0.2rem 0.15rem;
  border-radius: 3px;
  background: rgba(61, 58, 54, 0.04);
  transition: background-color 0.15s ease;
}

.gear-hw-cell.current {
  outline: 2px solid #c45a3b;
  outline-offset: -1px;
}

.gear-hw-cell.boundary {
  border-right: 2px solid #2a7d4f;
}

.gear-hw-char {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 0.8rem;
  color: #3d3a36;
  line-height: 1.2;
}

.gear-hw-hash {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.5rem;
  color: #8b7355;
  line-height: 1;
  margin-top: 2px;
}

.gear-hw-hash.boundary {
  color: #2a7d4f;
  font-weight: 700;
}

/* Bit-shift visualization */
.gear-shift-viz {
  margin-bottom: 0;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
}

.gear-shift-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 3px;
}

.gear-shift-label {
  width: 4rem;
  text-align: right;
  color: #8b7355;
  font-size: 0.6rem;
  flex-shrink: 0;
}

.gear-shift-hex {
  width: 5.5rem;
  text-align: right;
  color: #3d3a36;
  font-size: 0.6rem;
  flex-shrink: 0;
  padding-right: 0.3rem;
}

.gear-shift-bits {
  display: flex;
  gap: 0;
  position: relative;
}

.gear-bit {
  width: 7px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.45rem;
  line-height: 1;
  border-radius: 1px;
}

.gear-bit.b0,
.gear-bit.b1 {
  background: rgba(61, 58, 54, 0.06);
  color: #3d3a36;
}

.gear-bit.dropped {
  background: rgba(196, 90, 59, 0.25);
  color: #c45a3b;
  text-decoration: line-through;
}

.gear-bit.entering {
  background: rgba(90, 138, 90, 0.25);
  color: #5a8a5a;
  font-weight: 700;
}

@keyframes gear-slide-left {
  0% { transform: translateX(7px); opacity: 0.5; }
  100% { transform: translateX(0); opacity: 1; }
}

.gear-shift-bits.animated .gear-bit {
  animation: gear-slide-left 0.25s ease-out;
}

.gear-shift-box {
  border: 1.5px solid rgba(196, 90, 59, 0.3);
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
  background: rgba(196, 90, 59, 0.02);
}

.gear-shift-connector {
  text-align: center;
  color: #8b7355;
  font-size: 0.7rem;
  line-height: 1;
  padding: 0.15rem 0;
}

.gear-shift-add {
  border: 1.5px solid rgba(61, 58, 54, 0.12);
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
  background: rgba(61, 58, 54, 0.02);
}

.gear-shift-separator {
  width: calc(32 * 7px);
  border-top: 1px solid rgba(61, 58, 54, 0.15);
  margin: 2px 0;
}

/* Two-column layout: Operation panel + GEAR table */
.gear-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto auto;
  gap: 0 1.5rem;
  margin-top: 1rem;
}

.gear-col-left {
  display: contents;
}

.gear-col-right {
  display: contents;
}

.gear-col-left > .cdc-viz-header {
  grid-column: 1;
  grid-row: 1;
}

.gear-col-right > .cdc-viz-header {
  grid-column: 2;
  grid-row: 1;
}

.gear-col-left > .gear-table-readout {
  grid-column: 1;
  grid-row: 2;
}

.gear-col-right > .cdc-hash-display {
  grid-column: 2;
  grid-row: 2;
}

.gear-col-left > .gear-table-grid {
  grid-column: 1;
  grid-row: 3 / 5;
}

.gear-col-left > .gear-table-legend {
  grid-column: 1;
  grid-row: 5;
}

.gear-col-right > .gear-hash-window {
  grid-column: 2;
  grid-row: 3;
}

.gear-col-right > .gear-shift-viz {
  grid-column: 2;
  grid-row: 4;
  align-self: start;
}

/* Chunk boundary marker (vertical separator) */
.chunk-boundary-marker {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: #c45a3b;
  margin: 0 2px;
  vertical-align: middle;
  border-radius: 1px;
  opacity: 0.6;
}

.chunk-label {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  color: #8b7355;
  background: rgba(61, 58, 54, 0.06);
  padding: 0.1rem 0.3rem;
  border-radius: 2px;
  margin-right: 2px;
  vertical-align: top;
  line-height: 1;
  user-select: none;
}

/* KDE density curve (ComparisonDemo) */

/* Override container when used for KDE */
.kde-distribution-chart {
  display: block;
  height: 170px;
  padding: 0;
  margin-top: 0.75rem;
}

/* Plot area wrapper */
.kde-chart-wrapper {
  position: absolute;
  top: 0;
  left: 52px;
  right: 5px;
  bottom: 30px;
  overflow: visible;
}

/* SVG fills the wrapper */
.kde-chart-svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Tick labels (shared) */
.kde-tick {
  position: absolute;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.55rem;
  color: #8b7355;
  pointer-events: none;
  white-space: nowrap;
}

/* X-axis ticks: below the chart */
.kde-tick-x {
  bottom: 0;
  transform: translate(-50%, calc(100% + 2px));
}

/* Y-axis ticks: left of the chart */
.kde-tick-y {
  left: 0;
  transform: translate(calc(-100% - 4px), -50%);
  text-align: right;
}

/* Axis title labels */
.kde-axis-title {
  position: absolute;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.55rem;
  color: #8b7355;
  pointer-events: none;
  white-space: nowrap;
}

/* X-axis title: centered below ticks */
.kde-axis-title-x {
  bottom: 0;
  left: 50%;
  transform: translate(-50%, calc(100% + 16px));
}

/* Y-axis title: rotated, centered left of ticks */
.kde-axis-title-y {
  top: 50%;
  left: 0;
  transform: translate(calc(-100% - 30px), -50%) rotate(-90deg);
  transform-origin: center center;
}

/* Caption below charts explaining density */
.kde-caption {
  font-size: 0.78rem;
  color: #8b7355;
  text-align: center;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  line-height: 1.45;
}

/* Reference label inside wrapper */
.kde-ref-label {
  position: absolute;
  top: 0;
  margin-left: 5px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  color: #c45a3b;
  white-space: nowrap;
  pointer-events: none;
}

/* Parametric Chunking Explorer - distribution chart */
.parametric-distribution-chart {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 120px;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.parametric-dist-bar {
  flex: 1;
  min-width: 3px;
  border-radius: 2px 2px 0 0;
  transition: height 0.2s ease;
  cursor: pointer;
  position: relative;
}

.parametric-dist-bar:hover { opacity: 0.8; }

.parametric-dist-tooltip {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #3d3a36;
  color: #fff;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  margin-bottom: 4px;
  z-index: 10;
}

.parametric-dist-bar:hover .parametric-dist-tooltip { display: block; }

.parametric-dist-reference {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 2px dashed rgba(196, 90, 59, 0.5);
  pointer-events: none;
  z-index: 1;
}

.parametric-dist-reference-label {
  position: absolute;
  right: 0;
  top: -1.1rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  color: #c45a3b;
  white-space: nowrap;
}

.parametric-dist-bar.chunk-hover {
  filter: brightness(1.15);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
}

.parametric-derived-params {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  color: #8b7355;
  white-space: nowrap;
}

/* Basic vs Normalized Comparison */
.comparison-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.comparison-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3d3a36;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(61, 58, 54, 0.1);
  margin-bottom: 0.75rem;
}

.comparison-label-text {
  white-space: nowrap;
}

.comparison-sublabel {
  font-weight: 400;
  color: #8b7355;
  font-size: 0.85rem;
}

.comparison-col {
  min-width: 0;
  overflow: visible;
}

.comparison-col .cdc-blocks-view {
  overflow: hidden;
  height: 76px;
  position: relative;
}

.comparison-col .cdc-block-wrapper {
  min-width: 0;
  overflow: hidden;
}

.comparison-col .cdc-block {
  margin-top: auto;
}

/* Distribution illustration (static SVG curves) */
.dist-illustration {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 42em) {
  .dist-illustration {
    grid-template-columns: 1fr;
  }
}

.dist-illustration-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.dist-illustration-note {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.75rem;
  color: #8b7355;
  margin-top: 0.35rem;
  line-height: 1.4;
}

.cdc-blocks-target-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 1.5px dashed rgba(61, 58, 54, 0.7);
  pointer-events: none;
  z-index: 1;
}

.comparison-summary {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  font-weight: 400;
  color: #8b7355;
}

.comparison-summary span {
  color: #c45a3b;
  font-weight: 600;
}

.parametric-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(61, 58, 54, 0.1);
}

.parametric-section-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3d3a36;
  white-space: nowrap;
}

#parametric-blocks-bar {
  height: 70px;
  position: relative;
  overflow: hidden;
}

#parametric-blocks-bar .cdc-block-wrapper {
  min-width: 0;
  overflow: hidden;
}

#parametric-blocks-bar .cdc-block {
  margin-top: auto;
}

.parametric-summary {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  color: #8b7355;
  margin-bottom: 0.5rem;
}

.parametric-summary span {
  color: #c45a3b;
  font-weight: 600;
}

.comparison-blocks-hint {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.65rem;
  color: #a09080;
  margin-top: 0.35rem;
  line-height: 1.35;
}

/* Mobile responsive */
@media (max-width: 42em) {
  .cdc-controls {
    grid-template-columns: 1fr;
  }

  .cdc-dedup-files {
    grid-template-columns: 1fr;
  }

  .cdc-dedup-arrow {
    transform: rotate(90deg);
    padding: 1rem 0;
  }

  .cdc-chunk-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .cdc-hex-view {
    font-size: 0.65rem;
  }

  .gear-two-col {
    grid-template-columns: 1fr;
  }

  .gear-col-left > .cdc-viz-header { grid-row: auto; }
  .gear-col-right > .cdc-viz-header { grid-row: auto; }
  .gear-col-left > .gear-table-readout { grid-row: auto; }
  .gear-col-right > .cdc-hash-display { grid-row: auto; }
  .gear-col-left > .gear-table-grid { grid-row: auto; }
  .gear-col-left > .gear-table-legend { grid-row: auto; }
  .gear-col-right > .gear-hash-window { grid-row: auto; }
  .gear-col-right > .gear-shift-viz { grid-row: auto; }

  .gear-col-left > *,
  .gear-col-right > * {
    grid-column: 1;
  }

  .gear-table-grid {
    gap: 0px;
  }

  .gear-table-cell {
    border-radius: 0;
    height: 12px;
  }

  .gear-table-label {
    font-size: 0.4rem;
  }

}

</style>

<!-- MathJax for rendering mathematical notation -->
<script>
MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']]
  }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>

<div class="cdc-series-nav">
Part 2 of 5 in a series on Content-Defined Chunking. Previous: <a href="/writings/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a> · Next: <a href="/writings/content-defined-chunking-part-3">Part 3: Deduplication in Action</a>
</div>

[Part 1](/writings/content-defined-chunking-part-1) introduced the deduplication problem, showed why fixed-size chunking fails, and surveyed three CDC algorithm families: Basic Sliding Window (BSW), Local Extrema, and Statistical. This post focuses on **FastCDC**, the most widely adopted BSW algorithm, exploring its Gear hash, normalized chunking strategy, and tunable parameters through interactive demos.

---

## A Closer Look at BSW via FastCDC

The **Basic Sliding Window** family includes FastCDC, which is true to its name: it is *fast*. Where Rabin used polynomial arithmetic and Buzhash used cyclic shifts, FastCDC's Gear hash strips the rolling hash down to its simplest possible form. That speed, combined with normalized chunking for tighter chunk-size distributions, has made FastCDC one of the most widely implemented CDC algorithms today, with mature libraries in Rust, Go, Python, Java, and C++. We'll explore both the 2016<span class="cdc-cite"><a href="#ref-5">[5]</a></span> and 2020<span class="cdc-cite"><a href="#ref-6">[6]</a></span> versions in detail, using the <a href="https://github.com/nlfiedler/fastcdc-rs"><code>fastcdc-rs</code></a> Rust crate as our reference implementation.

### The GEAR Hash

At FastCDC's core is the **Gear hash**, a rolling hash reduced to two operations. For each byte, you:
1. **Left-shift** the current hash by one bit, dropping the most significant bit
2. **Add** the value from the GEAR table keyed by the current byte, a pre-computed 64-bit random value, to the hash

That's it. No XOR with outgoing bytes, no polynomial division. Just shift and add.

*The visualization below uses 32-bit values for compactness. The real FastCDC implementation uses 64-bit GEAR table entries and a 64-bit hash accumulator, as shown in the code samples that follow. The algorithm works identically at either width -- only the bit count and mask positions change.*

<div class="cdc-viz" id="gear-hash-demo">
  <div class="cdc-viz-header">
    <div class="cdc-viz-title">Gear Hash in Action</div>
  </div>
  <div class="cdc-content">
    <div id="gear-content-display" class="cdc-combined-view">
      The quick brown fox jumps over the lazy dog. She packed her seven boxes and left. A warm breeze drifted through the open window.
    </div>
  </div>

  <!-- Two-column layout: GEAR table on left, Operation + Hash on right -->
  <div class="gear-two-col">
    <div class="gear-col-left">
      <div class="cdc-viz-header" style="border-bottom: none; margin-bottom: 0.5rem; padding-bottom: 0;">
        <div class="cdc-viz-title">GEAR Lookup Table</div>
        <p class="cdc-viz-hint">Each colored block is one of 256 pre-computed random 32-bit values, keyed by byte. Hover a cell to see its mapping.</p>
      </div>
      <div class="gear-table-readout" id="gear-table-readout">GEAR[--] = --</div>
      <div class="gear-table-grid" id="gear-table-grid">
        <!-- axis labels + 256 cells populated by JS -->
      </div>
      <div class="gear-table-legend">Rows 0-1: control bytes &middot; Rows 2-7: printable ASCII &middot; Row 7F: DEL &middot; Rows 8-F: extended bytes</div>
    </div>

    <div class="gear-col-right">
      <div class="cdc-viz-header" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
        <div class="cdc-viz-title">Rolling Hash Window</div>
        <p class="cdc-viz-hint">The hash rolls forward one byte at a time. When it matches a bit pattern, a chunk boundary is placed. Target chunk size: min 8, avg 16, max 32 bytes.</p>
      </div>
      <div class="cdc-hash-display" id="gear-hash-display">Current Hash: <strong>0x00000000</strong></div>
      <div class="gear-hash-window" id="gear-hash-window"></div>
      <div class="gear-shift-viz" id="gear-shift-viz"></div>
    </div>
  </div>

  <!-- Playback Controls -->
  <div class="cdc-playback">
    <button class="cdc-playback-btn" id="gear-play-btn" title="Play / Pause">
      <span class="fa-solid fa-play"></span>
    </button>
    <button class="cdc-playback-btn secondary" id="gear-step-btn" title="Step forward one byte">
      <span class="fa-solid fa-forward-step"></span>
    </button>
    <button class="cdc-playback-btn secondary" id="gear-reset-btn" title="Reset to beginning">
      <span class="fa-solid fa-rotate-left"></span>
    </button>
    <div class="cdc-progress">
      <div class="cdc-progress-bar" id="gear-progress" style="width: 0%"></div>
    </div>
    <div class="cdc-speed-control">
      <span class="cdc-speed-label">Speed</span>
      <input type="range" id="gear-speed" min="1" max="10" value="7" style="width: 80px;" title="Playback speed">
    </div>
  </div>
</div>

The GEAR table maps each of the 256 possible byte values to a pre-computed 64-bit random number:

<div class="code-tabs" id="gear-table-code">
  <div class="code-tab-buttons">
    <button class="code-tab-btn active" data-lang="pseudocode">Pseudocode</button>
    <button class="code-tab-btn" data-lang="rust">Rust</button>
    <button class="code-tab-btn" data-lang="typescript">TypeScript</button>
  </div>

  <div class="code-tab-content active" data-lang="pseudocode">
{% highlight text linenos %}
// GEAR table: 256 random 64-bit values
GEAR[256] = generate_random_table()

function gear_hash(data, start, end):
    hash = 0
    for i from start to end:
        hash = (hash << 1) + GEAR[data[i]]
    return hash
{% endhighlight %}
  </div>

  <div class="code-tab-content" data-lang="rust">
{% highlight rust linenos %}
// From fastcdc-rs v2020
const GEAR: [u64; 256] = [
    0x3b5d3c7d207e37dc, 0x784d68ba91123086,
    0xcd52880f882e7298, 0xecc4917415d5c696,
    // ... 252 more values
];

fn gear_hash(data: &[u8]) -> u64 {
    let mut hash: u64 = 0;
    for &byte in data {
        hash = hash.wrapping_shl(1)
                   .wrapping_add(GEAR[byte as usize]);
    }
    hash
}
{% endhighlight %}
  </div>

  <div class="code-tab-content" data-lang="typescript">
{% highlight typescript linenos %}
// GEAR table (first few values shown)
const GEAR: bigint[] = [
    0x3b5d3c7d207e37dcn, 0x784d68ba91123086n,
    0xcd52880f882e7298n, 0xecc4917415d5c696n,
    // ... 252 more values
];

function gearHash(data: Uint8Array): bigint {
    let hash = 0n;
    for (const byte of data) {
        hash = ((hash << 1n) + GEAR[byte]) & 0xFFFFFFFFFFFFFFFFn;
    }
    return hash;
}
{% endhighlight %}
  </div>
</div>

<style>
.code-tabs {
  margin: 1.5rem 0;
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.code-tab-buttons {
  display: flex;
  background: rgba(61, 58, 54, 0.03);
  border-bottom: 1px solid rgba(61, 58, 54, 0.1);
}

.code-tab-btn {
  padding: 0.6rem 1.25rem;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  color: #8b7355;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.code-tab-btn:hover {
  color: #3d3a36;
  background: rgba(61, 58, 54, 0.05);
}

.code-tab-btn.active {
  color: #c45a3b;
  background: #fff;
  border-bottom: 2px solid #c45a3b;
  margin-bottom: -1px;
}

.code-tab-content {
  display: none;
}

.code-tab-content.active {
  display: block;
}

.code-tab-content pre {
  margin: 0;
  border-radius: 0;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.code-tabs').forEach(container => {
    const buttons = container.querySelectorAll('.code-tab-btn');
    const contents = container.querySelectorAll('.code-tab-content');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;

        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        container.querySelector(`.code-tab-content[data-lang="${lang}"]`).classList.add('active');
      });
    });
  });
});
</script>

The simplicity of this hash is the point. A single left-shift and a single addition per byte gives the GEAR hash its speed advantage over Rabin (which requires polynomial division) and Buzhash (which requires XOR with both the incoming and outgoing byte). But a fast hash is only half the story. The other half is deciding *when* the hash value signals a chunk boundary.

### Finding Chunk Boundaries

With the GEAR hash updating for each byte, how do we decide where to cut?

The classic approach: check if the low N bits of the hash are zero. If we want an average chunk size of 8KB, we check if `hash & 0x1FFF == 0` (the low 13 bits).

Why does this work? The GEAR hash produces pseudo-random values, so the probability that any N bits are all zero is $1/2^N$. For 13 bits, that's $1/2^{13} = 1/8192$, meaning on average, one in every 8,192 bytes triggers a boundary. The mask *is* the chunk size control: more bits mean larger average chunks, fewer bits mean smaller ones.

This is the heart of every BSW algorithm. The algorithm doesn't search for patterns in the content directly. Instead, it feeds each byte through the GEAR table, lets the rolling hash mix the values together, and checks whether certain bits of the result happen to be zero. The content determines the hash, the mask selects which bits to check, and a boundary is placed wherever those bits are all zero.

But basic masking has a problem, and FastCDC does something more clever: **normalized chunking** with dual masks.

The problem with basic masking is chunk sizes follow an exponential distribution. You get many small chunks and occasional very large ones. This hurts deduplication because small chunks increase metadata overhead, and large chunks reduce sharing opportunities.

<div class="cdc-viz">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Chunk Size Distribution: Basic vs Normalized</span>
  </div>
  <div class="dist-illustration">
    <div class="dist-illustration-panel">
      <div class="comparison-label"><span class="comparison-label-text">Basic CDC <span class="comparison-sublabel">(Single Mask)</span></span></div>
      <svg class="dist-illustration-svg" viewBox="0 -8 200 118" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="exp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#c45a3b" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#c45a3b" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <path d="M 0 100 C 5 100, 10 100, 15 98 C 20 90, 22 30, 25 12 C 28 25, 40 50, 60 68 C 80 78, 110 88, 150 94 C 170 96, 190 98, 200 99 L 200 100 Z" fill="url(#exp-fill)" stroke="#c45a3b" stroke-width="1.5" stroke-linejoin="round"/>
        <line x1="100" y1="5" x2="100" y2="100" stroke="#3d3a36" stroke-width="1" stroke-dasharray="4 3" opacity="0.5"/>
        <text x="100" y="2" text-anchor="middle" font-family="'Libre Baskerville', Georgia, serif" font-size="6" fill="#8b7355">target avg</text>
        <text x="100" y="109" text-anchor="middle" font-family="'Libre Baskerville', Georgia, serif" font-size="6" fill="#8b7355">Chunk size &#x2192;</text>
      </svg>
      <div class="dist-illustration-note">Many small chunks, long tail of large ones</div>
    </div>
    <div class="dist-illustration-panel">
      <div class="comparison-label"><span class="comparison-label-text">Normalized CDC <span class="comparison-sublabel">(Dual Mask)</span></span></div>
      <svg class="dist-illustration-svg" viewBox="0 -8 200 118" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="gauss-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#c45a3b" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#c45a3b" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <path d="M 0 100 C 10 100, 25 99, 40 97 C 55 93, 65 80, 75 55 C 85 28, 90 14, 100 10 C 110 14, 115 28, 125 55 C 135 80, 145 93, 160 97 C 175 99, 190 100, 200 100 Z" fill="url(#gauss-fill)" stroke="#c45a3b" stroke-width="1.5" stroke-linejoin="round"/>
        <line x1="100" y1="5" x2="100" y2="100" stroke="#3d3a36" stroke-width="1" stroke-dasharray="4 3" opacity="0.5"/>
        <text x="100" y="2" text-anchor="middle" font-family="'Libre Baskerville', Georgia, serif" font-size="6" fill="#8b7355">target avg</text>
        <text x="100" y="109" text-anchor="middle" font-family="'Libre Baskerville', Georgia, serif" font-size="6" fill="#8b7355">Chunk size &#x2192;</text>
      </svg>
      <div class="dist-illustration-note">Chunks cluster tightly around the target</div>
    </div>
  </div>
</div>

Why exponential? Because the probability of hitting a boundary is the same at every byte position. Each byte has a $1/2^N$ chance of triggering a cut, regardless of how many bytes have already been consumed into the current chunk. Short chunks are always more likely than long ones, for the same reason that flipping heads on the first try is more likely than waiting until the tenth.

The fix is intuitive: vary the probability based on how many bytes have been consumed into the current chunk so far. If only a few bytes have been consumed, make boundaries *harder* to find so you don't produce tiny chunks. Once you've consumed past the target average, make boundaries *easier* to find so chunks don't grow too large.

FastCDC's solution:
1. **Below the average size**: Use a **stricter mask** (more bits must be zero)
2. **Above the average size**: Use a **looser mask** (fewer bits must be zero)

FastCDC was published in two rounds: a 2016 paper that introduced normalized chunking, and a 2020 revision that added a performance optimization by processing two bytes per iteration. Let's walk through both versions to see how the dual-mask idea translates into concrete code, and how the algorithm evolved between the two papers.

### The 2016 Algorithm

This is the version illustrated above: it processes one byte at a time, shifting and adding through the GEAR table exactly as we saw in the *Gear Hash in Action* animation, and switches between the strict and loose mask depending on how far into the current chunk it has consumed. Here's the complete loop:

<div class="code-tabs" id="fastcdc-2016-code">
  <div class="code-tab-buttons">
    <button class="code-tab-btn active" data-lang="pseudocode">Pseudocode</button>
    <button class="code-tab-btn" data-lang="rust">Rust</button>
    <button class="code-tab-btn" data-lang="typescript">TypeScript</button>
  </div>

  <div class="code-tab-content active" data-lang="pseudocode">
{% highlight text linenos %}
function find_chunk_boundary(data, min_size, avg_size, max_size):
    // Skip to minimum size (cut-point skipping)
    position = min_size
    hash = 0

    // Calculate masks based on average size
    bits = log2(avg_size)
    mask_s = MASKS[bits + 1]  // Stricter (1 more bit)
    mask_l = MASKS[bits - 1]  // Looser  (1 fewer bit)

    // Phase 1: Strict mask until average size
    while position < avg_size AND position < data.length:
        hash = (hash << 1) + GEAR[data[position]]
        if (hash & mask_s) == 0:
            return position  // Found boundary!
        position += 1

    // Phase 2: Loose mask until maximum size
    while position < max_size AND position < data.length:
        hash = (hash << 1) + GEAR[data[position]]
        if (hash & mask_l) == 0:
            return position  // Found boundary!
        position += 1

    // Hit maximum size without finding boundary
    return min(max_size, data.length)
{% endhighlight %}
  </div>

  <div class="code-tab-content" data-lang="rust">
{% highlight rust linenos %}
// From fastcdc-rs v2016 module
pub fn cut(
    source: &[u8],
    min_size: usize,
    avg_size: usize,
    max_size: usize,
    mask_s: u64,
    mask_l: u64,
) -> usize {
    let mut remaining = source.len();
    if remaining <= min_size {
        return remaining;
    }

    let mut center = avg_size;
    if remaining > max_size {
        remaining = max_size;
    } else if remaining < center {
        center = remaining;
    }

    let mut index = min_size;
    let mut hash: u64 = 0;

    // Phase 1: strict mask until center (average size)
    while index < center {
        hash = (hash << 1).wrapping_add(GEAR[source[index] as usize]);
        if (hash & mask_s) == 0 {
            return index;
        }
        index += 1;
    }

    // Phase 2: loose mask until max_size
    while index < remaining {
        hash = (hash << 1).wrapping_add(GEAR[source[index] as usize]);
        if (hash & mask_l) == 0 {
            return index;
        }
        index += 1;
    }

    remaining
}
{% endhighlight %}
  </div>

  <div class="code-tab-content" data-lang="typescript">
{% highlight typescript linenos %}
function findChunkBoundary(
    data: Uint8Array,
    minSize: number,
    avgSize: number,
    maxSize: number,
): number {
    if (data.length <= minSize) {
        return data.length;
    }

    const bits = Math.floor(Math.log2(avgSize));
    const maskS = MASKS[bits + 1]; // Stricter
    const maskL = MASKS[bits - 1]; // Looser

    let remaining = Math.min(data.length, maxSize);
    let center = Math.min(avgSize, remaining);
    let index = minSize;
    let hash = 0n;

    // Phase 1: strict mask until center
    while (index < center) {
        hash = ((hash << 1n) + GEAR[data[index]]) & MASK_64;
        if ((hash & maskS) === 0n) {
            return index;
        }
        index++;
    }

    // Phase 2: loose mask until max
    while (index < remaining) {
        hash = ((hash << 1n) + GEAR[data[index]]) & MASK_64;
        if ((hash & maskL) === 0n) {
            return index;
        }
        index++;
    }

    return remaining;
}
{% endhighlight %}
  </div>
</div>

The 2016 algorithm's one-byte sliding window is already fast, but the 2020 revision found a way to cut the number of loop iterations in half.

### The 2020 Enhancement: Rolling Two Bytes

The 2020 paper introduces a simple optimization: **process two adjacent bytes per step** as the sliding window moves across the data. Since two consecutive single-bit shifts are equivalent to one two-bit shift, the hash updates for two adjacent bytes can be collapsed:

Instead of two separate steps:
```
hash = (hash << 1) + GEAR[byte1]     // step 1
hash = (hash << 1) + GEAR[byte2]     // step 2
```

Collapse into one:
```
hash = (hash << 2) + GEAR_LS[byte1]  // Left-shifted GEAR table
hash = hash + GEAR[byte2]            // Regular GEAR table
```

The boundary check still happens after each byte, but each check uses a different mask. After the first byte, the hash bits sit one position higher than they would in the 2016 algorithm, so a left-shifted mask (`mask_s_ls`) is needed to check the equivalent bits. After the second byte, the bits realign with the original positions, so the regular mask (`mask_s`) is used. The results are identical to processing one byte at a time.

Where does the speedup come from? Each time the sliding window advances one step, the CPU must increment the position, evaluate whether the window has reached a size limit, and branch back to process the next position. By processing two bytes per step, this bookkeeping happens half as often. The two single-bit shifts also collapse into one two-bit shift instruction. These savings are small per step, but across millions of bytes they add up.

<div class="code-tabs" id="fastcdc-2020-code">
  <div class="code-tab-buttons">
    <button class="code-tab-btn active" data-lang="pseudocode">Pseudocode</button>
    <button class="code-tab-btn" data-lang="rust">Rust</button>
    <button class="code-tab-btn" data-lang="typescript">TypeScript</button>
  </div>

  <div class="code-tab-content active" data-lang="pseudocode">
{% highlight text linenos %}
// Pre-compute left-shifted GEAR table
GEAR_LS[i] = GEAR[i] << 1  // for all i

function find_chunk_boundary_2020(data, min_size, avg_size, max_size):
    position = min_size / 2  // Start at half (we process 2 bytes/iter)
    hash = 0

    // Phase 1: Strict mask, two bytes at a time
    while position < avg_size / 2:
        byte_pos = position * 2

        // First byte: shift by 2, add left-shifted value
        hash = (hash << 2) + GEAR_LS[data[byte_pos]]
        if (hash & mask_s_ls) == 0:
            return byte_pos

        // Second byte: add regular value
        hash = hash + GEAR[data[byte_pos + 1]]
        if (hash & mask_s) == 0:
            return byte_pos + 1

        position += 1

    // Phase 2: Loose mask (similar structure)
    // ... same pattern with mask_l
{% endhighlight %}
  </div>

  <div class="code-tab-content" data-lang="rust">
{% highlight rust linenos %}
// From fastcdc-rs v2020 module
pub fn cut_gear(
    source: &[u8],
    min_size: usize,
    avg_size: usize,
    max_size: usize,
    mask_s: u64,
    mask_l: u64,
    mask_s_ls: u64,        // Left-shifted strict mask
    mask_l_ls: u64,        // Left-shifted loose mask
    gear: &[u64; 256],
    gear_ls: &[u64; 256],  // Left-shifted GEAR table
) -> (u64, usize) {
    let mut remaining = source.len();
    if remaining <= min_size {
        return (0, remaining);
    }

    let mut center = avg_size;
    if remaining > max_size {
        remaining = max_size;
    } else if remaining < center {
        center = remaining;
    }

    let mut index = min_size / 2;
    let mut hash: u64 = 0;

    // Phase 1: strict mask, two bytes per iteration
    while index < center / 2 {
        let a = index * 2;

        // First byte
        hash = (hash << 2).wrapping_add(gear_ls[source[a] as usize]);
        if (hash & mask_s_ls) == 0 {
            return (hash, a);
        }

        // Second byte
        hash = hash.wrapping_add(gear[source[a + 1] as usize]);
        if (hash & mask_s) == 0 {
            return (hash, a + 1);
        }

        index += 1;
    }

    // Phase 2: loose mask (same pattern)
    while index < remaining / 2 {
        let a = index * 2;
        hash = (hash << 2).wrapping_add(gear_ls[source[a] as usize]);
        if (hash & mask_l_ls) == 0 {
            return (hash, a);
        }
        hash = hash.wrapping_add(gear[source[a + 1] as usize]);
        if (hash & mask_l) == 0 {
            return (hash, a + 1);
        }
        index += 1;
    }

    (hash, remaining)
}
{% endhighlight %}
  </div>

  <div class="code-tab-content" data-lang="typescript">
{% highlight typescript linenos %}
// Pre-computed left-shifted table
const GEAR_LS: bigint[] = GEAR.map(g => (g << 1n) & MASK_64);

function findChunkBoundary2020(
    data: Uint8Array,
    minSize: number,
    avgSize: number,
    maxSize: number,
): number {
    if (data.length <= minSize) {
        return data.length;
    }

    const bits = Math.floor(Math.log2(avgSize));
    const maskS = MASKS[bits + 1];
    const maskL = MASKS[bits - 1];
    const maskSLs = maskS << 1n;  // Left-shifted masks
    const maskLLs = maskL << 1n;

    let remaining = Math.min(data.length, maxSize);
    let center = Math.min(avgSize, remaining);
    let index = Math.floor(minSize / 2);
    let hash = 0n;

    // Phase 1: strict mask, two bytes at a time
    while (index < Math.floor(center / 2)) {
        const a = index * 2;

        // First byte
        hash = ((hash << 2n) + GEAR_LS[data[a]]) & MASK_64;
        if ((hash & maskSLs) === 0n) return a;

        // Second byte
        hash = (hash + GEAR[data[a + 1]]) & MASK_64;
        if ((hash & maskS) === 0n) return a + 1;

        index++;
    }

    // Phase 2: loose mask
    while (index < Math.floor(remaining / 2)) {
        const a = index * 2;
        hash = ((hash << 2n) + GEAR_LS[data[a]]) & MASK_64;
        if ((hash & maskLLs) === 0n) return a;
        hash = (hash + GEAR[data[a + 1]]) & MASK_64;
        if ((hash & maskL) === 0n) return a + 1;
        index++;
    }

    return remaining;
}
{% endhighlight %}
  </div>
</div>

<div class="cdc-callout" data-label="Performance Note">
The 2020 optimization increases chunking throughput by 30-40% over the 2016 version <span class="cdc-cite"><a href="#ref-6">[6]</a></span>. In practice, CDC is rarely the bottleneck in a deduplication pipeline. Reading data from disk and computing cryptographic hashes for each chunk (used to identify duplicates) are typically the slower steps.
</div>

Both versions produce the same chunk boundaries for the same input and parameters. The difference is purely mechanical: the 2020 version reaches those boundaries faster by doing two bytes of work per loop iteration. With the algorithm itself understood, the next question is practical: how do the parameters you choose actually affect the chunks that come out?

### Exploring the Parameters

The target average chunk size is the primary parameter when configuring FastCDC. A smaller average means more chunks (better deduplication granularity but more metadata), while a larger average means fewer chunks (less overhead but coarser deduplication). Drag the slider below to see how FastCDC re-chunks the same text at different target sizes:

<div class="cdc-viz" id="parametric-demo">
  <div class="cdc-viz-header">
    <div class="cdc-viz-title">Parametric Chunking Explorer</div>
    <p class="cdc-viz-hint">See how target average size affects chunk boundaries and size distribution.</p>
  </div>
  <!-- Slider control -->
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Target Average: <strong id="parametric-slider-value">88</strong> bytes
    </span>
    <input type="range" id="parametric-slider" min="48" max="128" value="88" step="2">
    <span class="parametric-derived-params" id="parametric-derived-params">(min: 44, max: 264)</span>
  </div>

  <!-- Text with chunk highlighting -->
  <div id="parametric-text-display" class="cdc-content cdc-text-view"></div>

  <!-- Chunk summary section -->
  <div class="parametric-section-header">
    <div class="parametric-section-title">Chunk Summary</div>
    <div class="parametric-summary">
      <span id="parametric-stat-count">--</span> chunks · target <span id="parametric-stat-target">--</span> · avg <span id="parametric-stat-actual">--</span> · min <span id="parametric-stat-min">--</span> · max <span id="parametric-stat-max">--</span>
    </div>
  </div>
  <div class="comparison-blocks-hint">Each bar is one chunk. Height and width show relative size (dashed line = target).</div>
  <div id="parametric-blocks-bar" class="cdc-blocks-view"></div>
</div>

Notice how the dual-mask strategy keeps chunk sizes clustered around the target average. At small targets (16-32 bytes) you get many chunks, and the distribution chart reveals the normalized shape. At large targets (96-128 bytes) the entire text may collapse into just a few chunks.

To see why normalization matters, consider what a single mask does. Basic CDC checks the same bit pattern from minimum size all the way to maximum size. Each byte after the minimum has an independent 1/avgSize probability of triggering a boundary. Because the algorithm cuts at the *first* match, most chunks end early: the chance of reaching any given byte without a match drops exponentially. This produces a geometric distribution skewed toward small chunks, with a few chunks surviving long enough to reach the maximum size. The FastCDC paper addresses this with normalization levels (NC1 through NC3), which control how aggressively the two masks differ from the base probability. At NC2 (the paper's recommended level), the strict mask is 4x harder to trigger than the single-mask baseline, suppressing early cuts below the target average, while the loose mask is 4x easier, catching chunks shortly after they pass it. The result is a tight cluster around the target rather than a skewed spread.

Compare the two approaches below. Both chunk the same 8 KB of pseudo-random bytes (generated from a fixed seed), using the same Gear hash and the same target parameters. The only difference is how the mask is applied. Random data makes the statistical properties of each algorithm clearly visible because natural language text has too much structure to reveal the distribution shapes at this scale.

The density curve beneath each chunked block view shows the distribution of chunk sizes: the horizontal axis is chunk size in bytes, the vertical axis is how likely a chunk of that size is, and the dashed line marks the target average. A tall, narrow peak means most chunks land near the same size; a long tail trailing to the right means many chunks end up much larger than the target:

<div class="cdc-viz" id="comparison-demo">
  <div class="cdc-viz-header">
    <div class="cdc-viz-title">Basic vs Normalized Chunk Size Distribution</div>
    <p class="cdc-viz-hint">Compare how single-mask and dual-mask strategies distribute chunk sizes across the same data.</p>
  </div>
  <!-- Shared slider -->
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Target Average: <strong id="comparison-slider-value">88</strong> bytes
    </span>
    <input type="range" id="comparison-slider" min="48" max="128" value="88" step="2">
    <span class="parametric-derived-params" id="comparison-derived-params">(min: 44, max: 264)</span>
  </div>

  <!-- Two-column comparison -->
  <div class="comparison-columns">
    <!-- Left: Basic CDC -->
    <div class="comparison-col">
      <div class="comparison-label"><span class="comparison-label-text">Basic CDC <span class="comparison-sublabel">(Single Mask)</span></span>
        <span class="comparison-summary" id="comparison-basic-stats">
          <span id="comparison-basic-stat-count">--</span> chunks · avg <span id="comparison-basic-stat-actual">--</span> · min <span id="comparison-basic-stat-min">--</span> · max <span id="comparison-basic-stat-max">--</span>
        </span>
      </div>
      <div class="comparison-blocks-hint">Each bar is one chunk. Height and width show relative size (dashed line = target).</div>
      <div id="comparison-basic-blocks" class="cdc-blocks-view"></div>
      <div class="comparison-blocks-hint">Density curve: higher peaks mean more chunks of that size. Dashed line marks the target average.</div>
      <div id="comparison-basic-distribution" class="parametric-distribution-chart"></div>
    </div>

    <!-- Right: Normalized CDC -->
    <div class="comparison-col">
      <div class="comparison-label"><span class="comparison-label-text">Normalized CDC <span class="comparison-sublabel">(Dual Mask)</span></span>
        <span class="comparison-summary" id="comparison-normalized-stats">
          <span id="comparison-normalized-stat-count">--</span> chunks · avg <span id="comparison-normalized-stat-actual">--</span> · min <span id="comparison-normalized-stat-min">--</span> · max <span id="comparison-normalized-stat-max">--</span>
        </span>
      </div>
      <div class="comparison-blocks-hint">Each bar is one chunk. Height and width show relative size (dashed line = target).</div>
      <div id="comparison-normalized-blocks" class="cdc-blocks-view"></div>
      <div class="comparison-blocks-hint">Density curve: higher peaks mean more chunks of that size. Dashed line marks the target average.</div>
      <div id="comparison-normalized-distribution" class="parametric-distribution-chart"></div>
    </div>
  </div>
</div>

Basic CDC's single mask produces chunks that follow an exponential distribution: many small chunks and a long tail of large ones. FastCDC's dual-mask normalization clusters chunks tightly around the target average, reducing both extremes. This narrower distribution means less wasted metadata on tiny chunks and fewer oversized chunks that dilute deduplication.

FastCDC gives us a chunking algorithm that is fast, produces well-distributed chunk sizes, and, most importantly, generates stable boundaries that survive local edits. But chunking is only the first stage of a deduplication pipeline. Once data is split into chunks, each chunk needs a cryptographic fingerprint, those fingerprints need to be indexed and looked up efficiently, and duplicate chunks need to be eliminated during storage or transmission. The choices made at each stage (hash function, index structure, storage layout) interact with the chunking layer in ways that matter for real-world performance.

In the next post, [Part 3: Deduplication in Action](/writings/content-defined-chunking-part-3), we'll build on FastCDC to walk through the deduplication pipeline end to end: fingerprinting chunks, detecting duplicates, and examining the cost tradeoffs that shape how these systems perform in practice.

---

### References

<div class="cdc-references">

<div class="bib-entry" id="ref-5">
  <div class="bib-number">[5]</div>
  <div class="bib-citation">W. Xia, H. Jiang, D. Feng, L. Tian, M. Fu &amp; Y. Zhou, "FastCDC: A Fast and Efficient Content-Defined Chunking Approach for Data Deduplication," <em>Proceedings of the USENIX Annual Technical Conference (ATC)</em>, 2016.</div>
  <div class="bib-links">
    <a href="/assets/papers/cdc/fastcdc-2016-xia.pdf" class="bib-link pdf"><i class="fa-solid fa-file-pdf"></i> PDF</a>
    <a href="https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-6">
  <div class="bib-number">[6]</div>
  <div class="bib-citation">W. Xia, Y. Zhou, H. Jiang, D. Feng, Y. Hua, Y. Hu, Q. Liu &amp; Y. Zhang, "The Design of Fast Content-Defined Chunking for Data Deduplication Based Storage Systems," <em>IEEE Transactions on Parallel and Distributed Systems</em>, vol. 31, no. 9, pp. 2017-2031, 2020.</div>
  <div class="bib-links">
    <a href="/assets/papers/cdc/fastcdc-2020-xia.pdf" class="bib-link pdf"><i class="fa-solid fa-file-pdf"></i> PDF</a>
    <a href="https://ieeexplore.ieee.org/document/9055082" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> IEEE Xplore</a>
  </div>
</div>

</div>

---

<div class="cdc-series-nav">
&larr; <a href="/writings/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a> · Continue reading &rarr; <a href="/writings/content-defined-chunking-part-3">Part 3: Deduplication in Action</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
