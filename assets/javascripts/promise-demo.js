var consoleLog = ((msg) => ((next) => { console.log(msg); return next() }));

var promise = ((op) => new Promise((resolve, reject) => op(resolve, reject)));

var sleep = ((ms) => ((next) => setTimeout(next, ms)));

var resolveWith = ((op) => ((next) => op(next)));

const PromiseDemo = {
  main: async function() {
    promise(resolveWith(consoleLog("promise one")))
      .then(() => promise(resolveWith(sleep(1000))))
      .then(() => promise(resolveWith(consoleLog("promise two"))))
      .then(() => promise(resolveWith(sleep(1000))))
      .then(() => promise(resolveWith(consoleLog("promise three"))));
  },
};

PromiseDemo.main()
