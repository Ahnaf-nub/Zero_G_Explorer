let socket;
let avatarX = 300;
let avatarY = 300;
let forwardSpeed = 0;
let angleThreshold = 160; // Threshold for forward movement

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Establish WebSocket connection
  socket = new WebSocket("ws://192.168.10.126:81"); // Replace with ESP32 IP

  socket.onmessage = function (event) {
    let angle = parseFloat(event.data);
    console.log("Angle received: " + angle);
    // Move forward if the angle is greater than the threshold
    if (angle >= angleThreshold) {
      forwardSpeed = 5; // Increase speed
    } else {
      forwardSpeed = 0; // Stop movement
    }
  };
}

function draw() {
  background(30, 30, 30);  // Dark background

  // Draw avatar (a glowing circle)
  fill(102, 255, 204);
  stroke(255);
  strokeWeight(3);
  ellipse(avatarX, avatarY, 50, 50);

  // Move avatar forward
  avatarY -= forwardSpeed;

  // Ensure avatar stays within the canvas
  if (avatarY < 0) {
    avatarY = height;
  }

  // Draw movement trail
  stroke(102, 255, 204, 150);
  strokeWeight(1);
  for (let i = 0; i < 10; i++) {
    line(avatarX, avatarY + i * 10, avatarX, avatarY + i * 20);
  }

  // Display text instructions
  fill(255);
  textSize(16);
  textAlign(CENTER);
  text("Lean forward to move the avatar", width / 2, 30);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}