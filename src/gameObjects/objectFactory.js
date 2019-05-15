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
            var enemyListData = npcList["Parasite"];

            var enemySpeed = this.getObjectProperty(enemyMapData, enemyListData, "speed", "int", 2);
            var enemyAcc = this.getObjectProperty(enemyMapData, enemyListData, "acceleration", "float", 1);
            var enemyDec = this.getObjectProperty(enemyMapData, enemyListData, "deceleration", "float", 1);
            var enemySize = new Point(tileSize * .8, tileSize * .8);
            var enemyData = {
                "startX" : enemyMapData.x,
                "startY" : enemyMapData.y - tileSize,
                "xAxis" : this.getMapProperty(enemyMapData.properties, "xAxis"),
                "startDirection" : this.getMapProperty(enemyMapData.properties, "startDirection"),
                "length" : this.getMapProperty(enemyMapData.properties, "pathLength") * tileSize,
                "spriteData": this.getMapProperty(enemyMapData.properties, "spriteData")
            }
            var spriteData;
            if (enemyData["spriteData"])
                spriteData = this.getSpriteDataFromString(enemyData["spriteData"]);
            if (!spriteData)
                spriteData = this.getSpriteData(enemyMapData, enemyListData);
            spriteData["defaultAnimation"] = enemyData["startDirection"];

            var newEnemy = new Enemy(enemySize, spriteData, enemyData);
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