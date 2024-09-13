class Timer{
    constructor(){
        this.timers = {};
    }

    setTimer(name, dur = 100){
        this.timers[name] = {t0: millis(), dur};
    }

    getTimer(name){
        if(this.timers[name])
            return millis() - this.timers[name].t0;
        return null;
    }

    isOver(name){
        if(this.timers[name]){
            if(millis() - this.timers[name].t0 > this.timers[name].dur){
                return true;
            }
            return false;
        }
        return true;
    }

    exists(name){
        return this.timers[name] ? true : false;
    }

    removeTimer(name){
        if(this.timers[name]){
            delete this.timers[name];
        }
    }

    resetTimer(name, dur = null){
        if(this.timers[name]){
            this.timers[name].t0 = millis();
            if(dur) this.timers[name].dur = dur;
        }
    }
}