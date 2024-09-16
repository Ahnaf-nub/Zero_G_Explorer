// collision 



const { Engine, World, Bodies, Body, Composite, Constraint, Events, Svg} = Matter;

let gDelta = 0;
var inputH;
var assets;
var timer;

let engine;
let world;
let objects = [];
let particles = [];
let astr;
let hpAngle;

const worldSizeA = [3, 3];
const worldSizeB = [2, 2];
checkDist = [2000, 3000];

let player, targetAngle=0;
let deadBodies = [];
let targetScaleValue = 1;
let scaleValue = 1;

let nextTarget, targetCount = 0, targetAmount = 10;

function preload(){
  assets = new AssetLoader(this);
  assets.loadAssetSVGPath("astr_01B", "Astroids/astr_01_B.svg");
  assets.loadAssetSVG("astr_01", "Astroids/astr_01.svg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  engine = Engine.create();
  engine.gravity = {x:0, y:0}
  world = engine.world;
  Matter.Runner.run(engine);
  timer = new Timer(this)
  inputH = new InputHandler(InputHandler.MAXIMUM);
  inputH.axisYKeys = [[40, 83], [32, 38, 87]];
  hpAngle = PI/6;
  enableCollisionEvents(engine);

  player = new Astronaut(0, 0);  

  nextTarget = new Target(0, 0);
  nextTarget = nextTarget.nexT(nextTarget, checkDist[0], checkDist[1]);

  for(let i=0; i<50; i++){
    let posx = random(-width*worldSizeA[0], width*worldSizeA[0]);
    let posy = random(-height*worldSizeA[1], height*worldSizeA[1]);
    if(dist(posx, posy, 0, 0) > 400){
      let w = minimumRand(50, 500, 2);
      let h = minimumRand(50, 500, 2);
      objects.push(new Obstacle(posx, posy, max(w, h), min(w,h)) );
    }
    else{
      i--;
    }
  }

  for(let i=0; i<100; i++){
    let posx = random(-width*worldSizeB[0], width*worldSizeB[0]);
    let posy = random(-height*worldSizeB[1], height*worldSizeB[1]);
    particles.push(new Particle(posx, posy));
  }
}

function draw() {
  if(frameRate()!=0) gDelta = 1/frameRate();
  push();
  scaleValue = constrain(lerp(scaleValue, targetScaleValue * map(player.getSpdP(), 0, 1, 1, 0.5), 0.05), targetScaleValue/2, targetScaleValue);
  scale(scaleValue);
  translate(width/(2*scaleValue) - player.body.position.x, height/(2*scaleValue) - player.body.position.y);
  background(51);

  for(let i=particles.length-1; i>=0; i--){
    let particle = particles[i];
    particle.show();
    particle.outOfSight(player);
  }

  if(nextTarget){
    nextTarget.show();
  }

  for(let i=objects.length-1; i>=0; i--){
    let obj = objects[i];
    obj.outOfSight(player);
    obj.show();
  }

  for(let i=deadBodies.length-1; i>=0; i--){
    let bdy = deadBodies[i];
    if(dist(player.x, player.y, bdy.x, bdy.y) < 3000){
      bdy.show();
      bdy.update();
    }
  }

  player.show();
  player.update(targetAngle);

  fill(255);
  imageMode(CENTER);
  //drawShapeP(assets.getAsset("astr_01B"));
  image(assets.getAsset("astr_01"), 0, 0, 1000, 1000);

  if(nextTarget){
    noFill();
    stroke(255, 100, 100);
    strokeWeight(2/scaleValue);
    arc(player.x, player.y, 300, 300, nextTarget.getAng(player.body)-PI/6, nextTarget.getAng(player.body)+PI/6);
    nextTarget.update(objects);
    if(nextTarget.isIn(player)){
      targetCount++;
      if(targetCount >= targetAmount) nextTarget = null; 
      else nextTarget = nextTarget.nexT(nextTarget, checkDist[0], checkDist[1]);
    }
  }

  pop();

  handleInput();

  if(player.hp <= 0){
    if(!timer.exists("dead")){
      timer.setTimer("dead", 4000);
      player.die();
    }
    if(timer.isOver("dead")){
      let dedB = new Astronaut(player.body.position.x, player.body.position.y, true);
      dedB.hp = 0; dedB.die();
      deadBodies.push(dedB);
      player.remove();
      player = new Astronaut(nextTarget.lastT.x, nextTarget.lastT.y);
      targetAngle = moduloAng(targetAngle);
      timer.removeTimer("dead");
    }
  }

  
}


function handleInput(){
  let thrust = inputH.checkInput("axisY");
  if(thrust < 0) thrust *= 0.5;
  player.thrust(thrust);
  targetAngle += inputH.checkInput("axisX") * 0.1;
}

function enableCollisionEvents(_engine){
  Events.on(_engine, 'collisionStart', function(event) {
    let pair = event.pairs;
    if(pair.length > 0){
      for(let i=0; i<pair.length; i++){
        let bodyA = pair[i].bodyA;
        let bodyB = pair[i].bodyB;
        let plrPart = player_n_object(bodyA, bodyB);
        if(plrPart){
          let impulse = impulseForce(pair[i].collision);
          if(plrPart.label == "astro-head"){
            player.getHit("head", impulse);
          }else if(plrPart.label == "astro-body"){
            player.getHit("body", impulse);
          }else if(plrPart.label == "astro-limb"){
            player.getHit("limb", impulse);
          }
        }
      }
    }
  });
}


window.addEventListener('resize', function() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
});