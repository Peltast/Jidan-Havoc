define("ReactiveProp", ['Point', 'Prop', 'ParticleSystem'], function(Point, Prop, ParticleSystem) {

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
                    
                    if (Math.abs(player.velocity.X) > 2) {
                        if (player.velocity.X > 0)
                            this.sprite.gotoAndPlay(this.rightAnimation);
                        else
                            this.sprite.gotoAndPlay(this.leftAnimation);
                    }
                }

                else if (player.hitBoxes.length > 0) {
                    var petals = new ParticleSystem("FlowerPetalEffect");
                    petals.effectAreaOrigin = new Point(this.location.X, this.location.Y);

                    currentLevel.addParticleEffect(petals);
                    currentLevel.removeProp(this);
                }
            }
        }
        
        handleInteraction(player) {
            this.collidingWplayer = true;
        }
        

    }

    return ReactiveProp;

});