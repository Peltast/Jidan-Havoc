define("LevelSelectMenu", ['MenuItem', 'MenuGrid'], function (MenuItem, MenuGrid) {

    class LevelSelectMenu {

        constructor() {
            this.menuContainer = new createjs.Container();

            this.rowMax = 7;
            this.seriesRowIndices = [];

            this.initiateStageButtons();
            this.addCollectibleStatus();
        }

        addCollectibleStatus() {
            
            var collectibleCountTxt = new createjs.Text(ranksAchieved, "32px Equipment", "#c296ff");
            var img = new createjs.SpriteSheet({
                "images": [gameAssets["LevelSelectCollectible"]],
                "frames": {"width": 28, "height": 38, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
            });
            var collectibleStatusImg = new createjs.Sprite(img);
            var collectibleStatusTxt = new createjs.Text("collected", "32px Equipment", "#c296ff");

            collectibleCountTxt.y = 32;
            collectibleStatusImg.y = 32;
            collectibleStatusTxt.y = 32;

            collectibleCountTxt.x = 32;
            collectibleStatusImg.x = 32 + collectibleCountTxt.getMeasuredWidth() + 10;
            collectibleStatusTxt.x = 32 + collectibleCountTxt.getMeasuredWidth() + 50;

            this.menuContainer.addChild(collectibleCountTxt, collectibleStatusImg, collectibleStatusTxt);
        }

        initiateStageButtons() {
            var buttonGrid = [];
            var levelNumber = 1;

            for (let s = 0; s < levelSeriesMatrix.length; s++) {
                var series = levelSeriesMatrix[s];
                levelNumber = 1;
                this.seriesRowIndices.push(buttonGrid.length);

                while (levelNumber <= series[1]) {
                    var rowLength = Math.min(series[1] - (levelNumber - 1), this.rowMax);

                    var buttonSeries = this.createLevelRow(series[0], levelNumber, rowLength);
                    buttonGrid.push(buttonSeries);

                    levelNumber += rowLength;
                }
            }
            
            this.levelGrid = new MenuGrid(buttonGrid, true, 30, 50, 80, 80);
            this.levelGrid.setCursorAlignment("center");
            this.levelGrid.centerGridRows();

            for (let i = 0; i < levelSeriesMatrix.length; i++) {
                this.createLockImage(levelSeriesMatrix[i][0], this.seriesRowIndices[i]);
            }

            this.levelGrid.gridContainer.x = 64;
            this.levelGrid.gridContainer.y = 32;
            this.menuContainer.addChild(this.levelGrid.gridContainer);
        }
        createLevelRow(seriesNumber, levelNumber, rowLength) {
            var buttonSeries = [];

            var unlocked = this.isSeriesUnlocked(seriesNumber);

            for (let l = 0; l < rowLength; l++) {
                var level = this.getLevel(seriesNumber, levelNumber);

                var buttonImageName = level.completed ? "LevelSelectTileComplete" : "LevelSelectTile";
                if (!unlocked)
                    buttonImageName = "LevelSelectTileLocked";
                var levelButton = new MenuItem(buttonImageName, 40, 40, ButtonTypes.LOADLEVEL, { "level": level.name, "locked": !unlocked });
                buttonSeries.push(levelButton);

                if (unlocked)
                    this.addLevelRank(levelButton, level);
                this.addLevelNumber(levelButton, seriesNumber, levelNumber);
                
                levelNumber += 1;
            }

            return buttonSeries;
        }

        isSeriesUnlocked(seriesNumber) {

            if (seriesNumber == 2)
                return levelsCompleted >= 3;
            else if (seriesNumber == 3)
                return ranksAchieved >= 10;
            else
                return true;
        }

        createLockImage(seriesNumber, rowIndex) {
            if (this.isSeriesUnlocked(seriesNumber))
                return;
            
            if (seriesNumber == 2) {
                var levelReqText = new createjs.Text("3", "32px Equipment", "#dc534b");
                var levelReqImage = new createjs.Sprite(new createjs.SpriteSheet({
                    "images": [gameAssets["LevelSelectTileComplete"]],
                    "frames": {"width": 40, "height": 40, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
                }));
                levelReqText.x = 32
                levelReqImage.x = 42 + levelReqText.getMeasuredWidth();

                var yPos = this.levelGrid.gridMatrix[rowIndex][0].itemContainer.y + 32;
                levelReqText.y = yPos;
                levelReqImage.y = yPos;
                
                this.menuContainer.addChild(levelReqText, levelReqImage);
            }
            else if (seriesNumber == 3) {

                var rankReqText = new createjs.Text("10", "32px Equipment", "#dc534b");
                var rankReqImage = new createjs.Sprite(new createjs.SpriteSheet({
                    "images": [gameAssets["LevelSelectCollectible"]],
                    "frames": {"width": 28, "height": 38, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
                }));
                rankReqText.x = 32;
                rankReqImage.x = 42 + rankReqText.getMeasuredWidth();
                
                var yPos = this.levelGrid.gridMatrix[rowIndex][0].itemContainer.y + 32;
                rankReqText.y = yPos;
                rankReqImage.y = yPos;

                this.menuContainer.addChild(rankReqText, rankReqImage);
            }

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
                this.addFullRank(button, level);
            }
            else if (level.numOfEnemies > 0) {
                this.addDoubleRank(button, level);
            }
            else {
                this.addSingleRank(button, level);
            }
        }

        addSingleRank(button, level) {
            var rankPoint = this.createRankImage(level.rank > 0);
            rankPoint.x = 12;
            rankPoint.y = 30;
            button.itemContainer.addChild(rankPoint);
        }
        addDoubleRank(button, level) {
            var rankPointL = this.createRankImage(level.rank > 0);
            rankPointL.x = -6;
            rankPointL.y = 26;
            var rankPointR = this.createRankImage(level.rank > 1);
            rankPointR.x = 30;
            rankPointR.y = 26;

            button.itemContainer.addChild(rankPointL, rankPointR);
        }
        addFullRank(button, level) {
            var rankTopLeft = this.createRankImage(level.rank > 1);
            rankTopLeft.x = -10;
            rankTopLeft.y = 4;
            var rankBottomLeft = this.createRankImage(level.rank > 3);
            rankBottomLeft.x = -6;
            rankBottomLeft.y = 26;

            var rankCenter = this.createRankImage(level.rank > 0);
            rankCenter.x = 12;
            rankCenter.y = 30;

            var rankBottomRight = this.createRankImage(level.rank > 4);
            rankBottomRight.x = 30;
            rankBottomRight.y = 26;
            var rankTopRight = this.createRankImage(level.rank > 2);
            rankTopRight.x = 34;
            rankTopRight.y = 4;

            button.itemContainer.addChild(rankTopLeft, rankBottomLeft, rankCenter, rankBottomRight, rankTopRight);
        }
        createRankImage(completed = false) {
            var imgName = completed ? "LevelRankFilled" : "LevelRankUnfilled";
            var itemImg = new createjs.SpriteSheet({
                "images": [gameAssets[imgName]],
                "frames": {"width": 16, "height": 20, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
            });
            return new createjs.Sprite(itemImg);
        }

        getLevel(seriesNum, levelNum) {
            var levelName = "Stage_" + seriesNum + "_" + levelNum;
            return gameWorld[levelName];
        }

    }

    return LevelSelectMenu;
    
});