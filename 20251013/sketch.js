// --- 圓的設定 ---
let circles = [];
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
const NUM_CIRCLES = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始化圓
  circles = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    circles.push({
      x: random(width),
      y: random(height),
      r: random(50, 200),
      color: color(random(COLORS)),
      alpha: random(80, 255),
      speed: random(1, 5)
    });
  }
}

function draw() {
  background('#fcf6bd');
  noStroke();
  for (let c of circles) {
    c.y -= c.speed;
    if (c.y + c.r / 2 < 0) { // 如果圓完全移出畫面頂端
      c.y = height + c.r / 2;  // 從底部重新出現
      c.x = random(width);
      c.r = random(50, 200);
      c.color = color(random(COLORS));
      c.alpha = random(80, 255);
      c.speed = random(1, 5);
    }
    c.color.setAlpha(c.alpha); // 設定透明度
    fill(c.color); // 使用設定的顏色
    circle(c.x, c.y, c.r); // 畫圓

    // 在圓的右上方1/4圓的中間產生方形
    let squareSize = c.r / 6;
    // 右上1/4圓的中間點：圓心往右上45度方向移動 r/2 * sqrt(2)/2
    let angle = -PI / 4; // 右上45度
    let distance = c.r / 2 * 0.65; // 1/4圓的中間，距離圓心 r/2 * 0.5
    let squareCenterX = c.x + cos(angle) * distance;
    let squareCenterY = c.y + sin(angle) * distance;
    fill(255, 255, 255, 120); // 白色透明
    noStroke();
    rectMode(CENTER);
    rect(squareCenterX, squareCenterY, squareSize, squareSize);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新分布圓的位置
  for (let c of circles) {
    c.x = random(width);
    c.y = random(height);
  }
}