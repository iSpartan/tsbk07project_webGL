var keyboardControls = (function () {

    function keyboardControls() {
    this.pitch = 0;
    this.pitchRate = 0;

    this.yaw = 0;
    this.yawRate = 0;

    this.xPos = 0;
    this.yPos = 0.4;
    this.zPos = 0;

    this.lastTime = 0;
    this.camMove = mat4.create();
    this.camMatrix = mat4.create();
    mat4.identity(this.camMatrix);
    this.lastStepX = 0, this.lastStepY = 0, this.lastStepZ = 0;
    this.elapsed;
    this.MAX_DISTANCE = 10000;
    this.moveSpeed = 0.03;

    this.currentlyPressedKeys = {};

    };

    keyboardControls.prototype.handleKeyDown = function(event) {
        this.currentlyPressedKeys[event.keyCode] = true;
    };

    keyboardControls.prototype.handleKeyUp = function(event) {
        this.currentlyPressedKeys[event.keyCode] = false;
    };

    keyboardControls.prototype.handleKeys = function(ourObjects) {
        // Increase or decrease moveSpeed
        if (this.currentlyPressedKeys[90] && this.moveSpeed < 0.04 ) {
            //  Z
            this.moveSpeed += 0.001;
            
        } else if (this.currentlyPressedKeys[88] && this.moveSpeed > 0.002) {
            // X
            this.moveSpeed -= 0.001;
        }
        // Look up or down
        if (this.currentlyPressedKeys[104]) {
            // Numpad 8
            this.pitchRate = 0.1;
        } else if (this.currentlyPressedKeys[101]) {
            // Numpad 5
            this.pitchRate = -0.1;
        } else {
            this.pitchRate = 0;
        }

        // look righ or left
        if (this.currentlyPressedKeys[100]) {
            // Numpad 4
            this.yawRate = 0.1;
        } else if (this.currentlyPressedKeys[102]) {
            // Numpad 6
            this.yawRate = -0.1;
        } else {
            this.yawRate = 0;
        }

        var changeX = false, changeY = false, changeZ = false, hasCollided = false;
        
        if(this.currentlyPressedKeys[87] || this.currentlyPressedKeys[83] ||
           this.currentlyPressedKeys[68] || this.currentlyPressedKeys[65] ||
           this.currentlyPressedKeys[81] || this.currentlyPressedKeys[69] ){
        
       // Go forward or backward
        if (this.currentlyPressedKeys[87] ) {
            //  W
            this.speedZ = this.moveSpeed;
            changeZ = true;
            
        } else if (this.currentlyPressedKeys[83]) {
            // S
            this.speedZ = -this.moveSpeed;
            changeZ = true;
        } else {
            this.speedZ = 0;
            changeZ= false;
        }

        // Go righ or left
        if (this.currentlyPressedKeys[68]) {
            //  D
            this.speedX = -this.moveSpeed;
            changeX = true;
        } else if (this.currentlyPressedKeys[65]) {
            //  A
            this.speedX = this.moveSpeed;
            changeX = true;
        } else {
            this.speedX = 0;
            changeX = false;
        }

        // Go up or down
        if (this.currentlyPressedKeys[69]) {
            //  E
            this.speedY = this.moveSpeed;
            changeY = true;
        } else if (this.currentlyPressedKeys[81]) {
            //  Q
            this.speedY = -this.moveSpeed;
            changeY = true;
        } else {
            this.speedY = 0;
            changeY = false;
        }

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

            mat4.identity(this.camMove);

            if (this.pitch != 0){
                mat4.rotate(this.camMove, this.camMove, degToRad(-this.pitch), [1, 0, 0]);
                mat4.multiply(this.camMatrix, this.camMove, this.camMatrix);
                this.pitch = 0;
            }
            mat4.identity(this.camMove);

            if (this.yaw != 0) {
                mat4.rotate(this.camMove, this.camMove, degToRad(-this.yaw), [0, 1, 0]);
                mat4.multiply(this.camMatrix, this.camMove, this.camMatrix);
                this.yaw = 0;
            }
            if (this.speedX != 0 || this.speedY != 0 || this.speedZ != 0) {
                this.lastStepX = this.speedX * this.elapsed;
                this.lastStepY = this.speedY * this.elapsed;
                this.lastStepZ = this.speedZ * this.elapsed;
                mat4.translate(this.camMove, this.camMove, [this.lastStepX, this.lastStepY, this.lastStepZ]);
                mat4.multiply(this.camMatrix, this.camMove, this.camMatrix);

            //    joggingAngle += elapsed * 0.2; // 0.6 "fiddle factor" - makes it feel more realistic :-)
            //    yPos += Math.sin(degToRad(joggingAngle)) / 40 + 0.2
            }
        }
        this.lastTime = timeNow;
    }

    keyboardControls.prototype.getCamMatrix = function() {
        return this.camMatrix;
    };

    return keyboardControls;
})();