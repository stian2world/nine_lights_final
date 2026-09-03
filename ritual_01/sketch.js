// Ritual 01 – Full Flow with Hand Pose Detection (ml5.js)

// ===== Global Variables =====
let video;
let handPose;
let hands = [];

// ===== Audio =====
let bgmR1;
let clickSound;
let transitionSound;
let resultSound;

let bgmStarted = false;
let transitionSoundPlayed = false;
let resultSoundStarted = false;

let appState = "r1_title"; 
// "r1_title", "r1_instruction", "r1_action", "r1_transition", "r1_result"

// ===== Title Sound Prompt =====
let soundDownImg;
let soundDownVisible = true;   

// --- Images & Videos ---
// Title
let r1TitleBg;
let r1TitleVid;

// Instruction
let r1InstrBg;
let r1InstrVid;

// Action
let r1ActionOverlay;
let makeGestureImg;
let handDetectedImg;
let percentOutsideImg;
let percentBarImg;

// Transitional
let r1TransBgVid;
let r1TransFrameVid;

// Result
let r1ResultBg;
let r1PatternVid;
let r1DeerVid;

// --- Hand Gesture Logic ---
let gestureHoldFrames = 0;
let gestureConfirmed = false;

// --- Buttons (Invisible Areas) ---
let bottomBtnX, bottomBtnY, bottomBtnW, bottomBtnH;          // 通用底部按钮（title / instruction）
let instrBackBtnX, instrBackBtnY, instrBackBtnW, instrBackBtnH; // instruction 左侧返回按钮
let resultHomeBtnX, resultHomeBtnY, resultHomeBtnW, resultHomeBtnH; // result 左下
let resultNextBtnX, resultNextBtnY, resultNextBtnW, resultNextBtnH; // result 右下

// --- Transitional Timer & Rotation ---
let transitionStartTime = 0;
let transIconAngle = 0;

// ===== Preload Assets & Model =====
function preload() {
  soundDownImg = loadImage("/nine_lights_final/ritual_01/ritual01_images/sound_down.png");
  bgmR1 = loadSound("/nine_lights_final/ritual_01/audio_01/flower_offering.mp3");
clickSound = loadSound("/nine_lights_final/ritual_01/audio_01/clicking_sound.mp3");
transitionSound = loadSound("/nine_lights_final/ritual_01/audio_01/transitional_sound.mp3");
resultSound = loadSound("/nine_lights_final/ritual_01/audio_01/result_page_01.mp3");

  r1TitleBg = loadImage("/nine_lights_final/ritual_01/ritual01_images/ritual01_first_page.jpg");
  r1InstrBg = loadImage("/nine_lights_final/ritual_01/ritual01_images/ritual01_instruction.jpg");

  r1ActionOverlay = loadImage("/nine_lights_final/ritual_01/ritual01_images/ritual01_action.png");
  makeGestureImg = loadImage("/nine_lights_final/ritual_01/ritual01_images/make_gestue.png");
  handDetectedImg = loadImage("/nine_lights_final/ritual_01/ritual01_images/hand_detected.png");
  percentOutsideImg = loadImage("/nine_lights_final/ritual_01/ritual01_images/percent_outside.png");
  percentBarImg = loadImage("/nine_lights_final/ritual_01/ritual01_images/percent_bar.png");

  // Result
  r1ResultBg = loadImage("/nine_lights_final/ritual_01/ritual01_images/ritual01_result.jpg");

  handPose = ml5.handPose({ flipped: true });
}

// ===== Setup =====
function setup() {
  createCanvas(1080, 900);

  // Camera
  video = createCapture(VIDEO, { flipped: true });
  video.size(1080, 900);
  video.hide();

  handPose.detectStart(video, (results) => {
    hands = results;
  });

  // Create videos (DOM video elements; all hidden, drawn via image())
  r1TitleVid = createVideo("/nine_lights_final/ritual_01/ritual01_images/ritual_01title.webm");
  r1TitleVid.hide();
  r1TitleVid.loop();

  r1InstrVid = createVideo("/nine_lights_final/ritual_01/ritual01_images/ritual01_instructionpage.webm");
  r1InstrVid.hide();
  r1InstrVid.loop();

  r1TransFrameVid = createVideo("/nine_lights_final/ritual_01/ritual01_images/transitional_page01.webm");
r1TransFrameVid.hide();
r1TransFrameVid.loop();

  r1TransBgVid = createVideo("/nine_lights_final/ritual_01/ritual01_images/cloud.webm");
  r1TransBgVid.hide();
  r1TransBgVid.loop();

  r1PatternVid = createVideo("/nine_lights_final/ritual_01/ritual01_images/pattern_ritual01.webm");
r1PatternVid.hide();
r1PatternVid.loop();
r1PatternVid.speed(0.5); 

  r1DeerVid = createVideo("/nine_lights_final/ritual_01/ritual01_images/deer_motion01.webm");
  r1DeerVid.hide();
  r1DeerVid.loop();

  // --- Invisible Buttons Setup ---
  // Common bottom-center button (title / instruction)
  bottomBtnW = 300;
  bottomBtnH = 120;
  bottomBtnX = width / 2 - bottomBtnW / 2;
  bottomBtnY = height - 160;

  // Instruction left-side back button (not in corner)
  instrBackBtnW = 220;
  instrBackBtnH = 220;
  instrBackBtnX = 80;
  instrBackBtnY = height / 2 - instrBackBtnH / 2;

  // Result left-bottom (home)
  resultHomeBtnW = 200;
  resultHomeBtnH = 120;
  resultHomeBtnX = 60;
  resultHomeBtnY = height - resultHomeBtnH - 40;

  // Result right-bottom (go to ritual 2)
  resultNextBtnW = 200;
  resultNextBtnH = 120;
  resultNextBtnX = width - resultNextBtnW - 60;
  resultNextBtnY = height - resultNextBtnH - 40;
}

function startBGM() {
  userStartAudio(); // 🔓 一定先解锁（多次调用没关系）

  if (!bgmStarted && bgmR1) {
    bgmR1.setVolume(0.35);
    bgmR1.loop();
    bgmStarted = true;
  }

  if (transitionSound) transitionSound.setVolume(0.5);
  if (resultSound)     resultSound.setVolume(0.4);
  if (clickSound)      clickSound.setVolume(0.6);
}

function playClick() {
  userStartAudio(); // 🔓 防止用户先点按钮

  if (!clickSound) return;

  if (clickSound.isPlaying()) {
    clickSound.stop();
  }

  clickSound.play();
}

// ===== Main Draw Loop =====
function draw() {
  if (appState === "r1_title") {
    drawR1Title();
  } else if (appState === "r1_instruction") {
    drawR1Instruction();
  } else if (appState === "r1_action") {
    drawR1Action();
  } else if (appState === "r1_transition") {
    drawR1Transition();
  } else if (appState === "r1_result") {
    drawR1Result();
  }
}

// ====== Page: Title ======
function drawR1Title() {
  // Background
  image(r1TitleBg, 0, 0, width, height);

  // Title video centered
  image(
    r1TitleVid,
    width / 2 - r1TitleVid.width / 2,
    height / 2 - r1TitleVid.height / 2
  );

    // 🔊 sound_down 提示（未启动 BGM 时才显示）
  if (!bgmStarted && soundDownVisible) {
    if (frameCount % 60 < 30) {   // 正常 blinking（无渐变）
      image(soundDownImg, 0, 0, width, height);
    }
  }
  // Debug bottom button (development only)
  // fill(255, 0, 0, 80);
  // rect(bottomBtnX, bottomBtnY, bottomBtnW, bottomBtnH);
}

// ====== Page: Instruction ======
function drawR1Instruction() {
  image(r1InstrBg, 0, 0, width, height);

  image(
    r1InstrVid,
    width / 2 - r1InstrVid.width / 2,
    height / 2 - r1InstrVid.height / 2
  );

  // Debug left back button
  // fill(0, 255, 0, 80);
  // rect(instrBackBtnX, instrBackBtnY, instrBackBtnW, instrBackBtnH);

  // Debug bottom button
  // fill(255, 0, 0, 80);
  // rect(bottomBtnX, bottomBtnY, bottomBtnW, bottomBtnH);
}

// Keep only 2 most central hands
function filterHands(handsArr) {
  if (!handsArr || handsArr.length <= 2) return handsArr;

  const centerX = width / 2;
  const centerY = height / 2;

  let scored = handsArr.map(hand => {
    let wrist = hand.keypoints[0];
    let dx = wrist.x - centerX;
    let dy = wrist.y - centerY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return { hand, distance };
  });

  scored.sort((a, b) => a.distance - b.distance);
  return [scored[0].hand, scored[1].hand];
}

// Select 2 hands closest to screen center
function getDominantHandPair(handsArr) {
  if (!handsArr || handsArr.length < 2) return null;

  const centerX = width / 2;
  const centerY = height / 2;

  let scoredHands = handsArr.map((hand) => {
    let wrist = hand.keypoints[0];
    let dx = wrist.x - centerX;
    let dy = wrist.y - centerY;
    let distToCenter = Math.sqrt(dx * dx + dy * dy);
    return { hand, distToCenter };
  });

  scoredHands.sort((a, b) => a.distToCenter - b.distToCenter);
  if (scoredHands.length >= 2) return [scoredHands[0].hand, scoredHands[1].hand];
  return null;
}

// Pinky gesture detection (your original logic kept intact)
function detectPinkyGesture(handsArr) {
  const pair = getDominantHandPair(handsArr);
  if (!pair) return false;

  const pinkyTipClose = (hand) => {
    const k = hand.keypoints;
    if (k.length < 21) return false;

    const d1 = dist(k[18].x, k[18].y, k[19].x, k[19].y);
    const d2 = dist(k[19].x, k[19].y, k[20].x, k[20].y);
    const d3 = dist(k[18].x, k[18].y, k[20].x, k[20].y);
    return d1 < 35 && d2 < 35 && d3 < 35;
  };

  if (pinkyTipClose(pair[0]) && pinkyTipClose(pair[1])) {
    const w1 = pair[0].keypoints[0];
    const w2 = pair[1].keypoints[0];
    const wristDist = dist(w1.x, w1.y, w2.x, w2.y);
    return wristDist < 100;
  }

  return false;
}

// ====== Page: Action (Camera + HandPose) ======
function drawR1Action() {
  background(0);

  // Draw camera full screen
  image(video, 0, 0, width, height);

  // Overlay frame on top (UI)
  image(r1ActionOverlay, 0, 0, width, height);

  // Filter hands (limit to 2 closest)
  let mainHands = filterHands(hands);

  // Detect pinky gesture（双手合在一起的那个手势）
  let gestureDetected = detectPinkyGesture(mainHands);

  // === Gesture Progress ===
  const HOLD_TARGET_FRAMES = 180; // ~3 seconds at 60fps

  if (gestureDetected) {
    gestureHoldFrames++;
  } else {
    gestureHoldFrames = 0;
  }

  // When fully charged, go to transitional page
  if (!gestureConfirmed && gestureHoldFrames >= HOLD_TARGET_FRAMES) {
  gestureConfirmed = true;

  // 🔊 ADD — 停止 BGM
  if (bgmR1 && bgmR1.isPlaying()) {
    bgmR1.stop();
  }

  // 🔊 ADD — 播放 transition sound（只一次）
  if (!transitionSoundPlayed) {
    transitionSound.play();
    transitionSoundPlayed = true;
  }

  appState = "r1_transition";
  transitionStartTime = millis();
  return;
}

  // ===== 底部 UI：提示图片 + 百分比条 =====

  // 1) 先处理百分比条（在底部图片上方）
  if (gestureDetected && !gestureConfirmed) {
    let percent = constrain(gestureHoldFrames / HOLD_TARGET_FRAMES, 0, 1);

    let barW = width * 0.6;
    let barH = (percentOutsideImg.height / percentOutsideImg.width) * barW;
    let barX = width / 2 - barW / 2;
    let barY = height - barH - 140; // 靠近底部，但留出空间给下面的小图片

    // Outside frame
    image(percentOutsideImg, barX, barY, barW, barH);

    // Inside fill (scale width by percentage)
    let fillW = barW * percent;
    image(percentBarImg, barX, barY, fillW, barH);

    // Percentage text
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    text(Math.round(percent * 100) + "%", width / 2, barY + barH / 2);
  }

  // 2) 底部中间小图片（make_gestue / hand_detected）+ 闪烁
  //    只有一个会出现，由 gestureDetected 决定
 // 2) 底部小图片（make_gestue / hand_detected）+ 闪烁

let statusImg;

// 手势成功 / 失败都统一 UI 大小
if (gestureDetected) {
  statusImg = handDetectedImg;     // detected.png
} else {
  statusImg = makeGestureImg;      // make_gesture.png
}

// ---- 统一大小（和 Ring Bell 一样）----
let statusW = width * 0.30;
let statusH = statusImg.height * (statusW / statusImg.width);

let statusX = width / 2 - statusW / 2;
let statusY = height - statusH - 40;

// ---- 闪烁效果 ----
if (frameCount % 60 < 30) {
  image(statusImg, statusX, statusY, statusW, statusH);
}

  // === Draw Hand Keypoints (for debugging / feedback) ===
  if (mainHands) {
    for (let hand of mainHands) {
      if (hand.confidence > 0.1) {
        for (let keypoint of hand.keypoints) {
          let x = map(keypoint.x, 0, video.width, 0, width);
          let y = map(keypoint.y, 0, video.height, 0, height);

          // 只有当 gestureDetected === true 的时候才变绿
          fill(gestureDetected ? "#A9E761" : "yellow");
          noStroke();
          circle(x, y, 12);
        }
      }
    }
  }
}

// ====== Page: Transitional ======
function drawR1Transition() {
  // Background cloud video
  image(r1TransBgVid, 0, 0, width, height);

  // Foreground transition animation video
  image(r1TransFrameVid, 0, 0, width, height);

  // 计时自动跳转到 result page
  if (millis() - transitionStartTime > 6000) {
  appState = "r1_result";

  bgmR1.stop();

 if (!resultSoundStarted) {
  resultSound.setVolume(0);
  resultSound.loop();
  resultSound.fade(0.35, 2); // 2 秒淡入
  resultSoundStarted = true;
}
}
}

// ====== Page: Result ======
function drawR1Result() {
  // Background
  image(r1ResultBg, 0, 0, width, height);

  // Pattern video at original size (1080x900)
  image(r1PatternVid, 0, 0);

  // Deer video also at original size (1080x900)
  image(r1DeerVid, 0, 0);

  // Debug buttons
  // fill(0, 255, 0, 80);
  // rect(resultHomeBtnX, resultHomeBtnY, resultHomeBtnW, resultHomeBtnH);
  // fill(255, 0, 0, 80);
  // rect(resultNextBtnX, resultNextBtnY, resultNextBtnW, resultNextBtnH);
}

// ===== Mouse Interaction =====
function mousePressed() {

  // --- Title → Instruction (bottom center) ---
  if (appState === "r1_title") {

  // ⭐ 任意点击 → 启动 BGM + 隐藏 sound_down
  if (!bgmStarted) {
    startBGM();
    soundDownVisible = false;   // 👈 关键
  }

  // ⭐ 只有点到按钮才有 click sound + 跳页
  if (
    mouseX > bottomBtnX && mouseX < bottomBtnX + bottomBtnW &&
    mouseY > bottomBtnY && mouseY < bottomBtnY + bottomBtnH
  ) {
    playClick();
    appState = "r1_instruction";
    return;
  }
}

  // --- Instruction ---
  else if (appState === "r1_instruction") {

    // Left-side back button → title
    if (
      mouseX > instrBackBtnX && mouseX < instrBackBtnX + instrBackBtnW &&
      mouseY > instrBackBtnY && mouseY < instrBackBtnY + instrBackBtnH
    ) {
      // 🔊 ADD
      playClick();

      appState = "r1_title";
      return;
    }

    // Bottom button → action page
    if (
      mouseX > bottomBtnX && mouseX < bottomBtnX + bottomBtnW &&
      mouseY > bottomBtnY && mouseY < bottomBtnY + bottomBtnH
    ) {
      // 🔊 ADD
      playClick();

      gestureHoldFrames = 0;
      gestureConfirmed = false;
      appState = "r1_action";
      return;
    }
  }

  // --- Result page buttons ---
  else if (appState === "r1_result") {

    // ⭐ Left-bottom → back to STARTER title page
    if (
      mouseX > resultHomeBtnX && mouseX < resultHomeBtnX + resultHomeBtnW &&
      mouseY > resultHomeBtnY && mouseY < resultHomeBtnY + resultHomeBtnH
    ) {
      // 🔊 ADD
      playClick();

      window.location.href = "/nine_lights_final/index.html";
      return;
    }

    // ⭐ Right-bottom → go to Ritual 02
    if (
      mouseX > resultNextBtnX && mouseX < resultNextBtnX + resultNextBtnW &&
      mouseY > resultNextBtnY && mouseY < resultNextBtnY + resultNextBtnH
    ) {
      // 🔊 ADD
      playClick();

      window.location.href = "/nine_lights_final/ritual_02/index.html";
      return;
    }
  }
}
