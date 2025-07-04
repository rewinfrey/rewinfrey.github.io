const inputString = 'With fading text, opacity\'s grace,\nA dance of words, in cyberspace.\n\nEach line a tale, a story told,\nFrom the depths of data, it unfolds.\n\nProbabilistic, a realm unknown,\nA digital mind, uniquely grown.\n\nPoetic beauty, in lines entwined,\nA glimpse of art, by code designed.\n\nSo let us ponder, this digital art,\nA symphony of bytes, a work of heart.\n\nGenerative marvel, a wondrous sight,\nA poem born, in the virtual light.\n';
//const inputString = 'I just want to use a shorter string for now'
const outputElement = document.getElementById("demo-1");
const outputWord = document.getElementById("demo-2");
let initialOpacity = 0.0; // Initial opacity for every new character.
let outputString = "";
let outputWordString = "";
let outputWithOpacity = "";
let outputWordWithOpacity = "";
let elementQueue = [];
let wordBuffer = "";
let wordQueue = [];
let index = 0;
let index2 = 0;

const charDelay = 15;
const wordDelay = 100;

// Fix begins the recursive loop.
function fix(f) {
  return f(f);
}
// pWrap takes a function and args and wraps the application
// within a Promise. Returns the promise.
function pWrap(fn, args) {
  let p = new Promise((resolve, reject) => {
    fn(resolve, reject, args);
  })
  return p;
}

function filterElementQueue() {
  return pWrap((resolve) => {
    elementQueue = elementQueue.filter(el => {
      if (el.opacity < 1) {
        el.opacity += 0.25
        if (el.char === '\n') {
          outputString += `<br>`;
          return true;
        }
        outputString += `<span style="opacity: ${el.opacity}">${el.char}</span>`
        return true
      } else {
        if (el.char === '\n') {
          outputWithOpacity += `<br>`;
          return false;
        }
        outputWithOpacity += `<span>${el.char}</span>`
        return false;
      }
    });
    return resolve();
  });
}

function filterWordQueue() {
  return pWrap((resolve) => {
    console.log("wordQueue: ", wordQueue);
    wordQueue = wordQueue.filter(word => {
      if (word.opacity < 1) {
        word.opacity += 0.25
        if (word.value === '\n') {
          outputWordString += `<br>`;
          return true;
        }
        outputWordString += `<span style="opacity: ${word.opacity}">${word.value}</span>`
        return true
      } else {
        if (word.value === '\n') {
          outputWordWithOpacity += `<br>`;
          return false;
        }
        outputWordWithOpacity += `<span>${word.value}</span>`
        return false;
      }
    });
    return resolve();
  });
}

function charIter() {
  return pWrap((resolve) => {
    setTimeout(() => {
      if (index >= inputString.length) {
        return resolve();
      }

      const char = inputString[index];
      outputString= ""; // reset the outputString for each character.
      elementQueue.push({ char: char, opacity: initialOpacity});
      let promise = filterElementQueue();
      promise.then(() => {
        outputElement.innerHTML = outputWithOpacity + outputString;
        index++;
        return charIter().then(() => resolve());
      })
    }, charDelay); // Add a delay for each character of the input string.
  })
}

function charIterator() {
  charIter().
    then(() => fix(
      (function(f) {
        outputString = ""; // reset the outputString for each character.
        let p = filterElementQueue()
        p.then(() => {
          outputElement.innerHTML = outputWithOpacity + outputString;
          if (elementQueue.length > 0) {
            return f(f);
          } else {
            return;
          }
        })
      })
    )
  )
}

function charIsWordBoundary(char) {
  return char == ' ' || char == '.' || char == ',' || char == '\n';
}

function wordIter() {
  return pWrap((resolve) => {
    setTimeout(() => {
      if (index2 >= inputString.length) {
        return resolve();
      }

      const char = inputString[index2];
      let promise = new Promise((resolve, reject) => {
          if (charIsWordBoundary(char)) {
            wordQueue.push({ value: wordBuffer, opacity: initialOpacity});
            wordQueue.push({ value: char, opacity: initialOpacity});
            wordBuffer = "";
            outputWordString= ""; // reset the outputString for each word.
            return resolve();
          } else {
            wordBuffer += char;
            return resolve();
          }
      })

      return promise.then(() => {
        filterWordQueue().
          then(() => {
            outputWord.innerHTML = outputWordWithOpacity + outputWordString;
            index2++;
            return wordIter().then(() => resolve());
        })
      })
    }, wordDelay); // Add a delay for each character of the input string.
  })
}

function wordIterator() {
  wordIter().
    then(() =>
      fix(
        (function(f) {
          outputWordString = ""; // reset the outputString for each character.
          wordBuffer = "";
          let p = filterWordQueue()
          p.then(() => {
            outputWord.innerHTML = outputWordWithOpacity + outputWordString;
            if (wordQueue.length > 0) {
              return f(f);
            } else {
              return;
            }
          })
        })
      )
    )
}


function main() {
  charIterator();
  wordIterator();
}

main();
