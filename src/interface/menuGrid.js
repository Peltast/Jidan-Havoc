define("MenuGrid", [], function () {

    class MenuGrid {

        constructor(gridMatrix, horizontal = true, xMargin = 20, yMargin = 20, xOrigin = 0, yOrigin = 0) {
            
            this.gridMatrix = gridMatrix;
            this.listLengths = [];
            this.gridContainer = new createjs.Container();
            
            this.gridHeight = 0;
            this.gridWidth = 0;
            this.horizontal = horizontal;
            this.xMargin = xMargin;
            this.yMargin = yMargin;
            this.xOrigin = xOrigin;
            this.yOrigin = yOrigin;

            this.menuCursor;
            this.menuCursorAlignment = "left";
            this.orientation = "";
            this.cooldownLength = 150;
            this.lastUpdate = Date.now();
            
            this.selectionX = 0;
            this.selectionY = 0;

            this.drawGrid();
            this.createCursor();
            
            addEventListener("keydown", this.onKeyDown);
            addEventListener("keyup", this.onKeyUp);
            currentMenu = this;
        }
        
        drawGrid() {
            this.gridHeight = 0;
            this.gridWidth = 0;

            for (let i = 0; i < this.gridMatrix.length; i++) {
                this.drawList(this.gridMatrix[i]);
            }
        }
        drawList(buttonList) {
            var listPosition = 0;
            var largestItem = 0;

            for (let j = 0; j < buttonList.length; j++) {
                var button = buttonList[j];

                this.positionItemInGrid(button, listPosition);
                listPosition += this.horizontal ? button.width + this.xMargin : button.height + this.yMargin;
                largestItem = Math.max(largestItem, (this.horizontal ? button.height : button.width) );

                this.gridContainer.addChild(button.itemContainer);
            }
            
            this.listLengths.push(listPosition);

            if (this.horizontal) {
                this.gridHeight += largestItem + this.yMargin;
                this.gridWidth = Math.max(this.gridWidth, listPosition);
            }
            else {
                this.gridWidth += largestItem + this.xMargin;
                this.gridHeight = Math.max(this.gridHeight, listPosition);
            }
        }
        positionItemInGrid(button, listPosition) {
            if (this.horizontal) {
                button.itemContainer.x = this.xOrigin + listPosition - button.width / 2;
                button.itemContainer.y = this.yOrigin + this.gridHeight - button.height / 2;
            }
            else {
                button.itemContainer.y = this.yOrigin + listPosition - button.height / 2;
                button.itemContainer.x = this.xOrigin + this.gridWidth - button.width / 2;
            }
        }
        
        centerGridRows() {
            for (let i = 0; i < this.gridMatrix.length; i ++) {
                var rowSize = this.listLengths[i];
                var rowPosition = 0;
                
                for (let j = 0; j < this.gridMatrix[i].length; j++) {
                    var button = this.gridMatrix[i][j];
                    this.centerItemInGrid(button, rowSize, rowPosition);
                    rowPosition += this.horizontal ? button.width + this.xMargin : button.height + this.yMargin;
                }
            }
            this.updateCursorPosition();
        }
        centerItemInGrid(button, rowSize, rowPosition) {
            if (this.horizontal)
                button.itemContainer.x = this.xOrigin + (this.gridWidth / 2 - rowSize / 2) + rowPosition  - button.width / 2;
            else
                button.itemContainer.y = this.yOrigin + (this.gridHeight / 2 - rowSize / 2) + rowPosition - button.height / 2;
        }

        createCursor() {
            
            var cursorImg = new createjs.SpriteSheet({
                "images": [gameAssets["Player"]],
                "frames": {"width": 48, "height": 48, "regX": 0, "regY": 0, "count": 160},
                animations: {
                    idle: [136, 141, "idle", 0.2]
                }
            });
            this.menuCursor =  new createjs.Sprite(cursorImg);
            this.menuCursor.gotoAndPlay("idle");

            this.gridContainer.addChild(this.menuCursor);
            this.updateCursorPosition();
        }
        updateCursorPosition() { 
            var selection = this.gridMatrix[this.selectionX][this.selectionY];
            var halfAdjust = 24;
            var fullAdjust = 52;

            if (this.menuCursorAlignment == "left") {
                this.menuCursor.x = selection.itemContainer.x - fullAdjust;
                this.menuCursor.y = selection.itemContainer.y + selection.height / 2 - halfAdjust;
            }
            else if (this.menuCursorAlignment == "right") {
                this.menuCursor.x = selection.itemContainer.x + fullAdjust;
                this.menuCursor.y = selection.itemContainer.y + selection.height / 2 - halfAdjust;
            }
            else if (this.menuCursorAlignment == "top") {
                this.menuCursor.x = selection.itemContainer.x + selection.width / 2 - halfAdjust;
                this.menuCursor.y = selection.itemContainer.y - selection.height / 2 - halfAdjust;
            }
            else if (this.menuCursorAlignment == "bottom") {
                this.menuCursor.x = selection.itemContainer.x + selection.width / 2 - halfAdjust;
                this.menuCursor.y = selection.itemContainer.y - selection.height - halfAdjust;
            }
            else if (this.menuCursorAlignment == "center") {
                this.menuCursor.x = selection.itemContainer.x + selection.width / 2 - halfAdjust;
                this.menuCursor.y = selection.itemContainer.y + selection.height / 2 - halfAdjust;
            }
            
            if (this.gridHeight + this.yOrigin > stageHeight && this.centeredVertically) {
                this.gridContainer.y = this.yOrigin + Math.round((stageHeight - this.gridHeight - 80) * ((this.menuCursor.y + 40) / this.gridHeight));
            }
        }

        setCursorAlignment(alignmentStr) {
            this.menuCursorAlignment = alignmentStr;
            this.updateCursorPosition();
        }
        centerGridVertically() {
            this.centeredVertically = true;
            this.updateCursorPosition();
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

        changeSelection(xDelta, yDelta, forceSelection = false) {
            if (this.horizontal) {
                var t = yDelta;
                yDelta = xDelta;
                xDelta = t;
            }

            var delta = Date.now() - this.lastUpdate;
            if (delta > this.cooldownLength || forceSelection) {
                this.lastUpdate = Date.now();
            }
            else {
                return;
            }

            if (!forceSelection)
                soundManager.playSound("MoveCursor", 0.4);

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