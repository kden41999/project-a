let moth;
let embers = [];
let stars = [];
let trail = [];
let state = "drift";
let timer = 0;
let off;

function setup() {
  createCanvas(800, 500);
  off = random(1000);
  moth = spawnMoth();
  for (let i = 0; i < 90; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      r: random(0.5, 1.6),
      ph: random(TWO_PI)
    });
  }
}

function spawnMoth() {
  return {
    x: random(width * 0.3, width * 0.7),
    y: random(height * 0.3, height * 0.7),
    vx: 0,
    vy: 0,
    size: random(15, 24),
    hue: random(18, 42),
    flap: random(1000)
  };
}

function draw() {
  drawSky();
  drawStars();
  drawMoon();

  if (state == "drift") {
    moveMoth();
    drawMoth();
    if (dist(moth.x, moth.y, mouseX, mouseY) < 140) state = "orbit";
  } else if (state == "orbit") {
    moveMoth();
    drawMoth();
    if (dist(moth.x, moth.y, mouseX, mouseY) > 260) state = "drift";
  } else {
    updateBurn();
  }

  if (state != "burn") drawFlame();
}

function drawSky() {
  for (let y = 0; y <= height; y += 4) {
    let t = pow(y / height, 1.3);
    let r = lerp(6, 34, t);
    let g = lerp(6, 16, t);
    let b = lerp(20, 52, t);
    stroke(r, g, b);
    line(0, y, width, y);
  }
  noStroke();
}

function drawStars() {
  for (let st of stars) {
    let tw = 55 + 55 * sin(frameCount * 0.05 + st.ph);
    fill(205, 205, 225, tw);
    circle(st.x, st.y, st.r * 2);
  }
}

function drawMoon() {
  let mp = 92 + sin(frameCount * 0.02) * 6;
  let mx = width - 130, my = 110;
  fill(215, 215, 195, 14);
  circle(mx, my, mp + 90);
  fill(215, 215, 195, 22);
  circle(mx, my, mp + 40);
  fill(232, 232, 214);
  circle(mx, my, mp);
  fill(205, 205, 188);
  ellipse(mx - mp * 0.12, my - mp * 0.14, mp * 0.2, mp * 0.18);
  fill(210, 210, 194);
  ellipse(mx + mp * 0.13, my + mp * 0.14, mp * 0.14, mp * 0.12);
}

function drawFlame() {
  let fl = 1 + sin(frameCount * 0.9) * 0.15;
  fill(255, 130, 40, 20);
  circle(mouseX, mouseY, 80 * fl);
  fill(255, 175, 80, 50);
  circle(mouseX, mouseY, 34 * fl);
  fill(255, 240, 200, 130);
  circle(mouseX, mouseY, 12 * fl);
}

function moveMoth() {
  let d = dist(moth.x, moth.y, mouseX, mouseY);

  let tx, ty;
  if (state == "orbit") {
    tx = mouseX;
    ty = mouseY;
  } else {
    tx = width - 130;
    ty = 110;
  }

  let pull = map(d, 0, 400, 2.2, 0.35, true);
  let dx = tx - moth.x;
  let dy = ty - moth.y;
  let len = sqrt(dx * dx + dy * dy) + 0.001;
  dx = dx / len * pull;
  dy = dy / len * pull;

  let wobAmt = 0.8;
  if (state == "orbit") wobAmt = map(d, 0, 300, 2.0, 0.7, true);

  let wx = map(noise(off, frameCount * 0.03), 0, 1, -wobAmt, wobAmt);
  let wy = map(noise(off + 99, frameCount * 0.03), 0, 1, -wobAmt, wobAmt);

  moth.vx += dx + wx;
  moth.vy += dy + wy;

  let maxSpd = 2.2;
  if (state == "orbit") maxSpd = 4.2;
  let spd = sqrt(moth.vx * moth.vx + moth.vy * moth.vy);
  if (spd > maxSpd) {
    moth.vx = moth.vx / spd * maxSpd;
    moth.vy = moth.vy / spd * maxSpd;
  }

  moth.x += moth.vx;
  moth.y += moth.vy;

  trail.push({ x: moth.x, y: moth.y });
  if (trail.length > 32) trail.shift();
}

function drawMoth() {
  let breathe = 0.72 + sin(frameCount * 0.08) * 0.28;
  let flap = sin(frameCount * 0.32 + moth.flap);
  let ang = atan2(moth.vy, moth.vx) + HALF_PI;

  for (let i = 1; i < trail.length; i++) {
    stroke(255, 150, 60, map(i, 0, trail.length, 0, 80));
    strokeWeight(map(i, 0, trail.length, 1, 3.5));
    line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }
  noStroke();

  push();
  translate(moth.x, moth.y);
  rotate(ang);
  colorMode(HSB, 360, 100, 100, 255);

  fill(moth.hue, 78, 100, 5 * breathe);
  circle(0, 0, moth.size * 4.2);
  fill(moth.hue, 75, 100, 9 * breathe);
  circle(0, 0, moth.size * 2.6);

  let s = moth.size;
  let w1 = 0.5 + flap * 0.4;
  let w2 = 0.5 + sin(frameCount * 0.32 + moth.flap - 0.6) * 0.35;

  fill(moth.hue + 10, 24, 98, 235);
  push();
  rotate(-w1);
  ellipse(-s * 1.1, -s * 0.25, s * 2.1, s * 1.05);
  pop();
  push();
  rotate(w1);
  ellipse(s * 1.1, -s * 0.25, s * 2.1, s * 1.05);
  pop();

  fill(moth.hue + 5, 39, 88, 200);
  push();
  rotate(-w2 - 0.35);
  ellipse(-s * 0.75, s * 0.5, s * 1.3, s * 0.7);
  pop();
  push();
  rotate(w2 + 0.35);
  ellipse(s * 0.75, s * 0.5, s * 1.3, s * 0.7);
  pop();

  fill(moth.hue, 70, 100, 230 * breathe);
  ellipse(0, 0, s * 0.55, s * 1.3);
  fill(moth.hue + 12, 35, 100, 245);
  circle(0, -s * 0.6, s * 0.34);

  colorMode(RGB);
  pop();
}

function updateBurn() {
  timer--;
  if (timer > 192) {
    let t = timer - 192;
    fill(255, 190, 100, t * 9);
    circle(width / 2, height / 2, 140 + t * 18);
    fill(255, 230, 170, t * 14);
    circle(width / 2, height / 2, 60 + t * 8);
  }
  for (let i = embers.length - 1; i >= 0; i--) {
    let e = embers[i];
    if (timer < 90) {
      e.vx += (width / 2 - e.x) * 0.0026;
      e.vy += (height / 2 - e.y) * 0.0026;
    }
    e.vy -= 0.008;
    e.x += e.vx;
    e.y += e.vy;
    e.vx *= 0.963;
    e.vy *= 0.963;
    e.life -= 1.3;

    let a = constrain(e.life, 0, 255);
    if (e.streak) {
      stroke(255, 180, 80, a);
      strokeWeight(2);
      line(e.x, e.y, e.x - e.vx * 4, e.y - e.vy * 4);
      noStroke();
    }
    fill(255, random(130, 205), 55, a);
    circle(e.x, e.y, e.r * 2);

    if (e.life <= 0) embers.splice(i, 1);
  }
  if (timer <= 0) {
    embers = [];
    moth = spawnMoth();
    moth.x = width / 2;
    moth.y = height / 2;
    trail = [];
    state = "drift";
  }
}

function mousePressed() {
  if (state == "burn") return;
  state = "burn";
  timer = 200;
  for (let i = 0; i < 160; i++) {
    let ang = random(TWO_PI);
    let spd = random(0.8, 5.5);
    embers.push({
      x: moth.x,
      y: moth.y,
      vx: cos(ang) * spd,
      vy: sin(ang) * spd,
      life: 255,
      r: random(1.5, 3.5),
      streak: random() < 0.25
    });
  }
  trail = [];
}
