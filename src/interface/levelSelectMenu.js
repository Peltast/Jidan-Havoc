define("LevelSelectMenu", ['MenuItem', 'MenuGrid'], function (MenuItem, MenuGrid) {

    class LevelSelectMenu {

        constructor() {

            this.initiateStageButtons();
        }

        initiateMenu() {

            this.sandboxButton = new MenuItem("MenuPlay", 112, 52, ButtonTypes.SANDBOX);
            this.playButton = new MenuItem("MenuPlay", 112, 52, ButtonTypes.NEWGAME);
            this.instructionsButton = new MenuItem("MenuInstructions", 324, 40, ButtonTypes.INSTRUCTIONS);

            this.menuGrid = new MenuGrid([ [this.playButton, this.sandboxButton, this.instructionsButton] ]);
            this.menuContainer = this.menuGrid.gridContainer;

        }

        initiateStageButtons() {
            var buttonGrid = [];

            for (let s = 0; s < levelSeriesMatrix.length; s++) {
                var series = levelSeriesMatrix[s];
                var buttonSeries = [];

                for (let l = 0; l < series[1]; l++) {
                    var levelButton = new MenuItem("LevelSelectTile", 40, 40, ButtonTypes.LOADLEVEL);
                    buttonSeries.push(levelButton);
                }

                buttonGrid.push(buttonSeries);
            }
            
            this.levelGrid = new MenuGrid(buttonGrid, true, 20, 20, 80, 80);
            this.menuContainer = this.levelGrid.gridContainer;
        }

    }

    return LevelSelectMenu;
    
});