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

// Generated poem from ChatGPT-3.5-turbo using the prompt "Write a poem about generative AI text animation."
var input = 'With fading text, opacity\'s grace,\nA dance of words, in cyberspace.\n\nEach line a tale, a story told,\nFrom the depths of data, it unfolds.\n\nProbabilistic, a realm unknown,\nA digital mind, uniquely grown.\n\nPoetic beauty, in lines entwined,\nA glimpse of art, by code designed.\n\nSo let us ponder, this digital art,\nA symphony of bytes, a work of heart.\n\nGenerative marvel, a wondrous sight,\nA poem born, in the virtual light.\n';

const AnimateText = {
  charContext: null,
  wordContext: null,
  wordProbabilityContext: null,
  delay: 0,
  wordProbabilityDelay: 0,
  initialOpacity: 0,
  inputString: "",
  steps: 0,

  animate: ((animator, input) => resolveWithFix(animator.bind(this))),

  // Produces a generative AI text animation in which each character fades in sequentially.
  charIterator: function(op, next, opts) {
    if (opts == undefined) {
      opts = {};
      opts.index = 0;
      opts.queue = [];
      opts.output = "";
      opts.outputWithOpacity = "";
    }

    if (opts.index > this.inputString.length && opts.queue.length == 0) {
      return next();
    }

    promise(
      resolveWith((next) => {
        setTimeout(() => {
          promise(
            resolveWith((next) => {
              opts.output = "";
              if (opts.index < this.inputString.length) {
                const char = this.inputString[opts.index];
                opts.queue.push({ char: char, opacity: this.initialOpacity });
              }
              return next();
            })
          ).then(() => {
            opts.queue = opts.queue.filter((element) => {
              if (element.opacity >= 100) {
                if (element.char === '\n') {
                  opts.outputWithOpacity += `<br>`;
                  return false;
                }

                opts.outputWithOpacity += `<span style="opacity: ${element.opacity}%">${element.char}</span>`;
                return false;
              }

              element.opacity += (100 / this.steps);
              if (element.char === '\n') {
                opts.output += `<br>`;
              } else {
                opts.output += `<span style="opacity: ${element.opacity}%">${element.char}</span>`;
              }

              return true;
            });
          })
          return next();
        }, this.charDelay);
      })
    ).then(() =>
      promise(resolveWith((next) => {
        this.charContext.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => op.bind(this)(op, next, opts));
  },

  wordIterator: function(op, next, opts) {
    if (opts == undefined) {
      opts = {};
      // This approach could be improved,  but for simplicity, we replace newlines with a special word "newline" and split the input string by whitespace.
      opts.inputWords = this.inputString.replaceAll("\n", " newline ").trim().split(/\s+/);
      opts.index = 0;
      opts.queue = [];
      opts.output = "";
      opts.outputWithOpacity = "";
    }

    if (opts.index >= opts.inputWords.length && opts.queue.length == 0) {
      return next();
    }

    promise(
      resolveWith((next) => {
        setTimeout(async () => {
          promise(
            resolveWith((next) => {
              opts.output = "";
              if (opts.index < opts.inputWords.length) {
                const word = opts.inputWords[opts.index];
                opts.queue.push({ word: word, opacity: this.initialOpacity });
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

              element.opacity += (100 / this.steps);
              if (element.word === 'newline') {
                opts.output += `<br>`;
              } else {
                opts.output += `<span style="opacity: ${element.opacity}%">${element.word}</span> `;
              }

              return true;
            });
          });

          return next();
        }, this.wordDelay);
      })
    ).then(() =>
      promise(resolveWith((next) => {
        this.wordContext.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => op.bind(this)(op, next, opts));
  },


  // Produces a generative AI text animation including the display of each word's probability.
  wordIteratorProbability: function(op, next, opts) {
    if (opts == undefined) {
      opts = {};
      opts.inputWords = this.inputString.replaceAll("\n", " newline ").replaceAll(" ", " space ").trim().split(/\s+/);
      opts.index = 0;
      opts.queue = [];
      opts.output = "";
      opts.outputWithOpacity = "";
    }

    if (opts.index >= opts.inputWords.length && opts.queue.length == 0) {
      return next();
    }

    promise(
      resolveWith((next) => {
        setTimeout(async () => {
          promise(
            resolveWith((next) => {
              opts.output = "";
              if (opts.index < opts.inputWords.length) {
                const word = opts.inputWords[opts.index];
                opts.queue.push({ word: word, opacity: this.initialOpacity, probability: Math.random().toFixed(2) });
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

                if (element.word === 'space') {
                  opts.outputWithOpacity += ` `;
                  return false
                }

                opts.outputWithOpacity += `<span style="opacity: ${element.opacity}%" title="${element.probability}">${element.word}</span>`;
                return false;
              }

              element.opacity += (100 / this.steps);
              if (element.word === 'newline') {
                opts.output += `<br>`;
              } else if (element.word === 'space') {
                opts.output += ` `;
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
        }, this.wordProbabilityDelay);
      })
    ).then(() =>
      promise(resolveWith((next) => {
        this.wordProbabilityContext.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => op.bind(this)(op, next, opts));
  },

  // Main function responsible for initializing and executing all animations.
  // This is not serious code, please do not use this.
  main: async function(charContextId, wordContextId, wordProbabilityContextId, inputString, steps, charDelay, wordDelay, wordProbabilityDelay) {
    promise(
      resolveWith(
        (next) => {
          this.charContext = document.getElementById(charContextId);
          this.wordContext = document.getElementById(wordContextId);
          this.wordProbabilityContext = document.getElementById(wordProbabilityContextId);
          this.inputString = inputString;
          this.steps = steps;
          this.charDelay = charDelay;
          this.wordDelay = wordDelay;
          this.wordProbabilityDelay = wordProbabilityDelay;
          return next();
        }
      )
    ).then(
      () => {
        // It's nicer to view all animations occurring in parallel.
        promise(resolveWithFix(this.charIterator.bind(this)));
        promise(resolveWithFix(this.wordIterator.bind(this)));
        promise(resolveWithFix(this.wordIteratorProbability.bind(this)));

        // But this is how the same set of animations could be executed sequentially using a simple promise chain.
        // promise(resolveWithFix(this.charIterator.bind(this)))
        //   .then(() => promise(resolveWithFix(this.wordIterator.bind(this))))
        //   .then(() => promise(resolveWithFix(this.wordIteratorProbability.bind(this))));
      }
    );
  },
}

// Generated poem from ChatGPT-3.5-turbo using the prompt "Write a poem about generative AI text animation."
var input = 'With fading text, opacity\'s grace,\nA dance of words, in cyberspace.\n\nEach line a tale, a story told,\nFrom the depths of data, it unfolds.\n\nProbabilistic, a realm unknown,\nA digital mind, uniquely grown.\n\nPoetic beauty, in lines entwined,\nA glimpse of art, by code designed.\n\nSo let us ponder, this digital art,\nA symphony of bytes, a work of heart.\n\nGenerative marvel, a wondrous sight,\nA poem born, in the virtual light.\n';

var steps = 20; // Number of steps for the animation. Increasing this will make the animation appear "smoother" and its duration longer.
var charDelay = 20; // Delay in milliseconds for character animation
var wordDelay = 20; // Delay in milliseconds for word animation
var wordProbabilityDelay = 20; // Delay in milliseconds for word probability animation

AnimateText.main("char", "word", "wordProbability", input, steps, charDelay, wordDelay, wordProbabilityDelay);
