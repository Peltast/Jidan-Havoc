define("MenuGrid", [], function () {

    class MenuGrid {

        constructor(gridMatrix, horizontal = true, xMargin = 20, yMargin = 20, xOrigin = 0, yOrigin = 0) {
            
            this.gridMatrix = gridMatrix;
            this.gridContainer = new createjs.Container();
            
            this.horizontal = horizontal;
            this.xMargin = xMargin;
            this.yMargin = yMargin;
            this.xOrigin = xOrigin;
            this.yOrigin = yOrigin;

            this.gridWidth = 0;
            this.gridHeight = 0;

            this.menuCursor;
            this.selectionX = 0;
            this.selectionY = 0;

            this.createGrid();
            this.createCursor();
            
            addEventListener("keydown", this.onKeyDown);
            addEventListener("keyup", this.onKeyUp);
            currentMenu = this;
        }
        
        createGrid() {

            for (let i = 0; i < this.gridMatrix.length; i++) {
                
                this.createList(this.gridMatrix[i]);
            }

        }
        createList(buttonList) {
            var listSize = 0;
            var largestItem = 0;
            for (let j = 0; j < buttonList.length; j++) {

                if (this.horizontal) {
                    buttonList[j].image.x = this.xOrigin + listSize - buttonList[j].width / 2;
                    buttonList[j].image.y = this.yOrigin + this.gridHeight - buttonList[j].height / 2;

                    listSize += buttonList[j].width + this.xMargin;
                    largestItem = Math.max(largestItem, buttonList[j].height);
                }
                else {
                    buttonList[j].image.y = this.yOrigin + listSize - buttonList[j].height / 2;
                    buttonList[j].image.x = this.xOrigin + this.gridWidth - buttonList[j].width / 2;

                    listSize += buttonList[j].height + this.yMargin;
                    largestItem = Math.max(largestItem, buttonList[j].width);
                }

                this.gridContainer.addChild(buttonList[j].image);
            }

            if (this.horizontal) {
                this.gridHeight += largestItem + this.yMargin;
                this.gridWidth += listSize;
            }
            else {
                this.gridWidth += largestItem + this.xMargin;
                this.gridHeight += listSize;
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
        
        onKeyDown(event) {
            if (mainMenu.instructionsShown) {
                if (event.keyCode == 13 || event.keyCode == 32 || event.keyCode == 74 || event.keyCode == 88 || event.keyCode == 69)
                    mainMenu.toggleInstructions();
                return;
            }
            
            var keyCode = event.keyCode;

            if (keyCode == 68 || keyCode == 39)         // d || right arrow
                currentMenu.changeSelection(1, 0);
            else if (keyCode == 83 || keyCode == 40)    // s || down arrow
                currentMenu.changeSelection(0, 1);
            else if (keyCode == 65 || keyCode == 37)    // a || left arrow
                currentMenu.changeSelection(-1, 0);
            else if (keyCode == 87 || keyCode == 38)    // w || up arrow
                currentMenu.changeSelection(0, -1);

            else if (keyCode == 13 || keyCode == 32 || keyCode == 74 || keyCode == 88 || keyCode == 69)     // enter || space || j || x || e
                currentMenu.activateSelection();

        }
        onKeyUp(event) {
            
            var keyCode = event.keyCode;
            switch (keyCode) {

            }
        }

        changeSelection(xDelta, yDelta) {
            if (this.horizontal) {
                var t = yDelta;
                yDelta = xDelta;
                xDelta = t;
            }

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

    return MenuGrid;

});