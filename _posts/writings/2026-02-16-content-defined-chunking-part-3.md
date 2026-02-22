---
layout: writing
group: Writings
title: "Content-Defined Chunking, Part 3: Deduplication in Action"
summary: "See CDC-based deduplication in action with an interactive demo, learn where CDC is deployed today, and explore the frontier of structure-aware chunking for source code."
date: 2026-02-16 12:00:00
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
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
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

<div class="cdc-series-nav">
Part 3 of 3 in a series on Content-Defined Chunking. Previous: <a href="/writings/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a> · <a href="/writings/content-defined-chunking-part-2">Part 2: A Deep Dive into FastCDC</a>
</div>

In [Part 1](/writings/content-defined-chunking-part-1), we explored why content-defined chunking exists and surveyed three algorithm families. In [Part 2](/writings/content-defined-chunking-part-2), we took a deep dive into FastCDC's GEAR hash, normalized chunking, and how average byte targets affect chunk distribution. In this final post, we bring the pieces together to see deduplication in action, examine where CDC is used in practice today, and look at what lies beyond traditional chunking.

---

## Deduplication in Action

Imagine you are storing files that change over time. Each new version is mostly the same as the last, with only a small edit here or there. The naive approach (storing a complete copy of every version) wastes storage on identical content. The key cost metrics are straightforward: how much total storage do we consume, and how many chunks can we avoid writing because they already exist?

<div class="cdc-viz">
<div class="cdc-viz-header">
  <span class="cdc-viz-title">Deduplication Across Two Versions</span>
</div>
<div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; align-items: center; font-size: 0.9rem;">
  <strong style="font-family: 'SF Mono', monospace; font-size: 0.8rem; color: #8b7355;">v1</strong>
  <div>
    <span class="cdc-chunk chunk-a" style="margin-right: 0.25rem;">A</span>
    <span class="cdc-chunk chunk-b" style="margin-right: 0.25rem;">B</span>
    <span class="cdc-chunk chunk-c" style="margin-right: 0.25rem;">C</span>
    <span class="cdc-chunk chunk-d" style="margin-right: 0.25rem;">D</span>
    <span class="cdc-chunk chunk-e">E</span>
  </div>
  <strong style="font-family: 'SF Mono', monospace; font-size: 0.8rem; color: #8b7355;">v2</strong>
  <div>
    <span class="cdc-chunk chunk-a unchanged" style="margin-right: 0.25rem;">A</span>
    <span class="cdc-chunk chunk-b unchanged" style="margin-right: 0.25rem;">B</span>
    <span class="cdc-chunk chunk-new" style="margin-right: 0.25rem;">X</span>
    <span class="cdc-chunk chunk-d unchanged" style="margin-right: 0.25rem;">D</span>
    <span class="cdc-chunk chunk-e unchanged">E</span>
  </div>
  <strong style="font-family: 'SF Mono', monospace; font-size: 0.8rem; color: #8b7355;">store</strong>
  <div>
    <span class="cdc-chunk chunk-a" style="margin-right: 0.25rem;">A</span>
    <span class="cdc-chunk chunk-b" style="margin-right: 0.25rem;">B</span>
    <span class="cdc-chunk chunk-c" style="margin-right: 0.25rem;">C</span>
    <span class="cdc-chunk chunk-d" style="margin-right: 0.25rem;">D</span>
    <span class="cdc-chunk chunk-e" style="margin-right: 0.25rem;">E</span>
    <span class="cdc-chunk chunk-new">X</span>
  </div>
</div>
<p style="font-size: 0.8rem; color: #8b7355; margin: 0.75rem 0 0 0; line-height: 1.5;">Chunk C was modified, producing new chunk X. Chunks A, B, D, and E are unchanged and already exist in the store. Total storage: 6 unique chunks instead of 10.</p>
</div>

Let's examine how FastCDC's content-defined boundaries help reduce these costs in practice. In the demo below, you can edit the text, save new versions, and watch how CDC identifies which chunks are reused and which are new.

<div class="cdc-viz">
<div class="cdc-viz-header">
  <span class="cdc-viz-title">Deduplication Explorer</span>
</div>
<p class="cdc-viz-hint">A small edit has already been saved as v1 to show deduplication in action. Try making your own edits and clicking "Save Version" to see how CDC identifies reused chunks across versions. Hover over chunks to highlight them across views.</p>
<div class="cdc-dedup-viz" id="dedup-demo">
  <!-- Populated dynamically by VersionedDedupDemo -->
</div>
</div>

As the demo shows, even a small edit only produces a handful of new chunks while the rest are shared across versions. But how does this work under the hood? Let's walk through the full pipeline that makes this possible.

### The Deduplication Pipeline

The pipeline starts by running the data through a CDC algorithm like FastCDC to produce variable-size chunks. Each chunk is then hashed with a cryptographic hash function (SHA-256, BLAKE3, or similar) to produce a unique fingerprint. That fingerprint becomes the chunk's address in a content-addressable store, a key-value system where the hash itself serves as the key. Before writing a chunk, we check whether its hash already exists in the store. If it does, we skip the write and simply record a reference to the existing chunk. If it doesn't, we write the chunk and register its hash.

The result is that only genuinely new content costs storage.

### Why CDC Beats Fixed Chunking

| Scenario | Fixed Chunking | CDC |
|----------|---------------|-----|
| 1 byte inserted at start | 0% dedup | ~95%+ dedup |
| Middle section modified | ~50% dedup | ~90%+ dedup |
| End section appended | 0% dedup (shifts all) | ~95%+ dedup |

---

## Conclusion

Content-Defined Chunking is one of those algorithms that seems almost too simple to work: slide a window, compute a hash, check some bits. Yet this simplicity belies remarkable power:

- **Locality**: Boundaries depend only on nearby content
- **Determinism**: Same content always produces same boundaries
- **Efficiency**: Modern implementations process gigabytes per second

### Where CDC Lives Today

Content-defined chunking has become infrastructure, often invisible but always essential.

**Restic** uses Rabin fingerprints with ~1MB average chunks:
```bash
$ restic backup ~/Documents
# Only changed chunks are uploaded to the repository
```

**Borg** uses Buzhash with a secret seed (preventing attackers from guessing chunk boundaries based on known content):
```bash
$ borg create ::backup-{now} ~/Documents
# Chunks are deduplicated across all archives
```

**Dropbox** pioneered using CDC for efficient file sync. When you modify a document, only changed chunks traverse the network.

While Git doesn't use traditional CDC (it stores complete object snapshots), the principle of content-addressable storage is the same. Modern systems like **Perkeep** (née Camlistore) use CDC for its content layer.

### Beyond Deduplication: Structure-Aware Chunking

The core insight behind CDC (that boundaries should be determined by content, not arbitrary positions) is finding new applications beyond storage deduplication. In retrieval-augmented code generation (RAG), **cAST**, which performs chunking via Abstract Syntax Trees (Zhang et al., 2025)<span class="cdc-cite"><a href="#ref-14">[14]</a></span>, applies this principle to source code: instead of splitting files at fixed line counts, it parses code into an Abstract Syntax Tree and recursively splits large AST nodes while merging small siblings, producing chunks that respect function, class, and module boundaries. The result is semantically coherent code fragments that improve both retrieval precision and downstream generation quality across diverse programming languages and tasks.

This represents a broader trend: wherever data has inherent structure, whether byte-level patterns in binary files or syntactic structure in source code, content-aware chunking consistently outperforms naive fixed-size approaches.

For Rust developers, the `fastcdc` crate provides production-ready implementations:

{% highlight rust linenos %}
use fastcdc::v2020::FastCDC;

let data = std::fs::read("large_file.bin")?;
let chunker = FastCDC::new(&data, 8192, 16384, 65535);

for chunk in chunker {
    println!("Chunk: {} bytes at offset {}",
             chunk.length, chunk.offset);
    // Hash the chunk, store it, etc.
}
{% endhighlight %}

### Why I Care About This

This post grew out of my master's thesis research, where I'm evaluating structure-aware chunking as a deduplication strategy for source code files on large version control platforms. The question driving the work: can syntax-aware chunk boundaries, aligned to functions, classes, and modules via AST parsing, outperform byte-level CDC for deduplicating code across versions?

I'm comparing three approaches along a granularity spectrum: **whole-file content-addressable storage** (the approach Git uses today), **FastCDC** (byte-level content-defined chunking), and **cAST-style structural chunking** (AST-aware boundaries). Each makes a different tradeoff between deduplication ratio, metadata overhead, and language independence. The results should help answer whether the added cost of parsing source code into an AST pays for itself in storage savings compared to language-agnostic byte-level chunking, or whether whole-file storage with delta compression remains the pragmatic choice.

### Key Takeaways

1. **Fixed-size chunking fails** because insertions shift all boundaries
2. **CDC uses content** to determine boundaries, making them stable
3. **Three families** of CDC algorithms exist: BSW (hash-based), Local Extrema (comparison-based), and Statistical (frequency-based)
4. **Rolling hashes** (Rabin, Buzhash, Gear) power the BSW family
5. **Normalized chunking** (dual masks) produces better chunk size distributions
6. **Hardware acceleration** (SIMD) promises dramatic speedups, especially for hashless algorithms
7. **The field is still evolving**, from Rabin's 1981 fingerprinting to VectorCDC's 2025 SIMD acceleration

### References

<div class="cdc-references">

<div class="bib-entry" id="ref-14">
  <div class="bib-number">[14]</div>
  <div class="bib-citation">Y. Zhang, X. Zhao, Z. Z. Wang, C. Yang, J. Wei &amp; T. Wu, "cAST: Enhancing Code Retrieval-Augmented Generation with Structural Chunking via Abstract Syntax Tree," <em>arXiv:2506.15655</em>, 2025.</div>
  <div class="bib-links">
    <a href="https://arxiv.org/abs/2506.15655" class="bib-link external"><i class="fa-solid fa-arrow-up-right-from-square"></i> arXiv</a>
  </div>
</div>

</div>

**Tools & Implementations**
- [fastcdc-rs on GitHub](https://github.com/nlfiedler/fastcdc-rs)
- [Restic Foundation: CDC](https://restic.net/blog/2015-09-12/restic-foundation1-cdc/)
- [Borg Internals](https://borgbackup.readthedocs.io/en/1.0-maint/internals.html)

---

*The interactive animations in this post are available for experimentation. Try modifying the input text, adjusting chunk size parameters, and watching how CDC adapts to your changes.*

<div class="cdc-series-nav">
&larr; <a href="/writings/content-defined-chunking-part-2">Part 2: A Deep Dive into FastCDC</a> · Back to <a href="/writings/content-defined-chunking-part-1">Part 1: From Problem to Taxonomy</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
