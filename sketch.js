let pathPoints = [];
let gameState = "WAITING"; // WAITING, PLAYING, GAMEOVER, WON
const buttonSize = 40;
let startTime = 0; // 紀錄開始時間
let finalTime = 0; // 紀錄結束時花費的時間

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  initGame();
}

function initGame() {
  pathPoints = [];
  gameState = "WAITING";
  finalTime = 0;
  let numPoints = 8; // 定義路徑節點數量
  
  // 確保隨機性
  randomSeed(millis());
  
  // 在螢幕中間產生隨機路徑點
  for (let i = 0; i < numPoints; i++) {
    let yPos = height / 2 + random(-height * 0.3, height * 0.3);
    pathPoints.push({
      x: map(i, 0, numPoints - 1, 100, width - 100),
      y: yPos,
      baseY: yPos // 記錄原始 Y 座標作為震盪基準
    });
  }
}

function updatePath() {
  // 調整這裡的參數可以改變難度
  let speed = 0.002;      // 波動速度
  let amplitude = 40;     // 波動幅度（像素）
  let frequency = 0.8;    // 波浪頻率（點與點之間的偏移量）

  // 跳過第一個點(i=0)與最後一個點(i=length-1)，保持固定不動
  for (let i = 1; i < pathPoints.length - 1; i++) {
    let p = pathPoints[i];
    p.y = p.baseY + sin(millis() * speed + i * frequency) * amplitude;
  }
}

function draw() {
  background(20); // 深色背景

  if (pathPoints.length > 0) {
    updatePath(); // 每一幀更新路徑位置
    drawWire();
    
    // 繪製起點與終點按鈕
    drawEndpoints();

    if (gameState === "WAITING") {
      drawOverlay("點擊綠色圓圈開始挑戰", [0, 255, 100]);
    } else if (gameState === "PLAYING") {
      checkCollision();
      // 指示文字
      fill(255);
      noStroke();
      textAlign(LEFT, TOP);
      textSize(16);
      let currentTime = (millis() - startTime) / 1000;
      text(`目標：抵達紅色終點！\n目前時間：${currentTime.toFixed(2)} 秒`, 20, 20);
    } else if (gameState === "GAMEOVER") {
      drawOverlay("挑戰失敗！點擊畫面重新開始", [255, 50, 50]);
    } else if (gameState === "WON") {
      let msg = `恭喜過關！\n總耗時：${finalTime.toFixed(2)} 秒\n點擊畫面重新開始`;
      drawOverlay(msg, [255, 215, 0]);
    }

    drawPlayer();
  }
}

function drawEndpoints() {
  let start = pathPoints[0];
  let end = pathPoints[pathPoints.length - 1];

  // 起點 (綠)
  fill(0, 255, 100);
  noStroke();
  ellipse(start.x, start.y, buttonSize);
  
  // 起點文字
  textAlign(CENTER, BOTTOM);
  textSize(20);
  text("起點", start.x, start.y - buttonSize / 2 - 5);

  // 終點 (紅)
  if (gameState === "PLAYING") {
    fill(255, 50, 50);
    ellipse(end.x, end.y, buttonSize);
    
    // 終點文字
    textAlign(CENTER, BOTTOM);
    textSize(20);
    text("終點", end.x, end.y - buttonSize / 2 - 5);
  }
}

function drawWire() {
  noFill();
  
  // 繪製軌道底色（緩衝區）
  stroke(50, 50, 50);
  strokeWeight(60); // 軌道寬度
  drawSmoothCurve();

  // 繪製核心導線（金色線條）
  stroke(255, 215, 0);
  strokeWeight(12);
  drawSmoothCurve();
}

function drawSmoothCurve() {
  beginShape();
  if (pathPoints.length > 0) {
    // curveVertex 需要重複起點與終點作為控制點以達到圓滑效果
    curveVertex(pathPoints[0].x, pathPoints[0].y);
    for (let p of pathPoints) {
      curveVertex(p.x, p.y);
    }
    curveVertex(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y);
  }
  endShape();
}

function checkCollision() {
  let start = pathPoints[0];
  let end = pathPoints[pathPoints.length - 1];

  // 檢查是否到達終點
  let distToEnd = dist(mouseX, mouseY, end.x, end.y);
  if (distToEnd < buttonSize / 2) {
    finalTime = (millis() - startTime) / 1000;
    gameState = "WON";
    return;
  }

  // 取得滑鼠位置的顏色
  let c = get(mouseX, mouseY);
  let b = brightness(c);

  // 如果顏色太暗（背景色），代表出軌
  // 我們稍微放寬判定，只要亮度極低即算失敗
  if (b < 10) {
    gameState = "GAMEOVER";
  }
}

function drawPlayer() {
  if (gameState === "PLAYING") {
    noCursor();
    noFill();
    stroke(255);
    strokeWeight(3);
    ellipse(mouseX, mouseY, 20, 20);
  } else {
    cursor(ARROW);
  }
}

function drawOverlay(msg, col) {
  textAlign(CENTER, CENTER);
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  fill(col);
  textSize(48);
  text(msg, width / 2, height / 2);
}

function mousePressed() {
  if (gameState === "WAITING") {
    let start = pathPoints[0];
    if (dist(mouseX, mouseY, start.x, start.y) < buttonSize / 2) {
      startTime = millis();
      gameState = "PLAYING";
    }
  } else if (gameState === "GAMEOVER" || gameState === "WON") {
    initGame();
  }
}

function windowResized() {
  // 視窗大小改變時，重新調整畫布
  resizeCanvas(windowWidth, windowHeight);
  initGame();
}
