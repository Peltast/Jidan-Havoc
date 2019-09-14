define("GameObject", ['Point'], function(Point) {

    class GameObject {
        
        constructor (location, size, passable, spriteData) {
            this.location = location;
            this.size = size;
            this.passable = passable;

            this.spriteSize = this.size;
            this.spritePosition = new Point(0,0);
            this.zPos = 0;
            this.mass = 1;
            this.spriteRandomFrameStart = false;
            this.randomStartCountdown = 0;

            this.isNPC = false;
            this.npcWall = false;
        
            this.spriteContainer = new createjs.Container();
            if (spriteData) {
                this.loadSpriteData(spriteData);
                this.initiateSprite();
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
            this.sprite.x = Math.round(-this.spritePosition.X);
            this.sprite.y = Math.round(-this.spritePosition.Y);
            this.spriteContainer.x = Math.round(this.location.X);
            this.spriteContainer.y = Math.round(this.location.Y);
            this.spriteContainer.setBounds(this.spritePosition.X, this.spritePosition.Y, this.spriteSize.X, this.spriteSize.Y + this.zPos);

            if (this.spriteRandomFrameStart)
                this.randomizeAnimationFrame();
        }
        randomizeAnimationFrame() {
            
            var frameRange = this.spriteSheet.getNumFrames(this.sprite.currentAnimation);
            if (frameRange > 0) {
                this.randomStartCountdown = (Math.floor(Math.random() * (frameRange + 1)) + 1) * frameRange;
                this.sprite.stop();
            }
        }
        
        getObjectDisplaySize() {
            return this.spriteSize.get();
        }
        getObjectDisplayPos() {
            return this.spritePosition.get();
        }
    
        checkCollision(otherObject, checkPassable) {
            if (otherObject === this)
                return false;
            
            if ((this.isNPC && otherObject.npcWall) || (otherObject.isNPC && this.npcWall)) 
                var t = "";
            else if (this.passable && checkPassable)
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