define("Transition", ['GameObject'], function(GameObject) {

    class Transition extends GameObject {

        constructor(location, size, destinationMap, destinationLocation, spriteData) {
            super(location, size, true, spriteData);
            
            this.destinationMap = destinationMap;
            this.destinationLocation = destinationLocation;
        }

        handleInteraction(player) {
            transition = { map: this.destinationMap, location: gameWorld[this.destinationMap].levelSpawn.location };

            player.setActorDirection("left", false);
            player.setActorDirection("right", false);
        }

    }

    return Transition;

});