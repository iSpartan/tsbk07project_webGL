var keyboardControls = (function () {

    function keyboardControls() {
    this.pitch = 0;
    this.pitchRate = 0;

    this.yaw = 0;
    this.yawRate = 0;

    this.lastTime = 0;
    this.camMove = mat4.create();
    this.camMatrix = mat4.create();
    mat4.identity(this.camMatrix);
    this.lastStepX = 0, this.lastStepY = 0, this.lastStepZ = 0;
    this.elapsed = 0;
    this.MAX_DISTANCE = 10000;
    this.moveSpeed = 0.010;
    this.objSpeed = 0.5;

    this.currentlyPressedKeys = {};

    this.objPos = mat4.create();
    mat4.identity(this.objPos);
    };

    keyboardControls.prototype.handleKeyDown = function(event) {
        this.currentlyPressedKeys[event.keyCode] = true;
    };

    keyboardControls.prototype.handleKeyUp = function(event) {
        this.currentlyPressedKeys[event.keyCode] = false;
    };

    keyboardControls.prototype.changeSpeed = function(){
        if (this.currentlyPressedKeys[90] && this.moveSpeed < 0.04 ) {
            //  Z
            this.moveSpeed += 0.001;
            
        } else if (this.currentlyPressedKeys[88] && this.moveSpeed > 0.002) {
            // X
            this.moveSpeed -= 0.001;
        }
    }

    keyboardControls.prototype.lookUpOrDown = function(){
        if (this.currentlyPressedKeys[104]) {
            // Numpad 8
            this.pitchRate = 0.1;
        } else if (this.currentlyPressedKeys[101]) {
            // Numpad 5
            this.pitchRate = -0.1;
        } else {
            this.pitchRate = 0;
        }
    }

    keyboardControls.prototype.lookRightOrLeft = function(){
        if (this.currentlyPressedKeys[100]) {
            // Numpad 4
            this.yawRate = 0.1;
        } else if (this.currentlyPressedKeys[102]) {
            // Numpad 6
            this.yawRate = -0.1;
        } else {
            this.yawRate = 0;
        }
    }

    keyboardControls.prototype.moveForwardOrBackward = function(){
        if (this.currentlyPressedKeys[87] ) {
            //  W
            this.speedZ = this.moveSpeed;
            return true;
        } else if (this.currentlyPressedKeys[83]) {
            // S
            this.speedZ = -this.moveSpeed;
            return true;
        } else {
            this.speedZ = 0;
            return false;
        }
    }

    keyboardControls.prototype.moveRightOrLeft = function(){
        if (this.currentlyPressedKeys[68]) {
            //  D
            this.speedX = -this.moveSpeed;
            return true;
        } else if (this.currentlyPressedKeys[65]) {
            //  A
            this.speedX = this.moveSpeed;
            return true;
        } else {
            this.speedX = 0;
            return false;
        }
    }

    keyboardControls.prototype.moveUpOrDown = function(){
        if (this.currentlyPressedKeys[69]) {
            //  E
            this.speedY = this.moveSpeed;
            return true;
        } else if (this.currentlyPressedKeys[81]) {
            //  Q
            this.speedY = -this.moveSpeed;
            return true;
        } else {
            this.speedY = 0;
            return false;
        }
    }

    keyboardControls.prototype.handleMoveObject = function(){
        this.rotateObjY();
        this.changeObjSpeed();
        this.moveObjUpOrDown();
        this.moveObjRightOrLeft();
        this.moveObjForwardOrBackward();
        this.printPos();
    }

    keyboardControls.prototype.moveObjUpOrDown = function(){
        if (this.currentlyPressedKeys[85]) {
            //  U
            // mat4.translate(this.objPos, this.objPos, [0, -1, 0]);
            this.objMatY = this.objSpeed;
        } else if (this.currentlyPressedKeys[79]) {
            // O
            // mat4.translate(this.objPos, this.objPos, [0, 1, 0]);
            this.objMatY = -this.objSpeed;
        } else {
            this.objMatY = 0;
        }
    }

    keyboardControls.prototype.moveObjRightOrLeft = function(){
        if (this.currentlyPressedKeys[76]) {
            //  L
            // mat4.translate(this.objPos, this.objPos, [-1, 0, 0]);
            this.objMatX = this.objSpeed;
        } else if (this.currentlyPressedKeys[74]) {
            // J
            // mat4.translate(this.objPos, this.objPos, [1, 0, 0]);
            this.objMatX = -this.objSpeed;
        } else {
            this.objMatX = 0;
        }
    }

    keyboardControls.prototype.moveObjForwardOrBackward = function(){
        if (this.currentlyPressedKeys[73]) {
            //  I
            // mat4.translate(this.objPos, this.objPos, [0, 0, 1]);
            this.objMatZ = -this.objSpeed;
        } else if (this.currentlyPressedKeys[75]) {
            // K
            // mat4.translate(this.objPos, this.objPos, [0, 0, -1]);
            this.objMatZ = this.objSpeed;
        } else{
            this.objMatZ = 0;
        }
    }

    keyboardControls.prototype.changeObjSpeed = function(){
        if (this.currentlyPressedKeys[78] && this.objSpeed < 2 ) {
            //  Z
            this.objSpeed = this.objSpeed * 1.1;
            
        } else if (this.currentlyPressedKeys[77] && this.moveSpeed > 0.001) {
            // X
            this.objSpeed = this.objSpeed * 0.9;
        }
    }

    keyboardControls.prototype.rotateObjY = function(){
        if (this.currentlyPressedKeys[89]) {
            //  Z
            this.objRotY = this.objSpeed
            
        } else if (this.currentlyPressedKeys[72]) {
            // X
            this.objRotY = -this.objSpeed;
        } else {
            this.objRotY = 0;
        }
    }

    keyboardControls.prototype.printPos = function(){
        if (this.currentlyPressedKeys[80]) {
            //  P
            console.log(this.objPos);
        }
    }

    keyboardControls.prototype.handleKeys = function(ourObjects) {

        this.changeSpeed();
        this.lookUpOrDown();
        this.lookRightOrLeft();
        this.handleMoveObject();

        var changeX = false, changeY = false, changeZ = false, hasCollided = false;
        
        if(this.currentlyPressedKeys[87] || this.currentlyPressedKeys[83] ||
           this.currentlyPressedKeys[68] || this.currentlyPressedKeys[65] ||
           this.currentlyPressedKeys[81] || this.currentlyPressedKeys[69] ){

        changeZ = this.moveForwardOrBackward();

        changeX = this.moveRightOrLeft();

        changeY = this.moveUpOrDown();

        var collisionValue = isColliding(ourObjects, this.MAX_DISTANCE, this.camMatrix);
        if( collisionValue > 0.05){
            if (changeZ ) {
                this.speedZ = -collisionValue*100*this.speedZ;
            }
            if (changeY ) {
                this.speedY = -collisionValue*100*this.speedY;
            }
            if (changeX ) {
                this.speedX = -collisionValue*100*this.speedX;
            }
        }

        } else {    //no keys pressed
        this.speedX = 0;
        this.speedY = 0;
        this.speedZ = 0;
        }
    };

    function isColliding(someModels, MAX_DISTANCE, camMatrix){
        var shortestDist = MAX_DISTANCE, distance = 0;
        var modelPositionVec = {name:"modelPosVec"};
        var indexOfClosest = 0;
        var difference = 0;
        for (var i = 0; i < someModels.length; i++){
             modelPositionVec.posVec = getModelPosistion(someModels[i].positionMatrix, camMatrix);
            distance = getDistanceToModel(modelPositionVec.posVec); 
           if( distance < shortestDist){
                shortestDist = distance;
                indexOfClosest = i;
            }
        };
        difference = someModels[indexOfClosest].radius-shortestDist;
        if(difference > 0 ){
            return difference;
        }
        else if(difference > -0.1){ //returns negative value for when camera is pretty close to object
            return -difference;
        }
        return 0; 
    }

    function getDistanceToModel(pos){
        return Math.sqrt(pos.x*pos.x+pos.y*pos.y+pos.z*pos.z) //just between points
    }

    function getModelPosistion(posMatrix, camMatrix){
        var pos = mat4.create();
        mat4.multiply(pos, camMatrix, posMatrix);
        var posVec = {name:"posVec"};
        posVec.x = pos[12];
        posVec.y = pos[13];
        posVec.z = pos[14];
        return posVec;
    }

    keyboardControls.prototype.animate = function() {
        var timeNow = new Date().getTime();
        if (this.lastTime != 0) {
            this.elapsed = timeNow - this.lastTime;
            this.yaw += this.yawRate * this.elapsed;
            this.pitch += this.pitchRate * this.elapsed;

            if (this.pitch != 0){
            mat4.identity(this.camMove);
                mat4.rotate(this.camMove, this.camMove, degToRad(-this.pitch), [1, 0, 0]);
                mat4.multiply(this.camMatrix, this.camMove, this.camMatrix);
                this.pitch = 0;
            }

            if (this.yaw != 0) {
            mat4.identity(this.camMove);
                mat4.rotate(this.camMove, this.camMove, degToRad(-this.yaw), [0, 1, 0]);
                mat4.multiply(this.camMatrix, this.camMove, this.camMatrix);
                this.yaw = 0;
            }
            if (this.speedX != 0 || this.speedY != 0 || this.speedZ != 0) {
            mat4.identity(this.camMove);
                this.lastStepX = this.speedX * this.elapsed;
                this.lastStepY = this.speedY * this.elapsed;
                this.lastStepZ = this.speedZ * this.elapsed;
                mat4.translate(this.camMove, this.camMove, [this.lastStepX, this.lastStepY, this.lastStepZ]);
                mat4.multiply(this.camMatrix, this.camMove, this.camMatrix);

            //    joggingAngle += elapsed * 0.2; // 0.6 "fiddle factor" - makes it feel more realistic :-)
            //    yPos += Math.sin(degToRad(joggingAngle)) / 40 + 0.2
            }

            if (this.objMatX != 0 || this.objMatY != 0 || this.objMatZ != 0) {
                mat4.identity(this.camMove);
                mat4.translate(this.camMove, this.camMove, [this.objMatX, this.objMatY, this.objMatZ]);
                mat4.multiply(this.objPos, this.camMove, this.objPos);
            }
            
            if (this.objRotY != 0){
            mat4.identity(this.camMove);
                mat4.rotate(this.camMove, this.camMove, degToRad(-this.objRotY), [0, 1, 0]);
                mat4.multiply(this.objPos, this.objPos, this.camMove);
                this.objRotY = 0;
            }
        }
        this.lastTime = timeNow;
    }

    keyboardControls.prototype.getCamMatrix = function() {
        return this.camMatrix;
    };

    keyboardControls.prototype.getElapsedTime = function() {
        return this.elapsed;
    }

    keyboardControls.prototype.getObjPos = function() {
        return mat4.clone(this.objPos);
    }

    return keyboardControls;
})();