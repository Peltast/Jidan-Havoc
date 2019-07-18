define("Collectible", ['Prop'], function(Prop) {

    class Collectible extends Prop {

        constructor(location, size, passable, spriteData, propData) {
            super(location, size, passable, spriteData, propData);
            
        }
        initializeSprite() {
            super.initializeSprite();

            this.location.X += 8;
            this.location.Y += 4;
        }
        handleInteraction(player) {

        }

    }

    return Collectible;

});