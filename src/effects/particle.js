define("Particle", ['Point'], function(Point) {

    class Particle {

        constructor(particleData) {
            this.particleContainer = new createjs.Container();

            this.lifeSpan = this.parseRandomizableNumber(particleData["lifeSpan"]);
            this.tween = particleData["tween"];
            this.remainingLife = this.lifeSpan;
            
            this.location = new Point();

            this.shape = particleData["shape"];
            this.size = particleData["size"] ? this.parseVector(particleData["size"], new Point(1, 1)) : new Point(1, 1);
            this.fadeOut = particleData["fadeOut"];
            this.fadeOutTime = particleData["fadeOutTime"] ? particleData["fadeOutTime"] : -1;
            this.color = particleData["color"] ? particleData["color"] : "#ffffff";
            if (this.color === "random") {
                var randomColor = Math.floor(Math.random() * 6);
                this.color = ["#d9d15d", "#db6e3b", "#a82d2d", "#8ed959", "#2f63bd", "#d9be93"][randomColor];
            }

            this.spriteName = particleData["sprite"];
            this.spriteFrames = particleData["frames"];
            this.spriteAnimations = particleData["animations"];
            this.defaultAnimation = particleData["defaultAnimation"];
            this.randomStartFrame = particleData["randomStartFrame"];

            this.mass = particleData["mass"] ? this.parseRandomizableNumber(particleData["mass"]) : 1;
            this.maxSpeed = this.parseRandomizableNumber(particleData["maxSpeed"]);
            this.velocity = this.parseVelocityValue(particleData["startVelocity"]);
            this.targetVelocity = this.parseVelocityValue(particleData["targetVelocity"]);
            this.originalTargetVelocity = this.targetVelocity;
            this.acceleration = this.parseVector(particleData["acceleration"], new Point(1, 1));
            this.appliesPhysics = (particleData["appliesPhysics"] === true);

            if (particleData["altStartVelocity"])
                this.velocity = this.parseVelocityValue(particleData["altStartVelocity"]);

            this.createParticle();
        }

        parseVelocityValue(dataStr) {
            if (dataStr === "random") {
                var randomVel = new Point( this.getRandomSpeed(this.maxSpeed), this.getRandomSpeed(this.maxSpeed) );
                randomVel.setMagnitude(this.maxSpeed);
                return randomVel;
            }
            else
                return this.parseVector(dataStr, new Point(0, 0));
        }
        getRandomSpeed(range) {
            return Math.floor( (Math.random() * range * 20) - (range * 10) ) / 10;
        }
        parseVector(pointStr, defaultPoint) {
            if (pointStr == null)
                return defaultPoint;
            if (pointStr.indexOf(',') < 0)
                return defaultPoint;

            var pointVals = pointStr.split(',');
            var pointX = this.parseRandomizableNumber(pointVals[0]);
            var pointY = this.parseRandomizableNumber(pointVals[1]);

            if (isNaN(pointX) || isNaN(pointY))
                return defaultPoint;
            else
                return new Point(pointX, pointY);
        }
        parseRandomizableNumber(dataStr) {
            if (dataStr.indexOf("~") > 0) {

                var range = dataStr.split("~");
                var min = parseFloat(parseFloat(range[0]).toFixed(2));
                var max = parseFloat(parseFloat(range[1]).toFixed(2));
                
                if (min % 1 == 0 && max % 1 == 0)
                    return parseFloat((Math.floor( Math.random() * (max - min) ) + min).toFixed(2));
                else
                    return parseFloat( (( Math.random() * (max - min) ) + min).toFixed(2) );
            }
            else
                return parseFloat(parseFloat(dataStr).toFixed(2));
        }

        createParticle() {
            if (this.spriteName) {
                this.createParticleSprite();
            }
            else {
                this.createParticleShape();
            }

            if (this.tween === "expand")
                this.particleContainer.scale = .01;
        }
        createParticleSprite() {

            var parsedAnimations = JSON.parse(this.spriteAnimations);
            this.spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets[this.spriteName]],
                "frames": this.spriteFrames,
                animations: parsedAnimations
            });
            this.sprite = new createjs.Sprite(this.spriteSheet);

            var startAnimation = parsedAnimations[this.defaultAnimation];
            if (startAnimation.length > 0 || startAnimation.frames)
                this.sprite.gotoAndPlay(this.defaultAnimation);
            else
                this.sprite.gotoAndStop(this.defaultAnimation);
            this.sprite.alpha = 1;
            
            this.particleContainer.addChild(this.sprite);

            if (this.randomStartFrame)
                this.randomizeAnimationFrame();
        }
        createParticleShape() {
            var particleShape = new createjs.Shape();

            if (this.shape === "random") {
                var randomShape = Math.floor(Math.random() * 5);
                this.shape = ["circle", "rectangle", "diamond", "triangle", "triangle2"][randomShape];
            }

            if (this.shape === "circle")
                particleShape.graphics.beginFill(this.color).drawCircle(-this.size.X / 2, -this.size.X / 2, this.size.X / 2);
            else if (this.shape === "rectangle")
                particleShape.graphics.beginFill(this.color).drawRect(-this.size.X / 2, -this.size.Y / 2, this.size.X, this.size.Y);
            else if (this.shape === "diamond")
                particleShape.graphics.beginFill(this.color).drawPolygon(-this.size.X / 2, -this.size.Y / 2, [
                    [this.size.X / 2, 0], [this.size.X, this.size.Y / 2], [this.size.X / 2, this.size.Y], [0, this.size.Y / 2]
                ]);
            else if (this.shape === "triangle")
                particleShape.graphics.beginFill(this.color).drawPolygon(-this.size.X / 2, -this.size.Y / 2, [
                    [this.size.X / 2, 0], [this.size.X, this.size.Y], [0, this.size.Y]
                ]);
            else if (this.shape === "triangle2")
                particleShape.graphics.beginFill(this.color).drawPolygon(-this.size.X / 2, -this.size.Y / 2, [
                    [0, 0], [this.size.X, 0], [this.size.X / 2, this.size.Y]
                ]);
            else
                particleShape.graphics.beginFill(this.color).drawRect(-this.size.X / 2, -this.size.Y / 2, this.size.X, this.size.Y);

            particleShape.alpha = 1;
            this.particleContainer.addChild(particleShape);
        }
        randomizeAnimationFrame() {
            
            var frameRange = this.spriteSheet.getNumFrames(this.sprite.currentAnimation);
            if (frameRange > 0) {
                this.randomStartCountdown = (Math.floor(Math.random() * (frameRange + 1)) + 1) * frameRange;
                this.sprite.stop();
            }
        }

        isDead() {
            return (this.remainingLife <= 0 && this.lifeSpan > 0);
        }

        applyForce(force) {
            var adjustedForce = new Point(force.X, force.Y);
            adjustedForce.divide(new Point(this.mass, this.mass));
            this.targetVelocity.add(adjustedForce);
        }
        applySimpleForce(forceVelocity, active) {
            if (active) {
                this.originalTargetVelocity = new Point(this.targetVelocity.X, this.targetVelocity.Y);
                this.targetVelocity.add(forceVelocity);
            }
            else {
                this.targetVelocity = this.originalTargetVelocity;
            }
        }

        update() {
            this.updateRandomAnimationStart();
            this.updateLifeSpan();
            this.updateVelocity();
            this.updateLocation();

            if (this.appliesPhysics)
                this.targetVelocity.multiply(new Point(0, 0));

            if (this.tween === "expand") {
                var progress = this.easeInCubic(this.remainingLife / this.lifeSpan);
                this.particleContainer.scale = 1 - progress;
            }
            else if (this.tween === "shrink") {
                var progress = this.easeInCubic(this.remainingLife / this.lifeSpan);
                this.particleContainer.scale = progress;
            }
        }
        easeInCubic(t) {
            return t * t * t;
        }
        easeOutCubic(t) {
            return (--t) * t * t + 1;
        }
        updateRandomAnimationStart() {
            if (this.randomStartCountdown > 0 && this.spriteName) {
                this.randomStartCountdown -= 1;
                if (this.randomStartCountdown == 0)
                    this.sprite.play();
            }
        }
        updateLifeSpan() {
            if (this.lifeSpan > 0) {
                this.remainingLife -= 1;

                if (this.fadeOutTime && this.remainingLife < this.fadeOutTime)
                    this.particleContainer.getChildAt(0).alpha = this.remainingLife / this.fadeOutTime;
                else if (this.fadeOut && !(this.fadeOutTime))
                    this.particleContainer.getChildAt(0).alpha = this.remainingLife / this.lifeSpan;
            }
        }
        updateVelocity() {
            if (this.appliesPhysics) {
                this.velocity.add(this.targetVelocity);
                if (this.velocity.magnitude() > this.maxSpeed)
                    this.velocity.setMagnitude(this.maxSpeed);
            }
            else {
                this.velocity.X = this.targetVelocity.X * this.acceleration.X + (1 - this.acceleration.X) * this.velocity.X;
                if (this.velocity.X > this.maxSpeed)
                    this.velocity.X = this.maxSpeed;
                else if (this.velocity.X < -this.maxSpeed)
                    this.velocity.X = -this.maxSpeed;
                
                this.velocity.Y = this.targetVelocity.Y * this.acceleration.Y + (1 - this.acceleration.Y) * this.velocity.Y;
                if (this.velocity.Y > this.maxSpeed)
                    this.velocity.Y = this.maxSpeed;
                else if (this.velocity.Y < -this.maxSpeed)
                    this.velocity.Y = -this.maxSpeed;
            }
        }
        updateLocation() {
            this.location.add(this.velocity);
            this.location = new Point(Math.floor(this.location.X * 100) / 100, Math.floor(this.location.Y * 100) / 100);

            this.particleContainer.x = Math.round(this.location.X);
            this.particleContainer.y = Math.round(this.location.Y);
        }

    }
    
    return Particle;

});