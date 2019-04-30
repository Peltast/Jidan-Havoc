define("GameObject", ['Point'], function(Point) {
    
    class GameObject {
        
        constructor (location, size, passable, spriteData, objData) {
            this.location = location;
            this.size = size;
            this.passable = passable;

            this.spriteSize = this.size;
            this.spritePosition = new Point(0,0);
            this.zPos = 0;
            this.mass = 1;
            this.spriteRandomFrameStart = false;
            this.randomStartCountdown = 0;
        
            this.spriteContainer = new createjs.Container();
            if (spriteData) {
                this.loadSpriteData(spriteData);
                this.initiateSprite();
            }
            if (objData) {
                this.fakeSpriteData = objData["fakeSpriteData"];
                if (this.fakeSpriteData)
                    this.initiateFakeSprite();
            }
        }
        loadSpriteData(spriteData) {
            this.spriteName = spriteData["spriteSheetImg"];
            this.spriteSheetImg = spriteData["spriteImage"];
            this.spriteSize = spriteData["spriteSize"] ? spriteData["spriteSize"] : this.spriteSize;
            this.spritePosition = spriteData["spritePosition"] ? spriteData["spritePosition"] : new Point(0,0);
            this.spriteAnimations = spriteData["animations"];
            this.defaultAnimation = spriteData["defaultAnimation"];
            this.spriteFrames = spriteData["frames"];
            this.spriteRandomFrameStart = spriteData["randomStart"] ? spriteData["randomStart"] : false;
        }
        initiateSprite() {
            if (!this.spriteSheetImg) {
                console.log("GameObject tried to create sprite " + this.spriteName + ", but could not find the asset.");
                console.log(this.location);
                return;
            }

            if (!this.spriteFrames)
                this.spriteFrames = {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0};
            if (!this.spriteAnimations)
                this.spriteAnimations = { idle: 0 };
                
            this.spriteSheet = new createjs.SpriteSheet({
                "images": [this.spriteSheetImg],
                "frames": this.spriteFrames,
                animations: this.spriteAnimations
            });
            this.sprite = new createjs.Sprite(this.spriteSheet);
            
            if (this.defaultAnimation && this.spriteAnimations[this.defaultAnimation]) {
                var startAnimation = this.spriteAnimations[this.defaultAnimation];
                
                if (startAnimation.length > 0)
                    this.sprite.gotoAndPlay(this.defaultAnimation);
                else
                    this.sprite.gotoAndStop(this.defaultAnimation);
            }

            this.spriteContainer.addChild(this.sprite);
            this.sprite.x = -this.spritePosition.X;
            this.sprite.y = -this.spritePosition.Y;
            this.spriteContainer.x = this.location.X;
            this.spriteContainer.y = this.location.Y;
            this.spriteContainer.setBounds(this.spritePosition.X, this.spritePosition.Y, this.spriteSize.X, this.spriteSize.Y + this.zPos);

            if (this.spriteRandomFrameStart)
                this.randomizeAnimationFrame();
        }
        initiateFakeSprite() {
            if (this.spriteContainer.contains(this.fakeSprite))
                this.spriteContainer.removeChild(this.fakeSprite);
            
            var fakeFrames = this.fakeSpriteData["frames"] ? this.fakeSpriteData["frames"] : {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0};
            var fakeAnimations = this.fakeSpriteData["animations"] ? this.fakeSpriteData["animations"] : { idle: 0 };
            var fakeDefaultAnim = this.fakeSpriteData["fakeAnimation"] ? this.fakeSpriteData["fakeAnimation"] : this.fakeSpriteData["defaultAnimation"];
            this.fakePosition = this.fakeSpriteData["spritePosition"] ? this.fakeSpriteData["spritePosition"] : new Point(0,0);
            this.fakeSize = this.fakeSpriteData["spriteSize"] ? this.fakeSpriteData["spriteSize"] : this.spriteSize;

            var fakeSheet = new createjs.SpriteSheet({
                "images": [this.fakeSpriteData["spriteImage"]],
                "frames": fakeFrames,
                animations: fakeAnimations
            });
            this.fakeSprite = new createjs.Sprite(fakeSheet);
            this.sprite.alpha = 0;
            
            if (fakeDefaultAnim && fakeAnimations[fakeDefaultAnim]) {
                var startAnimation = fakeAnimations[fakeDefaultAnim];
                
                if (startAnimation.length > 0)
                    this.fakeSprite.gotoAndPlay(fakeDefaultAnim);
                else
                    this.fakeSprite.gotoAndStop(fakeDefaultAnim);
            }
            this.isFakeOn = true;
            this.spriteContainer.addChild(this.fakeSprite);
            this.fakeSprite.x = -this.fakePosition.X;
            this.fakeSprite.y = -this.fakePosition.Y;
            this.spriteContainer.x = this.location.X;
            this.spriteContainer.y = this.location.Y;
            this.spriteContainer.setBounds(this.fakePosition.X, this.fakePosition.Y, this.fakeSize.X, this.fakeSize.Y + this.zPos);
        }
        randomizeAnimationFrame() {
            
            var frameRange = this.spriteSheet.getNumFrames(this.sprite.currentAnimation);
            if (frameRange > 0) {
                this.randomStartCountdown = (Math.floor(Math.random() * (frameRange + 1)) + 1) * frameRange;
                this.sprite.stop();
            }
        }
        
        isFakeState() {
            if (!this.fakeSprite)
                return false;
            else
                return this.isFakeOn;
        }
        swapFakeSprite() {
            if (!this.fakeSprite)
                return;
                
            if (!this.isFakeOn) {
                this.fakeSprite.alpha = 1;
                this.sprite.alpha = 0;
            }
            else {
                this.fakeSprite.alpha = 0;
                this.sprite.alpha = 1;
            }
            this.isFakeOn = !this.isFakeOn;
        }
        getObjectDisplaySize() {
            if (!this.fakeSpriteData)
                return this.spriteSize.get();
            else if (this.fakeSprite.alpha == 1)
                return this.fakeSize.get();
            else
                return this.spriteSize.get();
        }
        getObjectDisplayPos() {
            if (!this.fakeSpriteData)
                return this.spritePosition.get();
            else if (this.fakeSprite.alpha == 1)
                return this.fakePosition.get();
            else
                return this.spritePosition.get();
        }
    
        checkCollision(otherObject, checkPassable) {
            if (otherObject === this)
                return false;
            if (this.passable && checkPassable)
                return false;

            if (otherObject.location.X < this.location.X + this.size.X && 
                otherObject.location.X + otherObject.size.X > this.location.X &&
                otherObject.location.Y < this.location.Y + this.size.Y && 
                otherObject.location.Y + otherObject.size.Y > this.location.Y) {

                return true;
            }
            return false;
        }

        checkCollisionWithRect(x, y, width, height, checkPassable) {
            if (this.passable && checkPassable)
                return false;

            if (x < this.location.X + this.size.X && 
                x + width > this.location.X &&
                y < this.location.Y + this.size.Y && 
                y + height > this.location.Y) {

                return true;
            }
            return false;
        }
        
        getCollisionDistance(otherObject, xAxis) {

            var objectCenter = new Point(this.location.X + this.size.X / 2, this.location.Y + this.size.Y / 2);
            var otherCenter = new Point(otherObject.location.X + otherObject.size.X / 2, otherObject.location.Y + otherObject.size.Y / 2);
            
            if (xAxis) {
                if (objectCenter.X - otherCenter.X >= 0)		// distance from left edge
                    return this.location.X - (otherObject.location.X + otherObject.size.X); 
                else if (objectCenter.X - otherCenter.X < 0)	// distance from right edge
                    return (this.location.X + this.size.X) - otherObject.location.X;
            }
            else {
                if (objectCenter.Y - otherCenter.Y >= 0)		// distance from top edge
                    return this.location.Y - (otherObject.location.Y + otherObject.size.Y); 
                else if (objectCenter.Y - otherCenter.Y < 0)	// distance from bottom edge
                    return (this.location.Y + this.size.Y) - otherObject.location.Y;
            }
        }

        getCollisionVector(otherObject) {
            
            var objectCenter = new Point(this.location.X + this.size.X / 2, this.location.Y + this.size.Y / 2);
            var otherCenter = new Point(otherObject.location.X + otherObject.size.X / 2, otherObject.location.Y + otherObject.size.Y / 2);

            return new Point (objectCenter.X - otherCenter.X, objectCenter.Y - otherCenter.Y);
        }

        handleInteraction(player) {
            
        }
    }

    return GameObject;

});