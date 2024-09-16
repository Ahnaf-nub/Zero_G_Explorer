/*class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    let options = {
      friction: 0.3,
      restitution: 0.6,
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
}*/

class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    let options = {
      friction: 0.5,
      restitution: 0.7,
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