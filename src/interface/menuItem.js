define("MenuItem", [], function () {

    class MenuItem {

        constructor(imageName, itemWidth, itemHeight, itemType) {
            this.itemType = itemType;

            this.image = this.createItemImage(imageName, itemWidth, itemHeight);
            this.height = this.image.getBounds().height;
            this.width = this.image.getBounds().width;
        }

        createItemImage(imageName, itemWidth, itemHeight) {
            var itemImg = new createjs.SpriteSheet({
                "images": [gameAssets[imageName]],
                "frames": {"width": itemWidth, "height": itemHeight, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            return new createjs.Sprite(itemImg);
        }

        activate() {

            if (this.itemType === ButtonTypes.NULL)
                return;
            

            else if (this.itemType === ButtonTypes.INSTRUCTIONS) {
                mainMenu.toggleInstructions();
            }
            
            else if (this.itemType === ButtonTypes.NEWGAME) {
                removeEventListener("keydown", currentMenu.onKeyDown);
                removeEventListener("keyup", currentMenu.onKeyUp);
                gameStatus = GameState.LOADING;
            }
            else if (this.itemType === ButtonTypes.SANDBOX) {
                removeEventListener("keydown", currentMenu.onKeyDown);
                removeEventListener("keyup", currentMenu.onKeyUp);
                gameStatus = GameState.LOADING;
                startingMap = "DevRoom";
            }

        }

    }

    return MenuItem;

});