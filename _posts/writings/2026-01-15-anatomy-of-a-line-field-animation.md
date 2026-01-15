---
layout: writing
group: Writings
title: "Anatomy of a Line Field Animation"
summary: "How a simple grid of lines evolved into an organic, wind-driven canvas animation through iterative prompting."
date: 2026-01-15 12:00:00
categories:
- writings
---

<style>
/* Demo container - no border, auto height */
.demo-box {
  margin: 2rem 0;
}

.demo-box canvas {
  display: block;
  width: 100%;
  height: 500px;
  border-radius: 8px;
  background: #faf9f7;
}

/* Controls panel matching animations page */
.demo-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid rgba(61, 58, 54, 0.1);
  margin-top: 1rem;
}

.demo-controls-featured {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(61, 58, 54, 0.1);
  margin-bottom: 0.5rem;
}

.demo-controls-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1.5rem;
}

.demo-controls-row + .demo-controls-row {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(61, 58, 54, 0.06);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 0.9rem;
  color: #3d3a36;
}

.slider-container {
  display: flex;
  align-items: center;
}

.demo-controls input[type="range"] {
  width: 120px;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #d4a574, #c45a3b);
  border-radius: 3px;
  outline: none;
}

.demo-controls input[type="range"]::-webkit-slider-thumb {
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

.demo-controls input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.demo-controls input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #c45a3b;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.demo-controls input[type="color"] {
  width: 40px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background: none;
}

.demo-controls input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.demo-controls input[type="color"]::-webkit-color-swatch {
  border: 2px solid rgba(61, 58, 54, 0.2);
  border-radius: 4px;
}

/* Compact compass for demos */
.compass-small {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #faf9f7;
  border: 2px solid rgba(61, 58, 54, 0.2);
  position: relative;
  cursor: pointer;
  margin: 0 auto;
}

.compass-small .compass-direction {
  position: absolute;
  font-size: 0.6rem;
  font-weight: 600;
  color: #8b7355;
}

.compass-small .compass-n { top: 4px; left: 50%; transform: translateX(-50%); }
.compass-small .compass-s { bottom: 4px; left: 50%; transform: translateX(-50%); }
.compass-small .compass-e { right: 4px; top: 50%; transform: translateY(-50%); }
.compass-small .compass-w { left: 4px; top: 50%; transform: translateY(-50%); }

.compass-small .compass-needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 30px;
  background: linear-gradient(to top, #c45a3b 50%, #3d3a36 50%);
  transform-origin: center bottom;
  transform: translateX(-50%) translateY(-100%);
  border-radius: 2px;
  pointer-events: none;
}

.compass-small .compass-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #c45a3b;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

@media (max-width: 42em) {
  .demo-controls {
    grid-template-columns: 1fr;
  }
  .demo-controls-featured {
    grid-template-columns: 1fr;
  }
}

/* Prompt callout styling */
.prompt {
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

.prompt::before {
  content: "Prompt";
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
</style>

What started as fun idea, and low-stakes desire to add a subtle wind movement background animation to my homepage, turned into an exploration of JavaScript canvas rendering, noise functions, planar waves, and the surprisingly rich parameter space of moving lines.

This post walks through the mental model behind the line field animation used as the background for this website, how it evolved from a static grid to an organic wind simulation, and learnings and reflection on creative coding through conversational iteration with LLM's.

---

## The Mental Model

At its core, the animation is simple: draw a field of parallel lines on a canvas, then displace each point along those lines based on mathematical functions that change over time to simulate wind.

The key insight is that **lines are just sequences of points**. If you can control where each point sits, you can make the line wave, ripple, or flow.

### How Wind "Moves"

Wind isn't modeled as emanating from a point source. Instead, it's a **traveling planar wave**. A useful reference is ocean waves approaching a beach rather than ripples from a dropped stone. Each point's position is projected onto the wind direction axis, and a sine wave sweeps along that axis over time:

{% highlight javascript linenos %}
  displacement = sin(position_along_wind_axis + time)
{% endhighlight %}

As time advances, the sine wave pattern shifts in the wind direction, creating the illusion of wind sweeping across the field. With two wind sources at different angles, the waves interfere to create complex, naturalistic patterns.

### Layered Displacement

The final displacement of each point combines several layers:

1. **Simplex noise** — Organic, spatially-coherent randomness that scrolls in the wind direction
2. **Traveling sine waves** — Parallel wavefronts for each wind source
3. **Per-line modifiers** — Jitter (phase randomization), whisp (amplitude variation), and gust envelopes

Each layer operates at different spatial frequencies and serves a different purpose, but they all scroll or animate over time to create cohesive movement.

---

## The Evolution: From Static to Organic

The animation started simple, just a field of lines. Each turn in the session increased the complexity by adding additional parameters and controls. Below is a timeline of how the animation evolved along with the prompt used for each step.

### Stage 1: A Grid of Lines

The first version was trivially simple: parallel lines at a fixed angle, evenly spaced.

<div class="prompt">
"Add a field of lines parameterized by line width, line spacing (the distance between lines), and line direction. Also add controls for line color and opacity. Let's add this to /animations in isolation."
</div>

The LLM (opus 4-5) provided this initial skeleton including a canvas element, a render loop, and controls for the requested parameters.

**Controls:**
- **Line Direction** — The angle at which lines are drawn across the canvas
- **Line Spacing** — Distance between parallel lines (smaller = denser field)
- **Line Width** — Stroke thickness of each line
- **Opacity** — Transparency of the lines
- **Line Color** — The color of the lines

<div class="demo-box">
  <div class="demo-canvas-wrapper">
    <canvas id="demo1"></canvas>
    <div class="demo-paused-overlay paused" id="demo1-overlay">
      <button class="play-btn" aria-label="Play">
        <span class="fa-solid fa-circle-play" aria-hidden="true"></span>
      </button>
      <span class="paused-message">Animation paused on mobile. Tap play to start.</span>
    </div>
  </div>
  <div class="demo-controls">
    <div class="control-group">
      <label class="control-label">Line Direction</label>
      <div class="compass-small" id="demo1-orient-compass">
        <span class="compass-direction compass-n">N</span>
        <span class="compass-direction compass-s">S</span>
        <span class="compass-direction compass-e">E</span>
        <span class="compass-direction compass-w">W</span>
        <div class="compass-needle" id="demo1-orient-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
        <div class="compass-center"></div>
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Line Spacing</label>
      <div class="slider-container">
        <input type="range" id="demo1-spacing" min="4" max="20" value="7">
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Line Width</label>
      <div class="slider-container">
        <input type="range" id="demo1-width" min="0.3" max="2" value="0.7" step="0.1">
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Opacity</label>
      <div class="slider-container">
        <input type="range" id="demo1-opacity" min="0" max="1" value="0.9" step="0.1">
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Line Color</label>
      <input type="color" id="demo1-color" value="#b4afa5">
    </div>
  </div>
</div>

<script type="module">
import { LineFieldAnimation } from '/assets/js/line-field.js';

const canvas = document.getElementById('demo1');
const animation = new LineFieldAnimation(canvas, {
  mode: 'container',
  params: {
    spacing: 7,
    width: 0.7,
    wind: 0,
    wind2: 0,
    jitter: 0,
    jitterDiameter: 0,
    opacityDepthFactor: 0,
    lineOrientation: Math.PI / 2,
    color: '#b4afa5'
  }
});

// Mobile overlay handling
const isMobile = window.matchMedia('(max-width: 42em)').matches;
const overlay = document.getElementById('demo1-overlay');
const playBtn = overlay.querySelector('.play-btn');

function initRender() {
  requestAnimationFrame(() => {
    animation.resize();
    animation.renderOnce();
  });
}

if (isMobile) {
  // Mobile: wait for user to tap play
  playBtn.addEventListener('click', () => {
    overlay.classList.remove('paused');
    initRender();
  });
} else {
  // Desktop: render immediately and hide overlay
  overlay.classList.remove('paused');
  if (document.readyState === 'complete') {
    initRender();
  } else {
    window.addEventListener('load', initRender);
  }
}

// Compass interaction
const orientCompass = document.getElementById('demo1-orient-compass');
const orientNeedle = document.getElementById('demo1-orient-needle');
let dragging = false;

function updateOrient(e) {
  const rect = orientCompass.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ lineOrientation: angle });
  orientNeedle.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
  animation.renderOnce();
}

orientCompass.addEventListener('mousedown', (e) => { dragging = true; updateOrient(e); });
document.addEventListener('mousemove', (e) => { if (dragging) updateOrient(e); });
document.addEventListener('mouseup', () => { dragging = false; });
orientCompass.addEventListener('touchstart', (e) => { dragging = true; updateOrient(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (dragging) updateOrient(e.touches[0]); });
document.addEventListener('touchend', () => { dragging = false; });

document.getElementById('demo1-spacing').addEventListener('input', (e) => {
  animation.setParams({ spacing: parseInt(e.target.value) });
  animation.renderOnce();
});

document.getElementById('demo1-width').addEventListener('input', (e) => {
  animation.setParams({ width: parseFloat(e.target.value) });
  animation.renderOnce();
});

document.getElementById('demo1-opacity').addEventListener('input', (e) => {
  animation.setParams({ opacity: parseFloat(e.target.value) });
  animation.renderOnce();
});

document.getElementById('demo1-color').addEventListener('input', (e) => {
  animation.setParams({ color: e.target.value });
  animation.renderOnce();
});
</script>

<script type="module">
// Shared animation controller for mobile/desktop behavior
window.setupAnimatedDemo = function(animation, canvasId, overlayId, pauseId) {
  const isMobile = window.matchMedia('(max-width: 42em)').matches;
  const canvas = document.getElementById(canvasId);
  const overlay = document.getElementById(overlayId);
  const pauseBtn = document.getElementById(pauseId);
  const playBtn = overlay.querySelector('.play-btn');
  let isPlaying = false;
  let isVisible = false;
  let userStarted = false;

  function hideOverlay() {
    overlay.classList.remove('paused');
  }

  function showOverlay() {
    overlay.classList.add('paused');
  }

  function showPauseBtn() {
    pauseBtn.classList.add('playing');
  }

  function hidePauseBtn() {
    pauseBtn.classList.remove('playing');
  }

  function play() {
    if (!isPlaying) {
      isPlaying = true;
      animation.start();
      hideOverlay();
      if (isMobile) showPauseBtn();
    }
  }

  function pause() {
    if (isPlaying) {
      isPlaying = false;
      animation.stop();
      animation.renderOnce();
      hidePauseBtn();
      // Show overlay on mobile when paused by user
      if (isMobile) {
        showOverlay();
      }
    }
  }

  // Intersection Observer - pause when not visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        // On mobile: only play if user has explicitly started it
        // On desktop: auto-play when visible
        if (!isMobile || userStarted) {
          play();
        }
      } else {
        // Pause but don't show overlay when scrolling away
        if (isPlaying) {
          isPlaying = false;
          animation.stop();
          animation.renderOnce();
          hidePauseBtn();
        }
      }
    });
  }, { threshold: 0.1 });

  observer.observe(canvas);

  // Play button handler (mobile overlay)
  playBtn.addEventListener('click', () => {
    userStarted = true;
    play();
  });

  // Pause button handler (mobile corner button)
  pauseBtn.addEventListener('click', () => {
    userStarted = false;
    pause();
  });

  // Initial state
  if (isMobile) {
    // Mobile: start paused with overlay, render once for preview
    animation.renderOnce();
  } else {
    // Desktop: hide overlay, will auto-play when visible via Intersection Observer
    hideOverlay();
    animation.renderOnce();
  }

  return { play, pause, isPlaying: () => isPlaying };
};
</script>

### Stage 2: Wind and Movement

<div class="prompt">
"Let's now add movement to the field of lines. I'd like to simulate wind blowing over the lines, parameterized by wind speed and wind direction. I'd also like wind size to represent the overall size of a single wind element's influence over a line. The larger the wind size, the more it displaces the length of the line. Let's also include jitter and jitter diameter per line. The jitter influences the randomness by which a line reacts to wind, and the jitter diameter controls the distance a line can move from its origin."
</div>

Wind is modeled as a **sine wave traveling in a direction** causing displacement of the points making up the field of lines, resulting in the illusion of movement. Points along the wind axis move together, creating the illusion of cohesive wind pushing through the field. **Simplex noise** adds organic variation—each point samples a 2D noise field, shifting perpendicular to the line direction.

**Controls:**
- **Wind Speed** — How fast the wave travels through the field
- **Wind Direction** — The direction the wave propagates
- **Wind Size** — Wavelength of the wind pattern (larger = broader, gentler curves)
- **Jitter Amount** — Randomizes each line's wave phase (0 = lines move in sync, higher = lines move independently/chaotically)
- **Jitter Diameter** — Overall displacement magnitude (larger = points move further from origin)

<div class="demo-box">
  <div class="demo-canvas-wrapper">
    <canvas id="demo2"></canvas>
    <div class="demo-paused-overlay paused" id="demo2-overlay">
      <button class="play-btn" aria-label="Play">
        <span class="fa-solid fa-circle-play" aria-hidden="true"></span>
      </button>
      <span class="paused-message">Animation paused on mobile. Tap play to start.</span>
    </div>
    <button class="demo-pause-btn" id="demo2-pause" aria-label="Pause">
      <span class="fa-solid fa-circle-pause" aria-hidden="true"></span>
    </button>
  </div>
  <div class="demo-controls">
    <div class="demo-controls-featured">
      <div class="demo-controls-row">
        <div class="control-group">
          <label class="control-label">Wind Direction</label>
          <div class="compass-small" id="demo2-wind-compass">
            <span class="compass-direction compass-n">N</span>
            <span class="compass-direction compass-s">S</span>
            <span class="compass-direction compass-e">E</span>
            <span class="compass-direction compass-w">W</span>
            <div class="compass-needle" id="demo2-wind-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
            <div class="compass-center"></div>
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Wind Speed</label>
          <div class="slider-container">
            <input type="range" id="demo2-speed" min="0" max="10" value="4" step="0.5">
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Wind Size</label>
          <div class="slider-container">
            <input type="range" id="demo2-size" min="0" max="100" value="99">
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Jitter Amount</label>
          <div class="slider-container">
            <input type="range" id="demo2-jitter" min="0" max="100" value="1">
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Jitter Diameter</label>
          <div class="slider-container">
            <input type="range" id="demo2-diameter" min="5" max="40" value="22">
          </div>
        </div>
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Line Direction</label>
      <div class="compass-small" id="demo2-orient-compass">
        <span class="compass-direction compass-n">N</span>
        <span class="compass-direction compass-s">S</span>
        <span class="compass-direction compass-e">E</span>
        <span class="compass-direction compass-w">W</span>
        <div class="compass-needle" id="demo2-orient-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
        <div class="compass-center"></div>
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Line Spacing</label>
      <div class="slider-container">
        <input type="range" id="demo2-spacing" min="4" max="20" value="7">
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Line Width</label>
      <div class="slider-container">
        <input type="range" id="demo2-width" min="0.3" max="2" value="0.7" step="0.1">
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Opacity</label>
      <div class="slider-container">
        <input type="range" id="demo2-opacity" min="0" max="1" value="0.9" step="0.1">
      </div>
    </div>
    <div class="control-group">
      <label class="control-label">Line Color</label>
      <input type="color" id="demo2-color" value="#b4afa5">
    </div>
  </div>
</div>

<script type="module">
import { LineFieldAnimation } from '/assets/js/line-field.js';

const canvas = document.getElementById('demo2');
const animation = new LineFieldAnimation(canvas, {
  mode: 'container',
  params: {
    spacing: 7,
    width: 0.7,
    wind: 4.0,
    windDirection: Math.PI / 2,
    wind2: 0,
    jitter: 1,
    jitterDiameter: 22,
    windDensity: 7,
    windSize: 99,
    opacityDepthFactor: 0,
    lineOrientation: Math.PI / 2,
    color: '#b4afa5'
  }
});
setupAnimatedDemo(animation, 'demo2', 'demo2-overlay', 'demo2-pause');

// Wind compass
const windCompass = document.getElementById('demo2-wind-compass');
const windNeedle = document.getElementById('demo2-wind-needle');
let draggingWind3 = false;

function updateWind3(e) {
  const rect = windCompass.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ windDirection: angle });
  windNeedle.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}

windCompass.addEventListener('mousedown', (e) => { draggingWind3 = true; updateWind3(e); });
document.addEventListener('mousemove', (e) => { if (draggingWind3) updateWind3(e); });
document.addEventListener('mouseup', () => { draggingWind3 = false; });
windCompass.addEventListener('touchstart', (e) => { draggingWind3 = true; updateWind3(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingWind3) updateWind3(e.touches[0]); });
document.addEventListener('touchend', () => { draggingWind3 = false; });

// Orient compass
const orientCompass = document.getElementById('demo2-orient-compass');
const orientNeedle = document.getElementById('demo2-orient-needle');
let draggingOrient3 = false;

function updateOrient3(e) {
  const rect = orientCompass.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ lineOrientation: angle });
  orientNeedle.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}

orientCompass.addEventListener('mousedown', (e) => { draggingOrient3 = true; updateOrient3(e); });
document.addEventListener('mousemove', (e) => { if (draggingOrient3) updateOrient3(e); });
document.addEventListener('mouseup', () => { draggingOrient3 = false; });
orientCompass.addEventListener('touchstart', (e) => { draggingOrient3 = true; updateOrient3(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingOrient3) updateOrient3(e.touches[0]); });
document.addEventListener('touchend', () => { draggingOrient3 = false; });

document.getElementById('demo2-speed').addEventListener('input', (e) => {
  animation.setParams({ wind: parseFloat(e.target.value) });
});
document.getElementById('demo2-size').addEventListener('input', (e) => {
  animation.setParams({ windSize: parseInt(e.target.value) });
});
document.getElementById('demo2-spacing').addEventListener('input', (e) => {
  animation.setParams({ spacing: parseInt(e.target.value) });
});
document.getElementById('demo2-width').addEventListener('input', (e) => {
  animation.setParams({ width: parseFloat(e.target.value) });
});
document.getElementById('demo2-opacity').addEventListener('input', (e) => {
  animation.setParams({ opacity: parseFloat(e.target.value) });
});
document.getElementById('demo2-color').addEventListener('input', (e) => {
  animation.setParams({ color: e.target.value });
});
document.getElementById('demo2-jitter').addEventListener('input', (e) => {
  animation.setParams({ jitter: parseInt(e.target.value) });
});
document.getElementById('demo2-diameter').addEventListener('input', (e) => {
  animation.setParams({ jitterDiameter: parseInt(e.target.value) });
});
</script>

### Stage 3: Dual Wind Sources

<div class="prompt">
"Let's add an additional wind source, with an independent wind direction and wind speed. Let's model displacement as wave interference between the two wave sources. I'd also like to add a wind density parameter that controls the spacing between wind points of origin."
</div>

Adding a second wind with independent direction and speed created **interference patterns**. The interaction between winds produces complex, naturalistic movement that neither wind creates alone.

**New controls:**
- **Wind 2 Speed/Direction** — A second independent wind source that combines with the first
- **Wind Density** — How many wave cycles fit in the viewport (higher = more turbulent appearance)

<div class="demo-box">
  <div class="demo-canvas-wrapper">
    <canvas id="demo3"></canvas>
    <div class="demo-paused-overlay paused" id="demo3-overlay">
      <button class="play-btn" aria-label="Play">
        <span class="fa-solid fa-circle-play" aria-hidden="true"></span>
      </button>
      <span class="paused-message">Animation paused on mobile. Tap play to start.</span>
    </div>
    <button class="demo-pause-btn" id="demo3-pause" aria-label="Pause">
      <span class="fa-solid fa-circle-pause" aria-hidden="true"></span>
    </button>
  </div>
  <div class="demo-controls">
    <div class="demo-controls-featured">
      <div class="demo-controls-row">
        <div class="control-group">
          <label class="control-label">Wind Density</label>
          <div class="slider-container">
            <input type="range" id="demo3-density" min="0" max="100" value="7">
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Wind Size</label>
          <div class="slider-container">
            <input type="range" id="demo3-size" min="0" max="100" value="99">
          </div>
        </div>
      </div>
      <div class="demo-controls-row">
        <div class="control-group">
          <label class="control-label">Wind 1 Direction</label>
          <div class="compass-small" id="demo3-wind1-compass">
            <span class="compass-direction compass-n">N</span>
            <span class="compass-direction compass-s">S</span>
            <span class="compass-direction compass-e">E</span>
            <span class="compass-direction compass-w">W</span>
            <div class="compass-needle" id="demo3-wind1-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
            <div class="compass-center"></div>
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Wind 1 Speed</label>
          <div class="slider-container">
            <input type="range" id="demo3-wind1" min="0" max="10" value="4" step="0.5">
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Wind 2 Direction</label>
          <div class="compass-small" id="demo3-wind2-compass">
            <span class="compass-direction compass-n">N</span>
            <span class="compass-direction compass-s">S</span>
            <span class="compass-direction compass-e">E</span>
            <span class="compass-direction compass-w">W</span>
            <div class="compass-needle" id="demo3-wind2-needle" style="transform: translateX(-50%) translateY(-100%) rotate(-45deg);"></div>
            <div class="compass-center"></div>
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Wind 2 Speed</label>
          <div class="slider-container">
            <input type="range" id="demo3-wind2" min="0" max="10" value="3" step="0.5">
          </div>
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Jitter Amount</label>
        <div class="slider-container">
          <input type="range" id="demo3-jitter" min="0" max="100" value="1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Jitter Diameter</label>
        <div class="slider-container">
          <input type="range" id="demo3-diameter" min="5" max="40" value="22">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Line Direction</label>
        <div class="compass-small" id="demo3-orient-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo3-orient-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Spacing</label>
        <div class="slider-container">
          <input type="range" id="demo3-spacing" min="4" max="20" value="7">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Width</label>
        <div class="slider-container">
          <input type="range" id="demo3-width" min="0.3" max="2" value="0.7" step="0.1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Opacity</label>
        <div class="slider-container">
          <input type="range" id="demo3-opacity" min="0" max="1" value="0.9" step="0.1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Color</label>
        <input type="color" id="demo3-color" value="#b4afa5">
      </div>
    </div>
  </div>
</div>

<script type="module">
import { LineFieldAnimation } from '/assets/js/line-field.js';

const canvas = document.getElementById('demo3');
const animation = new LineFieldAnimation(canvas, {
  mode: 'container',
  params: {
    spacing: 7,
    width: 0.7,
    wind: 4.0,
    windDirection: Math.PI / 2,
    wind2: 3.0,
    wind2Direction: -Math.PI * 3 / 4,
    jitter: 1,
    jitterDiameter: 22,
    windDensity: 7,
    windSize: 99,
    opacityDepthFactor: 0,
    lineOrientation: Math.PI / 2,
    color: '#b4afa5'
  }
});
setupAnimatedDemo(animation, 'demo3', 'demo3-overlay', 'demo3-pause');

// Wind 2 compass (featured)
const wind2Compass = document.getElementById('demo3-wind2-compass');
const wind2Needle = document.getElementById('demo3-wind2-needle');
let draggingWind2_4 = false;

function updateWind2_4(e) {
  const rect = wind2Compass.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ wind2Direction: angle });
  wind2Needle.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}

wind2Compass.addEventListener('mousedown', (e) => { draggingWind2_4 = true; updateWind2_4(e); });
document.addEventListener('mousemove', (e) => { if (draggingWind2_4) updateWind2_4(e); });
document.addEventListener('mouseup', () => { draggingWind2_4 = false; });
wind2Compass.addEventListener('touchstart', (e) => { draggingWind2_4 = true; updateWind2_4(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingWind2_4) updateWind2_4(e.touches[0]); });
document.addEventListener('touchend', () => { draggingWind2_4 = false; });

// Wind 1 compass
const wind1Compass = document.getElementById('demo3-wind1-compass');
const wind1Needle = document.getElementById('demo3-wind1-needle');
let draggingWind1_4 = false;

function updateWind1_4(e) {
  const rect = wind1Compass.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ windDirection: angle });
  wind1Needle.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}

wind1Compass.addEventListener('mousedown', (e) => { draggingWind1_4 = true; updateWind1_4(e); });
document.addEventListener('mousemove', (e) => { if (draggingWind1_4) updateWind1_4(e); });
document.addEventListener('mouseup', () => { draggingWind1_4 = false; });
wind1Compass.addEventListener('touchstart', (e) => { draggingWind1_4 = true; updateWind1_4(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingWind1_4) updateWind1_4(e.touches[0]); });
document.addEventListener('touchend', () => { draggingWind1_4 = false; });

// Orient compass
const orientCompass = document.getElementById('demo3-orient-compass');
const orientNeedle = document.getElementById('demo3-orient-needle');
let draggingOrient4 = false;

function updateOrient4(e) {
  const rect = orientCompass.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ lineOrientation: angle });
  orientNeedle.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}

orientCompass.addEventListener('mousedown', (e) => { draggingOrient4 = true; updateOrient4(e); });
document.addEventListener('mousemove', (e) => { if (draggingOrient4) updateOrient4(e); });
document.addEventListener('mouseup', () => { draggingOrient4 = false; });
orientCompass.addEventListener('touchstart', (e) => { draggingOrient4 = true; updateOrient4(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingOrient4) updateOrient4(e.touches[0]); });
document.addEventListener('touchend', () => { draggingOrient4 = false; });

document.getElementById('demo3-wind2').addEventListener('input', (e) => {
  animation.setParams({ wind2: parseFloat(e.target.value) });
});
document.getElementById('demo3-wind1').addEventListener('input', (e) => {
  animation.setParams({ wind: parseFloat(e.target.value) });
});
document.getElementById('demo3-density').addEventListener('input', (e) => {
  animation.setParams({ windDensity: parseInt(e.target.value) });
});
document.getElementById('demo3-size').addEventListener('input', (e) => {
  animation.setParams({ windSize: parseInt(e.target.value) });
});
document.getElementById('demo3-spacing').addEventListener('input', (e) => {
  animation.setParams({ spacing: parseInt(e.target.value) });
});
document.getElementById('demo3-width').addEventListener('input', (e) => {
  animation.setParams({ width: parseFloat(e.target.value) });
});
document.getElementById('demo3-jitter').addEventListener('input', (e) => {
  animation.setParams({ jitter: parseInt(e.target.value) });
});
document.getElementById('demo3-diameter').addEventListener('input', (e) => {
  animation.setParams({ jitterDiameter: parseInt(e.target.value) });
});
document.getElementById('demo3-opacity').addEventListener('input', (e) => {
  animation.setParams({ opacity: parseFloat(e.target.value) });
});
document.getElementById('demo3-color').addEventListener('input', (e) => {
  animation.setParams({ color: e.target.value });
});
</script>

### Stage 4: Depth Effect

<div class="prompt">
"I'd like to add depth. Let's imagine the field of lines as a horizontal plane. Lines displaced above the plane appear closer to the viewer. Lines displaced below the plane appear farther away. I'd like a depth effect parameter that controls the opacity. When set to 0, all lines appear with constant opacity regardless of displacement. When set to 10, lines with greatest negative displacement (i.e. lines that appear to be further away) have 0 opacity and are fully translucent.
</div>

Using the noise displacement value to **modulate opacity**: points that displace more appear "closer" and more opaque. This simple trick adds surprising depth to a 2D animation.

**New control:**
- **Depth Effect** — How strongly displacement affects opacity (0 = uniform opacity, 1 = maximum depth variation)

<div class="demo-box">
  <div class="demo-canvas-wrapper">
    <canvas id="demo4"></canvas>
    <div class="demo-paused-overlay paused" id="demo4-overlay">
      <button class="play-btn" aria-label="Play">
        <span class="fa-solid fa-circle-play" aria-hidden="true"></span>
      </button>
      <span class="paused-message">Animation paused on mobile. Tap play to start.</span>
    </div>
    <button class="demo-pause-btn" id="demo4-pause" aria-label="Pause">
      <span class="fa-solid fa-circle-pause" aria-hidden="true"></span>
    </button>
  </div>
  <div class="demo-controls">
    <div class="demo-controls-featured">
      <div class="control-group">
        <label class="control-label">Depth Effect</label>
        <div class="slider-container">
          <input type="range" id="demo4-depth" min="0" max="1" value="0.6" step="0.1">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Wind Density</label>
        <div class="slider-container">
          <input type="range" id="demo4-density" min="0" max="100" value="7">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind Size</label>
        <div class="slider-container">
          <input type="range" id="demo4-size" min="0" max="100" value="99">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Wind 1 Direction</label>
        <div class="compass-small" id="demo4-wind1-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo4-wind1-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 1 Speed</label>
        <div class="slider-container">
          <input type="range" id="demo4-wind1" min="0" max="10" value="4" step="0.5">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 2 Direction</label>
        <div class="compass-small" id="demo4-wind2-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo4-wind2-needle" style="transform: translateX(-50%) translateY(-100%) rotate(-45deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 2 Speed</label>
        <div class="slider-container">
          <input type="range" id="demo4-wind2" min="0" max="10" value="3" step="0.5">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Jitter Amount</label>
        <div class="slider-container">
          <input type="range" id="demo4-jitter" min="0" max="100" value="1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Jitter Diameter</label>
        <div class="slider-container">
          <input type="range" id="demo4-diameter" min="5" max="40" value="22">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Line Direction</label>
        <div class="compass-small" id="demo4-orient-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo4-orient-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Spacing</label>
        <div class="slider-container">
          <input type="range" id="demo4-spacing" min="4" max="20" value="7">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Opacity</label>
        <div class="slider-container">
          <input type="range" id="demo4-opacity" min="0" max="1" value="0.9" step="0.1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Color</label>
        <input type="color" id="demo4-color" value="#b4afa5">
      </div>
    </div>
  </div>
</div>

<script type="module">
import { LineFieldAnimation } from '/assets/js/line-field.js';

const canvas = document.getElementById('demo4');
const animation = new LineFieldAnimation(canvas, {
  mode: 'container',
  params: {
    spacing: 7,
    width: 0.7,
    wind: 4.0,
    windDirection: Math.PI / 2,
    wind2: 3.0,
    wind2Direction: -Math.PI * 3 / 4,
    jitter: 1,
    jitterDiameter: 22,
    windDensity: 7,
    windSize: 99,
    opacityDepthFactor: 0.6,
    lineOrientation: Math.PI / 2,
    color: '#b4afa5'
  }
});
setupAnimatedDemo(animation, 'demo4', 'demo4-overlay', 'demo4-pause');

// Wind 1 compass
const wind1Compass5 = document.getElementById('demo4-wind1-compass');
const wind1Needle5 = document.getElementById('demo4-wind1-needle');
let draggingW1_5 = false;
function updateW1_5(e) {
  const rect = wind1Compass5.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ windDirection: angle });
  wind1Needle5.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
wind1Compass5.addEventListener('mousedown', (e) => { draggingW1_5 = true; updateW1_5(e); });
document.addEventListener('mousemove', (e) => { if (draggingW1_5) updateW1_5(e); });
document.addEventListener('mouseup', () => { draggingW1_5 = false; });
wind1Compass5.addEventListener('touchstart', (e) => { draggingW1_5 = true; updateW1_5(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingW1_5) updateW1_5(e.touches[0]); });
document.addEventListener('touchend', () => { draggingW1_5 = false; });

// Wind 2 compass
const wind2Compass5 = document.getElementById('demo4-wind2-compass');
const wind2Needle5 = document.getElementById('demo4-wind2-needle');
let draggingW2_5 = false;
function updateW2_5(e) {
  const rect = wind2Compass5.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ wind2Direction: angle });
  wind2Needle5.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
wind2Compass5.addEventListener('mousedown', (e) => { draggingW2_5 = true; updateW2_5(e); });
document.addEventListener('mousemove', (e) => { if (draggingW2_5) updateW2_5(e); });
document.addEventListener('mouseup', () => { draggingW2_5 = false; });
wind2Compass5.addEventListener('touchstart', (e) => { draggingW2_5 = true; updateW2_5(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingW2_5) updateW2_5(e.touches[0]); });
document.addEventListener('touchend', () => { draggingW2_5 = false; });

// Orient compass
const orientCompass5 = document.getElementById('demo4-orient-compass');
const orientNeedle5 = document.getElementById('demo4-orient-needle');
let draggingO5 = false;
function updateO5(e) {
  const rect = orientCompass5.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ lineOrientation: angle });
  orientNeedle5.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
orientCompass5.addEventListener('mousedown', (e) => { draggingO5 = true; updateO5(e); });
document.addEventListener('mousemove', (e) => { if (draggingO5) updateO5(e); });
document.addEventListener('mouseup', () => { draggingO5 = false; });
orientCompass5.addEventListener('touchstart', (e) => { draggingO5 = true; updateO5(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingO5) updateO5(e.touches[0]); });
document.addEventListener('touchend', () => { draggingO5 = false; });

document.getElementById('demo4-depth').addEventListener('input', (e) => {
  animation.setParams({ opacityDepthFactor: parseFloat(e.target.value) });
});
document.getElementById('demo4-density').addEventListener('input', (e) => {
  animation.setParams({ windDensity: parseInt(e.target.value) });
});
document.getElementById('demo4-wind1').addEventListener('input', (e) => {
  animation.setParams({ wind: parseFloat(e.target.value) });
});
document.getElementById('demo4-wind2').addEventListener('input', (e) => {
  animation.setParams({ wind2: parseFloat(e.target.value) });
});
document.getElementById('demo4-size').addEventListener('input', (e) => {
  animation.setParams({ windSize: parseInt(e.target.value) });
});
document.getElementById('demo4-spacing').addEventListener('input', (e) => {
  animation.setParams({ spacing: parseInt(e.target.value) });
});
document.getElementById('demo4-jitter').addEventListener('input', (e) => {
  animation.setParams({ jitter: parseInt(e.target.value) });
});
document.getElementById('demo4-diameter').addEventListener('input', (e) => {
  animation.setParams({ jitterDiameter: parseInt(e.target.value) });
});
document.getElementById('demo4-opacity').addEventListener('input', (e) => {
  animation.setParams({ opacity: parseFloat(e.target.value) });
});
document.getElementById('demo4-color').addEventListener('input', (e) => {
  animation.setParams({ color: e.target.value });
});
</script>

### Stage 5: Whisp Effect

<div class="prompt">
"Can we make individual wind elements feel more whispy?"
</div>

I left this prompt intentionally vague to see how the model would respond. First it attempted to add per-point turbulence, but this was too noisy. Eventually, we settled on this concept of "whisp", which controls the intensity of wave amplitude on the displacement of clusters of lines.

Whisp as a control works well with jitter, but they are distinct controls. Jitter is a parameter that influences lines independently, and alters the line's offset in relation to a wave. Whisp is a source of noise that moves slowly over the field and influences clusters of lines. As whisp noise moves over clusters of lines, it multiplies the amplitude of independent waves (i.e. wind) interacting with the same cluster of lines. This means whisp is an independent temporal noise source that moves through the field lines, independently of the two wind sources, allowing for temporary stronger wind effects.

**New control:**
- **Whisp** — Per-line variation in wind response (0 = all lines move uniformly, higher = some lines and their neighbors catch more wind than others)

<div class="demo-box">
  <div class="demo-canvas-wrapper">
    <canvas id="demo5"></canvas>
    <div class="demo-paused-overlay paused" id="demo5-overlay">
      <button class="play-btn" aria-label="Play">
        <span class="fa-solid fa-circle-play" aria-hidden="true"></span>
      </button>
      <span class="paused-message">Animation paused on mobile. Tap play to start.</span>
    </div>
    <button class="demo-pause-btn" id="demo5-pause" aria-label="Pause">
      <span class="fa-solid fa-circle-pause" aria-hidden="true"></span>
    </button>
  </div>
  <div class="demo-controls">
    <div class="demo-controls-featured">
      <div class="control-group">
        <label class="control-label">Whisp</label>
        <div class="slider-container">
          <input type="range" id="demo5-whisp" min="0" max="100" value="50">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Depth Effect</label>
        <div class="slider-container">
          <input type="range" id="demo5-depth" min="0" max="1" value="0.6" step="0.1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind Density</label>
        <div class="slider-container">
          <input type="range" id="demo5-density" min="0" max="100" value="7">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind Size</label>
        <div class="slider-container">
          <input type="range" id="demo5-size" min="0" max="100" value="99">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Wind 1 Direction</label>
        <div class="compass-small" id="demo5-wind1-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo5-wind1-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 1 Speed</label>
        <div class="slider-container">
          <input type="range" id="demo5-wind1" min="0" max="10" value="4" step="0.5">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 2 Direction</label>
        <div class="compass-small" id="demo5-wind2-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo5-wind2-needle" style="transform: translateX(-50%) translateY(-100%) rotate(-45deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 2 Speed</label>
        <div class="slider-container">
          <input type="range" id="demo5-wind2" min="0" max="10" value="3" step="0.5">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Jitter Amount</label>
        <div class="slider-container">
          <input type="range" id="demo5-jitter" min="0" max="100" value="1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Jitter Diameter</label>
        <div class="slider-container">
          <input type="range" id="demo5-diameter" min="5" max="40" value="22">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Line Direction</label>
        <div class="compass-small" id="demo5-orient-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo5-orient-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Spacing</label>
        <div class="slider-container">
          <input type="range" id="demo5-spacing" min="4" max="20" value="7">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Opacity</label>
        <div class="slider-container">
          <input type="range" id="demo5-opacity" min="0" max="1" value="0.9" step="0.1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Color</label>
        <input type="color" id="demo5-color" value="#b4afa5">
      </div>
    </div>
  </div>
</div>

<script type="module">
import { LineFieldAnimation } from '/assets/js/line-field.js';

const canvas = document.getElementById('demo5');
const animation = new LineFieldAnimation(canvas, {
  mode: 'container',
  params: {
    spacing: 7,
    width: 0.7,
    wind: 4.0,
    windDirection: Math.PI / 2,
    wind2: 3.0,
    wind2Direction: -Math.PI * 3 / 4,
    jitter: 1,
    jitterDiameter: 22,
    windDensity: 7,
    windSize: 99,
    opacityDepthFactor: 0.6,
    whisp: 50,
    lineOrientation: Math.PI / 2,
    color: '#b4afa5'
  }
});
setupAnimatedDemo(animation, 'demo5', 'demo5-overlay', 'demo5-pause');

// Wind 1 compass
const wind1Compass6 = document.getElementById('demo5-wind1-compass');
const wind1Needle6 = document.getElementById('demo5-wind1-needle');
let draggingW1_6 = false;
function updateW1_6(e) {
  const rect = wind1Compass6.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ windDirection: angle });
  wind1Needle6.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
wind1Compass6.addEventListener('mousedown', (e) => { draggingW1_6 = true; updateW1_6(e); });
document.addEventListener('mousemove', (e) => { if (draggingW1_6) updateW1_6(e); });
document.addEventListener('mouseup', () => { draggingW1_6 = false; });
wind1Compass6.addEventListener('touchstart', (e) => { draggingW1_6 = true; updateW1_6(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingW1_6) updateW1_6(e.touches[0]); });
document.addEventListener('touchend', () => { draggingW1_6 = false; });

// Wind 2 compass
const wind2Compass6 = document.getElementById('demo5-wind2-compass');
const wind2Needle6 = document.getElementById('demo5-wind2-needle');
let draggingW2_6 = false;
function updateW2_6(e) {
  const rect = wind2Compass6.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ wind2Direction: angle });
  wind2Needle6.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
wind2Compass6.addEventListener('mousedown', (e) => { draggingW2_6 = true; updateW2_6(e); });
document.addEventListener('mousemove', (e) => { if (draggingW2_6) updateW2_6(e); });
document.addEventListener('mouseup', () => { draggingW2_6 = false; });
wind2Compass6.addEventListener('touchstart', (e) => { draggingW2_6 = true; updateW2_6(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingW2_6) updateW2_6(e.touches[0]); });
document.addEventListener('touchend', () => { draggingW2_6 = false; });

// Orient compass
const orientCompass6 = document.getElementById('demo5-orient-compass');
const orientNeedle6 = document.getElementById('demo5-orient-needle');
let draggingO6 = false;
function updateO6(e) {
  const rect = orientCompass6.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ lineOrientation: angle });
  orientNeedle6.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
orientCompass6.addEventListener('mousedown', (e) => { draggingO6 = true; updateO6(e); });
document.addEventListener('mousemove', (e) => { if (draggingO6) updateO6(e); });
document.addEventListener('mouseup', () => { draggingO6 = false; });
orientCompass6.addEventListener('touchstart', (e) => { draggingO6 = true; updateO6(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingO6) updateO6(e.touches[0]); });
document.addEventListener('touchend', () => { draggingO6 = false; });

document.getElementById('demo5-whisp').addEventListener('input', (e) => {
  animation.setParams({ whisp: parseInt(e.target.value) });
});
document.getElementById('demo5-depth').addEventListener('input', (e) => {
  animation.setParams({ opacityDepthFactor: parseFloat(e.target.value) });
});
document.getElementById('demo5-wind1').addEventListener('input', (e) => {
  animation.setParams({ wind: parseFloat(e.target.value) });
});
document.getElementById('demo5-wind2').addEventListener('input', (e) => {
  animation.setParams({ wind2: parseFloat(e.target.value) });
});
document.getElementById('demo5-size').addEventListener('input', (e) => {
  animation.setParams({ windSize: parseInt(e.target.value) });
});
document.getElementById('demo5-density').addEventListener('input', (e) => {
  animation.setParams({ windDensity: parseInt(e.target.value) });
});
document.getElementById('demo5-spacing').addEventListener('input', (e) => {
  animation.setParams({ spacing: parseInt(e.target.value) });
});
document.getElementById('demo5-jitter').addEventListener('input', (e) => {
  animation.setParams({ jitter: parseInt(e.target.value) });
});
document.getElementById('demo5-diameter').addEventListener('input', (e) => {
  animation.setParams({ jitterDiameter: parseInt(e.target.value) });
});
document.getElementById('demo5-opacity').addEventListener('input', (e) => {
  animation.setParams({ opacity: parseFloat(e.target.value) });
});
document.getElementById('demo5-color').addEventListener('input', (e) => {
  animation.setParams({ color: e.target.value });
});
</script>

### Stage 6: Gusts

<div class="prompt">
"Let's add a gust parameter that controls the rate of wind noise generation for the two wind sources."
</div>

Wind speed sets the maximum intensity. Gust modulates how much of that maximum is active in different regions.
Slow-moving spatial noise modulates each wind's intensity. At low gust values, you see **calm areas punctuated by gusts** sweeping through.

**New controls:**
- **Wind 1 Gust** — Oscillation envelope for the first wind (10 = constant, 1 = mostly calm with occasional gusts)
- **Wind 2 Gust** — Oscillation envelope for the second wind (independent of Wind 1)

<div class="demo-box">
  <div class="demo-canvas-wrapper">
    <canvas id="demo6"></canvas>
    <div class="demo-paused-overlay paused" id="demo6-overlay">
      <button class="play-btn" aria-label="Play">
        <span class="fa-solid fa-circle-play" aria-hidden="true"></span>
      </button>
      <span class="paused-message">Animation paused on mobile. Tap play to start.</span>
    </div>
    <button class="demo-pause-btn" id="demo6-pause" aria-label="Pause">
      <span class="fa-solid fa-circle-pause" aria-hidden="true"></span>
    </button>
  </div>
  <div class="demo-controls">
    <div class="demo-controls-featured">
      <div class="control-group">
        <label class="control-label">Wind 1 Gust</label>
        <div class="slider-container">
          <input type="range" id="demo6-gust1" min="1" max="10" value="3">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 2 Gust</label>
        <div class="slider-container">
          <input type="range" id="demo6-gust2" min="1" max="10" value="3">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Whisp</label>
        <div class="slider-container">
          <input type="range" id="demo6-whisp" min="0" max="100" value="30">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Depth Effect</label>
        <div class="slider-container">
          <input type="range" id="demo6-depth" min="0" max="1" value="0.6" step="0.1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind Density</label>
        <div class="slider-container">
          <input type="range" id="demo6-density" min="0" max="100" value="7">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind Size</label>
        <div class="slider-container">
          <input type="range" id="demo6-size" min="0" max="100" value="99">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Wind 1 Direction</label>
        <div class="compass-small" id="demo6-wind1-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo6-wind1-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 1 Speed</label>
        <div class="slider-container">
          <input type="range" id="demo6-wind1" min="0" max="10" value="4" step="0.5">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 2 Direction</label>
        <div class="compass-small" id="demo6-wind2-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo6-wind2-needle" style="transform: translateX(-50%) translateY(-100%) rotate(-45deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Wind 2 Speed</label>
        <div class="slider-container">
          <input type="range" id="demo6-wind2" min="0" max="10" value="3" step="0.5">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Jitter Amount</label>
        <div class="slider-container">
          <input type="range" id="demo6-jitter" min="0" max="100" value="1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Jitter Diameter</label>
        <div class="slider-container">
          <input type="range" id="demo6-diameter" min="5" max="40" value="22">
        </div>
      </div>
    </div>
    <div class="demo-controls-row">
      <div class="control-group">
        <label class="control-label">Line Direction</label>
        <div class="compass-small" id="demo6-orient-compass">
          <span class="compass-direction compass-n">N</span>
          <span class="compass-direction compass-s">S</span>
          <span class="compass-direction compass-e">E</span>
          <span class="compass-direction compass-w">W</span>
          <div class="compass-needle" id="demo6-orient-needle" style="transform: translateX(-50%) translateY(-100%) rotate(180deg);"></div>
          <div class="compass-center"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Spacing</label>
        <div class="slider-container">
          <input type="range" id="demo6-spacing" min="4" max="20" value="7">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Opacity</label>
        <div class="slider-container">
          <input type="range" id="demo6-opacity" min="0" max="1" value="0.9" step="0.1">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Line Color</label>
        <input type="color" id="demo6-color" value="#b4afa5">
      </div>
    </div>
  </div>
</div>

<script type="module">
import { LineFieldAnimation } from '/assets/js/line-field.js';

const canvas = document.getElementById('demo6');
const animation = new LineFieldAnimation(canvas, {
  mode: 'container',
  params: {
    spacing: 7,
    width: 0.7,
    wind: 4,
    windDirection: Math.PI / 2,
    windOscillation: 3,
    wind2: 3,
    wind2Direction: -Math.PI * 3 / 4,
    wind2Oscillation: 3,
    jitter: 1,
    jitterDiameter: 22,
    windDensity: 7,
    windSize: 99,
    opacityDepthFactor: 0.6,
    whisp: 30,
    lineOrientation: Math.PI / 2,
    color: '#b4afa5'
  }
});
setupAnimatedDemo(animation, 'demo6', 'demo6-overlay', 'demo6-pause');

// Wind 1 compass
const wind1Compass7 = document.getElementById('demo6-wind1-compass');
const wind1Needle7 = document.getElementById('demo6-wind1-needle');
let draggingW1_7 = false;
function updateW1_7(e) {
  const rect = wind1Compass7.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ windDirection: angle });
  wind1Needle7.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
wind1Compass7.addEventListener('mousedown', (e) => { draggingW1_7 = true; updateW1_7(e); });
document.addEventListener('mousemove', (e) => { if (draggingW1_7) updateW1_7(e); });
document.addEventListener('mouseup', () => { draggingW1_7 = false; });
wind1Compass7.addEventListener('touchstart', (e) => { draggingW1_7 = true; updateW1_7(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingW1_7) updateW1_7(e.touches[0]); });
document.addEventListener('touchend', () => { draggingW1_7 = false; });

// Wind 2 compass
const wind2Compass7 = document.getElementById('demo6-wind2-compass');
const wind2Needle7 = document.getElementById('demo6-wind2-needle');
let draggingW2_7 = false;
function updateW2_7(e) {
  const rect = wind2Compass7.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ wind2Direction: angle });
  wind2Needle7.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
wind2Compass7.addEventListener('mousedown', (e) => { draggingW2_7 = true; updateW2_7(e); });
document.addEventListener('mousemove', (e) => { if (draggingW2_7) updateW2_7(e); });
document.addEventListener('mouseup', () => { draggingW2_7 = false; });
wind2Compass7.addEventListener('touchstart', (e) => { draggingW2_7 = true; updateW2_7(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingW2_7) updateW2_7(e.touches[0]); });
document.addEventListener('touchend', () => { draggingW2_7 = false; });

// Orient compass
const orientCompass7 = document.getElementById('demo6-orient-compass');
const orientNeedle7 = document.getElementById('demo6-orient-needle');
let draggingO7 = false;
function updateO7(e) {
  const rect = orientCompass7.getBoundingClientRect();
  const angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2);
  animation.setParams({ lineOrientation: angle });
  orientNeedle7.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle * 180/Math.PI + 90}deg)`;
}
orientCompass7.addEventListener('mousedown', (e) => { draggingO7 = true; updateO7(e); });
document.addEventListener('mousemove', (e) => { if (draggingO7) updateO7(e); });
document.addEventListener('mouseup', () => { draggingO7 = false; });
orientCompass7.addEventListener('touchstart', (e) => { draggingO7 = true; updateO7(e.touches[0]); e.preventDefault(); });
document.addEventListener('touchmove', (e) => { if (draggingO7) updateO7(e.touches[0]); });
document.addEventListener('touchend', () => { draggingO7 = false; });

document.getElementById('demo6-gust1').addEventListener('input', (e) => {
  animation.setParams({ windOscillation: parseInt(e.target.value) });
});
document.getElementById('demo6-gust2').addEventListener('input', (e) => {
  animation.setParams({ wind2Oscillation: parseInt(e.target.value) });
});
document.getElementById('demo6-whisp').addEventListener('input', (e) => {
  animation.setParams({ whisp: parseInt(e.target.value) });
});
document.getElementById('demo6-depth').addEventListener('input', (e) => {
  animation.setParams({ opacityDepthFactor: parseFloat(e.target.value) });
});
document.getElementById('demo6-wind1').addEventListener('input', (e) => {
  animation.setParams({ wind: parseFloat(e.target.value) });
});
document.getElementById('demo6-wind2').addEventListener('input', (e) => {
  animation.setParams({ wind2: parseFloat(e.target.value) });
});
document.getElementById('demo6-size').addEventListener('input', (e) => {
  animation.setParams({ windSize: parseInt(e.target.value) });
});
document.getElementById('demo6-density').addEventListener('input', (e) => {
  animation.setParams({ windDensity: parseInt(e.target.value) });
});
document.getElementById('demo6-spacing').addEventListener('input', (e) => {
  animation.setParams({ spacing: parseInt(e.target.value) });
});
document.getElementById('demo6-jitter').addEventListener('input', (e) => {
  animation.setParams({ jitter: parseInt(e.target.value) });
});
document.getElementById('demo6-diameter').addEventListener('input', (e) => {
  animation.setParams({ jitterDiameter: parseInt(e.target.value) });
});
document.getElementById('demo6-opacity').addEventListener('input', (e) => {
  animation.setParams({ opacity: parseFloat(e.target.value) });
});
document.getElementById('demo6-color').addEventListener('input', (e) => {
  animation.setParams({ color: e.target.value });
});
</script>

---

## Prompting for Creative Code

What surprised me most was how well conversational iteration works for this kind of project. Each prompt built on the last, and the AI maintained context about what we'd built.

A few patterns that worked well:

**Start vague, then refine**: "Add a subtle animation" -> "Make it wave" -> "Add wind direction" -> "Two wind sources"

**Incorporate feeling without controlling implementation**: "Make it feel more whispy" would often lead to a better solution than "add turbulence to each point."

**Iterate via feedback**: When the first whisp implementation felt wrong, describing *why* ("too choppy, no gradual movement") helped find a better approach.

**Use a sandbox**: Adjusting parameters live and experimenting at the extreme ends of values is often more intuitive than reading the code alone.

---

## The Sandbox: Playing with Parameters

I find the general recipe of **build a sandbox first, then refine through iteration** works surprisingly well across a broad range of problems, not just for creative coding and play like this animation exercise. The underlying principle, which echoes themes from REPL-driven development, is the faster your feedback loop, the more you can explore and sample from the solution space to find an ideal solution.

If you want to play with the sandbox I used to create this animation yourself, visit the [animations sandbox](/animations) and experiment. And if you build something interesting, I'd love to see it.

---

## Future Directions

This line field animation was just a fun idea I had, but there are others I would like to explore:

### Genetic Animations

What if parameters evolved over time based on fitness functions? Lines that "survive" based on aesthetic criteria, gradually evolving toward interesting configurations.

### Layered Animations

Multiple animation layers with different parameters, composited with blend modes. A fast, fine-grained layer over a slow, broad layer could create rich depth.

### Interactive Response

Animations that respond to mouse position or cursor movement. Wind that flows away from the cursor, or lines that orient toward it.

### Graph-Based Visualizations

Instead of parallel lines, what about connected graphs? Nodes that drift with noise, edges that stretch and compress, creating organic network visualizations.

### Audio-Reactive

Parameters modulated by audio input—bass driving wind speed, treble affecting jitter. The animation becomes a visualizer.

---

## LLM's open new dimensions

What started as an amusing simple background animation experiment quickly became an exploration of noise functions, wave interference, and the expressive power of parameterized systems.

I would never have spent the time learning and playing with traveling planar waves, simplex noise, or linear interpolation, if it weren't for the ease by which LLM's enable this form of play. Just as each parameter in the animation opens a dimension of variation, LLM's open a dimension of infinite creativity and exploration.
