define("ParallaxProp", ['Prop'], function(Prop) {

    class ParallaxProp extends Prop {

        constructor(location, size, passable, spriteData, propData, mapDimensions) {

            super(location, size, passable, spriteData, propData);

            this.createParallaxSprites(mapDimensions);
        }

        createParallaxSprites(mapDimensions) {
            this.spriteContainer.removeAllChildren();

            var numOfSprites = Math.ceil(mapDimensions.X / this.size.X);
            
            for (let i = 0; i < numOfSprites; i ++) {
                var parallaxSprite = new createjs.Sprite(this.spriteSheet);
                parallaxSprite.gotoAndPlay(this.defaultAnimation);
                
                parallaxSprite.x = Math.round(-this.spritePosition.X);
                parallaxSprite.y = Math.round(-this.spritePosition.Y);
                parallaxSprite.x += Math.round(this.spriteSize.X * i);
                
                this.spriteContainer.addChild(parallaxSprite);
            }
            
            this.spriteContainer.setBounds
                (this.spritePosition.X, this.spritePosition.Y, this.spriteSize.X * numOfSprites, this.spriteSize.Y + this.zPos);

        }


    }

    return ParallaxProp;

});