class Astronaut {
  constructor(x, y, ded = false) {
    this.hp = 100;
    this.maxHp = 100;
    this.hitTime = 500;

    this.x = x;
    this.y = y;
    this.maxSpeed = 10;

    this.frozen = false;
    this.dead = ded;
    this.deadBody = ded;

    this.bodyStiffness = 0.1;
    this.stiffnessRange = [0.02, 0.1];
    this.options = {
      friction: 0.9,
      restitution: 0.2,
      label: "astro-limb"
    };
    this.body = Bodies.fromVertices(
      this.x,
      this.y,
      [
        { x: 0, y: -25 },
        { x: 19, y: -20 },
        { x: 17, y: 25 },
        { x: -17, y: 25 },
        { x: -19, y: -20 },
      ],
      this.options
    );
    this.body.label = "astro-body";
    this.head = Bodies.circle(x, y - 35, 15, this.options);
    this.head.label = "astro-head";
    this.armR = Bodies.rectangle(x + 40, y - 20, 35, 10, this.options);
    this.armR.collisionFilter = { group: 2 };

    this.armL = Bodies.rectangle(x - 40, y - 20, 35, 10, this.options);
    this.armL.collisionFilter = { group: 2 };

    this.handR = Bodies.rectangle(x + 80, y - 20, 35, 10, this.options);
    this.handL = Bodies.rectangle(x - 80, y - 20, 35, 10, this.options);

    this.legR = Bodies.rectangle(x + 17, y + 50, 10, 35, this.options);

    this.legL = Bodies.rectangle(x - 17, y + 50, 10, 35, this.options);

    this.legRl = Bodies.rectangle(x + 17, y + 80, 10, 35, this.options);
    this.legLl = Bodies.rectangle(x - 17, y + 80, 10, 35, this.options);
    this.bodyParts = [this.body, this.head, this.armR, this.armL, this.handR, this.handL, this.legR, this.legL, this.legRl, this.legLl];
    this.joints = {};

    this.createJointsUp(
      this.body,
      this.head,
      this.armR,
      this.armL,
      this.handR,
      this.handL
    );
    this.createJointsDown(
      this.body,
      this.legR,
      this.legL,
      this.legRl,
      this.legLl
    );

    Composite.add(world, [
      this.body,
      this.head,
      this.armR,
      this.armL,
      this.handR,
      this.handL,
      this.legR,
      this.legL,
      this.legRl,
      this.legLl,
    ]);
  }

  show() {
    let pos = this.body.position;
    let angle = this.body.angle;
    if(this.deadBody) fill(180);
    else fill(255);
    stroke(100);
    strokeWeight(1);
    this.drawLimb(this.handR, 44, 15, 7.5);
    this.drawLimb(this.handL, 44, 15, 7.5);
    this.drawLimb(this.armR, 40, 15, 5);
    this.drawLimb(this.armL, 40, 15, 5);

    this.drawLimb(this.legR, 20, 42, 7);
    this.drawLimb(this.legL, 20, 42, 7);
    this.drawLimb(this.legRl, 15, 44, 5);
    this.drawLimb(this.legLl, 15, 44, 5);

    drawShapeP(this.body.vertices);
    transform(this.body, ()=>{
      rectMode(CENTER);
      ellipse(20, -15, 20);
      ellipse(-20, -15, 20);
      rect(0, 10, 45, 60, 7);

      for(let i = 0; i < 5; i++){
        let res = this.maxHp/5;
        let mainV = 55;
        if(this.hp > i*res) mainV = 255;

        if(this.hp > i*res && this.hp < (i+1)*res) {
          mainV = map(this.hp%res, 0, res, 55, 255);
        }

        push();
        noStroke();
        rectMode(CENTER);
        if(mainV > 55){
          drawingContext.shadowOffsetX = 0;
          drawingContext.shadowOffsetY = 0;
          drawingContext.shadowBlur = 5;
          drawingContext.shadowColor = color(0, 255, 255, mainV/2);
          if(this.hp <= 2*res) drawingContext.shadowColor = color(255, 70, 170, mainV/2);
        }
        fill(0, mainV, mainV);
        if(this.hp <= 2*res) fill(mainV, mainV*0.25, mainV*0.75);
        rect(19, -i*10+30, 10, 5, 2.5);
        rect(-19, -i*10+30, 10, 5, 2.5);
        pop();
      }
    });
    ellipse(this.head.position.x, this.head.position.y, 40, 40);
  }

  createJointsUp(_body, _head, _rhU, _lhU, _rhD, _lhD) {
    let b_h = {
      bodyA: _body,
      bodyB: _head,
      length: 2,
      pointA: { x: 0, y: -25 },
      pointB: { x: 0, y: 15 },
      stiffness: 1,
      damping: 0.5,
    };

    let c_b_h = Constraint.create(b_h);
    this.joints['head'] = c_b_h;

    let b_ru = {
      bodyA: _body,
      bodyB: _rhU,
      pointA: { x: 20, y: -15 },
      pointB: { x: -20, y: 0 },
      damping: 0.5,
      length: 0
    };

    let c_b_ru = Constraint.create(b_ru);
    this.joints['right-upper'] = c_b_ru;

    let b_lu = {
      bodyA: _body,
      bodyB: _lhU,
      pointA: { x: -20, y: -15 },
      pointB: { x: 20, y: 0 },
      damping: 0.5,
      length: 0
    };

    let c_b_lu = Constraint.create(b_lu);
    this.joints['left-upper'] = c_b_lu;

    let ru_rd = {
      bodyA: _rhU,
      bodyB: _rhD,
      pointA: { x: 20, y: 0 },
      pointB: { x: -20, y: 0 },
      damping: 0.5,
    };

    let c_ru_rd = Constraint.create(ru_rd);
    this.joints['right-down'] = c_ru_rd;

    let lu_ld = {
      bodyA: _lhU,
      bodyB: _lhD,
      pointA: { x: -20, y: 0 },
      pointB: { x: 20, y: 0 },
      damping: 0.5,
    };

    let c_lu_ld = Constraint.create(lu_ld);
    this.joints['left-down'] = c_lu_ld;

    World.add(world, [c_b_h, c_b_ru, c_b_lu, c_ru_rd, c_lu_ld]);
  }
  
  
  createJointsDown(_body, _rlU, _llU, _rlD, _llD) {

    let b_ru = {
      bodyA: _body,
      bodyB: _rlU,
      pointA: { x: 15, y: 30 },
      pointB: { x: 0, y: -20 },
      damping: 0.5,
      stiffness: 1,
      length: 0.5
    };

    let c_b_ru = Constraint.create(b_ru);
    this.joints['leg-right-upper'] = c_b_ru;
    
    let b_lu = {
      bodyA: _body,
      bodyB: _llU,
      pointA: { x: -10, y: 30 },
      pointB: { x: 0, y: -20 },
      damping: 0.5,
      stiffness: 1,
      length: 0.5
    };

    let c_b_lu = Constraint.create(b_lu);
    this.joints['leg-left-upper'] = c_b_lu;
    
    let ru_rd = {
      bodyA: _rlU,
      bodyB: _rlD,
      pointA: { x: 0, y: 20 },
      pointB: { x: 0, y: -20 },
      damping: 0.5,
      stiffness: 1,
      length: 0.5
    };

    let c_ru_rd = Constraint.create(ru_rd);
    this.joints['leg-right-down'] = c_ru_rd;
    
    let lu_ld = {
      bodyA: _llU,
      bodyB: _llD,
      pointA: { x: 0, y: 20 },
      pointB: { x: 0, y: -20 },
      damping: 0.5,
      stiffness: 1,
      length: 0.5
    };

    let c_lu_ld = Constraint.create(lu_ld);
    this.joints['leg-left-down'] = c_lu_ld;
    
    World.add(world, [c_b_ru, c_b_lu, c_ru_rd, c_lu_ld]);
  }
  
  thrust(t){
    if(this.frozen || this.dead) return;
    let thrustDir = 0;

    let forceAmount = 0.01 * t;
    let velo = magnitude(this.body.velocity);
    let ang = this.body.angle - PI/2;
    let _x = Math.cos(ang);
    let _y = Math.sin(ang);

    let dot = dotP({x: _x, y: _y}, this.body.velocity);
    
    if(t >= 0){
      if(velo < this.maxSpeed){
        Body.applyForce(this.body, this.body.position, {x: _x*forceAmount, y: _y*forceAmount});
        thrustDir = 1;
      }
    }
    else if(t < 0 &&  dot > 0){
      Body.applyForce(this.body, this.body.position, {x: _x*forceAmount, y: _y*forceAmount});
      thrustDir = -1;
    }
  
    this.bodyStiffness = map(velo, 0, this.maxSpeed, this.stiffnessRange[0], this.stiffnessRange[1]);
    return thrustDir;
  }

  setAng(angle = null) {
    if(this.frozen || this.dead){
      let stV = 0.01;
      if(this.deadBody) stV = 0.005;
      this.addStiff(this.head, this.body, 0, stV);
      this.addStiff(this.armR, this.body, +PI/10, stV);
      this.addStiff(this.armL, this.body, -PI/10, stV);
      this.addStiff(this.handR, this.body, +PI/20, stV);
      this.addStiff(this.handL, this.body, -PI/20, stV);
      
      this.addStiff(this.legR, this.body, -PI/15, stV);
      this.addStiff(this.legL, this.body, PI/15, stV);
      this.addStiff(this.legRl, this.body, -PI/10, stV);
      this.addStiff(this.legLl, this.body, PI/10, stV);
    }

    else{
      Body.setAngle(this.body, lerp(this.body.angle, angle, 0.05), {updateVelocity:false});

      this.addStiff(this.head, this.body, 0, 0.1);
      this.addStiff(this.armR, this.body, PI/2-PI/10, this.bodyStiffness);
      this.addStiff(this.armL, this.body, -PI/2+PI/10, this.bodyStiffness);
      this.addStiff(this.handR, this.body, PI/2-PI/20, this.bodyStiffness);
      this.addStiff(this.handL, this.body, -PI/2+PI/20, this.bodyStiffness);
      
      this.addStiff(this.legR, this.body, -PI/20, this.bodyStiffness*5);
      this.addStiff(this.legL, this.body, PI/20, this.bodyStiffness*5);
      this.addStiff(this.legRl, this.body, -PI/20, this.bodyStiffness*5);
      this.addStiff(this.legLl, this.body, PI/20, this.bodyStiffness*5);
    }
  }

  update(angle){
    this.setAng(angle);
    if(timer.isOver("freeze") && !this.dead){
      this.frozen = false;
    }
    this.x = this.body.position.x;
    this.y = this.body.position.y;
  }

  getSpdP(){
    return magnitude(this.body.velocity)/this.maxSpeed;
  }

  addStiff(bodyThis, bodyThat, angOff, stiffness){
    Body.setAngle(bodyThis, lerp(bodyThis.angle, bodyThat.angle + angOff, stiffness), {updateVelocity:false});
  }

  getHit(place, force){
    if(timer.isOver("hit") && !this.frozen){
      timer.setTimer("hit", this.hitTime);

      force = force * max(this.body.speed/this.maxSpeed, 0.6);
      console.log(place, force);

      if(place == "head" && force > 5){
        this.hp -= min(force, 100)/1.5;
        if(force > 30){
          this.freeze();
        }
      }
      if(place == "body" && force > 5){
        this.hp -= min(force, 50)/3;
      }
      if(place == "limb"){
        this.hp -= min(force, 30)/2;
      }
    }
    
    this.hp = constrain(this.hp, 0, this.maxHp);
  }

  freeze(){
    timer.setTimer("freeze", 3000);
    this.frozen = true;
  }

  unFreeze(){
    this.frozen = false;
    timer.removeTimer("freeze");
  }

  attract(x, y, _force=0.1, minRd = 10){
    let dir = {x: x - this.body.position.x, y: y - this.body.position.y};
    let mag = magnitude(dir);
    let force = _force / mag;
    let _dir = normalize(dir);
    if(dist(this.x, this.y, x, y) > minRd){
      Body.applyForce(this.body, this.body.position, {x: _dir.x*force, y: _dir.y*force});
    }
    
  }

  die(){
    this.bodyParts.forEach((part)=>{ part.frictionAir = 0.005; });
    this.bodyParts.forEach((part)=>{ part.label = "dead"; });
    this.dead = true;
  }

  remove() {
    this.bodyParts.forEach((part)=>{ World.remove(world, part) });
  }

  drawLimb(_limb, _w, _h, rounding, offset = null){
    transform(_limb, ()=>{
      rectMode(CENTER);
      if(offset){
        rect(offset.x, offset.y, _w, _h, rounding);
      }else{
        rect(0, 0, _w, _h, rounding);
      }
    });
  }
}