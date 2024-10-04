class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    let options = {
      friction: 0.3,
      restitution: 0.2,
      frictionAir: 0,
      angle: random(TWO_PI)
    };
    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);
    this.body.label = "object";
    Composite.add(world, this.body);
  }

  show() {
    let pos = this.body.position;
    let angle = this.body.angle;

    this.x = pos.x;
    this.y = pos.y;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    strokeWeight(10);
    stroke(125, 87, 65);
    fill(135, 101, 91);
    rect(0, 0, this.w, this.h);

    let numOfLines = this.w / 30;
    strokeCap(SQUARE);
    for (let i = 0; i < numOfLines; i++) {
      line(-this.w / 2 + i * 30, -this.h / 2 + 10, -this.w / 2 + i * 30, this.h / 2 -10 );
    }
    pop();
  }

  reset(_x, _y){
    let x = _x + random(-200, 200);
    let y = _y + random(-200, 200);
    Body.setPosition(this.body, {x, y}, false);
    Body.setAngle(this.body, random(TWO_PI), false);
    Body.setSpeed(this.body, 0);
  }

  outOfSight(astron){
    if(this.x > astron.x + width*worldSizeA[0]){
      this.reset(this.x - width*worldSizeA[0]*2, this.y);
    }
    if(this.x < astron.x - width*worldSizeA[0]){
      this.reset(this.x + width*worldSizeA[0]*2, this.y);
    }
    if(this.y > astron.y + height*worldSizeA[1]){
      this.reset(this.x, this.y - height*worldSizeA[1]*2);
    }
    if(this.y < astron.y - height*worldSizeA[1]){
      this.reset(this.x, this.y + height*worldSizeA[1]*2);
    }
  }

  remove() {
    World.remove(world, this.body);
  }
}

class Obstacle2 {
  constructor(x, y, s) {
    this.x = x;
    this.y = y;
    this.s = s;
    let options = {
      friction: 0.3,
      restitution: 0.6,
      frictionAir: 0
    };
    this.tp = "";
    if(s < 2.5) this.tp = "R";
    this.obj = new Astroid(x, y, s, options, this.tp);
    this.body = this.obj.getBody();
    Body.setPosition(this.body, {x: x, y: y}, false);
    Body.setAngle(this.body, random(TWO_PI), false);
    this.body.label = "object";
    Composite.add(world, this.body);
  }

  show() {
    noFill();
    stroke(255);
    
    this.x = this.body.position.x;
    this.y = this.body.position.y;
    this.obj.show();
  }

  reset(_x, _y){
    let x = _x + random(-200, 200);
    let y = _y + random(-200, 200);
    Body.setPosition(this.body, {x, y}, false);
    Body.setAngle(this.body, random(TWO_PI), false);
    Body.setSpeed(this.body, 0);
  }

  outOfSight(astron){
    if(this.x > astron.x + width*worldSizeA[0]){
      this.reset(this.x - width*worldSizeA[0]*2, this.y);
    }
    if(this.x < astron.x - width*worldSizeA[0]){
      this.reset(this.x + width*worldSizeA[0]*2, this.y);
    }
    if(this.y > astron.y + height*worldSizeA[1]){
      this.reset(this.x, this.y - height*worldSizeA[1]*2);
    }
    if(this.y < astron.y - height*worldSizeA[1]){
      this.reset(this.x, this.y + height*worldSizeA[1]*2);
    }
  }

  remove() {
    World.remove(world, this.body);
  }
}

class Astroid {
  static OPTIONS = ["astr_01", "astr_02", "astr_03"];
  constructor(x, y, scale, options, _type="") {
    this.hitBox = Astroid.OPTIONS[Math.floor(Math.random() * Astroid.OPTIONS.length)];
    this.s = scale;

    options.removeDuplicatePoints = 0.5;
    options.removeCollinear=0.01;

    this.pth = assets.getAsset(this.hitBox+"B");
    this.vrts = Vertices.scale(this.pth, this.s, this.s);
    this.body = Bodies.fromVertices(0, 0, this.vrts, options);
    Body.setDensity(this.body, 0.002)
    this.off = {x: (this.body.bounds.max.x + this.body.bounds.min.x)/2, y: (this.body.bounds.max.y + this.body.bounds.min.y)/2};
    this._type = _type;
  }

  getBody(){
    return this.body;
  }

  show() {
    this.x = this.body.position.x;
    this.y = this.body.position.y;
    let pos = this.body.position;
    let angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    imageMode(CENTER);
    image(assets.getAsset(this.hitBox+this._type), this.off.x, this.off.y, this.s*100, this.s*100);
    pop();
  }

  reset(_x, _y){
    let x = _x + random(-200, 200);
    let y = _y + random(-200, 200);
    Body.setPosition(this.body, {x, y}, false);
    Body.setAngle(this.body, random(TWO_PI), false);
    Body.setSpeed(this.body, 0);
    console.log(this.body.position);
  }

  outOfSight(astron){
    if(this.x > astron.x + width*worldSizeA[0]){
      this.reset(this.x - width*worldSizeA[0]*2, this.y);
    }
    if(this.x < astron.x - width*worldSizeA[0]){
      this.reset(this.x + width*worldSizeA[0]*2, this.y);
    }
    if(this.y > astron.y + height*worldSizeA[1]){
      this.reset(this.x, this.y - height*worldSizeA[1]*2);
    }
    if(this.y < astron.y - height*worldSizeA[1]){
      this.reset(this.x, this.y + height*worldSizeA[1]*2);
    }
  }

  remove() {
    World.remove(world, this.body);
  }
}