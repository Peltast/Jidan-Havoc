define("MainMenu", ['MenuItem', 'MenuGrid'], function (MenuItem, MenuGrid) {

    const ButtonTypes = {"NULL" : 1, "NEWGAME": 2, "INSTRUCTIONS": 3, "SANDBOX": 10 };

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
            this.sandboxButton = new MenuItem("MenuPlay", 112, 52, ButtonTypes.SANDBOX);
            this.playButton = new MenuItem("MenuPlay", 112, 52, ButtonTypes.NEWGAME);
            this.instructionsButton = new MenuItem("MenuInstructions", 324, 40, ButtonTypes.INSTRUCTIONS);

            this.menuGrid = new MenuGrid([ [this.playButton, this.sandboxButton, this.instructionsButton] ]);
            this.menuContainer = this.menuGrid.gridContainer;
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

    return MainMenu;
    
});