const AnimateText = {
  context: null,
  contextId: null,
  delay: 0,
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

  charIterator: async function(op, next, opts) {
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

    if (opts.index >= this.inputString.length && opts.queue.length == 0) {
      return next();
    }

    await this.promise(this.resolveWith((next) => {
      setTimeout(async () => {
        opts.output = "";
        const char = this.inputString[opts.index];
        await this.promise(this.resolveWith((next) => { opts.queue.push({ char: char, opacity: this.initialOpacity}); next() }));
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

        return next();
      }, this.delay);
    }));

    await this.promise(this.resolveWith((next) => {
      this.context.innerHTML = opts.outputWithOpacity + opts.output;
      opts.index++;
      return next();
    }));

    return op.bind(this)(op, next, opts);
  },

  main: async function(contextId, inputString, steps, delay, iteratorType) {
    await this.promise(this.resolveWith((next) => {
      this.context = document.getElementById(contextId);
      this.contextId = contextId;
      this.inputString = inputString;
      this.steps = steps;
      this.delay = delay;
      return next();
    }));

    if (iteratorType === "charIterator") {
      await this.promise(this.resolveWithFix(this.charIterator.bind(this)));
    }

    await this.promise(this.resolveWith(this.consoleLog("promise one")));
    await this.promise(this.resolveWith(this.sleep(1000)));
    await this.promise(this.resolveWith(this.consoleLog("promise two")));
    await this.promise(this.resolveWith(this.sleep(1000)));
    await this.promise(this.resolveWith(this.consoleLog("promise three")));
  },
}

var input = 'With fading text, opacity\'s grace,\nA dance of words, in cyberspace.\n\nEach line a tale, a story told,\nFrom the depths of data, it unfolds.\n\nProbabilistic, a realm unknown,\nA digital mind, uniquely grown.\n\nPoetic beauty, in lines entwined,\nA glimpse of art, by code designed.\n\nSo let us ponder, this digital art,\nA symphony of bytes, a work of heart.\n\nGenerative marvel, a wondrous sight,\nA poem born, in the virtual light.\n';
AnimateText.main("demo-1", input, 5, 20, "charIterator");
