define("MainMenu", ['MenuItem', 'MenuGrid'], function (MenuItem, MenuGrid) {

    const ButtonTypes = {"NULL" : 1, "NEWGAME": 2, "INSTRUCTIONS": 3, "SANDBOX": 10 };

    class MainMenu {

        constructor() {

            this.instructionsShown = false;
            this.initiateScene();
            this.initiateMenu();
            this.initiateInstructions();
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
            
            this.menuBackground = new createjs.Shape();
            this.menuBackground.graphics.beginFill("#000000").drawRect(0, 0, stageWidth * 2, stageHeight * 2);

            this.menuTitle = new createjs.Sprite(titleImg);
            this.menuTitle.x = stageWidth / 2 - 474 / 2;
            this.menuTitle.y = 40;
            this.menuSplash = new createjs.Sprite(backdropImg);

            this.sceneContainer.addChild(this.menuBackground, this.menuSplash, this.menuTitle);
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
            this.playButton = new MenuItem("MenuPlay", 112, 52, ButtonTypes.NEWGAME);
            this.instructionsButton = new MenuItem("MenuInstructions", 324, 40, ButtonTypes.INSTRUCTIONS);

            this.menuGrid = new MenuGrid([ [this.playButton, this.instructionsButton] ], false, 20, 20, stageWidth / 2, 240);
            this.menuContainer = this.menuGrid.gridContainer;
        }

    }

    return MainMenu;
    
});