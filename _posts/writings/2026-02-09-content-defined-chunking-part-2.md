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

/* Educational callouts */
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

/* Citations */
.cdc-cite {
  font-size: 0.7em;
  vertical-align: super;
  line-height: 0;
  margin-left: 1px;
}

.cdc-cite a {
  color: #c45a3b;
  text-decoration: none;
  font-weight: 600;
}

.cdc-cite a:hover {
  text-decoration: underline;
}

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

.cdc-references .bib-link.pdf {
  background: rgba(196, 90, 59, 0.1);
  color: #c45a3b;
}

.cdc-references .bib-link.pdf:hover {
  background: rgba(196, 90, 59, 0.2);
}

.cdc-references .bib-link.external {
  background: rgba(61, 58, 54, 0.06);
  color: #5a5550;
}

.cdc-references .bib-link.external:hover {
  background: rgba(61, 58, 54, 0.12);
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

/* Hint text for viz sections */
.cdc-viz-hint {
  width: 100%;
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.75rem;
  color: #8b7355;
  margin: 0.25rem 0 0 0;
  line-height: 1.4;
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

/* Parametric slider control layout */
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

.parametric-control-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  color: #3d3a36;
  white-space: nowrap;
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
Part 2 of 3 in a series on Content-Defined Chunking. Previous: <a href="/writings/2026/02/02/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a> · Next: <a href="/writings/2026/02/16/content-defined-chunking-part-3">Part 3: Deduplication in Action</a>
</div>

In [Part 1](/writings/2026/02/02/content-defined-chunking-part-1), we saw why fixed-size chunking fails for deduplication and how content-defined chunking solves the problem by letting the data itself determine chunk boundaries. We also surveyed three algorithm families (Basic Sliding Window, Local Extrema, and Statistical) and compared their tradeoffs. In this post, we take a closer look at one BSW implementation, FastCDC, exploring its GEAR hash, boundary detection strategy, and tunable parameters through interactive demos.

---

## A Closer Look at BSW via FastCDC

FastCDC belongs to the **Basic Sliding Window** family, but it represents the modern state of the art within that lineage. Where Rabin used polynomial arithmetic and Buzhash used cyclic shifts, FastCDC's Gear hash strips the rolling hash down to its simplest possible form. Let's explore both the 2016<span class="cdc-cite"><a href="#ref-5">[5]</a></span> and 2020<span class="cdc-cite"><a href="#ref-6">[6]</a></span> versions in detail through the lens of the excellent `fastcdc-rs` Rust crate.

### The GEAR Hash

At FastCDC's core is the **Gear hash**, a remarkably simple rolling hash. For each byte, you:
1. Left-shift the current hash
2. Add a pre-computed random value for that byte

That's it. No XOR with outgoing bytes, no polynomial division. Just shift and add.

<div class="cdc-viz" id="gear-hash-demo">
  <div class="cdc-content">
    <div id="gear-content-display" class="cdc-combined-view">
      The quick brown fox jumps over the lazy dog.
    </div>
  </div>

  <!-- Two-column layout: GEAR table on left, Operation + Hash on right -->
  <div class="gear-two-col">
    <div class="gear-col-left">
      <div class="cdc-viz-header" style="border-bottom: none; margin-bottom: 0.5rem; padding-bottom: 0;">
        <div class="cdc-viz-title">GEAR Lookup Table</div>
        <p class="cdc-viz-hint">Each byte maps to a random 32-bit value. Hover a cell to see its mapping.</p>
      </div>
      <div class="gear-table-readout" id="gear-table-readout">GEAR[--] = --</div>
      <div class="gear-table-grid" id="gear-table-grid">
        <!-- 256 cells populated by JS -->
      </div>
    </div>

    <div class="gear-col-right">
      <div class="cdc-viz-header" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
        <div class="cdc-viz-title">Rolling Hash Window</div>
        <p class="cdc-viz-hint">The hash rolls forward one byte at a time. When it matches a bit pattern, a chunk boundary is placed.</p>
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
      <input type="range" id="gear-speed" min="1" max="10" value="2" style="width: 80px;" title="Playback speed">
    </div>
  </div>
</div>

The GEAR table is 256 pre-computed 64-bit random values, one for each possible byte value. Here's how it looks:

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
</script>

### Finding Chunk Boundaries

With the GEAR hash updating for each byte, how do we decide where to cut?

The classic approach: check if the low N bits of the hash are zero. If we want an average chunk size of 8KB, we check if `hash & 0x1FFF == 0` (the low 13 bits).

Why does this work? The GEAR hash produces pseudo-random values, so the probability that any N bits are all zero is $1/2^N$. For 13 bits, that's $1/2^{13} = 1/8192$, meaning on average, one in every 8,192 bytes triggers a boundary. The mask *is* the chunk size control: more bits means larger average chunks, fewer bits means smaller ones.

This is the heart of FastCDC. The algorithm doesn't search for patterns in the content directly. Instead, it feeds each byte through the GEAR table, lets the rolling hash mix the values together, and checks whether the result happens to land on a specific bit pattern. The content determines the hash, the hash determines the boundary, and the mask determines how often boundaries occur.

But basic masking has a problem, and FastCDC does something cleverer: **normalized chunking** with dual masks.

<!-- TODO: Animation 3 - Chunk boundary detection -->

The problem with basic masking: chunk sizes follow an exponential distribution. You get many small chunks and occasional very large ones. This hurts deduplication because small chunks waste metadata overhead, and large chunks reduce sharing opportunities.

FastCDC's solution:
1. **Near the average size**: Use a **stricter mask** (more bits must be zero)
2. **Approaching maximum size**: Use a **looser mask** (fewer bits must be zero)

This "squeezes" chunks toward the average size:

{% highlight text %}
Chunk size distribution:

Basic CDC:      [exponential - many small, few large]
                ████████████████████
                ████████████
                ████████
                ███
                ██
                █

Normalized CDC: [gaussian-like - clustered around average]
                    █████
                  █████████
                ██████████████
                ████████████████
                ██████████████
                  █████████
                    █████
{% endhighlight %}

### The 2016 Algorithm

Here's the core chunking loop from FastCDC 2016:

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

### The 2020 Enhancement: Rolling Two Bytes

The 2020 paper's key insight: **process two bytes per loop iteration**.

Instead of:
```
hash = (hash << 1) + GEAR[byte]
```

Do:
```
hash = (hash << 2) + GEAR_LS[byte1]  // Left-shifted GEAR table
hash = hash + GEAR[byte2]            // Regular GEAR table
```

This reduces loop iterations by 50%, and the CPU branch predictor loves the more regular access pattern.

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
The 2020 optimization achieves 4.4 GB/s throughput on modern CPUs, fast enough that CDC is rarely the bottleneck in a deduplication pipeline. I/O and cryptographic hashing (for chunk fingerprinting) typically dominate.
</div>

### Exploring the Parameters

The target average chunk size is the primary knob you turn when configuring FastCDC. A smaller average means more chunks (better deduplication granularity but more metadata), while a larger average means fewer chunks (less overhead but coarser deduplication). Drag the slider below to see how FastCDC re-chunks the same text at different target sizes:

<div class="cdc-viz" id="parametric-demo">
  <!-- Slider control -->
  <div class="parametric-control-row">
    <span class="parametric-control-label">
      Target Average: <strong id="parametric-slider-value">32</strong> bytes
    </span>
    <input type="range" id="parametric-slider" min="16" max="128" value="32" step="2">
    <span class="parametric-derived-params" id="parametric-derived-params">(min: 16, max: 96)</span>
  </div>

  <!-- Text with chunk highlighting -->
  <div id="parametric-text-display" class="cdc-content cdc-text-view"></div>

  <!-- Proportional blocks bar -->
  <div id="parametric-blocks-bar" class="cdc-blocks-view"></div>

  <!-- Vertical bar distribution chart -->
  <div class="cdc-viz-header" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
    <div class="cdc-viz-title">Chunk Size Distribution</div>
    <p class="cdc-viz-hint">Each bar is one chunk. Height shows relative size. Dashed line marks the target average.</p>
  </div>
  <div id="parametric-distribution" class="parametric-distribution-chart"></div>

  <!-- Stats -->
  <div id="parametric-stats" class="cdc-stats">
    <div class="cdc-stat">
      <div id="parametric-stat-count" class="cdc-stat-value">--</div>
      <div class="cdc-stat-label">Chunks</div>
    </div>
    <div class="cdc-stat">
      <div id="parametric-stat-target" class="cdc-stat-value">--</div>
      <div class="cdc-stat-label">Target Avg</div>
    </div>
    <div class="cdc-stat">
      <div id="parametric-stat-actual" class="cdc-stat-value">--</div>
      <div class="cdc-stat-label">Actual Avg</div>
    </div>
    <div class="cdc-stat">
      <div id="parametric-stat-min" class="cdc-stat-value">--</div>
      <div class="cdc-stat-label">Smallest</div>
    </div>
    <div class="cdc-stat">
      <div id="parametric-stat-max" class="cdc-stat-value">--</div>
      <div class="cdc-stat-label">Largest</div>
    </div>
  </div>
</div>

Notice how the dual-mask strategy keeps chunk sizes clustered around the target average. At small targets (16-32 bytes) you get many chunks, and the distribution chart reveals the normalized shape. At large targets (96-128 bytes) the entire text may collapse into just a few chunks.

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
&larr; <a href="/writings/2026/02/02/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a> · Continue reading &rarr; <a href="/writings/2026/02/16/content-defined-chunking-part-3">Part 3: Deduplication in Action</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
