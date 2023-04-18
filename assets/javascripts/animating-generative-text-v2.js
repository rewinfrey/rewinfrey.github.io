const AnimateText = {
  consoleLog: function(msg) {
    return function(resolve, reject) {
      console.log(msg);
      return resolve();
    }
  },

  withPromise:
    function (op, cont) {
      let promise = new Promise((resolve, reject) => op(resolve, reject))
      promise.then(cont)
    },

  sleep: function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  main: async function() {
    this.withPromise(
      (stopOne) => {
        this.withPromise(
          (stopTwo) => {
            return (this.consoleLog("innerPromise"))(stopTwo);
          },
          () => {
            this.withPromise(
              async (stopThree) => {
                await this.sleep(2);
                return (this.consoleLog("third promise"))(stopThree);
              },
              () => {}
            );
            console.log("outerPromise");
            setTimeout(() => {
              console.log("withPromise setTimeout");
              stopOne();
            }, 10);
          }
        )
      },
      () => console.log("main promise resolved")
    )
  },
};

AnimateText.main()
