let escenaActual = null;
let teFlashlight = false;
let canviantEscena = false;

// AMBIENT MUSIC
const ambientMusic = new Audio("img/ambient.mp3");

ambientMusic.loop = true;
ambientMusic.volume = 0.35;

const TEMPS_CONSEQUENCIA = 1800;
const TEMPS_FADE = 600;

// UI SELECT SOUND
const selectSound = new Audio("img/select.mp3");

selectSound.volume = 0.4;

// =====================================
// SERIAL CONNECTION (OPTIONAL)
// =====================================

let connection = null;

if (typeof SimpleWebSerial !== "undefined") {
  connection = SimpleWebSerial.setupSerialConnection({
    requestAccessOnPageLoad: true,
    baudRate: 9600,
  });

  console.log("Serial enabled");
} else {
  console.log("SimpleWebSerial not found — keyboard mode enabled");
}

// =====================================
// SCENE CONNECTIONS
// =====================================

const connexions = {
  START: {
    1: "A",
    2: "",
    3: "",
  },

  A: { 1: "A", 2: "B", 3: "A" },
  B: { 1: "C", 2: "D", 3: "B" },
  C: { 1: "F", 2: () => (teFlashlight ? "Eb" : "Ea"), 3: "C" },

  D: {
    1: "NOTE",
    2: () => {
      teFlashlight = true;
      return "B";
    },
    3: "D",
  },

  NOTE: { 1: "D", 2: "D", 3: "D" },
  Ea: { 1: "GDEATH", 2: "DEATH", 3: "Ea" },
  GDEATH: { 1: "DEATH", 2: "DEATH", 3: "DEATH" },
  Eb: { 1: "G", 2: "H", 3: "Eb" },
  F: { 1: "I", 2: "J", 3: "F" },
  G: { 1: "K", 2: "L", 3: "G" },
  H: { 1: "F", 2: "GDEATH", 3: "H" },
  I: { 1: "PORTUGUESEXAT", 2: "IDEATH", 3: "I" },
  IDEATH: { 1: "DEATH", 2: "DEATH", 3: "DEATH" },
  PORTUGUESEXAT: { 1: "ETERNITYENDING", 2: "FREEDOMENDING", 3: "" },
  J: { 1: "J", 2: "F", 3: "J" },
  K: { 1: "C", 2: "G", 3: "K" },
  L: { 1: "M", 2: "N", 3: "L" },
  M: { 1: "OPENENDING", 2: "N", 3: "M" },
  MOPEN: { 1: "A", 2: "A", 3: "A" },
  N: { 1: "O", 2: "Q", 3: "SECRETENDING" },
  O: { 1: "P", 2: "P", 3: "SECRETENDING" },
  Q: { 1: "P", 2: "P", 3: "SECRETENDING" },

  P: {
    1: "BADENDING",
    2: "GOODENDING",
    3: "SECRETENDING",
  },

  BADENDING: {
    1: "BADENDSCREEN",
    2: "BADENDSCREEN",
    3: "BADENDSCREEN",
  },

  GOODENDING: {
    1: "GOODENDINGFINAL",
    2: "BADENDSCREEN",
    3: "GOODENDING",
  },

  SECRETENDING: {
    1: "SECRETENDSCREEN",
    2: "SECRETENDSCREEN",
    3: "SECRETENDSCREEN",
  },

  OPENENDING: {
    1: "OPENENDSCREEN",
    2: "OPENENDSCREEN",
    3: "OPENENDSCREEN",
  },

  FREEDOMENDING: {
    1: "FREEDOMENDSCREEN",
    2: "FREEDOMENDSCREEN",
    3: "FREEDOMENDSCREEN",
  },

  ETERNITYENDING: {
    1: "ETERNITYENDSCREEN",
    2: "ETERNITYENDSCREEN",
    3: "ETERNITYENDSCREEN",
  },

  GOODENDINGFINAL: {
    1: "GOODENDSCREEN",
    2: "GOODENDSCREEN",
    3: "GOODENDSCREEN",
  },

  DEATH: { 1: "A", 2: "A", 3: "A" },
  ETERNITYENDSCREEN: { 1: "START", 2: "START", 3: "START" },
  FREEDOMENDSCREEN: { 1: "START", 2: "START", 3: "START" },
  GOODENDSCREEN: { 1: "START", 2: "START", 3: "START" },
  BADENDSCREEN: { 1: "START", 2: "START", 3: "START" },
  OPENENDSCREEN: { 1: "START", 2: "START", 3: "START" },
  SECRETENDSCREEN: { 1: "START", 2: "START", 3: "START" },
};

function playSelectSound() {
  // rewind so it can spam quickly
  selectSound.currentTime = 0;

  selectSound.play().catch((err) => {
    console.log("Select sound blocked:", err);
  });
}

// =====================================
// HIDE ALL SCENES
// =====================================

function amagaEscena() {
  const scenes = document.querySelectorAll(".scene");

  scenes.forEach((scene) => {
    scene.style.display = "none";
    scene.classList.remove("visible");
  });
}

// =====================================
// SHOW OPTIONS
// =====================================

function mostraOpcions(choices, choiceTexts) {
  if (!choices) return;

  choices.style.display = "flex";

  choiceTexts.forEach((choice, index) => {
    setTimeout(() => {
      escriuText(choice, choice.dataset.original, 15);
    }, index * 250);
  });
}

// =====================================
// SHOW SCENE
// =====================================

function mostraEscena(e) {
  const scene = document.querySelector(".scene-" + e);

  if (!scene) {
    console.error("Scene not found:", e);
    canviantEscena = false;
    return;
  }

  amagaEscena();

  scene.style.display = "block";

  const choices = scene.querySelector(".choices");

  if (choices) {
    choices.style.display = "none";
  }

  const oldConsequence = scene.querySelector(".consequence-text");

  if (oldConsequence) {
    oldConsequence.remove();
  }

  const topText = scene.querySelector(".top-text");

  if (topText) {
    topText.dataset.original =
      topText.dataset.original || topText.textContent.trim();

    topText.textContent = "";
  }

  const choiceTexts = scene.querySelectorAll(".choice div:nth-child(2)");

  choiceTexts.forEach((choice) => {
    choice.dataset.original =
      choice.dataset.original || choice.textContent.trim();

    choice.textContent = "";
  });

  setTimeout(() => {
    scene.classList.add("visible");

    if (topText) {
      escriuText(topText, topText.dataset.original, 20, () => {
        mostraOpcions(choices, choiceTexts);
      });
    } else {
      mostraOpcions(choices, choiceTexts);
    }

    escenaActual = e;
    canviantEscena = false;

    console.log("Current scene:", escenaActual);
  }, 20);
}

// =====================================
// TYPEWRITER EFFECT
// =====================================

function escriuText(element, text, speed = 20, callback = null) {
  // STOP previous typing on this element
  if (element.typingInterval) {
    clearInterval(element.typingInterval);
  }

  element.textContent = "";

  let i = 0;

  element.typingInterval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text[i];
      i++;
    } else {
      clearInterval(element.typingInterval);
      element.typingInterval = null;

      if (callback) {
        callback();
      }
    }
  }, speed);
}

// =====================================
// RESTART GAME
// =====================================

function reiniciaJoc() {
  teFlashlight = false;
  canviantEscena = false;

  mostraEscena("START");
  escenaActual = "START";
}

function introTransition() {
  canviantEscena = true;

  // BLACK SCREEN
  const blackout = document.createElement("div");
  blackout.className = "blackout-transition";

  document.body.appendChild(blackout);

  // trigger fade in
  setTimeout(() => {
    blackout.classList.add("visible");
  }, 50);

  // AUDIO
  const gasp = new Audio("img/gasp.mp3");
  const water = new Audio("img/water.mp3");

  gasp.volume = 1;
  water.volume = 0.7;

  // timings
  setTimeout(() => {
    gasp.play();
    setTimeout(() => {
      gasp.pause();
      gasp.currentTime = 0;
    }, 5000);
  }, 1700);

  setTimeout(() => {
    water.play();
  }, 400);

  // START GAME AFTER 5s
  setTimeout(() => {
    // LOAD SCENE A FIRST
    mostraEscena("A");
    escenaActual = "A";

    // THEN FADE BLACK SCREEN
    setTimeout(() => {
      blackout.classList.add("fade-out");

      setTimeout(() => {
        blackout.remove();
        canviantEscena = false;
      }, 1200);
    }, 100);
  }, 5000);
}

// =====================================
// CHANGE SCENE
// =====================================

function canviaEscena(numBoto) {
  if (escenaActual === null || canviantEscena) {
    return;
  }

  const opcions = connexions[escenaActual];

  if (!opcions) {
    console.error("No connections for scene:", escenaActual);
    return;
  }

  let seguent = opcions[numBoto];

  if (typeof seguent === "function") {
    seguent = seguent();
  }

  if (!seguent || seguent === "-") {
    console.error("No choice", numBoto, "for scene:", escenaActual);
    return;
  }

  const currentScene = document.querySelector(".scene-" + escenaActual);

  if (!currentScene) {
    console.error("Current scene element not found:", escenaActual);

    return;
  }

  const choices = currentScene.querySelector(".choices");

  if (!choices) {
    canviantEscena = true;

    currentScene.classList.remove("visible");

    setTimeout(() => {
      mostraEscena(seguent);
    }, TEMPS_FADE);

    return;
  }

  const choice = currentScene.querySelectorAll(".choice")[numBoto - 1];

  if (!choice) {
    console.error("Choice element not found:", numBoto);
    return;
  }

  const consequence = choice.children[2]?.textContent.trim() || "";

  canviantEscena = true;

  choices.style.display = "none";

  const consequenceBox = document.createElement("div");

  consequenceBox.className = "consequence-text";

  currentScene.appendChild(consequenceBox);

  escriuText(consequenceBox, consequence, 20, () => {
    setTimeout(() => {
      currentScene.classList.remove("visible");

      setTimeout(() => {
        mostraEscena(seguent);
      }, TEMPS_FADE);
    }, TEMPS_CONSEQUENCIA);
  });
}

// =====================================
// START SCREEN ON LOAD
// =====================================

amagaEscena();
mostraEscena("START");
escenaActual = "START";

// =====================================
// ARDUINO INPUT ONLY
// =====================================

if (connection) {
  connection.on("boto", function (numBoto) {
    numBoto = Number(numBoto);

    console.log("Button from Arduino:", numBoto);

    // RESET
    if (numBoto === 0) {
      reiniciaJoc();
      return;
    }

    // START / BUTTON 1
    if (numBoto === 1) {
      // START INTRO
      if (escenaActual === "START") {
        // try starting music
        ambientMusic.play().catch(() => {});

        introTransition();
        return;
      }

      playSelectSound();
      canviaEscena(1);
    }

    // BUTTON 2
    if (numBoto === 2) {
      playSelectSound();
      canviaEscena(2);
    }

    // BUTTON 3
    if (numBoto === 3) {
      playSelectSound();
      canviaEscena(3);
    }
  });
}

if (connection) {
  connection.on("boto", function (numBoto) {
    console.log("RAW BUTTON:", numBoto);

    // convert safely
    numBoto = parseInt(numBoto);

    console.log("PARSED BUTTON:", numBoto);
    console.log("CURRENT SCENE:", escenaActual);

    // START GAME
    if (numBoto === 1 && escenaActual === "START") {
      console.log("STARTING INTRO");

      introTransition();

      return;
    }

    // RESET
    if (numBoto === 0) {
      reiniciaJoc();
      return;
    }

    // NORMAL GAME INPUTS
    if (numBoto === 1) {
      playSelectSound();
      canviaEscena(1);
    }

    if (numBoto === 2) {
      playSelectSound();
      canviaEscena(2);
    }

    if (numBoto === 3) {
      playSelectSound();
      canviaEscena(3);
    }
  });
}
