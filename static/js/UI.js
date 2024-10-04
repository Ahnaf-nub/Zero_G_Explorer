class HUDMenu{
    constructor(){
        this.showing = true;
    }

    show(){
        if(this.showing){
            rectMode(CORNER);
            noStroke();
            fill(0, 50, 10, 150);
            rect(0, 0, width, ps(10));

            fill(255);
            textSize(ps(4));

            textAlign(LEFT, CENTER);
            text(targetCount+" / "+(targetAmount), ps(3), ps(5));

            textAlign(RIGHT, CENTER);
            text("Quiz: "+qScore, width-ps(3), ps(5));

            textAlign(CENTER, CENTER);
            text(tme(timer.getTimer("timeOfFlight")), width/2, ps(5));
        }
    }
}


class QuizMenu{
    constructor(qz=null){
        this.qz = qz;
        this.corr = false;
        this.selected = 0; 
        this.scored = false;  
    }

    async getQuiz(){
        if(timer.isOver("newQ") && !this.qz){
            qThis = await getAPI("/quiz");
            if(!qThis["question"]){
                return;
            }
            this.qz = qThis;
            timer.setTimer("newQ", 2000);
            this.selected = 0;
            timer.removeTimer("ansShow", 2000);
            this.scored = false;
        }
    }
    show(){
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        
        if(!timer.exists("ansShow")){
            stroke(0, 255, 255);

            push();
            strokeWeight(ps(0.5));
            noFill();
            drawingContext.shadowOffsetX = 0;
            drawingContext.shadowOffsetY = 0;
            drawingContext.shadowBlur = 5;
            drawingContext.shadowColor = color(0, 255, 255);
            drawingContext.lineDashOffset = Math.sin(millis()/5000)*ps(10);
            drawingContext.setLineDash([ps(5), ps(20)]);
            rect(px(50), py(50), ps(94), ps(94), ps(7));
            pop();

            noStroke();
            fill(50, 170, 170, 200);
            rect(px(50), py(50), ps(90), ps(90), ps(5));
            
            fill(0, 50);
            rect(px(50), py(27.5), ps(85), ps(40), ps(2.5));
            textSize(ps(4));
            fill(255, 255, 255);
            text(this.qz.question, px(50), py(27.5), ps(80), ps(35));

            for(let i=0; i<this.qz.options.length; i++){
                let opt = this.qz.options[i];
                if(i == this.selected){
                    fill(0, 255, 100);
                    noStroke();
                    rect(px(50), py(54 + i*10), ps(77), ps(10), ps(3));
                    fill(0);
                    textSize(ps(3));
                    text(opt, px(50), py(54 + i*10));
                }else{
                    noFill();
                    stroke(0, 255, 100);
                    strokeWeight(ps(0.5));
                    rect(px(50), py(54 + i*10), ps(75), ps(8), ps(2));
                    noStroke();
                    fill(255);
                    textSize(ps(3));
                    text(opt, px(50), py(54 + i*10));
                }
            }
        }
        else{
            stroke(255, 0, 255);
            if(this.corr){stroke(0, 255, 150);}
            push();
            strokeWeight(ps(0.5));
            noFill();
            drawingContext.shadowOffsetX = 0;
            drawingContext.shadowOffsetY = 0;
            drawingContext.shadowBlur = 5;
            drawingContext.shadowColor = (this.corr)? color(0, 255, 150) : color(255, 0, 255);
            drawingContext.lineDashOffset = Math.sin(millis()/5000)*ps(10);
            drawingContext.setLineDash([ps(2), ps(2), ps(5), ps(2), ps(2), ps(20)]);
            rect(px(50), py(50), ps(94), ps(94), ps(7));
            pop();

            noStroke();
            fill(170, 50, 170, 200);
            if(this.corr){fill(50, 170, 120, 200);}
            rect(px(50), py(50), ps(90), ps(90), ps(5));

            textSize(ps(15));
            fill(255, 255, 255);
            if(this.corr){
                text("Correct!", px(50), py(50));
            }else{
                text("Wrong!", px(50), py(50));
            }
        }
    }

    async update(inp, sel){

        if(timer.isOver("qInp")){
            if(inp > 0.5){
                this.selected += 1;
                timer.setTimer("qInp", 250);
            }else if(inp < -0.5){
                this.selected -= 1;
                timer.setTimer("qInp", 250);
            }
            if(this.selected > this.qz.options.length-1) this.selected = 0;
            if(this.selected < 0) this.selected = this.qz.options.length-1;
        }
        if(inp == 0){
            timer.removeTimer("qInp");
        }
        if(sel && !timer.exists("ansShow")){
            let _corr = await getAPI(`quiz/${this.qz.id}/${this.selected}`);
            this.corr = _corr["correct"];
            if(!this.scored){
                qScore += (this.corr)? 1000 : 0;
                this.scored = true;
            }

            timer.setTimer("ansShow", 3000);
        }


        if(timer.exists("ansShow") && timer.isOver("ansShow")){
            this.qz = null;
            player.unFreeze();
            timer.removeTimer("ansShow");
            this.corr = false;
            tOf(false);
        }
    }
}



class EndMenu{
    constructor(){
        this.showing = false;
    }

    show(){
        if(this.showing){
            rectMode(CENTER);
            textAlign(CENTER, CENTER);
            stroke(255, 255, 0);

            push();
            strokeWeight(ps(0.5));
            noFill();
            drawingContext.shadowOffsetX = 0;
            drawingContext.shadowOffsetY = 0;
            drawingContext.shadowBlur = 5;
            drawingContext.shadowColor = color(255, 255, 0);
            drawingContext.lineDashOffset = Math.sin(millis()/5000)*ps(10);
            drawingContext.setLineDash([ps(5), ps(20), ps(2), ps(20)]);
            rect(px(50), py(50), ps(94), ps(94), ps(7));
            pop();

            noStroke();
            fill(50, 170, 170, 200);
            rect(px(50), py(50), ps(90), ps(90), ps(5));

            textSize(ps(8));
            fill(255, 255, 255);
            text("Mission Complete!", px(50), py(20));

            fill(0, 100);
            rect(px(50), py(35), ps(25), ps(10), ps(3));
            fill(255);
            textSize(ps(5));
            text(tme(timeFlight), px(50), py(35));

            textSize(ps(4));
            text("Quiz Score:", px(30), py(45));
            textSize(ps(8));
            text(qScore, px(30), py(51));

            textSize(ps(4));
            text("Time Score:", px(70), py(45));
            textSize(ps(8));
            text(tScore, px(70), py(51));

            textSize(ps(5));
            text("Total Score:", px(50), py(65));
            textSize(ps(12));
            text(qScore + tScore, px(50), py(75));
        }
    }
}


function px(x){
    let bgn = width/2 - Math.min(width, height)/2;
    let end = width/2 + Math.min(width, height)/2;
    let W = end - bgn;
    let sclr = W/100;
    return bgn + x*sclr; 
}

function py(y){
    let bgn = height/2 - Math.min(width, height)/2;
    let end = height/2 + Math.min(width, height)/2;
    let H = end - bgn;
    let sclr = H/100;
    return bgn + y*sclr;
}

function ps(s){
    let sz = Math.min(width, height);
    let sclr = sz/100;
    return s*sclr;
}