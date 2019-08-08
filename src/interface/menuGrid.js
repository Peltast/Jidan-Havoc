define("MenuGrid", [], function () {

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

    return MenuGrid;

});