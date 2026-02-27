---
layout: writing
group: Writings
title: "Deduplication in Action"
subtitle: "Content-Defined Chunking, Part 3"
summary: "See CDC-based deduplication in action, learn where CDC is deployed today, and explore the frontier of structure-aware chunking for source code."
date: 2026-02-16 12:00:00
interactive: true
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
  gap: 0.75rem;
  overflow: visible;
}

.cdc-dedup-chunk {
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  color: #fff;
}

.cdc-dedup-chunk.shared {
  box-shadow: 0 0 0 2px #fff, 0 0 0 5px #3d3a36;
}

.cdc-dedup-chunk-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #3d3a36;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 8px;
  pointer-events: none;
}

/* Versioned Dedup - Editor */
.cdc-dedup-editor { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }

.cdc-dedup-textarea {
  width: 100%; min-height: 120px; padding: 0.75rem;
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
  grid-template-columns: repeat(16, 1fr);
  gap: 1px;
  margin-top: 0.5rem;
}

.gear-table-cell {
  height: 15px;
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
  min-height: 1.4em;
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
  margin-bottom: 0.5rem;
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
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  align-items: flex-start;
}

.gear-col-left {
  flex: 1 1 0;
  min-width: 0;
}

.gear-col-right {
  flex: 1 1 0;
  min-width: 0;
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
    flex-direction: column;
  }

  .gear-table-grid {
    gap: 0px;
  }

  .gear-table-cell {
    border-radius: 0;
    height: 12px;
  }
}

/* ==========================================================================
   Pipeline Diagram
   ========================================================================== */
.cdc-pipe {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 1rem 0;
}

.cdc-pipe-stage {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr) 16rem;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1.1rem 0;
}

.cdc-pipe-label {
  text-align: right;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.75rem;
  color: #3d3a36;
  line-height: 1.3;
}

.cdc-pipe-label-num {
  display: block;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  color: #a89b8c;
  margin-bottom: 0.15rem;
}

.cdc-pipe-label-desc {
  display: block;
  font-size: 0.65rem;
  color: #8b7355;
  font-style: italic;
  margin-top: 0.2rem;
  line-height: 1.4;
}

.cdc-pipe-visual {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  background: rgba(61, 58, 54, 0.025);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  min-height: 2.5rem;
}

.cdc-pipe-visual.cdc-pipe-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  justify-items: center;
}

.cdc-pipe-code {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #5a564f;
  border-left: 2px solid rgba(196, 90, 59, 0.3);
  padding-left: 0.6rem;
  white-space: pre;
}

.cdc-pipe-code .kw { color: #8b5cf6; }
.cdc-pipe-code .fn { color: #c45a3b; }
.cdc-pipe-code .cm { color: #a89b8c; font-style: italic; }
.cdc-pipe-code .str { color: #5a8a5a; }

.cdc-pipe-connector {
  display: flex;
  justify-content: center;
  padding: 0.15rem 0;
}

.cdc-pipe-connector::after {
  content: '';
  display: block;
  width: 2px;
  height: 20px;
  background: rgba(61, 58, 54, 0.2);
  position: relative;
}

.cdc-pipe-connector-arrow {
  display: flex;
  justify-content: center;
}

.cdc-pipe-connector-arrow::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid rgba(61, 58, 54, 0.25);
}

.cdc-pipe-file {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  background: #fff;
  border: 1px solid rgba(61, 58, 54, 0.15);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.7rem;
  color: #3d3a36;
}

.cdc-pipe-file-icon {
  font-size: 0.85rem;
  opacity: 0.6;
}

.cdc-pipe-hash-label {
  display: block;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.55rem;
  color: #8b7355;
  text-align: center;
  margin-top: 0.15rem;
  letter-spacing: -0.02em;
}

.cdc-pipe-chunk-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cdc-pipe-result {
  display: inline-block;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  margin-top: 0.2rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.cdc-pipe-result.exists {
  background: rgba(90, 138, 90, 0.15);
  color: #3d7a3d;
}

.cdc-pipe-result.new {
  background: rgba(196, 90, 59, 0.15);
  color: #a84832;
}

.cdc-pipe-branch {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
}

.cdc-pipe-branch-arm {
  flex: 1;
  max-width: 14rem;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  border: 1px dashed;
  text-align: center;
}

.cdc-pipe-branch-arm .cdc-pipe-branch-title {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.cdc-pipe-branch-arm .cdc-pipe-branch-desc {
  font-size: 0.7rem;
  line-height: 1.4;
  color: #5a564f;
}

.cdc-pipe-branch-arm.exists-arm {
  background: rgba(90, 138, 90, 0.06);
  border-color: rgba(90, 138, 90, 0.3);
}

.cdc-pipe-branch-arm.exists-arm .cdc-pipe-branch-title { color: #3d7a3d; }

.cdc-pipe-branch-arm.new-arm {
  background: rgba(196, 90, 59, 0.06);
  border-color: rgba(196, 90, 59, 0.3);
}

.cdc-pipe-branch-arm.new-arm .cdc-pipe-branch-title { color: #a84832; }

.cdc-pipe-summary {
  text-align: center;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #3d3a36;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(196, 90, 59, 0.06) 0%, rgba(212, 165, 116, 0.1) 100%);
  border-radius: 6px;
  margin-top: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.cdc-pipe-stream-label {
  font-size: 0.65rem;
  color: #8b7355;
  font-style: italic;
}

/* Pipeline responsive: tablet */
@media (max-width: 50em) {
  .cdc-pipe-stage {
    grid-template-columns: 5rem 1fr;
    grid-template-rows: auto auto;
  }
  .cdc-pipe-code {
    grid-column: 1 / -1;
    margin-top: 0.25rem;
  }
}

/* Pipeline responsive: mobile */
@media (max-width: 42em) {
  .cdc-pipe-stage {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .cdc-pipe-label {
    text-align: center;
  }
  .cdc-pipe-code {
    white-space: pre-wrap;
    word-break: break-all;
    grid-column: 1;
  }
  .cdc-pipe-branch {
    flex-direction: column;
    align-items: center;
  }
  .cdc-pipe-branch-arm {
    max-width: 100%;
    width: 100%;
  }
}

/* Cost Tradeoffs Explorer */
.cost-bars-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1.25rem 1rem;
}

.cost-bar-row {
  display: grid;
  grid-template-columns: 7rem 1fr 14rem;
  align-items: center;
  gap: 0.75rem;
}

.cost-bar-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.8rem;
  font-weight: bold;
  color: #3d3a36;
  text-align: right;
}

.cost-bar-track {
  height: 24px;
  background: rgba(61, 58, 54, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.cost-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.2s ease;
}

.cost-fill-cpu,
.cost-fill-memory,
.cost-fill-storage {
  background: linear-gradient(to right, #d4a574, #c45a3b);
}

.cost-fill-network {
  background: linear-gradient(to right, #8ab88a, #5a8a5a);
}

.cost-bar-annotation {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.75rem;
  color: #8b7355;
}

.cost-bars-axis-label {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 0.6rem;
  color: #a89b8c;
  text-align: right;
  padding: 0.25rem 1.25rem 0 0;
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 0.75rem;
}

.cost-bars-axis-label span:first-child {
  /* empty grid cell to align with bar labels */
}

.cost-bars-axis-note {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.7rem;
  color: #8b7355;
  padding: 0.5rem 1.25rem 0;
  line-height: 1.5;
}

@media (max-width: 50em) {
  .cost-bar-row {
    grid-template-columns: 5rem 1fr 10rem;
  }
}

@media (max-width: 42em) {
  .cost-bar-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  .cost-bar-label {
    text-align: left;
  }
  .cost-bar-track {
    height: 20px;
  }
}

/* Cloud Cost Table */
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

/* Footnotes */
.cdc-footnote-marker {
  font-size: 0.75em;
  vertical-align: super;
  line-height: 0;
}
.cdc-footnote-marker a {
  color: #c45a3b;
  text-decoration: none;
  font-weight: 600;
}
.cdc-footnote-marker a:hover {
  text-decoration: underline;
}
.cdc-footnotes {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(61, 58, 54, 0.1);
  font-size: 0.85rem;
  color: #5a5550;
  line-height: 1.7;
}
.cdc-footnotes ol {
  padding-left: 1.5rem;
  margin: 0;
}
.cdc-footnotes li {
  margin-bottom: 0.75rem;
}
.cdc-footnotes .back-ref {
  color: #c45a3b;
  text-decoration: none;
  margin-left: 0.25rem;
}
.cdc-footnotes .back-ref:hover {
  text-decoration: underline;
}

/* Cost dimension tabs */
.cdc-cost-tabs {
  margin: 1.5rem 0;
  border: 1px solid rgba(61, 58, 54, 0.1);
  border-radius: 6px;
  background: #fff;
}

.cdc-tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(61, 58, 54, 0.1);
}

.cdc-tab {
  background: none;
  border: none;
  padding: 0.6rem 1.25rem;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.9rem;
  color: #6b6560;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.cdc-tab:hover {
  color: #3d3a36;
}

.cdc-tab.active {
  color: #3d3a36;
  font-weight: 600;
}

.cdc-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #c45a3b;
}

.cdc-tab-panels {
  padding: 1.25rem 1.5rem;
}

.cdc-tab-panel {
  display: none;
  line-height: 1.6;
}

.cdc-tab-panel.active {
  display: block;
}

.cdc-tab-panel .cdc-cost-summary {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.88rem;
  font-style: italic;
  color: #6b6560;
  margin-top: 0;
  margin-bottom: 1rem;
}

@media (max-width: 42em) {
  .cdc-tab { padding: 0.5rem 0.75rem; font-size: 0.8rem; }
  .cdc-tab-panels { padding: 1rem; }
}
</style>

<div class="cdc-series-nav">
Part 3 of 5 in a series on Content-Defined Chunking. Previous: <a href="/writings/content-defined-chunking-part-2">Part 2: A Deep Dive into FastCDC</a> · Next: <a href="/writings/content-defined-chunking-part-4">Part 4: CDC in the Cloud</a>
</div>

In [Part 1](/writings/content-defined-chunking-part-1), we explored why content-defined chunking exists and surveyed three algorithm families. In [Part 2](/writings/content-defined-chunking-part-2), we took a deep dive into FastCDC's GEAR hash, normalized chunking, and how average byte targets affect chunk distribution. In this post, we bring the pieces together to see deduplication in action, examine where CDC is used in practice today and where it is not, and explore the cost tradeoffs that shape real-world systems.

---

## Deduplication in Action

Imagine you are building a system to store files that change over time. Each new version is mostly the same as the last, with only a small edit here or there. As we saw in <a href="/writings/content-defined-chunking-part-1">Part 1</a>, storing a complete copy of every version wastes storage on identical content. Content-defined chunking offers a way out: split each version into chunks based on content, fingerprint each chunk, and only store chunks you have not seen before. But what does that actually look like in practice? The explorer below runs FastCDC on editable text. A small edit has already been saved to show deduplication at work: most chunks are recognized as duplicates and never stored again. Try making your own edits to see how content-defined boundaries respond.

<div class="cdc-viz">
<div class="cdc-viz-header">
  <span class="cdc-viz-title">Deduplication Explorer</span>
</div>
<p class="cdc-viz-hint">Click "Save Version" after editing to see which chunks are new and which are shared. Hover over chunks to highlight them across views.</p>
<div class="cdc-dedup-viz" id="dedup-demo">
  <!-- Populated dynamically by VersionedDedupDemo -->
</div>
</div>

As the demo shows, even a small edit only produces a handful of new chunks while the rest are shared across versions. But how does this work under the hood?

### The Deduplication Pipeline

Recall the system to store files that change over time, where the goal is to avoid writing identical content twice. Implementations vary widely, but any CDC-based deduplication system needs the same core ingredients: a way to split data into chunks, a way to fingerprint each chunk, and a way to check whether that fingerprint has been seen before. The visualization below walks through these ingredients as a simple linear pipeline, though real systems will likely optimize by reordering, parallelizing, or batching these steps.

<div class="cdc-viz">
<div class="cdc-viz-header">
  <span class="cdc-viz-title">Pipeline</span>
</div>
<div class="cdc-pipe">

  <!-- Stage 01: File Input -->
  <div class="cdc-pipe-stage">
    <div class="cdc-pipe-label">
      <span class="cdc-pipe-label-num">01</span>
      File Input
      <span class="cdc-pipe-label-desc">Read the file as a raw byte stream.</span>
    </div>
    <div class="cdc-pipe-visual">
      <span class="cdc-pipe-file"><span class="cdc-pipe-file-icon">&#128196;</span> document.txt</span>
      <span class="cdc-pipe-stream-label">raw byte stream</span>
    </div>
    <div class="cdc-pipe-code"><span class="kw">let</span> data = <span class="fn">fs::read</span>(<span class="str">"document.txt"</span>);</div>
  </div>

  <div class="cdc-pipe-connector"></div>
  <div class="cdc-pipe-connector-arrow"></div>

  <!-- Stage 02: CDC Chunking -->
  <div class="cdc-pipe-stage">
    <div class="cdc-pipe-label">
      <span class="cdc-pipe-label-num">02</span>
      CDC Chunking
      <span class="cdc-pipe-label-desc">Split the stream into variable-size chunks using content-defined boundaries.</span>
    </div>
    <div class="cdc-pipe-visual cdc-pipe-grid">
      <span class="cdc-chunk chunk-a" style="font-size:0.75rem;">A</span>
      <span class="cdc-chunk chunk-b" style="font-size:0.75rem;">B</span>
      <span class="cdc-chunk chunk-c" style="font-size:0.75rem;">C</span>
      <span class="cdc-chunk chunk-d" style="font-size:0.75rem;">D</span>
      <span class="cdc-chunk chunk-e" style="font-size:0.75rem;">E</span>
      <span class="cdc-chunk chunk-new" style="font-size:0.75rem;">F</span>
    </div>
    <div class="cdc-pipe-code"><span class="kw">let</span> chunks = <span class="fn">FastCDC::new</span>(
  &amp;data, min, avg, max
);</div>
  </div>

  <div class="cdc-pipe-connector"></div>
  <div class="cdc-pipe-connector-arrow"></div>

  <!-- Stage 03: Hash Each Chunk -->
  <div class="cdc-pipe-stage">
    <div class="cdc-pipe-label">
      <span class="cdc-pipe-label-num">03</span>
      Hash Each Chunk
      <span class="cdc-pipe-label-desc">Compute a collision-resistant fingerprint for each chunk.</span>
    </div>
    <div class="cdc-pipe-visual cdc-pipe-grid">
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-a" style="font-size:0.75rem; padding: 0.3rem 0.5rem;">A</span>
        <span class="cdc-pipe-hash-label">7f3a9b2c</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-b" style="font-size:0.75rem; padding: 0.3rem 0.5rem;">B</span>
        <span class="cdc-pipe-hash-label">e2b10f87</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-c" style="font-size:0.75rem; padding: 0.3rem 0.5rem;">C</span>
        <span class="cdc-pipe-hash-label">91cda4e3</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-d" style="font-size:0.75rem; padding: 0.3rem 0.5rem;">D</span>
        <span class="cdc-pipe-hash-label">a4f8c61d</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-e" style="font-size:0.75rem; padding: 0.3rem 0.5rem;">E</span>
        <span class="cdc-pipe-hash-label">c3d752af</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-new" style="font-size:0.75rem; padding: 0.3rem 0.5rem;">F</span>
        <span class="cdc-pipe-hash-label">58eab03e</span>
      </div>
    </div>
    <div class="cdc-pipe-code"><span class="kw">for</span> chunk <span class="kw">in</span> chunks {
  hash = <span class="fn">blake3</span>(chunk.data);
}</div>
  </div>

  <div class="cdc-pipe-connector"></div>
  <div class="cdc-pipe-connector-arrow"></div>

  <!-- Stage 04: Store Lookup -->
  <div class="cdc-pipe-stage">
    <div class="cdc-pipe-label">
      <span class="cdc-pipe-label-num">04</span>
      Store Lookup
      <span class="cdc-pipe-label-desc">Check whether each fingerprint already exists in the chunk store.</span>
    </div>
    <div class="cdc-pipe-visual cdc-pipe-grid">
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-a unchanged" style="font-size:0.75rem;">A</span>
        <span class="cdc-pipe-result exists">exists</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-b" style="font-size:0.75rem;">B</span>
        <span class="cdc-pipe-result new">new!</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-c unchanged" style="font-size:0.75rem;">C</span>
        <span class="cdc-pipe-result exists">exists</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-d unchanged" style="font-size:0.75rem;">D</span>
        <span class="cdc-pipe-result exists">exists</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-e unchanged" style="font-size:0.75rem;">E</span>
        <span class="cdc-pipe-result exists">exists</span>
      </div>
      <div class="cdc-pipe-chunk-col">
        <span class="cdc-chunk chunk-new" style="font-size:0.75rem;">F</span>
        <span class="cdc-pipe-result new">new!</span>
      </div>
    </div>
    <div class="cdc-pipe-code"><span class="kw">let</span> known = <span class="fn">store.contains</span>(hash);</div>
  </div>

  <div class="cdc-pipe-connector"></div>
  <div class="cdc-pipe-connector-arrow"></div>

  <!-- Stage 05: Store Decision -->
  <div class="cdc-pipe-stage">
    <div class="cdc-pipe-label">
      <span class="cdc-pipe-label-num">05</span>
      Store Decision
      <span class="cdc-pipe-label-desc">Write only new chunks; record a reference for duplicates.</span>
    </div>
    <div class="cdc-pipe-visual" style="background: none; padding: 0;">
      <div class="cdc-pipe-branch">
        <div class="cdc-pipe-branch-arm exists-arm">
          <div class="cdc-pipe-branch-title">Hash Exists</div>
          <div class="cdc-pipe-branch-desc">Skip write, record reference</div>
        </div>
        <div class="cdc-pipe-branch-arm new-arm">
          <div class="cdc-pipe-branch-title">Hash New</div>
          <div class="cdc-pipe-branch-desc">Write chunk, register hash</div>
        </div>
      </div>
    </div>
    <div class="cdc-pipe-code"><span class="kw">if</span> known {
  <span class="fn">ref</span>(hash)
} <span class="kw">else</span> {
  <span class="fn">store.put</span>(hash, data)
}</div>
  </div>

</div>
</div>

Walking through the stages: the raw file bytes enter the pipeline and are split into variable-size chunks by the CDC algorithm (here, FastCDC). Each chunk is then fingerprinted with a cryptographic hash like BLAKE3. The system looks up each fingerprint in the chunk store. Chunks that already exist are skipped with only a reference recorded, while genuinely new chunks are written to storage and their fingerprints registered for future lookups. The result is that storing a new version of a file costs only the new chunks, not a full copy.

Each stage in the pipeline maps to just a few lines of code, but together they form a system where redundant data is identified and eliminated before it ever reaches disk or network. When a file changes, only the chunks that were actually modified produce new hashes. The rest match what is already in the store, so they are never written again.

### The Core Cost Tradeoffs

Deduplication is not free. Every stage of the pipeline above consumes resources, and the central engineering challenge is deciding where to spend and where to save.<span class="cdc-cite"><a href="#ref-15">[15]</a></span> The core CDC costs fall into four categories, and they all interact.

<div class="cdc-cost-tabs" id="cost-tabs">
  <div class="cdc-tab-bar" role="tablist">
    <button class="cdc-tab active" role="tab" aria-selected="true" data-tab="cpu">CPU</button>
    <button class="cdc-tab" role="tab" aria-selected="false" data-tab="memory">Memory</button>
    <button class="cdc-tab" role="tab" aria-selected="false" data-tab="network">Network</button>
    <button class="cdc-tab" role="tab" aria-selected="false" data-tab="storage">Storage</button>
  </div>
  <div class="cdc-tab-panels">
  <div class="cdc-tab-panel active" id="tab-cpu" role="tabpanel">
    <p class="cdc-cost-summary"><em>Hashing, compression, and chunking</em></p>
    <p>CPU is the first cost you pay, and it shows up in three places: the rolling hash that finds chunk boundaries, the cryptographic hash that fingerprints each chunk, and the compression that shrinks chunks before storage.</p>
    <p>The rolling hash itself is cheap: as we saw in <a href="/writings/content-defined-chunking-part-2.html">Part 2</a>, Gear hash processes each byte with just a shift and a table lookup. The cryptographic hash that follows is the primary CPU bottleneck. SHA-256 and BLAKE3 must process every byte of every chunk to produce a collision-resistant fingerprint.<span id="fn1-ref" class="cdc-footnote-marker"><a href="#fn1">1</a></span> With fast chunking algorithms like FastCDC, fingerprinting dominates the CPU profile of the pipeline.<span class="cdc-cite"><a href="#ref-17">[17]</a></span> Stronger hashes cost more cycles but reduce the probability of two different chunks sharing the same hash to effectively zero.</p>
    <p>Then there is compression: most production systems (Restic, Borg, and others) compress each chunk before storing it, typically with zstd or LZ4. Compression adds meaningful CPU cost on writes and a smaller cost on reads (decompression), but it can dramatically reduce the bytes that actually hit disk and network.</p>
    <p>All three costs scale linearly with data volume. In practice, BLAKE3 is fast enough that hashing rarely bottlenecks a modern pipeline, and modern compressors like zstd offer tunable speed-vs-ratio tradeoffs, but both represent real work on every byte that enters the system. Systems whose chunks have predictable internal structure can push further: Meta's <a href="https://openzl.org/">OpenZL</a> generates compressors tailored to a specific data format, achieving better compression ratios at higher speeds than general-purpose tools can manage.<span class="cdc-cite"><a href="#ref-22">[22]</a></span></p>
  </div>
  <div class="cdc-tab-panel" id="tab-memory" role="tabpanel">
    <p class="cdc-cost-summary"><em>Chunk index lookups at scale</em></p>
    <p>Memory is where the chunk index lives. The content-addressable store needs a searchable mapping from hash to storage location, and that index must be fast to query because every incoming chunk triggers a lookup. At scale, keeping a full chunk index in RAM becomes impractical, and a disk-based index with one seek per incoming chunk is far too slow.<span class="cdc-cite"><a href="#ref-16">[16]</a></span><span class="cdc-cite"><a href="#ref-18">[18]</a></span></p>
    <p>The primary cost driver is chunk count. The index size scales with the number of unique chunks, not with total data volume, which is good. But smaller average chunk sizes mean more chunks per file, which means a larger index. A system with 4 KB average chunks will produce roughly four times as many index entries as one with 16 KB chunks for the same data.</p>
    <p>Once the index outgrows a single machine, or needs to be shared across a fleet, it becomes a distributed systems problem: you need a persistent, highly available data store (typically a database or distributed key-value system) to hold the mapping and serve lookups at low latency. That infrastructure has its own operational cost, and it scales with chunk count.</p>
  </div>
  <div class="cdc-tab-panel" id="tab-network" role="tabpanel">
    <p class="cdc-cost-summary"><em>Transfer efficiency through deduplication</em></p>
    <p>Network is often where deduplication pays for itself most visibly. In distributed systems (backup to a remote server, syncing across devices), only new chunks need to traverse the wire. The primary cost driver is the dedup ratio: the fraction of chunks that already exist at the destination and never need to be sent.</p>
    <p>The <a href="https://pdos.csail.mit.edu/archive/lbfs/">Low-Bandwidth Network File System</a> (LBFS) demonstrated this early on, achieving over an order of magnitude less bandwidth than traditional network file systems by transmitting only chunks not already present at the receiver.<span class="cdc-cite"><a href="#ref-19">[19]</a></span> If you edit a paragraph in a 10 MB document and the system produces 200 chunks, perhaps only 3 of those are new. That is a transfer of kilobytes instead of megabytes.</p>
    <p>Smaller chunks generally improve this ratio because edits are less likely to span an entire small chunk, but each chunk also carries metadata overhead (its hash, its length, its position in the manifest), so there is a point of diminishing returns.</p>
  </div>
  <div class="cdc-tab-panel" id="tab-storage" role="tabpanel">
    <p class="cdc-cost-summary"><em>Unique chunks plus metadata overhead</em></p>
    <p>Storage (disk or object store) holds the unique chunks plus all the metadata that lets you reconstruct files from them: hashes, chunk-to-file mappings, version manifests. The primary cost driver is the balance between dedup savings and metadata overhead. Smaller chunks improve deduplication (more sharing opportunities), but they also increase the metadata-to-data ratio.<span class="cdc-cite"><a href="#ref-21">[21]</a></span> On cloud object stores, chunk count also drives API operations costs: every PUT and GET is priced per request, so more chunks means more billable operations (Part 4 explores how containers address this).</p>
    <p>At extremely small chunk sizes (say, 256 bytes), the overhead of storing a 32-byte hash and associated bookkeeping for each chunk becomes a significant fraction of the chunk itself.</p>
    <p>Meyer and Bolosky found that for live desktop file systems, where most duplication consists of identical files stored in multiple locations, whole-file deduplication already captures roughly 75% of the savings of fine-grained block-level dedup.<span class="cdc-cite"><a href="#ref-20">[20]</a></span> But that result is workload-dependent. When files churn frequently and edits are localized within larger files (the pattern that dominates backup, sync, and software distribution), whole-file dedup sees zero savings on each modified file while CDC captures nearly everything. The value of sub-file chunking scales with both how much duplicated content exists and how frequently that content changes.</p>
  </div>
  </div>
</div>

<div class="cdc-callout" data-label="The Central Knob">
Average chunk size is the single parameter that ties all four costs together.<span class="cdc-cite"><a href="#ref-15">[15]</a></span><span class="cdc-cite"><a href="#ref-21">[21]</a></span> Turning it down (smaller chunks) improves deduplication ratio and network efficiency but increases CPU work, index memory, and metadata overhead. Turning it up (larger chunks) reduces overhead but sacrifices dedup granularity. The right setting depends on your domain.
</div>

The explorer below visualizes these four dimensions as you move the chunk size slider. Small chunks push CPU, memory, and metadata overhead up while improving deduplication and network efficiency. Large chunks do the reverse. The sweet spot depends on your workload.

<div class="cdc-viz" id="cost-tradeoffs-demo">
  <div class="cdc-viz-header">
    <span class="cdc-viz-title">Cost Tradeoffs Explorer</span>
  </div>
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Average Chunk Size: <strong id="cost-tradeoffs-slider-value">32 KB</strong>
    </span>
    <input type="range" id="cost-tradeoffs-slider" min="0" max="100" value="50" step="1">
    <span class="cdc-viz-hint" style="flex-basis: 100%;">Drag the slider to see how average chunk size affects each cost dimension.</span>
  </div>
  <div class="cost-bars-axis-label">
    <span></span>
    <span>Relative Pressure &rarr;</span>
  </div>
  <div class="cost-bars-container" id="cost-tradeoffs-bars">
  </div>
  <div class="cost-bars-axis-note">
    These bars show the <em>direction</em> and <em>shape</em> of each tradeoff, not exact magnitudes. CPU and memory costs scale with chunk count (more chunks = more hashing, larger index). Network cost decreases with smaller chunks because the higher deduplication ratio means less unique data to transfer. Storage has a U-shape: very small chunks incur metadata overhead, while very large chunks reduce deduplication and store more redundant data.
  </div>
</div>

If you experimented with the [Parametric Chunking Explorer](/writings/content-defined-chunking-part-2#parametric-demo) in Part 2, you saw this tradeoff firsthand: smaller average sizes produced more chunks with tighter size distributions, while larger averages produced fewer, more variable chunks. Those demos showed the statistical effect. In production, the right balance depends on your workload: the volume of duplicated content, the rate at which that content changes, and how each cost dimension (CPU, memory, network, storage) maps onto your constraints. These are the competing forces that determine whether CDC is a valuable strategy for your system, and if so, what average chunk size best balances them. That answer depends on your domain, and only you as the expert in your particular system can make that call. My hope is that the intuitions developed here help you make a more informed decision.

### Where CDC Lives Today

Content-defined chunking has become infrastructure, often invisible but always essential. It shows up across three broad categories: backup and archival, file sync and distribution, and content-addressable storage.

**Backup and archival tools** were the earliest adopters. **[Restic](https://restic.net/)** uses Rabin fingerprints with configurable chunk sizes,<span class="cdc-cite"><a href="#ref-29">[29]</a></span> **[Borg](https://www.borgbackup.org/)** uses Buzhash with a secret seed (preventing attackers from predicting chunk boundaries based on known content),<span class="cdc-cite"><a href="#ref-30">[30]</a></span> and newer tools like **[Kopia](https://kopia.io/)**,<span class="cdc-cite"><a href="#ref-31">[31]</a></span> **[Duplicacy](https://duplicacy.com/)**,<span class="cdc-cite"><a href="#ref-32">[32]</a></span> **[Bupstash](https://bupstash.io/)**,<span class="cdc-cite"><a href="#ref-33">[33]</a></span> and **[Tarsnap](https://www.tarsnap.com/)**<span class="cdc-cite"><a href="#ref-34">[34]</a></span> all rely on CDC to deduplicate across snapshots. The pattern is the same in each: split data into content-defined chunks, fingerprint each chunk, and store only the unique ones.

**File sync and software distribution** use CDC to minimize transfer sizes. **[Riot Games](https://technology.riotgames.com/news/supercharging-data-delivery-new-league-patcher)** rebuilt the League of Legends patcher around FastCDC, replacing an older binary-delta system and achieving a tenfold improvement in patching speeds.<span class="cdc-cite"><a href="#ref-27">[27]</a></span> **[casync](https://github.com/systemd/casync)**, created by Lennart Poettering, applies CDC to OS and container image distribution, chunking across file boundaries so that updates to a filesystem image only transfer the chunks that actually changed.<span class="cdc-cite"><a href="#ref-35">[35]</a></span>

**Content-addressable storage** systems like **[IPFS](https://ipfs.tech/)** use CDC to split files into variable-size blocks before distributing them across a peer-to-peer network.<span class="cdc-cite"><a href="#ref-28">[28]</a></span> Because chunk boundaries are determined by content rather than position, identical regions of different files naturally converge on the same chunks and the same content addresses.

### When CDC Is Not the Right Choice

Not every system chooses CDC, and the cost tradeoffs help explain why. CDC optimizes for one thing above all: stable chunk boundaries across edits. That stability enables fine-grained deduplication, but it comes at a cost, and not every application prioritizes deduplication over other concerns.

Dropbox is the most prominent example. Their architecture uses fixed-size 4 MiB blocks with SHA-256 hashing, and has since the early days of the product.<span class="cdc-cite"><a href="#ref-23">[23]</a></span> Dropbox's primary engineering challenge was not deduplication, it was *transport*: syncing files across hundreds of millions of devices as fast as possible while keeping infrastructure costs predictable.

Fixed-size blocks give Dropbox properties that CDC cannot. Block *N* always starts at offset `N * 4 MiB`, so a client can request any block without first receiving a boundary list. Upload work can be split across threads by byte offset with zero coordination, because boundaries are known before the content is read. The receiver knows when each block ends, enabling Dropbox's streaming sync architecture where downloads begin before the upload finishes, achieving up to 2x improvement on large file sync.<span class="cdc-cite"><a href="#ref-23">[23]</a></span> And because every block is exactly 4 MiB (except the last), memory allocation, I/O scheduling, and storage alignment are all simple to model and predict at scale.

There is also the metadata question. CDC's chunk index must be backed by a persistent, highly available data store once it outgrows a single machine. For Dropbox, serving hundreds of millions of users, the difference between a fixed-size block index and a variable-size CDC chunk index is not just memory; it is the size and complexity of the metadata infrastructure required to support it. Fixed-size blocks produce fewer, more predictable index entries, which simplifies that infrastructure considerably.

The tradeoff is real. The QuickSync study found that a minor edit in Dropbox can generate sync traffic 10x the size of the actual modification, because insertions shift every subsequent block boundary.<span class="cdc-cite"><a href="#ref-25">[25]</a></span> This is precisely the boundary-shift problem that CDC was designed to solve, as we explored in [Part 1](/writings/content-defined-chunking-part-1). But Dropbox chose to absorb that cost and compensate elsewhere: their Broccoli compression encoder achieves ~33% upload bandwidth savings<span class="cdc-cite"><a href="#ref-24">[24]</a></span>, and the streaming sync architecture pipelines work so effectively that the extra bytes matter less than they otherwise would.

In short, Dropbox traded storage efficiency for transport speed and operational simplicity. Fixed-size blocks mean a predictable, easily modeled object count, which is critical when your storage bill depends on API call volume. The ability to parallelize everything without content-dependent coordination was worth more than the deduplication gains CDC would have provided.

**Seafile**, an open-source file sync platform, takes the opposite approach: it uses Rabin fingerprint-based CDC with ~1 MB average chunks to achieve block-level deduplication across file versions and libraries.<span class="cdc-cite"><a href="#ref-26">[26]</a></span> Where Dropbox chose to optimize purely for transport, Seafile shows that CDC-based sync systems can work in practice. [Part 4](/writings/content-defined-chunking-part-4) explores how the container abstraction makes this economically viable.

### Why Cloud Storage is the Cost that Matters

The four dimensions above assume a local or self-managed storage backend where the cost of writing and reading an object is just disk I/O. Most production systems today do not work that way. They store chunks on cloud object storage (S3, GCS, or Azure Blob Storage), and cloud providers turn every one of those engineering costs into a line item on a bill.

Cloud providers charge not just per GB stored but also per API operation. Every PUT and every GET has a price. When each chunk is its own object, the number of API calls scales with the number of chunks, and that operations cost can dominate the bill entirely. The same knob that the explorer above illustrates (smaller chunks improve dedup but increase chunk count) takes on a new, financially painful dimension: more chunks means more API calls means a larger cloud bill, even if the total bytes stored are fewer.

This is the problem that <a href="/writings/content-defined-chunking-part-4">Part 4: CDC in the Cloud</a> tackles head-on. Grouping chunks into larger, fixed-size containers collapses the object count and makes CDC viable on cloud storage. But containers introduce their own challenges: fragmentation, garbage collection complexity, and restore performance degradation. <a href="/writings/content-defined-chunking-part-5">Part 5</a> then takes a deep dive into the full cost picture, exploring how different storage providers, caching layers, and container configurations combine to determine the real monthly bill.
<div class="cdc-footnotes">
<ol>
<li id="fn1">Collision resistance requires that it is computationally infeasible to find two different inputs that produce the same hash. For this guarantee to hold, every bit of the input must influence the output. If the function skipped even a single byte, two inputs differing only in that byte would hash identically, a trivial collision. This is the fundamental difference from rolling hashes used for boundary detection: Gear hash only looks at a sliding window and is not collision-resistant, which is fine for finding chunk boundaries but not for content addressing, where a collision means two different chunks are treated as identical and one gets silently discarded. BLAKE3 is notably faster than SHA-256 here because it uses a Merkle tree structure internally, allowing parts of the input to be hashed in parallel across cores and SIMD lanes, but it still processes every byte. <a href="#fn1-ref" class="back-ref">&#8617;</a></li>
</ol>
</div>

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

<div class="bib-entry" id="ref-17">
  <div class="bib-number">[17]</div>
  <div class="bib-citation">W. Xia, X. Zou, Y. Zhou, H. Jiang, C. Liu, D. Feng, Y. Hua, Y. Hu &amp; Y. Zhang, "The Design of Fast Content-Defined Chunking for Data Deduplication Based Storage Systems," <em>IEEE Transactions on Parallel and Distributed Systems</em>, vol. 31, no. 9, pp. 2017-2031, 2020.</div>
  <div class="bib-links">
    <a href="https://csyhua.github.io/csyhua/hua-tpds2020-dedup.pdf" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> PDF</a>
  </div>
</div>

<div class="bib-entry" id="ref-18">
  <div class="bib-number">[18]</div>
  <div class="bib-citation">M. Lillibridge, K. Eshghi, D. Bhagwat, V. Deolalikar, G. Trezise &amp; P. Camble, "Sparse Indexing: Large Scale, Inline Deduplication Using Sampling and Locality," <em>7th USENIX Conference on File and Storage Technologies (FAST '09)</em>, San Jose, CA, February 2009.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/conference/fast-09/sparse-indexing-large-scale-inline-deduplication-using-sampling-and-locality" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> USENIX</a>
  </div>
</div>

<div class="bib-entry" id="ref-19">
  <div class="bib-number">[19]</div>
  <div class="bib-citation">A. Muthitacharoen, B. Chen &amp; D. Mazi&egrave;res, "A Low-bandwidth Network File System," <em>18th ACM Symposium on Operating Systems Principles (SOSP '01)</em>, Banff, Canada, October 2001.</div>
  <div class="bib-links">
    <a href="https://pdos.csail.mit.edu/papers/lbfs:sosp01/lbfs.pdf" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> PDF</a>
  </div>
</div>

<div class="bib-entry" id="ref-20">
  <div class="bib-number">[20]</div>
  <div class="bib-citation">D. T. Meyer &amp; W. J. Bolosky, "A Study of Practical Deduplication," <em>9th USENIX Conference on File and Storage Technologies (FAST '11)</em>, San Jose, CA, February 2011.</div>
  <div class="bib-links">
    <a href="https://www.usenix.org/legacy/event/fast11/tech/full_papers/Meyer.pdf" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> PDF</a>
  </div>
</div>

<div class="bib-entry" id="ref-21">
  <div class="bib-number">[21]</div>
  <div class="bib-citation">H. Wu, C. Wang, K. Lu, Y. Fu &amp; L. Zhu, "One Size Does Not Fit All: The Case for Chunking Configuration in Backup Deduplication," <em>18th IEEE/ACM International Symposium on Cluster, Cloud and Grid Computing (CCGrid '18)</em>, 2018.</div>
  <div class="bib-links">
    <a href="https://ieeexplore.ieee.org/document/8411025" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> IEEE</a>
  </div>
</div>

<div class="bib-entry" id="ref-22">
  <div class="bib-number">[22]</div>
  <div class="bib-citation">Y. Collet, N. Terrell, W. F. Handte, D. Rozenblit, V. Zhang, K. Zhang, Y. Goldschlag, J. Lee, E. Gorokhovsky, Y. Komornik, D. Riegel, S. Angelov &amp; N. Rotem, "OpenZL: A Graph-Based Model for Compression," <em>arXiv:2510.03203</em>, October 2025.</div>
  <div class="bib-links">
    <a href="https://arxiv.org/abs/2510.03203" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> arXiv</a>
    <a href="https://openzl.org/" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Project</a>
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

<div class="bib-entry" id="ref-27">
  <div class="bib-number">[27]</div>
  <div class="bib-citation">Riot Games Technology, "Supercharging Data Delivery: The New League Patcher," 2019. Describes the move from binary deltas to FastCDC-based content-defined chunking for game updates.</div>
  <div class="bib-links">
    <a href="https://technology.riotgames.com/news/supercharging-data-delivery-new-league-patcher" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Article</a>
  </div>
</div>

<div class="bib-entry" id="ref-28">
  <div class="bib-number">[28]</div>
  <div class="bib-citation">IPFS Documentation, "File Systems: Chunking." Describes IPFS's use of Rabin fingerprinting for content-defined chunking alongside fixed-size splitting.</div>
  <div class="bib-links">
    <a href="https://docs.ipfs.tech/concepts/file-systems/" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Docs</a>
    <a href="https://github.com/ipfs/boxo/tree/main/chunker" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
  </div>
</div>

<div class="bib-entry" id="ref-29">
  <div class="bib-number">[29]</div>
  <div class="bib-citation">A. Neumann, "Restic Foundation - Content Defined Chunking," <em>Restic Blog</em>, September 2015. Describes Restic's use of Rabin fingerprint-based CDC for deduplication.</div>
  <div class="bib-links">
    <a href="https://restic.net/blog/2015-09-12/restic-foundation1-cdc/" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Blog</a>
    <a href="https://github.com/restic/chunker" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
  </div>
</div>

<div class="bib-entry" id="ref-30">
  <div class="bib-number">[30]</div>
  <div class="bib-citation">BorgBackup Contributors, "Internals: Data Structures," <em>BorgBackup Documentation</em>. Describes Borg's Buzhash-based chunker with a keyed seed for chunk boundary detection.</div>
  <div class="bib-links">
    <a href="https://borgbackup.readthedocs.io/en/stable/internals/data-structures.html" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Docs</a>
    <a href="https://github.com/borgbackup/borg" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
  </div>
</div>

<div class="bib-entry" id="ref-31">
  <div class="bib-number">[31]</div>
  <div class="bib-citation">Kopia Contributors, "Architecture," <em>Kopia Documentation</em>. Describes Kopia's rolling-hash file splitting for content-addressable deduplication.</div>
  <div class="bib-links">
    <a href="https://kopia.io/docs/advanced/architecture/" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Docs</a>
    <a href="https://github.com/kopia/kopia" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
  </div>
</div>

<div class="bib-entry" id="ref-32">
  <div class="bib-number">[32]</div>
  <div class="bib-citation">G. Chen, "Variable-size Chunking," <em>Duplicacy Design Document</em>. Describes Duplicacy's variable-size CDC with configurable minimum, average, and maximum chunk sizes.</div>
  <div class="bib-links">
    <a href="https://github.com/gilbertchen/duplicacy/wiki/Chunk-Size" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Wiki</a>
    <a href="https://github.com/gilbertchen/duplicacy" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
  </div>
</div>

<div class="bib-entry" id="ref-33">
  <div class="bib-number">[33]</div>
  <div class="bib-citation">A. Chambers, "Technical Overview," <em>Bupstash Documentation</em>. Describes Bupstash's GearHash-based content-defined chunking for encrypted, deduplicated backups.</div>
  <div class="bib-links">
    <a href="https://github.com/andrewchambers/bupstash/blob/master/doc/technical_overview.md" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Docs</a>
    <a href="https://github.com/andrewchambers/bupstash" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
  </div>
</div>

<div class="bib-entry" id="ref-34">
  <div class="bib-number">[34]</div>
  <div class="bib-citation">C. Percival, "How Tarsnap Deduplication Works," <em>Tarsnap Documentation</em>. Describes Tarsnap's context-dependent variable-size chunking for client-side deduplication.</div>
  <div class="bib-links">
    <a href="https://www.tarsnap.com/deduplication-explanation" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Docs</a>
    <a href="https://www.tarsnap.com/" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> Site</a>
  </div>
</div>

<div class="bib-entry" id="ref-35">
  <div class="bib-number">[35]</div>
  <div class="bib-citation">L. Poettering, "casync: Content-Addressable Data Synchronization Tool," 2017. Uses CDC to split filesystem images into variable-size chunks for efficient OS and container image distribution.</div>
  <div class="bib-links">
    <a href="https://github.com/systemd/casync" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> GitHub</a>
    <a href="https://lwn.net/Articles/726625/" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> LWN</a>
  </div>
</div>

</div>

**Tools & Implementations**
- [fastcdc-rs on GitHub](https://github.com/nlfiedler/fastcdc-rs)

---

*The interactive animations in this post are available for experimentation. Try modifying the input text, adjusting chunk size parameters, and watching how CDC adapts to your changes.*

<div class="cdc-series-nav">
&larr; <a href="/writings/content-defined-chunking-part-2">Part 2: A Deep Dive into FastCDC</a> · Continue reading &rarr; <a href="/writings/content-defined-chunking-part-4">Part 4: CDC in the Cloud</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
