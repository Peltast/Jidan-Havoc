define("ParallaxProp", ['Point', 'GameObject'], function(Point, GameObject) {

    class ParallaxProp extends GameObject {

        constructor(location, size, passable, spriteData, propData) {

            super(location, size, passable, spriteData, propData);

            
        }


    }

    return ParallaxProp;

});