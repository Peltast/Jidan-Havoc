require( 
    ['Point', 'Level', 'LevelParser', 'ObjectFactory', 'Player', 'DialogueBox', 'HealthBar'], 
    function(Point, Level, LevelParser, ObjectFactory, Player, DialogueBox, HealthBar) {

    $(function() { 
        initGame(); 
    });

    function initGame() {
        createjs.Ticker.addEventListener("tick", updateGame);

        this.dialogueBox = new DialogueBox();
        this.isPrologueActive = false;
    }
        
    function updateGame() {
        if (!finishedLoading())
            return;
        else if (!gameStarted) {
            gameStarted = true;
            console.log("STARTING GAME");
            beginGame(startingMap);
        }

        updateGameMap();
    }
    
    var gameBG;
    var gameArea;
    var gameUI;

    function beginGame(startMapName) {

        objectFactory = new ObjectFactory(this.name);
        player = new Player();
        
        for (var mapName in mapData) {
            var area = createLevel(mapName);
            gameWorld[mapName] = area;
        }
        
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

        healthBar = new HealthBar();
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
        if (this.isPrologueActive)
            updatePrologue();

        if (transition != null) {
            changeLevels(transition.map, transition.location);
            transition = null;
        }

        updateUI();
        checkScreenwrap();
        centerScreen();
        currentLevel.updateLevel();

        stage.update();
    }
    function updateUI() {

        healthBar.updateAlpha();
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

            if (player.location.Y + player.size.Y >= totalMapSize.Y)
                player.location.Y = totalMapSize.Y - player.size.Y;
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
                player.setPlayerJump();
                break;
            case 38: // up arrow
                player.setPlayerJump();
                break;
            case 32: // space
                player.setPlayerJump();
                break;

            // case 82: // r
            //     player.holdReset();
            //     break;
            // case 16: // shift
            //     player.pressSpecial();
            //     break;
    
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
                player.releasePlayerJump();
                break;
            case 38: // up arrow
                player.releasePlayerJump();
                break;
            case 32: // space
                player.releasePlayerJump();
                break;
                
            // case 82: // r
            //     player.releaseReset();
            //     break;
            // case 16: // shift
            //     player.releaseSpecial();
            //     break;

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
    function progressDialogueBox() {

        if (this.dialogueBox.isFinished()) {
            currentStatement = null;
            currentDialogue = null;
            gameUI.removeChild(this.dialogueBox.dialogueContainer);
            this.dialogueBox.resetText();
        }

        this.dialogueBox.progressText();
    }

    //#endregion


});