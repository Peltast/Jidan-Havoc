define("LevelSelectMenu", ['MenuItem', 'MenuGrid'], function (MenuItem, MenuGrid) {

    class LevelSelectMenu {

        constructor() {
            this.menuContainer = new createjs.Container();

            this.rowMax = 7;
            this.seriesRowIndices = [];
            this.seriesLocks = {
                "2": 3, "3": 10, "4": 30, "5": 45, "6": 87
            };

            this.initiateBackground();
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

        initiateBackground() {

            this.backgroundDim = new createjs.Shape();
            this.backgroundDim.graphics.beginFill("#191028").drawRect(0, 0, stageWidth * 2, stageHeight * 2);
            this.backgroundDim.alpha = 0.7;

            this.bgHeight = 1980;
            var bgTower = new createjs.SpriteSheet({
                "images": [gameAssets["MenuTower"]],
                "frames": {"width": 640, "height": this.bgHeight, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });

            this.towerA = new createjs.Sprite(bgTower);
            this.towerB = new createjs.Sprite(bgTower);
            this.towerB.y = this.bgHeight;

            this.menuContainer.addChild(this.towerA, this.towerB, this.backgroundDim);
        }

        update() {
            this.towerA.y -= 1;
            this.towerB.y -= 1;

            if (this.towerA.y <= -this.bgHeight)
                this.towerA.y = this.bgHeight;
            if (this.towerB.y <= -this.bgHeight)
                this.towerB.y = this.bgHeight;
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
            
            this.levelGrid = new MenuGrid(buttonGrid, true, 30, 50, 80, 60);
            this.levelGrid.setCursorAlignment("center");
            this.levelGrid.centerGridRows();
            this.levelGrid.centerGridVertically();

            for (let i = 0; i < levelSeriesMatrix.length; i++) {
                this.createLockImage(levelSeriesMatrix[i][0], this.seriesRowIndices[i]);
            }

            this.levelGrid.gridContainer.x = 64;
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
            else if (this.seriesLocks[seriesNumber]) {
                var ranksNeeded = this.seriesLocks[seriesNumber];
                return ranksAchieved >= ranksNeeded;
            }
            else
                return true;
        }

        createLockImage(seriesNumber, rowIndex) {
            if (this.isSeriesUnlocked(seriesNumber))
                return;
            
            if (this.seriesLocks[seriesNumber])
                this.drawLockImages(rowIndex, this.seriesLocks[seriesNumber], seriesNumber !== 2);
        }
        drawLockImages(rowIndex, lockNumber, isRankLock) {
        
            var rankReqText = new createjs.Text(lockNumber, "32px Equipment", "#dc534b");
            var rankReqImage;
            if (isRankLock) {
                rankReqImage = new createjs.Sprite(new createjs.SpriteSheet({
                    "images": [gameAssets["LevelSelectCollectible"]],
                    "frames": {"width": 28, "height": 38, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
                }));
            }
            else {
                rankReqImage = new createjs.Sprite(new createjs.SpriteSheet({
                    "images": [gameAssets["LevelSelectTileComplete"]],
                    "frames": {"width": 40, "height": 40, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
                }));
            }
            rankReqImage.x = -this.levelGrid.gridMatrix[rowIndex][0].itemContainer.x;
            rankReqText.x =  rankReqImage.x - 10 - rankReqText.getMeasuredWidth();
            
            this.levelGrid.gridMatrix[rowIndex][0].itemContainer.addChild(rankReqText, rankReqImage);
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
            var rankPoint = this.createRankImage(12, 30, level.collectibleRank > 0);
            button.itemContainer.addChild(rankPoint);
        }
        addDoubleRank(button, level) {
            var rankPointL = this.createRankImage(-6, 26, level.collectibleRank > 0);
            var rankPointR = this.createRankImage(30, 26, level.enemyRank > 0);

            button.itemContainer.addChild(rankPointL, rankPointR);
        }
        addFullRank(button, level) {
            var rankTopLeft = this.createRankImage(-10, 4, level.collectibleRank > 0);
            var rankTopRight = this.createRankImage(34, 4, level.enemyRank > 0);

            var rankBottomLeft = this.createRankImage(-6, 26, level.scoreRank > 0);
            var rankCenter = this.createRankImage(12, 30, level.scoreRank > 1);
            var rankBottomRight = this.createRankImage(30, 26, level.scoreRank > 2);

            button.itemContainer.addChild(rankTopLeft, rankBottomLeft, rankCenter, rankBottomRight, rankTopRight);
        }
        createRankImage(x, y, completed = false) {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["LevelRankIcon"]],
                "frames": {"width": 16, "height": 20, "regX": 0, "regY": 0, "count": 2}, animations: { unfilled: 0, filled: 1 }
            });
            var img = new createjs.Sprite(spriteSheet);
            img.x = x;
            img.y = y;
            img.gotoAndPlay(completed ? "filled" : "unfilled");

            return img;
        }

        getLevel(seriesNum, levelNum) {
            var levelName = "Stage_" + seriesNum + "_" + levelNum;
            return gameWorld[levelName];
        }

    }

    return LevelSelectMenu;
    
});