// 全域變數
let circles = []; // 儲存所有圓形物件
let colors = [    // 八種顏色
  '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', 
  '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'
];
let numCircles = 30; // 圓形的數量
let backgroundColor = '#f5ebe0'; // 畫布背景顏色

// 遊戲狀態變數
let popSound; 
let score = 0; // 初始得分

// 定義加分和扣分的顏色組
const POSITIVE_COLORS = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf'];
const TEXT_COLOR = '#001219';
const TEXT_SIZE = 32;

// --- p5.js 核心函式 ---

// 預載入資源 (音效)
function preload() {
  // *** 請確保 'pop_sound.mp3' 檔案存在於正確的路徑！ ***
  popSound = loadSound('pop_sound.mp3'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化圓形物件
  for (let i = 0; i < numCircles; i++) {
    circles.push(new Circle());
  }
  
  rectMode(CENTER); 
}

function draw() {
  background(backgroundColor);  

  for (let i = 0; i < circles.length; i++) {
    circles[i].move();    // 移動圓形或更新爆破狀態
    circles[i].display(); // 顯示圓形或爆破效果
  }
  
  drawHUD(); // 繪製介面文字和得分
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 偵測滑鼠點擊
function mousePressed() {
  // 從最後一個氣球往前檢查，確保點擊到最上層的氣球
  for (let i = circles.length - 1; i >= 0; i--) {
    // 檢查點擊是否在氣球範圍內，並處理得分邏輯
    if (circles[i].checkClicked(mouseX, mouseY)) {
      // 成功點擊並觸發爆破，退出迴圈避免重複處理
      break; 
    }
  }
  
  // P5.js 聲音政策：需要在第一次使用者交互時解鎖聲音
  if (popSound && !popSound.isLoaded()) {
      // 嘗試重新載入或確保聲音可以播放 (如果瀏覽器鎖定了)
      // 在大多數現代瀏覽器中，第一次 mousePressed() 呼叫 play() 即可解鎖
      if (popSound.isLoaded() && popSound.duration() > 0) {
        popSound.play();
        popSound.stop();
      }
  }
}

// 繪製抬頭顯示器 (HUD)
function drawHUD() {
  textSize(TEXT_SIZE);
  fill(TEXT_COLOR);
  noStroke();
  
  // --- 左上角：固定文字 ---
  textAlign(LEFT, TOP);
  text("學號為414730126", 15, 15); // 15px 邊距
  
  // --- 右上角：得分 ---
  textAlign(RIGHT, TOP);
  text("得分: " + score, width - 15, 15); // 15px 邊距
}


// --- 圓形類別 (包含爆破邏輯) ---

class Circle {
  constructor() {
    this.reset(); 
  }

  // 設定圓形的初始/重置狀態
  reset() {
    this.x = random(width); 
    this.y = random(height, height + 100); 
    
    this.diameter = random(50, 200); 
    this.speed = random(0.5, 3); 
    
    // *** 儲存原始 Hex 顏色用於計分 ***
    this.hexColor = random(colors); 
    
    // 設定 p5 顏色物件，並加入隨機透明度
    let col = color(this.hexColor); 
    col.setAlpha(random(50, 200)); 
    this.color = col;

    this.isPopping = false; 
    this.popParticles = []; 
    this.popFrameCount = 0; 
  }

  // 檢查滑鼠點擊是否在氣球內，並處理計分
  checkClicked(px, py) {
    if (this.isPopping) {
      return false; // 爆破中的氣球不可再次點擊
    }
    
    // 檢查滑鼠點擊是否在圓形範圍內
    let d = dist(px, py, this.x, this.y);
    if (d < this.diameter / 2) {
      this.startPopping();
      
      // *** 執行計分邏輯 ***
      if (POSITIVE_COLORS.includes(this.hexColor)) {
        score += 1;
      } else {
        score -= 1;
      }
      return true;
    }
    return false;
  }
  
  // 移動圓形
  move() {
    if (!this.isPopping) { 
      this.y -= this.speed; 

      // 如果圓形完全飄出畫布頂端，則將其重新放置到底部
      if (this.y < -this.diameter / 2) {
        this.reset(); 
        this.y = height + this.diameter / 2; 
      }
      
      // *** 移除隨機爆破邏輯 ***
      
    } else {
      // 如果正在爆破，更新爆破粒子
      this.updatePopParticles();
    }
  }

  // 開始爆破 (邏輯不變)
  startPopping() {
    if (popSound && popSound.isLoaded()) {
      popSound.stop(); 
      popSound.play();
    }
    
    this.isPopping = true;
    this.popFrameCount = 0;
    
    let numParticles = int(random(8, 15));
    for (let i = 0; i < numParticles; i++) {
      let angle = random(TWO_PI); 
      let particleSpeed = random(2, 5);
      this.popParticles.push({
        x: this.x,
        y: this.y,
        vx: cos(angle) * particleSpeed, 
        vy: sin(angle) * particleSpeed,
        size: random(3, 8), 
        life: 100, 
        color: this.color 
      });
    }
  }

  // 更新爆破粒子狀態 (邏輯不變)
  updatePopParticles() {
    for (let i = this.popParticles.length - 1; i >= 0; i--) {
      let p = this.popParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 5; 

      p.vy += 0.1; 
      p.vx *= 0.98; 
      p.vy *= 0.98;

      if (p.life <= 0) {
        this.popParticles.splice(i, 1); 
      }
    }
    this.popFrameCount++;

    if (this.popParticles.length === 0 && this.popFrameCount > 30) { 
      this.reset();
      this.y = height + this.diameter / 2; 
    }
  }

  // 顯示圓形和方形 (邏輯不變)
  display() {
    if (!this.isPopping) {
      // 1. 繪製圓形
      noStroke(); 
      fill(this.color); 
      ellipse(this.x, this.y, this.diameter, this.diameter);
      
      // 2. 繪製圓形右上方的小方形 (作為高光)
      let squareSize = this.diameter / 6;
      let radius = this.diameter / 2;
      let angle = PI / 4;  
      let offsetRadius = radius / 2;  
      let squareX = this.x + cos(angle) * offsetRadius;
      let squareY = this.y - sin(angle) * offsetRadius;

      fill(255, 255, 255, 150);  
      noStroke(); 
      rect(squareX, squareY, squareSize, squareSize);
    } else {
      // 顯示爆破粒子
      for (let p of this.popParticles) {
        let newAlpha = map(p.life, 0, 100, 0, alpha(p.color)); 
        
        fill(red(p.color), green(p.color), blue(p.color), newAlpha);
        noStroke();
        ellipse(p.x, p.y, p.size, p.size);
      }
    }
  }
}