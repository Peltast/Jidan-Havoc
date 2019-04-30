define("Transition", ['GameObject'], function(GameObject) {

    class Transition extends GameObject {

        constructor(location, size, destinationMap, destinationLocation) {
            super(location, size, true, null);
            
            this.destinationMap = destinationMap;
            this.destinationLocation = destinationLocation;
        }

        handleInteraction(player) {
            transition = {map: this.destinationMap, location: this.destinationLocation};
        }

    }

    return Transition;

});