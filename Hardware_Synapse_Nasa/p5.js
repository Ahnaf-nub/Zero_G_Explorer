let socket;
let avatarZ = 0;
let forwardSpeed = 0;
let forwrdangleThreshold = 120; // Threshold for forward movement
let backwardangleThreshold = 60; // Threshold for backward movement

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);  // Enable WebGL for 3D

  // Establish WebSocket connection
  socket = new WebSocket("ws://192.168.10.126:81"); // Replace with ESP32 IP

  socket.onmessage = function (event) {
    let angle = parseFloat(event.data);
    console.log("Angle received: " + angle);

    // Move forward if the angle is greater than the threshold
    if (angle > forwrdangleThreshold) {
      forwardSpeed = 5; // Go Forward
    }
    // Move backward if the angle is smaller than the backward threshold
    else if (angle < backwardangleThreshold) {
      forwardSpeed = -5; // Go Backward
    } else {
      forwardSpeed = 0; // Stop movement
    }
  };
}

function draw() {
  background(30);  // Dark background
  lights();  // Add lighting to the scene

  // Set camera perspective
  camera(0, -300, 600, 0, 0, 0, 0, 1, 0);

  // Draw 3D Avatar (a glowing sphere)
  push();
  translate(0, 0, avatarZ);  // Move avatar along Z-axis
  ambientMaterial(102, 255, 204);  // Glowing greenish material
  sphere(50);  // 3D sphere with radius 50
  pop();

  // Move avatar forward/backward
  avatarZ -= forwardSpeed;

  // Reset avatar position when it moves too far away
  if (avatarZ < -1000 || avatarZ > 1000) {
    avatarZ = 0;
  }

  // Display text instructions
  push();
  translate(0, -250, 200);  // Position the text
  textSize(20);
  fill(255);
  textAlign(CENTER);
  text("Lean forward or backward to move the 3D avatar", 0, 0);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}