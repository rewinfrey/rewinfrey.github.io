/**
 * Line Field Animation Module
 *
 * A canvas-based animation of lines that wave and ripple like cloth in the wind.
 * Supports dual wind sources, depth-based opacity, and configurable parameters.
 */

// Optimized Simplex noise implementation
const SimplexNoise = (function() {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const G2x2 = G2 * 2;

  const grad3x = [1, -1, 1, -1, 1, -1, 1, -1, 0, 0, 0, 0];
  const grad3y = [1, 1, -1, -1, 0, 0, 0, 0, 1, -1, 1, -1];

  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 256; i++) {
    const v = Math.floor(Math.random() * 256);
    perm[i] = perm[i + 256] = v;
    permMod12[i] = permMod12[i + 256] = v % 12;
  }

  return {
    noise2D: function(xin, yin) {
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const x0 = xin - i + t;
      const y0 = yin - j + t;

      const i1 = x0 > y0 ? 1 : 0;
      const j1 = 1 - i1;

      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + G2x2;
      const y2 = y0 - 1 + G2x2;

      const ii = i & 255;
      const jj = j & 255;
      const gi0 = permMod12[ii + perm[jj]];
      const gi1 = permMod12[ii + i1 + perm[jj + j1]];
      const gi2 = permMod12[ii + 1 + perm[jj + 1]];

      let n0 = 0, n1 = 0, n2 = 0;

      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 > 0) {
        t0 *= t0;
        n0 = t0 * t0 * (grad3x[gi0] * x0 + grad3y[gi0] * y0);
      }

      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 > 0) {
        t1 *= t1;
        n1 = t1 * t1 * (grad3x[gi1] * x1 + grad3y[gi1] * y1);
      }

      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 > 0) {
        t2 *= t2;
        n2 = t2 * t2 * (grad3x[gi2] * x2 + grad3y[gi2] * y2);
      }

      return 70 * (n0 + n1 + n2);
    }
  };
})();

// Pre-computed line phase offsets for consistent per-line variation
const MAX_LINES = 1500;
const linePhases = new Float32Array(MAX_LINES);
for (let i = 0; i < MAX_LINES; i++) {
  const seed = i * 127.1 + 311.7;
  const sinSeed = Math.sin(seed) * 43758.5453;
  linePhases[i] = (sinSeed - Math.floor(sinSeed)) * Math.PI * 2;
}

// Reusable typed arrays for zero-allocation rendering
const maxPoints = 2000;
const pointsX = new Float32Array(maxPoints);
const pointsY = new Float32Array(maxPoints);
const pointsDisp = new Float32Array(maxPoints);

/**
 * Get cardinal direction name from angle
 * @param {number} angle - Angle in radians
 * @returns {string} Direction name (N, NE, E, SE, S, SW, W, NW)
 */
export function getDirectionName(angle) {
  const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const degrees = normalized * (180 / Math.PI);

  if (degrees >= 337.5 || degrees < 22.5) return 'E';
  if (degrees >= 22.5 && degrees < 67.5) return 'SE';
  if (degrees >= 67.5 && degrees < 112.5) return 'S';
  if (degrees >= 112.5 && degrees < 157.5) return 'SW';
  if (degrees >= 157.5 && degrees < 202.5) return 'W';
  if (degrees >= 202.5 && degrees < 247.5) return 'NW';
  if (degrees >= 247.5 && degrees < 292.5) return 'N';
  if (degrees >= 292.5 && degrees < 337.5) return 'NE';
  return 'E';
}

/**
 * Get orientation axis name from angle
 * @param {number} angle - Angle in radians
 * @returns {string} Orientation name (N-S, NE-SW, E-W, NW-SE)
 */
export function getOrientationName(angle) {
  const normalized = ((angle % Math.PI) + Math.PI) % Math.PI;
  const degrees = normalized * (180 / Math.PI);

  if (degrees < 22.5 || degrees >= 157.5) return 'E-W';
  if (degrees >= 22.5 && degrees < 67.5) return 'NE-SW';
  if (degrees >= 67.5 && degrees < 112.5) return 'N-S';
  if (degrees >= 112.5 && degrees < 157.5) return 'NW-SE';
  return 'E-W';
}

/**
 * Default animation parameters
 */
const DEFAULT_PARAMS = {
  spacing: 7,
  width: 0.7,
  wind: 4.0,
  windDirection: Math.PI / 2,
  wind2: 3.0,
  wind2Direction: -Math.PI * 3 / 4,
  windDensity: 7,
  windSize: 99,
  jitter: 1,
  jitterDiameter: 22,
  color: '#d8d4cb',
  opacity: 0.9,
  lineOrientation: -Math.PI * 3 / 4,
  opacityDepthFactor: 0.6,
  backgroundColor: '#faf9f7'
};

/**
 * Line Field Animation
 *
 * Creates an animated field of lines that wave like cloth in the wind.
 */
export class LineFieldAnimation {
  /**
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   * @param {Object} options - Configuration options
   * @param {string} options.mode - 'viewport' for full-screen, 'container' for parent-sized
   * @param {Object} options.params - Initial animation parameters (merged with defaults)
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.mode = options.mode || 'container';

    // Merge provided params with defaults
    this.params = { ...DEFAULT_PARAMS, ...(options.params || {}) };

    // Animation state
    this.animationId = null;
    this.time = 0;
    this.lastFrameTime = 0;
    this.isPaused = false;
    this.isRunning = false;

    // Cached dimensions
    this.viewWidth = 0;
    this.viewHeight = 0;
    this.dpr = 1;

    // Derived values (computed from params)
    this.strokeStyle = '';
    this.noiseScale1 = 0;
    this.noiseScale2 = 0;
    this.waveScale = 0;

    // Bind methods for event handlers
    this._boundResize = this.resize.bind(this);
    this._boundRender = this._render.bind(this);

    // Initial setup
    this._updateDerivedParams();
    this.resize();

    // Listen for resize events
    window.addEventListener('resize', this._boundResize);
  }

  /**
   * Update animation parameters
   * @param {Object} newParams - Parameters to update
   */
  setParams(newParams) {
    Object.assign(this.params, newParams);
    this._updateDerivedParams();
  }

  /**
   * Get current parameters
   * @returns {Object} Current animation parameters
   */
  getParams() {
    return { ...this.params };
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame(this._boundRender);
  }

  /**
   * Stop the animation loop completely
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Pause the animation (keeps loop running but skips rendering)
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume a paused animation
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastFrameTime = performance.now();
    }
  }

  /**
   * Render a single frame (useful for reduced-motion preference)
   */
  renderOnce() {
    this.lastFrameTime = performance.now();
    this._renderFrame(this.lastFrameTime);
  }

  /**
   * Handle canvas resize
   */
  resize() {
    this.dpr = window.devicePixelRatio || 1;

    if (this.mode === 'viewport') {
      // Full viewport mode (extends 10% beyond edges)
      this.viewWidth = window.innerWidth * 1.2;
      this.viewHeight = window.innerHeight;
    } else {
      // Container mode
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.viewWidth = rect.width;
      this.viewHeight = this.canvas.offsetHeight || rect.height;
    }

    this.canvas.width = this.viewWidth * this.dpr;
    this.canvas.height = this.viewHeight * this.dpr;

    // Reset transform before scaling to prevent accumulation
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Clean up resources and event listeners
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._boundResize);
  }

  // Private methods

  _updateDerivedParams() {
    const hex = this.params.color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    this.strokeStyle = `rgba(${r},${g},${b},${this.params.opacity})`;

    // Wind density controls noise frequency
    const densityScale = 0.0003 + 0.02 * (this.params.windDensity / 100);
    this.noiseScale1 = densityScale;
    this.noiseScale2 = densityScale * 1.8;

    // Wind size controls wave broadness
    this.waveScale = 0.03 * (1 - this.params.windSize / 100) + 0.001;
  }

  _render(timestamp) {
    if (!this.isRunning) return;

    if (this.isPaused) {
      this.animationId = requestAnimationFrame(this._boundRender);
      return;
    }

    this._renderFrame(timestamp);
    this.animationId = requestAnimationFrame(this._boundRender);
  }

  _renderFrame(timestamp) {
    const deltaTime = Math.min(timestamp - this.lastFrameTime, 50) / 1000;
    this.lastFrameTime = timestamp;

    const avgWind = (this.params.wind + this.params.wind2) * 0.5;
    this.time += deltaTime * 0.6 * (avgWind + 0.5);

    const ctx = this.ctx;
    const viewWidth = this.viewWidth;
    const viewHeight = this.viewHeight;

    // Clear canvas
    ctx.fillStyle = this.params.backgroundColor;
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    const windSpeed = this.params.wind;
    const wind2Speed = this.params.wind2;
    const spacing = Math.max(1, this.params.spacing);
    const jitterAmount = this.params.jitter / 100;
    const jitterDiameter = this.params.jitterDiameter * 10;

    // Pre-compute trig values
    const windX = Math.cos(this.params.windDirection);
    const windY = Math.sin(this.params.windDirection);
    const wind2X = Math.cos(this.params.wind2Direction);
    const wind2Y = Math.sin(this.params.wind2Direction);
    const lineX = Math.cos(this.params.lineOrientation);
    const lineY = Math.sin(this.params.lineOrientation);
    const perpAngle = this.params.lineOrientation + Math.PI * 0.5;
    const perpX = Math.cos(perpAngle);
    const perpY = Math.sin(perpAngle);

    const diagonal = Math.sqrt(viewWidth * viewWidth + viewHeight * viewHeight);
    const numLines = Math.min(Math.ceil(diagonal / spacing) + 4, MAX_LINES);
    const startOffset = -diagonal * 0.5;
    const centerX = viewWidth * 0.5;
    const centerY = viewHeight * 0.5;

    const segmentLength = 12;
    const lineLength = diagonal * 1.5;
    const numSegments = Math.ceil(lineLength / segmentLength);
    const halfLineLength = lineLength * 0.5;
    const invNumSegments = 1 / numSegments;

    // Pre-compute time-based noise offsets
    const totalWindSpeed = windSpeed + wind2Speed + 0.01;
    const invTotalWind = 1 / totalWindSpeed;
    const windBlendX = (windX * windSpeed + wind2X * wind2Speed) * invTotalWind;
    const windBlendY = (windY * windSpeed + wind2Y * wind2Speed) * invTotalWind;
    const timeOffset1x = this.time * windBlendX * 0.15;
    const timeOffset1y = this.time * windBlendY * 0.15;
    const timeOffset2x = this.time * windBlendX * 0.12 + this.time * 0.05;
    const timeOffset2y = this.time * windBlendY * 0.12 - this.time * 0.03;
    const waveTimeOffset = this.time * windSpeed * 0.3;
    const wave2TimeOffset = this.time * wind2Speed * 0.3;
    const combinedWindSpeed = (windSpeed + wind2Speed) * 0.5;
    const displacementMultiplier = combinedWindSpeed * 0.15 * jitterDiameter;

    // Set stroke properties
    const baseOpacity = this.params.opacity;
    const depthFactor = this.params.opacityDepthFactor;
    ctx.lineWidth = this.params.width;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = this.strokeStyle;

    // Viewport bounds for culling
    const margin = jitterDiameter * combinedWindSpeed * 0.2;
    const viewMinX = -margin;
    const viewMaxX = viewWidth + margin;
    const viewMinY = -margin;
    const viewMaxY = viewHeight + margin;

    // Draw all lines
    for (let i = 0; i < numLines; i++) {
      const lineOffset = startOffset + i * spacing;
      const baseX = centerX + perpX * lineOffset;
      const baseY = centerY + perpY * lineOffset;

      // Viewport culling
      const endX1 = baseX + lineX * halfLineLength;
      const endY1 = baseY + lineY * halfLineLength;
      const endX2 = baseX - lineX * halfLineLength;
      const endY2 = baseY - lineY * halfLineLength;

      if ((endX1 < viewMinX && endX2 < viewMinX) ||
          (endX1 > viewMaxX && endX2 > viewMaxX) ||
          (endY1 < viewMinY && endY2 < viewMinY) ||
          (endY1 > viewMaxY && endY2 > viewMaxY)) {
        continue;
      }

      const linePhaseJitter = linePhases[i] * jitterAmount;

      // Calculate points
      for (let j = 0; j <= numSegments; j++) {
        const t = (j * invNumSegments - 0.5) * lineLength;
        const px = baseX + lineX * t;
        const py = baseY + lineY * t;

        const noise1 = SimplexNoise.noise2D(
          px * this.noiseScale1 + timeOffset1x,
          py * this.noiseScale1 + timeOffset1y
        );
        const noise2 = SimplexNoise.noise2D(
          px * this.noiseScale2 + timeOffset2x,
          py * this.noiseScale2 + timeOffset2y
        );

        const wavePos1 = (px * windX + py * windY) * this.waveScale;
        const wave1 = Math.sin(wavePos1 + waveTimeOffset + linePhaseJitter);
        const wavePos2 = (px * wind2X + py * wind2Y) * this.waveScale;
        const wave2 = Math.sin(wavePos2 + wave2TimeOffset + linePhaseJitter);
        const wave = (wave1 * windSpeed + wave2 * wind2Speed) * invTotalWind;

        const baseDisplacement = noise1 * 0.55 + noise2 * 0.45;
        const combined = (baseDisplacement + wave * 0.5 * jitterAmount) * displacementMultiplier;

        pointsX[j] = px + perpX * combined;
        pointsY[j] = py + perpY * combined;
        pointsDisp[j] = baseDisplacement;
      }

      // Apply depth-based opacity
      if (depthFactor !== 0) {
        const centerDisp = pointsDisp[numSegments >> 1] * 2;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, 0.5 + centerDisp * 0.5 * depthFactor)) * baseOpacity;
      }

      // Draw line
      ctx.beginPath();
      ctx.moveTo(pointsX[0], pointsY[0]);
      for (let j = 1; j <= numSegments; j++) {
        ctx.lineTo(pointsX[j], pointsY[j]);
      }
      ctx.stroke();
    }

    if (depthFactor !== 0) {
      ctx.globalAlpha = 1;
    }
  }
}
