define("Prop", ['Point', 'GameObject'], function(Point, GameObject) {

    class Prop extends GameObject {

        constructor(location, size, passable, spriteData, propData) {

            var orientation = propData["orientation"] ? propData["orientation"] : "";
            if (orientation == "center") {
                spriteData["spritePosition"] = new Point(spriteData["spriteSize"].X / 2, spriteData["spriteSize"].Y / 2);
            }

            super(location, size, passable, spriteData, propData);
            
            this.type = propData["type"];
            this.sound = propData["sound"];
            this.fatalProp = propData["fatal"];
            this.visible = (propData["visible"] || propData["visible"] === false) ? propData["visible"] : true;
            
            this.particleEffects = [];
            this.dialogue = propData["dialogue"] ? propData["dialogue"] : null;

            this.zPos = parseInt(propData["zPos"]) ? parseInt(propData["zPos"]) : 0;
            this.layer = parseInt(propData["layer"]) ? parseInt(propData["layer"]) : 0;
            this.alpha = parseFloat(propData["alpha"]) ? parseFloat(propData["alpha"]) : 1;
            this.parallaxDistX = parseFloat(propData["parallaxDistX"]) ? parseFloat(propData["parallaxDistX"]) : 0;
            this.parallaxDistY = parseFloat(propData["parallaxDistY"]) ? parseFloat(propData["parallaxDistY"]) : 0;
            this.isParallax = (this.parallaxDistX !== 0 || this.parallaxDistY !== 0);
            
            this.isForeground = propData["foreground"] ? propData["foreground"] : false;
            this.isBackground = propData["background"] ? propData["background"] : false;
            this.npcWall = propData["npcWall"] ? propData["npcWall"] : false;
            
            this.initializeSprite();
            this.attachParticleEffects(propData);
        }
        initializeSprite() {
            this.spriteContainer.setBounds(this.spritePosition.X, this.spritePosition.Y, this.spriteSize.X, this.spriteSize.Y + this.zPos);
            if (!this.visible)
                this.spriteContainer.alpha = 0;
            else
                this.spriteContainer.alpha = this.alpha;
        }
        randomizeAnimationFrame() {
            
            var frameRange = this.spriteSheet.getNumFrames(this.sprite.currentAnimation);
            if (frameRange > 0) {
                this.randomStartCountdown = (Math.floor(Math.random() * (frameRange + 1)) + 1) * frameRange;
                this.sprite.stop();
            }
        }
        attachParticleEffects(propData) {
            if (propData["particleEffects"]) {
                var particleData = propData["particleEffects"];
                for (let i = 0; i < particleData.length; i++) {
                    this.addParticleEffect(particleData[i]);
                }
            }
        }

        addParticleEffect(newEffect) {
            this.spriteContainer.addChild(newEffect.systemContainer);
            this.particleEffects.push(newEffect);
        }
        removeParticleEffect(oldEffect, index) {
            this.spriteContainer.removeChild(oldEffect);
            this.particleEffects.splice(index, 1);
        }

        updateProp() {
            if (this.randomStartCountdown > 0) {
                this.randomStartCountdown -= 1;
                if (this.randomStartCountdown == 0)
                    this.sprite.play();
            }

            this.updateParticleEffects();

            if (this.isParallax)
                this.updateParallax();
            if (this.rapportMeter) {
                this.rapportMeter.updateAlpha();
                this.rapportMeter.updateRapportLevel();
            }
        }
        updateParticleEffects() {
            for (let i = this.particleEffects.length - 1; i >= 0; i--) {
                this.particleEffects[i].updateSystem();
                if (this.particleEffects[i].isFinished)
                    this.removeParticleEffect(this.particleEffects[i], i);
            }
        }
        updateParallax() {
            
            if (this.parallaxDistX !== 0) {
                this.spriteContainer.x = 
                    Math.round((this.location.X - this.spritePosition.X)
                    - (currentLevel.screenPosition.X * (1 - this.parallaxDistX)));
            }
            if (this.parallaxDistY !== 0) {
                this.spriteContainer.y = 
                    Math.round((this.location.Y - this.spritePosition.Y)
                    - (currentLevel.screenPosition.Y * (1 - this.parallaxDistY)));
            }            
        }

        objectAction() {
            if (this.dialogue === {} || this.dialogue === null)
                return;
            else
                currentDialogue = this.dialogue;
        }
        
        handleInteraction(player) {

        }
        
        checkCollision(otherObject, checkPassable) {

            if (otherObject === this)
                return false;

            return super.checkCollision(otherObject, checkPassable);
        }

    }

    return Prop;

});