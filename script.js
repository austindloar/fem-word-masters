function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

async function getWordOfTheDay() {
  const loading = document.querySelector(".loading");
  loading.style.opacity = 1;
  const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
  const processedResponse = await promise.json();
  loading.style.opacity = 0;
  return processedResponse.word.toUpperCase();
}

async function verifyGuess(guess) {
  const loading = document.querySelector(".loading");
  loading.style.opacity = 1;
  const promise = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word: guess }),
  });
  const processedResponse = await promise.json();
  loading.style.opacity = 0;
  return processedResponse.validWord;
}

async function handleKeys(e) {
  if (isLetter(e.key)) {
    letterBoxes[currentIndex].textContent = e.key.toUpperCase();
    if (
      currentIndex >= currentGuess * 5 &&
      currentIndex < (currentGuess + 1) * 5 - 1
    ) {
      currentIndex++;
    }
  } else if (e.key === "Enter") {
    if (
      currentIndex === (currentGuess + 1) * 5 - 1 &&
      letterBoxes[currentIndex].textContent
    ) {
      let guess = "";
      for (let i = currentGuess * 5; i < (currentGuess + 1) * 5; i++) {
        guess += letterBoxes[i].textContent;
      }

      let valid = await verifyGuess(guess);

      if (valid) {
        submitGuess(guess);
        if (currentGuess < 5) {
          ++currentGuess;
          ++currentIndex;
        }
      } else {
        for (let i = currentGuess * 5; i < (currentGuess + 1) * 5; i++) {
          letterBoxes[i].style.animation = "";
        }

        for (let i = currentGuess * 5; i < (currentGuess + 1) * 5; i++) {
          void letterBoxes[i].offsetWidth;
          letterBoxes[i].style.animation = "flash 1s";
        }
      }
    }
  } else if (e.key === "Backspace") {
    if (
      currentIndex > currentGuess * 5 &&
      currentIndex < (currentGuess + 1) * 5 - 1
    ) {
      currentIndex--;
    } else if (currentIndex === (currentGuess + 1) * 5 - 1) {
      if (!letterBoxes[currentIndex].textContent) {
        currentIndex--;
      }
    }
    letterBoxes[currentIndex].textContent = "";
  }
}

function submitGuess(guess) {
  colorLetters(guess);
  if (guess === wordOfTheDay) {
    showWin();
    cleanUp();
  } else if (currentGuess === 5) {
    showLose();
    cleanUp();
  }
}

function colorLetters(guess) {
  let outOfPlace = [];
  for (let i = 0; i < 5; i++) {
    letterBoxes[currentGuess * 5 + i].style.color = "#fff";
    if (guess[i] === wordOfTheDay[i]) {
      letterBoxes[currentGuess * 5 + i].style.backgroundColor = "#006400";
    } else if (!wordOfTheDay.includes(guess[i])) {
      letterBoxes[currentGuess * 5 + i].style.backgroundColor = "#888";
    } else {
      outOfPlace.push(guess[i]);
    }
  }

  for (let i = 0; i < 5; i++) {
    if (wordOfTheDay[i] !== guess[i]) {
      if (outOfPlace.includes(wordOfTheDay[i])) {
        letterBoxes[
          currentGuess * 5 + guess.indexOf(wordOfTheDay[i])
        ].style.backgroundColor = "#daa520";
        outOfPlace.splice(outOfPlace.indexOf(wordOfTheDay[i]), 1);
      }
    }
  }
}

function showWin() {
  const resultText = document.querySelector(".result-text");
  const header = document.querySelector("header");
  resultText.textContent = "You win!";
  header.style.animation = "rainbow 4s infinite linear";
}

function showLose() {
  const resultText = document.querySelector(".result-text");
  resultText.textContent = "You lose. The word was " + wordOfTheDay;
}

function cleanUp() {
  document.removeEventListener("keydown", handleKeys);
}

let wordOfTheDay;

getWordOfTheDay().then((word) => {
  wordOfTheDay = word;
});

const letterBoxes = document.querySelectorAll(".letter");
let currentIndex = 0;
let currentGuess = 0;

const inputs = document.querySelector(".inputs");

document.addEventListener("keydown", handleKeys);
