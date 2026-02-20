---
layout: writing
group: Writings
title: "Content-Defined Chunking, Part 1: From Problem to Taxonomy"
summary: "An interactive introduction to content-defined chunking: why fixed-size splitting fails, how content-aware boundaries solve the deduplication problem, and a taxonomy of three CDC algorithm families."
date: 2026-02-02 12:00:00
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

/* Chunk spans with box styling — matches CHUNK_SOLID_COLORS from cdc-animations.js */
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

/* New chunk — terracotta accent to match interactive demos */
.cdc-chunk.chunk-new {
  background: rgba(196, 90, 59, 0.2);
  border-color: #c45a3b;
  border-style: solid;
}

/* Unchanged chunk — muted gray, matches shared/dedup style in animations */
.cdc-chunk.unchanged {
  background: rgba(61, 58, 54, 0.06);
  border-color: rgba(61, 58, 54, 0.2);
  color: #8b8178;
}

/* Changed chunk — dashed border to signal the chunk content shifted */
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

/* Versioned Dedup — Editor */
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

/* Versioned Dedup — Timeline */
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

.cdc-references ol {
  padding-left: 1.5rem;
  margin: 0.75rem 0 0 0;
}

.cdc-references li {
  font-size: 0.82rem;
  line-height: 1.6;
  color: #5a564f;
  margin-bottom: 0.4rem;
}

.cdc-references li a {
  color: #c45a3b;
  text-decoration: none;
}

.cdc-references li a:hover {
  text-decoration: underline;
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

/* Parametric Chunking Explorer — distribution chart */
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

/* ── Algorithmic Timeline ──────────────────────── */
.cdc-timeline {
  --line-x: 20px;
  --line-color: rgba(61, 58, 54, 0.25);
  --dot-size: 14px;
  position: relative;
  padding: 1rem 0 1rem 0;
  margin-left: 0.5rem;
}

/* Continuous vertical line */
.cdc-timeline::before {
  content: '';
  position: absolute;
  left: var(--line-x);
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--line-color);
}

/* ── Year markers ─────────────────────────────── */
.cdc-tl-marker {
  position: relative;
  padding: 0.6rem 0 0.6rem calc(var(--line-x) + 20px);
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a89b8c;
  letter-spacing: 0.03em;
}
/* Tick mark on the line */
.cdc-tl-marker::before {
  content: '';
  position: absolute;
  left: calc(var(--line-x) - 4px);
  top: 50%;
  width: 10px;
  height: 2px;
  background: var(--line-color);
  transform: translateY(-50%);
}

/* ── Entry (dot + card) ───────────────────────── */
.cdc-tl-entry {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 0;
  padding-left: calc(var(--line-x) + 20px);
}

/* Dot */
.cdc-tl-dot {
  position: absolute;
  left: var(--line-x);
  top: 1rem;
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 2;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px var(--line-color);
  flex-shrink: 0;
}
.cdc-tl-dot.bsw { background: #c45a3b; }
.cdc-tl-dot.extrema { background: #2a7d4f; }
.cdc-tl-dot.statistical { background: #8b7355; }

/* Card */
.cdc-tl-card {
  background: rgba(61, 58, 54, 0.03);
  border: 1px solid rgba(61, 58, 54, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.cdc-tl-card .cdc-tax-family-label {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  display: inline-block;
  margin-bottom: 0.25rem;
}

.cdc-tl-year {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #a89b8c;
  margin-bottom: 0.1rem;
}

.cdc-tl-name {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 1.15em;
  font-weight: 700;
  color: #3d3a36;
  margin-bottom: 0.3rem;
  line-height: 1.3;
}

.cdc-tl-desc {
  font-size: inherit;
  color: #5a5550;
  line-height: 1.7em;
}

.cdc-tl-perf {
  font-size: 0.9em;
  color: #8b7355;
  line-height: 1.6;
  margin-top: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: rgba(139, 115, 85, 0.06);
  border-radius: 4px;
  border-left: 2px solid rgba(139, 115, 85, 0.25);
}
.cdc-tl-perf > div + div {
  margin-top: 0.2rem;
}

.cdc-tl-card .highlight {
  margin: 0.5rem 0 0 0;
  border-radius: 5px;
  border: 1px solid rgba(61, 58, 54, 0.08);
  overflow-x: auto;
}
.cdc-tl-card .highlight pre {
  line-height: 1.5;
  margin: 0;
}
</style>

<!-- MathJax for rendering mathematical notation -->
<script>
MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>

<div class="cdc-series-nav">
Part 1 of 3 in a series on Content-Defined Chunking. Next: <a href="/writings/2026/02/09/content-defined-chunking-part-2">Part 2: A Deep Dive into FastCDC</a>
</div>

Content-Defined Chunking (CDC) is a family of algorithms that split data into variable-sized chunks based on content rather than position, enabling efficient deduplication even when files are edited. Through interactive visualizations and sample code, this post aims to illustrate the core insight that chunk boundaries should be determined by content, not arbitrary byte offsets. It compares the three main CDC algorithm families, examining their strengths, weaknesses, and tradeoffs so that if you are choosing a CDC algorithm for deduplication, you have a good sense of which family is the best fit for your domain and use case.

<div class="cdc-toc">
  <strong>Contents</strong>
  <ol>
    <li>
      <a href="#motivating-the-problem">Motivating the Problem</a>
      <ul>
        <li><a href="#why-not-just-use-fixed-size-chunks">Why Not Just Use Fixed-Size Chunks?</a></li>
        <li><a href="#the-core-idea-content-as-the-arbiter">The Core Idea: Content as the Arbiter</a></li>
      </ul>
    </li>
    <li>
      <a href="#three-families-of-cdc">Three Families of CDC</a>
      <ul>
        <li><a href="#origins">Origins</a></li>
        <li><a href="#a-taxonomy-of-cdc-algorithms">A Taxonomy of CDC Algorithms</a></li>
        <li><a href="#algorithmic-timeline">Algorithmic Timeline</a></li>
        <li><a href="#comparing-the-families">Comparing the Families</a></li>
      </ul>
    </li>
    <li>
      <a href="/writings/2026/02/09/content-defined-chunking-part-2#a-closer-look-at-bsw-via-fastcdc">A Closer Look at BSW via FastCDC</a> <em style="font-size: 0.78rem; color: #a89b8c;">(Part 2)</em>
      <ul>
        <li><a href="/writings/2026/02/09/content-defined-chunking-part-2#the-gear-hash">The GEAR Hash</a></li>
        <li><a href="/writings/2026/02/09/content-defined-chunking-part-2#finding-chunk-boundaries">Finding Chunk Boundaries</a></li>
        <li><a href="/writings/2026/02/09/content-defined-chunking-part-2#the-2016-algorithm">The 2016 Algorithm</a></li>
        <li><a href="/writings/2026/02/09/content-defined-chunking-part-2#the-2020-enhancement-rolling-two-bytes">The 2020 Enhancement: Rolling Two Bytes</a></li>
        <li><a href="/writings/2026/02/09/content-defined-chunking-part-2#exploring-the-parameters">Exploring the Parameters</a></li>
      </ul>
    </li>
    <li>
      <a href="/writings/2026/02/16/content-defined-chunking-part-3#deduplication-in-action">Deduplication in Action</a> <em style="font-size: 0.78rem; color: #a89b8c;">(Part 3)</em>
      <ul>
        <li><a href="/writings/2026/02/16/content-defined-chunking-part-3#the-deduplication-pipeline">The Deduplication Pipeline</a></li>
        <li><a href="/writings/2026/02/16/content-defined-chunking-part-3#why-cdc-beats-fixed-chunking">Why CDC Beats Fixed Chunking</a></li>
      </ul>
    </li>
    <li>
      <a href="/writings/2026/02/16/content-defined-chunking-part-3#conclusion">Conclusion</a> <em style="font-size: 0.78rem; color: #a89b8c;">(Part 3)</em>
      <ul>
        <li><a href="/writings/2026/02/16/content-defined-chunking-part-3#where-cdc-lives-today">Where CDC Lives Today</a></li>
        <li><a href="/writings/2026/02/16/content-defined-chunking-part-3#beyond-deduplication-structure-aware-chunking">Beyond Deduplication: Structure-Aware Chunking</a></li>
        <li><a href="/writings/2026/02/16/content-defined-chunking-part-3#why-i-care-about-this">Why I Care About This</a></li>
        <li><a href="/writings/2026/02/16/content-defined-chunking-part-3#key-takeaways">Key Takeaways</a></li>
        <li><a href="/writings/2026/02/16/content-defined-chunking-part-3#references">References</a></li>
      </ul>
    </li>
  </ol>
</div>

---

## Motivating the Problem

Imagine you're building a backup system. A user stores a 500MB file, then modifies a single paragraph and saves it again. In a naive system, this results in two nearly identical copies of the same file. Despite the small change of a single paragraph, the storage system grew from 500MB to 1GB. Surely we can do better.

This is the **deduplication problem**, and it shows up in many familiar places: cloud blob storage providers managing petabytes of user files (e.g. <a href="https://aws.amazon.com/s3/">Amazon S3</a> or <a href="https://azure.microsoft.com/en-us/products/storage/blobs">Azure Blob Storage</a>), cloud file servers like Google Drive or iCloud, and software backup tools like [Restic](https://restic.net/) and [Borg](https://www.borgbackup.org/).

The simplest form of deduplication is whole-file comparison: hash the entire file, and if two files produce the same hash, store only one copy. This works well for exact duplicates, but falls apart with even the smallest edit. Change a single byte and the hash changes completely, so the system treats the original and the edited version as two entirely different files.

One fix is to reduce the granularity of comparison. Instead of hashing a file as a single unit, split it into smaller segments called chunks and hash each chunk independently. A small edit now only affects the chunks near the change, leaving the rest unchanged. Those unchanged chunks can be recognized as duplicates and stored only once. The question then becomes: how should we decide where to split?

### Why Not Just Use Fixed-Size Chunks?

The naive approach to chunking is fixed-size splitting: choose a chunk size, say 4KB, and split the file at every 4KB boundary. A 1MB file becomes 256 chunks of 4KB each. This approach is conceptually simple, but is problematic if we want to prevent **change amplification**, or invalidating chunks of unchanged content when small edits occur. Using this naive chunking strategy, let's see what happens to unchanged chunks when a small edit occurs at the beginning of a file:

<div class="cdc-comparison-panel" id="fixed-chunking-demo" style="margin: 2rem 0;">
  <div class="cdc-comparison-title">Fixed-Size Chunking (48 bytes)</div>
  <!-- Populated dynamically by ChunkComparisonDemo -->
</div>

Inserting "NEW INTRO." at the beginning of the file causes every chunk boundary to shift, invalidating all five original chunks. The result is five new chunks and zero unchanged chunks, producing a deduplication ratio of 0%. In practice, this means the entire file would need to be stored again, even though most of its content did not change. We need a chunking strategy whose boundaries are not fixed in size, and that offers more flexibility to identify split points that better preserve unchanged chunks.

### The Core Idea: Content as the Arbiter

How does CDC decide where to split? The details vary across the various CDC algorithms, but the core principle is the same: examine a small region of data at each position, and declare a boundary when the content at that position satisfies some condition. Different algorithms use different strategies for this. Some compute a hash of a sliding window, some look for local extrema in the byte values, and some use statistical properties of the data. What they all share is that the boundary decision, or split point, is dependent on the content itself.

Let's revisit the same example from before, but this time we split the text at sentence boundaries. Each sentence ending (a period, exclamation mark, or question mark followed by a space) defines a chunk boundary. Because the boundary is determined by the content itself, not by a fixed byte count, inserting text at the beginning of the file does not invalidate existing unchanged chunks.

<div class="cdc-comparison-panel" id="cdc-chunking-demo" style="margin: 2rem 0;">
  <div class="cdc-comparison-title">Content-Defined Chunking (sentence boundaries)</div>
  <!-- Populated dynamically by ChunkComparisonDemo -->
</div>

Inserting "NEW INTRO." creates just one new chunk. The original five sentences are unchanged, so their chunks are identical to before. The result is a much higher deduplication ratio, meaning we only need to store the new chunk and can reference the existing chunks for the rest of the file.

<div class="cdc-callout" data-label="Key Insight">
When chunk boundaries are defined by the content itself rather than by fixed byte offsets, a small edit only affects the chunks near the change. The rest of the file's chunks remain identical and can be deduplicated.
</div>

---

## Three Families of CDC

### Origins

The story begins with Turing Award winner **Michael Rabin**, who introduced polynomial fingerprinting in 1981.<span class="cdc-cite"><a href="#ref-1">[1]</a></span> His key insight: represent a sequence of bytes as a polynomial and evaluate it at a random point to get a "fingerprint" that uniquely identifies the content with high probability. More importantly, this fingerprint could be computed *incrementally* — a **rolling hash** — making it efficient to slide across data.

For a sequence of bytes $b_0, b_1, \ldots, b_{n-1}$, the fingerprint is:

$$f(x) = b_0 + b_1 \cdot x + b_2 \cdot x^2 + \ldots + b_{n-1} \cdot x^{n-1} \mod p$$

where $p$ is an irreducible polynomial over $GF(2)$.

<div class="cdc-learn-more">
Ask your AI assistant about "Galois fields" and "polynomial arithmetic in GF(2)" to understand the mathematical foundations.
</div>

Twenty years later, the **Low-Bandwidth File System** (LBFS) at MIT became the first major system to use CDC in practice.<span class="cdc-cite"><a href="#ref-2">[2]</a></span> LBFS used a 48-byte sliding window with Rabin fingerprints: when the low 13 bits equaled a magic constant, it declared a chunk boundary, producing an average chunk size of about 8KB. The breakthrough was showing CDC could achieve dramatic bandwidth savings for real file workloads — modifying a single paragraph in a large document transmitted only the changed chunk, not the entire file.

{% highlight c linenos %}
// Simplified LBFS boundary check
if ((fingerprint % 8192) == 0x78) {
    // This is a chunk boundary
    emit_chunk(start, current_position);
    start = current_position;
}
{% endhighlight %}

The deduplication era of 2005-2015 drove an explosion of CDC research. Systems like **Data Domain**, **Dropbox**, and **Borg** all relied on CDC, and researchers responded with faster hash functions, better chunk size distributions, and entirely new approaches to finding boundaries. By the mid-2010s, what had been a single technique had branched into a family of algorithms with fundamentally different strategies.

### A Taxonomy of CDC Algorithms

A comprehensive 2024 survey by Gregoriadis et al.<span class="cdc-cite"><a href="#ref-12">[12]</a></span> organizes the landscape into **three distinct families** based on their core mechanism for finding chunk boundaries. This taxonomy clarifies a field that can otherwise feel like a confusing proliferation of acronyms.

<div class="cdc-taxonomy">
  <div class="cdc-taxonomy-tree">
    <div class="cdc-tax-root">CDC Algorithms</div>
    <div class="cdc-tax-vline"></div>
    <div class="cdc-tax-hbar"></div>
    <div class="cdc-tax-families">
      <div class="cdc-tax-family">
        <div class="cdc-tax-vline"></div>
        <div class="cdc-tax-family-label bsw">BSW</div>
        <div class="cdc-tax-algorithms">
          <span class="cdc-tax-algo">Rabin <span class="cdc-tax-year">1981</span></span>
          <span class="cdc-tax-algo">Buzhash <span class="cdc-tax-year">1997</span></span>
          <span class="cdc-tax-algo">Gear <span class="cdc-tax-year">2014</span></span>
          <span class="cdc-tax-algo">PCI <span class="cdc-tax-year">2020</span></span>
        </div>
      </div>
      <div class="cdc-tax-family">
        <div class="cdc-tax-vline"></div>
        <div class="cdc-tax-family-label extrema">Local Extrema</div>
        <div class="cdc-tax-algorithms">
          <span class="cdc-tax-algo">AE <span class="cdc-tax-year">2015</span></span>
          <span class="cdc-tax-algo">RAM <span class="cdc-tax-year">2017</span></span>
          <span class="cdc-tax-algo">MII <span class="cdc-tax-year">2019</span></span>
        </div>
      </div>
      <div class="cdc-tax-family">
        <div class="cdc-tax-vline"></div>
        <div class="cdc-tax-family-label statistical">Statistical</div>
        <div class="cdc-tax-algorithms">
          <span class="cdc-tax-algo">BFBC <span class="cdc-tax-year">2020</span></span>
        </div>
      </div>
    </div>
  </div>
  <div style="margin-top: 1rem; font-size: 0.72rem; color: #a89b8c; line-height: 1.4; text-align: center;">
    Taxonomy from Gregoriadis et al. <a href="#ref-12" style="color: #c45a3b; text-decoration: none; font-weight: 600;">[12]</a>
  </div>
</div>

### Algorithmic Timeline

<div class="cdc-timeline">

  <div class="cdc-tl-marker">1980</div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot bsw"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label bsw">BSW</span>
      <div class="cdc-tl-year">1981</div>
      <div class="cdc-tl-name">Rabin Fingerprint<span class="cdc-cite"><a href="#ref-1">[1]</a></span></div>
      <div class="cdc-tl-desc">The foundational rolling hash for CDC. Rabin's fingerprint operates over <em>GF(2)</em> — the Galois field with two elements — where all arithmetic reduces to XOR and carry-less multiplication. The key insight: the hash of a sliding window can be updated in <em>O(1)</em> by removing the outgoing byte's contribution and adding the incoming byte's, without recomputing from scratch. This was the first practical rolling hash with provable uniformity — the probability of two distinct <em>k</em>-byte strings colliding is at most <em>k/p</em> for an irreducible polynomial of degree <em>p</em>. The polynomial arithmetic makes it slower than later alternatives, but its mathematical foundation remains unmatched.</div>
{% highlight c linenos %}
// Rabin fingerprint: rolling hash over GF(2)
uint64_t fp = 0;
for (size_t i = 0; i < len; i++) {
    fp ^= shift_table[window[i % w]]; // remove outgoing byte
    fp = (fp << 8) | data[i];           // shift in new byte
    if (fp & HIGH_BIT) fp ^= poly;      // reduce mod irreducible poly
    window[i % w] = data[i];
    if ((fp % D) == r) return i;       // boundary!
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(1)</em> per byte (one XOR to remove, one shift + XOR to add, one polynomial reduction).</div><div><strong>Space:</strong> <em>O(w + 256)</em> — sliding window buffer plus a precomputed byte-shift table.</div></div>
    </div>
  </div>

  <div class="cdc-tl-marker">1985</div>
  <div class="cdc-tl-marker">1990</div>
  <div class="cdc-tl-marker">1995</div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot bsw"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label bsw">BSW</span>
      <div class="cdc-tl-year">1997</div>
      <div class="cdc-tl-name">Buzhash<span class="cdc-cite"><a href="#ref-3">[3]</a></span></div>
      <div class="cdc-tl-desc">Replaces Rabin's polynomial division with a <strong>cyclic polynomial</strong> — each byte maps to a random value via a lookup table, and the hash is maintained by cyclically rotating (barrel shifting) the current value and XORing in the new byte's table entry. Removing the outgoing byte uses the same table but rotated by the window size. This eliminates the polynomial reduction step entirely: no multiplication, just rotations and XORs. The result is significantly faster than Rabin in practice while providing comparable distribution properties for boundary detection. Used by Borg backup, which seeds the table with a secret value to prevent attackers from predicting chunk boundaries from known content.</div>
{% highlight c linenos %}
// Buzhash: cyclic polynomial rolling hash
uint32_t table[256]; // random values, initialized once

uint32_t h = 0;
for (size_t i = 0; i < len; i++) {
    h = ROTATE_LEFT(h, 1);                // cyclic shift by 1
    h ^= ROTATE_LEFT(table[window[i % w]], w); // remove outgoing
    h ^= table[data[i]];                   // add incoming
    window[i % w] = data[i];
    if ((h % D) == r) return i;            // boundary!
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(1)</em> per byte — one table lookup, one rotate, two XORs.</div><div><strong>Space:</strong> <em>O(w + 256)</em> — window buffer plus the random lookup table.</div></div>
    </div>
  </div>

  <div class="cdc-tl-marker">2000</div>
  <div class="cdc-tl-marker">2005</div>
  <div class="cdc-tl-marker">2010</div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot bsw"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label bsw">BSW</span>
      <div class="cdc-tl-year">2014</div>
      <div class="cdc-tl-name">Gear<span class="cdc-cite"><a href="#ref-4">[4]</a></span></div>
      <div class="cdc-tl-desc">Radically simplifies the rolling hash by eliminating the sliding window entirely. There is no outgoing byte to remove — the hash is purely feedforward. Each step left-shifts the hash by 1 bit and adds a random table lookup for the incoming byte: <code>hash = (hash &lt;&lt; 1) + table[byte]</code>. Since older bits naturally shift out of a 64-bit register, the hash is dominated by the most recent ~64 bytes. The insight is that for CDC purposes, you don't need a true sliding window hash — an approximate one where old bytes decay away is sufficient, since boundary decisions are local. One shift + one add gives the tightest inner loop of any CDC hash, roughly 2-3&times; faster than Buzhash. This became the hash of choice for FastCDC.</div>
{% highlight c linenos %}
// Gear hash: feedforward, no window needed
uint64_t gear_table[256]; // random 64-bit values

uint64_t hash = 0;
for (size_t i = min_size; i < len; i++) {
    hash = (hash << 1) + gear_table[data[i]];
    if ((hash & mask) == 0)
        return i; // boundary!
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(1)</em> per byte — one left-shift, one table lookup, one addition.</div><div><strong>Space:</strong> <em>O(256)</em> for the lookup table. No window buffer needed.</div></div>
    </div>
  </div>

  <div class="cdc-tl-marker">2015</div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot extrema"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label extrema">Extrema</span>
      <div class="cdc-tl-year">2015</div>
      <div class="cdc-tl-name">AE &mdash; Asymmetric Extremum<span class="cdc-cite"><a href="#ref-7">[7]</a></span></div>
      <div class="cdc-tl-desc">A complete departure from the hash-based lineage. AE finds chunk boundaries by scanning for the <strong>maximum byte value</strong> within a sliding window of size <em>w</em>. A boundary is declared when the maximum is at the rightmost position of the window — "asymmetric" because the check is one-sided: the max only needs to beat the preceding bytes, not the following ones. This naturally produces chunks whose sizes center around the window size. The approach eliminates all hash computation — no multiplication, no XOR, no table lookups — using only byte comparisons. The trade-off: a naive implementation rescans the entire window for each byte position, giving <em>O(w)</em> per byte, though a monotonic deque can reduce this to <em>O(1)</em> amortized.</div>
{% highlight c linenos %}
// AE: boundary when max byte is at window's right edge
for (size_t i = min_size; i < len; i++) {
    uint8_t max_val = 0;
    size_t max_pos = 0;
    for (int j = i - w + 1; j <= i; j++) {
        if (data[j] >= max_val)
            { max_val = data[j]; max_pos = j; }
    }
    if (max_pos == i) return i; // boundary!
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(w)</em> per byte naive, <em>O(1)</em> amortized with monotonic deque.</div><div><strong>Space:</strong> <em>O(w)</em> for the sliding window.</div></div>
    </div>
  </div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot bsw"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label bsw">BSW</span>
      <div class="cdc-tl-year">2016</div>
      <div class="cdc-tl-name">FastCDC<span class="cdc-cite"><a href="#ref-5">[5]</a></span><span class="cdc-cite"><a href="#ref-6">[6]</a></span></div>
      <div class="cdc-tl-desc">Builds directly on Gear (2014) and addresses a fundamental weakness of all single-threshold CDC: the exponential chunk-size distribution that produces many tiny chunks and occasional very large ones. FastCDC's key contribution is <strong>Normalized Chunking</strong> — a dual-mask strategy that uses a stricter mask (more bits must be zero) for positions below the expected average, and a looser mask (fewer bits) for positions above it. This "squeezes" the distribution toward a bell curve, dramatically improving deduplication by reducing both tiny chunks (which waste metadata) and huge chunks (which reduce sharing). The inner loop remains identical to Gear — one shift, one add, one mask check — so the dual-mask adds zero per-byte overhead. Combined with cut-point skipping (jumping past <code>min_size</code> bytes), FastCDC reported 10&times; throughput over Rabin-based CDC while matching or exceeding its deduplication ratio.</div>
{% highlight c linenos %}
// FastCDC: Gear hash + normalized chunking
uint64_t hash = 0;
size_t i = min;
for (; i < avg && i < len; i++) {     // phase 1: strict mask
    hash = (hash << 1) + gear_table[data[i]];
    if (!(hash & mask_s)) return i;
}
for (; i < max && i < len; i++) {     // phase 2: loose mask
    hash = (hash << 1) + gear_table[data[i]];
    if (!(hash & mask_l)) return i;
}
return i; // hit max chunk size
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(1)</em> per byte — identical to Gear. The dual-mask is a branch on position, not a per-byte cost.</div><div><strong>Space:</strong> <em>O(256)</em> for the Gear table.</div></div>
    </div>
  </div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot extrema"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label extrema">Extrema</span>
      <div class="cdc-tl-year">2017</div>
      <div class="cdc-tl-name">RAM &mdash; Rapid Asymmetric Maximum<span class="cdc-cite"><a href="#ref-8">[8]</a></span></div>
      <div class="cdc-tl-desc">Refines AE's extremum approach with a critical performance optimization. RAM uses an <strong>asymmetric window</strong>: a small lookback (e.g., 256 bytes) and a larger lookahead (roughly the target chunk size). A boundary is declared when the current byte is the maximum of both windows combined. The key insight is the <strong>skip optimization</strong>: when a byte is <em>not</em> the maximum in the lookahead, the algorithm jumps directly to the position of the actual maximum, bypassing all intermediate positions. This provides sublinear average-case behavior — bytes examined per boundary is roughly proportional to chunk size, not chunk size times window size. Like AE, RAM uses only byte comparisons with no arithmetic, making it attractive for resource-constrained environments.</div>
{% highlight c linenos %}
// RAM: skip to the max, don't scan past it
size_t i = min;
while (i < len) {
    size_t max_pos = i;
    for (size_t j = i+1; j <= i+ahead; j++) // scan lookahead
        if (data[j] >= data[max_pos]) max_pos = j;
    if (max_pos != i) { i = max_pos; continue; } // skip!
    bool ok = 1;
    for (size_t j = i-back; j < i; j++)        // check lookback
        if (data[j] > data[i]) { ok = 0; break; }
    if (ok) return i; // boundary!
    i++;
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(1)</em> amortized per byte due to skip optimization (worst case <em>O(w)</em>).</div><div><strong>Space:</strong> <em>O(w<sub>back</sub> + w<sub>ahead</sub>)</em> for the window buffers.</div></div>
    </div>
  </div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot extrema"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label extrema">Extrema</span>
      <div class="cdc-tl-year">2019</div>
      <div class="cdc-tl-name">MII &mdash; Maximum of Interval-length Independent<span class="cdc-cite"><a href="#ref-9">[9]</a></span></div>
      <div class="cdc-tl-desc">Builds on AE and RAM but solves a practical problem: in AE/RAM, changing the target chunk size parameters changes which positions are boundary candidates, destroying deduplication against previously stored data. MII <strong>decouples</strong> the context window from the chunk size parameters. It uses a larger window <em>W</em> (often 2&times; the target) and identifies all positions that are the maximum of their <em>W</em>-neighborhood as boundary <em>candidates</em>. Separately, it filters these candidates to respect min/max chunk constraints. This "interval-length independent" property means the same byte positions will be candidates regardless of configuration — enabling stable deduplication across different chunk size settings and even multi-resolution deduplication.</div>
{% highlight c linenos %}
// MII: boundary candidates are independent of chunk size
size_t last = 0;
for (size_t i = 0; i < len; i++) {
    bool is_max = 1;
    for (int j = -W/2; j <= W/2; j++)      // large symmetric window
        if (data[i+j] > data[i]) { is_max = 0; break; }
    if (!is_max) continue;
    if (i - last >= min) {              // filter by min chunk size
        last = i;
        emit_boundary(i);               // boundary!
    }
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(W)</em> per byte naive, <em>O(1)</em> amortized with monotonic deque.</div><div><strong>Space:</strong> <em>O(W)</em> for the context window, where <em>W &gt; w</em>.</div></div>
    </div>
  </div>

  <div class="cdc-tl-marker">2020</div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot bsw"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label bsw">BSW</span>
      <div class="cdc-tl-year">2020</div>
      <div class="cdc-tl-name">PCI &mdash; Popcount Independence<span class="cdc-cite"><a href="#ref-10">[10]</a></span></div>
      <div class="cdc-tl-desc">Takes an unusual approach within the BSW family: instead of computing a hash, PCI counts the number of <strong>1-bits</strong> (Hamming weight) in a sliding window of raw bytes. A boundary is declared when the popcount exceeds a threshold &theta;. Since the popcount of random bytes follows a binomial distribution, the threshold directly controls the average chunk size. What makes this surprisingly practical is hardware support: modern x86 and ARM CPUs have dedicated <code>POPCNT</code> instructions that count bits in a single cycle. No hash tables, no polynomial arithmetic, no random lookup tables — just counting bits in the raw data. The sliding window update is also simple: add the incoming byte's popcount, subtract the outgoing byte's.</div>
{% highlight c linenos %}
// PCI: boundary when bit-population exceeds threshold
int pop_sum = 0;
for (size_t i = 0; i < len; i++) {
    pop_sum += __builtin_popcount(data[i]);       // add incoming
    if (i >= w)
        pop_sum -= __builtin_popcount(data[i-w]); // remove outgoing
    if (i >= min && pop_sum >= threshold)
        return i; // boundary!
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(1)</em> per byte — one hardware POPCNT for the incoming byte, one subtraction for the outgoing.</div><div><strong>Space:</strong> <em>O(w)</em> for the sliding window buffer.</div></div>
    </div>
  </div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot statistical"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label statistical">Statistical</span>
      <div class="cdc-tl-year">2020</div>
      <div class="cdc-tl-name">BFBC &mdash; Byte-Frequency Based Chunking<span class="cdc-cite"><a href="#ref-11">[11]</a></span></div>
      <div class="cdc-tl-desc">A fundamentally different two-pass approach. In the first pass, BFBC scans the data and builds a frequency table of all <strong>byte pairs</strong> (digrams), then selects the top-<em>k</em> most common pairs. In the second pass, it scans linearly and declares a boundary whenever one of these high-frequency digrams appears (subject to min/max constraints). The insight: common digrams are inherently content-defined — they recur consistently regardless of insertions or deletions elsewhere, serving as natural landmarks. Once the frequency table is built, the boundary detection pass is a simple table lookup per position. The fundamental trade-off: the pre-scan makes it <strong>unsuitable for streaming</strong>, and on high-entropy data (compressed files, encrypted content) the digram frequencies flatten out, destroying the algorithm's ability to find meaningful boundaries.</div>
{% highlight c linenos %}
// BFBC Phase 1: build digram frequency table
uint32_t freq[256][256] = {0};
for (size_t i = 0; i + 1 < len; i++)
    freq[data[i]][data[i+1]]++;
bool is_cut[256][256] = select_top_k(freq, k);

// Phase 2: chunk using frequent digrams as boundaries
for (size_t i = min; i < len - 1; i++) {
    if (is_cut[data[i]][data[i+1]])
        return i + 1; // boundary after digram
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(n)</em> pre-scan + <em>O(1)</em> per byte for boundary detection.</div><div><strong>Space:</strong> <em>O(256&times;256)</em> for the digram frequency table.</div></div>
    </div>
  </div>

  <div class="cdc-tl-marker">2025</div>

  <div class="cdc-tl-entry">
    <div class="cdc-tl-dot extrema"></div>
    <div class="cdc-tl-card">
      <span class="cdc-tax-family-label extrema">Extrema</span>
      <div class="cdc-tl-year">2025</div>
      <div class="cdc-tl-name">VectorCDC<span class="cdc-cite"><a href="#ref-13">[13]</a></span></div>
      <div class="cdc-tl-desc">Demonstrates that Local Extrema algorithms are <strong>inherently SIMD-parallel</strong> in a way hash-based algorithms are not. Finding a local maximum across a window of bytes is a parallel comparison — exactly what SSE/AVX packed-max and packed-compare instructions are designed for. VectorCDC loads 16 bytes (SSE) or 32 bytes (AVX2) into a vector register and uses <code>_mm256_max_epu8</code> to compare all bytes simultaneously, extracting boundary candidates via <code>movemask</code>. Hash-based algorithms resist this because each hash update depends sequentially on the previous one. The VRAM variant (vectorized RAM) achieves <strong>16-42&times;</strong> throughput over scalar implementations, approaching memory bandwidth limits (~10-15 GB/s). Deduplication ratios remain identical since the boundary decisions are mathematically equivalent.</div>
{% highlight c linenos %}
// VectorCDC: SIMD-accelerated local max (AVX2)
for (; i + 32 <= len; i += 32) {
    __m256i curr = _mm256_loadu_si256(data + i);
    __m256i prev = _mm256_loadu_si256(data + i - 1);
    __m256i next = _mm256_loadu_si256(data + i + 1);
    __m256i is_max = _mm256_and_si256(
        _mm256_cmpeq_epi8(curr, _mm256_max_epu8(curr, prev)),
        _mm256_cmpeq_epi8(curr, _mm256_max_epu8(curr, next)));
    uint32_t mask = _mm256_movemask_epi8(is_max);
    if (mask) return i + __builtin_ctz(mask); // first local max
}
{% endhighlight %}
      <div class="cdc-tl-perf"><div><strong>Time:</strong> <em>O(1/32)</em> per byte with AVX2 — 32 bytes per instruction, approaching memory bandwidth.</div><div><strong>Space:</strong> <em>O(1)</em> beyond the data — a few vector registers, no tables or buffers.</div></div>
    </div>
  </div>

</div>

### Comparing the Families

| | **BSW** | **Local Extrema** | **Statistical** |
|---|---------|-------------------|-----------------|
| **Core operation** | Rolling hash + mask | Byte comparisons | Frequency analysis |
| **Key algorithms** | Rabin, Buzhash, Gear, PCI | AE, RAM, MII | BFBC |
| **Throughput** | Medium–High | High | Medium |
| **Dedup ratio** | High | Comparable | Dataset-dependent |
| **SIMD-friendly** | Limited | Excellent | Limited |
| **Streaming** | Yes | Yes | No (pre-scan) |
| **Chunk distribution** | Exponential (improved with NC) | Varies | Varies |
| **Used in practice** | Restic, Borg, FastCDC | Research | Research |

In the next section, we'll take a closer look at the BSW family through **FastCDC** — an algorithm that combines Gear hashing with Normalized Chunking and cut-point skipping to achieve both high throughput and excellent deduplication.

---

### References

<div class="cdc-references">
<ol>
<li id="ref-1">M. O. Rabin, "Fingerprinting by Random Polynomials," Technical Report, 1981.</li>
<li id="ref-2">A. Muthitacharoen, B. Chen & D. Mazieres, "A Low-Bandwidth Network File System," <em>ACM SOSP</em>, 2001.</li>
<li id="ref-3">J. D. Cohen, "Recursive Hashing Functions for N-Grams," <em>ACM TOIS</em>, vol. 15, no. 3, 1997.</li>
<li id="ref-4">W. Xia et al., "Ddelta: A Deduplication-Inspired Fast Delta Compression Approach," <em>Performance Evaluation</em>, vol. 79, 2014.</li>
<li id="ref-5">W. Xia et al., <a href="https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia">"FastCDC: A Fast and Efficient Content-Defined Chunking Approach for Data Deduplication,"</a> <em>USENIX ATC</em>, 2016.</li>
<li id="ref-6">W. Xia et al., <a href="https://ranger.uta.edu/~jiang/publication/Journals/2020/2020-IEEE-TPDS(Wen%20Xia).pdf">"The Design of Fast Content-Defined Chunking for Data Deduplication Based Storage Systems,"</a> <em>IEEE TPDS</em>, vol. 31, no. 9, 2020.</li>
<li id="ref-7">Y. Zhang et al., "AE: An Asymmetric Extremum Content Defined Chunking Algorithm," <em>IEEE INFOCOM</em>, 2015.</li>
<li id="ref-8">R. N. Widodo, H. Lim & M. Atiquzzaman, "A New Content-Defined Chunking Algorithm for Data Deduplication in Cloud Storage," <em>Future Generation Computer Systems</em>, vol. 71, 2017.</li>
<li id="ref-9">C. Zhang et al., "MII: A Novel Content Defined Chunking Algorithm for Finding Incremental Data in Data Synchronization," <em>IEEE Access</em>, vol. 7, 2019.</li>
<li id="ref-10">C. Zhang et al., "Function of Content Defined Chunking Algorithms in Incremental Synchronization," <em>IEEE Access</em>, vol. 8, 2020.</li>
<li id="ref-11">A. S. M. Saeed & L. E. George, "Data Deduplication System Based on Content-Defined Chunking Using Bytes Pair Frequency Occurrence," <em>Symmetry</em>, vol. 12, no. 11, 2020.</li>
<li id="ref-12">M. Gregoriadis, L. Balduf, B. Scheuermann & J. Pouwelse, <a href="https://arxiv.org/abs/2409.06066">"A Thorough Investigation of Content-Defined Chunking Algorithms for Data Deduplication,"</a> <em>arXiv:2409.06066</em>, 2024.</li>
<li id="ref-13">S. Udayashankar, A. Baba & A. Al-Kiswany, <a href="https://www.usenix.org/conference/fast25/presentation/udayashankar">"VectorCDC: Accelerating Data Deduplication with Vector Instructions,"</a> <em>USENIX FAST</em>, 2025.</li>
</ol>
</div>

---

<div class="cdc-series-nav">
Continue reading &rarr; <a href="/writings/2026/02/09/content-defined-chunking-part-2">Part 2: A Deep Dive into FastCDC</a>
</div>

<script type="module" src="/assets/js/cdc-animations.js"></script>
