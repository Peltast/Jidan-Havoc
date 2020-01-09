define("StatsDisplay", ['Point'], function(Point) {

    class StatsDisplay {

        constructor() {

            this.origin = new Point(12, 12);
            this.yMargin = 6;
            this.xMargin = 10;

            this.statsContainer = new createjs.Container();
            
            this.initiateSoundUI();
        }

        initiateStatDisplay() {
            this.statsContainer.removeChild(
                this.scoreTxt, this.scoreValue,
                this.collectibleIcon, this.collectibleValue,
                this.enemyIcon, this.enemyValue
            );
            var currentYpos = 0;

            this.scoreTxt = new createjs.Text( "score: ", "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(this.origin.X, this.origin.Y, this.scoreTxt);
            
            this.scoreValue = new createjs.Text( gameScore, "32px Equipment", "#f5f4eb");
            this.setTextFieldPos(this.scoreTxt.getMeasuredWidth() + this.xMargin, this.origin.Y, this.scoreValue);

            currentYpos += Math.round(this.origin.Y + this.scoreTxt.getMeasuredHeight() + this.yMargin + 8);

            var collectibleImg = new createjs.SpriteSheet({
                "images": [gameAssets["CollectibleIcon"]], "frames": {"width": 34, "height": 34, "regX": 0, "regY": 0, "count": 1}, animations: { idle: 0 }
            });
            this.collectibleIcon = new createjs.Sprite(collectibleImg);
            this.collectibleValue = new createjs.Text( player.collectiblesGathered + "/" + currentLevel.numOfCollectibles, "32px Equipment", "#f5f4eb");

            this.collectibleIcon.x = Math.round(this.origin.X);
            this.collectibleIcon.y = currentYpos;
            this.setTextFieldPos(this.collectibleIcon.x + 34 + this.xMargin, currentYpos + 17, this.collectibleValue);
            this.collectibleValue.textBaseline = "middle";

            currentYpos += Math.round(28 + this.yMargin);
            
            var enemyImg = new createjs.SpriteSheet({
                "images": [gameAssets["SleepingEnemy"]], "frames": { "width": 44, "height": 36, "regX": 0, "regY": 0, "count": 1 }, animations: { idle: 0 }
            });
            this.enemyIcon = new createjs.Sprite(enemyImg);
            this.enemyValue = new createjs.Text( (currentLevel.numOfEnemies - currentLevel.enemiesRemaining) + "/" + currentLevel.numOfEnemies, "32px Equipment", "#f5f4eb");

            this.enemyIcon.x = Math.round(this.origin.X - 6);
            this.enemyIcon.y = currentYpos;
            this.setTextFieldPos(this.enemyIcon.x + 44 + this.xMargin, currentYpos + 18, this.enemyValue);
            this.enemyValue.textBaseline = "middle";

            this.statsContainer.addChild(
                this.scoreTxt, this.scoreValue,
                this.collectibleIcon, this.collectibleValue,
                this.enemyIcon, this.enemyValue
            );
        }

        initiateSoundUI() {
            var buttonSize = 32;

            var soundBtnImg = new createjs.SpriteSheet({
                "images": [gameAssets["SoundButton"]], "frames": {"width": buttonSize, "height": buttonSize, "regX": 0, "regY": 0, "count": 2}, animations: { on: 0, off: 1 }
            });
            this.soundButton = new createjs.Sprite(soundBtnImg);
            this.soundButton.x = stageWidth - buttonSize * 3.5;
            this.soundButton.y = buttonSize / 2;

            this.soundButton.gotoAndPlay( soundEffectsOn ? "on" : "off");
            this.soundButton.addEventListener("click", function(event) { 
                soundEffectsOn = !soundEffectsOn;
                event.target.gotoAndPlay( soundEffectsOn ? "on" : "off");
            });
            
            var musicBtnImg = new createjs.SpriteSheet({
                "images": [gameAssets["MusicButton"]], "frames": {"width": buttonSize, "height": buttonSize, "regX": 0, "regY": 0, "count": 2}, animations: { on: 0, off: 1 }
            });
            this.musicButton = new createjs.Sprite(musicBtnImg);
            this.musicButton.x = stageWidth - buttonSize * 2;
            this.musicButton.y = buttonSize / 2;

            this.musicButton.gotoAndPlay( musicOn ? "on" : "off");
            this.musicButton.addEventListener("click", function(event) { 
                musicOn = !musicOn; 
                event.target.gotoAndPlay( musicOn ? "on" : "off");

                if (!musicOn)
                    soundManager.pauseCurrentMusic();
                else
                    soundManager.playMusic(soundManager.currentSound);
            });

            this.statsContainer.addChild(this.soundButton, this.musicButton);
        }

        setTextFieldPos(x, y, txt) {
            txt.x = Math.round(x);
            txt.y = Math.round(y);
            txt.shadow = new createjs.Shadow("#453e78", 2, 2, 0);
        }

        updateStats() {
            this.scoreValue.text = gameScore;

            this.collectibleValue.text = player.collectiblesGathered + "/" + currentLevel.numOfCollectibles;

            this.enemyValue.text = (currentLevel.numOfEnemies - currentLevel.enemiesRemaining) + "/" + currentLevel.numOfEnemies;
        }

        
    }

    
    return StatsDisplay;

});