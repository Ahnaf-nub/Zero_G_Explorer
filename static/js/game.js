// collision 



const { Engine, World, Bodies, Body, Composite, Common, Constraint, Events, Svg, Vertices} = Matter;

let gDelta = 0;
var inputH;
var assets;
var timer;
var qMenu;
let qThis;

var engine;
var world;
let objects = [];
let particles = [];

const worldSizeA = [3, 3];
const worldSizeB = [2, 2];
checkDist = [2000, 3000];

let player, targetAngle=0;
let deadBodies = [];
let targetScaleValue = 1;
let scaleValue = 1;

let nextTarget, targetCount = 0, targetAmount = 10;

let assetList = ["astr_01", "astr_02", "astr_03", "astr_01R", "astr_02R", "astr_03R", "astr_01B", "astr_02B", "astr_03B"];
let loadedAll = false;
let setupFinished = false;
async function preload(){
  assets = new AssetLoader(this);
  await assets.loadAssetSVGPath("astr_01B", "Astroids/astr_01_B.svg");
  await assets.loadAssetSVGPath("astr_02B", "Astroids/astr_02_B.svg");
  await assets.loadAssetSVGPath("astr_03B", "Astroids/astr_03_B.svg");
  await assets.loadAssetSVG("astr_01", "Astroids/astr_01.svg");
  await assets.loadAssetSVG("astr_02", "Astroids/astr_02.svg");
  await assets.loadAssetSVG("astr_03", "Astroids/astr_03.svg");
  await assets.loadAssetSVG("astr_01R", "Astroids/astr_01_R.svg");
  await assets.loadAssetSVG("astr_02R", "Astroids/astr_02_R.svg");
  await assets.loadAssetSVG("astr_03R", "Astroids/astr_03_R.svg");
  loadedAll = true;
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  let count_retry = 0;
  while(count_retry < 200 || !loadedAll){
    let loaded = assets.allLoaded(assetList);
    console.error(`Not Loaded: ${loaded}`);
    if(loadedAll){
      console.log("All assets loaded");
      break;
    }
    count_retry++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  engine = Engine.create();
  engine.gravity = {x:0, y:0}
  world = engine.world;
  timer = new Timer(this)
  inputH = new InputHandler(InputHandler.MAXIMUM);
  inputH.bindButtonKeyboard("select", 32);
  Common.setDecomp(decomp);
  enableCollisionEvents(engine);

  player = new Astronaut(0, 1000);

  nextTarget = new Target(0, 0);
  nextTarget = nextTarget.nexT(nextTarget, checkDist[0], checkDist[1]);

  for(let i=0; i<50; i++){
    let posx = random(-width*worldSizeA[0], width*worldSizeA[0]);
    let posy = random(-height*worldSizeA[1], height*worldSizeA[1]);
    if(dist(posx, posy, 0, 0) > 800){
      if(i < 6){
        let s = minimumRand(5, 12, 4);
        objects.push(new Obstacle2(posx, posy, s));
      }
      else if(i < 35){
        let s = minimumRand(1, 5, 4);
        objects.push(new Obstacle2(posx, posy, s));
      }
      else{
        let w = int(random(1, 4)) * 100;
        let h = int(random(1, 4)) * 100;
        objects.push(new Obstacle(posx, posy, max(w, h), min(w, h)));
      }
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

  
  Matter.Runner.run(engine);
  setupFinished = true;

  qMenu = new QuizMenu();
}

function draw() {
  if(!setupFinished) return;
  if(frameRate()!=0){
    gDelta = 1/frameRate();
  }
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

  if(nextTarget){
    noFill();
    stroke(255, 100, 100);
    strokeWeight(2/scaleValue);
    arc(player.x, player.y, 300, 300, nextTarget.getAng(player.body)-PI/6, nextTarget.getAng(player.body)+PI/6);
    if(nextTarget.isIn(player)){
      targetCount++;
      if(targetCount >= targetAmount) nextTarget = null; 
      else {
        nextTarget = nextTarget.nexT(nextTarget, checkDist[0], checkDist[1]);
        nextTarget.update(objects);
        qMenu.getQuiz();
      }

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

  uiHandling();
}


function handleInput(){
  let thrust = inputH.checkInput("axisY");
  if(thrust < 0) thrust *= 0.5;
  player.thrust(thrust);
  targetAngle += inputH.checkInput("axisX") * 0.1;
}

function uiHandling(){
  if(qMenu){
    if(qMenu.qz){
      player.freeze();
      qMenu.show();
      qMenu.update(-1*inputH.checkInput("axisY"), inputH.getButton("select"));
    }
  }
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