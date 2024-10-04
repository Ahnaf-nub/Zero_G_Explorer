function vecScale(vector, scalar){
    return {x: vector.x * scalar, y: vector.y * scalar};
}

function vecMult(vectorA, vectorB){
    return {x: vectorA.x * vectorB.x, y: vectorA.y * vectorB.y};
}

function dotP(vecA, vecB){
    return vecA.x * vecB.x + vecA.y * vecB.y;
}

function magnitude(vector){
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function normalize(vector){
    let mag = magnitude(vector);
    return {x: vector.x / mag, y: vector.y / mag};
}

function minimumRand(a, b, order){
    let val = random(a, b);
    for(let i = 1; i<order; i++){
        val = min(val, random(a, b));
    }
    return val;
}
function maximumRand(a, b, order){
    let val = random(a, b);
    for(let i = 1; i<order; i++){
        val = max(val, random(a, b));
    }
    return val;
}

function impulseForce(collision){
    let veloA = collision.bodyA.velocity;
    let veloB = collision.bodyB.velocity;

    let momentumA = vecScale(veloA, collision.bodyA.mass);
    let momentumB = vecScale(veloB, collision.bodyB.mass);
    let relMomentum = {x: momentumA.x - momentumB.x, y: momentumA.y - momentumB.y};

    let imp = abs(dotP(relMomentum, collision.normal));
    return imp;
}

function drawShapeP(verts, off = {x: 0, y: 0}){
    if(!verts)
        return;
    
    beginShape();
    for (let i = 0; i < verts.length; i++) {
      let vert = verts[i];
      vertex(vert.x + off.x, vert.y + off.y);
    }
    endShape(CLOSE);
}

function drawBoxP(_body, w, h, rounding, offset = null){
    let pos = _body.position;
    let angle = _body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    if(offset){
        rect(offset.x, offset.y, w, h, rounding);
    }else{
        rect(0, 0, w, h, rounding);
    }
    pop();
}

function drawNgon(_x, _y, sides, r, offset=0){
    beginShape();
    for(let i=0; i<sides; i++){
        let angle = TWO_PI / sides * i;
        angle += offset;
        let x = _x + cos(angle) * r;
        let y = _y + sin(angle) * r;
        vertex(x, y);
    }
    endShape(CLOSE);
}

function transform(targetBody, func){
    push();
    translate(targetBody.position.x, targetBody.position.y);
    rotate(targetBody.angle);
    func();
    pop();
}

function isAstronaut(_body){
    if(_body.label.startsWith("astro")){
        return true;
    }
    return false;
}

function player_n_object(bodyA, bodyB){
    if(isAstronaut(bodyA) && !isAstronaut(bodyB)){
        return bodyA;
    }
    if(!isAstronaut(bodyA) && isAstronaut(bodyB)){
        return bodyB;
    }
    return false;
}

function moduloAng(angle){
    let in360 = angle % TWO_PI;
    if(in360 <= -PI){
        in360 = TWO_PI - abs(in360);
    }
    if(in360 > PI){
        in360 = -(TWO_PI - in360);
    }
    return in360;
}


function sc(v){
    return v * targetScaleValue;
}


async function getAPI(url){
    let resp = await fetch(url);
    resp = await resp.json();
    return resp;
}

async function postAPI(url, data){
    let resp = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    resp = await resp.json();
    return resp;
}

function submitScore(){
    let data = {
        score: qScore + tScore,
        quiz: qScore,
        tScore: tScore,
        time: timeFlight
    }
    postAPI("/scoreUpdate", data);
    scoreSubmitted = true;
}

function tOf(_pause){
    if(_pause && !timer.exists("tofPause")){
        timer.setTimer("tofPause");
        HUD.showing = false;
    }
    else{
        timer.updateTimer("timeOfFlight", timer.getTimer("tofPause"));
        timer.removeTimer("tofPause");
        HUD.showing = true;
    }
}

function tme(tm){
    let sec = floor(tm/1000);
    let min = floor(sec/60);
    sec = sec % 60;
    if(sec < 10){
        sec = "0"+sec;
    }
    return min+":"+sec;
}