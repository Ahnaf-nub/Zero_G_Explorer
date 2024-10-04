class Target{
    constructor(x, y, _target){
        this.x = x;
        this.y = y;

        this.lastT = _target;

        this.ang = 0;
        this.sides = 10;
        this.rd = 200;

        this.filled = false;
    }

    show(){
        let colC = (targetCount < targetAmount)? color(60, 237, 47) : color(255, 100, 100);
        push();
        drawingContext.shadowOffsetX = 0;
        drawingContext.shadowOffsetY = 0;
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = colC;
        stroke(colC);
        noFill();
        for(let n = 1; n<=5; n++){
            strokeWeight(25/n);
            let _dir = (n%2==0) ? 1 : -1;
            let r = this.rd/sqrt(n) + sin(this.ang*2 + n) * 15 * _dir;
            drawNgon(this.x, this.y, this.sides, r, this.ang + n*(PI/this.sides));
        }
        pop();


        this.ang += PI/3 * gDelta;
    }

    update(objs){
        for(let i = 0; i<objs.length; i++){
            let object = objs[i];
            if(dist(this.x, this.y, object.x, object.y) < this.rd*1.5){
                let dir = {x: this.x - object.x, y: this.y - object.y};
                Body.setPosition(object.body, vecScale(normalize(dir), this.rd*1.5));
            }
        }
    }
    isIn(astron){
        if(this.filled){
            astron.attract(this.x, this.y, 1, 100);
        }
        else if(dist(this.x, this.y, astron.x, astron.y) < this.rd*1.5){
            astron.freeze();
            this.filled = true;
            tOf(true);
            return false;
        }
        if(this.filled && !astron.frozen){
            return true;
        }
        return false;
    }

    getAng(_body){
        return atan2(this.y - _body.position.y, this.x - _body.position.x);
    }

    nexT(currentTarget, d1, d2){
        let dir = random(TWO_PI);
        let normal ={x: cos(dir), y: sin(dir)};
        let d = random(d1, d2);
        return new Target(this.x + normal.x * d, this.y + normal.y * d, currentTarget);
    }

    static createTarget(w, h, d1, d2){
        let _x = random(-w, w);
        let _y = random(-h, h);

        let normal = normalize({x: _x, y: _y});
        let d = random(d1, d2);
        return new Target(normal.x * d, normal.y * d);
    }
}