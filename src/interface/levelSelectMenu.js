define("LevelSelectMenu", ['MenuItem', 'MenuGrid'], function (MenuItem, MenuGrid) {

    class LevelSelectMenu {

        constructor() {
            this.menuContainer = new createjs.Container();

            this.rowMax = 6;

            this.initiateStageButtons();
        }

        initiateStageButtons() {
            var buttonGrid = [];
            var levelNumber = 1;

            for (let s = 0; s < levelSeriesMatrix.length; s++) {
                var series = levelSeriesMatrix[s];
                levelNumber = 1;
                
                while (levelNumber <= series[1]) {
                    var rowLength = Math.min(series[1] - (levelNumber - 1), this.rowMax);

                    console.log("Series: " + series[0] + ", series length: " + series[1] + ", currentLevelNumber: " + levelNumber);

                    var buttonSeries = this.createLevelRow(series[0], levelNumber, rowLength);
                    buttonGrid.push(buttonSeries);

                    levelNumber += rowLength;
                }
            }
            
            this.levelGrid = new MenuGrid(buttonGrid, true, 30, 60, 80, 80);
            this.levelGrid.setCursorAlignment("center");
            this.levelGrid.centerGridRows();

            this.menuContainer.addChild(this.levelGrid.gridContainer);
        }
        createLevelRow(seriesNumber, levelNumber, rowLength) {
            var buttonSeries = [];

            for (let l = 0; l < rowLength; l++) {
                var levelButton = new MenuItem("LevelSelectTile", 40, 40, ButtonTypes.LOADLEVEL);
                buttonSeries.push(levelButton);

                var level = this.getLevel(seriesNumber, levelNumber);
                this.addLevelRank(levelButton, level);
                this.addLevelNumber(levelButton, seriesNumber, levelNumber);
                
                levelNumber += 1;
            }

            return buttonSeries;
        }

        addLevelNumber(button, seriesNum, levelNum) {
            
            var levelNumberText = new createjs.Text(seriesNum + "-" + levelNum, "18px Equipment", "#e9d8a1");
            levelNumberText.x = 6;
            levelNumberText.y = -20;

            button.itemContainer.addChild(levelNumberText);
        }
        addLevelRank(button, level) {
            if (!level)
                return;
            
            if (level.scoreThresholds) {
                console.log(level.scoreThresholds);
            }
        }

        getLevel(seriesNum, levelNum) {
            var levelName = "Stage_" + seriesNum + "_" + levelNum;
            console.log(levelName);
            return gameWorld[levelName];
        }

    }

    return LevelSelectMenu;
    
});