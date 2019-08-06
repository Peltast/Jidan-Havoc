define("Level", [

        'Point', 'Actor', 'Enemy', 'Prop', 'Collectible', 'Transition', 'ParticleSystem'], 
    function (
        Point, Actor, Enemy, Prop, Collectible, Transition, ParticleSystem
    ) {
    
    tileAnimations =  { };
    
    class Level {

        constructor(tileMap, objectList, mapSize, tileSets, mapName, levelData) {

            this.mapSize = mapSize;
            this.tileSets = tileSets;
            this.name = mapName;
            this.levelScreenWrap = false;

            this.totalMapSize = new Point(this.mapSize.X * tileSize * gameScale, this.mapSize.Y * tileSize * gameScale);
            this.tileDisplayRange = Math.ceil((stageWidth) / tileSize);
            this.tileDisplayAnchor = new Point(0, 0);
            this.initTilesets();
            
            this.levelSpawn;
            this.levelObj = { "tiles": tileMap, "objects": objectList, "data": levelData};
            this.createLevel();
        }
        initTilesets() {
            for (var firstGID in this.tileSets) {
                var parsedTileset = new TileSet(firstGID, this.tileSets[firstGID]);
                this.tileSets[firstGID] = parsedTileset;
            }
        }

        createLevel() {

            this.actors = [];
            this.props = [];
            this.particleEffects = [];
            this.tiles = [];
            this.mapTransitions = [];
            this.objects = [];

            this.numOfCollectibles = 0;
            this.numOfEnemies = 0;
            this.enemiesRemaining = 0;
            player.collectiblesGathered = 0;
            player.highestCombo = 0;
            gameScore = 0;
            
            this.screenPosition = new Point(0, 0);
            this.levelContainer = new createjs.Container();
            this.levelContainer.snapToPixel = true;
            
            this.foregroundLayer = new createjs.Container();
            this.spriteLayer = new createjs.Container();
            this.effectLayer = new createjs.Container();
            this.tileLayer = new createjs.Container();
            this.backgroundLayer = new createjs.Container();
            
            this.levelContainer.addChild(this.backgroundLayer);
            this.levelContainer.addChild(this.tileLayer);
            this.levelContainer.addChild(this.effectLayer);
            this.levelContainer.addChild(this.spriteLayer);
            this.levelContainer.addChild(this.foregroundLayer);
            
            this.initTileMap(this.levelObj["tiles"]);
            this.initMapObjects(this.levelObj["objects"]);
            this.initLevelData(this.levelObj["data"]);
        }
        resetLevel() {
            this.numOfCollectibles = 0;
            this.numOfEnemies = 0;
            this.enemiesRemaining = 0;
            player.collectiblesGathered = 0;
            player.highestCombo = 0;
            gameScore = 0;
            gameStatsDisplay.updateStats();
            
            for (let j = this.actors.length; j >= 0; j--) {
                if (this.actors[j] instanceof Enemy)
                    this.removeActor(this.actors[j]);
            }
            for (let k = this.props.length; k >= 0; k--) {
                if (this.props[k] instanceof Collectible)
                    this.removeProp(this.props[k]);
            }

            for (let i = 0; i < this.levelObj["objects"].length; i++) {
                var newObject = objectFactory.createObject(this.levelObj["objects"][i]);

                if (newObject instanceof Collectible) {
                    this.numOfCollectibles += 1;
                    this.addProp(newObject);
                }
                else if (newObject instanceof Enemy) {
                    this.numOfEnemies += 1;
                    this.addActor(newObject);
                }
            }

            this.enemiesRemaining = this.numOfEnemies;
        }

        initTileMap(tileMap) {
            for (let y = 0; y < this.mapSize.Y; y++) {
                var tileRow = [];
                for (let x = 0; x < this.mapSize.X; x++) {
                    var tileID = tileMap[x + (y * this.mapSize.X)];
                    var tileLocation = new Point(x * tileSize, y * tileSize);
                    var givenTileset = this.fetchTileset(tileID);

                    var terrainList = givenTileset.tileData.terrains;
                    var tileTerrainData = givenTileset.tileData.tiles[tileID - givenTileset.firstGID];
                    var tileTerrains = [];
                    if (tileTerrainData == null) {
                        console.log("Data for tile " + (tileID - givenTileset.firstGID) + " wasn't found in the map tileset.");
                    }
                    else {
                        for (let t = 0; t < tileTerrainData.terrain.length; t++) {
                            tileTerrains.push(terrainList[tileTerrainData.terrain[t]]);
                        }
                    }

                    var newTile = objectFactory.createTile(tileLocation, givenTileset.tileSheet, tileID - givenTileset.firstGID, tileTerrains);                    
                    tileRow.push(newTile);
                    this.tileLayer.addChild(newTile.spriteContainer);
                }

                this.tiles.push(tileRow);
            }
        }
        fetchTileset(tileID) {
            var defaultGID;
            for (var firstGID in this.tileSets) {
                if (!defaultGID)
                    defaultGID = firstGID;

                var tileset = this.tileSets[firstGID];
                if (tileID >= tileset.firstGID && tileID < tileset.lastGID)
                    return tileset;
            }
            console.log("Unable to find correct tileset for ID " + tileID);
            return this.tileSets[defaultGID];
        }

        initMapObjects(objectList) {
            if (objectList == null) return;
            
            for (let i = 0; i < objectList.length; i++) {
                var objectType = objectFactory.getObjectProperty(objectList[i], {}, "type", "string", objectList[i].type);
                
                if (objectType === "LevelSpawn") {
                    if (this.levelSpawn == null) {
                        this.levelSpawn = { map: this.name, location: this.getObjectLocation(objectList[i]) };
                    }
                }

                var newObject = objectFactory.createObject(objectList[i]);
                
                if (newObject instanceof Prop) {
                    if (newObject instanceof Collectible)
                        this.numOfCollectibles += 1;
                    this.addProp(newObject);
                }
                else if (newObject instanceof Actor) {
                    if (newObject instanceof Enemy)
                        this.numOfEnemies += 1;
                    this.addActor(newObject);
                }
                else if (newObject instanceof Transition) {
                    this.mapTransitions.push(newObject);
                    this.spriteLayer.addChild(newObject.spriteContainer);
                }

            }

            this.enemiesRemaining = this.numOfEnemies;
        }
        getObjectLocation(objectData) {
            return new Point(objectData.x, objectData.y - tileSize);
        }
        initLevelData(levelData) {

            if (levelData["particleEffects"]) {
                var levelEffects = levelData["particleEffects"].split(",");
                for (let i = 0; i < levelEffects.length; i++) {
                    this.createParticleSystemFromData(levelEffects[i]);
                }
            }
            if (levelData["background"]) {
                var levelBackground = backgroundLibrary[levelData["background"]];
                if (levelBackground)
                    this.createBackgroundFromData(levelBackground);
            }
            if (levelData["screenWrap"])
                this.levelScreenWrap = levelData["screenWrap"] === "true";

        }
        createParticleSystemFromData(effectName) {
            var effect = new ParticleSystem(effectName);
            if (effect.areaSpansMap) {
                var area = new Point(this.mapSize.X * tileSize, this.mapSize.Y * tileSize);
                if (effect.parallaxDistX)
                    area.X = effect.parallaxDistX > 1 ? area.X * effect.parallaxDistX : area.X / effect.parallaxDistX;
                if (effect.parallaxDistY)
                    area.Y = effect.parallaxDistY > 1 ? area.Y * effect.parallaxDistY : area.Y / effect.parallaxDistY;
                effect.effectArea = area;
            }
            this.addParticleEffect(effect);
        }
        createBackgroundFromData(bgData) {

            var centerXaxis = bgData["centerXaxis"];
            var centerYaxis = bgData["centerYaxis"];
            var bgProps = bgData["props"];
            var bgShapes = bgData["shapes"];

            if (bgProps) {
                for (let j = 0; j < bgProps.length; j++) {
                    var bgProp = this.createBackgroundProp(bgProps[j], centerXaxis, centerYaxis);
                    this.addProp(bgProp);
                }
            }
            if (bgShapes) {
                for (let k = 0; k < bgShapes.length; k++) {
                    var bgShape = this.createBackgroundShape(bgShapes[k]);
                    this.backgroundLayer.addChild(bgShape);
                }
            }
        }
        createBackgroundProp(propData, centerXaxis, centerYaxis) {
            var propSize = objectFactory.parsePointValue(propData["size"]);
            var propLocation = objectFactory.parsePointValue(propData["location"]);
            if (centerXaxis)
                propLocation.X = propLocation.X + ((this.mapSize.X * tileSize / 2) - (propSize.X / 2));
            if (centerYaxis)
                propLocation.Y = propLocation.Y + ((this.mapSize.Y * tileSize / 2) - (propSize.Y / 2));

            var bgSpriteData = {
                "spriteImage": gameAssets[propData["sprite"]]
            };
            var objData = {
                "background": "true",
                "parallaxDistX": propData["parallaxDistX"], "parallaxDistY": propData["parallaxDistY"], "zPos": propData["zPos"]
            };

            return new Prop(propLocation, propSize, true, bgSpriteData, objData);
        }
        createBackgroundShape(shapeData) {
            var bgShape =  new createjs.Shape();

            if (shapeData["size"] === "max")
                var shapeSize = new Point( Math.max(stageWidth + tileSize * 4, this.mapSize.X * tileSize), Math.max(stageHeight, this.mapSize.Y * tileSize) );
            else
                var shapeSize = objectFactory.parsePointValue(shapeData["size"]);
            
            if (shapeData["shape"] === "rectangle") {
                bgShape.graphics.beginFill(shapeData["color"]).drawRect(-tileSize * 4, 0, shapeSize.X, shapeSize.Y);
            }

            return bgShape;
        }

        addProp(newProp) {
            if (newProp != null) {
                this.props.push(newProp);
                
                if (newProp.isForeground === "true")
                    this.foregroundLayer.addChild(newProp.spriteContainer);
                else if (newProp.isBackground === "true")
                    this.backgroundLayer.addChild(newProp.spriteContainer);
                else
                    this.spriteLayer.addChild(newProp.spriteContainer);
            }
        }
        removeProp(oldProp) {
            if (oldProp != null) {
                this.props.splice(this.props.indexOf(oldProp), 1);
                
                if (oldProp.isForeground === "true")
                    this.foregroundLayer.removeChild(oldProp.spriteContainer);
                else if (oldProp.isBackground === "true")
                    this.backgroundLayer.removeChild(oldProp.spriteContainer);
                else
                    this.spriteLayer.removeChild(oldProp.spriteContainer);
            }
        }
        addActor(newActor) {
            if (this.actors.includes(newActor))
                return;

            this.actors.push(newActor);
            this.spriteLayer.addChild(newActor.spriteContainer);
        }
        removeActor(oldActor) {
            if (oldActor != null) {
                this.actors.splice(this.actors.indexOf(oldActor), 1);
                this.spriteLayer.removeChild(oldActor.spriteContainer);    
            }
        }
        addParticleEffect(newEffect) {

            if (newEffect.isForegroundEffect)
                this.foregroundLayer.addChild(newEffect.systemContainer);
            else
                this.effectLayer.addChild(newEffect.systemContainer);
            this.particleEffects.push(newEffect);
        }
        removeParticleEffect(oldEffect, index) {

            if (oldEffect.isForegroundEffect)
                this.foregroundLayer.removeChild(oldEffect.systemContainer);
            else
                this.effectLayer.removeChild(oldEffect.systemContainer);
            this.particleEffects.splice(index, 1);
        }
        removeParticleEffectsOfType(typeName, number) {
            var removeCount = 0;
            var index = 0;

            while (true) {
                if (removeCount >= number || index >= this.particleEffects.length - 1)
                    break;

                if (this.particleEffects[index].effectName === typeName) {
                    this.removeParticleEffect(this.particleEffects[index], index);
                    removeCount += 1;
                }

                index += 1;
            }
        }

        toggleHitboxDisplay() {
            this.actors.forEach((actor) => {
                actor.toggleHitboxDisplays();
            });
        }
        

        updateLevel() {
            this.updateTileDisplay();

            this.actors.forEach((actor) => {
                this.checkActorScreenBounds(actor);
                actor.updateActor();
            })
            this.props.forEach((prop) => {
                prop.updateProp();
            })
            for (let i = this.particleEffects.length - 1; i >= 0; i--) {
                this.particleEffects[i].updateSystem();
                if (this.particleEffects[i].isFinished)
                    this.removeParticleEffect(this.particleEffects[i], i);
            }

            this.backgroundLayer.sortChildren(this.ZsortFunction);
            this.spriteLayer.sortChildren(this.ZsortFunction);
        }
        checkActorScreenBounds(actor) {

            if (currentLevel.levelScreenWrap) {
                if (actor.location.X >= this.totalMapSize.X)
                    actor.location.X = actor.size.X;
                else if (actor.location.X + actor.size.X <= 0)
                    actor.location.X = this.totalMapSize.X - actor.size.X;

                if (actor.location.Y >= this.totalMapSize.Y)
                    actor.location.Y = actor.size.Y;
                else if (actor.location.Y + actor.size.Y <= 0)
                    actor.location.Y = this.totalMapSize.Y - actor.size.Y;
            }
            else {
                
                if (actor.location.X + actor.size.X >= this.totalMapSize.X)
                    actor.location.X = this.totalMapSize.X - actor.size.X;
                else if (actor.location.X <= 0)
                    actor.location.X = 0;

                if (actor.location.Y + actor.size.Y >= this.totalMapSize.Y) {
                    actor.location.Y = this.totalMapSize.Y - actor.size.Y;
                    actor.takeDamage([]);
                }
                else if (actor.location.Y <= 0)
                    actor.location.Y = 0;
            }
        }

        startUpLevel() {
            
        }
        cleanUpLevel() {

        }

        updateTileDisplay() {
            var playerCoord = new Point(Math.floor(player.location.X / tileSize), Math.floor(player.location.Y / tileSize));
            var delta = Math.abs(playerCoord.X - this.tileDisplayAnchor.X) + Math.abs(playerCoord.Y - this.tileDisplayAnchor.Y);

            if (delta * 2 >= this.tileDisplayRange) {
                this.replaceDisplayTiles(playerCoord);
                this.tileDisplayAnchor = playerCoord;
            }
        }
        replaceDisplayTiles(playerCoord) {
            this.tileLayer.removeAllChildren();

            for (let y = playerCoord.Y - this.tileDisplayRange; y < playerCoord.Y + this.tileDisplayRange + 1; y++) {
                if (y < 0 || y > this.tiles.length - 1)
                    continue;

                for (let x = playerCoord.X - this.tileDisplayRange; x < playerCoord.X + this.tileDisplayRange + 1; x++) {
                    if (x < 0 || x > this.tiles[y].length - 1)
                        continue;
                    
                    this.tileLayer.addChild(this.tiles[y][x].spriteContainer);
                }
            }
        }

        ZsortFunction(objectA, objectB) {
            if (objectA.getBounds() == null || objectB.getBounds() == null) 
                return 0;
            
            if (objectA.y + objectA.getBounds().height > objectB.y + objectB.getBounds().height) {
                return 1;
            }
            else { 
                return -1;
            }
        }

        spawnPlayer(player, location) {
            this.addActor(player);
            player.location = new Point(location.X, location.Y);
        }


        checkHitboxCollisions(hurtBox) {
            var collisions = [];
            
            this.actors.forEach((actor) => {
                actor.hitBoxes.forEach((hitBox) => {
                    if (hurtBox.parentObject !== actor && hurtBox.intersects(hitBox)) {
                        if (hitBox.parentObject)
                            hitBox.parentObject.giveDamage(hurtBox.parentObject);
                        collisions.push(hitBox);
                    }
                })
            });

            return collisions;
        }

        checkInteractionCollisions(x, y, width, height, checkPassable = true) {
            var collisions = [];
            for (let i = 0; i < this.actors.length; i++) {
                if (this.actors[i].checkCollisionWithRect(x, y, width, height, checkPassable))
                    collisions.push(this.actors[i]);
            }
            for (let j = 0; j < this.props.length; j++) {
                if (this.props[j].checkCollisionWithRect(x, y, width, height, checkPassable))
                    collisions.push(this.props[j]);
            }
            return collisions;
        }
        
        checkObjectCollisionsByRect(x, y, width, height, checkPassable = true) {
            var collisions = [];
            collisions = this.addCollisionsFromObjectTypeByRect(this.props, checkPassable, collisions, x, y, width, height);
            collisions = this.addCollisionsFromObjectTypeByRect(this.actors, checkPassable, collisions, x, y, width, height);
            collisions = this.addCollisionsFromObjectTypeByRect(this.mapTransitions, checkPassable, collisions, x, y, width, height);
            collisions = this.addCollisionsFromObjectTypeByRect(this.objects, checkPassable, collisions, x, y, width, height);

            return collisions;
        }
        checkTileCollisions(object, checkPassable = true) {
            var collisions = [];
            if (object.passable && checkPassable)
                return collisions;
            
            return this.addTileCollisions(object, checkPassable, collisions);
        }
        checkObjectCollisions(object, checkPassable = true) {
            var collisions = [];
            if (object.passable && checkPassable)
                return collisions;
            
            collisions = this.addTileCollisions(object, checkPassable, collisions);
            collisions = this.addCollisionsFromObjectType(this.props, object, checkPassable, collisions);
            collisions = this.addCollisionsFromObjectType(this.actors, object, checkPassable, collisions);
            collisions = this.addCollisionsFromObjectType(this.mapTransitions, object, checkPassable, collisions);
            collisions = this.addCollisionsFromObjectType(this.objects, object, checkPassable, collisions);

            return collisions;
        }
        addTileCollisions(object, checkPassable, collisions) {
            var objectMapCoordinates = new Point(Math.floor(object.location.X / tileSize), Math.floor(object.location.Y / tileSize));

            for (let y = objectMapCoordinates.Y - 2; y < objectMapCoordinates.Y + 2; y++) {
                if (y < 0 || y >= this.tiles.length) continue;
                for (let x = objectMapCoordinates.X - 2; x < objectMapCoordinates.X + 2; x++) {
                    if (x < 0 || x >= this.tiles[y].length) continue;
                    var tile = this.tiles[y][x];
                    
                    if (tile.checkCollision(object, checkPassable))
                        collisions.push(tile);
                }
            }
            return collisions;
        }

        addCollisionsFromObjectType(objectList, collider, checkPassable, collisions) {
            for (let i = 0; i < objectList.length; i++) {
                var tempObject = objectList[i];

                if (tempObject.checkCollision(collider, checkPassable)) {
                    collisions.push(tempObject);
                }
            }
            return collisions;
        }
        addCollisionsFromObjectTypeByRect(objectList, checkPassable, collisions, x, y, width, height) {
            for (let i = 0; i < objectList.length; i++) {
                var tempObject = objectList[i];

                if (tempObject.checkCollisionWithRect(x, y, width, height, checkPassable))
                    collisions.push(tempObject);
            }
            return collisions;
        }

        getTileAtPoint(location) {
            if (location.X < 0 || location.Y < 0)
                return null;
            else if (location.X > this.mapSize.X || location.Y >= this.mapSize.Y)
                return null;

            return this.tiles[location.Y][location.X];
        }

    }

    
    class TileSet {
        
        constructor(firstGID, tileData) {
            this.firstGID = firstGID;
            this.lastGID = parseInt(firstGID) + tileData.tiles.length;
            this.tileData = tileData;
            this.tileSetImage = gameAssets[tileData.name];

            var tileSheetAnimations = tileAnimations[tileData.name] ? tileAnimations[tileData.name] : {};
            this.tileSheet = new createjs.SpriteSheet({
                "images": [this.tileSetImage],
                "frames": {"width": tileSize, "height": tileSize, "regX": 0, "regY": 0},
                animations: tileSheetAnimations
            });

        }

    }
    
    
    return Level;
    
});