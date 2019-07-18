require( 
    ['Point', 'Level', 'LevelParser', 'ObjectFactory', 'Player', 'DialogueBox', 'MainMenu'], 
    function(Point, Level, LevelParser, ObjectFactory, Player, DialogueBox, MainMenu) {

    const GameState = { "Preloading": "Preloading", "Preloaded": "Preloaded", "Loading": "Loading", "Loaded": "Loaded" };

    $(function() {
        gameStatus = GameState.Preloading;
        initGame();
    });

    var preloader;
    var gameBG;
    var gameArea;
    var gameUI;

    function initGame() {
        createjs.Ticker.addEventListener("tick", updateGame);

        this.dialogueBox = new DialogueBox();

        addPreloader(loadProgress, totalGameManifest);
    }

    function addPreloader(progress, destination) {
        preloader = new LoadBar(progress, destination);
        stage.addChild(preloader.loadBarContainer);
    }
    function updatePreloader(progress) {
        preloader.updateBarProgress(progress);
        stage.update();
    }
    function addMainMenu() {
        stage.removeChild(preloader.loadBarContainer);

        mainMenu = new MainMenu();
        stage.addChild(mainMenu.sceneContainer);
        stage.addChild(mainMenu.menuContainer);
    }
        
    function updateGame() {

        if (!finishedLoading()) {
            updatePreloader(totalMapsLoaded + totalFilesLoaded + assetsLoaded);
            return;
        }
        else if (gameStatus === GameState.Preloading) {
            gameStatus = GameState.Preloaded;
            mapDataKeys = Object.keys(mapData);
            addMainMenu();
        }
        else if (gameStatus === GameState.Loading) {
            if (totalMapsParsed < mapDataKeys.length)
                loadWorld();
            else
                beginGame(startingMap);
        }
        else if (gameStatus === GameState.Loaded) {
            updateGameMap();
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

    function beginGame(startMapName) {
        stage.removeChild(mainMenu.sceneContainer);
        stage.removeChild(mainMenu.menuContainer);
        gameStatus = GameState.Loaded;
        
        gameBG = new createjs.Shape();
        gameBG.graphics.beginFill("#000000").drawRect(0, 0, stageWidth, stageHeight);
        gameArea = new createjs.Container();
        gameUI = createUI();

        stage.addChild(gameBG);
        stage.addChild(gameArea);
        stage.addChild(gameUI);

        var startLevel = gameWorld[startMapName];
        startLevel.spawnPlayer(player, currentCheckpoint.location);
        setLevel(startLevel);
        
        addEventListener("keydown", onKeyDown);
        addEventListener("keyup", onKeyUp);
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
    function createUI() {
        gameUI = new createjs.Container();

        // healthBar = new HealthBar();
        // gameUI.addChild(healthBar.healthBarContainer);

        return gameUI;
    }

    function setLevel(level) {
        if (currentLevel != null) {
            if (gameArea.contains(currentLevel.levelContainer)) {
                currentLevel.cleanUpLevel();
                gameArea.removeChild(currentLevel.levelContainer);
            }
        }
        if (currentLevel !== level)
            level.startUpLevel();

        currentLevel = level;
        currentLevel.levelContainer.scale = gameScale;

        if (!(gameArea.contains(level.levelContainer)))
            gameArea.addChild(level.levelContainer);
    }

    function updateGameMap() {

        if (transition != null) {
            changeLevels(transition.map, transition.location);
            transition = null;
        }

        updateUI();
        checkScreenwrap();
        centerScreen();
        currentLevel.updateLevel();
    }
    function updateUI() {

        // healthBar.updateAlpha();
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
        currentLevel.spawnPlayer(player, currentCheckpoint.location);
        setLevel(currentLevel);
    }
    function changeLevels(newMap, newLocation) {
        var newLevel = gameWorld[newMap];

        if (newLevel != currentLevel) {
            currentLevel.removeActor(player);
        }
        newLevel.spawnPlayer(player, newLocation);
        setLevel(newLevel);
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

    function onKeyDown(event) {
        var keyCode = event.keyCode;
        switch (keyCode) {

            case 68: //d
                player.setActorDirection("right", true);
                break;
            case 39: //right arrow
                player.setActorDirection("right", true);
                break;
                
            case 65: //a
                player.setActorDirection("left", true);
                break;
            case 37: // left arrow
                player.setActorDirection("left", true);
                break;
                
            case 87: //w
                player.jumpHold();
                break;
            case 38: // up arrow
                player.jumpHold();
                break;
            case 13: // enter
                player.jumpHold();
                break;
            case 32: // space
                player.jumpHold();
                break;

            case 16: // shift
                player.attack();
                break;
            case 74: // j
                player.attack();
                break;
            case 69: // e
                player.attack();
                break;
            case 90: // z
                player.attack();
                break;
    
        }
    }
    function onKeyUp(event) {
        
        var keyCode = event.keyCode;
        switch (keyCode) {
            
            case 68: // d
                player.setActorDirection("right", false);
                break;
            case 39: //right arrow
                player.setActorDirection("right", false);
                break;
                
            case 65: // a
                player.setActorDirection("left", false);
                break;
            case 37: // left arrow
                player.setActorDirection("left", false);
                break;

            case 87: // w
                player.jumpRelease();
                break;
            case 38: // up arrow
                player.jumpRelease();
                break;
            case 13: // enter
                player.jumpRelease();
                break;
            case 32: // space
                player.jumpRelease();
                break;
            case 16: // shift
                player.jumpRelease();
                break;


            case 84: // t
                currentLevel.toggleHitboxDisplay();
                break;
            case 82: // r
                resetCurrentLevel();
                break;

            // case 69:  // e
            //     if (currentStatement === null)
            //         player.interact();
            //     else 
            //         progressDialogueBox();
            //     break;
            // case 90: // z
            //     if (currentStatement === null)
            //         player.interact();
            //     else
            //         progressDialogueBox();
            //     break;

        }
    }
    // function progressDialogueBox() {

    //     if (this.dialogueBox.isFinished()) {
    //         currentStatement = null;
    //         currentDialogue = null;
    //         gameUI.removeChild(this.dialogueBox.dialogueContainer);
    //         this.dialogueBox.resetText();
    //     }

    //     this.dialogueBox.progressText();
    // }

    //#endregion


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
            this.barBG.graphics.beginFill("#272744").drawRect(0, 0, this.barWidth, this.barHeight);
            this.barOutline = new createjs.Shape();
            this.barOutline.graphics.setStrokeStyle(2).beginStroke("#fbf5ef").drawRect(0, 0, this.barWidth, this.barHeight);
            this.barBG.x = this.barOutline.x = Math.round(stageWidth / 2 - this.barWidth / 2);
            this.barBG.y = this.barOutline.y = Math.round(stageHeight * 0.6);
            
            this.barProgress = new createjs.Shape();
            this.barProgress.graphics.beginFill("#6dffe4").drawRect(0, 0, this.barWidth - 16, this.barHeight - 16);
            this.barProgress.x = this.barOutline.x + 8;
            this.barProgress.y = this.barOutline.y + 8;
            
            this.barFill = new createjs.Shape();
            this.barFill.graphics.beginFill("#6dffe4").drawRect(0, 0, this.barWidth - 16, this.barHeight - 16);
            this.barFill.x = this.barOutline.x + 8;
            this.barFill.y = this.barOutline.y + 8;
            this.barFill.mask = this.barProgress;

            this.percentText = new createjs.Text(Math.round(100 * this.progress / this.destination) + "%", "32px Equipment", "#6dffe4")
            this.progressText = new createjs.Text( "(" + this.progress + " / " + this.destination + ")", "24px Equipment", "#6dffe4");

            this.percentText.x = Math.round(stageWidth / 2 - this.percentText.getMeasuredWidth() / 2);
            this.progressText.x = this.percentText.x + this.percentText.getMeasuredWidth() + 30;
            this.percentText.y = this.barBG.y - this.percentText.getMeasuredLineHeight() - 20;
            this.progressText.y = this.percentText.y + Math.round(this.percentText.getMeasuredLineHeight() - this.progressText.getMeasuredLineHeight());

            this.loadBarContainer.addChild(this.percentText, this.progressText, this.barBG, this.barOutline, this.barProgress);
            this.updateBarProgress(this.progress);
        }

        updateBarProgress(newProgress) {
            this.progress = newProgress;

            this.barProgress.scaleX = this.progress / this.destination;
            this.percentText.text = Math.round(100 * this.progress / this.destination) + "%";
            this.progressText.text = "(" + this.progress + " / " + this.destination + ")";
        }
    }

});