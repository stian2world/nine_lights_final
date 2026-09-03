// ======================================
// App State
// ======================================
let appState = "title";

// ======================================
// Audio
// ======================================
let welcomeSound;
let clickSound;
let audioStarted = false;

// ======================================
// Videos & Images
// ======================================
let bgTitleVid;
let logoVid;

let instructionBg;
let instructionVid;

let titleBtnImg;

// ======================================
// Welcome Cover
// ======================================
let welcomeCoverImg;
let welcomeCoverTextImg;
let soundDownImg;

let coverStartTime = 0;
let coverDuration = 3000; // 3s
let soundDownClicked = false;

// ======================================
// Invisible Areas
// ======================================

// title 主按钮
let titleBtn = { x: 390, y: 650, w: 300, h: 160 };

// sound_down 区域（你现在是整屏）
let soundDownArea = { x: 0, y: 0, w: 1080, h: 900 };

// instruction
let topBtn = { x: 20, y: 20, w: 150, h: 150 };
let bottomBtnY = 700;

// ======================================
// Preload
// ======================================
function preload() {
  welcomeSound = loadSound("/nine_lights_final/audio/welcome_page_.mp3");
  clickSound   = loadSound("/nine_lights_final/audio/clicking_sound.mp3");

  welcomeCoverImg     = loadImage("/nine_lights_final/title_page/welcome_cover.png");
  welcomeCoverTextImg = loadImage("/nine_lights_final/title_page/welcome_cover_text.png");
  soundDownImg        = loadImage("/nine_lights_final/title_page/sound_down.png");

  bgTitleVid = createVideo("/nine_lights_final/title_page/welcome_page.webm");
  bgTitleVid.hide();
  bgTitleVid.volume(0);
  bgTitleVid.attribute("muted", "");

  logoVid = createVideo("/nine_lights_final/title_page/title_page.webm");
  logoVid.hide();
  logoVid.volume(0);
  logoVid.attribute("muted", "");

  titleBtnImg = loadImage("/nine_lights_final/title_page/button_title_page.png");

  instructionBg  = loadImage("/nine_lights_final/general_instruction/instruction_page.jpg");
  instructionVid = createVideo("/nine_lights_final/general_instruction/general_instruction.webm");
  instructionVid.hide();
  instructionVid.volume(0);
  instructionVid.attribute("muted", "");
}

// ======================================
// Setup
// ======================================
function setup() {
  createCanvas(1080, 900);

  bgTitleVid.loop();
  logoVid.loop();
  instructionVid.loop();

  welcomeSound.setVolume(0.35);
  clickSound.setVolume(0.6);

  coverStartTime = millis();
}

// ======================================
// Helpers
// ======================================
function startWelcomeAudio() {
  if (!audioStarted) {
    userStartAudio();
    welcomeSound.loop();
    audioStarted = true;
  }
}

function playClick() {
  if (clickSound.isPlaying()) clickSound.stop();
  clickSound.play();
}

// ======================================
// Draw
// ======================================
function draw() {
  if (appState === "title") drawTitle();
  else if (appState === "instruction") drawInstruction();
}

// ======================================
// Title Page
// ======================================
function drawTitle() {
  image(bgTitleVid, 0, 0, width, height);
  image(
    logoVid,
    width / 2 - logoVid.width / 2,
    height / 2 - logoVid.height / 2
  );

  let elapsed = millis() - coverStartTime;

  // ===== Phase 1: Cover + blinking text =====
  if (elapsed < coverDuration) {
    image(welcomeCoverImg, 0, 0, width, height);

    if (frameCount % 60 < 30) {
      image(welcomeCoverTextImg, 0, 0, width, height);
    }
    return;
  }

  // ===== Phase 2: sound_down =====
  if (!soundDownClicked) {
    if (frameCount % 60 < 30) {
      image(soundDownImg, 0, 0, width, height);
    }
  }

  // ===== Title button – gradient blinking =====
let blinkSpeed = 0.05;              
let alphaVal = map(
  sin(frameCount * blinkSpeed),
  -1, 1,
  80, 255                         // 渐变范围（可调）
);

push();
tint(255, alphaVal);
image(titleBtnImg, 0, 0, width, height);
pop();
}

// ======================================
// Instruction Page
// ======================================
function drawInstruction() {
  image(instructionBg, 0, 0, width, height);
  image(
    instructionVid,
    width / 2 - instructionVid.width / 2,
    height / 2 - instructionVid.height / 2
  );
}

// ======================================
// Mouse Interaction
// ======================================
function mousePressed() {

  // =========================
  // TITLE PAGE
  // =========================
  if (appState === "title") {

    let elapsed = millis() - coverStartTime;

    // 1️⃣ sound_down：只负责开声音
    if (
      elapsed >= coverDuration &&
      !soundDownClicked &&
      mouseX > soundDownArea.x &&
      mouseX < soundDownArea.x + soundDownArea.w &&
      mouseY > soundDownArea.y &&
      mouseY < soundDownArea.y + soundDownArea.h
    ) {
      startWelcomeAudio();
      soundDownClicked = true;
      return;
    }

    // 2️⃣ title 主按钮 → instruction
    if (
      mouseX > titleBtn.x &&
      mouseX < titleBtn.x + titleBtn.w &&
      mouseY > titleBtn.y &&
      mouseY < titleBtn.y + titleBtn.h
    ) {
      playClick();
      appState = "instruction";
      return;
    }
  }

  // =========================
  // INSTRUCTION PAGE
  // =========================
  else if (appState === "instruction") {

    // back
    if (
      mouseX > topBtn.x &&
      mouseX < topBtn.x + topBtn.w &&
      mouseY > topBtn.y &&
      mouseY < topBtn.y + topBtn.h
    ) {
      playClick();
      appState = "title";
      return;
    }

    // go ritual 01
    if (
      mouseX > 0 &&
      mouseX < width &&
      mouseY > bottomBtnY &&
      mouseY < height
    ) {
      playClick();
      window.location.href = "/nine_lights_final/ritual_01/index.html";
      return;
    }
  }
}
