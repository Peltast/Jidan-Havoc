define("LevelEndMenu", ['Point', 'MenuItem', 'MenuGrid'], function(Point, MenuItem, MenuGrid) {

    const RankingStage = {"START" : 1, "COLLECTIBLE": 2, "ENEMY": 3, "SCORE": 10, "FINISHED": 4 };

    class LevelEndMenu {

        constructor(isFirstTimeCompletion) {
            this.isFirstTimeCompletion = isFirstTimeCompletion;

            this.drawScoreMenu();

            this.stageOrder = [RankingStage.START, RankingStage.COLLECTIBLE, RankingStage.ENEMY, RankingStage.SCORE];
            this.stageProgress = 0;
            this.rankingStageImages = [
                [],
                [this.collectibleIcon, this.collectibleValue, this.collectibleRankIcon],
                [this.enemyIcon, this.enemyValue, this.enemyRankIcon],
                [this.scoreTxt, this.scoreValue, this.scoreRankIcon1, this.scoreRankIcon2, this.scoreRankIcon3]
            ];
            this.numOfStages = 1 + (currentLevel.numOfEnemies > 0 ? 1 : 0) + (currentLevel.scoreThresholds ? 1 : 0);

            currentLevel.evaluatePlayerRanking();

            this.menuStage = RankingStage.START;
            this.timer = 0;

            this.collectibleStatCount = 0;
            this.enemyStatCount = currentLevel.numOfEnemies;
            this.scoreStatCount = 0;

            this.parentCollectibleRankIcon;
            this.parentEnemyRankIcon;
        }

        isFinished() {
            return this.menuStage === RankingStage.FINISHED;
        }

        skipScoring() {
            this.finishCollectibleRanking();
            this.addPhaseElements(1);

            if (this.numOfStages > 1) {
                this.finishEnemyRanking();
                this.addPhaseElements(2);
            }
            if (this.numOfStages > 2) {
                this.scoreValue.text = gameScore;
                this.updateScoreRankingDisplay();
                this.addPhaseElements(3);
            }
            
            this.finishMenu();
        }

        updateMenu() {
            this.timer += 1;
            
            if (this.menuStage === RankingStage.START) {
                this.progressMenuStage();
            }
            else if (this.menuStage === RankingStage.COLLECTIBLE) {
                if (this.collectibleStatCount !== player.collectiblesGathered)
                    this.updateCollectibleRanking();
                else 
                    this.progressMenuStage();
            }
            else if (this.menuStage === RankingStage.ENEMY) {
                if (this.enemyStatCount !== currentLevel.enemiesRemaining)
                    this.updateEnemyRanking();
                else
                    this.progressMenuStage();
            }
            else if (this.menuStage === RankingStage.SCORE) {
                if (this.scoreStatCount !== gameScore)
                    this.updateScoreRanking();
                else
                    this.progressMenuStage();
            }

        }
        progressMenuStage() {
            if (this.timer < 30)
                return;

            this.stageProgress += 1;

            if (this.stageProgress > this.numOfStages)
                this.finishMenu();
            else {
                this.timer = 0;
                this.menuStage = this.stageOrder[this.stageProgress];

                this.addPhaseElements(this.stageProgress);
            }
        }
        addPhaseElements(index) {
            var newImages = this.rankingStageImages[index];
            for (let i = 0; i < newImages.length; i++)
                this.menuContainer.addChild(newImages[i]);
        }
        finishMenu() {
            this.timer = 0;
            this.menuStage = RankingStage.FINISHED;

            var levelSelect = new MenuItem("MenuLevelSelect", 160, 50, ButtonTypes.LEVELSELECT);
            if (this.isNextLevelUnlocked())
                var nextLevel = new MenuItem("MenuNextLevel", 138, 40, ButtonTypes.NEXTLEVEL, { "level": transition.map });
            else
                var nextLevel = new MenuItem("MenuNextLevelLocked", 138, 40, ButtonTypes.NULL);
            var retryLevel = new MenuItem("MenuRetryLevel", 150, 40, ButtonTypes.RETRYLEVEL, { "level": currentLevel.name });

            this.levelEndMenu = new MenuGrid([ [levelSelect, nextLevel, retryLevel] ], true, 40, 20, stageWidth * 0.2, stageHeight * 0.88);
            this.levelEndMenu.setCursorAlignment("top");
            this.levelEndMenu.changeSelection(1, 0);

            this.menuContainer.addChild(this.levelEndMenu.gridContainer);
        }
        updateCollectibleRanking() {
            if (this.timer % 3 == 0) {
                this.collectibleStatCount += 1;
                this.collectibleValue.text = this.collectibleStatCount + " / " + currentLevel.numOfCollectibles;
                this.playSound("Collectible", 0.1);

                if (this.collectibleStatCount == player.collectiblesGathered)
                    this.finishCollectibleRanking();
            }
        }
        finishCollectibleRanking() {
            this.timer = 0;
            this.collectibleValue.text = player.collectiblesGathered + " / " + currentLevel.numOfCollectibles;

            if (currentLevel.isCollectibleRankAchieved())
                this.fillRankIcon(this.collectibleRankIcon, this.parentCollectibleRankIcon);
        }

        updateEnemyRanking() {
            if (this.timer % 6 == 0) {
                this.enemyStatCount -= 1;
                this.enemyValue.text = (currentLevel.numOfEnemies - this.enemyStatCount) + " / " + currentLevel.numOfEnemies;
                this.playSound("Hit", 0.1);

                if (this.enemyStatCount == currentLevel.enemiesRemaining)
                    this.finishEnemyRanking();
            }
        }
        finishEnemyRanking() {
            this.timer = 0;
            this.enemyValue.text = (currentLevel.numOfEnemies - currentLevel.enemiesRemaining) + " / " + currentLevel.numOfEnemies;

            if (currentLevel.isEnemyRankAchieved())
                this.fillRankIcon(this.enemyRankIcon, this.parentEnemyRankIcon);
        }

        updateScoreRanking() {
            this.timer = 0;

            var scoreIncrement = 10;
            if (gameScore >= 6000)
                scoreIncrement = 50;
            else if (gameScore >= 3000)
                scoreIncrement = 20;

            this.scoreStatCount += scoreIncrement;
            
            this.scoreValue.text = this.scoreStatCount;
            if (this.scoreStatCount % (scoreIncrement * 3) == 0)
                this.playSound("Combo1", 0.1);

            this.updateScoreRankingDisplay();
        }
        updateScoreRankingDisplay() {
            if (currentLevel.getScoreRank(this.scoreValue.text) >= 1 && this.scoreRankIcon1.currentAnimation == "unfilled")
                this.fillRankIcon(this.scoreRankIcon1, this.rankBottomLeft);
            if (currentLevel.getScoreRank(this.scoreValue.text) >= 2 && this.scoreRankIcon2.currentAnimation == "unfilled")
                this.fillRankIcon(this.scoreRankIcon2, this.rankCenter);
            if (currentLevel.getScoreRank(this.scoreValue.text) >= 3 && this.scoreRankIcon3.currentAnimation == "unfilled")
                this.fillRankIcon(this.scoreRankIcon3, this.rankBottomRight);
        }

        fillRankIcon(iconImg, parentIconImg) {
            iconImg.gotoAndPlay("filled");

            if (parentIconImg.currentAnimation == "unfilled") {
                parentIconImg.gotoAndPlay("filled");
                this.playSound("Combo4", 0.3);
            }
            else
                this.playSound("Combo3", 0.2);
        }
        
        drawScoreMenu() {
            this.menuContainer = new createjs.Container();

            this.background = new createjs.Shape();
            this.background.graphics.beginFill("#191028").drawRect(0, 0, stageWidth * 2, stageHeight * 2);
            this.background.alpha = 0.9;
            this.menuContainer.addChild(this.background);
            
            this.drawLevelCompletionIcon();

            this.createPlayerStatistics();

            var parsedMapName = currentLevel.name.split('_');
            parsedMapName = (parsedMapName.length >= 2) ? parsedMapName[1] + "-" + parsedMapName[2] : currentLevel.name;
            var levelText = new createjs.Text( "Level: " + parsedMapName + " completed!", "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(stageWidth / 2 - levelText.getMeasuredWidth() / 2, stageHeight * 0.1, levelText);

            this.menuContainer.addChild(levelText);
        }

        drawLevelCompletionIcon() {
            this.levelIconContainer = new createjs.Container();

            this.levelIcon = new createjs.Sprite(new createjs.SpriteSheet({
                "images": [gameAssets["LevelEndIcon"]],
                "frames": {"width": 78, "height": 78, "regX": 0, "regY": 0, "count": 8},
                animations: {
                    complete: [0, 7, "finished", 0.25], finished: 7
                }
            }));
            this.levelIcon.gotoAndPlay(this.isFirstTimeCompletion ? "complete" : "finished");
            this.levelIconContainer.addChild(this.levelIcon);
            if (!currentLevel.completed)
                this.playSound("Combo3", 0.2);

            if (currentLevel.scoreThresholds) {
                this.addFullRank(currentLevel);
            }
            else if (currentLevel.numOfEnemies > 0) {
                this.addDoubleRank(currentLevel);
            }
            else {
                this.addSingleRank(currentLevel);
            }

            this.levelIconContainer.x = stageWidth / 2 - 78 / 2;
            this.levelIconContainer.y = stageHeight * 0.22;
            this.menuContainer.addChild(this.levelIconContainer);
        }
        addSingleRank(level) {
            this.parentCollectibleRankIcon = this.createRankImage(32, 72, level.collectibleRank > 0);
            this.levelIconContainer.addChild(this.parentCollectibleRankIcon);
        }
        addDoubleRank(level) {
            this.parentCollectibleRankIcon = this.createRankImage(10, 62, level.collectibleRank > 0);
            this.parentEnemyRankIcon = this.createRankImage(54, 64, level.enemyRank > 0);

            this.levelIconContainer.addChild(this.parentCollectibleRankIcon, this.parentEnemyRankIcon);
        }
        addFullRank(level) {
            this.parentCollectibleRankIcon = this.createRankImage(-8, 36, level.collectibleRank > 0);
            this.parentEnemyRankIcon = this.createRankImage(70, 38, level.enemyRank > 0);

            this.rankBottomLeft = this.createRankImage(10, 62, level.scoreRank > 0);
            this.rankCenter = this.createRankImage(32, 72, level.scoreRank > 1);
            this.rankBottomRight = this.createRankImage(54, 64, level.scoreRank > 2);

            this.levelIconContainer.addChild(
                this.parentCollectibleRankIcon, this.rankBottomLeft, this.rankCenter, this.rankBottomRight, this.parentEnemyRankIcon
            );
        }
        createRankImage(x, y, completed = false) {
            var spritesheet = new createjs.SpriteSheet({
                "images": [gameAssets["LevelRankIcon"]],
                "frames": {"width": 16, "height": 20, "regX": 0, "regY": 0, "count": 2}, animations: { unfilled: 0, filled: 1 }
            });
            var img = new createjs.Sprite(spritesheet);
            img.x = x;
            img.y = y;
            img.gotoAndPlay(completed ? "filled" : "unfilled");

            return img;
        }

        createPlayerStatistics() {
            var statsXpos = stageWidth * 0.3;
            var statsYpos = stageHeight * 0.45;

            this.drawCollectibleStat(statsXpos, statsYpos);

            if (currentLevel.numOfEnemies > 0) {
                statsYpos += 50;
                this.drawEnemyStat(statsXpos, statsYpos);
            }

            if (currentLevel.scoreThresholds) {
                statsYpos += 50;
                this.drawScoreStat(statsXpos, statsYpos);
            }
        }
        drawCollectibleStat(statsXpos, statsYpos) {
            var collectibleImg = new createjs.SpriteSheet({
                "images": [gameAssets["CollectibleIcon"]], "frames": {"width": 34, "height": 34, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
            });
            this.collectibleIcon = new createjs.Sprite(collectibleImg);
            this.collectibleValue = new createjs.Text( "0 / " + currentLevel.numOfCollectibles, "32px Equipment", "#f5f4eb");
            this.collectibleValue.textBaseline = "middle";

            this.collectibleIcon.x = Math.round(statsXpos);
            this.collectibleIcon.y = Math.round(statsYpos);
            this.setTextFieldPos(statsXpos + 50, statsYpos + 17, this.collectibleValue);

            this.collectibleRankIcon = this.createRankImage(stageWidth * 0.6, statsYpos + 8);
        }
        drawEnemyStat(statsXpos, statsYpos) {
            var enemyImg = new createjs.SpriteSheet({
                "images": [gameAssets["SleepingEnemy"]], "frames": { "width": 44, "height": 36, "regX": 0, "regY": 0, "count": 1 }, animations: { idle: 0 }
            });
            this.enemyIcon = new createjs.Sprite(enemyImg);
            this.enemyValue = new createjs.Text( ("0 / " + currentLevel.numOfEnemies), "32px Equipment", "#f5f4eb");
            this.enemyValue.textBaseline = "middle";

            this.enemyIcon.x = statsXpos;
            this.enemyIcon.y = statsYpos;
            this.setTextFieldPos(statsXpos + 54, statsYpos + 18, this.enemyValue);

            this.enemyRankIcon = this.createRankImage(stageWidth * 0.6, statsYpos + 8);
        }
        drawScoreStat(statsXpos, statsYpos) {
            this.scoreTxt = new createjs.Text( "score: ", "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(statsXpos, statsYpos, this.scoreTxt);
            
            this.scoreValue = new createjs.Text( 0, "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(statsXpos + this.scoreTxt.getMeasuredWidth(), statsYpos, this.scoreValue);
            
            this.scoreRankIcon1 = this.createRankImage(stageWidth * 0.6, statsYpos + 8);
            this.scoreRankIcon2 = this.createRankImage(stageWidth * 0.6 + 26, statsYpos + 8);
            this.scoreRankIcon3 = this.createRankImage(stageWidth * 0.6 + 52, statsYpos + 8);
        }
        
        setTextFieldPos(x, y, txt) {
            txt.x = Math.round(x);
            txt.y = Math.round(y);
            txt.shadow = new createjs.Shadow("#453e78", 2, 2, 0);
        }
        
        playSound(soundName, vol) {
            if (!soundEffectsOn)
                return;

            var soundInstance = new Howl({
                src: [soundRoot + soundAssets[soundName]], loop: false, volume: vol
            });
            soundInstance.play();
        }

        isNextLevelUnlocked() {
            var parsedMapName = currentLevel.name.split('_');
            if (parsedMapName.length < 3)
                return true;
            
            var mapSeries = parseInt(parsedMapName[1]);
            var mapNum = parseInt(parsedMapName[2]);

            for (let i = 0; i < levelSeriesMatrix.length; i++) {
                if (mapSeries == levelSeriesMatrix[i][0]) {
                    var seriesLength = levelSeriesMatrix[i][1];
                    
                    if (mapNum < seriesLength)
                        return true;
                    else
                        return this.isSeriesUnlocked(mapSeries + 1);
                }
            }
            return true;
        }
        isSeriesUnlocked(seriesNumber) {
            
            if (seriesNumber == 2)
                return levelsCompleted >= 3;
            else if (seriesNumber == 3)
                return ranksAchieved >= 10;
            else
                return true;
        }

    }

    
    return LevelEndMenu;

});