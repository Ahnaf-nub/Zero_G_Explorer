class Particle{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.angle = random(TWO_PI);

        this.dir = random(TWO_PI);
        this.speed = random(3, 8);
        this.angularSpd = random(-PI/2, PI/2);

        this.size = random(3, 7);
        this.sides = floor(random(4, 10));
        this.color = lerpColor(color(255, 170, 200), color(200, 170, 255), random(1));

        this.rd = [];
        for(let i=0; i<this.sides; i++){
            this.rd.push(random(this.size/2, this.size*1.5));
        }
    }

    show(){
        push();
        translate(this.x, this.y);
            rotate(this.angle);
            fill(this.color);
            noStroke();
            beginShape();
            for(let i=0; i<this.sides; i++){
                let angle = TWO_PI / this.sides * i;
                let x = cos(angle) * this.rd[i];
                let y = sin(angle) * this.rd[i];
                vertex(x, y);
            }
            endShape(CLOSE);
        pop();
        this.x += cos(this.dir)*this.speed*gDelta;
        this.y += sin(this.dir)*this.speed*gDelta;
        this.angle += this.angularSpd * gDelta;
    }

    reset(_x, _y){
        this.x = _x + random(-200, 200);
        this.y = _y + random(-200, 200);
        this.size = random(4, 10);
    }

    outOfSight(astron){
        if(this.x > astron.x + width*worldSizeB[0]){
            this.reset(this.x - width*worldSizeB[0]*2, this.y);
        }
        if(this.x < astron.x - width*worldSizeB[0]){
            this.reset(this.x + width*worldSizeB[0]*2, this.y);
        }
        if(this.y > astron.y + height*worldSizeB[1]){
            this.reset(this.x, this.y - height*worldSizeB[1]*2);
        }
        if(this.y < astron.y - height*worldSizeB[1]){
            this.reset(this.x, this.y + height*worldSizeB[1]*2);
        }
    }
}