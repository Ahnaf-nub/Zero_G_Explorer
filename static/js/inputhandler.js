class InputHandler {
    static MINIMUM = 1;
    static MAXIMUM = 0;
    static MIXED = 2;
    static KEYBOARD = 3;
    static GAMEPAD = 4;

    constructor(mixType = MAXIMUM){
        this.axisX = 0;
        this.axisXKeys = [[37, 65], [39, 68]]
        this.axisY = 0;
        this.axisYKeys = [[40, 83], [38, 87]]
        this.axisZ = 0;
        this.axisZKeys = [[81], [69]]

        this.buttons = {};

        this.mixType = mixType;
    }

    bindButtonGamepad(name, _buttonIndex){
        if(!this.buttons[name]) this.buttons[name] = {};
        this.buttons[name]["buttonIndex"] = _buttonIndex;
    }

    bindButtonKeyboard(name, _key){
        if(!this.buttons[name]) this.buttons[name] = {};
        this.buttons[name]["key"] = _key;
    }

    getAxisX(){
        return this.checkInput("axisX");
    }

    getAxisY(){
        return this.checkInput("axisY");
    }

    getAxisZ(){
        return this.checkInput("axisZ");
    }

    getButton(name){
        let btn = this.buttons[name];
        if(btn){
            if(Gamepad.length > 0){
                let gp = Gamepad[0];
                if(gp.buttons[btn.buttonIndex].pressed){
                    return true;
                }
            }
            else{
                if(this.isPressedArr([btn.key])){
                    return true;
                }
            }
        }
        return false;
    }


    checkInput(channel){
        let valG = 0;
        if(Gamepad.length > 0){
            let gp = Gamepad[0];
            if(channel == "axisX"){
                valG = gp.axes[0];
            }
            else if(channel == "axisY"){
                valG = gp.axes[1];
            }
            else if(channel == "axisZ"){
                valG = gp.axes[2];
            }
        }
        
        let valK = 0;
        if(channel == "axisX"){
            if(this.isPressedArr(this.axisXKeys[0])) valK = -1;
            else if(this.isPressedArr(this.axisXKeys[1])) valK = 1;
            else valK = 0;
        }
        else if(channel == "axisY"){
            if(this.isPressedArr(this.axisYKeys[0])) valK = -1;
            else if(this.isPressedArr(this.axisYKeys[1])) valK = 1;
            else valK = 0;
        }
        else if(channel == "axisZ"){
            if(this.isPressedArr(this.axisZKeys[0])) valK = -1;
            else if(this.isPressedArr(this.axisZKeys[1])) valK = 1;
            else valK = 0;
        }
        return this.getMixed(valG, valK);
        
    }

    getMixed(valG, valK){
        if(this.mixType == InputHandler.MAXIMUM){
            if(Math.abs(valG) > Math.abs(valK)) return valG;
            return valK;
        }
        if(this.mixType == InputHandler.MINIMUM){
            if(Math.abs(valG) < Math.abs(valK)) return valG;
            return valK;
        }
        if(this.mixType == InputHandler.MIXED){
            return (valG + valK)/2;
        }
        if(this.mixType == InputHandler.KEYBOARD){
            return valK;
        }
        if(this.mixType == InputHandler.GAMEPAD){
            return valG;
        }
    }

    isPressedArr(arr){
        for(let i=0; i<arr.length; i++){
            if(keyIsDown(arr[i])) return true;
        }
        return false;
    }
}