define("ReactiveProp", ['Point', 'Prop'], function(Point, Prop) {

    class ReactiveProp extends Prop {

        constructor(location, size, passable, spriteData, propData) {

            super(location, size, passable, spriteData, propData);
            
            this.leftAnimation = "moveLeft";
            this.rightAnimation = "moveRight";

            this.collidingWplayer = false;
            this.playerPassedOver = false;
        }

        updateProp() {
            super.updateProp();

            if (this.collidingWplayer) {
                var collidingThisTick = super.checkCollision(player, false);
                if (!collidingThisTick) {
                    this.collidingWplayer = false;

                    if (player.orientation === "right")
                        this.sprite.gotoAndPlay(this.rightAnimation);
                    else if (player.orientation === "left")
                        this.sprite.gotoAndPlay(this.leftAnimation);
                }
            }
        }
        
        handleInteraction(player) {
            this.collidingWplayer = true;
        }
        

    }

    return ReactiveProp;

});