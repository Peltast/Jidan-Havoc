define("LevelEndMenu", ['Point'], function(Point) {

    class LevelEndMenu {

        constructor() {

            this.menuContainer = new createjs.Container();

            currentLevel.evaluatePlayerRanking();
            this.drawScoreMenu();


        }

        drawScoreMenu() {

            this.background = new createjs.Shape();
            this.background.graphics.beginFill("#191028").drawRect(0, 0, stageWidth * 2, stageHeight * 2);
            this.background.alpha = 0.9;
            this.menuContainer.addChild(this.background);
            
            this.drawLevelCompletionIcon();

            this.drawPlayerStatistics();

            var parsedMapName = currentLevel.name.split('_');
            parsedMapName = (parsedMapName.length >= 2) ? parsedMapName[1] + "-" + parsedMapName[2] : currentLevel.name;
            var levelText = new createjs.Text( "Level: " + parsedMapName + " completed!", "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(stageWidth / 2 - levelText.getMeasuredWidth() / 2, stageHeight * 0.1, levelText);

            var continueText = new createjs.Text( "press Space to continue", "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(stageWidth / 2 - continueText.getMeasuredWidth() / 2, stageHeight * 0.85, continueText);

            this.menuContainer.addChild(levelText, continueText);
        }

        drawLevelCompletionIcon() {
            this.levelIconContainer = new createjs.Container();

            this.levelIcon = new createjs.Sprite(new createjs.SpriteSheet({
                "images": [gameAssets["LevelEndIcon"]],
                "frames": {"width": 78, "height": 78, "regX": 0, "regY": 0, "count": 8},
                animations: {
                    complete: [0, 7, "finished", 0.2], finished: 7
                }
            }));
            this.levelIcon.gotoAndPlay("finished");
            this.levelIconContainer.addChild(this.levelIcon);

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
            this.levelIconContainer.y = stageHeight * 0.25;
            this.menuContainer.addChild(this.levelIconContainer);
        }
        addSingleRank(level) {
            var rankPoint = this.createRankImage(32, 72, level.collectibleRank > 0);
            this.levelIconContainer.addChild(rankPoint);
        }
        addDoubleRank(level) {
            var rankPointL = this.createRankImage(10, 62, level.collectibleRank > 0);
            var rankPointR = this.createRankImage(54, 64, level.enemyRank > 0);

            this.levelIconContainer.addChild(rankPointL, rankPointR);
        }
        addFullRank(level) {
            var rankTopLeft = this.createRankImage(-8, 36, level.collectibleRank > 0);
            var rankTopRight = this.createRankImage(70, 38, level.enemyRank > 0);

            var rankBottomLeft = this.createRankImage(10, 62, level.scoreRank > 0);
            var rankCenter = this.createRankImage(32, 72, level.scoreRank > 1);
            var rankBottomRight = this.createRankImage(54, 64, level.scoreRank > 2);

            this.levelIconContainer.addChild(rankTopLeft, rankBottomLeft, rankCenter, rankBottomRight, rankTopRight);
        }
        createRankImage(x, y, completed = false) {
            var imgName = completed ? "LevelRankFilled" : "LevelRankUnfilled";
            var spritesheet = new createjs.SpriteSheet({
                "images": [gameAssets[imgName]],
                "frames": {"width": 16, "height": 20, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
            });
            var img = new createjs.Sprite(spritesheet);
            img.x = x;
            img.y = y;

            return img;
        }

        drawPlayerStatistics() {
            var statsXpos = stageWidth * 0.3;
            var statsYpos = stageHeight * 0.5;

            this.drawCollectibleStat(statsXpos, statsYpos);

            if (currentLevel.numOfEnemies > 0) {
                statsYpos += 60;
                this.drawEnemyStat(statsXpos, statsYpos);
            }

            if (currentLevel.scoreThresholds) {
                statsYpos += 60;
                this.drawScoreStat(statsXpos, statsYpos);
            }
        }
        drawCollectibleStat(statsXpos, statsYpos) {
            var collectibleImg = new createjs.SpriteSheet({
                "images": [gameAssets["CollectibleIcon"]], "frames": {"width": 34, "height": 34, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
            });
            this.collectibleIcon = new createjs.Sprite(collectibleImg);
            this.collectibleValue = new createjs.Text( player.collectiblesGathered + " / " + currentLevel.numOfCollectibles, "32px Equipment", "#f5f4eb");
            this.collectibleValue.textBaseline = "middle";

            this.collectibleIcon.x = Math.round(statsXpos);
            this.collectibleIcon.y = Math.round(statsYpos);
            this.setTextFieldPos(statsXpos + 50, statsYpos + 17, this.collectibleValue);

            this.collectibleRankIcon = this.createRankImage(stageWidth * 0.6, statsYpos + 8, currentLevel.isCollectibleRankAchieved());

            this.menuContainer.addChild(this.collectibleIcon, this.collectibleValue, this.collectibleRankIcon);
        }
        drawEnemyStat(statsXpos, statsYpos) {
            var enemyImg = new createjs.SpriteSheet({
                "images": [gameAssets["SleepingEnemy"]], "frames": { "width": 44, "height": 36, "regX": 0, "regY": 0, "count": 1 }, animations: { idle: 0 }
            });
            this.enemyIcon = new createjs.Sprite(enemyImg);
            this.enemyValue = new createjs.Text( currentLevel.enemiesRemaining, "32px Equipment", "#f5f4eb");
            this.enemyValue.textBaseline = "middle";

            this.enemyIcon.x = statsXpos;
            this.enemyIcon.y = statsYpos;
            this.setTextFieldPos(statsXpos + 54, statsYpos + 18, this.enemyValue);

            this.enemyRankIcon = this.createRankImage(stageWidth * 0.6, statsYpos + 8, currentLevel.isEnemyRankAchieved());

            this.menuContainer.addChild(this.enemyIcon, this.enemyValue, this.enemyRankIcon);
        }
        drawScoreStat(statsXpos, statsYpos) {
            this.scoreTxt = new createjs.Text( "score: ", "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(statsXpos, statsYpos, this.scoreTxt);
            
            this.scoreValue = new createjs.Text( gameScore, "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(statsXpos + this.scoreTxt.getMeasuredWidth(), statsYpos, this.scoreValue);

            var scoreAchieved = currentLevel.getScoreRank();
            this.scoreRankIcon1 = this.createRankImage(stageWidth * 0.6, statsYpos + 8, scoreAchieved > 0);
            this.scoreRankIcon2 = this.createRankImage(stageWidth * 0.6 + 26, statsYpos + 8, scoreAchieved > 1);
            this.scoreRankIcon3 = this.createRankImage(stageWidth * 0.6 + 52, statsYpos + 8, scoreAchieved > 2);

            this.menuContainer.addChild(this.scoreTxt, this.scoreValue, this.scoreRankIcon1, this.scoreRankIcon2, this.scoreRankIcon3);
        }
        
        setTextFieldPos(x, y, txt) {
            txt.x = Math.round(x);
            txt.y = Math.round(y);
            txt.shadow = new createjs.Shadow("#453e78", 2, 2, 0);
        }

    }

    
    return LevelEndMenu;

});