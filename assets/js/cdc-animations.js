/**
 * Content-Defined Chunking (CDC) Animations
 *
 * Interactive visualizations for the CDC blog post demonstrating:
 * - Fixed vs content-defined chunking comparison
 * - GEAR hash rolling window
 * - Chunk boundary detection with dual masks
 * - Deduplication across similar documents
 */

// =============================================================================
// GEAR Hash Table (from FastCDC paper, generated from MD5 digests)
// =============================================================================

const GEAR = [
  0x3b5d3c7dn, 0x784d68ban, 0xcd52880fn, 0xecc49174n,
  0xb1a395e0n, 0xb5762f97n, 0xfd65e9b7n, 0x74b5cb5dn,
  0x15a18f8fn, 0xacc5b166n, 0xdab52333n, 0x7cb60e99n,
  0x8a2cd1b0n, 0x1e66b23en, 0x9da99356n, 0xf6ecba5fn,
  0x2c167effn, 0x2c9e4bfan, 0x0a691c2an, 0xdfc59cb9n,
  0x16ea47a8n, 0xe0cfea23n, 0xbf8dbcc3n, 0xc6e8f45cn,
  0x3fd5ee42n, 0x1c770f0fn, 0x6c586aban, 0xb799c8a5n,
  0x41a21c91n, 0x7acd2736n, 0xf1cd4d27n, 0x5f5c4196n,
  0x1fce6fc4n, 0x0a4b7d38n, 0x3d8a8e1en, 0xdab3a9acn,
  0x02d7f9d8n, 0x3b5bc0e1n, 0x9a0a1a5fn, 0x79c13b8en,
  0x71dd7082n, 0xc42b3c10n, 0x1e8ace0en, 0x1c4b1093n,
  0x39f5e449n, 0xda1f5baan, 0x5e7bf131n, 0x66d0be3fn,
  0x215694acn, 0x0fece8a7n, 0x3b10a63en, 0x2d7e4d2cn,
  0xf04f0d7bn, 0x3a3abb67n, 0x8a07e5e0n, 0x8d2c09f8n,
  0x08fba6d8n, 0x9cdf1a5cn, 0xf95d7e86n, 0x8a9c0927n,
  0x2f046c6fn, 0x29982a46n, 0x7c8c8d2en, 0xdf6c936cn,
  0xa12dddbfn, 0x2d6f7d86n, 0x43ff5e5cn, 0x5c2c4ff5n,
  0x3f7a80b7n, 0x18a3fd40n, 0xbcff3097n, 0xc2b8b2dbn,
  0x7d29c80an, 0x79e0dd2fn, 0x88c06f85n, 0xb2fc7b8an,
  0x5e6fcff4n, 0x93c9c3e8n, 0x6bcf9c0bn, 0xd27ac891n,
  0x0d7c8e49n, 0x4cf36b5dn, 0x2b57d6b2n, 0x1f9fb859n,
  0xe3c5afefn, 0x2eb96c22n, 0xf5cfc3f6n, 0x1b8a3f95n,
  0x6d4c5e3cn, 0x27718ee7n, 0x2c77bde9n, 0xf5d67959n,
  0x3b1b4d97n, 0x75f75e68n, 0xec9b3b8an, 0xb2b60ff1n,
  0xa7c1edb4n, 0x1b3da069n, 0x5f01c4a2n, 0x3db5de80n,
  0x5c2bf6a1n, 0xb4feb12en, 0x81ee7bb7n, 0x97deb0a5n,
  0x2c3b87e9n, 0x0b3e3f4cn, 0xf6bf3b19n, 0xc15dc9e2n,
  0x89dd6a44n, 0xd71eb99fn, 0xd4bca3c9n, 0x3c0f43efn,
  0xcd85e2a0n, 0x91ed4ac4n, 0xf67a59a3n, 0x6b9766efn,
  0xf6096d47n, 0xe8f5ee6cn, 0x03b958fen, 0xd4e69aa9n,
  0x0f75c2c4n, 0x62d63dd1n, 0x19e6f8b7n, 0x2c65b52bn,
  0xc7a968edn, 0x1e6ada6en, 0x2c8e7e5cn, 0xcdf1c87cn,
  0x5c5e5c4fn, 0x58f79f71n, 0x4dfa3996n, 0xf9e6c09bn,
  0x3be2d1c1n, 0xc82b1f25n, 0x50f66f31n, 0x4cd2d88fn,
  0xa0fa9d93n, 0xa5e6f749n, 0xf10ac5c5n, 0x1f7d4a4an,
  0xa8e45c42n, 0x5e73f25en, 0x52dbb28dn, 0x76f8cdf8n,
  0x02d6ef72n, 0xad98d65fn, 0x4c5e8bb4n, 0x62cbc8acn,
  0xca6756a7n, 0xf67f68c0n, 0xb92d2c7an, 0xa93e9c59n,
  0xbdc8d29fn, 0xbf26b9b9n, 0xd42f26a1n, 0x02c9a1f4n,
  0xfeaa1eb6n, 0x3c7c98fdn, 0x09cebf7cn, 0xf58d7fc1n,
  0x2c56e95bn, 0x9c05e8d0n, 0xeef83a25n, 0xdad67756n,
  0xdf00f87fn, 0xdeb2a0e6n, 0xe53b5f89n, 0xf9b58b67n,
  0x1c07c2c2n, 0x5abcb9dcn, 0xa4e64f6cn, 0xdfc4dbe2n,
  0xf9f09e86n, 0xf50adfe8n, 0xa66ca0f6n, 0xffb4e8f2n,
  0xa9f6d60en, 0x4c4d14d5n, 0x5f0aaaafn, 0xe8eec1b2n,
  0xb6f8df6bn, 0x6dd85eb7n, 0x5a75fb3an, 0x559c0af8n,
  0xe8f1f8b5n, 0xf5e06b6bn, 0xbab0bd3en, 0x2dd07c7fn,
  0x2eafa2b0n, 0xf7cdf3e1n, 0x1a4e8f70n, 0xe6c2aa48n,
  0x75d7e8a2n, 0x9bf16f87n, 0xf97fc6a1n, 0xb91c0a1fn,
  0x3f6f1e54n, 0xa8d98ccan, 0x2dc7dbe4n, 0x0f1e8bb1n,
  0xee4f14f6n, 0x1de4cd41n, 0x5f59ce8cn, 0xdfe5db57n,
  0x75e03b1fn, 0xbea6e5cen, 0xadfbf56cn, 0x1c53d9f5n,
  0xe7f2a3f0n, 0x0f5f6f65n, 0xee0bd9d3n, 0xa8c5e6e2n,
  0xbfcae4c3n, 0xccc1bec0n, 0xd4f1e0b1n, 0xcfa2f5f9n,
  0x1fb8bbd4n, 0xfd5fa5b7n, 0xbf2f8be5n, 0x5f7e39c6n,
  0xf8bd4cd6n, 0xf8e99bc1n, 0x3fdc5bf4n, 0x4f9f4be5n,
  0xbfbbd6e0n, 0x1c7bb3b5n, 0xdfb25c5en, 0x8f5f3fa9n,
  0x2f5cbf57n, 0xdf7c7d5bn, 0x4f0f6b8cn, 0xc21f5f9bn,
  0x4f8e6f78n, 0xfb7c8bd6n, 0x7f9d5f2en, 0x3f5f9db1n,
  0xcf6f2b7dn, 0x1f6f8f95n, 0x8fafc5e2n, 0xdf3fbfb4n,
  0xcfaf3f1fn, 0x9f5e1f7cn, 0x4f9e6f3bn, 0xff7d2f55n,
  0x2fbe5f8en, 0x3f7e9f51n, 0x8fce5f14n, 0xcfde9f77n,
  0x1fae3f3an, 0x9ffe7f9dn, 0x6f1e5f60n, 0xef2e9f23n,
  0x3f3ebfe6n, 0xbf4e7fa9n, 0x0f5e3f6cn, 0xcf6edfa2n,
];

// Mask values for normalized chunking (indexed by log2 of average size)
const MASKS = [
  0x0000000000000000n,  // 0 - padding
  0x0000000000000000n,  // 1 - padding
  0x0000000000000000n,  // 2 - padding
  0x0000000000000000n,  // 3 - padding
  0x0000000000000000n,  // 4 - padding
  0x0000000000000000n,  // 5 - padding
  0x0000000000000001n,  // 6 - 64B
  0x0000000000000003n,  // 7 - 128B
  0x0000000000000007n,  // 8 - 256B
  0x000000000000000fn,  // 9 - 512B
  0x000000000000001fn,  // 10 - 1KB
  0x000000000000003fn,  // 11 - 2KB
  0x000000000000007fn,  // 12 - 4KB
  0x00000000000000ffn,  // 13 - 8KB
  0x00000000000001ffn,  // 14 - 16KB
  0x00000000000003ffn,  // 15 - 32KB
  0x00000000000007ffn,  // 16 - 64KB
  0x0000000000000fffn,  // 17 - 128KB
  0x0000000000001fffn,  // 18 - 256KB
  0x0000000000003fffn,  // 19 - 512KB
  0x0000000000007fffn,  // 20 - 1MB
  0x000000000000ffffn,  // 21 - 2MB
  0x000000000001ffffn,  // 22 - 4MB
  0x000000000003ffffn,  // 23 - 8MB
  0x000000000007ffffn,  // 24 - 16MB
  0x00000000000fffffn,  // 25 - 32MB
];

// Chunk background colors (hue-diverse for clear adjacent-chunk distinction)
const CHUNK_COLORS = [
  'rgba(196, 90, 59, 0.18)',   // terracotta
  'rgba(20, 110, 90, 0.18)',   // jungle green (cool/emerald)
  'rgba(100, 170, 220, 0.20)', // sky blue
  'rgba(220, 160, 40, 0.20)',  // yellow-orange
  'rgba(130, 80, 150, 0.16)',  // muted purple
  'rgba(45, 70, 130, 0.20)',   // dark blue
  'rgba(120, 140, 60, 0.20)',  // sage green (warm/olive)
];

const CHUNK_SOLID_COLORS = [
  '#c45a3b',   // terracotta
  '#146e5a',   // jungle green (cool/emerald)
  '#64aadc',   // sky blue
  '#dca028',   // yellow-orange
  '#825096',   // muted purple
  '#2d4682',   // dark blue
  '#788c3c',   // sage green (warm/olive)
];

const CHUNK_BORDER_COLORS = [
  'rgba(196, 90, 59, 0.5)',
  'rgba(20, 110, 90, 0.5)',
  'rgba(100, 170, 220, 0.5)',
  'rgba(220, 160, 40, 0.5)',
  'rgba(130, 80, 150, 0.5)',
  'rgba(45, 70, 130, 0.5)',
  'rgba(120, 140, 60, 0.5)',
];

// =============================================================================
// CDC Chunking Implementation
// =============================================================================

/**
 * Find chunk boundary using FastCDC algorithm
 * @param {Uint8Array} data - Input data
 * @param {number} minSize - Minimum chunk size
 * @param {number} avgSize - Target average chunk size
 * @param {number} maxSize - Maximum chunk size
 * @returns {number} - Position of chunk boundary
 */
function findChunkBoundary(data, minSize, avgSize, maxSize) {
  if (data.length <= minSize) {
    return data.length;
  }

  const bits = Math.floor(Math.log2(avgSize));
  const maskS = (1n << BigInt(bits + 2)) - 1n;
  const maskL = (1n << BigInt(Math.max(bits - 2, 1))) - 1n;

  let remaining = Math.min(data.length, maxSize);
  let center = Math.min(avgSize, remaining);
  let index = minSize;
  let hash = 0n;

  // Phase 1: strict mask until average size
  while (index < center) {
    hash = ((hash << 1n) + GEAR[data[index] % 256]) & 0xffffffffn;
    if ((hash & maskS) === 0n) {
      return index;
    }
    index++;
  }

  // Phase 2: loose mask until max size
  while (index < remaining) {
    hash = ((hash << 1n) + GEAR[data[index] % 256]) & 0xffffffffn;
    if ((hash & maskL) === 0n) {
      return index;
    }
    index++;
  }

  return remaining;
}

/**
 * Find chunk boundary using basic (non-normalized) CDC algorithm.
 * Single mask applied from minSize to maxSize — produces an exponential
 * chunk-size distribution, used here for comparison with FastCDC.
 */
function findChunkBoundaryBasic(data, minSize, avgSize, maxSize) {
  if (data.length <= minSize) {
    return data.length;
  }

  const bits = Math.floor(Math.log2(avgSize));
  const mask = (1n << BigInt(bits)) - 1n;

  let remaining = Math.min(data.length, maxSize);
  let index = minSize;
  let hash = 0n;

  while (index < remaining) {
    hash = ((hash << 1n) + GEAR[data[index] % 256]) & 0xffffffffn;
    if ((hash & mask) === 0n) {
      return index;
    }
    index++;
  }

  return remaining;
}

/**
 * Chunk data using basic (non-normalized) CDC algorithm
 */
function chunkDataBasic(data, minSize, avgSize, maxSize) {
  const chunks = [];
  let offset = 0;

  while (offset < data.length) {
    const remaining = data.slice(offset);
    const boundary = findChunkBoundaryBasic(remaining, minSize, avgSize, maxSize);
    chunks.push({ offset, length: boundary });
    offset += boundary;
  }

  return chunks;
}

/**
 * Chunk data using CDC algorithm
 * @param {Uint8Array} data - Input data
 * @param {number} minSize - Minimum chunk size
 * @param {number} avgSize - Target average chunk size
 * @param {number} maxSize - Maximum chunk size
 * @returns {Array<{offset: number, length: number}>} - Array of chunks
 */
function chunkData(data, minSize, avgSize, maxSize) {
  const chunks = [];
  let offset = 0;

  while (offset < data.length) {
    const remaining = data.slice(offset);
    const boundary = findChunkBoundary(remaining, minSize, avgSize, maxSize);
    chunks.push({ offset, length: boundary });
    offset += boundary;
  }

  return chunks;
}

/**
 * Fixed-size chunking (for comparison)
 */
function chunkDataFixed(data, chunkSize) {
  const chunks = [];
  let offset = 0;

  while (offset < data.length) {
    const length = Math.min(chunkSize, data.length - offset);
    chunks.push({ offset, length });
    offset += length;
  }

  return chunks;
}

/**
 * Sentence-based chunking (split at sentence endings: . ! ?)
 */
function chunkDataSentence(text) {
  const chunks = [];
  let offset = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ((ch === '.' || ch === '!' || ch === '?') &&
        (i + 1 >= text.length || text[i + 1] === ' ')) {
      // Include the trailing space if present
      const end = (i + 1 < text.length && text[i + 1] === ' ') ? i + 2 : i + 1;
      chunks.push({ offset, length: end - offset });
      offset = end;
    }
  }

  // Remaining text (if no trailing punctuation)
  if (offset < text.length) {
    chunks.push({ offset, length: text.length - offset });
  }

  return chunks;
}

/**
 * Simple hash for chunk fingerprinting (demonstration only)
 */
function hashChunk(data, offset, length) {
  let hash = 0n;
  for (let i = 0; i < length && offset + i < data.length; i++) {
    hash = ((hash << 5n) - hash + BigInt(data[offset + i])) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 8);
}

// =============================================================================
// DOM Utilities (safe alternatives to innerHTML)
// =============================================================================

/**
 * Clear all children from an element
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createSVGElement(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

/**
 * Create a text span with optional styling
 */
function createStyledSpan(text, styles = {}) {
  const span = document.createElement('span');
  span.textContent = text;
  Object.assign(span.style, styles);
  return span;
}

// =============================================================================
// Fixed vs CDC Comparison Demo
// =============================================================================

class FixedVsCDCDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.originalText = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly.`;

    // Encode as bytes
    this.encoder = new TextEncoder();
    this.originalData = this.encoder.encode(this.originalText);

    // Configuration
    this.fixedChunkSize = 32;
    this.cdcMinSize = 16;
    this.cdcAvgSize = 32;
    this.cdcMaxSize = 64;

    // Insert text for modification
    this.insertText = 'INSERTED TEXT HERE! ';

    this.init();
  }

  init() {
    this.renderBlocks('fixed-blocks-before', this.originalData, true);
    this.renderBlocks('cdc-blocks-before', this.originalData, false);

    // Create modified version
    const insertData = this.encoder.encode(this.insertText);
    const modifiedData = new Uint8Array(this.originalData.length + insertData.length);
    modifiedData.set(insertData, 0);
    modifiedData.set(this.originalData, insertData.length);

    this.renderBlocks('fixed-blocks-after', modifiedData, true, this.originalData);
    this.renderBlocks('cdc-blocks-after', modifiedData, false, this.originalData);
  }

  renderBlocks(elementId, data, isFixed, originalData = null) {
    const container = document.getElementById(elementId);
    if (!container) return;

    clearElement(container);

    const chunks = isFixed
      ? chunkDataFixed(data, this.fixedChunkSize)
      : chunkData(data, this.cdcMinSize, this.cdcAvgSize, this.cdcMaxSize);

    // If comparing, get original chunk hashes
    let originalHashes = null;
    if (originalData) {
      const originalChunks = isFixed
        ? chunkDataFixed(originalData, this.fixedChunkSize)
        : chunkData(originalData, this.cdcMinSize, this.cdcAvgSize, this.cdcMaxSize);
      originalHashes = new Set(
        originalChunks.map(c => hashChunk(originalData, c.offset, c.length))
      );
    }

    chunks.forEach((chunk, index) => {
      const block = document.createElement('div');
      block.className = `cdc-block chunk-${index % CHUNK_COLORS.length}`;

      // Calculate width proportional to chunk size
      const widthPercent = (chunk.length / data.length) * 100;
      block.style.width = `${Math.max(widthPercent, 2)}%`;
      block.style.flex = `${chunk.length} 0 auto`;
      block.style.backgroundColor = CHUNK_SOLID_COLORS[index % CHUNK_SOLID_COLORS.length];

      // Check if this chunk exists in original
      if (originalHashes) {
        const currentHash = hashChunk(data, chunk.offset, chunk.length);
        if (!originalHashes.has(currentHash)) {
          // New/modified chunk - highlight with border
          block.style.outline = '2px solid #c45a3b';
          block.style.outlineOffset = '-2px';
        }
      }

      block.title = `${chunk.length} bytes`;
      container.appendChild(block);
    });

    // Add legend
    if (originalData) {
      const matchCount = this.countMatchingChunks(data, originalData, isFixed);
      const totalChunks = chunks.length;
      const legend = document.createElement('div');
      legend.style.cssText = 'font-size: 0.75rem; color: #8b7355; margin-top: 0.5rem; text-align: center;';
      legend.textContent = `${matchCount}/${totalChunks} chunks unchanged (${Math.round(matchCount/totalChunks*100)}% dedup)`;
      container.appendChild(legend);
    }
  }

  countMatchingChunks(newData, originalData, isFixed) {
    const newChunks = isFixed
      ? chunkDataFixed(newData, this.fixedChunkSize)
      : chunkData(newData, this.cdcMinSize, this.cdcAvgSize, this.cdcMaxSize);

    const originalChunks = isFixed
      ? chunkDataFixed(originalData, this.fixedChunkSize)
      : chunkData(originalData, this.cdcMinSize, this.cdcAvgSize, this.cdcMaxSize);

    const originalHashes = new Set(
      originalChunks.map(c => hashChunk(originalData, c.offset, c.length))
    );

    return newChunks.filter(c =>
      originalHashes.has(hashChunk(newData, c.offset, c.length))
    ).length;
  }
}

// =============================================================================
// GEAR Hash Rolling Window Demo
// =============================================================================

class GearHashDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.text = 'The quick brown fox jumps over the lazy dog. She packed her seven boxes and left. A warm breeze drifted through the open window.';
    this.encoder = new TextEncoder();
    this.data = this.encoder.encode(this.text);

    this.position = 0;
    this.hash = 0n;
    this.previousHash = 0n;
    this.isPlaying = false;
    this.speed = 7;
    this.animationFrame = null;
    this.lastTime = 0;
    this.chunks = [];
    this.chunkBoundaries = [];

    // GEAR table DOM references
    this.gearCells = [];
    this.prevActiveCell = -1;

    // CDC parameters
    this.minSize = 8;
    this.avgSize = 16;
    this.maxSize = 32;

    // Track where the current chunk starts (for relative size checks)
    this.currentChunkStart = 0;

    // Hash history: array of { char, hash, isBoundary } for each processed byte
    this.hashHistory = [];

    this.init();
  }

  init() {
    this.contentDisplay = document.getElementById('gear-content-display');
    this.hashDisplay = document.getElementById('gear-hash-display');
    this.hashWindow = document.getElementById('gear-hash-window');
    this.shiftViz = document.getElementById('gear-shift-viz');
    this.progressBar = document.getElementById('gear-progress');
    this.playBtn = document.getElementById('gear-play-btn');

    this.stepBtn = document.getElementById('gear-step-btn');
    this.resetBtn = document.getElementById('gear-reset-btn');
    this.speedControl = document.getElementById('gear-speed');
    this.tableReadout = document.getElementById('gear-table-readout');

    // Build the GEAR lookup table grid
    this.buildGearTable();

    // Chunk hover: highlight matching text + block on mouseover
    this.hoveredChunk = null;
    this.contentDisplay?.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-chunk-index]');
      const idx = el ? el.dataset.chunkIndex : null;
      if (idx !== this.hoveredChunk) {
        this.clearChunkHover();
        this.hoveredChunk = idx;
        if (idx !== null) {
          this.contentDisplay.querySelectorAll(`[data-chunk-index="${idx}"]`).forEach(
            el => el.classList.add('chunk-hover')
          );
        }
      }
    });
    this.contentDisplay?.addEventListener('mouseleave', () => {
      this.clearChunkHover();
      this.hoveredChunk = null;
    });

    // Playback controls
    this.playBtn?.addEventListener('click', () => this.togglePlay());
    this.stepBtn?.addEventListener('click', () => this.step());
    this.resetBtn?.addEventListener('click', () => this.reset());
    this.speedControl?.addEventListener('input', (e) => {
      this.speed = parseInt(e.target.value);
    });

    // Render initial placeholder shift viz to reserve layout height
    this.renderShiftViz(0, 0, 0, 0, false);
    if (this.shiftViz) this.shiftViz.style.visibility = 'hidden';

    this.render();
  }

  /**
   * Build the 16×16 GEAR lookup table grid.
   * Each cell is colored by its GEAR value (warm hue 20-50°, lightness 65-90%).
   */
  buildGearTable() {
    const grid = document.getElementById('gear-table-grid');
    if (!grid) return;

    clearElement(grid);
    this.gearCells = [];

    const hexDigits = '0123456789ABCDEF';

    // Top-left corner (empty)
    const corner = document.createElement('div');
    corner.className = 'gear-table-label';
    grid.appendChild(corner);

    // Column headers (0-F)
    for (let c = 0; c < 16; c++) {
      const colLabel = document.createElement('div');
      colLabel.className = 'gear-table-label col-header';
      colLabel.textContent = hexDigits[c];
      grid.appendChild(colLabel);
    }

    for (let i = 0; i < 256; i++) {
      const row = Math.floor(i / 16);
      const col = i % 16;

      // Row header at the start of each row
      if (col === 0) {
        const rowLabel = document.createElement('div');
        rowLabel.className = 'gear-table-label row-header';
        rowLabel.textContent = hexDigits[row] + '_';
        grid.appendChild(rowLabel);
      }

      const cell = document.createElement('div');
      cell.className = 'gear-table-cell';

      // Color by row hue + column-driven lightness gradient
      const hue = (row * 22.5 + 10) % 360;
      const saturation = row % 2 === 0 ? 68 : 60;
      const lightness = 80 - (col / 15) * 18;  // 80% → 62%, light to dark left-to-right
      cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      const gearVal = Number(GEAR[i] & 0xffffffffn);
      cell.title = `0x${i.toString(16).padStart(2, '0').toUpperCase()} → 0x${gearVal.toString(16).padStart(8, '0')}`;

      // Hover listener updates readout
      cell.addEventListener('mouseenter', () => {
        this.updateReadout(i);
      });
      cell.addEventListener('mouseleave', () => {
        // Restore to current step's byte if stepping, else clear
        if (this.position > 0) {
          const lastByte = this.data[this.position - 1];
          this.updateReadout(lastByte);
        } else {
          if (this.tableReadout) {
            this.tableReadout.textContent = 'GEAR[--] = --';
          }
        }
      });

      grid.appendChild(cell);
      this.gearCells.push(cell);
    }
  }

  /**
   * Update the GEAR table readout text for a given byte index.
   */
  updateReadout(byteIndex) {
    if (!this.tableReadout) return;
    const gearVal = Number(GEAR[byteIndex] & 0xffffffffn);
    clearElement(this.tableReadout);

    const hexStr = '0x' + gearVal.toString(16).padStart(8, '0');
    const binStr = '0b' + gearVal.toString(2).padStart(32, '0');
    const byteHex = '0x' + byteIndex.toString(16).padStart(2, '0');

    // Show printable ASCII character if applicable
    const isPrintable = byteIndex >= 33 && byteIndex <= 126;
    if (isPrintable) {
      const charSpan = document.createElement('strong');
      charSpan.textContent = "'" + String.fromCharCode(byteIndex) + "'";
      this.tableReadout.appendChild(charSpan);
      const arrow1 = document.createTextNode(' (' + byteHex + ') \u2192 ');
      this.tableReadout.appendChild(arrow1);
    } else {
      const byteSpan = document.createElement('strong');
      byteSpan.textContent = byteHex;
      this.tableReadout.appendChild(byteSpan);
      this.tableReadout.appendChild(document.createTextNode(' \u2192 '));
    }

    this.tableReadout.appendChild(document.createTextNode('GEAR['));
    const idxStrong = document.createElement('strong');
    idxStrong.textContent = byteIndex.toString();
    this.tableReadout.appendChild(idxStrong);
    this.tableReadout.appendChild(document.createTextNode('] = '));
    const valStrong = document.createElement('strong');
    valStrong.textContent = hexStr;
    this.tableReadout.appendChild(valStrong);
    const binSpan = document.createElement('span');
    binSpan.textContent = ' ' + binStr;
    binSpan.style.cssText = 'font-size: 0.65rem; color: #aaa; font-weight: normal;';
    this.tableReadout.appendChild(binSpan);
  }

  clearChunkHover() {
    this.contentDisplay?.querySelectorAll('.chunk-hover').forEach(
      el => el.classList.remove('chunk-hover')
    );
  }

  /**
   * Highlight the active cell in the GEAR table grid.
   */
  highlightGearCell(index) {
    if (this.prevActiveCell >= 0 && this.prevActiveCell < this.gearCells.length) {
      this.gearCells[this.prevActiveCell].classList.remove('active');
    }
    if (index >= 0 && index < this.gearCells.length) {
      this.gearCells[index].classList.add('active');
    }
    this.prevActiveCell = index;
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.playBtn) {
      const icon = this.playBtn.querySelector('span');
      if (icon) {
        icon.className = this.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      }
    }

    if (this.isPlaying) {
      this.lastTime = performance.now();
      this.animate();
    } else {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  animate() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const elapsed = now - this.lastTime;
    const interval = 500 / this.speed;

    if (elapsed >= interval) {
      this.step();
      this.lastTime = now;

      if (this.position >= this.data.length) {
        this.isPlaying = false;
        if (this.playBtn) {
          const icon = this.playBtn.querySelector('span');
          if (icon) icon.className = 'fa-solid fa-play';
        }
        return;
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  step() {
    if (this.position >= this.data.length) return;

    // 1. Read byte at current position
    const byteValue = this.data[this.position];
    const char = this.text[this.position];

    // 2. Capture previous hash
    this.previousHash = this.hash;

    // 3. Compute shifted hash
    const shiftedHash = Number((this.previousHash << 1n) & 0xffffffffn);

    // 4. Compute GEAR lookup value
    const gearValue = Number(GEAR[byteValue % 256] & 0xffffffffn);

    // 5. Compute new hash
    const newHashNum = (shiftedHash + gearValue) & 0xffffffff;
    this.hash = BigInt(newHashNum);
    this.position++;

    // 6. Check for chunk boundary (normalized dual-mask, matching findChunkBoundary)
    let isBoundary = false;
    const chunkLen = this.position - this.currentChunkStart;
    if (chunkLen >= this.minSize) {
      const bits = Math.floor(Math.log2(this.avgSize));
      const maskS = (1n << BigInt(bits + 2)) - 1n;
      const maskL = (1n << BigInt(Math.max(bits - 2, 1))) - 1n;
      const mask = chunkLen < this.avgSize ? maskS : maskL;
      if ((this.hash & mask) === 0n || chunkLen >= this.maxSize) {
        this.chunkBoundaries.push(this.position);
        isBoundary = true;
        this.hash = 0n;
        this.currentChunkStart = this.position;
      }
    }

    // 7. Record hash history
    this.hashHistory.push({
      char,
      hash: '0x' + newHashNum.toString(16).padStart(8, '0'),
      isBoundary,
    });

    // 8. Update bit-shift visualization
    if (this.shiftViz) this.shiftViz.style.visibility = 'visible';
    this.renderShiftViz(Number(this.previousHash), shiftedHash, gearValue, newHashNum, isBoundary);

    // 9. Highlight the GEAR table cell
    this.highlightGearCell(byteValue);
    this.updateReadout(byteValue);

    // 9. Render
    this.render();
  }

  reset() {
    this.position = 0;
    this.hash = 0n;
    this.previousHash = 0n;
    this.chunkBoundaries = [];
    this.currentChunkStart = 0;
    this.hashHistory = [];
    this.isPlaying = false;
    if (this.playBtn) {
      const icon = this.playBtn.querySelector('span');
      if (icon) icon.className = 'fa-solid fa-play';
    }
    cancelAnimationFrame(this.animationFrame);

    // Clear GEAR cell highlight
    this.highlightGearCell(-1);

    // Reset shift viz to hidden placeholder
    if (this.shiftViz) {
      clearElement(this.shiftViz);
      this.renderShiftViz(0, 0, 0, 0, false);
      this.shiftViz.style.visibility = 'hidden';
    }

    // Reset readout
    if (this.tableReadout) {
      this.tableReadout.textContent = 'GEAR[--] = --';
    }

    this.render();
  }

  render() {
    if (this.progressBar) {
      this.progressBar.style.width = `${(this.position / this.data.length) * 100}%`;
    }

    if (this.hashDisplay) {
      const hashNum = Number(this.hash & 0xffffffffn);
      const hashStr = '0x' + hashNum.toString(16).padStart(8, '0');
      const binStr = '0b' + hashNum.toString(2).padStart(32, '0');
      clearElement(this.hashDisplay);
      this.hashDisplay.appendChild(document.createTextNode('Current Hash: '));
      const strong = document.createElement('strong');
      strong.textContent = hashStr;
      this.hashDisplay.appendChild(strong);
      const binSpan = document.createElement('span');
      binSpan.textContent = ' ' + binStr;
      binSpan.style.cssText = 'font-size: 0.65rem; color: #aaa;';
      this.hashDisplay.appendChild(binSpan);

      // Highlight if boundary condition met
      const chunkLen = this.position - this.currentChunkStart;
      if (chunkLen >= this.minSize) {
        const bits = Math.floor(Math.log2(this.avgSize));
        const maskS = (1n << BigInt(bits + 2)) - 1n;
        const maskL = (1n << BigInt(Math.max(bits - 2, 1))) - 1n;
        const mask = chunkLen < this.avgSize ? maskS : maskL;
        if ((this.hash & mask) === 0n) {
          strong.style.color = '#2a7d4f';
        }
      }
    }

    this.renderHashWindow();
    this.renderContent();
  }

  renderHashWindow() {
    if (!this.hashWindow) return;
    clearElement(this.hashWindow);

    if (this.hashHistory.length === 0) return;

    // Find the start of the current chunk in the history
    let currentChunkStartIdx = 0;
    for (let i = this.hashHistory.length - 1; i >= 0; i--) {
      if (i > 0 && this.hashHistory[i - 1].isBoundary) {
        currentChunkStartIdx = i;
        break;
      }
    }

    // Show the current chunk's bytes in the window
    // If the last entry is a boundary, we're still displaying the old chunk
    const lastEntry = this.hashHistory[this.hashHistory.length - 1];
    const chunkIndex = lastEntry && lastEntry.isBoundary
      ? this.chunkBoundaries.length - 1
      : this.chunkBoundaries.length;
    const chunkColor = CHUNK_COLORS[chunkIndex % CHUNK_COLORS.length];

    for (let i = currentChunkStartIdx; i < this.hashHistory.length; i++) {
      const entry = this.hashHistory[i];
      const cell = document.createElement('div');
      cell.className = 'gear-hw-cell';
      cell.style.backgroundColor = chunkColor;

      if (i === this.hashHistory.length - 1) {
        cell.classList.add('current');
      }
      if (entry.isBoundary) {
        cell.classList.add('boundary');
      }

      const charEl = document.createElement('span');
      charEl.className = 'gear-hw-char';
      charEl.textContent = entry.char === ' ' ? '\u00A0' : entry.char;
      cell.appendChild(charEl);

      const hashEl = document.createElement('span');
      hashEl.className = 'gear-hw-hash';
      if (entry.isBoundary) hashEl.classList.add('boundary');
      hashEl.textContent = entry.hash.slice(2, 6);
      cell.appendChild(hashEl);

      this.hashWindow.appendChild(cell);
    }

    // Auto-scroll to keep the current cell visible
    this.hashWindow.scrollLeft = this.hashWindow.scrollWidth;
  }

  /**
   * Render the bit-shift visualization showing:
   * Row 1: previous hash bits (MSB marked as "dropped")
   * Row 2: shifted hash bits (new 0 on right highlighted)
   * Row 3: GEAR value bits
   * Row 4: result hash bits
   */
  renderShiftViz(previousHash, shiftedHash, gearValue, newHash, isBoundary) {
    if (!this.shiftViz) return;
    clearElement(this.shiftViz);

    const toHex = (n) => '0x' + (n >>> 0).toString(16).padStart(8, '0');
    const toBits = (n) => {
      const bits = [];
      for (let i = 31; i >= 0; i--) {
        bits.push((n >>> i) & 1);
      }
      return bits;
    };

    const prevBits = toBits(previousHash);
    const shiftBits = toBits(shiftedHash);
    const gearBits = toBits(gearValue);
    const resultBits = toBits(newHash);

    const makeBitRow = (bits, label, hexVal, options = {}) => {
      const row = document.createElement('div');
      row.className = 'gear-shift-row';

      const labelEl = document.createElement('span');
      labelEl.className = 'gear-shift-label';
      labelEl.textContent = label;
      row.appendChild(labelEl);

      // Hex value
      const hexEl = document.createElement('span');
      hexEl.className = 'gear-shift-hex';
      hexEl.textContent = hexVal;
      row.appendChild(hexEl);

      const bitsContainer = document.createElement('div');
      bitsContainer.className = 'gear-shift-bits';
      if (options.animated) bitsContainer.classList.add('animated');

      bits.forEach((bit, i) => {
        const cell = document.createElement('span');
        cell.className = `gear-bit b${bit}`;

        if (options.markDropped && i === 0) {
          cell.classList.add('dropped');
        }
        if (options.markEntering && i === 31) {
          cell.classList.add('entering');
        }

        cell.textContent = bit;
        bitsContainer.appendChild(cell);
      });

      row.appendChild(bitsContainer);
      return row;
    };

    const makeSeparator = () => {
      const sep = document.createElement('div');
      sep.className = 'gear-shift-row';
      const sepLabel = document.createElement('span');
      sepLabel.className = 'gear-shift-label';
      sep.appendChild(sepLabel);
      const sepSpacer = document.createElement('span');
      sepSpacer.className = 'gear-shift-hex';
      sep.appendChild(sepSpacer);
      const sepLine = document.createElement('div');
      sepLine.className = 'gear-shift-separator';
      sep.appendChild(sepLine);
      return sep;
    };

    // === Single card: hash → << 1 → = hash<<1 → + GEAR[n] → = hash ===
    const card = document.createElement('div');
    card.className = 'gear-shift-box';

    // Row 1: previous hash with MSB marked
    card.appendChild(makeBitRow(prevBits, 'hash', toHex(previousHash), { markDropped: true }));

    // Arrow indicator
    const arrowRow = document.createElement('div');
    arrowRow.className = 'gear-shift-row';
    const arrowLabel = document.createElement('span');
    arrowLabel.className = 'gear-shift-label';
    arrowLabel.textContent = '<< 1';
    arrowRow.appendChild(arrowLabel);
    const arrowSpacer = document.createElement('span');
    arrowSpacer.className = 'gear-shift-hex';
    arrowSpacer.textContent = '';
    arrowRow.appendChild(arrowSpacer);
    const arrowBits = document.createElement('div');
    arrowBits.className = 'gear-shift-bits';
    arrowBits.style.cssText = 'justify-content: space-between; width: calc(32 * 7px); color: #8b7355; font-size: 0.5rem;';
    const arrowLeft = document.createElement('span');
    arrowLeft.textContent = 'MSB dropped \u2190';
    arrowLeft.style.color = '#c45a3b';
    const arrowRight = document.createElement('span');
    arrowRight.textContent = '\u2192 0 enters';
    arrowRight.style.color = '#5a8a5a';
    arrowBits.appendChild(arrowLeft);
    arrowBits.appendChild(arrowRight);
    arrowRow.appendChild(arrowBits);
    card.appendChild(arrowRow);

    // Separator after shift
    card.appendChild(makeSeparator());

    // Shift result
    card.appendChild(makeBitRow(shiftBits, '= hash<<1', toHex(shiftedHash), { animated: true, markEntering: true }));

    // GEAR value row
    card.appendChild(makeBitRow(gearBits, '+ GEAR[n]', toHex(gearValue), {}));

    // Separator before final result
    card.appendChild(makeSeparator());

    // Final result row
    const resultLabel = isBoundary ? '= hash \u2713' : '= hash';
    const resultRow = makeBitRow(resultBits, resultLabel, toHex(newHash), {});
    if (isBoundary) {
      resultRow.style.fontWeight = '700';
      resultRow.querySelector('.gear-shift-label').style.color = '#2a7d4f';
    }
    card.appendChild(resultRow);

    this.shiftViz.appendChild(card);
  }

  renderContent() {
    if (!this.contentDisplay) return;

    clearElement(this.contentDisplay);
    this.contentDisplay.className = 'cdc-combined-view';

    let chunkIndex = 0;

    for (let i = 0; i < this.data.length; i++) {
      if (this.chunkBoundaries.includes(i)) {
        chunkIndex++;
      }

      const char = this.text[i];
      const byte = this.data[i];
      const hex = byte.toString(16).padStart(2, '0').toUpperCase();
      const isProcessed = i < this.position;
      const isCurrent = this.position > 0 && i === this.position - 1;
      const isUnprocessed = i >= this.position;

      const col = document.createElement('div');
      col.className = 'cdc-byte-col';

      // Character
      const charSpan = document.createElement('span');
      charSpan.className = 'cdc-byte-char';
      charSpan.textContent = char === ' ' ? '\u00A0' : char;
      col.appendChild(charSpan);

      // Hex
      const hexSpan = document.createElement('span');
      hexSpan.className = 'cdc-byte-hex';
      hexSpan.textContent = hex;
      col.appendChild(hexSpan);

      col.style.borderBottom = '2px solid transparent';

      if (isProcessed) {
        col.dataset.chunkIndex = chunkIndex;
        col.style.backgroundColor = CHUNK_COLORS[chunkIndex % CHUNK_COLORS.length];
        col.style.borderBottom = `2px solid ${CHUNK_BORDER_COLORS[chunkIndex % CHUNK_BORDER_COLORS.length]}`;
        charSpan.style.color = CHUNK_SOLID_COLORS[chunkIndex % CHUNK_SOLID_COLORS.length];
      }
      if (isCurrent) {
        col.style.outline = '2px solid #c45a3b';
        col.style.outlineOffset = '-1px';
      }
      if (isUnprocessed) {
        col.style.opacity = '0.7';
      }

      this.contentDisplay.appendChild(col);
    }

    this.contentDisplay.appendChild(this.buildChunkAnnotationBar());
  }

  /**
   * Build the chunk annotation bar: colored blocks with underline + tick + label.
   * Appended below both text and hex views.
   */
  buildChunkAnnotationBar() {
    const bar = document.createElement('div');
    bar.className = 'cdc-blocks-view';

    // Reserve space for the chunk bar before animation starts
    if (this.position === 0) {
      const wrapper = document.createElement('div');
      wrapper.className = 'cdc-block-wrapper';
      wrapper.style.flex = '1 0 0';

      const block = document.createElement('div');
      block.className = 'cdc-block';
      block.style.backgroundColor = 'transparent';
      wrapper.appendChild(block);

      const annotation = document.createElement('div');
      annotation.className = 'cdc-block-annotation';

      const line = document.createElement('div');
      line.className = 'cdc-block-line';
      annotation.appendChild(line);

      const tick = document.createElement('div');
      tick.className = 'cdc-block-tick';
      annotation.appendChild(tick);

      const label = document.createElement('div');
      label.className = 'cdc-block-label';
      label.textContent = 'No chunks yet';
      annotation.appendChild(label);

      wrapper.appendChild(annotation);
      bar.appendChild(wrapper);
      return bar;
    }

    const boundaries = [0, ...this.chunkBoundaries, this.data.length];
    const isLastChunkComplete = this.chunkBoundaries.length > 0 &&
      this.chunkBoundaries[this.chunkBoundaries.length - 1] === this.data.length;

    for (let i = 0; i < boundaries.length - 1; i++) {
      const start = boundaries[i];
      const end = boundaries[i + 1];
      const length = end - start;

      if (length === 0) continue;

      const wrapper = document.createElement('div');
      wrapper.className = 'cdc-block-wrapper';
      wrapper.dataset.chunkIndex = i;
      wrapper.style.flex = `${length} 0 0`;

      // Colored block bar
      const block = document.createElement('div');
      block.className = 'cdc-block';
      block.style.backgroundColor = CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];

      const processedLength = Math.min(this.position - start, length);
      const processedPercent = Math.max(0, processedLength / length);

      if (this.position <= start) {
        block.style.backgroundColor = 'transparent';
      } else if (this.position < end) {
        const baseColor = CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];
        block.style.background = `linear-gradient(to right, ${baseColor} 0%, ${baseColor} ${processedPercent * 100}%, transparent ${processedPercent * 100}%)`;
      }

      block.title = `${length} bytes`;
      wrapper.appendChild(block);

      // Annotation: line + center tick + label
      if (this.position > start) {
        const isInProgress = i === boundaries.length - 2 && !isLastChunkComplete && this.position < end;

        const annotation = document.createElement('div');
        annotation.className = 'cdc-block-annotation';

        const line = document.createElement('div');
        line.className = 'cdc-block-line';
        annotation.appendChild(line);

        const tick = document.createElement('div');
        tick.className = 'cdc-block-tick';
        annotation.appendChild(tick);

        const label = document.createElement('div');
        label.className = 'cdc-block-label';
        const bytesText = isInProgress ? '\u2026' : `${length} bytes`;
        label.textContent = `Chunk ${i + 1} (${bytesText})`;
        annotation.appendChild(label);

        wrapper.appendChild(annotation);
      }

      bar.appendChild(wrapper);
    }

    return bar;
  }
}

// =============================================================================
// Chunk Comparison Demo (Before/After with hover cross-linking)
// =============================================================================

class ChunkComparisonDemo {
  constructor(containerId, { mode = 'fixed', beforeText, afterText, fixedChunkSize = 48, cdcMin = 16, cdcAvg = 32, cdcMax = 64 } = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.mode = mode;
    this.fixedChunkSize = fixedChunkSize;
    this.cdcMin = cdcMin;
    this.cdcAvg = cdcAvg;
    this.cdcMax = cdcMax;
    this.encoder = new TextEncoder();

    this.beforeText = beforeText || `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow. The jay, pig, fox, zebra and wolves quack!`;
    this.afterText = afterText || `NEW INTRO. ${this.beforeText}`;

    this.build();
  }

  chunkText(text) {
    if (this.mode === 'sentence') {
      const rawChunks = chunkDataSentence(text);
      const data = this.encoder.encode(text);
      return rawChunks.map(c => ({
        offset: c.offset,
        length: c.length,
        text: text.slice(c.offset, c.offset + c.length),
        hash: hashChunk(data, c.offset, c.length),
      }));
    }

    const data = this.encoder.encode(text);
    const rawChunks = this.mode === 'fixed'
      ? chunkDataFixed(data, this.fixedChunkSize)
      : chunkData(data, this.cdcMin, this.cdcAvg, this.cdcMax);

    const decoder = new TextDecoder();
    return rawChunks.map(c => ({
      offset: c.offset,
      length: c.length,
      text: decoder.decode(data.slice(c.offset, c.offset + c.length)),
      hash: hashChunk(data, c.offset, c.length),
    }));
  }

  build() {
    // Remove only the HTML comment placeholder, keep the title and explanation
    const comment = this.container.lastChild;
    if (comment && comment.nodeType === Node.COMMENT_NODE) {
      this.container.removeChild(comment);
    }

    const beforeChunks = this.chunkText(this.beforeText);
    const afterChunks = this.chunkText(this.afterText);

    // Build a set of hashes from the "before" version
    const beforeHashes = new Set(beforeChunks.map(c => c.hash));

    // Classify after chunks as reused or new
    afterChunks.forEach(c => {
      c.reused = beforeHashes.has(c.hash);
    });

    // Original text (plain, readable)
    const originalLabel = document.createElement('div');
    originalLabel.className = 'cdc-chunk-comparison-label';
    originalLabel.textContent = 'Example text to chunk';
    this.container.appendChild(originalLabel);

    const originalText = document.createElement('div');
    originalText.className = 'cdc-chunk-comparison-text';
    originalText.textContent = this.beforeText;
    this.container.appendChild(originalText);

    // Chunked indicator
    const chunkIndicator = document.createElement('div');
    chunkIndicator.className = 'cdc-edit-indicator';
    chunkIndicator.textContent = '\u2193 Split into chunks \u2193';
    this.container.appendChild(chunkIndicator);

    // Before file (chunked)
    const beforeSection = this.buildFileSection('Before edit (chunked)', beforeChunks, false);
    this.container.appendChild(beforeSection);

    // Compute byte totals
    const beforeBytes = beforeChunks.reduce((sum, c) => sum + c.length, 0);
    const afterBytes = afterChunks.reduce((sum, c) => sum + c.length, 0);
    const newAfterChunks = afterChunks.filter(c => !c.reused);
    const reusedAfterChunks = afterChunks.filter(c => c.reused);
    const newCount = newAfterChunks.length;
    const reusedCount = reusedAfterChunks.length;
    const newBytes = newAfterChunks.reduce((sum, c) => sum + c.length, 0);

    // Unique bytes stored = before bytes + only the new bytes from the after version
    const uniqueBytesStored = beforeBytes + newBytes;
    const deltaPercent = beforeBytes > 0 ? Math.round((newBytes / beforeBytes) * 100) : 0;

    // Before summary (baseline)
    this.container.appendChild(
      this.buildSummaryTable(beforeChunks.length, 0, beforeChunks.length, true, beforeBytes)
    );

    // Edit indicator
    const indicator = document.createElement('div');
    indicator.className = 'cdc-edit-indicator';
    indicator.textContent = '\u2193 Insert \'NEW INTRO.\' at beginning \u2193';
    this.container.appendChild(indicator);

    // After file
    const afterSection = this.buildFileSection('After edit', afterChunks, true);
    this.container.appendChild(afterSection);

    // After summary (colored by dedup quality)
    this.container.appendChild(
      this.buildSummaryTable(newCount, reusedCount, afterChunks.length, false, uniqueBytesStored, beforeBytes + afterBytes, deltaPercent)
    );
  }

  buildFileSection(label, chunks, showReuse) {
    const section = document.createElement('div');
    section.className = 'cdc-chunk-comparison-file';

    // Label
    const labelEl = document.createElement('div');
    labelEl.className = 'cdc-chunk-comparison-label';
    labelEl.textContent = label;
    section.appendChild(labelEl);

    // Text view with labeled chunk spans
    const textView = document.createElement('div');
    textView.className = 'cdc-chunk-comparison-text';

    chunks.forEach((chunk, i) => {
      // Wrapper: label on top, chunk text below
      const wrapper = document.createElement('span');
      wrapper.className = 'cdc-cmp-chunk-wrapper';

      // Chunk info label above the text
      const chunkLabel = document.createElement('span');
      chunkLabel.className = 'cdc-cmp-chunk-label';
      if (showReuse && chunk.reused) {
        chunkLabel.textContent = `${chunk.length}B`;
      } else {
        chunkLabel.textContent = `NEW ${chunk.length}B`;
      }
      chunkLabel.style.color = (showReuse && chunk.reused)
        ? '#8b8178'
        : CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];
      wrapper.appendChild(chunkLabel);

      // Chunk text span
      const span = document.createElement('span');

      if (showReuse && chunk.reused) {
        span.className = 'cdc-cmp-chunk unchanged';
      } else if (showReuse && !chunk.reused) {
        span.className = 'cdc-cmp-chunk new';
        span.style.backgroundColor = CHUNK_COLORS[i % CHUNK_COLORS.length];
        span.style.borderColor = CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];
      } else {
        span.className = 'cdc-cmp-chunk';
        span.style.backgroundColor = CHUNK_COLORS[i % CHUNK_COLORS.length];
        span.style.borderColor = CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];
      }

      span.textContent = chunk.text;
      wrapper.appendChild(span);

      textView.appendChild(wrapper);
    });

    section.appendChild(textView);

    return section;
  }

  buildSummaryTable(newCount, unchangedCount, total, isBaseline, bytesStored, totalBytes, deltaPercent) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cdc-chunk-summary';

    const good = '#3d8b3d';
    const bad = '#a84832';
    const muted = '#8b7355';
    const ratio = total > 0 ? Math.round((unchangedCount / total) * 100) : 0;

    // For bytes stored: baseline shows file size, after shows unique bytes + delta %
    const bytesValue = isBaseline
      ? `${bytesStored}B`
      : `${bytesStored}B (+${deltaPercent}%)`;
    const bytesColor = isBaseline ? muted : (deltaPercent >= 100 ? bad : good);

    const stats = [
      { label: 'New Chunks', value: `${newCount}/${total}`, color: good },
      {
        label: 'Unchanged Chunks',
        value: isBaseline ? 'N/A' : `${unchangedCount}/${total}`,
        color: isBaseline ? muted : (unchangedCount === 0 ? bad : good),
      },
      {
        label: 'Deduplication %',
        value: isBaseline ? 'N/A' : `${ratio}%`,
        color: isBaseline ? muted : (ratio === 0 ? bad : good),
      },
      {
        label: isBaseline ? 'File Size' : 'Bytes Stored',
        value: bytesValue,
        color: bytesColor,
      },
    ];

    stats.forEach(({ label, value, color }) => {
      const stat = document.createElement('div');
      stat.className = 'cdc-chunk-summary-stat';

      const valueEl = document.createElement('div');
      valueEl.className = 'cdc-chunk-summary-value';
      valueEl.textContent = value;
      valueEl.style.color = color;
      stat.appendChild(valueEl);

      const labelEl = document.createElement('div');
      labelEl.className = 'cdc-chunk-summary-label';
      labelEl.textContent = label;
      stat.appendChild(labelEl);

      wrapper.appendChild(stat);
    });

    return wrapper;
  }
}

// =============================================================================
// Deduplication Demo
// =============================================================================

// Find the changed region between two strings, expanded to word boundaries
function simpleDiff(oldText, newText) {
  if (oldText === newText) return null;
  let start = 0;
  const minLen = Math.min(oldText.length, newText.length);
  while (start < minLen && oldText[start] === newText[start]) start++;
  let endOld = oldText.length;
  let endNew = newText.length;
  while (endOld > start && endNew > start && oldText[endOld - 1] === newText[endNew - 1]) {
    endOld--;
    endNew--;
  }
  // Expand to word boundaries for cleaner display
  while (start > 0 && oldText[start - 1] !== ' ') start--;
  while (endOld < oldText.length && oldText[endOld] !== ' ') endOld++;
  while (endNew < newText.length && newText[endNew] !== ' ') endNew++;
  const removed = oldText.slice(start, endOld).trim();
  const added = newText.slice(start, endNew).trim();
  if (!removed && !added) return null;
  return { removed, added };
}

class VersionedDedupDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.baseText = `Every morning the baker rises before dawn to light the old brick oven. The smell of fresh bread fills the narrow streets as the town slowly wakes. Children pass by on their way to school, pressing their noses against the glass. By noon the shelves are nearly bare and the baker begins to plan tomorrow's loaves. It has been this way for as long as anyone can remember.`;

    this.v1Text = `Every morning the baker rises before dawn to light the old brick oven. The aroma of sourdough fills the narrow streets as the town slowly wakes. Children pass by on their way to school, pressing their noses against the glass. By noon the shelves are nearly bare and the baker begins to plan tomorrow's loaves. It has been this way for as long as anyone can remember.`;

    this.encoder = new TextEncoder();
    this.minSize = 16;
    this.avgSize = 32;
    this.maxSize = 64;

    this.versions = [];
    this.versionCounter = 0;
    this.contentStore = new Map(); // hash -> {length, content, versionIndices: Set}

    this.buildUI();
    this.saveVersion(this.baseText, 'original');
    this.versionCounter++;
    this.saveVersion(this.v1Text, 'v1');
    this.textarea.value = this.v1Text;
  }

  buildUI() {
    clearElement(this.container);

    // Editor
    const editor = document.createElement('div');
    editor.className = 'cdc-dedup-editor';

    this.textarea = document.createElement('textarea');
    this.textarea.className = 'cdc-dedup-textarea';
    this.textarea.value = this.baseText;
    editor.appendChild(this.textarea);

    const btn = document.createElement('button');
    btn.className = 'cdc-dedup-save-btn';
    btn.textContent = 'Save Version';
    btn.addEventListener('click', () => {
      const text = this.textarea.value;
      if (!text.trim()) return;
      this.versionCounter++;
      this.saveVersion(text, `v${this.versionCounter}`);
    });
    editor.appendChild(btn);

    this.container.appendChild(editor);

    // Slider control (reuses parametric-control-row styles)
    const controlRow = document.createElement('div');
    controlRow.className = 'parametric-control-row';

    const label = document.createElement('span');
    label.className = 'parametric-control-label';
    this.sliderValueEl = document.createElement('strong');
    this.sliderValueEl.textContent = this.avgSize;
    label.append('Target Average: ', this.sliderValueEl, ' bytes');
    controlRow.appendChild(label);

    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.min = '16';
    this.slider.max = '128';
    this.slider.value = String(this.avgSize);
    this.slider.step = '2';
    this.slider.addEventListener('input', () => this.onSliderChange());
    controlRow.appendChild(this.slider);

    this.derivedParamsEl = document.createElement('span');
    this.derivedParamsEl.className = 'parametric-derived-params';
    this.derivedParamsEl.textContent = `(min: ${this.minSize}, max: ${this.maxSize})`;
    controlRow.appendChild(this.derivedParamsEl);

    this.container.appendChild(controlRow);

    // Timeline heading
    const timelineTitle = document.createElement('div');
    timelineTitle.className = 'cdc-dedup-timeline-title';
    timelineTitle.textContent = 'Version Timeline';
    this.container.appendChild(timelineTitle);

    const timelineHint = document.createElement('p');
    timelineHint.className = 'cdc-viz-hint';
    timelineHint.style.marginBottom = '0.75rem';
    timelineHint.textContent = 'Each version is split into chunks by FastCDC. Colored chunks are unique to that version. Gray chunks already exist in the store from an earlier version.';
    this.container.appendChild(timelineHint);

    // Timeline
    this.timelineEl = document.createElement('div');
    this.timelineEl.className = 'cdc-dedup-timeline';
    this.container.appendChild(this.timelineEl);

    // Unique chunks storage
    const storage = document.createElement('div');
    storage.className = 'cdc-dedup-storage';

    // Header row: title + inline stats
    const storageHeader = document.createElement('div');
    storageHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem;';

    const storageTitle = document.createElement('div');
    storageTitle.className = 'cdc-dedup-storage-title';
    storageTitle.style.marginBottom = '0';
    storageTitle.textContent = 'Content-Addressable Store';
    storageHeader.appendChild(storageTitle);

    const statsInline = document.createElement('span');
    statsInline.style.cssText = "font-family: 'SF Mono', monospace; font-size: 0.75rem; color: #8b7355; white-space: nowrap;";
    const statValueStyle = 'font-weight: 600; color: #c45a3b;';
    this.totalSizeDisplay = document.createElement('span');
    this.totalSizeDisplay.id = 'dedup-total-size';
    this.totalSizeDisplay.style.cssText = statValueStyle;
    this.totalSizeDisplay.textContent = '--';
    this.storedSizeDisplay = document.createElement('span');
    this.storedSizeDisplay.id = 'dedup-stored-size';
    this.storedSizeDisplay.style.cssText = statValueStyle;
    this.storedSizeDisplay.textContent = '--';
    this.ratioDisplay = document.createElement('span');
    this.ratioDisplay.id = 'dedup-ratio';
    this.ratioDisplay.style.cssText = statValueStyle;
    this.ratioDisplay.textContent = '--';

    statsInline.append('total content bytes (all versions): ', this.totalSizeDisplay, ' · total stored bytes: ', this.storedSizeDisplay, ' · dedup: ', this.ratioDisplay);
    storageHeader.appendChild(statsInline);

    storage.appendChild(storageHeader);

    const storageHint = document.createElement('p');
    storageHint.className = 'cdc-viz-hint';
    storageHint.style.marginBottom = '1rem';
    storageHint.textContent = 'Every unique chunk is stored once, identified by its content hash. Outlined chunks are shared across versions, and the badge shows the number of versions share that chunk.';
    storage.appendChild(storageHint);
    this.chunksDisplay = document.createElement('div');
    this.chunksDisplay.className = 'cdc-dedup-chunks';
    storage.appendChild(this.chunksDisplay);
    this.container.appendChild(storage);
  }

  saveVersion(text, label) {
    const data = this.encoder.encode(text);
    const versionId = this.versionCounter;
    this.versions.unshift({ id: versionId, label, text, data, chunkMap: [] });
    this.rechunk();
  }

  onSliderChange() {
    this.avgSize = parseInt(this.slider.value);
    this.minSize = Math.max(4, Math.floor(this.avgSize / 2));
    this.maxSize = this.avgSize * 2;
    if (this.sliderValueEl) this.sliderValueEl.textContent = this.avgSize;
    if (this.derivedParamsEl) this.derivedParamsEl.textContent = `(min: ${this.minSize}, max: ${this.maxSize})`;
    this.rechunk();
  }

  rechunk() {
    // Rebuild contentStore and chunkMaps from scratch using current params
    this.contentStore.clear();

    for (const version of this.versions) {
      const chunks = chunkData(version.data, this.minSize, this.avgSize, this.maxSize);
      version.chunkMap = chunks.map(c => ({
        offset: c.offset,
        length: c.length,
        hash: hashChunk(version.data, c.offset, c.length),
        content: version.text.slice(c.offset, c.offset + c.length)
      }));

      for (const chunk of version.chunkMap) {
        if (this.contentStore.has(chunk.hash)) {
          this.contentStore.get(chunk.hash).versionIndices.add(version.id);
        } else {
          this.contentStore.set(chunk.hash, {
            length: chunk.length,
            content: chunk.content,
            versionIndices: new Set([version.id])
          });
        }
      }
    }

    this.render();
  }

  isChunkShared(hash, versionId) {
    const entry = this.contentStore.get(hash);
    if (!entry) return false;
    for (const vid of entry.versionIndices) {
      if (vid < versionId) return true;
    }
    return false;
  }

  render() {
    this.renderTimeline();
    this.renderUniqueChunks();
    this.renderStats();
  }

  renderTimeline() {
    clearElement(this.timelineEl);

    for (let i = 0; i < this.versions.length; i++) {
      const version = this.versions[i];

      // Show diff annotation between this version and the next (older) one
      if (i < this.versions.length - 1) {
        const olderVersion = this.versions[i + 1];
        const diff = simpleDiff(olderVersion.text, version.text);
        if (diff) {
          const diffEl = document.createElement('div');
          diffEl.className = 'cdc-edit-indicator';
          diffEl.style.cssText = 'font-size: 0.78rem; padding: 0.15rem 0 0.4rem 1.5rem; text-align: left;';

          const removed = document.createElement('span');
          removed.style.cssText = 'color: #a84832; text-decoration: line-through;';
          const removedText = diff.removed.length > 50 ? diff.removed.slice(0, 50) + '...' : diff.removed;
          removed.textContent = removedText;

          const arrow = document.createTextNode('  \u2192  ');

          const added = document.createElement('span');
          added.style.cssText = 'color: #3d8b3d;';
          const addedText = diff.added.length > 50 ? diff.added.slice(0, 50) + '...' : diff.added;
          added.textContent = addedText;

          diffEl.appendChild(removed);
          diffEl.appendChild(arrow);
          diffEl.appendChild(added);
          this.timelineEl.appendChild(diffEl);
        }
      }

      const entry = document.createElement('div');
      entry.className = 'cdc-version-entry';

      const dot = document.createElement('div');
      dot.className = 'cdc-version-dot';
      entry.appendChild(dot);

      const content = document.createElement('div');
      content.className = 'cdc-version-content';

      const label = document.createElement('div');
      label.className = 'cdc-version-label';
      label.textContent = version.label;
      content.appendChild(label);

      const cols = document.createElement('div');
      cols.className = 'cdc-version-cols';

      const textCol = document.createElement('div');
      textCol.className = 'cdc-version-text cdc-text-view';
      this.renderVersionText(textCol, version);
      cols.appendChild(textCol);

      const blocksCol = document.createElement('div');
      blocksCol.className = 'cdc-version-blocks';
      this.renderVersionBlocks(blocksCol, version);
      cols.appendChild(blocksCol);

      content.appendChild(cols);
      entry.appendChild(content);

      this.attachVersionHover(entry);
      this.timelineEl.appendChild(entry);
    }
  }

  renderVersionText(container, version) {
    version.chunkMap.forEach((chunk, index) => {
      const shared = this.isChunkShared(chunk.hash, version.id);
      const colorIndex = index % CHUNK_COLORS.length;

      const span = document.createElement('span');
      span.className = `chunk chunk-${colorIndex}`;
      span.dataset.chunkIndex = index;
      span.dataset.chunkHash = chunk.hash;
      span.textContent = chunk.content;
      span.style.backgroundColor = CHUNK_COLORS[colorIndex];

      if (!shared && version.id > 0) {
        span.style.borderBottom = '2px solid #c45a3b';
        span.style.paddingBottom = '1px';
      }

      container.appendChild(span);
    });
  }

  renderVersionBlocks(container, version) {
    const bar = document.createElement('div');
    bar.className = 'cdc-blocks-view';

    let newCount = 0;
    let sharedCount = 0;

    version.chunkMap.forEach((chunk, i) => {
      const shared = this.isChunkShared(chunk.hash, version.id);
      if (shared) sharedCount++;
      else newCount++;

      const wrapper = document.createElement('div');
      wrapper.className = 'cdc-block-wrapper';
      wrapper.dataset.chunkIndex = i;
      wrapper.dataset.chunkHash = chunk.hash;
      wrapper.style.flex = `${chunk.length} 0 0`;

      const block = document.createElement('div');
      block.className = 'cdc-block';
      block.style.backgroundColor = (shared && version.id > 0) ? 'rgba(61, 58, 54, 0.2)' : CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];
      block.title = `${chunk.length}B${shared ? ' (shared)' : ''}`;
      wrapper.appendChild(block);

      bar.appendChild(wrapper);
    });

    container.appendChild(bar);

    const stats = document.createElement('div');
    stats.className = 'cdc-version-stats';
    const total = version.chunkMap.length;
    stats.textContent = `${total} chunks, ${newCount} new, ${sharedCount} shared`;
    container.appendChild(stats);
  }

  attachVersionHover(entryEl) {
    let hoveredIdx = null;

    entryEl.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-chunk-index]');
      const idx = el ? el.dataset.chunkIndex : null;
      if (idx !== hoveredIdx) {
        entryEl.querySelectorAll('.chunk-hover').forEach(
          el => el.classList.remove('chunk-hover')
        );
        hoveredIdx = idx;
        if (idx !== null) {
          entryEl.querySelectorAll(`[data-chunk-index="${idx}"]`).forEach(
            el => el.classList.add('chunk-hover')
          );
        }
      }
    });

    entryEl.addEventListener('mouseleave', () => {
      entryEl.querySelectorAll('.chunk-hover').forEach(
        el => el.classList.remove('chunk-hover')
      );
      hoveredIdx = null;
    });
  }

  renderUniqueChunks() {
    clearElement(this.chunksDisplay);
    let colorIndex = 0;

    this.contentStore.forEach((entry, hash) => {
      const el = document.createElement('div');
      const versionCount = entry.versionIndices.size;
      const sharedAcrossVersions = versionCount > 1;
      el.className = `cdc-dedup-chunk${sharedAcrossVersions ? ' shared' : ''}`;
      el.style.backgroundColor = CHUNK_SOLID_COLORS[colorIndex % CHUNK_SOLID_COLORS.length];
      el.style.position = 'relative';
      el.dataset.chunkHash = hash;
      el.title = `${entry.length}B — in ${versionCount} version(s)`;

      const hashLabel = document.createTextNode(hash.slice(0, 6));
      el.appendChild(hashLabel);

      if (sharedAcrossVersions) {
        const badge = document.createElement('span');
        badge.className = 'cdc-dedup-chunk-badge';
        badge.textContent = `${versionCount}v`;
        el.appendChild(badge);
      }

      this.chunksDisplay.appendChild(el);
      colorIndex++;
    });

    this.attachStoreHover();
  }

  attachStoreHover() {
    let hoveredHash = null;

    this.chunksDisplay.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-chunk-hash]');
      const hash = el ? el.dataset.chunkHash : null;
      if (hash !== hoveredHash) {
        this.clearHashHover();
        hoveredHash = hash;
        if (hash !== null) {
          this.container.querySelectorAll(`[data-chunk-hash="${hash}"]`).forEach(
            el => el.classList.add('hash-hover')
          );
        }
      }
    });

    this.chunksDisplay.addEventListener('mouseleave', () => {
      this.clearHashHover();
      hoveredHash = null;
    });
  }

  clearHashHover() {
    this.container.querySelectorAll('.hash-hover').forEach(
      el => el.classList.remove('hash-hover')
    );
  }

  renderStats() {
    const totalSize = this.versions.reduce((sum, v) => sum + v.data.length, 0);
    const storedSize = Array.from(this.contentStore.values()).reduce((sum, e) => sum + e.length, 0);
    const ratio = totalSize > 0 ? ((totalSize - storedSize) / totalSize * 100).toFixed(0) : 0;

    if (this.totalSizeDisplay) this.totalSizeDisplay.textContent = `${totalSize}B`;
    if (this.storedSizeDisplay) this.storedSizeDisplay.textContent = `${storedSize}B`;
    if (this.ratioDisplay) this.ratioDisplay.textContent = `${ratio}%`;
  }
}

// =============================================================================
// Parametric Chunking Explorer
// =============================================================================

const PARAMETRIC_INPUT_TEXT = `Content-defined chunking splits data into variable-size pieces based on the content itself, not fixed positions. This means that when a small edit occurs in the middle of a file, only the chunks near the edit change. The boundaries are determined by a rolling hash function that scans through the bytes one at a time. When the hash output matches a particular bit pattern, a chunk boundary is placed. The clever trick is that this pattern matching is driven entirely by the local byte content, so identical regions always produce identical chunks regardless of their position. This is what enables efficient deduplication in modern storage systems.`;

class ParametricChunkingDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.encoder = new TextEncoder();
    this.inputText = PARAMETRIC_INPUT_TEXT;
    this.data = this.encoder.encode(this.inputText);
    this.avgSize = 88;
    this.hoveredChunk = null;

    this.init();
  }

  init() {
    this.slider = document.getElementById('parametric-slider');
    const sliderMax = parseInt(this.slider?.max || '128');
    this.fixedXMax = sliderMax * 3;
    this.sliderValue = document.getElementById('parametric-slider-value');
    this.derivedParams = document.getElementById('parametric-derived-params');
    this.textDisplay = document.getElementById('parametric-text-display');
    this.blocksBar = document.getElementById('parametric-blocks-bar');
    this.statCount = document.getElementById('parametric-stat-count');
    this.statTarget = document.getElementById('parametric-stat-target');
    this.statActual = document.getElementById('parametric-stat-actual');
    this.statMin = document.getElementById('parametric-stat-min');
    this.statMax = document.getElementById('parametric-stat-max');

    this.slider?.addEventListener('input', () => this.update());

    // Cross-hover via event delegation
    this.container.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-chunk-index]');
      const idx = el ? el.dataset.chunkIndex : null;
      if (idx !== this.hoveredChunk) {
        this.clearHover();
        this.hoveredChunk = idx;
        if (idx !== null) {
          this.container.querySelectorAll(`[data-chunk-index="${idx}"]`).forEach(
            el => el.classList.add('chunk-hover')
          );
        }
      }
    });
    this.container.addEventListener('mouseleave', () => {
      this.clearHover();
      this.hoveredChunk = null;
    });

    this.update();
  }

  clearHover() {
    this.container.querySelectorAll('.chunk-hover').forEach(
      el => el.classList.remove('chunk-hover')
    );
  }

  update() {
    this.avgSize = parseInt(this.slider.value);
    const minSize = Math.max(4, Math.floor(this.avgSize / 2));
    const maxSize = this.avgSize * 3;

    if (this.sliderValue) this.sliderValue.textContent = this.avgSize;
    if (this.derivedParams) this.derivedParams.textContent = `(min: ${minSize}, max: ${maxSize})`;

    const chunks = chunkData(this.data, minSize, this.avgSize, maxSize);

    this.renderText(chunks);
    this.renderBlocks(chunks);
    this.renderStats(chunks);
  }

  renderText(chunks) {
    if (!this.textDisplay) return;
    clearElement(this.textDisplay);

    chunks.forEach((chunk, i) => {
      const span = document.createElement('span');
      span.className = `chunk chunk-${i % CHUNK_COLORS.length}`;
      span.dataset.chunkIndex = i;
      span.textContent = this.inputText.slice(chunk.offset, chunk.offset + chunk.length);
      span.style.backgroundColor = CHUNK_COLORS[i % CHUNK_COLORS.length];
      this.textDisplay.appendChild(span);
    });
  }

  renderBlocks(chunks) {
    if (!this.blocksBar) return;
    clearElement(this.blocksBar);

    const fixedMax = this.fixedXMax;
    const maxBlockHeight = 36;
    const annotationHeight = 26;

    chunks.forEach((chunk, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'cdc-block-wrapper';
      wrapper.dataset.chunkIndex = i;
      wrapper.style.flex = `${chunk.length} 1 0`;

      const block = document.createElement('div');
      block.className = 'cdc-block';
      block.style.backgroundColor = CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];
      block.style.height = `${Math.max(3, (chunk.length / fixedMax) * maxBlockHeight)}px`;
      block.title = `Chunk ${i + 1}: ${chunk.length} bytes`;
      wrapper.appendChild(block);

      const annotation = document.createElement('div');
      annotation.className = 'cdc-block-annotation';

      const line = document.createElement('div');
      line.className = 'cdc-block-line';
      annotation.appendChild(line);

      const tick = document.createElement('div');
      tick.className = 'cdc-block-tick';
      annotation.appendChild(tick);

      const label = document.createElement('div');
      label.className = 'cdc-block-label';
      label.textContent = `${chunk.length}B`;
      annotation.appendChild(label);

      wrapper.appendChild(annotation);
      this.blocksBar.appendChild(wrapper);
    });

    // Horizontal dashed target line
    const targetLine = document.createElement('div');
    targetLine.className = 'cdc-blocks-target-line';
    const targetBlockHeight = (this.avgSize / fixedMax) * maxBlockHeight;
    targetLine.style.bottom = `${8 + annotationHeight + targetBlockHeight}px`;
    this.blocksBar.appendChild(targetLine);
  }

  renderDistribution(chunks) {
    if (!this.distributionChart) return;
    clearElement(this.distributionChart);

    if (chunks.length === 0) return;

    const maxLen = Math.max(...chunks.map(c => c.length));
    const chartHeight = 120;

    // Dashed reference line at target avg height
    const refFraction = Math.min(this.avgSize / maxLen, 1);
    const refBottom = refFraction * chartHeight;
    const refLine = document.createElement('div');
    refLine.className = 'parametric-dist-reference';
    refLine.style.bottom = `${refBottom}px`;

    const refLabel = document.createElement('span');
    refLabel.className = 'parametric-dist-reference-label';
    refLabel.textContent = `target: ${this.avgSize}B`;
    refLine.appendChild(refLabel);
    this.distributionChart.appendChild(refLine);

    // One bar per chunk
    chunks.forEach((chunk, i) => {
      const bar = document.createElement('div');
      bar.className = 'parametric-dist-bar';
      bar.dataset.chunkIndex = i;
      const fraction = chunk.length / maxLen;
      bar.style.height = `${Math.max(fraction * 100, 2)}%`;
      bar.style.backgroundColor = CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];

      const tooltip = document.createElement('div');
      tooltip.className = 'parametric-dist-tooltip';
      tooltip.textContent = `${chunk.length} bytes`;
      bar.appendChild(tooltip);

      this.distributionChart.appendChild(bar);
    });
  }

  renderStats(chunks) {
    if (chunks.length === 0) return;

    const sizes = chunks.map(c => c.length);
    const actualAvg = (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(1);
    const minChunk = Math.min(...sizes);
    const maxChunk = Math.max(...sizes);

    if (this.statCount) this.statCount.textContent = chunks.length;
    if (this.statTarget) this.statTarget.textContent = `${this.avgSize}B`;
    if (this.statActual) this.statActual.textContent = `${actualAvg}B`;
    if (this.statMin) this.statMin.textContent = `${minChunk}B`;
    if (this.statMax) this.statMax.textContent = `${maxChunk}B`;
  }
}

// =============================================================================
// Basic vs Normalized CDC Comparison
// =============================================================================

/**
 * Generate deterministic pseudo-random bytes using a simple xorshift32 PRNG.
 * High entropy data makes the statistical difference between basic and
 * normalized CDC much more visible than natural language text.
 */
function generateComparisonData(size, seed) {
  let state = seed >>> 0 || 1;
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    data[i] = (state >>> 0) & 0xff;
  }
  return data;
}

/**
 * Compute visually clean tick values for a chart axis.
 * Returns an array of tick values that are multiples of 1, 2, or 5 × 10^n.
 */
function niceAxisTicks(max, targetCount) {
  if (max <= 0 || targetCount <= 0) return [0];
  const roughStep = max / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const candidates = [1, 2, 5, 10];
  let niceStep = candidates[candidates.length - 1] * magnitude;
  for (const c of candidates) {
    if (c * magnitude >= roughStep) {
      niceStep = c * magnitude;
      break;
    }
  }
  const ticks = [0];
  let v = niceStep;
  while (v < max) {
    ticks.push(v);
    v += niceStep;
  }
  ticks.push(v); // include a ceiling tick >= max
  return ticks;
}

/**
 * Compute a Kernel Density Estimate over chunk sizes.
 * Returns an array of {x, y} points tracing the density curve.
 */
function computeKDE(sizes, numPoints, xMin, xMax, bandwidth) {
  const n = sizes.length;
  if (n === 0) return [];

  const h = bandwidth;
  const step = (xMax - xMin) / (numPoints - 1);
  const coeff = 1 / (h * Math.sqrt(2 * Math.PI));
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step;
    let density = 0;
    for (let j = 0; j < n; j++) {
      const z = (x - sizes[j]) / h;
      density += coeff * Math.exp(-0.5 * z * z);
    }
    density /= n;
    points.push({ x, y: density });
  }

  return points;
}

/**
 * Silverman's rule bandwidth with a floor for small samples.
 */
function silvermanBandwidth(sizes, avgSize) {
  const n = sizes.length;
  if (n < 2) return avgSize * 0.15;

  const mean = sizes.reduce((a, b) => a + b, 0) / n;
  const variance = sizes.reduce((sum, s) => sum + (s - mean) ** 2, 0) / (n - 1);
  const stddev = Math.sqrt(variance);

  const h = 0.9 * stddev * Math.pow(n, -0.2);
  return Math.max(h, avgSize * 0.15);
}

class ComparisonDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.data = generateComparisonData(8192, 0xdeadbeef);
    this.avgSize = 88;

    this.slider = document.getElementById('comparison-slider');
    this.sliderValue = document.getElementById('comparison-slider-value');
    this.derivedParams = document.getElementById('comparison-derived-params');

    // Fixed x-axis: max chunk size at the slider's upper bound
    const sliderMax = parseInt(this.slider?.max || '128');
    this.fixedXMax = sliderMax * 3;

    this.slider?.addEventListener('input', () => this.update());
    this.update();
  }

  update() {
    this.avgSize = parseInt(this.slider.value);
    const minSize = Math.max(4, Math.floor(this.avgSize / 2));
    const maxSize = this.avgSize * 3;

    if (this.sliderValue) this.sliderValue.textContent = this.avgSize;
    if (this.derivedParams) this.derivedParams.textContent = `(min: ${minSize}, max: ${maxSize})`;

    const basicChunks = chunkDataBasic(this.data, minSize, this.avgSize, maxSize);
    const normalizedChunks = chunkData(this.data, minSize, this.avgSize, maxSize);

    // Fixed X range: largest possible chunk is max slider (128) * 3 = 384
    const sharedMaxLen = this.fixedXMax;

    // Compute KDE for both distributions
    const basicSizes = basicChunks.map(c => c.length);
    const normalizedSizes = normalizedChunks.map(c => c.length);

    const basicBandwidth = silvermanBandwidth(basicSizes, this.avgSize);
    const normBandwidth = silvermanBandwidth(normalizedSizes, this.avgSize);

    const basicKDE = computeKDE(basicSizes, 100, 0, sharedMaxLen, basicBandwidth);
    const normalizedKDE = computeKDE(normalizedSizes, 100, 0, sharedMaxLen, normBandwidth);

    // Shared Y scale so density magnitudes are comparable
    const sharedMaxDensity = Math.max(
      ...basicKDE.map(p => p.y),
      ...normalizedKDE.map(p => p.y)
    );

    this.renderColumn(basicChunks, 'comparison-basic', sharedMaxLen, basicKDE, sharedMaxDensity);
    this.renderColumn(normalizedChunks, 'comparison-normalized', sharedMaxLen, normalizedKDE, sharedMaxDensity);
  }

  renderColumn(chunks, prefix, sharedMaxLen, kdePoints, sharedMaxDensity) {
    this.renderBlocks(chunks, document.getElementById(`${prefix}-blocks`));
    this.renderDistribution(chunks, document.getElementById(`${prefix}-distribution`), kdePoints, sharedMaxDensity, sharedMaxLen);
    this.renderStats(chunks, prefix);
  }

  renderBlocks(chunks, container) {
    if (!container) return;
    clearElement(container);

    const fixedMax = this.fixedXMax;
    const maxBlockHeight = 64;

    chunks.forEach((chunk, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'cdc-block-wrapper';
      wrapper.style.flex = `${chunk.length} 1 0`;

      const block = document.createElement('div');
      block.className = 'cdc-block';
      block.style.backgroundColor = CHUNK_SOLID_COLORS[i % CHUNK_SOLID_COLORS.length];
      block.style.height = `${Math.max(3, (chunk.length / fixedMax) * maxBlockHeight)}px`;
      block.title = `Chunk ${i + 1}: ${chunk.length} bytes`;
      wrapper.appendChild(block);

      container.appendChild(wrapper);
    });

    // Horizontal dashed target line across all blocks
    const targetLine = document.createElement('div');
    targetLine.className = 'cdc-blocks-target-line';
    const targetBlockHeight = (this.avgSize / fixedMax) * maxBlockHeight;
    // 8px = container bottom padding (0.5rem)
    targetLine.style.bottom = `${8 + targetBlockHeight}px`;
    container.appendChild(targetLine);
  }

  renderDistribution(chunks, container, kdePoints, sharedMaxDensity, sharedMaxLen) {
    if (!container) return;
    clearElement(container);

    if (chunks.length === 0 || kdePoints.length === 0) return;

    // Add kde-specific class to override parametric-distribution-chart defaults
    container.classList.add('kde-distribution-chart');

    // Create wrapper div for the plot area (margins leave room for axis labels)
    const wrapper = document.createElement('div');
    wrapper.className = 'kde-chart-wrapper';
    container.appendChild(wrapper);

    const svgW = 400;
    const svgH = 120;

    const svg = createSVGElement('svg');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.classList.add('kde-chart-svg');

    // Compute nice axis ticks, then use the last tick as the axis extent
    // so the data sits within clean axis bounds
    const dataMaxDensity = sharedMaxDensity || Math.max(...kdePoints.map(p => p.y));
    const dataXMax = sharedMaxLen || Math.max(...kdePoints.map(p => p.x));

    const xTicks = niceAxisTicks(dataXMax, 6);
    const yTicks = niceAxisTicks(dataMaxDensity, 3);

    const xMax = xTicks[xTicks.length - 1];
    const maxDensity = yTicks[yTicks.length - 1];

    // Build the filled area path under the KDE curve
    let d = `M 0 ${svgH}`;
    kdePoints.forEach(p => {
      const px = (p.x / xMax) * svgW;
      const py = svgH - (p.y / maxDensity) * svgH;
      d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
    });
    d += ` L ${((kdePoints[kdePoints.length - 1]?.x || 0) / xMax * svgW).toFixed(2)} ${svgH} Z`;

    const path = createSVGElement('path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'rgba(196, 90, 59, 0.15)');
    path.setAttribute('stroke', '#c45a3b');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(path);

    // Dashed vertical reference line at target average
    const refX = (this.avgSize / xMax) * svgW;
    const refLine = createSVGElement('line');
    refLine.setAttribute('x1', refX.toFixed(2));
    refLine.setAttribute('y1', '0');
    refLine.setAttribute('x2', refX.toFixed(2));
    refLine.setAttribute('y2', String(svgH));
    refLine.setAttribute('stroke', 'rgba(196, 90, 59, 0.5)');
    refLine.setAttribute('stroke-width', '2');
    refLine.setAttribute('stroke-dasharray', '6 4');
    refLine.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(refLine);

    // SVG tick marks at axis edges
    xTicks.forEach(v => {
      const tx = (v / xMax) * svgW;
      const tick = createSVGElement('line');
      tick.setAttribute('x1', tx.toFixed(2));
      tick.setAttribute('y1', String(svgH - 4));
      tick.setAttribute('x2', tx.toFixed(2));
      tick.setAttribute('y2', String(svgH));
      tick.setAttribute('stroke', 'rgba(196, 90, 59, 0.3)');
      tick.setAttribute('stroke-width', '1');
      tick.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(tick);
    });

    yTicks.forEach(v => {
      const ty = svgH - (v / maxDensity) * svgH;
      const tick = createSVGElement('line');
      tick.setAttribute('x1', '0');
      tick.setAttribute('y1', ty.toFixed(2));
      tick.setAttribute('x2', '4');
      tick.setAttribute('y2', ty.toFixed(2));
      tick.setAttribute('stroke', 'rgba(196, 90, 59, 0.3)');
      tick.setAttribute('stroke-width', '1');
      tick.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(tick);
    });

    wrapper.appendChild(svg);

    // X-axis tick labels (HTML to avoid SVG text distortion)
    xTicks.forEach(v => {
      const label = document.createElement('span');
      label.className = 'kde-tick kde-tick-x';
      label.textContent = String(Math.round(v));
      label.style.left = `${(v / xMax) * 100}%`;
      wrapper.appendChild(label);
    });

    // Y-axis tick labels
    yTicks.forEach(v => {
      const label = document.createElement('span');
      label.className = 'kde-tick kde-tick-y';
      label.textContent = v === 0 ? '0' : parseFloat(v.toPrecision(2));
      label.style.top = `${(1 - v / maxDensity) * 100}%`;
      wrapper.appendChild(label);
    });

    // Axis title labels
    const xTitle = document.createElement('span');
    xTitle.className = 'kde-axis-title kde-axis-title-x';
    xTitle.textContent = 'chunk size (bytes)';
    wrapper.appendChild(xTitle);

    const yTitle = document.createElement('span');
    yTitle.className = 'kde-axis-title kde-axis-title-y';
    yTitle.textContent = 'density';
    wrapper.appendChild(yTitle);

    // Reference label inside wrapper
    const refLabel = document.createElement('span');
    refLabel.className = 'kde-ref-label';
    refLabel.textContent = `target: ${this.avgSize}B`;
    refLabel.style.left = `${(this.avgSize / xMax) * 100}%`;
    wrapper.appendChild(refLabel);
  }

  renderStats(chunks, prefix) {
    if (chunks.length === 0) return;

    const sizes = chunks.map(c => c.length);
    const actualAvg = (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(1);
    const minChunk = Math.min(...sizes);
    const maxChunk = Math.max(...sizes);

    const el = (id) => document.getElementById(id);
    const countEl = el(`${prefix}-stat-count`);
    const actualEl = el(`${prefix}-stat-actual`);
    const minEl = el(`${prefix}-stat-min`);
    const maxEl = el(`${prefix}-stat-max`);

    if (countEl) countEl.textContent = chunks.length;
    if (actualEl) actualEl.textContent = `${actualAvg}B`;
    if (minEl) minEl.textContent = `${minChunk}B`;
    if (maxEl) maxEl.textContent = `${maxChunk}B`;
  }
}

// =============================================================================
// Cost Tabs (Part 3)
// =============================================================================

class CostTabsController {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.tabs = this.container.querySelectorAll('.cdc-tab');
    this.panels = this.container.querySelectorAll('.cdc-tab-panel');
    this.panelsWrapper = this.container.querySelector('.cdc-tab-panels');

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.activate(tab.dataset.tab));
    });

    this.setFixedHeight();
    window.addEventListener('resize', () => this.setFixedHeight());
  }

  setFixedHeight() {
    this.panelsWrapper.style.minHeight = '';
    let maxHeight = 0;
    this.panels.forEach(panel => {
      panel.style.display = 'block';
      maxHeight = Math.max(maxHeight, panel.offsetHeight);
      panel.style.display = '';
    });
    this.panelsWrapper.style.minHeight = maxHeight + 'px';
  }

  activate(tabName) {
    this.tabs.forEach(tab => {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
    this.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === 'tab-' + tabName);
    });
  }
}

// =============================================================================
// Cost Tradeoffs Explorer
// =============================================================================

class CostTradeoffsDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.dimensions = [
      {
        key: 'cpu',
        label: 'CPU',
        fillClass: 'cost-fill-cpu',
        cost: (t) => 8 + 84 * (1 - t),
        annotations: [
          'many chunks to hash + compress',
          'balanced workload',
          'fewer chunks to process'
        ]
      },
      {
        key: 'memory',
        label: 'Memory',
        fillClass: 'cost-fill-memory',
        cost: (t) => 8 + 84 * Math.pow(1 - t, 0.85),
        annotations: [
          'large chunk index',
          'manageable index',
          'compact index'
        ]
      },
      {
        key: 'network',
        label: 'Network',
        fillClass: 'cost-fill-network',
        cost: (t) => 8 + 84 * Math.pow(t, 0.8),
        annotations: [
          'higher dedup ratio, minimal transfer',
          'some redundant transfer',
          'poor dedup, more data sent'
        ]
      },
      {
        key: 'storage',
        label: 'Storage',
        fillClass: 'cost-fill-storage',
        cost: (t) => 10 + 82 * (Math.pow(1 - t, 2.5) + Math.pow(t, 2)),
        annotations: [
          'metadata overhead dominates',
          'sweet spot: metadata and dedup balanced',
          'less dedup, more redundant data stored'
        ]
      }
    ];

    this.init();
  }

  init() {
    this.slider = document.getElementById('cost-tradeoffs-slider');
    this.sliderValueEl = document.getElementById('cost-tradeoffs-slider-value');
    this.barsContainer = document.getElementById('cost-tradeoffs-bars');
    this.cloudWorkload = document.getElementById('cost-cloud-workload');
    this.cloudTbody = document.getElementById('cost-cloud-tbody');

    // User-activity-driven workload
    this.numUsers = 100_000_000;          // 100M users
    this.totalDataGB = 1_048_576;         // 1 PB
    this.monthlyDocReads = 1_000_000_000; // 1B reads/month
    this.avgReadMB = 1;                   // ~1 MB per doc read
    this.editsPerUserMonth = 50;
    this.avgEditMB = 10;                  // 10 MB change per edit

    // Derived monthly volumes
    // Egress: all doc reads download full doc (no cache)
    this.monthlyEgressGB = (this.monthlyDocReads * this.avgReadMB) / 1024;
    // Gross churn: total edit volume before dedup
    this.grossChurnGB = (this.numUsers * this.editsPerUserMonth * this.avgEditMB) / 1024;

    // Cloud provider pricing (per-unit costs)
    this.providers = [
      {
        name: 'AWS S3',
        storagePerGB: 0.023,       // S3 Standard, first 50 TB
        storageNote: 'Standard, first 50 TB',
        putPer1K: 0.005,           // PUT/COPY/POST/LIST per 1,000
        putNote: 'PUT/COPY/POST/LIST',
        getPer1K: 0.0004,          // GET/SELECT per 1,000
        getNote: 'GET/SELECT',
        egressPerGB: 0.09,         // first 10 TB/month
        egressNote: 'first 10 TB/mo'
      },
      {
        name: 'GCP',
        storagePerGB: 0.026,       // Standard, US multi-region
        storageNote: 'Standard, multi-region',
        putPer1K: 0.005,           // Class A per 1,000
        putNote: 'Class A ops',
        getPer1K: 0.0004,          // Class B per 1,000
        getNote: 'Class B ops',
        egressPerGB: 0.12,         // first 10 TB/month
        egressNote: 'first 10 TB/mo'
      },
      {
        name: 'Azure',
        storagePerGB: 0.018,       // Hot tier (LRS), first 50 TB
        storageNote: 'Hot (LRS), first 50 TB',
        putPer1K: 0.0065,          // Write per 1,000 ($0.065/10K)
        putNote: 'Write ops',
        getPer1K: 0.0005,          // Read per 1,000 ($0.005/10K)
        getNote: 'Read ops',
        egressPerGB: 0.087,        // to internet
        egressNote: 'to internet'
      }
    ];

    this.buildBars();
    this.buildCloudTable();
    this.slider?.addEventListener('input', () => this.update());
    this.update();
  }

  buildBars() {
    clearElement(this.barsContainer);

    this.bars = {};
    for (const dim of this.dimensions) {
      const row = document.createElement('div');
      row.className = 'cost-bar-row';

      const label = document.createElement('span');
      label.className = 'cost-bar-label';
      label.textContent = dim.label;

      const track = document.createElement('div');
      track.className = 'cost-bar-track';

      const fill = document.createElement('div');
      fill.className = `cost-bar-fill ${dim.fillClass}`;
      track.appendChild(fill);

      const annotation = document.createElement('span');
      annotation.className = 'cost-bar-annotation';

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(annotation);
      this.barsContainer.appendChild(row);

      this.bars[dim.key] = { fill, annotation };
    }
  }

  sliderToKB(value) {
    return Math.pow(2, value / 10);
  }

  formatSize(kb) {
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
    if (kb >= 10) return `${Math.round(kb)} KB`;
    return `${kb.toFixed(1)} KB`;
  }

  formatDollars(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    if (amount >= 100) return `$${amount.toFixed(0)}`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    return `$${amount.toFixed(3)}`;
  }

  formatCount(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }

  formatGB(gb) {
    if (gb >= 1_048_576) return `${(gb / 1_048_576).toFixed(1)} PB`;
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
    if (gb >= 1) return `${Math.round(gb)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  }

  dedupRatio(t) {
    // 1 KB (~5x dedup) to 1 MB (~1.2x dedup)
    return 1.2 + 3.8 * Math.pow(1 - t, 0.7);
  }

  buildCloudTable() {
    if (!this.cloudTbody) return;
    clearElement(this.cloudTbody);

    const rowDefs = [
      { label: 'Objects stored', key: 'objects' },
      { label: 'Storage', key: 'storage' },
      { label: 'Operations (PUT + GET)', key: 'operations' },
      { label: 'Network egress', key: 'egress' },
      { label: 'Network ingress', key: 'ingress' },
      { label: 'Monthly total', key: 'total' }
    ];

    this.cloudCells = {};
    for (const rowDef of rowDefs) {
      const tr = document.createElement('tr');
      const th = document.createElement('td');
      th.textContent = rowDef.label;
      tr.appendChild(th);

      this.cloudCells[rowDef.key] = [];
      for (let i = 0; i < this.providers.length; i++) {
        const td = document.createElement('td');

        const value = document.createElement('span');
        value.className = 'cost-cell-value';
        const calc1 = document.createElement('span');
        calc1.className = 'cost-cell-calc';
        const calc2 = document.createElement('span');
        calc2.className = 'cost-cell-calc';

        td.appendChild(value);
        td.appendChild(calc1);
        td.appendChild(calc2);
        tr.appendChild(td);
        this.cloudCells[rowDef.key].push({ value, calc1, calc2 });
      }

      this.cloudTbody.appendChild(tr);
    }
  }

  updateCloudCosts(t, chunkKB) {
    if (!this.cloudTbody) return;

    const dedup = this.dedupRatio(t);
    const uniqueGB = this.totalDataGB / dedup;
    const chunkBytes = chunkKB * 1024;
    const numObjects = (uniqueGB * 1024 * 1024 * 1024) / chunkBytes;

    // PUT ops: each chunk from an edit needs an API call (check hash, store if new)
    const monthlyPuts = (this.grossChurnGB * 1024 * 1024 * 1024) / chunkBytes;
    // GET ops: each doc fetch downloads all chunks (no cache)
    const monthlyGets = (this.monthlyEgressGB * 1024 * 1024 * 1024) / chunkBytes;
    // Ingress: only unique new chunks actually upload (dedup filters the rest)
    const ingressGB = this.grossChurnGB / dedup;

    // Update workload summary
    if (this.cloudWorkload) {
      this.cloudWorkload.textContent =
        `${this.formatCount(numObjects)} objects | ${this.formatGB(uniqueGB)} stored | ${dedup.toFixed(1)}x dedup`;
    }

    const chunkLabel = this.formatSize(chunkKB);

    for (let i = 0; i < this.providers.length; i++) {
      const p = this.providers[i];

      const storageCost = uniqueGB * p.storagePerGB;
      const putCost = (monthlyPuts / 1000) * p.putPer1K;
      const getCost = (monthlyGets / 1000) * p.getPer1K;
      const opsCost = putCost + getCost;
      // Egress: full doc bytes for every user fetch, no cache
      const egressCost = this.monthlyEgressGB * p.egressPerGB;
      const totalCost = storageCost + opsCost + egressCost;

      // Objects stored
      const obj = this.cloudCells['objects'][i];
      obj.value.textContent = this.formatCount(numObjects);
      obj.calc1.textContent = `${this.formatGB(uniqueGB)} / ${chunkLabel}`;
      obj.calc2.textContent = '';

      // Storage
      const stor = this.cloudCells['storage'][i];
      stor.value.textContent = this.formatDollars(storageCost);
      stor.calc1.textContent = `${this.formatGB(uniqueGB)} \u00d7 $${p.storagePerGB}/GB`;
      stor.calc2.textContent = p.storageNote;

      // Operations (PUT + GET with separate calc lines)
      const ops = this.cloudCells['operations'][i];
      ops.value.textContent = this.formatDollars(opsCost);
      ops.calc1.textContent = `${p.putNote}: ${this.formatCount(monthlyPuts)} \u00d7 $${p.putPer1K}/1K`;
      ops.calc2.textContent = `${p.getNote}: ${this.formatCount(monthlyGets)} \u00d7 $${p.getPer1K}/1K`;

      // Egress
      const egr = this.cloudCells['egress'][i];
      egr.value.textContent = this.formatDollars(egressCost);
      egr.calc1.textContent = `${this.formatGB(this.monthlyEgressGB)} \u00d7 $${p.egressPerGB}/GB`;
      egr.calc2.textContent = p.egressNote;

      // Ingress
      const ing = this.cloudCells['ingress'][i];
      ing.value.textContent = `Free (${this.formatGB(ingressGB)})`;
      ing.calc1.textContent = `${this.formatGB(this.grossChurnGB)} / ${dedup.toFixed(1)}x dedup`;
      ing.calc2.textContent = '';

      // Total
      const tot = this.cloudCells['total'][i];
      tot.value.textContent = this.formatDollars(totalCost);
      tot.calc1.textContent = '';
      tot.calc2.textContent = '';
    }
  }

  update() {
    const sliderValue = parseInt(this.slider.value);
    const t = sliderValue / 100;
    const kb = this.sliderToKB(sliderValue);

    this.sliderValueEl.textContent = this.formatSize(kb);

    for (const dim of this.dimensions) {
      const pct = dim.cost(t);
      const bar = this.bars[dim.key];
      bar.fill.style.width = `${pct}%`;

      const tier = t < 0.33 ? 0 : t < 0.67 ? 1 : 2;
      bar.annotation.textContent = dim.annotations[tier];
    }

    this.updateCloudCosts(t, kb);
  }
}

// =============================================================================
// Container Cost Explorer (Part 4)
// =============================================================================

class ContainerCostDemo {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.mode = options.mode; // 'naive', 'packed', or undefined (legacy)

    // User-activity-driven workload (same as CostTradeoffsDemo)
    this.numUsers = 100_000_000;
    this.totalDataGB = 1_048_576;
    this.monthlyDocReads = 1_000_000_000;
    this.avgReadMB = 1;
    this.editsPerUserMonth = 50;
    this.avgEditMB = 10;

    this.monthlyEgressGB = (this.monthlyDocReads * this.avgReadMB) / 1024;
    this.grossChurnGB = (this.numUsers * this.editsPerUserMonth * this.avgEditMB) / 1024;

    this.providers = [
      {
        name: 'AWS S3',
        storagePerGB: 0.023,
        storageNote: 'Standard, first 50 TB',
        putPer1K: 0.005,
        putNote: 'PUT/COPY/POST/LIST',
        getPer1K: 0.0004,
        getNote: 'GET/SELECT',
        egressPerGB: 0.09,
        egressNote: 'first 10 TB/mo'
      },
      {
        name: 'GCP',
        storagePerGB: 0.026,
        storageNote: 'Standard, multi-region',
        putPer1K: 0.005,
        putNote: 'Class A ops',
        getPer1K: 0.0004,
        getNote: 'Class B ops',
        egressPerGB: 0.12,
        egressNote: 'first 10 TB/mo'
      },
      {
        name: 'Azure',
        storagePerGB: 0.018,
        storageNote: 'Hot (LRS), first 50 TB',
        putPer1K: 0.0065,
        putNote: 'Write ops',
        getPer1K: 0.0005,
        getNote: 'Read ops',
        egressPerGB: 0.087,
        egressNote: 'to internet'
      }
    ];

    this.containerSizes = [4096, 16384, 65536]; // KB: 4 MB, 16 MB, 64 MB
    this.containerLabels = ['4 MB', '16 MB', '64 MB'];

    this.init();
  }

  init() {
    const el = (sel) => this.container.querySelector(sel);
    this.chunkSlider = el('input[type="range"][id$="chunk-slider"]');
    this.chunkValueEl = el('strong[id$="chunk-value"]');
    this.packingToggle = el('input[type="checkbox"][id$="packing-toggle"]');
    this.containerSlider = el('input[type="range"][id$="container-slider"]');
    this.containerValueEl = el('strong[id$="container-value"]');
    this.cloudSection = el('[id$="cloud-section"]');

    // Mode-specific initialization
    if (this.mode === 'packed' && this.packingToggle) {
      this.packingToggle.checked = true;
      if (this.containerSlider) this.containerSlider.disabled = false;
    }

    this.buildCloudTable();
    this.chunkSlider?.addEventListener('input', () => this.update());
    if (this.mode !== 'naive') {
      this.packingToggle?.addEventListener('change', () => this.onToggle());
      this.containerSlider?.addEventListener('input', () => this.update());
    }
    this.update();
  }

  sliderToKB(value) {
    return Math.pow(2, value / 10);
  }

  formatSize(kb) {
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
    if (kb >= 10) return `${Math.round(kb)} KB`;
    return `${kb.toFixed(1)} KB`;
  }

  formatDollars(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    if (amount >= 100) return `$${amount.toFixed(0)}`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    return `$${amount.toFixed(3)}`;
  }

  formatCount(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }

  formatGB(gb) {
    if (gb >= 1_048_576) return `${(gb / 1_048_576).toFixed(1)} PB`;
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
    if (gb >= 1) return `${Math.round(gb)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  }

  dedupRatio(t) {
    return 1.2 + 3.8 * Math.pow(1 - t, 0.7);
  }

  buildCloudTable() {
    if (!this.cloudSection) return;
    clearElement(this.cloudSection);

    // Header
    const header = document.createElement('div');
    header.className = 'cost-cloud-header';
    const title = document.createElement('span');
    title.className = 'cost-cloud-title';
    title.textContent = 'Estimated Monthly Cloud Costs';
    this.workloadEl = document.createElement('span');
    this.workloadEl.className = 'cost-cloud-workload';
    header.appendChild(title);
    header.appendChild(this.workloadEl);
    this.cloudSection.appendChild(header);

    // Table
    const table = document.createElement('table');
    table.className = 'cost-cloud-table';

    // Thead
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
    headRow.appendChild(emptyTh);
    for (const p of this.providers) {
      const th = document.createElement('th');
      th.textContent = p.name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = p.storageNote.replace('first 50 TB', 'US East').replace('multi-region', 'US multi-region');
      th.appendChild(sub);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    // Tbody
    const tbody = document.createElement('tbody');
    const rowDefs = [
      { label: 'Objects stored', key: 'objects' },
      { label: 'Storage', key: 'storage' },
      { label: 'Operations (PUT + GET)', key: 'operations' },
      { label: 'Network egress', key: 'egress' },
      { label: 'Monthly total', key: 'total' },
      ...(this.mode === 'naive' ? [] : [{ label: 'Savings vs. naive', key: 'savings' }])
    ];

    this.cloudCells = {};
    for (const rowDef of rowDefs) {
      const tr = document.createElement('tr');
      if (rowDef.key === 'savings') {
        tr.className = 'container-savings-row';
      }
      const th = document.createElement('td');
      th.textContent = rowDef.label;
      tr.appendChild(th);

      this.cloudCells[rowDef.key] = [];
      for (let i = 0; i < this.providers.length; i++) {
        const td = document.createElement('td');
        const value = document.createElement('span');
        value.className = 'cost-cell-value';
        const calc1 = document.createElement('span');
        calc1.className = 'cost-cell-calc';
        const calc2 = document.createElement('span');
        calc2.className = 'cost-cell-calc';
        td.appendChild(value);
        td.appendChild(calc1);
        td.appendChild(calc2);
        tr.appendChild(td);
        this.cloudCells[rowDef.key].push({ value, calc1, calc2, td });
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.cloudSection.appendChild(table);

    // Pricing reference
    const details = document.createElement('details');
    details.className = 'cost-pricing-ref';
    const summary = document.createElement('summary');
    summary.textContent = 'Per-unit pricing rates used in these calculations';
    details.appendChild(summary);

    const refTable = document.createElement('table');
    refTable.className = 'cost-cloud-table cost-ref-table';
    const refThead = document.createElement('thead');
    const refHeadRow = document.createElement('tr');
    const refEmptyTh = document.createElement('th');
    refHeadRow.appendChild(refEmptyTh);
    const providerSubtitles = ['Standard, US East', 'Standard, US multi-region', 'Hot tier (LRS), US East'];
    for (let i = 0; i < this.providers.length; i++) {
      const th = document.createElement('th');
      th.textContent = this.providers[i].name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = providerSubtitles[i];
      th.appendChild(sub);
      refHeadRow.appendChild(th);
    }
    refThead.appendChild(refHeadRow);
    refTable.appendChild(refThead);

    const refTbody = document.createElement('tbody');
    const refRows = [
      { label: 'Storage', values: ['$0.023/GB', '$0.026/GB', '$0.018/GB'], notes: ['first 50 TB', 'multi-region', 'first 50 TB'] },
      { label: 'Write ops', values: ['$0.005/1K', '$0.005/1K', '$0.0065/1K'], notes: ['PUT/COPY/POST/LIST', 'Class A ops', 'Write ops'] },
      { label: 'Read ops', values: ['$0.0004/1K', '$0.0004/1K', '$0.0005/1K'], notes: ['GET/SELECT', 'Class B ops', 'Read ops'] },
      { label: 'Egress', values: ['$0.09/GB', '$0.12/GB', '$0.087/GB'], notes: ['first 10 TB/mo', 'first 10 TB/mo', 'to internet'] }
    ];
    for (const row of refRows) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;
      tr.appendChild(tdLabel);
      for (let i = 0; i < row.values.length; i++) {
        const td = document.createElement('td');
        td.textContent = row.values[i];
        const note = document.createElement('span');
        note.className = 'cost-cell-calc';
        note.textContent = row.notes[i];
        td.appendChild(note);
        tr.appendChild(td);
      }
      refTbody.appendChild(tr);
    }
    refTable.appendChild(refTbody);
    details.appendChild(refTable);
    this.cloudSection.appendChild(details);

    // Assumptions
    const assumptions = document.createElement('div');
    assumptions.className = 'cost-cloud-assumptions';
    assumptions.textContent = 'Assumes 100M users, 1 PB total data (~1B docs, ~1 MB avg), 1B doc reads/month, 50 edits per user/month (10 MB avg change). No client-side cache. US East / US multi-region, standard and hot tiers. Pricing as of Feb 2026.';
    this.cloudSection.appendChild(assumptions);
  }

  onToggle() {
    const packed = this.packingToggle?.checked;
    if (this.containerSlider) {
      this.containerSlider.disabled = !packed;
    }
    this.update();
  }

  updateCloudCosts(t, chunkKB, packed, containerSizeKB) {
    const dedup = this.dedupRatio(t);
    const uniqueGB = this.totalDataGB / dedup;
    const chunkBytes = chunkKB * 1024;
    const numChunks = (uniqueGB * 1024 * 1024 * 1024) / chunkBytes;

    // Naive per-chunk operations
    const naivePuts = (this.grossChurnGB * 1024 * 1024 * 1024) / chunkBytes;
    const naiveGets = (this.monthlyEgressGB * 1024 * 1024 * 1024) / chunkBytes;

    // Container packing
    const chunksPerContainer = packed ? Math.max(1, containerSizeKB / chunkKB) : 1;
    const numObjects = packed ? Math.ceil(numChunks / chunksPerContainer) : numChunks;
    const actualPuts = packed ? naivePuts / chunksPerContainer : naivePuts;
    const actualGets = packed ? naiveGets / chunksPerContainer : naiveGets;

    // Workload summary
    if (this.workloadEl) {
      const objLabel = packed ? 'containers' : 'objects';
      this.workloadEl.textContent =
        `${this.formatCount(numObjects)} ${objLabel} | ${this.formatGB(uniqueGB)} stored | ${dedup.toFixed(1)}x dedup`;
    }

    const naiveTotals = [];
    const packedTotals = [];

    for (let i = 0; i < this.providers.length; i++) {
      const p = this.providers[i];

      const storageCost = uniqueGB * p.storagePerGB;
      const putCost = (actualPuts / 1000) * p.putPer1K;
      const getCost = (actualGets / 1000) * p.getPer1K;
      const opsCost = putCost + getCost;
      const egressCost = this.monthlyEgressGB * p.egressPerGB;
      const totalCost = storageCost + opsCost + egressCost;

      // Also compute naive total for savings row
      const naivePutCost = (naivePuts / 1000) * p.putPer1K;
      const naiveGetCost = (naiveGets / 1000) * p.getPer1K;
      const naiveOpsCost = naivePutCost + naiveGetCost;
      const naiveTotal = storageCost + naiveOpsCost + egressCost;
      naiveTotals.push(naiveTotal);
      packedTotals.push(totalCost);

      const chunkLabel = this.formatSize(chunkKB);

      // Objects stored
      const obj = this.cloudCells['objects'][i];
      obj.value.textContent = this.formatCount(numObjects);
      if (packed) {
        obj.calc1.textContent = `${this.formatCount(numChunks)} chunks in ${this.containerLabels[this.containerSlider?.value || 0]} containers`;
      } else {
        obj.calc1.textContent = `${this.formatGB(uniqueGB)} / ${chunkLabel}`;
      }
      obj.calc2.textContent = '';

      // Storage
      const stor = this.cloudCells['storage'][i];
      stor.value.textContent = this.formatDollars(storageCost);
      stor.calc1.textContent = `${this.formatGB(uniqueGB)} \u00d7 $${p.storagePerGB}/GB`;
      stor.calc2.textContent = p.storageNote;

      // Operations
      const ops = this.cloudCells['operations'][i];
      ops.value.textContent = this.formatDollars(opsCost);
      if (packed) {
        ops.calc1.textContent = `${p.putNote}: ${this.formatCount(actualPuts)} \u00d7 $${p.putPer1K}/1K`;
        ops.calc2.textContent = `${p.getNote}: ${this.formatCount(actualGets)} \u00d7 $${p.getPer1K}/1K`;
      } else {
        ops.calc1.textContent = `${p.putNote}: ${this.formatCount(naivePuts)} \u00d7 $${p.putPer1K}/1K`;
        ops.calc2.textContent = `${p.getNote}: ${this.formatCount(naiveGets)} \u00d7 $${p.getPer1K}/1K`;
      }

      // Highlight operations row when packing is on
      if (ops.td) {
        ops.td.style.color = packed ? '#2d7a4f' : '';
      }

      // Egress
      const egr = this.cloudCells['egress'][i];
      egr.value.textContent = this.formatDollars(egressCost);
      egr.calc1.textContent = `${this.formatGB(this.monthlyEgressGB)} \u00d7 $${p.egressPerGB}/GB`;
      egr.calc2.textContent = p.egressNote;

      // Total
      const tot = this.cloudCells['total'][i];
      tot.value.textContent = this.formatDollars(totalCost);
      tot.calc1.textContent = '';
      tot.calc2.textContent = '';

      // Savings (not present in naive mode)
      if (this.cloudCells['savings']) {
        const sav = this.cloudCells['savings'][i];
        const savings = naiveTotal - totalCost;
        if (packed && savings > 0) {
          sav.value.textContent = `${this.formatDollars(savings)}/mo`;
          const pctSaved = ((savings / naiveTotal) * 100).toFixed(1);
          sav.calc1.textContent = `${pctSaved}% reduction`;
          sav.calc2.textContent = `vs. ${this.formatDollars(naiveTotal)} naive`;
          sav.td.style.color = '#2d7a4f';
        } else {
          sav.value.textContent = packed ? '$0' : '\u2014';
          sav.calc1.textContent = packed ? 'no savings at this chunk size' : 'enable packing to compare';
          sav.calc2.textContent = '';
          sav.td.style.color = '';
        }
      }
    }
  }

  update() {
    const sliderValue = parseInt(this.chunkSlider.value);
    const t = sliderValue / 100;
    const chunkKB = this.sliderToKB(sliderValue);
    const packed = this.packingToggle?.checked || false;
    const containerIdx = parseInt(this.containerSlider?.value || 0);
    const containerSizeKB = this.containerSizes[containerIdx];

    this.chunkValueEl.textContent = this.formatSize(chunkKB);
    if (this.containerValueEl) {
      this.containerValueEl.textContent = this.containerLabels[containerIdx];
    }

    this.updateCloudCosts(t, chunkKB, packed, containerSizeKB);
  }
}

// =============================================================================
// Newcomer Cloud Cost Explorer (R2, B2, Wasabi, Tigris)
// =============================================================================

class NewcomerCostDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Same workload assumptions
    this.numUsers = 100_000_000;
    this.totalDataGB = 1_048_576;
    this.monthlyDocReads = 1_000_000_000;
    this.avgReadMB = 1;
    this.editsPerUserMonth = 50;
    this.avgEditMB = 10;

    this.monthlyEgressGB = (this.monthlyDocReads * this.avgReadMB) / 1024;
    this.grossChurnGB = (this.numUsers * this.editsPerUserMonth * this.avgEditMB) / 1024;

    this.providers = [
      {
        name: 'Cloudflare R2',
        storagePerGB: 0.015,
        storageNote: 'Standard',
        putPer1K: 0.0045,           // $4.50/million Class A
        putNote: 'Class A ops',
        getPer1K: 0.00036,          // $0.36/million Class B
        getNote: 'Class B ops',
        egressPerGB: 0,             // Zero egress
        egressNote: 'Free egress'
      },
      {
        name: 'Backblaze B2',
        storagePerGB: 0.005,
        storageNote: 'Pay-as-you-go',
        putPer1K: 0,               // Free uploads
        putNote: 'Upload ops',
        getPer1K: 0.0004,          // $0.004/10K download calls
        getNote: 'Download ops',
        egressPerGB: 0.01,         // $0.01/GB (free up to 3x storage)
        egressNote: '$0 up to 3x storage'
      },
      {
        name: 'Wasabi',
        storagePerGB: 0.0069,
        storageNote: '1 TB minimum',
        putPer1K: 0,               // Free API operations
        putNote: 'Write ops',
        getPer1K: 0,               // Free API operations
        getNote: 'Read ops',
        egressPerGB: 0,            // Free egress (up to storage volume)
        egressNote: 'Free (up to storage vol.)'
      },
      {
        name: 'Tigris',
        storagePerGB: 0.02,        // Standard tier
        storageNote: 'Standard, global cache',
        putPer1K: 0.005,           // $0.005/1K Class A
        putNote: 'Class A ops',
        getPer1K: 0.0005,          // $0.0005/1K Class B
        getNote: 'Class B ops',
        egressPerGB: 0,            // Zero egress
        egressNote: 'Free egress + built-in CDN'
      }
    ];

    this.containerSizes = [4096, 16384, 65536];
    this.containerLabels = ['4 MB', '16 MB', '64 MB'];

    this.init();
  }

  init() {
    this.chunkSlider = document.getElementById('newcomer-cost-chunk-slider');
    this.chunkValueEl = document.getElementById('newcomer-cost-chunk-value');
    this.packingToggle = document.getElementById('newcomer-cost-packing-toggle');
    this.containerSlider = document.getElementById('newcomer-cost-container-slider');
    this.containerValueEl = document.getElementById('newcomer-cost-container-value');
    this.cloudSection = document.getElementById('newcomer-cost-cloud-section');

    this.buildCloudTable();
    this.chunkSlider?.addEventListener('input', () => this.update());
    this.packingToggle?.addEventListener('change', () => this.onToggle());
    this.containerSlider?.addEventListener('input', () => this.update());
    this.update();
  }

  sliderToKB(value) { return Math.pow(2, value / 10); }

  formatSize(kb) {
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
    if (kb >= 10) return `${Math.round(kb)} KB`;
    return `${kb.toFixed(1)} KB`;
  }

  formatDollars(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    if (amount >= 100) return `$${amount.toFixed(0)}`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    return `$${amount.toFixed(3)}`;
  }

  formatCount(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }

  formatGB(gb) {
    if (gb >= 1_048_576) return `${(gb / 1_048_576).toFixed(1)} PB`;
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
    if (gb >= 1) return `${Math.round(gb)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  }

  dedupRatio(t) { return 1.2 + 3.8 * Math.pow(1 - t, 0.7); }

  buildCloudTable() {
    if (!this.cloudSection) return;
    clearElement(this.cloudSection);

    const header = document.createElement('div');
    header.className = 'cost-cloud-header';
    const title = document.createElement('span');
    title.className = 'cost-cloud-title';
    title.textContent = 'Estimated Monthly Cloud Costs';
    this.workloadEl = document.createElement('span');
    this.workloadEl.className = 'cost-cloud-workload';
    header.appendChild(title);
    header.appendChild(this.workloadEl);
    this.cloudSection.appendChild(header);

    const table = document.createElement('table');
    table.className = 'cost-cloud-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th'));
    const providerSubtitles = ['Standard', 'Pay-as-you-go', 'S3-compatible', 'Global cache + S3'];
    for (let i = 0; i < this.providers.length; i++) {
      const th = document.createElement('th');
      th.textContent = this.providers[i].name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = providerSubtitles[i];
      th.appendChild(sub);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const rowDefs = [
      { label: 'Objects stored', key: 'objects' },
      { label: 'Storage', key: 'storage' },
      { label: 'Operations (PUT + GET)', key: 'operations' },
      { label: 'Network egress', key: 'egress' },
      { label: 'Monthly total', key: 'total' },
      { label: 'Savings vs. naive', key: 'savings' }
    ];

    this.cloudCells = {};
    for (const rowDef of rowDefs) {
      const tr = document.createElement('tr');
      if (rowDef.key === 'savings') tr.className = 'container-savings-row';
      const th = document.createElement('td');
      th.textContent = rowDef.label;
      tr.appendChild(th);

      this.cloudCells[rowDef.key] = [];
      for (let i = 0; i < this.providers.length; i++) {
        const td = document.createElement('td');
        const value = document.createElement('span');
        value.className = 'cost-cell-value';
        const calc1 = document.createElement('span');
        calc1.className = 'cost-cell-calc';
        const calc2 = document.createElement('span');
        calc2.className = 'cost-cell-calc';
        td.appendChild(value);
        td.appendChild(calc1);
        td.appendChild(calc2);
        tr.appendChild(td);
        this.cloudCells[rowDef.key].push({ value, calc1, calc2, td });
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.cloudSection.appendChild(table);

    // Pricing reference
    const details = document.createElement('details');
    details.className = 'cost-pricing-ref';
    const summary = document.createElement('summary');
    summary.textContent = 'Per-unit pricing rates used in these calculations';
    details.appendChild(summary);

    const refTable = document.createElement('table');
    refTable.className = 'cost-cloud-table cost-ref-table';
    const refThead = document.createElement('thead');
    const refHeadRow = document.createElement('tr');
    refHeadRow.appendChild(document.createElement('th'));
    for (let i = 0; i < this.providers.length; i++) {
      const th = document.createElement('th');
      th.textContent = this.providers[i].name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = providerSubtitles[i];
      th.appendChild(sub);
      refHeadRow.appendChild(th);
    }
    refThead.appendChild(refHeadRow);
    refTable.appendChild(refThead);

    const refTbody = document.createElement('tbody');
    const refRows = [
      { label: 'Storage', values: ['$0.015/GB', '$0.005/GB', '$0.0069/GB', '$0.02/GB'], notes: ['Standard', 'Pay-as-you-go', '1 TB minimum', 'Standard'] },
      { label: 'Write ops', values: ['$0.0045/1K', '$0/1K', '$0/1K', '$0.005/1K'], notes: ['Class A ops', 'Free uploads', 'No per-op charge', 'Class A ops'] },
      { label: 'Read ops', values: ['$0.00036/1K', '$0.0004/1K', '$0/1K', '$0.0005/1K'], notes: ['Class B ops', '$0.004/10K downloads', 'No per-op charge', 'Class B ops'] },
      { label: 'Egress', values: ['$0/GB', '$0.01/GB', '$0/GB', '$0/GB'], notes: ['Free egress', 'Free up to 3x storage', 'Free (up to storage vol.)', 'Free + built-in CDN'] }
    ];
    for (const row of refRows) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;
      tr.appendChild(tdLabel);
      for (let i = 0; i < row.values.length; i++) {
        const td = document.createElement('td');
        td.textContent = row.values[i];
        const note = document.createElement('span');
        note.className = 'cost-cell-calc';
        note.textContent = row.notes[i];
        td.appendChild(note);
        tr.appendChild(td);
      }
      refTbody.appendChild(tr);
    }
    refTable.appendChild(refTbody);
    details.appendChild(refTable);
    this.cloudSection.appendChild(details);

    const assumptions = document.createElement('div');
    assumptions.className = 'cost-cloud-assumptions';
    assumptions.textContent = 'Same workload assumptions as the Container Cost Explorer above. Wasabi has a 1 TB minimum charge and 90-day minimum storage duration. Backblaze B2 egress is free up to 3x your storage volume. Tigris includes built-in global edge caching at no extra cost. Pricing as of Feb 2026.';
    this.cloudSection.appendChild(assumptions);
  }

  onToggle() {
    const packed = this.packingToggle?.checked;
    if (this.containerSlider) this.containerSlider.disabled = !packed;
    this.update();
  }

  updateCloudCosts(t, chunkKB, packed, containerSizeKB) {
    const dedup = this.dedupRatio(t);
    const uniqueGB = this.totalDataGB / dedup;
    const chunkBytes = chunkKB * 1024;
    const numChunks = (uniqueGB * 1024 * 1024 * 1024) / chunkBytes;

    const naivePuts = (this.grossChurnGB * 1024 * 1024 * 1024) / chunkBytes;
    const naiveGets = (this.monthlyEgressGB * 1024 * 1024 * 1024) / chunkBytes;

    const chunksPerContainer = packed ? Math.max(1, containerSizeKB / chunkKB) : 1;
    const numObjects = packed ? Math.ceil(numChunks / chunksPerContainer) : numChunks;
    const actualPuts = packed ? naivePuts / chunksPerContainer : naivePuts;
    const actualGets = packed ? naiveGets / chunksPerContainer : naiveGets;

    if (this.workloadEl) {
      const objLabel = packed ? 'containers' : 'objects';
      this.workloadEl.textContent =
        `${this.formatCount(numObjects)} ${objLabel} | ${this.formatGB(uniqueGB)} stored | ${dedup.toFixed(1)}x dedup`;
    }

    const naiveTotals = [];

    for (let i = 0; i < this.providers.length; i++) {
      const p = this.providers[i];

      const storageCost = uniqueGB * p.storagePerGB;
      const putCost = (actualPuts / 1000) * p.putPer1K;
      const getCost = (actualGets / 1000) * p.getPer1K;
      const opsCost = putCost + getCost;
      const egressCost = this.monthlyEgressGB * p.egressPerGB;
      const totalCost = storageCost + opsCost + egressCost;

      const naivePutCost = (naivePuts / 1000) * p.putPer1K;
      const naiveGetCost = (naiveGets / 1000) * p.getPer1K;
      const naiveOpsCost = naivePutCost + naiveGetCost;
      const naiveTotal = storageCost + naiveOpsCost + egressCost;
      naiveTotals.push(naiveTotal);

      const chunkLabel = this.formatSize(chunkKB);

      // Objects
      const obj = this.cloudCells['objects'][i];
      obj.value.textContent = this.formatCount(numObjects);
      if (packed) {
        obj.calc1.textContent = `${this.formatCount(numChunks)} chunks in ${this.containerLabels[this.containerSlider?.value || 0]} containers`;
      } else {
        obj.calc1.textContent = `${this.formatGB(uniqueGB)} / ${chunkLabel}`;
      }
      obj.calc2.textContent = '';

      // Storage
      const stor = this.cloudCells['storage'][i];
      stor.value.textContent = this.formatDollars(storageCost);
      stor.calc1.textContent = `${this.formatGB(uniqueGB)} \u00d7 $${p.storagePerGB}/GB`;
      stor.calc2.textContent = p.storageNote;

      // Operations
      const ops = this.cloudCells['operations'][i];
      ops.value.textContent = this.formatDollars(opsCost);
      if (p.putPer1K === 0 && p.getPer1K === 0) {
        const totalOps = packed ? actualPuts + actualGets : naivePuts + naiveGets;
        ops.calc1.textContent = `${this.formatCount(totalOps)} ops`;
        ops.calc2.textContent = 'No per-operation charges';
      } else if (p.putPer1K === 0) {
        ops.calc1.textContent = `${p.putNote}: free`;
        ops.calc2.textContent = `${p.getNote}: ${this.formatCount(packed ? actualGets : naiveGets)} \u00d7 $${p.getPer1K}/1K`;
      } else if (packed) {
        ops.calc1.textContent = `${p.putNote}: ${this.formatCount(actualPuts)} \u00d7 $${p.putPer1K}/1K`;
        ops.calc2.textContent = `${p.getNote}: ${this.formatCount(actualGets)} \u00d7 $${p.getPer1K}/1K`;
      } else {
        ops.calc1.textContent = `${p.putNote}: ${this.formatCount(naivePuts)} \u00d7 $${p.putPer1K}/1K`;
        ops.calc2.textContent = `${p.getNote}: ${this.formatCount(naiveGets)} \u00d7 $${p.getPer1K}/1K`;
      }

      if (ops.td) {
        const noOps = p.putPer1K === 0 && p.getPer1K === 0;
        ops.td.style.color = (packed || noOps) ? '#2d7a4f' : '';
      }

      // Egress
      const egr = this.cloudCells['egress'][i];
      egr.value.textContent = p.egressPerGB === 0 ? '$0' : this.formatDollars(egressCost);
      if (p.egressPerGB === 0) {
        egr.calc1.textContent = `${this.formatGB(this.monthlyEgressGB)} transferred`;
        egr.calc2.textContent = p.egressNote;
      } else {
        egr.calc1.textContent = `${this.formatGB(this.monthlyEgressGB)} \u00d7 $${p.egressPerGB}/GB`;
        egr.calc2.textContent = p.egressNote;
      }

      // Total
      const tot = this.cloudCells['total'][i];
      tot.value.textContent = this.formatDollars(totalCost);
      tot.calc1.textContent = '';
      tot.calc2.textContent = '';

      // Savings
      const sav = this.cloudCells['savings'][i];
      const savings = naiveTotal - totalCost;
      if (packed && savings > 0) {
        sav.value.textContent = `${this.formatDollars(savings)}/mo`;
        const pctSaved = ((savings / naiveTotal) * 100).toFixed(1);
        sav.calc1.textContent = `${pctSaved}% reduction`;
        sav.calc2.textContent = `vs. ${this.formatDollars(naiveTotal)} naive`;
        sav.td.style.color = '#2d7a4f';
      } else {
        sav.value.textContent = packed ? '$0' : '\u2014';
        const noOps = p.putPer1K === 0 && p.getPer1K === 0;
        sav.calc1.textContent = packed ? (noOps ? 'no per-op charges to save on' : 'no savings at this chunk size') : 'enable packing to compare';
        sav.calc2.textContent = '';
        sav.td.style.color = '';
      }
    }
  }

  update() {
    const sliderValue = parseInt(this.chunkSlider.value);
    const t = sliderValue / 100;
    const chunkKB = this.sliderToKB(sliderValue);
    const packed = this.packingToggle?.checked || false;
    const containerIdx = parseInt(this.containerSlider?.value || 0);
    const containerSizeKB = this.containerSizes[containerIdx];

    this.chunkValueEl.textContent = this.formatSize(chunkKB);
    if (this.containerValueEl) {
      this.containerValueEl.textContent = this.containerLabels[containerIdx];
    }

    this.updateCloudCosts(t, chunkKB, packed, containerSizeKB);
  }
}

// =============================================================================
// Jazz Cloud Cost Explorer
// =============================================================================

class JazzCostDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Same workload assumptions as CostTradeoffsDemo / ContainerCostDemo
    this.numUsers = 100_000_000;
    this.totalDataGB = 1_048_576;
    this.monthlyDocReads = 1_000_000_000;
    this.avgReadMB = 1;
    this.editsPerUserMonth = 50;
    this.avgEditMB = 10;

    this.monthlyEgressGB = (this.monthlyDocReads * this.avgReadMB) / 1024;
    this.grossChurnGB = (this.numUsers * this.editsPerUserMonth * this.avgEditMB) / 1024;

    this.provider = {
      name: 'Jazz Cloud',
      storagePerGB: 0.02,
      storageNote: 'Pro tier',
      putPer1K: 0,
      putNote: 'Write ops',
      getPer1K: 0,
      getNote: 'Read ops',
      egressPerGB: 0.10,
      egressNote: 'Blob egress'
    };

    this.init();
  }

  init() {
    this.chunkSlider = document.getElementById('jazz-cost-chunk-slider');
    this.chunkValueEl = document.getElementById('jazz-cost-chunk-value');
    this.cloudSection = document.getElementById('jazz-cost-cloud-section');

    this.buildCloudTable();
    this.chunkSlider?.addEventListener('input', () => this.update());
    this.update();
  }

  sliderToKB(value) {
    return Math.pow(2, value / 10);
  }

  formatSize(kb) {
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
    if (kb >= 10) return `${Math.round(kb)} KB`;
    return `${kb.toFixed(1)} KB`;
  }

  formatDollars(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    if (amount >= 100) return `$${amount.toFixed(0)}`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    return `$${amount.toFixed(3)}`;
  }

  formatCount(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }

  formatGB(gb) {
    if (gb >= 1_048_576) return `${(gb / 1_048_576).toFixed(1)} PB`;
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
    if (gb >= 1) return `${Math.round(gb)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  }

  dedupRatio(t) {
    return 1.2 + 3.8 * Math.pow(1 - t, 0.7);
  }

  buildCloudTable() {
    if (!this.cloudSection) return;
    clearElement(this.cloudSection);

    // Header
    const header = document.createElement('div');
    header.className = 'cost-cloud-header';
    const title = document.createElement('span');
    title.className = 'cost-cloud-title';
    title.textContent = 'Estimated Monthly Cloud Costs';
    this.workloadEl = document.createElement('span');
    this.workloadEl.className = 'cost-cloud-workload';
    header.appendChild(title);
    header.appendChild(this.workloadEl);
    this.cloudSection.appendChild(header);

    // Table
    const table = document.createElement('table');
    table.className = 'cost-cloud-table jazz-cost-table';

    // Thead
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
    headRow.appendChild(emptyTh);
    const th = document.createElement('th');
    th.textContent = this.provider.name;
    const sub = document.createElement('span');
    sub.className = 'cost-cell-calc';
    sub.textContent = this.provider.storageNote;
    th.appendChild(sub);
    headRow.appendChild(th);
    thead.appendChild(headRow);
    table.appendChild(thead);

    // Tbody
    const tbody = document.createElement('tbody');
    const rowDefs = [
      { label: 'Objects stored', key: 'objects' },
      { label: 'Storage', key: 'storage' },
      { label: 'Operations (PUT + GET)', key: 'operations' },
      { label: 'Network egress', key: 'egress' },
      { label: 'Monthly total', key: 'total' }
    ];

    this.cloudCells = {};
    for (const rowDef of rowDefs) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = rowDef.label;
      tr.appendChild(tdLabel);

      const td = document.createElement('td');
      const value = document.createElement('span');
      value.className = 'cost-cell-value';
      const calc1 = document.createElement('span');
      calc1.className = 'cost-cell-calc';
      const calc2 = document.createElement('span');
      calc2.className = 'cost-cell-calc';
      td.appendChild(value);
      td.appendChild(calc1);
      td.appendChild(calc2);
      tr.appendChild(td);
      this.cloudCells[rowDef.key] = { value, calc1, calc2, td };

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.cloudSection.appendChild(table);

    // Pricing reference
    const details = document.createElement('details');
    details.className = 'cost-pricing-ref';
    const summary = document.createElement('summary');
    summary.textContent = 'Per-unit pricing rates used in these calculations';
    details.appendChild(summary);

    const refTable = document.createElement('table');
    refTable.className = 'cost-cloud-table cost-ref-table jazz-cost-table';
    const refThead = document.createElement('thead');
    const refHeadRow = document.createElement('tr');
    refHeadRow.appendChild(document.createElement('th'));
    const refTh = document.createElement('th');
    refTh.textContent = this.provider.name;
    const refSub = document.createElement('span');
    refSub.className = 'cost-cell-calc';
    refSub.textContent = this.provider.storageNote;
    refTh.appendChild(refSub);
    refHeadRow.appendChild(refTh);
    refThead.appendChild(refHeadRow);
    refTable.appendChild(refThead);

    const refTbody = document.createElement('tbody');
    const refRows = [
      { label: 'Storage', value: '$0.02/GB', note: 'Pro tier' },
      { label: 'Write ops', value: '$0/1K', note: 'No per-operation charge' },
      { label: 'Read ops', value: '$0/1K', note: 'No per-operation charge' },
      { label: 'Egress', value: '$0.10/GB', note: 'Blob egress' }
    ];
    for (const row of refRows) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;
      tr.appendChild(tdLabel);
      const td = document.createElement('td');
      td.textContent = row.value;
      const note = document.createElement('span');
      note.className = 'cost-cell-calc';
      note.textContent = row.note;
      td.appendChild(note);
      tr.appendChild(td);
      refTbody.appendChild(tr);
    }
    refTable.appendChild(refTbody);
    details.appendChild(refTable);
    this.cloudSection.appendChild(details);

    // Assumptions
    const assumptions = document.createElement('div');
    assumptions.className = 'cost-cloud-assumptions';
    assumptions.textContent = 'Same workload assumptions as the Container Cost Explorer above. Jazz Cloud Pro tier pricing as of Feb 2026.';
    this.cloudSection.appendChild(assumptions);
  }

  updateCloudCosts(t, chunkKB) {
    const p = this.provider;
    const dedup = this.dedupRatio(t);
    const uniqueGB = this.totalDataGB / dedup;
    const chunkBytes = chunkKB * 1024;
    const numObjects = (uniqueGB * 1024 * 1024 * 1024) / chunkBytes;

    const monthlyPuts = (this.grossChurnGB * 1024 * 1024 * 1024) / chunkBytes;
    const monthlyGets = (this.monthlyEgressGB * 1024 * 1024 * 1024) / chunkBytes;

    // Workload summary
    if (this.workloadEl) {
      this.workloadEl.textContent =
        `${this.formatCount(numObjects)} objects | ${this.formatGB(uniqueGB)} stored | ${dedup.toFixed(1)}x dedup`;
    }

    const chunkLabel = this.formatSize(chunkKB);

    const storageCost = uniqueGB * p.storagePerGB;
    const putCost = (monthlyPuts / 1000) * p.putPer1K;
    const getCost = (monthlyGets / 1000) * p.getPer1K;
    const opsCost = putCost + getCost;
    const egressCost = this.monthlyEgressGB * p.egressPerGB;
    const totalCost = storageCost + opsCost + egressCost;

    // Objects stored
    const obj = this.cloudCells['objects'];
    obj.value.textContent = this.formatCount(numObjects);
    obj.calc1.textContent = `${this.formatGB(uniqueGB)} / ${chunkLabel}`;
    obj.calc2.textContent = '';

    // Storage
    const stor = this.cloudCells['storage'];
    stor.value.textContent = this.formatDollars(storageCost);
    stor.calc1.textContent = `${this.formatGB(uniqueGB)} \u00d7 $${p.storagePerGB}/GB`;
    stor.calc2.textContent = p.storageNote;

    // Operations
    const ops = this.cloudCells['operations'];
    ops.value.textContent = '$0';
    ops.calc1.textContent = `${this.formatCount(monthlyPuts)} PUTs + ${this.formatCount(monthlyGets)} GETs`;
    ops.calc2.textContent = 'No per-operation charges';

    // Egress
    const egr = this.cloudCells['egress'];
    egr.value.textContent = this.formatDollars(egressCost);
    egr.calc1.textContent = `${this.formatGB(this.monthlyEgressGB)} \u00d7 $${p.egressPerGB}/GB`;
    egr.calc2.textContent = p.egressNote;

    // Total
    const tot = this.cloudCells['total'];
    tot.value.textContent = this.formatDollars(totalCost);
    tot.calc1.textContent = '';
    tot.calc2.textContent = '';
  }

  update() {
    const sliderValue = parseInt(this.chunkSlider.value);
    const t = sliderValue / 100;
    const chunkKB = this.sliderToKB(sliderValue);

    this.chunkValueEl.textContent = this.formatSize(chunkKB);
    this.updateCloudCosts(t, chunkKB);
  }
}

// =============================================================================
// Traditional Cache Providers (ElastiCache, CloudFront)
// =============================================================================

class CacheTraditionalDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Same workload assumptions
    this.numUsers = 100_000_000;
    this.totalDataGB = 1_048_576;
    this.monthlyDocReads = 1_000_000_000;
    this.avgReadMB = 1;
    this.editsPerUserMonth = 50;
    this.avgEditMB = 10;

    this.monthlyEgressGB = (this.monthlyDocReads * this.avgReadMB) / 1024;
    this.grossChurnGB = (this.numUsers * this.editsPerUserMonth * this.avgEditMB) / 1024;

    this.providers = [
      {
        name: 'ElastiCache Redis',
        model: 'provisioned',
        cachePerGB: 14,             // ~$14/GB/month (cache.r7g.large at scale)
        cacheNote: 'cache.r7g.large',
        readPer1K: 0,               // included in provisioned cost
        writePer1K: 0,
        storagePerGB: 0
      },
      {
        name: 'CloudFront CDN',
        model: 'cdn',
        egressPerGB: 0.085,         // $0.085/GB to client
        requestPer1K: 0.001,        // $0.001/1K HTTPS requests
        cacheNote: 'HTTPS, US/EU',
        readPer1K: 0,
        writePer1K: 0,
        storagePerGB: 0,
        cachePerGB: 0
      }
    ];

    this.init();
  }

  init() {
    this.hitRateSlider = document.getElementById('cache-traditional-hit-slider');
    this.hitRateValueEl = document.getElementById('cache-traditional-hit-value');
    this.cloudSection = document.getElementById('cache-traditional-section');

    this.buildCloudTable();
    this.hitRateSlider?.addEventListener('input', () => this.update());
    this.update();
  }

  formatDollars(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    if (amount >= 100) return `$${amount.toFixed(0)}`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    return `$${amount.toFixed(3)}`;
  }

  formatCount(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }

  formatGB(gb) {
    if (gb >= 1_048_576) return `${(gb / 1_048_576).toFixed(1)} PB`;
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
    if (gb >= 1) return `${Math.round(gb)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  }

  // Zipf cache sizing (Breslau et al.): cache fraction = hitRate^(1/(1-α)), α ≈ 0.6
  cacheSizeGB(uniqueGB, hitRate) {
    if (hitRate <= 0) return 0;
    return uniqueGB * Math.pow(hitRate, 2.5);
  }

  buildCloudTable() {
    if (!this.cloudSection) return;
    clearElement(this.cloudSection);

    const header = document.createElement('div');
    header.className = 'cost-cloud-header';
    const title = document.createElement('span');
    title.className = 'cost-cloud-title';
    title.textContent = 'Estimated Monthly Cache Impact';
    this.workloadEl = document.createElement('span');
    this.workloadEl.className = 'cost-cloud-workload';
    header.appendChild(title);
    header.appendChild(this.workloadEl);
    this.cloudSection.appendChild(header);

    const table = document.createElement('table');
    table.className = 'cost-cloud-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th'));
    const providerSubtitles = ['Provisioned memory', 'Edge CDN'];
    for (let i = 0; i < this.providers.length; i++) {
      const th = document.createElement('th');
      th.textContent = this.providers[i].name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = providerSubtitles[i];
      th.appendChild(sub);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const rowDefs = [
      { label: 'Cache capacity needed', key: 'capacity' },
      { label: 'Monthly cache cost', key: 'cacheCost' },
      { label: 'Origin GET savings', key: 'getSavings' },
      { label: 'Origin egress savings', key: 'egressSavings' },
      { label: 'Net monthly impact', key: 'netImpact' }
    ];

    this.cloudCells = {};
    for (const rowDef of rowDefs) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = rowDef.label;
      tr.appendChild(tdLabel);

      this.cloudCells[rowDef.key] = [];
      for (let i = 0; i < this.providers.length; i++) {
        const td = document.createElement('td');
        const value = document.createElement('span');
        value.className = 'cost-cell-value';
        const calc1 = document.createElement('span');
        calc1.className = 'cost-cell-calc';
        const calc2 = document.createElement('span');
        calc2.className = 'cost-cell-calc';
        td.appendChild(value);
        td.appendChild(calc1);
        td.appendChild(calc2);
        tr.appendChild(td);
        this.cloudCells[rowDef.key].push({ value, calc1, calc2, td });
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.cloudSection.appendChild(table);

    // Pricing reference
    const details = document.createElement('details');
    details.className = 'cost-pricing-ref';
    const summary = document.createElement('summary');
    summary.textContent = 'Per-unit pricing rates used in these calculations';
    details.appendChild(summary);

    const refTable = document.createElement('table');
    refTable.className = 'cost-cloud-table cost-ref-table';
    const refThead = document.createElement('thead');
    const refHeadRow = document.createElement('tr');
    refHeadRow.appendChild(document.createElement('th'));
    for (let i = 0; i < this.providers.length; i++) {
      const th = document.createElement('th');
      th.textContent = this.providers[i].name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = providerSubtitles[i];
      th.appendChild(sub);
      refHeadRow.appendChild(th);
    }
    refThead.appendChild(refHeadRow);
    refTable.appendChild(refThead);

    const refTbody = document.createElement('tbody');
    const refRows = [
      { label: 'Cache memory', values: ['$14/GB/mo', 'N/A'], notes: ['cache.r7g.large at scale', 'Edge cache, no provisioning'] },
      { label: 'Client egress', values: ['N/A', '$0.085/GB'], notes: ['Served from origin', 'HTTPS, US/EU'] },
      { label: 'Requests', values: ['Included', '$0.001/1K'], notes: ['In provisioned cost', 'HTTPS requests'] }
    ];
    for (const row of refRows) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;
      tr.appendChild(tdLabel);
      for (let i = 0; i < row.values.length; i++) {
        const td = document.createElement('td');
        td.textContent = row.values[i];
        const note = document.createElement('span');
        note.className = 'cost-cell-calc';
        note.textContent = row.notes[i];
        td.appendChild(note);
        tr.appendChild(td);
      }
      refTbody.appendChild(tr);
    }
    refTable.appendChild(refTbody);
    details.appendChild(refTable);
    this.cloudSection.appendChild(details);

    const assumptions = document.createElement('div');
    assumptions.className = 'cost-cloud-assumptions';
    assumptions.textContent = 'Same workload assumptions as the storage cost explorers above. Cache sizing derived from Zipf access distribution (\u03b1 \u2248 0.6, per Breslau et al. INFOCOM \'99): cache fraction = hitRate^2.5. Origin savings assume AWS S3 as the storage backend ($0.0004/1K GETs, $0.09/GB egress). Pricing as of Feb 2026.';
    this.cloudSection.appendChild(assumptions);
  }

  update() {
    const hitRate = parseInt(this.hitRateSlider.value) / 100;
    if (this.hitRateValueEl) {
      this.hitRateValueEl.textContent = `${Math.round(hitRate * 100)}%`;
    }

    // Use a mid-range dedup for cache demos (chunk size doesn't matter for cache cost)
    const uniqueGB = this.totalDataGB / 3;
    const cacheGB = this.cacheSizeGB(uniqueGB, hitRate);

    // Monthly reads and egress
    const monthlyReads = this.monthlyDocReads;
    const cachedReads = monthlyReads * hitRate;
    const missReads = monthlyReads * (1 - hitRate);

    // Origin savings (assuming S3 as backend)
    const originGetSavings = (cachedReads / 1000) * 0.0004;   // S3 GET rate
    const originEgressSavings = (this.monthlyEgressGB * hitRate) * 0.09;  // S3 egress rate

    if (this.workloadEl) {
      this.workloadEl.textContent =
        `${this.formatGB(cacheGB)} cached | ${Math.round(hitRate * 100)}% hit rate | ${this.formatCount(cachedReads)} cache hits/mo`;
    }

    for (let i = 0; i < this.providers.length; i++) {
      const p = this.providers[i];

      let cacheCost = 0;
      let capacityLabel = '';
      let costCalc1 = '';
      let costCalc2 = '';

      if (p.model === 'provisioned') {
        // ElastiCache: pay for provisioned memory
        cacheCost = cacheGB * p.cachePerGB;
        capacityLabel = this.formatGB(cacheGB);
        costCalc1 = `${this.formatGB(cacheGB)} \u00d7 $${p.cachePerGB}/GB/mo`;
        costCalc2 = p.cacheNote;
      } else if (p.model === 'cdn') {
        // CloudFront: pay for egress to client + requests
        const cfEgress = (this.monthlyEgressGB * hitRate) * p.egressPerGB;
        const cfRequests = (cachedReads / 1000) * p.requestPer1K;
        cacheCost = cfEgress + cfRequests;
        capacityLabel = 'Edge (auto-scaled)';
        costCalc1 = `${this.formatGB(this.monthlyEgressGB * hitRate)} egress \u00d7 $${p.egressPerGB}/GB`;
        costCalc2 = `${this.formatCount(cachedReads)} reqs \u00d7 $${p.requestPer1K}/1K`;
      }

      const netImpact = cacheCost - originGetSavings - originEgressSavings;

      // Capacity
      const cap = this.cloudCells['capacity'][i];
      cap.value.textContent = capacityLabel;
      if (p.model === 'provisioned') {
        const pct = hitRate > 0 ? ((cacheGB / uniqueGB) * 100).toFixed(1) : '0';
        cap.calc1.textContent = `${pct}% of unique data`;
      } else {
        cap.calc1.textContent = 'No provisioning required';
      }
      cap.calc2.textContent = '';

      // Cache cost
      const cc = this.cloudCells['cacheCost'][i];
      cc.value.textContent = this.formatDollars(cacheCost);
      cc.calc1.textContent = costCalc1;
      cc.calc2.textContent = costCalc2;

      // Origin GET savings
      const gs = this.cloudCells['getSavings'][i];
      gs.value.textContent = originGetSavings > 0 ? `-${this.formatDollars(originGetSavings)}` : '$0';
      gs.calc1.textContent = `${this.formatCount(cachedReads)} fewer GETs`;
      gs.calc2.textContent = 'at S3 $0.0004/1K';
      gs.td.style.color = originGetSavings > 0 ? '#2d7a4f' : '';

      // Origin egress savings
      const es = this.cloudCells['egressSavings'][i];
      es.value.textContent = originEgressSavings > 0 ? `-${this.formatDollars(originEgressSavings)}` : '$0';
      es.calc1.textContent = `${this.formatGB(this.monthlyEgressGB * hitRate)} fewer from origin`;
      es.calc2.textContent = 'at S3 $0.09/GB';
      es.td.style.color = originEgressSavings > 0 ? '#2d7a4f' : '';

      // Net impact
      const ni = this.cloudCells['netImpact'][i];
      ni.value.textContent = (netImpact >= 0 ? '+' : '') + this.formatDollars(Math.abs(netImpact));
      if (netImpact < 0) {
        ni.value.textContent = `-${this.formatDollars(Math.abs(netImpact))}`;
        ni.td.style.color = '#2d7a4f';
      } else {
        ni.value.textContent = `+${this.formatDollars(netImpact)}`;
        ni.td.style.color = '#c45a3b';
      }
      ni.calc1.textContent = netImpact < 0 ? 'net savings' : 'net added cost';
      ni.calc2.textContent = '';
    }
  }
}

// =============================================================================
// Newcomer Cache Providers (Upstash, Momento, Workers KV)
// =============================================================================

class CacheNewcomerDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Same workload assumptions
    this.numUsers = 100_000_000;
    this.totalDataGB = 1_048_576;
    this.monthlyDocReads = 1_000_000_000;
    this.avgReadMB = 1;
    this.editsPerUserMonth = 50;
    this.avgEditMB = 10;

    this.monthlyEgressGB = (this.monthlyDocReads * this.avgReadMB) / 1024;
    this.grossChurnGB = (this.numUsers * this.editsPerUserMonth * this.avgEditMB) / 1024;

    this.providers = [
      {
        name: 'Upstash',
        readPer1K: 0.002,          // $2/million reads
        writePer1K: 0.002,         // $2/million writes
        storagePerGB: 0.25,        // $0.25/GB
        cacheNote: 'Pay-per-request'
      },
      {
        name: 'Momento',
        readPer1K: 0.001,          // $1/million ops
        writePer1K: 0.001,         // $1/million ops
        storagePerGB: 0,           // No storage charge
        cacheNote: 'Per-operation'
      },
      {
        name: 'Workers KV',
        readPer1K: 0.0005,         // $0.50/million reads
        writePer1K: 0.005,         // $5/million writes
        storagePerGB: 0.50,        // $0.50/GB
        cacheNote: 'Edge KV store'
      }
    ];

    this.init();
  }

  init() {
    this.hitRateSlider = document.getElementById('cache-newcomer-hit-slider');
    this.hitRateValueEl = document.getElementById('cache-newcomer-hit-value');
    this.cloudSection = document.getElementById('cache-newcomer-section');

    this.buildCloudTable();
    this.hitRateSlider?.addEventListener('input', () => this.update());
    this.update();
  }

  formatDollars(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    if (amount >= 100) return `$${amount.toFixed(0)}`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    return `$${amount.toFixed(3)}`;
  }

  formatCount(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }

  formatGB(gb) {
    if (gb >= 1_048_576) return `${(gb / 1_048_576).toFixed(1)} PB`;
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
    if (gb >= 1) return `${Math.round(gb)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  }

  cacheSizeGB(uniqueGB, hitRate) {
    if (hitRate <= 0) return 0;
    return uniqueGB * Math.pow(hitRate, 2.5);
  }

  buildCloudTable() {
    if (!this.cloudSection) return;
    clearElement(this.cloudSection);

    const header = document.createElement('div');
    header.className = 'cost-cloud-header';
    const title = document.createElement('span');
    title.className = 'cost-cloud-title';
    title.textContent = 'Estimated Monthly Cache Impact';
    this.workloadEl = document.createElement('span');
    this.workloadEl.className = 'cost-cloud-workload';
    header.appendChild(title);
    header.appendChild(this.workloadEl);
    this.cloudSection.appendChild(header);

    const table = document.createElement('table');
    table.className = 'cost-cloud-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th'));
    const providerSubtitles = ['Pay-per-request', 'Per-operation', 'Edge KV store'];
    for (let i = 0; i < this.providers.length; i++) {
      const th = document.createElement('th');
      th.textContent = this.providers[i].name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = providerSubtitles[i];
      th.appendChild(sub);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const rowDefs = [
      { label: 'Cache capacity needed', key: 'capacity' },
      { label: 'Monthly cache cost', key: 'cacheCost' },
      { label: 'Origin GET savings', key: 'getSavings' },
      { label: 'Origin egress savings', key: 'egressSavings' },
      { label: 'Net monthly impact', key: 'netImpact' }
    ];

    this.cloudCells = {};
    for (const rowDef of rowDefs) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = rowDef.label;
      tr.appendChild(tdLabel);

      this.cloudCells[rowDef.key] = [];
      for (let i = 0; i < this.providers.length; i++) {
        const td = document.createElement('td');
        const value = document.createElement('span');
        value.className = 'cost-cell-value';
        const calc1 = document.createElement('span');
        calc1.className = 'cost-cell-calc';
        const calc2 = document.createElement('span');
        calc2.className = 'cost-cell-calc';
        td.appendChild(value);
        td.appendChild(calc1);
        td.appendChild(calc2);
        tr.appendChild(td);
        this.cloudCells[rowDef.key].push({ value, calc1, calc2, td });
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.cloudSection.appendChild(table);

    // Pricing reference
    const details = document.createElement('details');
    details.className = 'cost-pricing-ref';
    const summary = document.createElement('summary');
    summary.textContent = 'Per-unit pricing rates used in these calculations';
    details.appendChild(summary);

    const refTable = document.createElement('table');
    refTable.className = 'cost-cloud-table cost-ref-table';
    const refThead = document.createElement('thead');
    const refHeadRow = document.createElement('tr');
    refHeadRow.appendChild(document.createElement('th'));
    for (let i = 0; i < this.providers.length; i++) {
      const th = document.createElement('th');
      th.textContent = this.providers[i].name;
      const sub = document.createElement('span');
      sub.className = 'cost-cell-calc';
      sub.textContent = providerSubtitles[i];
      th.appendChild(sub);
      refHeadRow.appendChild(th);
    }
    refThead.appendChild(refHeadRow);
    refTable.appendChild(refThead);

    const refTbody = document.createElement('tbody');
    const refRows = [
      { label: 'Read ops', values: ['$0.002/1K', '$0.001/1K', '$0.0005/1K'], notes: ['$2/million', '$1/million', '$0.50/million'] },
      { label: 'Write ops', values: ['$0.002/1K', '$0.001/1K', '$0.005/1K'], notes: ['$2/million', '$1/million', '$5/million'] },
      { label: 'Storage', values: ['$0.25/GB', '$0/GB', '$0.50/GB'], notes: ['Per GB stored', 'No storage charge', 'Per GB stored'] }
    ];
    for (const row of refRows) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;
      tr.appendChild(tdLabel);
      for (let i = 0; i < row.values.length; i++) {
        const td = document.createElement('td');
        td.textContent = row.values[i];
        const note = document.createElement('span');
        note.className = 'cost-cell-calc';
        note.textContent = row.notes[i];
        td.appendChild(note);
        tr.appendChild(td);
      }
      refTbody.appendChild(tr);
    }
    refTable.appendChild(refTbody);
    details.appendChild(refTable);
    this.cloudSection.appendChild(details);

    const assumptions = document.createElement('div');
    assumptions.className = 'cost-cloud-assumptions';
    assumptions.textContent = 'Same workload assumptions as the storage cost explorers above. Cache sizing derived from Zipf access distribution (\u03b1 \u2248 0.6, per Breslau et al. INFOCOM \'99): cache fraction = hitRate^2.5. Cache writes occur on miss (populating the cache). Origin savings assume AWS S3 as the storage backend. Pricing as of Feb 2026.';
    this.cloudSection.appendChild(assumptions);
  }

  update() {
    const hitRate = parseInt(this.hitRateSlider.value) / 100;
    if (this.hitRateValueEl) {
      this.hitRateValueEl.textContent = `${Math.round(hitRate * 100)}%`;
    }

    const uniqueGB = this.totalDataGB / 3;
    const cacheGB = this.cacheSizeGB(uniqueGB, hitRate);

    const monthlyReads = this.monthlyDocReads;
    const cachedReads = monthlyReads * hitRate;
    const missReads = monthlyReads * (1 - hitRate);

    // Origin savings (assuming S3 as backend)
    const originGetSavings = (cachedReads / 1000) * 0.0004;
    const originEgressSavings = (this.monthlyEgressGB * hitRate) * 0.09;

    if (this.workloadEl) {
      this.workloadEl.textContent =
        `${this.formatGB(cacheGB)} cached | ${Math.round(hitRate * 100)}% hit rate | ${this.formatCount(cachedReads)} cache hits/mo`;
    }

    for (let i = 0; i < this.providers.length; i++) {
      const p = this.providers[i];

      // Per-request model: reads on hit, writes on miss (populating cache)
      const readCost = (cachedReads / 1000) * p.readPer1K;
      const writeCost = (missReads / 1000) * p.writePer1K;
      const storageCost = cacheGB * p.storagePerGB;
      const cacheCost = readCost + writeCost + storageCost;

      const netImpact = cacheCost - originGetSavings - originEgressSavings;

      // Capacity
      const cap = this.cloudCells['capacity'][i];
      cap.value.textContent = this.formatGB(cacheGB);
      const pct = hitRate > 0 ? ((cacheGB / uniqueGB) * 100).toFixed(1) : '0';
      cap.calc1.textContent = `${pct}% of unique data`;
      cap.calc2.textContent = '';

      // Cache cost
      const cc = this.cloudCells['cacheCost'][i];
      cc.value.textContent = this.formatDollars(cacheCost);
      if (p.storagePerGB > 0) {
        cc.calc1.textContent = `reads: ${this.formatDollars(readCost)} + writes: ${this.formatDollars(writeCost)}`;
        cc.calc2.textContent = `storage: ${this.formatDollars(storageCost)}`;
      } else {
        cc.calc1.textContent = `reads: ${this.formatDollars(readCost)} + writes: ${this.formatDollars(writeCost)}`;
        cc.calc2.textContent = 'No storage charge';
      }

      // Origin GET savings
      const gs = this.cloudCells['getSavings'][i];
      gs.value.textContent = originGetSavings > 0 ? `-${this.formatDollars(originGetSavings)}` : '$0';
      gs.calc1.textContent = `${this.formatCount(cachedReads)} fewer GETs`;
      gs.calc2.textContent = 'at S3 $0.0004/1K';
      gs.td.style.color = originGetSavings > 0 ? '#2d7a4f' : '';

      // Origin egress savings
      const es = this.cloudCells['egressSavings'][i];
      es.value.textContent = originEgressSavings > 0 ? `-${this.formatDollars(originEgressSavings)}` : '$0';
      es.calc1.textContent = `${this.formatGB(this.monthlyEgressGB * hitRate)} fewer from origin`;
      es.calc2.textContent = 'at S3 $0.09/GB';
      es.td.style.color = originEgressSavings > 0 ? '#2d7a4f' : '';

      // Net impact
      const ni = this.cloudCells['netImpact'][i];
      if (netImpact < 0) {
        ni.value.textContent = `-${this.formatDollars(Math.abs(netImpact))}`;
        ni.td.style.color = '#2d7a4f';
      } else {
        ni.value.textContent = `+${this.formatDollars(netImpact)}`;
        ni.td.style.color = '#c45a3b';
      }
      ni.calc1.textContent = netImpact < 0 ? 'net savings' : 'net added cost';
      ni.calc2.textContent = '';
    }
  }
}

// =============================================================================
// Comprehensive Cost Model (Storage + Cache combined)
// =============================================================================

class ComprehensiveCostDemo {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Same workload assumptions
    this.numUsers = 100_000_000;
    this.totalDataGB = 1_048_576;
    this.monthlyDocReads = 1_000_000_000;
    this.avgReadMB = 1;
    this.editsPerUserMonth = 50;
    this.avgEditMB = 10;

    this.monthlyEgressGB = (this.monthlyDocReads * this.avgReadMB) / 1024;
    this.grossChurnGB = (this.numUsers * this.editsPerUserMonth * this.avgEditMB) / 1024;

    this.storageProviders = [
      { name: 'AWS S3', storagePerGB: 0.023, putPer1K: 0.005, getPer1K: 0.0004, egressPerGB: 0.09, note: 'Standard, US East' },
      { name: 'GCP', storagePerGB: 0.026, putPer1K: 0.005, getPer1K: 0.0004, egressPerGB: 0.12, note: 'Standard, US multi-region' },
      { name: 'Azure', storagePerGB: 0.018, putPer1K: 0.0065, getPer1K: 0.0005, egressPerGB: 0.087, note: 'Hot (LRS), US East' },
      { name: 'Cloudflare R2', storagePerGB: 0.015, putPer1K: 0.0045, getPer1K: 0.00036, egressPerGB: 0, note: 'Free egress' },
      { name: 'Backblaze B2', storagePerGB: 0.005, putPer1K: 0, getPer1K: 0.0004, egressPerGB: 0.01, note: 'Pay-as-you-go' },
      { name: 'Wasabi', storagePerGB: 0.0069, putPer1K: 0, getPer1K: 0, egressPerGB: 0, note: 'No per-op or egress fees' },
      { name: 'Tigris', storagePerGB: 0.02, putPer1K: 0.005, getPer1K: 0.0005, egressPerGB: 0, note: 'Free egress + built-in CDN' }
    ];

    this.cacheProviders = [
      { name: 'None', model: 'none' },
      { name: 'CloudFront', model: 'cdn', egressPerGB: 0.085, requestPer1K: 0.001, note: 'Edge CDN, HTTPS US/EU' },
      { name: 'ElastiCache', model: 'provisioned', cachePerGB: 14, note: 'Redis, cache.r7g.large' },
      { name: 'Upstash', model: 'serverless', readPer1K: 0.002, writePer1K: 0.002, storagePerGB: 0.25, note: 'Pay-per-request' },
      { name: 'Momento', model: 'serverless', readPer1K: 0.001, writePer1K: 0.001, storagePerGB: 0, note: 'Per-operation' },
      { name: 'Workers KV', model: 'serverless', readPer1K: 0.0005, writePer1K: 0.005, storagePerGB: 0.50, note: 'Edge KV store' }
    ];

    this.containerSizes = [4096, 16384, 65536];
    this.containerLabels = ['4 MB', '16 MB', '64 MB'];

    this.init();
  }

  init() {
    this.storageSelect = document.getElementById('comprehensive-storage-select');
    this.cacheSelect = document.getElementById('comprehensive-cache-select');
    this.hitRateSlider = document.getElementById('comprehensive-hit-slider');
    this.hitRateValueEl = document.getElementById('comprehensive-hit-value');
    this.chunkSlider = document.getElementById('comprehensive-chunk-slider');
    this.chunkValueEl = document.getElementById('comprehensive-chunk-value');
    this.packingToggle = document.getElementById('comprehensive-packing-toggle');
    this.containerSlider = document.getElementById('comprehensive-container-slider');
    this.containerValueEl = document.getElementById('comprehensive-container-value');
    this.cloudSection = document.getElementById('comprehensive-cost-section');

    this.buildCloudTable();

    this.storageSelect?.addEventListener('change', () => this.update());
    this.cacheSelect?.addEventListener('change', () => this.onCacheChange());
    this.hitRateSlider?.addEventListener('input', () => this.update());
    this.chunkSlider?.addEventListener('input', () => this.update());
    this.packingToggle?.addEventListener('change', () => this.onPackingToggle());
    this.containerSlider?.addEventListener('input', () => this.update());

    this.onCacheChange();
    this.update();
  }

  sliderToKB(value) { return Math.pow(2, value / 10); }

  formatSize(kb) {
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MB`;
    if (kb >= 10) return `${Math.round(kb)} KB`;
    return `${kb.toFixed(1)} KB`;
  }

  formatDollars(amount) {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    if (amount >= 100) return `$${amount.toFixed(0)}`;
    if (amount >= 1) return `$${amount.toFixed(2)}`;
    return `$${amount.toFixed(3)}`;
  }

  formatCount(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return `${Math.round(n)}`;
  }

  formatGB(gb) {
    if (gb >= 1_048_576) return `${(gb / 1_048_576).toFixed(1)} PB`;
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
    if (gb >= 1) return `${Math.round(gb)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  }

  dedupRatio(t) { return 1.2 + 3.8 * Math.pow(1 - t, 0.7); }

  cacheSizeGB(uniqueGB, hitRate) {
    if (hitRate <= 0) return 0;
    return uniqueGB * Math.pow(hitRate, 2.5);
  }

  onCacheChange() {
    const cacheIdx = parseInt(this.cacheSelect?.value || 0);
    const isNone = this.cacheProviders[cacheIdx].model === 'none';
    if (this.hitRateSlider) {
      this.hitRateSlider.disabled = isNone;
      if (isNone) {
        this.hitRateSlider.value = 0;
      }
    }
    this.update();
  }

  onPackingToggle() {
    const packed = this.packingToggle?.checked;
    if (this.containerSlider) {
      this.containerSlider.disabled = !packed;
    }
    this.update();
  }

  buildCloudTable() {
    if (!this.cloudSection) return;
    clearElement(this.cloudSection);

    const header = document.createElement('div');
    header.className = 'cost-cloud-header';
    const title = document.createElement('span');
    title.className = 'cost-cloud-title';
    title.textContent = 'Comprehensive Monthly Cost Breakdown';
    this.workloadEl = document.createElement('span');
    this.workloadEl.className = 'cost-cloud-workload';
    header.appendChild(title);
    header.appendChild(this.workloadEl);
    this.cloudSection.appendChild(header);

    const table = document.createElement('table');
    table.className = 'cost-cloud-table comprehensive-cost-table';

    // Single-column: label + value
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
    headRow.appendChild(emptyTh);
    this.providerTh = document.createElement('th');
    this.providerTh.textContent = 'Cost';
    this.providerSub = document.createElement('span');
    this.providerSub.className = 'cost-cell-calc';
    this.providerTh.appendChild(this.providerSub);
    headRow.appendChild(this.providerTh);
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const rowDefs = [
      { label: 'Objects stored', key: 'objects' },
      { label: 'Storage', key: 'storage' },
      { label: 'Write operations', key: 'writes' },
      { label: 'Read operations', key: 'reads' },
      { label: 'Origin egress', key: 'egress' },
      { label: 'Cache cost', key: 'cache' },
      { label: 'Monthly total', key: 'total' }
    ];

    this.cloudCells = {};
    for (const rowDef of rowDefs) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = rowDef.label;
      tr.appendChild(tdLabel);

      const td = document.createElement('td');
      const value = document.createElement('span');
      value.className = 'cost-cell-value';
      const calc1 = document.createElement('span');
      calc1.className = 'cost-cell-calc';
      const calc2 = document.createElement('span');
      calc2.className = 'cost-cell-calc';
      td.appendChild(value);
      td.appendChild(calc1);
      td.appendChild(calc2);
      tr.appendChild(td);
      this.cloudCells[rowDef.key] = { value, calc1, calc2, td };

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.cloudSection.appendChild(table);

    // Pricing reference (dynamic, rebuilt on provider change)
    this.refContainer = document.createElement('div');
    this.cloudSection.appendChild(this.refContainer);

    // Assumptions
    const assumptions = document.createElement('div');
    assumptions.className = 'cost-cloud-assumptions';
    assumptions.textContent = 'Same workload assumptions as the storage cost explorers above. Cache sizing derived from Zipf access distribution (\u03b1 \u2248 0.6, per Breslau et al. INFOCOM \'99): cache fraction = hitRate^2.5. With cache set to "None", this produces identical numbers to the per-provider explorers above. Pricing as of Feb 2026.';
    this.cloudSection.appendChild(assumptions);
  }

  buildPricingRef(sp, cp) {
    clearElement(this.refContainer);

    const details = document.createElement('details');
    details.className = 'cost-pricing-ref';
    const summary = document.createElement('summary');
    summary.textContent = 'Per-unit pricing rates used in these calculations';
    details.appendChild(summary);

    const refTable = document.createElement('table');
    refTable.className = 'cost-cloud-table cost-ref-table comprehensive-cost-table';
    const refThead = document.createElement('thead');
    const refHeadRow = document.createElement('tr');
    refHeadRow.appendChild(document.createElement('th'));
    const th = document.createElement('th');
    th.textContent = 'Rate';
    refHeadRow.appendChild(th);
    refThead.appendChild(refHeadRow);
    refTable.appendChild(refThead);

    const refTbody = document.createElement('tbody');

    // Storage provider rates
    const storageRows = [
      { label: `${sp.name} storage`, value: `$${sp.storagePerGB}/GB`, note: sp.note },
      { label: `${sp.name} write ops`, value: sp.putPer1K === 0 ? '$0/1K' : `$${sp.putPer1K}/1K`, note: sp.putPer1K === 0 ? 'No per-op charge' : 'per 1K operations' },
      { label: `${sp.name} read ops`, value: sp.getPer1K === 0 ? '$0/1K' : `$${sp.getPer1K}/1K`, note: sp.getPer1K === 0 ? 'No per-op charge' : 'per 1K operations' },
      { label: `${sp.name} egress`, value: sp.egressPerGB === 0 ? '$0/GB' : `$${sp.egressPerGB}/GB`, note: sp.egressPerGB === 0 ? 'Free egress' : 'to internet' }
    ];

    for (const row of storageRows) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;
      tr.appendChild(tdLabel);
      const td = document.createElement('td');
      td.textContent = row.value;
      const note = document.createElement('span');
      note.className = 'cost-cell-calc';
      note.textContent = row.note;
      td.appendChild(note);
      tr.appendChild(td);
      refTbody.appendChild(tr);
    }

    // Cache provider rates (if not None)
    if (cp.model !== 'none') {
      const cacheRows = [];
      if (cp.model === 'cdn') {
        cacheRows.push({ label: `${cp.name} egress`, value: `$${cp.egressPerGB}/GB`, note: cp.note });
        cacheRows.push({ label: `${cp.name} requests`, value: `$${cp.requestPer1K}/1K`, note: 'HTTPS requests' });
      } else if (cp.model === 'provisioned') {
        cacheRows.push({ label: `${cp.name} memory`, value: `$${cp.cachePerGB}/GB/mo`, note: cp.note });
      } else if (cp.model === 'serverless') {
        cacheRows.push({ label: `${cp.name} reads`, value: `$${cp.readPer1K}/1K`, note: cp.note });
        cacheRows.push({ label: `${cp.name} writes`, value: `$${cp.writePer1K}/1K`, note: 'cache misses populate' });
        if (cp.storagePerGB > 0) {
          cacheRows.push({ label: `${cp.name} storage`, value: `$${cp.storagePerGB}/GB`, note: 'cached data' });
        }
      }
      for (const row of cacheRows) {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.textContent = row.label;
        tr.appendChild(tdLabel);
        const td = document.createElement('td');
        td.textContent = row.value;
        const note = document.createElement('span');
        note.className = 'cost-cell-calc';
        note.textContent = row.note;
        td.appendChild(note);
        tr.appendChild(td);
        refTbody.appendChild(tr);
      }
    }

    refTable.appendChild(refTbody);
    details.appendChild(refTable);
    this.refContainer.appendChild(details);
  }

  update() {
    const storageIdx = parseInt(this.storageSelect?.value || 0);
    const cacheIdx = parseInt(this.cacheSelect?.value || 0);
    const sp = this.storageProviders[storageIdx];
    const cp = this.cacheProviders[cacheIdx];

    const hitRate = parseInt(this.hitRateSlider?.value || 0) / 100;
    const sliderValue = parseInt(this.chunkSlider?.value || 50);
    const t = sliderValue / 100;
    const chunkKB = this.sliderToKB(sliderValue);
    const packed = this.packingToggle?.checked || false;
    const containerIdx = parseInt(this.containerSlider?.value || 0);
    const containerSizeKB = this.containerSizes[containerIdx];

    // Update display values
    if (this.hitRateValueEl) {
      this.hitRateValueEl.textContent = `${Math.round(hitRate * 100)}%`;
    }
    if (this.chunkValueEl) {
      this.chunkValueEl.textContent = this.formatSize(chunkKB);
    }
    if (this.containerValueEl) {
      this.containerValueEl.textContent = this.containerLabels[containerIdx];
    }

    // Column header
    this.providerSub.textContent = `${sp.name}${cp.model !== 'none' ? ' + ' + cp.name : ''}`;

    // Compute storage costs
    const dedup = this.dedupRatio(t);
    const uniqueGB = this.totalDataGB / dedup;
    const chunkBytes = chunkKB * 1024;
    const numChunks = (uniqueGB * 1024 * 1024 * 1024) / chunkBytes;

    const naivePuts = (this.grossChurnGB * 1024 * 1024 * 1024) / chunkBytes;
    const naiveGets = (this.monthlyEgressGB * 1024 * 1024 * 1024) / chunkBytes;

    const chunksPerContainer = packed ? Math.max(1, containerSizeKB / chunkKB) : 1;
    const numObjects = packed ? Math.ceil(numChunks / chunksPerContainer) : numChunks;
    const actualPuts = packed ? naivePuts / chunksPerContainer : naivePuts;
    const actualGets = packed ? naiveGets / chunksPerContainer : naiveGets;

    // Cache reduces reads hitting origin
    const originGets = actualGets * (1 - hitRate);
    const originEgressGB = this.monthlyEgressGB * (1 - hitRate);

    const storageCost = uniqueGB * sp.storagePerGB;
    const writeCost = (actualPuts / 1000) * sp.putPer1K;
    const readCost = (originGets / 1000) * sp.getPer1K;
    const egressCost = originEgressGB * sp.egressPerGB;

    // Cache cost
    let cacheCost = 0;
    const cacheGB = this.cacheSizeGB(uniqueGB, hitRate);
    const cachedReads = this.monthlyDocReads * hitRate;
    const missReads = this.monthlyDocReads * (1 - hitRate);

    let cacheCalc1 = '';
    let cacheCalc2 = '';

    if (cp.model === 'provisioned') {
      cacheCost = cacheGB * cp.cachePerGB;
      cacheCalc1 = `${this.formatGB(cacheGB)} \u00d7 $${cp.cachePerGB}/GB/mo`;
      cacheCalc2 = cp.note;
    } else if (cp.model === 'cdn') {
      const cfEgress = (this.monthlyEgressGB * hitRate) * cp.egressPerGB;
      const cfRequests = (cachedReads / 1000) * cp.requestPer1K;
      cacheCost = cfEgress + cfRequests;
      cacheCalc1 = `${this.formatGB(this.monthlyEgressGB * hitRate)} \u00d7 $${cp.egressPerGB}/GB egress`;
      cacheCalc2 = `${this.formatCount(cachedReads)} reqs \u00d7 $${cp.requestPer1K}/1K`;
    } else if (cp.model === 'serverless') {
      const cReadCost = (cachedReads / 1000) * cp.readPer1K;
      const cWriteCost = (missReads / 1000) * cp.writePer1K;
      const cStorageCost = cacheGB * (cp.storagePerGB || 0);
      cacheCost = cReadCost + cWriteCost + cStorageCost;
      cacheCalc1 = `reads: ${this.formatDollars(cReadCost)} + writes: ${this.formatDollars(cWriteCost)}`;
      cacheCalc2 = cp.storagePerGB > 0 ? `storage: ${this.formatDollars(cStorageCost)}` : 'No storage charge';
    }

    const totalCost = storageCost + writeCost + readCost + egressCost + cacheCost;

    // Workload summary
    if (this.workloadEl) {
      const objLabel = packed ? 'containers' : 'objects';
      const cacheLabel = cp.model !== 'none' ? ` | ${Math.round(hitRate * 100)}% cache hit` : '';
      this.workloadEl.textContent =
        `${this.formatCount(numObjects)} ${objLabel} | ${this.formatGB(uniqueGB)} stored | ${dedup.toFixed(1)}x dedup${cacheLabel}`;
    }

    // Objects stored
    const obj = this.cloudCells['objects'];
    obj.value.textContent = this.formatCount(numObjects);
    if (packed) {
      obj.calc1.textContent = `${this.formatCount(numChunks)} chunks in ${this.containerLabels[containerIdx]} containers`;
    } else {
      obj.calc1.textContent = `${this.formatGB(uniqueGB)} / ${this.formatSize(chunkKB)}`;
    }
    obj.calc2.textContent = '';

    // Storage
    const stor = this.cloudCells['storage'];
    stor.value.textContent = this.formatDollars(storageCost);
    stor.calc1.textContent = `${this.formatGB(uniqueGB)} \u00d7 $${sp.storagePerGB}/GB`;
    stor.calc2.textContent = sp.note;

    // Write operations
    const wr = this.cloudCells['writes'];
    wr.value.textContent = this.formatDollars(writeCost);
    if (sp.putPer1K === 0) {
      wr.calc1.textContent = `${this.formatCount(actualPuts)} operations`;
      wr.calc2.textContent = 'No per-op charge';
    } else {
      wr.calc1.textContent = `${this.formatCount(actualPuts)} \u00d7 $${sp.putPer1K}/1K`;
      wr.calc2.textContent = packed ? 'container PUTs' : 'chunk PUTs';
    }

    // Read operations (reduced by cache)
    const rd = this.cloudCells['reads'];
    rd.value.textContent = this.formatDollars(readCost);
    if (sp.getPer1K === 0) {
      rd.calc1.textContent = `${this.formatCount(originGets)} origin reads`;
      rd.calc2.textContent = 'No per-op charge';
    } else {
      rd.calc1.textContent = `${this.formatCount(originGets)} \u00d7 $${sp.getPer1K}/1K`;
      rd.calc2.textContent = hitRate > 0 ? `${Math.round(hitRate * 100)}% served from cache` : 'all reads hit origin';
    }
    rd.td.style.color = hitRate > 0 ? '#2d7a4f' : '';

    // Origin egress (reduced by cache)
    const egr = this.cloudCells['egress'];
    if (sp.egressPerGB === 0) {
      egr.value.textContent = '$0';
      egr.calc1.textContent = `${this.formatGB(originEgressGB)} transferred`;
      egr.calc2.textContent = 'Free egress';
    } else {
      egr.value.textContent = this.formatDollars(egressCost);
      egr.calc1.textContent = `${this.formatGB(originEgressGB)} \u00d7 $${sp.egressPerGB}/GB`;
      egr.calc2.textContent = hitRate > 0 ? `${Math.round(hitRate * 100)}% served from cache` : 'all egress from origin';
    }
    egr.td.style.color = hitRate > 0 && sp.egressPerGB > 0 ? '#2d7a4f' : '';

    // Cache cost
    const cc = this.cloudCells['cache'];
    if (cp.model === 'none') {
      cc.value.textContent = '$0';
      cc.calc1.textContent = 'No cache selected';
      cc.calc2.textContent = '';
      cc.td.style.color = '';
    } else {
      cc.value.textContent = this.formatDollars(cacheCost);
      cc.calc1.textContent = cacheCalc1;
      cc.calc2.textContent = cacheCalc2;
      cc.td.style.color = '';
    }

    // Total
    const tot = this.cloudCells['total'];
    tot.value.textContent = this.formatDollars(totalCost);
    tot.calc1.textContent = '';
    tot.calc2.textContent = '';

    // Update pricing reference
    this.buildPricingRef(sp, cp);
  }
}

// =============================================================================
// Initialize on page load
// =============================================================================

function initCDCAnimations() {
  // Fixed vs CDC comparison
  new FixedVsCDCDemo('fixed-vs-cdc-demo');

  // Chunk comparison demos (before/after with hover)
  new ChunkComparisonDemo('fixed-chunking-demo', { mode: 'fixed', fixedChunkSize: 48 });
  new ChunkComparisonDemo('cdc-chunking-demo', { mode: 'sentence' });

  // GEAR hash rolling window
  new GearHashDemo('gear-hash-demo');

  // Versioned deduplication demo
  new VersionedDedupDemo('dedup-demo');

  // Parametric chunking explorer
  new ParametricChunkingDemo('parametric-demo');

  // Basic vs Normalized comparison
  new ComparisonDemo('comparison-demo');

  // Cost tabs (Part 3)
  new CostTabsController('cost-tabs');

  // Cost tradeoffs explorer
  new CostTradeoffsDemo('cost-tradeoffs-demo');

  // Container cost explorers (Part 4)
  new ContainerCostDemo('naive-cost-demo', { mode: 'naive' });
  new ContainerCostDemo('packed-cost-demo', { mode: 'packed' });
  new ContainerCostDemo('container-cost-demo');

  // Newcomer cloud cost explorer (Part 4)
  new NewcomerCostDemo('newcomer-cost-demo');

  // Jazz Cloud cost explorer (Part 4)
  new JazzCostDemo('jazz-cost-demo');

  // Cache cost explorers (Part 4)
  new CacheTraditionalDemo('cache-traditional-demo');
  new CacheNewcomerDemo('cache-newcomer-demo');
  new ComprehensiveCostDemo('comprehensive-cost-demo');
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCDCAnimations);
} else {
  initCDCAnimations();
}

// Export for module usage
export { FixedVsCDCDemo, ChunkComparisonDemo, GearHashDemo, VersionedDedupDemo, ParametricChunkingDemo, ComparisonDemo, CostTradeoffsDemo, ContainerCostDemo, NewcomerCostDemo, JazzCostDemo, CacheTraditionalDemo, CacheNewcomerDemo, ComprehensiveCostDemo, chunkData, chunkDataBasic, chunkDataFixed, findChunkBoundary, findChunkBoundaryBasic };
