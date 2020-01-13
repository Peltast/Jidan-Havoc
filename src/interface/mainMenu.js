define("MainMenu", ['MenuItem', 'MenuGrid'], function (MenuItem, MenuGrid) {

    const ButtonTypes = {"NULL" : 1, "NEWGAME": 2, "INSTRUCTIONS": 3, "SANDBOX": 10 };

    class MainMenu {

        constructor() {

            this.instructionsShown = false;
            this.creditsShown = false;
            this.initiateScene();
            this.initiateMenu();
            // this.initiateInstructions();
            this.initiateCredits();
        }

        initiateScene() {
            this.sceneContainer = new createjs.Container();
            
            var bgTower = new createjs.SpriteSheet({
                "images": [gameAssets["MenuTower"]],
                "frames": {"width": 640, "height": 1980, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            var titleImg = new createjs.SpriteSheet({
                "images": [gameAssets["MenuTitle"]],
                "frames": {"width": 600, "height": 120, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            
            this.menuBackground = new createjs.Shape();
            this.menuBackground.graphics.beginFill("#000000").drawRect(0, 0, stageWidth * 2, stageHeight * 2);

            this.menuTitle = new createjs.Sprite(titleImg);
            this.menuTitle.x = stageWidth / 2 - 600 / 2;
            this.menuTitle.y = 40;
            this.menuSplash = new createjs.Sprite(bgTower);
            this.menuSplash2 = new createjs.Sprite(bgTower);
            this.menuSplash2.y = 1980;

            this.sceneContainer.addChild(this.menuBackground, this.menuSplash, this.menuSplash2, this.menuTitle);
        }
        initiateMenu() {
            this.playButton = new MenuItem("MenuPlay", 190, 48, ButtonTypes.NEWGAME);
            this.creditsButton = new MenuItem("MenuCredits", 190, 46, ButtonTypes.CREDITS);

            this.menuGrid = new MenuGrid([ [this.playButton, this.creditsButton] ], false, 20, 20, stageWidth / 2, 260);
            this.menuContainer = this.menuGrid.gridContainer;
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

        initiateCredits() {
            this.creditsPage = new createjs.Container();

            var credits1 = new createjs.SpriteSheet({
                "images": [gameAssets["Credits1"]],
                "frames": {"width": 640, "height": 200, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            var credits2 = new createjs.SpriteSheet({
                "images": [gameAssets["Credits2"]],
                "frames": {"width": 352, "height": 140, "regX": 0, "regY": 0, "count": 2},
                animations: { idle: 0, hover: 1 }
            });

            this.credits1 = new createjs.Sprite(credits1);
            this.credits2 = new createjs.Sprite(credits2);
            this.credits2.gotoAndStop("idle");

            this.credits1.y = 120;
            this.credits2.x = stageWidth / 2 - 352 / 2;
            this.credits2.y = 320;

            this.credits2.on("mouseover", function(event) { event.target.gotoAndStop("hover"); });
            this.credits2.on("mouseout", function(event) { event.target.gotoAndStop("idle"); });
            this.credits2.on("click", function(event) { window.open("https://twitter.com/PeltastDesign"); });

            this.creditsBG = new createjs.Shape();
            this.creditsBG.graphics.beginFill("#191028").drawRect(0, 0, stageWidth * 2, stageHeight * 2);
            this.creditsBG.alpha = 0.9;
            
            this.creditsPage.addChild(this.creditsBG, this.credits1, this.credits2);
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
        toggleCredits() {
            if (!this.creditsShown) {
                this.menuContainer.addChild(this.creditsPage);
                this.creditsShown = true;
            }
            else {
                this.menuContainer.removeChild(this.creditsPage);
                this.creditsShown = false;
            }
        }

        update() {
            this.menuSplash.y -= 1;
            this.menuSplash2.y -= 1;

            if (this.menuSplash.y <= -1980)
                this.menuSplash.y = 1980;
            if (this.menuSplash2.y <= -1980)
                this.menuSplash2.y = 1980;
        }

    }

    return MainMenu;
    
});