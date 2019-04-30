define("Tile", ['GameObject', 'Point'], function(GameObject, Point) {
    
    class Tile extends GameObject {

        constructor(location, tileSheet, tileID, tileData) {
            super(location, new Point(tileSize, tileSize), tileData["passable"], null, null);
            
            this.terrains = tileData["terrains"];
            this.fatalTile = tileData["fatal"];
            this.spriteAlpha = parseFloat(tileData["spriteAlpha"]);
            this.fakeAlpha = parseFloat(tileData["fakeAlpha"]);
            this.spriteAlpha = this.spriteAlpha ? this.spriteAlpha : 1;
            this.fakeAlpha = this.fakeAlpha ? this.fakeAlpha : 1;

            this.sprite = new createjs.Sprite(tileSheet, tileID);
            this.sprite.gotoAndStop(tileID);

            this.spriteContainer = new createjs.Container();
            this.spriteContainer.addChild(this.sprite);
            this.spriteContainer.x = location.X;
            this.spriteContainer.y = location.Y;
            this.sprite.alpha = this.spriteAlpha;

            this.hasPsychosisClear = false;

            if (tileData["spriteData"]) {
                this.spriteContainer.removeChild(this.sprite);
                this.loadSpriteData(tileData["spriteData"]);
                this.initiateSprite();
            }

            if (tileData["fakeTerrain"])
                this.initializeFakeTerrain(tileData["fakeTerrain"], tileSheet, tileData);
            else if (tileData["realTerrain"]) {
                this.initializeRealTerrain(tileData["realTerrain"], tileSheet, tileData);
                this.initializeFakeTerrain(tileID, tileSheet, tileData);
            }
            else if (tileData["fakeSpriteData"]) {
                this.fakeSpriteData = tileData["fakeSpriteData"];
                this.initiateFakeSprite();
            }
            
            if (tileData["animation"]) {
                this.sprite.gotoAndPlay(tileData["animation"]);
            }

        }
        initializeFakeTerrain(fakeTerrain, tileSheet, tileData) {
            
            var fakeTileID = parseInt(fakeTerrain);
            this.fakeSprite = new createjs.Sprite(tileSheet, fakeTileID);
            if (tileData["fakeAnimation"])
                this.fakeSprite.gotoAndPlay(tileData["fakeAnimation"]);
            else
                this.fakeSprite.gotoAndStop(fakeTileID);
            
            this.isFakeOn = true;
            this.fakeSprite.alpha = this.fakeAlpha;
            this.sprite.alpha = 0;
            this.spriteContainer.addChild(this.fakeSprite);
        }
        initializeRealTerrain(realTerrain, tileSheet, tileData) {
            var realTerrainID = parseInt(realTerrain);
            this.sprite = new createjs.Sprite(tileSheet, realTerrainID);
            if (tileData["animation"])
                this.sprite.gotoAndPlay(tileData["animation"]);
            else
                this.sprite.gotoAndStop(realTerrainID);

            this.spriteContainer.addChild(this.sprite);
        }

        isFakeState() {
            if (!this.fakeSprite)
                return false;
            else
                return this.isFakeOn;
        }
        swapFakeSprite() {
            if (!this.fakeSprite)
                return;

            if (!this.isFakeOn) {
                this.fakeSprite.alpha = this.fakeAlpha;
                this.sprite.alpha = 0;
            }
            else {
                this.fakeSprite.alpha = 0;
                this.sprite.alpha = this.spriteAlpha;
            }
            this.isFakeOn = !this.isFakeOn;
        }
        
        hasValidTerrain() {
            
            for (let t = 0; t < this.terrains.length; t++) {
                if (this.terrains[t] == null) 
                    continue;
                else
                    return true;
            }
            return false;
        }

        getTileClosestTerrain(object) {

            var distanceFromObject = this.getDistanceFromObject(object);

            var closestCorner = this.getCornerClosestToObject(distanceFromObject);
            var closestTerrain = closestCorner >= 0 ? this.terrains[closestCorner] : null;
            
            return closestTerrain;
        }
        getDistanceFromObject(object) {
            var tileCenter = new Point(this.location.X + tileSize / 2, this.location.Y + tileSize / 2);
            var objectCenter = new Point(object.location.X + object.size.X / 2, object.location.Y + object.size.Y / 2);
            
            return new Point(objectCenter.X - tileCenter.X, objectCenter.Y - tileCenter.Y);
        }
        getCornerClosestToObject(distanceFromObject) {

            var tileCornersFromCenter = [
                new Point(-tileSize / 2, -tileSize / 2), 
                new Point(tileSize / 2, -tileSize / 2), 
                new Point(-tileSize / 2, tileSize / 2), 
                new Point(tileSize / 2, tileSize / 2)
            ];
            var closestDistance = stageWidth + stageHeight;
            var closestCorner = -1;

            for (let t = 0; t < this.terrains.length; t++) {
                if (this.terrains[t] == null)
                    continue;
                
                var distanceFromCorner = Math.abs(distanceFromObject.X - tileCornersFromCenter[t].X) + Math.abs(distanceFromObject.Y - tileCornersFromCenter[t].Y);
                if (distanceFromCorner < closestDistance) {
                    closestDistance = distanceFromCorner;
                    closestCorner = t;
                }
            }

            return closestCorner;
        }

    }
    return Tile;

});