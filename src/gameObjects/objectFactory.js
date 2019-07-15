define("ObjectFactory", [

        'Point', 'Tile', 'Prop', 'Enemy', 'Transition', 'ParticleSystem'
    ], 

    function(
        Point, Tile, Prop, Enemy, Transition, ParticleSystem
    ) {

    var npcList = {

        "wisp": {
            "sprite": "Wisp",
            "frames": {"width": 40, "height": 64, "regX": 0, "regY": 0, "count": 8},
            "animations": { idle: [0, 7, "idle", .16] }, "defaultAnimation": "idle", "randomStart": true,
            "spriteCollision": new Point(24, 24), "spriteSize": new Point(40, 64), "spritePos": new Point(8,40),
            "particleEffects": ["WispEffect"],
            "spiritLevel": 10
        },
        "checkpoint": {
            "spiritLevel": 20,
            "sprite": "CheckpointSpirit",
            "frames": {"width": 40, "height": 64, "regX": 0, "regY": 0, "count" : 53},
            "animations": {
                inactive: [0, 7, "inactive", .2],
                activeCenter: [8, 15, "activeCenter", .1],
                activeSlightLeft: [16, 23, "activeSlightLeft", .1],
                activeLeft: [24, 31, "activeLeft", .1],
                activeSlightRight: [32, 39, "activeSlightRight", .1],
                activeRight: [40, 47, "activeRight", .1],
                activate: [48, 52, "activeCenter", .4]
            },
            "defaultAnimation": "inactive", "active": false,
            "spriteCollision": new Point(24, 24), "spriteSize": new Point(40, 64), "spritePos": new Point(8, 40)
        },
        
        "sleepingEnemy": {
            "sprite": "SleepingEnemy", "damageOnTouch": true, "behavior": "Stationary", "controller": "default",
            "frames": { "width": 44, "height": 36, "regX": 0, "regY": 0, "count": 12 },
            "animations": {
                left: [0, 3, "leftIdle", .05], right: [4, 7, "rightIdle", .05],
                leftDeath: [8, 9, "leftDeath", .2], rightDeath: [10, 11, "rightDeath", .2]
            },
            "defaultAnimation": "leftIdle", "deathAnimation": "Death", "deathTimer": 30,
            "spriteCollision": new Point(26, 20), "spriteSize": new Point(44, 36), "spritePos": new Point(8, 12)
        },

        "dustBunny": {
            "sprite": "DustBunny", "damageOnTouch": true, "controller": "paceController", "behavior": "Pacing", "horizontal": true,
            "frames": { "width": 40, "height": 50, "regX": 0, "regY": 0, "count": 20 },
            "animations": {
                left: [0, 1, "leftIdle", .1], right: [5, 6, "rightIdle", .1],
                leftWalk: [0, 4, "leftWalk", .17], rightWalk: [5, 9, "rightWalk", .17],
                leftDeath: [10, 12, "leftDeath", .2], rightDeath: [15, 17, "rightDeath", .2]
            },
            "defaultAnimation": "leftIdle", "deathAnimation": "Death", "deathTimer": 30,
            "spriteCollision": new Point(22, 32), "spriteSize": new Point(40, 50), "spritePos": new Point(8, 14)
        },

        "chasingEnemy": {
            "sprite": "ChasingEnemy", "damageOnTouch": true, "behavior": "Chase", "controller": "chaseController",
            "frames": { "width": 40, "height": 46, "regX": 0, "regY": 0, "count": 12 },
            "animations": {
                left: [0, 1, "leftIdle", .13], right: [2, 3, "rightIdle", .13],
                leftWalk: [4, 5, "leftWalk", .17], rightWalk: [6, 7, "rightWalk", .17],
                leftDeath: [8, 9, "leftDeath", .2], rightDeath: [10, 11, "rightDeath", .2]
            },
            "defaultAnimation": "leftIdle", "deathAnimation": "Death", "deathTimer": 30,
            "spriteCollision": new Point(22, 32), "spriteSize": new Point(40, 46), "spritePos": new Point(8, 10)
        }


    }

    var objectList = 
    {   
        "Flower": {
            "type": "default", "passable": true,
            "sprite": "Flower", "animations": { "idle": 0 }, "defaultAnimation": "idle",
            "frames": {"width": 32, "height": 32, "regX": 0, "regY": 0}
        },
        "Wall": {
            "type": "default", "passable": false,
            "sprite": "Flower", "animations": { "idle": 0 }, "defaultAnimation": "idle",
            "frames": {"width": 32, "height": 32, "regX": 0, "regY": 0}
        },

        "Teeth": {
            "type": "default", "passable": false,
            "sprite": "ParasiteTeeth", "animations": { idle: [0, 6, "idle", .15] }, "defaultAnimation": "idle",
            "frames": {"width": 32, "height": 32, "regX": 0, "regY": 0, "count": 7}, "randomStart": "true",
            "fatal": true
        }
    }

    class ObjectFactory {

        constructor() {
            this.test = true;
        }

        createTile(location, tileSheet, tileID, terrains) {
            
            var tileData = {};
            tileData["terrains"] = terrains;

            for (let i = 0; i < terrains.length; i++) {
                var terrainData = terrains[i];
                if (!terrainData)
                    continue;

                if (!tileData["passable"])
                    tileData["passable"] = this.getMapProperty(terrainData.properties, "passable") == "true";
                if (!tileData["fatal"])
                    tileData["fatal"] = this.getMapProperty(terrainData.properties, "fatal") == "true";
                
                tileData = this.getTileProperties(tileData, terrainData, 
                    ["fakeTerrain", "realTerrain", "fakeSprite", "spriteData", "animation", "fakeAnimation", "spriteAlpha", "fakeAlpha"]);
            }

            if (tileData["spriteData"])
                tileData["spriteData"] = this.getSpriteDataFromString(tileData["spriteData"]);
            if (tileData["fakeSprite"])
                tileData["fakeSpriteData"] = this.getSpriteDataFromString(tileData["fakeSprite"]);

            var tile = new Tile(location, tileSheet, tileID, tileData);
            return tile;
        }
        getTileProperties(tileData, terrainData, propertyNames) {
            for (let i = 0; i < propertyNames.length; i++) {
                var property = propertyNames[i];
                if (!tileData[property])
                    tileData[property] = this.getMapProperty(terrainData.properties, property);
            }
            return tileData;
        }
        
        createObject(objectMapData) {
            var objectType = this.getObjectProperty(objectMapData, {}, "type", "string", objectMapData.type);
            
            if (objectList[objectType] != null)
                return this.createPropObject(objectMapData);

            else if (objectType === "Prop")
                return this.createPropObject(objectMapData);
            else if (objectType === "EnemySpawn")
                return this.createNewEnemy(objectMapData);
            else if (objectType === "Transition")
                return this.createNewTransition(objectMapData);
        }    

        createPropObject(objectMapData) {
            var location = this.getObjectLocation(objectMapData);
            var size = new Point(objectMapData.width, objectMapData.height);
            var propType = objectMapData.type;
            var propName = objectMapData.name;

            var prop = this.constructPropFromData(objectMapData, location, size, propType, propName);
            return prop;
        }
        constructPropFromData(objectMapData, location, size, propType, propName) {
            var newProp = null;
            var objectListData = objectList[propType];
            
            var spriteData = this.getSpriteData(objectMapData, objectListData);
            var dialogueName = this.getObjectProperty(objectMapData, objectListData, "dialogue", "string", "");
            var propData = this.getObjectData(objectMapData, objectListData, 
                ["type", "fakeType", "fakeAnimation", "passable", "sound", "fatal", "zPos", "parallaxDistX", "parallaxDistY", "foreground", "background", "particleEffects"]);
            propData["dialogue"] = dialogueName ? dialogueLibrary[dialogueName] : null;
            size = spriteData["spriteCollision"] ? spriteData["spriteCollision"] : size;
            propData = this.attachParticleEffects(propData);
            propData = this.attachFakeObjectData(propData);

            if (spriteData["spriteImage"] == null)
                console.log("ERROR: No image '" + spriteData["spriteSheetImg"] + "' found for prop '" + propType + "'");
            else {
                var propType = propData["type"];

                switch (propType) {
                    case "key":
                        newProp = new Key(location, size, spriteData, propData, propName);
                        break;
                    case "door":
                        newProp = new Door(location, size, spriteData, propData, propName);
                        break;
                    default:
                        newProp = new Prop(location, size, propData["passable"], spriteData, propData);
                        break;
                }
            }

            return newProp;
        }

        createNewEnemy(enemyMapData) {
            var enemyType = this.getMapProperty(enemyMapData.properties, "enemyType");
            if (!enemyType)
                return;
            var enemyListData = npcList[enemyType];

            var enemyData = this.getObjectData(enemyMapData, enemyListData, [ 
                "damageOnTouch", "behavior", "controller", "orientation", "defaultAnimation", "deathAnimation", "deathTimer",
                "horizontal", "startDirection"
                ]
            );
            var spriteData = this.getSpriteData(enemyMapData, enemyListData);

            var newEnemy = new Enemy(spriteData["spriteCollision"], spriteData, enemyData);
            newEnemy.location = this.getObjectLocation(enemyMapData);

            return newEnemy;
        }
        
        attachParticleEffects(objectData) {
            if (!objectData["particleEffects"])
                return objectData;

            var effectNames = objectData["particleEffects"];
            if (effectNames === "null") {
                objectData["particleEffects"] = [];
            }
            else {
                var effects = [];
                for (let i = 0; i < effectNames.length; i++) {
                    effects.push(new ParticleSystem(effectNames[i]));
                }
                objectData["particleEffects"] = effects;
            }

            return objectData;
        }
        attachFakeObjectData(objectData) {
            if (!objectData["fakeType"])
                return objectData;

            var fakeType = objectData["fakeType"];
            var fakeData = (fakeType in npcList) ? npcList[fakeType] : objectList[fakeType];
            if (!fakeData)
                return objectData;

            var fakeSpriteData = this.getSpriteData({}, fakeData, new Point(32,32));
            objectData["fakeSpriteData"] = fakeSpriteData;
            if (objectData["fakeAnimation"])
                fakeSpriteData["fakeAnimation"] = objectData["fakeAnimation"];
            
            return objectData;
        }
        
        createNewTransition(transitionMapData) {
            var destinationMap = this.getMapProperty(transitionMapData.properties, "destination");
            var destinationLocation = this.parsePointValue(this.getMapProperty(transitionMapData.properties, "destinationLocation", "0,0"));
            destinationLocation = new Point(destinationLocation.X * tileSize, destinationLocation.Y * tileSize);
            var newTransition = new Transition(this.getObjectLocation(transitionMapData), new Point(tileSize, tileSize), destinationMap, destinationLocation);

            return newTransition;
        }

        getSpriteData(mapData, listData, defaultSpriteSize = "") {
            var spriteData = {};

            spriteData["spriteSheetImg"] = this.getObjectProperty(mapData, listData, "sprite");
            spriteData["spriteSize"] = this.getObjectProperty(mapData, listData, "spriteSize", "point", defaultSpriteSize);
            spriteData["spriteCollision"] = this.getObjectProperty(mapData, listData, "spriteCollision", "point", defaultSpriteSize);
            spriteData["spritePosition"] = this.getObjectProperty(mapData, listData, "spritePos", "point");
            spriteData["animations"] = this.getObjectProperty(mapData, listData, "animations");
            spriteData["defaultAnimation"] = this.getObjectProperty(mapData, listData, "defaultAnimation");
            spriteData["fakeAnimation"] = this.getObjectProperty(mapData, listData, "fakeAnimation");
            spriteData["frames"] = this.getObjectProperty(mapData, listData, "frames");
            spriteData["randomStart"] = this.getObjectProperty(mapData, listData, "randomStart");
            spriteData["spriteImage"] = gameAssets[spriteData["spriteSheetImg"]];

            return spriteData;
        }
        getSpriteDataFromString(spriteName) {
            var spriteData = npcList[spriteName] ? npcList[spriteName] : objectList[spriteName];

            if (spriteData)
                return this.getSpriteData({}, spriteData);
            else   
                return {};
        }

        getObjectData(mapData, listData, propertyList) {
            var objectData = {};
            
            for (let i = 0; i < propertyList.length; i++) {
                var propertyName = propertyList[i];
                objectData[propertyName] = this.getObjectProperty(mapData, listData, propertyName);
            }

            return objectData;
        }
        getObjectProperty(mapData, listData, propertyName, propertyType = "", defaultValue = "") {
            var value = null;

            if (listData) {
                if (listData[propertyName]) {
                    value = listData[propertyName];
                }
            }

            var mapValue = this.getMapProperty(mapData.properties, propertyName, null);
            if (mapValue) {
                value = mapValue;

                if (propertyType === "point")
                    value = this.parsePointValue(mapValue ? mapValue : "0,0");
            }
            
            return value ? value : defaultValue;
        }

        getObjectLocation(objectData) {
            return new Point(objectData.x, objectData.y - tileSize);
        }
        getMapProperty(propertyData, propertyName, defaultVal) {
            if (!propertyData)
                return defaultVal;

            for (let i = 0; i < propertyData.length; i++) {
                if (propertyData[i].name === propertyName)
                    return propertyData[i].value;
            }
            return defaultVal;
        }
        parsePointValue(pointStr) {
            if (pointStr == null)
                return new Point(0, 0);
            if (pointStr.indexOf(',') < 0)
                return new Point(0, 0);

            var pointVals = pointStr.split(',');
            var pointX = parseInt(pointVals[0]);
            var pointY = parseInt(pointVals[1]);

            if (isNaN(pointX) || isNaN(pointY))
                return new Point(0, 0);
            else
                return new Point(pointX, pointY);
        }
    
    }


    return ObjectFactory;

});