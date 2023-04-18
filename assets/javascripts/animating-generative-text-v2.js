const AnimateText = {
  consoleLog:
    ((msg) =>
      (resolve) => {
        console.log(msg);
        return resolve();
      }
    ),

  withPromise:
    function (op) {
      return new Promise((resolve, reject) => op(resolve, reject));
    },

  sleep: function(ms, resolve) {
    return ((resolve) => setTimeout(resolve, ms));
  },

  main2: async function() {
    await this.withPromise((stop) => this.consoleLog("promise one")(stop));
    await this.withPromise((stop) => this.sleep(1000)(stop));
    await this.withPromise((stop) => this.consoleLog("promise two")(stop));
    await this.withPromise((stop) => this.sleep(1000)(stop));
    await this.withPromise((stop) => this.consoleLog("promise three")(stop));
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

AnimateText.main2()
