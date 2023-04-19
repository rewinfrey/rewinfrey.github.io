const PromiseDemo = {
  consoleLog: ((msg) => ((resolve) => { console.log(msg); return resolve() })),

  promise: ((op) => new Promise((resolve, reject) => op(resolve, reject))),

  sleep: ((ms) => ((resolve) => setTimeout(resolve, ms))),

  resolveWith: ((op) => ((resolve) => op(resolve))),

  main: async function() {
    await this.promise(this.resolveWith(this.consoleLog("promise one")));
    await this.promise(this.resolveWith(this.sleep(1000)));
    await this.promise(this.resolveWith(this.consoleLog("promise two")));
    await this.promise(this.resolveWith(this.sleep(1000)));
    await this.promise(this.resolveWith(this.consoleLog("promise three")));
  },
};

PromiseDemo.main()
