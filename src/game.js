require( 
    ['Point', 'Level', 'LevelParser', 'ObjectFactory', 'Player', 'DialogueBox', 'MainMenu', 'LevelSelectMenu', 'LevelEndMenu', 'StatsDisplay', 'SoundManager'], 
    function(Point, Level, LevelParser, ObjectFactory, Player, DialogueBox, MainMenu, LevelSelectMenu, LevelEndMenu, StatsDisplay, SoundManager) {

    $(function() {
        gameStatus = GameState.PRELOADING;
        initGame();
    });

    var preloader;
    var gameBG;
    var gameArea;
    var gameUI;
    var pauseScreen;

    function initGame() {
        createjs.Ticker.addEventListener("tick", updateGame);

        soundManager = new SoundManager();
        this.dialogueBox = new DialogueBox();
        loadGame();

        addPreloader(loadProgress, totalGameManifest);
    }

    function loadGame() {
        gameSaveState = localStorage.getItem("jidanSaveState");
        if (!gameSaveState)
            gameSaveState = {};
        else
            gameSaveState = JSON.parse(gameSaveState);
    }
    function saveGame() {
        var saveData = JSON.stringify(gameSaveState);
        localStorage.setItem("jidanSaveState", saveData);
    }

    function getProgressData() {
        var completionCount = 0;
        var rankCount = 0;
        for (var levelName in gameSaveState) {
            level = gameWorld[levelName];
            if (!level)
                continue;

            if (level.completed)
                completionCount += 1;
            if (level.collectibleRank > 0)
                rankCount += 1;
            if (level.enemyRank > 0)
                rankCount += 1;
            if (level.scoreRank > 0)
                rankCount += level.scoreRank;
        }
        
        levelsCompleted = completionCount;
        ranksAchieved = rankCount;
    }

    function addPreloader(progress, destination) {
        preloader = new LoadBar(progress, destination);
        stage.addChild(preloader.loadBarContainer);
    }
    function removePreloader(p) {
        if (stage.contains(p.loadBarContainer))
            stage.removeChild(p.loadBarContainer);
    }
    function updatePreloader(progress) {
        preloader.updateBarProgress(progress);
        stage.update();
    }
    function addMainMenu() {
        removePreloader(preloader);

        mainMenu = new MainMenu();
        stage.addChild(mainMenu.sceneContainer);
        stage.addChild(mainMenu.menuContainer);
        
        soundManager.playMusic("LoveCodeLite2");
    }
        
    function updateGame() {
        if (!finishedLoading()) {
            updatePreloader(totalMapsLoaded + totalFilesLoaded + assetsLoaded);
            return;
        }
        else if (gameStatus === GameState.PRELOADING && !mainMenu) {
            gameStatus = GameState.PRELOADED;
            mapDataKeys = Object.keys(mapData);
            addMainMenu();
        }
        else if (gameStatus === GameState.PRELOADED) {
            mainMenu.update();
        }
        else if (gameStatus === GameState.LOADING) {
            if (totalMapsParsed < mapDataKeys.length)
                loadWorld();
            else
                launchLevelSelect();
        }

        else if (gameStatus === GameState.LEVELSELECTED) {
            launchLevel();
        }
        
        else if (gameStatus === GameState.RUNNING) {
            
            if (unpauseGame) {
                pauseGame = false;
                unpauseGame = false;
                if (gameUI)
                    gameUI.removeChild(pauseScreen);
            }
            else if (pauseGame && gameUI) {
                if (!gameUI.contains(pauseScreen))
                    gameUI.addChild(pauseScreen);
            }
            
            else
                updateGameMap();
        }

        else if (gameStatus === GameState.LEVELEND) {
            if (levelEndDisplay)
                levelEndDisplay.updateMenu();
        }

        else if (gameStatus === GameState.LEVELEXIT) {
            launchLevelSelect();
        }

        else if (gameStatus === GameState.LEVELSELECT) {
            levelSelectMenu.update();
        }

        stage.update();
    }
    
    var totalMapsParsed = -1;
    var mapDataKeys;
    function loadWorld() {

        if (totalMapsParsed < 0) {
            beginLoadingWorld();
            totalMapsParsed = 0;
        }
        
        var areaName = mapDataKeys[totalMapsParsed];
        var area = createLevel(areaName);
        gameWorld[areaName] = area;

        area.loadLevelProgress(gameSaveState[areaName]);

        totalMapsParsed += 1;
        updatePreloader(totalMapsParsed);
    }
    function beginLoadingWorld() {
        addPreloader(totalMapsParsed, mapDataKeys.length);

        controllerData = actionLibrary["ControllerData"];
        hitBoxData = actionLibrary["HitboxData"];
        attackData = actionLibrary["AttackData"];
        objectFactory = new ObjectFactory(this.name);
        player = new Player();
    }
    function createLevel(mapName) {
        console.log("PARSING MAP " + mapName);

        var levelParser = new LevelParser(mapName);
        
        var mapSize = levelParser.getLevelSize();
        var tileLayer = levelParser.getLevelTileLayer();
        var objectLayer = levelParser.getLevelObjectLayer();
        var mapTileSet = levelParser.getLevelTileSets();
        var mapProperties = levelParser.getCustomProperties();
        
        return new Level(tileLayer.data, objectLayer.objects, mapSize, mapTileSet, mapName, mapProperties);
    }

    function clearGameState() {
        if (currentLevel) {
            currentLevel.resetLevel();
            removeCurrentLevel();

            removeEventListener("keydown", onKeyDown);
            removeEventListener("keyup", onKeyUp);
            stage.removeChild(gameBG);
            stage.removeChild(gameArea);
            stage.removeChild(gameUI);
        }
        if (levelSelectMenu) {
            if (stage.contains(levelSelectMenu.menuContainer))
                stage.removeChild(levelSelectMenu.menuContainer);
        }

        removeLevelEnd();
        removePreloader(preloader);

        stage.removeChild(mainMenu.sceneContainer);
        stage.removeChild(mainMenu.menuContainer);

        transition = null;
    }
    
    function launchLevelSelect() {
        clearGameState();

        soundManager.playMusic("LoveCodeLite2");
        
        getProgressData();
        levelSelectMenu = new LevelSelectMenu();
        stage.addChild(levelSelectMenu.menuContainer);

        gameStatus = GameState.LEVELSELECT;
    }

    function launchLevel() {
        clearGameState();
        
        if (getMapSeries(currentMap) == 1)
            soundManager.playMusic("Always alert");
        else if (getMapSeries(currentMap) < 4)
            soundManager.playMusic("From hearsay");
        else if (getMapSeries(currentMap) < 6)
            soundManager.playMusic("The red cripple");
        else
            soundManager.playMusic("LoveCodeFull");
        
        gameBG = new createjs.Shape();
        gameBG.graphics.beginFill("#000000").drawRect(0, 0, stageWidth, stageHeight);
        gameArea = new createjs.Container();
        gameUI = createUI();

        stage.addChild(gameBG, gameArea, gameUI);

        var startLevel = gameWorld[currentMap];
        startLevel.spawnPlayer(player, startLevel.levelSpawn.location);
        setLevel(startLevel);
        
        addEventListener("keydown", onKeyDown);
        addEventListener("keyup", onKeyUp);

        gameStatus = GameState.RUNNING;
    }
    function getMapSeries(mapName) {
        if (mapName.indexOf("Stage_") == 0)
            return parseInt(mapName[6]);
    }

    function createUI() {
        gameUI = new createjs.Container();
        
        pauseScreen = new createjs.Shape();
        pauseScreen.graphics.beginFill("#000000").drawRect(0, 0, stageWidth, stageHeight);
        pauseScreen.alpha = 0.5;

        gameStatsDisplay = new StatsDisplay();
        gameUI.addChild(gameStatsDisplay.statsContainer);

        return gameUI;
    }

    function displayLevelEnd() {
        var isFirstTimeCompletion = !currentLevel.completed;
        
        currentLevel.completed = true;

        if (!gameSaveState[currentLevel.name])
            gameSaveState[currentLevel.name] = currentLevel.getLevelProgress();
        
        getProgressData();

        var currentRanking = currentLevel.getCurrentRanking();
        var newRanking = currentLevel.getPlayerRanking();
        if (newRanking > currentRanking)
            ranksAchieved += newRanking - currentRanking;

        levelEndDisplay = new LevelEndMenu(isFirstTimeCompletion);
        gameUI.addChild(levelEndDisplay.menuContainer);

        gameSaveState[currentLevel.name] = currentLevel.getLevelProgress();

        saveGame();
    }
    function removeLevelEnd() {
        if (levelEndDisplay) {
            if (gameUI.contains(levelEndDisplay.menuContainer))
                gameUI.removeChild(levelEndDisplay.menuContainer);
            levelEndDisplay = null;
        }
        
        gameStatus = GameState.RUNNING;
    }
    function beginNextStage() {
        removeLevelEnd();

        changeLevels(transition.map, transition.location);
        transition = null;
    }

    function setLevel(level) {
        if (currentLevel != null) {
            if (gameArea.contains(currentLevel.levelContainer)) {
                removeCurrentLevel();
            }
        }
        if (currentLevel !== level)
            level.startUpLevel();

        currentLevel = level;
        currentLevel.levelContainer.scale = gameScale;
        
        player.collectiblesGathered = 0;
        player.highestCombo = 0;
        gameScore = 0;
        gameStatsDisplay.initiateStatDisplay();

        if (!(gameArea.contains(level.levelContainer)))
            gameArea.addChild(level.levelContainer);
    }
    function removeCurrentLevel() {
        currentLevel.cleanUpLevel();
        gameArea.removeChild(currentLevel.levelContainer);
        currentLevel = null;
    }

    function updateGameMap() {

        if (transition != null && gameStatus == GameState.RUNNING) {
            displayLevelEnd();
            gameStatus = GameState.LEVELEND;
        }

        if (currentLevel) {
            updateUI();
            checkScreenwrap();
            centerScreen();
            currentLevel.updateLevel();
        }
    }
    function updateUI() {
        updateDialogueBox();
    }
    function updateDialogueBox() {
        if (currentStatement != null || currentDialogue != null) {
            if (!gameUI.contains(this.dialogueBox.dialogueContainer)) {
                gameUI.addChild(this.dialogueBox.dialogueContainer);
            }

            if (!this.dialogueBox.statement && !this.dialogueBox.dialogue) {
                this.dialogueBox.setText(currentStatement, currentDialogue);
            }
        }
        this.dialogueBox.update();
    }
    
    function resetCurrentLevel() {
        gameArea.removeChild(currentLevel.levelContainer);
        currentLevel.createLevel();
        currentLevel.spawnPlayer(player, currentLevel.levelSpawn.location);
        setLevel(currentLevel);
    }
    function changeLevels(newMap, newLocation) {
        var newLevel = gameWorld[newMap];

        if (newLevel != currentLevel) {
            currentLevel.removeActor(player);
        }

        newLevel.spawnPlayer(player, newLocation);
        setLevel(newLevel);

        player.respawnToAlive();
    }

    function centerScreen() {
        var totalMapSize = new Point(currentLevel.mapSize.X * tileSize * gameScale, currentLevel.mapSize.Y * tileSize * gameScale);
        var newScreenLocation = new Point(0, 0);
    
        if (totalMapSize.X < stageWidth)
            newScreenLocation.X = (stageWidth / 2) - (totalMapSize.X / 2) / gameScale;
        else {
            newScreenLocation.X = (stageWidth / 2) - (player.location.X + player.size.X / 2) * gameScale;
    
            if (newScreenLocation.X > 0)
                newScreenLocation.X = 0;
            else if (player.location.X * gameScale + (player.size.X / 2) + (stageWidth / 2) > totalMapSize.X)
                newScreenLocation.X = stageWidth - totalMapSize.X;
        }
        
        if (totalMapSize.Y < stageHeight)
            newScreenLocation.Y = (stageHeight / 2) - (totalMapSize.Y / 2) / gameScale;
        else {
            newScreenLocation.Y = (stageHeight / 2 ) - (player.location.Y + player.size.Y / 2) * gameScale;
    
            if (newScreenLocation.Y > 0)
                newScreenLocation.Y = 0;
            else if (player.location.Y * gameScale + (player.size.Y / 2) + (stageHeight / 2) > totalMapSize.Y)
                newScreenLocation.Y = stageHeight - totalMapSize.Y;
        }
    
        currentLevel.levelContainer.x = Math.round(newScreenLocation.X);
        currentLevel.levelContainer.y = Math.round(newScreenLocation.Y);
        currentLevel.screenPosition = newScreenLocation;
    }
    function checkScreenwrap() {
        var totalMapSize = new Point(currentLevel.mapSize.X * tileSize * gameScale, currentLevel.mapSize.Y * tileSize * gameScale);

        if (currentLevel.levelScreenWrap) {

            if (player.location.X >= totalMapSize.X)
                player.location.X = player.size.X;
            else if (player.location.X + player.size.X <= 0)
                player.location.X = totalMapSize.X - player.size.X;

            if (player.location.Y >= totalMapSize.Y)
                player.location.Y = player.size.Y;
            else if (player.location.Y + player.size.Y <= 0)
                player.location.Y = totalMapSize.Y - player.size.Y;
        }
        else {
            
            if (player.location.X + player.size.X >= totalMapSize.X)
                player.location.X = totalMapSize.X - player.size.X;
            else if (player.location.X <= 0)
                player.location.X = 0;

            if (player.location.Y + player.size.Y >= totalMapSize.Y) {
                player.location.Y = totalMapSize.Y - player.size.Y;
            }
            else if (player.location.Y <= 0)
                player.location.Y = 0;
        }
    }
    
    //#region Input Handling

    var spacebarHeld = false;
    var spacebarPressed = false;
    function onKeyDown(event) {
        var keyCode = event.keyCode;
        
        if (gameStatus === GameState.RUNNING) {

            if (keyCode == 68 || keyCode == 39)             // d || right arrow
                player.setActorDirection("right", true);
            else if (keyCode == 65 || keyCode == 37)        // a || left arrow
                player.setActorDirection("left", true);
                
            else if (isJumpKey(keyCode))
                player.jumpHold();

            else if (isAttackKey(keyCode))
                player.attack();
                
            if (keyCode == 32)
                spacebarHeld = true;
        }

        else if (gameStatus === GameState.LEVELEND) {
            if (keyCode == 32 && !spacebarHeld)
                spacebarPressed = true;
        }

    }
    function onKeyUp(event) {
        var keyCode = event.keyCode;
        
        if (gameStatus === GameState.RUNNING) {

            if (keyCode == 68 || keyCode == 39)             // d || right arrow
                player.setActorDirection("right", false);
            else if (keyCode == 65 || keyCode == 37)        // a || left arrow
                player.setActorDirection("left", false);
                
            else if (isJumpKey(keyCode))
                player.jumpRelease();

            else if (keyCode == 82)     //  r
                resetCurrentLevel();

            else if (keyCode == 84)     //  t
                currentLevel.toggleHitboxDisplay();
        }

        if (gameStatus === GameState.LEVELEND) {
            if (!levelEndDisplay)
                return;
            if (keyCode == 32 && spacebarPressed) {
                if (!levelEndDisplay.isFinished()) {
                    levelEndDisplay.skipScoring();
                    spacebarPressed = false;
                }
            }
        }

        if (keyCode == 32) {
            spacebarHeld = false;
            spacebarPressed = false;
        }

        if (keyCode == 27)     // esc
            launchLevelSelect();
    }
    function isJumpKey(keyCode) {
        return (keyCode == 87 || keyCode == 38 || keyCode == 13 || keyCode == 32);  //  w || up arrow || enter || space
    }
    function isAttackKey(keyCode) {
        return (keyCode == 16 || keyCode == 74 || keyCode == 69 || keyCode == 90);  //  shift || j || e || z
    }


    class LoadBar {

        constructor(progress, destination) {
            this.progress = progress;
            this.destination = destination;

            this.barWidth = Math.round(stageWidth * .7);
            this.barHeight = 32;

            this.createBar();
        }
        createBar() {
            this.loadBarContainer = new createjs.Container();
            
            this.barBG = new createjs.Shape();
            this.barBG.graphics.beginFill("#642dad").drawRect(0, 0, this.barWidth, this.barHeight);
            this.barOutline = new createjs.Shape();
            this.barOutline.graphics.setStrokeStyle(2).beginStroke("#e9d8a1").drawRect(0, 0, this.barWidth, this.barHeight);
            this.barBG.x = this.barOutline.x = Math.round(stageWidth / 2 - this.barWidth / 2);
            this.barBG.y = this.barOutline.y = Math.round(stageHeight * 0.6);
            
            this.barProgress = new createjs.Shape();
            this.barProgress.graphics.beginFill("#e9d8a1").drawRect(0, 0, this.barWidth - 16, this.barHeight - 16);
            this.barProgress.x = this.barOutline.x + 8;
            this.barProgress.y = this.barOutline.y + 8;
            
            this.barFill = new createjs.Shape();
            this.barFill.graphics.beginFill("#e9d8a1").drawRect(0, 0, this.barWidth - 16, this.barHeight - 16);
            this.barFill.x = this.barOutline.x + 8;
            this.barFill.y = this.barOutline.y + 8;
            this.barFill.mask = this.barProgress;

            this.percentText = new createjs.Text(Math.round(100 * this.progress / this.destination) + "%", "32px Equipment", "#e9d8a1");
            this.percentTextOutline = new createjs.Text(Math.round(100 * this.progress / this.destination) + "%", "32px Equipment", "#642dad");
            this.percentTextOutline.outline = 6;
            this.progressText = new createjs.Text( "(" + this.progress + " / " + this.destination + ")", "24px Equipment", "#e9d8a1");

            this.percentText.x = Math.round(stageWidth / 2 - this.percentText.getMeasuredWidth() / 2);
            this.progressText.x = this.percentText.x + this.percentText.getMeasuredWidth() + 30;
            this.percentText.y = this.barBG.y - this.percentText.getMeasuredLineHeight() - 20;
            this.progressText.y = this.percentText.y + Math.round(this.percentText.getMeasuredLineHeight() - this.progressText.getMeasuredLineHeight());
            this.percentTextOutline.x = this.percentText.x;
            this.percentTextOutline.y = this.percentText.y;

            this.loadBarContainer.addChild(this.percentTextOutline, this.percentText, this.progressText, this.barBG, this.barOutline, this.barProgress);
            this.updateBarProgress(this.progress);
        }

        updateBarProgress(newProgress) {
            this.progress = newProgress;

            this.barProgress.scaleX = this.progress / this.destination;
            this.percentText.text = Math.round(100 * this.progress / this.destination) + "%";
            this.percentTextOutline.text = Math.round(100 * this.progress / this.destination) + "%";
            this.progressText.text = "(" + this.progress + " / " + this.destination + ")";
        }
    }

});