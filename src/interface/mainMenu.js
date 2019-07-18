define("MainMenu", [], function () {

    const ButtonTypes = {"NULL" : 1, "NEWGAME": 2, "INSTRUCTIONS": 3};

    class MainMenu {

        constructor() {
            this.instructionsShown = false;
            this.initiateScene();
            this.initiateMenu();
            this.initiateInstructions();

            addEventListener("keydown", this.onKeyDown);
            addEventListener("keyup", this.onKeyUp);
        }

        initiateScene() {
            
            this.sceneContainer = new createjs.Container();
            
            var backdropImg = new createjs.SpriteSheet({
                "images": [gameAssets["MenuSplash"]],
                "frames": {"width": 640, "height": 480, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            var titleImg = new createjs.SpriteSheet({
                "images": [gameAssets["MenuTitle"]],
                "frames": {"width": 474, "height": 60, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            var sandboxImg = new createjs.SpriteSheet({
                "images": [gameAssets["MenuSandbox"]],
                "frames": {"width": 156, "height": 105, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            
            this.menuBackground = new createjs.Shape();
            this.menuBackground.graphics.beginFill("#000000").drawRect(0, 0, stageWidth * 2, stageHeight * 2);

            this.menuTitle = new createjs.Sprite(titleImg);
            this.menuTitle.x = stageWidth / 2 - 474 / 2;
            this.menuTitle.y = 40;
            this.menuSandbox = new createjs.Sprite(sandboxImg);
            this.menuSandbox.x = stageWidth / 2 - 156 / 2;
            this.menuSandbox.y = 120;
            this.menuSplash = new createjs.Sprite(backdropImg);

            this.sceneContainer.addChild(this.menuBackground, this.menuSplash, this.menuTitle, this.menuSandbox);
        }
        initiateInstructions() {
            
            var instructionsImg = new createjs.SpriteSheet({
                "images": [gameAssets["PlayerInstructions"]],
                "frames": {"width": 640, "height": 480, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            this.playerInstructions = new createjs.Sprite(instructionsImg);
            this.playerInstructions.x = stageWidth / 2 - 640 / 2;
            this.playerInstructions.y = stageHeight / 2 - 480 / 2;

            this.instructionsBG = new createjs.Shape();
            this.instructionsBG.graphics.beginFill("#191028").drawRect(0, 0, stageWidth * 2, stageHeight * 2);
            this.instructionsBG.alpha = 0.9;
        }
        toggleInstructions() {
            if (!this.instructionsShown) {
                this.menuContainer.addChild(this.instructionsBG, this.playerInstructions);
                this.instructionsShown = true;
            }
            else {
                this.menuContainer.removeChild(this.instructionsBG, this.playerInstructions);
                this.instructionsShown = false;
            }
        }

        initiateMenu() {
            this.playButton = this.createMenuItem("MenuPlay", 112, 52, ButtonTypes.NEWGAME);
            this.instructionsButton = this.createMenuItem("MenuInstructions", 324, 40, ButtonTypes.INSTRUCTIONS);

            this.menuGrid = new MenuGrid([ [this.playButton, this.instructionsButton] ]);
            this.menuContainer = this.menuGrid.gridContainer;
        }
        createMenuItem(imageName, itemWidth, itemHeight, itemType) {
            var itemImg = new createjs.SpriteSheet({
                "images": [gameAssets[imageName]],
                "frames": {"width": itemWidth, "height": itemHeight, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            return new MenuItem(new createjs.Sprite(itemImg), itemType);
        }
        
        onKeyDown(event) {
            if (mainMenu.instructionsShown) {
                if (event.keyCode == 13 || event.keyCode == 32 || event.keyCode == 74 || event.keyCode == 88 || event.keyCode == 69)
                    mainMenu.toggleInstructions();
                return;
            }
            
            var keyCode = event.keyCode;
            switch (keyCode) {

                case 68: //d
                mainMenu.menuGrid.changeSelection(1, 0);
                    break;
                case 39: //right arrow
                    mainMenu.menuGrid.changeSelection(1, 0);
                    break;
                case 83: //s
                    mainMenu.menuGrid.changeSelection(0, 1);
                    break;
                case 40: // down arrow
                    mainMenu.menuGrid.changeSelection(0, 1);
                    break;
                case 65: //a
                    mainMenu.menuGrid.changeSelection(-1, 0);
                    break;
                case 37: // left arrow
                    mainMenu.menuGrid.changeSelection(-1, 0);
                    break;
                case 87: //w
                    mainMenu.menuGrid.changeSelection(0, -1);
                    break;
                case 38: // up arrow
                    mainMenu.menuGrid.changeSelection(0, -1);
                    break;

                case 13: // enter
                    mainMenu.menuGrid.activateSelection();
                    break;
                case 32: // space
                    mainMenu.menuGrid.activateSelection();
                    break;
                case 74: // j
                    mainMenu.menuGrid.activateSelection();
                    break;
                case 88: // x
                    mainMenu.menuGrid.activateSelection();
                    break;
                case 69: // e
                    mainMenu.menuGrid.activateSelection();
                    break;
            }
        }
        onKeyUp(event) {
            
            var keyCode = event.keyCode;
            switch (keyCode) {

            }
        }

    }

    class MenuGrid {

        constructor(gridMatrix) {
            this.gridMatrix = gridMatrix;
            
            this.gridContainer = new createjs.Container();
            this.gridY;
            this.yMargin = 20;
            this.gridHeight = 0;

            this.menuCursor;
            this.selectionX = 0;
            this.selectionY = 0;

            this.createGrid();
            this.createCursor();
        }
        createGrid() {
            this.gridY = 240;

            for (let x = 0; x < this.gridMatrix.length; x++) {
                if (x == 0)
                    this.createList(this.gridMatrix[x], stageWidth * 0.08);
                else
                    this.createList(this.gridMatrix[x], stageWidth * .74);
            }

        }
        createList(buttonList, listX) {
            var tempY = 0;
            for (let y = 0; y < buttonList.length; y++) {
                buttonList[y].image.y = this.gridY + tempY;
                buttonList[y].image.x = stageWidth / 2 - buttonList[y].width / 2;//listX;
                tempY += buttonList[y].height + this.yMargin;

                this.gridHeight = Math.max(tempY, this.gridHeight);

                this.gridContainer.addChild(buttonList[y].image);
            }
        }
        createCursor() {
            
            var cursorImg = new createjs.SpriteSheet({
                "images": [gameAssets["Player"]],
                "frames": {"width": 40, "height": 44, "regX": 0, "regY": 0, "count": 208},
                animations: {
                    idle: [84, 89, "idle", 0.2]
                }
            });
            this.menuCursor =  new createjs.Sprite(cursorImg);
            this.menuCursor.gotoAndPlay("idle");

            this.gridContainer.addChild(this.menuCursor);
            this.updateCursorPosition();
        }
        updateCursorPosition() { 
            var selection = this.gridMatrix[this.selectionX][this.selectionY];

            this.menuCursor.x = selection.image.x - 50;
            this.menuCursor.y = selection.image.y + selection.height / 2 - 22;
        }

        changeSelection(xDelta, yDelta) {

            if (xDelta !== 0) {

                if (xDelta < 0 && this.selectionX == 0)
                    this.selectionX = this.gridMatrix.length - 1;
                else if (xDelta > 0 && this.selectionX >= this.gridMatrix.length - 1)
                    this.selectionX = 0;
                else
                    this.selectionX += xDelta;

                this.selectionY = Math.min(this.selectionY, this.gridMatrix[this.selectionX].length - 1);
                this.updateCursorPosition();
            }
            else if (yDelta !== 0) {

                if (yDelta < 0 && this.selectionY == 0)
                    this.selectionY = this.gridMatrix[this.selectionX].length - 1;
                else if (yDelta > 0 && this.selectionY >= this.gridMatrix[this.selectionX].length - 1)
                    this.selectionY = 0;
                else
                    this.selectionY += yDelta;
                
                this.updateCursorPosition();
            }
        }

        activateSelection() {
            if (this.gridMatrix[this.selectionX][this.selectionY])
                this.gridMatrix[this.selectionX][this.selectionY].activate();
        }

    }

    class MenuItem {

        constructor(image, itemType) {
            this.image = image;
            this.itemType = itemType;

            this.height = image.getBounds().height;
            this.width = image.getBounds().width;
        }

        activate() {

            if (this.itemType === ButtonTypes.NULL)
                return;
            
            else if (this.itemType === ButtonTypes.NEWGAME) {
                removeEventListener("keydown", mainMenu.onKeyDown);
                removeEventListener("keyup", mainMenu.onKeyUp);
                gameStatus = "Loading";
            }
            else if (this.itemType === ButtonTypes.INSTRUCTIONS) {
                mainMenu.toggleInstructions();
            }

        }

    }

    return MainMenu;
    
});