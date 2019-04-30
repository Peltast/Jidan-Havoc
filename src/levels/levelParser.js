define("LevelParser", ['Point'], function(Point) {

    class LevelParser {

        constructor(mapName, isLevel = true) {

            if (isLevel)
                this.parseData = mapData[mapName];
            else
                this.parseData = roomData[mapName];

            if (!this.parseData)
                console.log(mapName + " data could not be found.");
        }

        getLevelSize() {
            return new Point(this.parseData.width, this.parseData.height);
        }
        getCustomProperties() {
            var levelData = {};
            if (!this.parseData.properties)
                return levelData;
            
            for (let i = 0; i < this.parseData.properties.length; i++) {
                levelData[this.parseData.properties[i].name] = this.parseData.properties[i].value;
            }
            return levelData;
        }
        getLevelTileLayer() {
            for (let i = 0; i < this.parseData.layers.length; i++) {
                if (this.parseData.layers[i].type = "tilelayer")
                    return this.parseData.layers[i];
            }
            return this.parseData.layers[0];
        }
        getLevelObjectLayer() {
            for (let i = 0; i < this.parseData.layers.length; i++) {
                if (this.parseData.layers[i].type === "objectgroup")
                    return this.parseData.layers[i];
            }
            return null;
        }
        getLevelTileSets() {
            var mapTilesets = {};
            for (let i = 0; i < this.parseData.tilesets.length; i++) {
                var tileSet = this.parseData.tilesets[i];

                if (tileSet.source == null && tileSet.properties == null)
                    continue;
                else if (tileSet.source) {

                    var setName = tileSet.source.substring(tileSet.source.indexOf('tiles\/') + 6);
                    setName = setName.replace(".tsx", "");
                    if (tileData[setName] == null) {
                        console.log("Failed to find tileset from source " + tileSet.source + ", and of name " + setName);
                        continue;
                    }
                    
                    mapTilesets[tileSet.firstgid] = tileData[setName];
                }
                else if (this.getPropertyValue(tileSet.properties, "type") === "tileset") {
                    mapTilesets[tileSet.firstgid] = tileSet;
                }
            }

            return mapTilesets;
        }

        getLevelTerrains(mapTileSet) {
            var mapTerrains = [];
            for (let i = 0; i < mapTileSet.terrains.length; i++) {
                var terrain = mapTileSet.terrains[i];
                mapTerrains.push(terrain);
            }
            return mapTerrains;
        }

        
        getPropertyValue(propertyData, propertyName) {
            for (let i = 0; i < propertyData.length; i++) {
                if (propertyData[i].name === propertyName)
                    return propertyData[i].value;
            }
            return null;
        }
    
    }

    return LevelParser;

});