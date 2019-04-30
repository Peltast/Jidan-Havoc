define("SwitchProp", ['Prop'], function(Prop) {

    class SwitchProp extends Prop {
        
        constructor(location, size, spriteSheetImg, data) {
            super(location, size, true, spriteSheetImg, data);

            this.collidingWithPlayer = true;
            this.collisionCount = 0;
            this.lastTickCount = 0;   
        }
        initializeSprite() {
            this.sprite.gotoAndStop("idle");
            this.sprite.x = this.location.X;
            this.sprite.y = this.location.Y;
        }
        
        updateProp() {
            
            if (this.collidingWithPlayer && this.collisionCount != this.lastTickCount) {
                this.lastTickCount = this.collisionCount;

                if (!this.animated) {
                    this.animated = true;
                    this.sprite.gotoAndStop("active");
                    
                    var sound = new Howl({
                        src: [soundRoot + this.sound],
                        volume: 1,
                    }).play();
                }
            }
            else if (this.animated) {
                this.collidingWithPlayer = false;
                this.collisionCount = 0;
                this.lastTickCount = 0;

                this.sprite.gotoAndStop("idle");
                this.animated = false;
            }
        }
        
        handleInteraction(player) {
            this.collidingWithPlayer = true;
            this.collisionCount += 1;
        }

    }

    return SwitchProp;

});