// Console log combinator that resolves a promise after logging a message.
function consoleLog(msg) {
  return ((resolve) => { console.log(msg); return resolve() });
}

// Sleeps for a given number of milliseconds.
function sleep(ms) {
  return ((resolve) => setTimeout(resolve, ms));
}

// Returns a promise that resolves after executing the given operation.
function promise(op) {
  return new Promise((resolve, reject) => op(resolve, reject))
}

// Returns a function that resolves a promise with the given operation.
function resolveWith(op) {
  return ((resolve) => op(resolve));
}

// Returns a function that resolves a promise with the given operation,
// allowing the operation to be called recursively.
function resolveWithFix(op) {
  return ((resolve) => op(op, resolve));
}

// Animate a target element using the provided iterator and input string.
function animate(target, input, iterator, opts) {
  return resolveWithFix(iterator(target, input, opts));
}

function charIterator(target, input, externalOpts = {}) {
  // Initialize and close over the iterator state.
  const opts = {
    ...externalOpts,
    index: 0,
    input: input,
    queue: [],
    output: "",
    outputWithOpacity: "",
    initialOpacity: 0, // Initial opacity for characters.
    steps: externalOpts.steps ?? 20, // Number of steps for the animation. Increasing this will make the animation appear "smoother" and its duration longer.
    delay: externalOpts.delay ?? 20, // Delay applied to each recursive call in milliseconds. Increasing this will make the animation appear slower.
    status: "running",
  };
  function reset() {
    opts.index = 0;
    opts.queue = [];
    opts.outputWithOpacity = "";
    opts.status = "paused";
  }
  var domCtx = document.getElementById(target);

  const runner = function(op, next) {
    promise(
      resolveWith((next) => {
        setTimeout(() => {
          promise(
            resolveWith((next) => {
              opts.output = "";
              if (opts.index < opts.input.length) {
                const char = input[opts.index];
                opts.queue.push({ char: char, opacity: opts.initialOpacity });
              }
              return next();
            })
          ).then(() => {
            opts.queue = opts.queue.filter((current) => {
              if (current.opacity >= 100) {
                if (current.char === '\n') {
                  opts.outputWithOpacity += `<br>`;
                  return false;
                }

                opts.outputWithOpacity += `<span style="opacity: ${current.opacity}%">${current.char}</span>`;
                return false;
              }

              current.opacity += (100 / opts.steps);
              if (current.char === '\n') {
                opts.output += `<br>`;
              } else {
                opts.output += `<span style="opacity: ${current.opacity}%">${current.char}</span>`;
              }

              return true;
            });
          })
          return next();
        }, opts.delay);
      })
    ).then(() =>
      promise(
        resolveWith((next) => {
          domCtx.innerHTML = opts.outputWithOpacity + opts.output;
          opts.index++;
          return next();
        })
      )
    ).then(() => {
      // If the status is paused or canceled, we abort the recursion.
      if (opts.status !== "running") return next();

      // If the index exceeds the input string length and the queue is empty, we can abort the recursion,
      // or we can reset the state of the iterator, and loop the animation endlessly.
      if (opts.index >= opts.input.length && opts.queue.length == 0) {
        //return next(); // This is where we would abort.
        reset();
        opts.status = "running";
        domCtx.innerHTML = "";
      }

      // Otherwise, we use a Y-combinator to continue the recursion.
      op(op, next, opts)
    })
  }

  return { runner, opts, reset };
}

// Returns a recursive iterator that animates words in the input string, fading them in sequentially.
function wordIterator(target, input, externalOpts = {}) {
  // Initialize and close over the iterator state.
  var opts = {
    ...externalOpts,
    index: 0,
    // This approach could be improved,  but for simplicity, we replace newlines with a special word "newline" and split the input string by whitespace.
    inputWords: input.replaceAll("\n", " newline ").trim().split(/\s+/),
    queue: [],
    output: "",
    outputWithOpacity: "",
    initialOpacity: 0, // Initial opacity for characters.
    steps: externalOpts.steps ?? 20, // Number of steps for the animation. Increasing this will make the animation appear "smoother" and its duration longer.
    delay: externalOpts.delay ?? 20, // Delay applied to each recursive call in milliseconds. Increasing this will make the animation appear slower.
    status: "running",
  };
  function reset() {
    opts.index = 0;
    opts.queue = [];
    opts.outputWithOpacity = "";
    opts.status = "paused";
  }
  var domCtx = document.getElementById(target);

  const runner = function(op, next) {
    promise(
      resolveWith((next) => {
        setTimeout(() => {
          promise(
            resolveWith((next) => {
              opts.output = "";
              if (opts.index < opts.inputWords.length) {
                const word = opts.inputWords[opts.index];
                opts.queue.push({ word: word, opacity: opts.initialOpacity });
              }
              return next();
            })
          ).then(() => {
            opts.queue = opts.queue.filter((element) => {
              if (element.opacity >= 100) {
                if (element.word === 'newline') {
                  opts.outputWithOpacity += `<br>`;
                  return false;
                }

                opts.outputWithOpacity += `<span style="opacity: ${element.opacity}%">${element.word}</span> `;
                return false;
              }

              element.opacity += (100 / opts.steps);
              if (element.word === 'newline') {
                opts.output += `<br>`;
              } else {
                opts.output += `<span style="opacity: ${element.opacity}%">${element.word}</span> `;
              }

              return true;
            });
          });

          return next();
        }, opts.delay);
      })
    ).then(() =>
      promise(resolveWith((next) => {
        domCtx.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => {
      // If the status is paused or canceled, we abort the recursion.
      if (opts.status === "paused" || opts.status === "canceled") {
        return next(); // skip iteration
      }

      // If the index exceeds the input string length and the queue is empty, we can abort the recursion,
      // or we can reset the state of the iterator, and loop the animation endlessly.
      if (opts.index >= opts.inputWords.length && opts.queue.length == 0) {
        //return next(); // This is where we would abort.
        reset();
        opts.status = "running";
        domCtx.innerHTML = "";
      }


      // Otherwise, we use a Y-combinator to continue the recursion.
      op(op, next, opts);
    })
  }

  return { runner, opts, reset };
}

// Returns a recursive iterator that animates an input string by decorating each word with a random probability and fading it in sequentially.
function wordWithProbabilityIterator(target, input, externalOpts = {}) {
  // Initialize and close over the iterator state.
  var opts = {
    ...externalOpts,
    index: 0,
    // This approach could be improved,  but for simplicity, we replace newlines with a special word "newline" and split the input string by whitespace.
    inputWords: input.replaceAll("\n", " newline ").trim().split(/\s+/),
    queue: [],
    output: "",
    outputWithOpacity: "",
    initialOpacity: 0, // Initial opacity for characters.
    steps: externalOpts.steps ?? 20, // Number of steps for the animation. Increasing this will make the animation appear "smoother" and its duration longer.
    delay: externalOpts.delay ?? 20, // Delay applied to each recursive call in milliseconds. Increasing this will make the animation appear slower.
    status: "running",
  };
  function reset() {
    opts.index = 0;
    opts.queue = [];
    opts.outputWithOpacity = "";
    opts.status = "paused";
  }
  var domCtx = document.getElementById(target);

  const runner = function(op, next) {
    promise(
      resolveWith((next) => {
        setTimeout(() => {
          promise(
            resolveWith((next) => {
              opts.output = "";
              if (opts.index < opts.inputWords.length) {
                const word = opts.inputWords[opts.index];
                opts.queue.push({ word: word, opacity: opts.initialOpacity, probability: Math.random().toFixed(2) });
              }
              return next();
            })
          ).then(() => {
            opts.queue = opts.queue.filter((element) => {
              if (element.opacity >= 100) {
                if (element.word === 'newline') {
                  opts.outputWithOpacity += `<br>`;
                  return false;
                }

                opts.outputWithOpacity += `<span style="opacity: ${element.opacity}%">${element.word}</span> `;
                return false;
              }

              element.opacity += (100 / opts.steps);
              if (element.word === 'newline') {
                opts.output += `<br>`;
              } else {
                opts.output += `
                  <span style="position: relative; opacity: ${element.opacity}%" title="${element.probability}">
                    ${element.word}
                    <span style="font-size: 7px; position: absolute; bottom: 12px; left: 5px;">
                      ${element.probability}
                    </span>
                  </span>
                `;
              }

              return true;
            });
          });

          return next();
        }, opts.delay);
      })
    ).then(() =>
      promise(resolveWith((next) => {
        domCtx.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => {
      // If the status is paused or canceled, we abort the recursion.
      if (opts.status === "paused" || opts.status === "canceled") {
        return next(); // skip iteration
      }

      // If the index exceeds the input string length and the queue is empty, we can abort the recursion,
      // or we can reset the state of the iterator, and loop the animation endlessly.
      if (opts.index >= opts.inputWords.length && opts.queue.length == 0) {
        //return next(); // This is where we would abort.
        reset();
        opts.status = "running";
        domCtx.innerHTML = "";
      }

      // Otherwise, we use a Y-combinator to continue the recursion.
      op(op, next, opts);
    })
  }

  return { runner, opts, reset };
}

// Main function responsible for initializing and executing all animations.
// This is not serious code, please do not use this.
function main(input, opts) {
  promise(resolveWith((next) => {
    promise(animate("char", input, charIterator, opts));
    promise(animate("word", input, wordIterator, opts));
    promise(animate("wordWithProbability", input, wordWithProbabilityIterator, opts));
    return next();
  }))
}

// Generated poem from ChatGPT-3.5-turbo using the prompt "Write a poem about generative AI text animation."
const input = 'With fading text, opacity\'s grace,\nA dance of words, in cyberspace.\n\nEach line a tale, a story told,\nFrom the depths of data, it unfolds.\n\nProbabilistic, a realm unknown,\nA digital mind, uniquely grown.\n\nPoetic beauty, in lines entwined,\nA glimpse of art, by code designed.\n\nSo let us ponder, this digital art,\nA symphony of bytes, a work of heart.\n\nGenerative marvel, a wondrous sight,\nA poem born, in the virtual light.\n';
const sliders = [
  { key: "char", fn: charIterator, el: "char" },
  { key: "word", fn: wordIterator, el: "word" },
  { key: "word-probability", fn: wordWithProbabilityIterator, el: "wordWithProbability" }
];

sliders.forEach(({ key, fn, el }) => {
  const stepsSlider = document.getElementById(`steps-${key}`);
  const delaySlider = document.getElementById(`delay-${key}`);
  const stepsValue = document.getElementById(`stepsValue-${key}`);
  const delayValue = document.getElementById(`delayValue-${key}`);
  const playButton = document.getElementById(`play-${key}`);
  const pauseButton = document.getElementById(`pause-${key}`);
  const clearButton = document.getElementById(`clear-${key}`);
  const htmlTarget = document.getElementById(el);

  const steps = parseInt(stepsSlider.value, 10);
  const delay = parseInt(delaySlider.value, 10);
  const stepsVal = ((steps - stepsSlider.min) / (stepsSlider.max - stepsSlider.min)) * 100;
  const delayVal = ((delay - delaySlider.min) / (delaySlider.max - delaySlider.min)) * 100;
  stepsSlider.style.setProperty('--progress', `${stepsVal}%`);
  delaySlider.style.setProperty('--progress', `${delayVal}%`);
  stepsSlider.addEventListener("input", () => {
    const steps = parseInt(stepsSlider.value, 10);
    stepsValue.textContent = steps;
    opts.steps = steps;

    const val = ((steps - stepsSlider.min) / (stepsSlider.max - stepsSlider.min)) * 100;
    stepsSlider.style.setProperty('--progress', `${val}%`);
  });

  delaySlider.addEventListener("input", () => {
    const delay = parseInt(delaySlider.value, 10);
    delayValue.textContent = delay;
    opts.delay = delay;

    const val = ((delay - delaySlider.min) / (delaySlider.max - delaySlider.min)) * 100;
    delaySlider.style.setProperty('--progress', `${val}%`);
  });

  const result = fn(el, input, { steps, delay });
  let runner = result.runner;
  let opts = result.opts;
  let reset = result.reset;

  // Check if we're on mobile (viewport width <= 768px)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Mobile overlay elements
  const overlay = document.getElementById(`overlay-${key}`);
  const overlayPlayBtn = overlay ? overlay.querySelector('.play-btn') : null;

  function hideOverlay() {
    if (overlay) overlay.classList.remove('paused');
  }
  function showOverlay() {
    if (overlay) overlay.classList.add('paused');
  }

  // Start the animation immediately only on desktop.
  if (!isMobile) {
    hideOverlay();
    promise(resolveWithFix(runner));
  } else {
    // On mobile, start in paused state with overlay visible
    opts.status = "paused";
  }

  playButton.addEventListener("click", () => {
    if (opts && (opts.status === "paused" || opts.status === "canceled")) {
      opts.status = "running";
      hideOverlay();
      promise(resolveWithFix(runner));
    }
  });

  // Overlay play button (mobile)
  if (overlayPlayBtn) {
    overlayPlayBtn.addEventListener("click", () => {
      if (opts && (opts.status === "paused" || opts.status === "canceled")) {
        opts.status = "running";
        hideOverlay();
        promise(resolveWithFix(runner));
      }
    });
  }

  pauseButton.addEventListener("click", () => {
    if (opts && opts.status === "running") {
      opts.status = "paused";
      if (isMobile) showOverlay();
    }
  });

  clearButton.addEventListener("click", () => {
    if (opts && opts.status !== "canceled") {
      opts.status = "canceled";
      promise(resolveWithFix(runner)).then(() => {
        reset();
        htmlTarget.textContent = "";
        if (isMobile) showOverlay();
      });
    }
  });
});
