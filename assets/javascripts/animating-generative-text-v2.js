const AnimateText = {
  charContext: null,
  wordContext: null,
  wordProbabilityContext: null,
  delay: 0,
  wordProbabilityDelay: 0,
  initialOpacity: 0,
  inputString: "",
  steps: 0,

  consoleLog: ((msg) => ((resolve) => { console.log(msg); return resolve() })),

  promise: function(op) {
    return new Promise((resolve, reject) => op(resolve, reject))
  },

  sleep: ((ms) => ((resolve) => setTimeout(resolve, ms))),

  resolveWith: function(op) {
    return function(resolve) {
      return op(resolve);
    }
  },

  resolveWithFix: function(op) {
    return function(resolve) {
      return op(op, resolve);
    }
  },

  wordIteratorProbability: function(op, next, opts) {
    function initOpts() {
      opts = {};
      opts.inputWords = this.inputString.replaceAll("\n", " newline ").replaceAll(" ", " space ").split(" ");
      opts.index = 0;
      opts.queue = [];
      opts.output = "";
      opts.outputWithOpacity = "";
    }

    if (opts == undefined) {
      initOpts.bind(this)();
    }

    console.log(opts.queue);
    if (opts.index >= opts.inputWords.length && opts.queue.length == 0) {
      console.log("finished wordIterator");
      return next();
    }

    this.promise(
      this.resolveWith((next) => {
        setTimeout(async () => {
          this.promise(
            this.resolveWith((next) => {
              opts.output = "";
              if (opts.index < opts.inputWords.length) {
                const word = opts.inputWords[opts.index];
                opts.queue.push({ word: word, opacity: this.initialOpacity, probability: Math.random().toFixed(2) });
              }
              return next();
            })
          ).then(() => {
            opts.queue = opts.queue.filter((element) => {
              console.log(element.probability);
              if (element.opacity >= 100) {
                if (element.word === 'newline') {
                  opts.outputWithOpacity += `<br>`;
                  return false;
                }

                if (element.word == 'space') {
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
                opts.output += `<span style="position: relative; opacity: ${element.opacity}%" title="${element.probability}">${element.word}<span style="font-size: 7px; position: absolute; bottom: 12px; left: 5px;">${element.probability}</span></span>`;
              }

              return true;
            });
          });

          return next();
        }, this.wordProbabilityDelay);
      })
    ).then(() =>
      this.promise(this.resolveWith((next) => {
        this.wordProbabilityContext.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => op.bind(this)(op, next, opts));
  },

  wordIterator: function(op, next, opts) {
    function initOpts() {
      opts = {};
      opts.inputWords = this.inputString.replaceAll("\n", " newline ").replaceAll(" ", " space ").split(" ");
      opts.index = 0;
      opts.queue = [];
      opts.output = "";
      opts.outputWithOpacity = "";
    }

    if (opts == undefined) {
      initOpts.bind(this)();
    }

    console.log(opts.queue);
    if (opts.index >= opts.inputWords.length && opts.queue.length == 0) {
      console.log("finished wordIterator");
      return next();
    }

    this.promise(
      this.resolveWith((next) => {
        setTimeout(async () => {
          this.promise(
            this.resolveWith((next) => {
              opts.output = "";
              if (opts.index < opts.inputWords.length) {
                const word = opts.inputWords[opts.index];
                opts.queue.push({ word: word, opacity: this.initialOpacity});
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

                if (element.word == 'space') {
                  opts.outputWithOpacity += ` `;
                  return false
                }

                opts.outputWithOpacity += `<span style="opacity: ${element.opacity}%">${element.word}</span>`;
                return false;
              }

              element.opacity += (100 / this.steps);
              if (element.word === 'newline') {
                opts.output += `<br>`;
              } else if (element.word === 'space') {
                opts.output += ` `;
              } else {
                opts.output += `<span style="opacity: ${element.opacity}%">${element.word}</span>`;
              }

              return true;
            });
          });

          return next();
        }, this.delay);
      })
    ).then(() =>
      this.promise(this.resolveWith((next) => {
        this.wordContext.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => op.bind(this)(op, next, opts));
  },

  charIterator: function(op, next, opts) {
    function initOpts() {
      opts = {};
      opts.index = 0;
      opts.queue = [];
      opts.output = "";
      opts.outputWithOpacity = "";
    }

    if (opts == undefined) {
      initOpts.bind(this)();
    }

    if (opts.index > this.inputString.length && opts.queue.length == 0) {
      return next();
    }

    this.promise(
      this.resolveWith((next) => {
        setTimeout(() => {
          this.promise(
            this.resolveWith((next) => {
              opts.output = "";
              if (opts.index <= this.inputString.length) {
                const char = this.inputString[opts.index];
                opts.queue.push({ char: char, opacity: this.initialOpacity});
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
        }, this.delay);
      })
    ).then(() =>
      this.promise(this.resolveWith((next) => {
        this.charContext.innerHTML = opts.outputWithOpacity + opts.output;
        opts.index++;
        return next();
      }))
    ).then(() => op.bind(this)(op, next, opts));
  },

  main: async function(charContextId, wordContextId, wordProbabilityContextId, inputString, steps, delay, wordProbabilityDelay) {
    this.promise(
      this.resolveWith(
        (next) => {
          this.charContext = document.getElementById(charContextId);
          this.wordContext = document.getElementById(wordContextId);
          this.wordProbabilityContext = document.getElementById(wordProbabilityContextId);
          this.inputString = inputString;
          this.steps = steps;
          this.delay = delay;
          this.wordProbabilityDelay = wordProbabilityDelay;
          return next();
        }
      )
    ).then(
      () => {
        this.promise(this.resolveWithFix(this.charIterator.bind(this)));
        this.promise(this.resolveWithFix(this.wordIterator.bind(this)));
        this.promise(this.resolveWithFix(this.wordIteratorProbability.bind(this)));
      }
    );

    this.promise(this.resolveWith(this.consoleLog("promise one"))
    ).then(() => this.promise(this.resolveWith(this.sleep(1000)))
    ).then(() => this.promise(this.resolveWith(this.consoleLog("promise two")))
    ).then(() => this.promise(this.resolveWith(this.sleep(1000)))
    ).then(() => this.promise(this.resolveWith(this.consoleLog("promise three"))))
  },
}

var input = 'With fading text, opacity\'s grace,\nA dance of words, in cyberspace.\n\nEach line a tale, a story told,\nFrom the depths of data, it unfolds.\n\nProbabilistic, a realm unknown,\nA digital mind, uniquely grown.\n\nPoetic beauty, in lines entwined,\nA glimpse of art, by code designed.\n\nSo let us ponder, this digital art,\nA symphony of bytes, a work of heart.\n\nGenerative marvel, a wondrous sight,\nA poem born, in the virtual light.\n';
AnimateText.main("char", "word", "wordProbability", input, 5, 10, 20);
