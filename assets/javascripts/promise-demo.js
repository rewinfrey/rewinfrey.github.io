const PromiseDemo = {
  consoleLog: ((msg) => ((next) => { console.log(msg); return next() })),

  promise: ((op) => new Promise((resolve, reject) => op(resolve, reject))),

  sleep: ((ms) => ((next) => setTimeout(next, ms))),

  resolveWith: ((op) => ((next) => op(next))),

  main: async function() {
    await this.promise(this.resolveWith(this.consoleLog("promise one")));
    await this.promise(this.resolveWith(this.sleep(1000)));
    await this.promise(this.resolveWith(this.consoleLog("promise two")));
    await this.promise(this.resolveWith(this.sleep(1000)));
    await this.promise(this.resolveWith(this.consoleLog("promise three")));
  },
};

PromiseDemo.main()
