define("DialogueBox", ['GameObject', 'Point'], function(GameObject, Point) {

    class DialogueBox extends GameObject {

        constructor() {
            super(new Point(0, 0), new Point(0, 0), true);
            
            this.locationTop = new Point(stageWidth * .1, stageHeight * .05);
            this.locationBottom = new Point(stageWidth * .1, stageHeight * .75);
            this.size = new Point(stageWidth * .8, stageHeight * .2);

            this.dialogueContainer = new createjs.Container();
            this.statementFinished = false;
            
            this.dialogue = null;
            this.statementIndex = -1;
            this.textStyle = { "orientation": "top" };
            
            this.statement = "";
            this.currentText = "";
            this.currentTextPosition = 0;
            this.textScrollSpeed = 3;
            this.textScrollTimer = 0;
            
            this.initDialogueBox();
        }
        initDialogueBox() {
            this.dialogueBackground = new createjs.Shape();
            this.dialogueBorder = new createjs.Shape();
            this.dialogueBorder.graphics.setStrokeStyle(3);
            this.dialogueBorder.graphics.beginStroke("#c69fa5");
            this.textField = new createjs.Text("", "24px Equipment", "#f2d3ab");

            this.drawDialogueBox(this.locationTop);

            this.textField.lineWidth = (this.size.X * 4) / 5;
            this.textField.lineHeight = 25; //this.textField.getMeasuredHeight() + 5;

            this.dialogueContainer.addChild(this.dialogueBackground);
            this.dialogueContainer.addChild(this.dialogueBorder);
            this.dialogueContainer.addChild(this.textField);
        }
        redrawDialogueBox(orientation) {
            this.dialogueBackground.graphics.clear();
            this.dialogueBorder.graphics.clear();
            this.dialogueBorder.graphics.setStrokeStyle(3);
            this.dialogueBorder.graphics.beginStroke("#c69fa5");

            if (orientation == "top")
                this.drawDialogueBox(this.locationTop);
            else if (orientation == "bottom")
                this.drawDialogueBox(this.locationBottom);
        }
        drawDialogueBox(drawLocation) {
            this.dialogueBackground.graphics.beginFill("#000000").drawRect(drawLocation.X, drawLocation.Y, this.size.X, this.size.Y);

            this.dialogueBorder.graphics.moveTo(drawLocation.X - 1, drawLocation.Y - 1);
            this.dialogueBorder.graphics.lineTo(drawLocation.X + this.size.X + 1, drawLocation.Y - 1);
            this.dialogueBorder.graphics.lineTo(drawLocation.X + this.size.X + 1, drawLocation.Y + this.size.Y + 1);
            this.dialogueBorder.graphics.lineTo(drawLocation.X - 1, drawLocation.Y + this.size.Y + 1);
            this.dialogueBorder.graphics.lineTo(drawLocation.X - 1, drawLocation.Y - 1);
            this.dialogueBorder.graphics.endStroke();

            this.textField.x = drawLocation.X + this.size.X / 10;
            this.textField.y = drawLocation.Y + this.size.Y / 6;
        }

        setText(newStatement, newDialogue) {

            this.resetText();
            this.statementIndex = -1;

            this.statement = newStatement;
            this.dialogue = newDialogue;

            this.statementFinished = false;
            this.textField.text = this.currentText;

            if (newDialogue != null) {
                var newStyle = dialogueLibrary["TextStyle"][newDialogue.style];
                this.applyNewStyle(newStyle);
            }
            else {
                this.applyNewStyle(dialogueLibrary["TextStyle"]["default"]);
            }
        }
        resetText() {

            this.statement = "";
            this.currentText = "";
            this.statementFinished = false;
            this.textField.text = this.currentText;
            this.currentTextPosition = 0;
            this.textScrollTimer = 0;
        }

        update() {

            if (this.statement && this.statement !== this.currentText) {
                this.updateStatement();
            }
            if (this.dialogue != null) {
                this.updateDialogue();
            }   
        }

        updateStatement() {
            
            this.textScrollTimer += 1;
            if (this.textScrollTimer >= this.textScrollSpeed) {
                this.textScrollTimer = 0;
                this.currentText += this.statement[this.currentTextPosition];
                this.currentTextPosition += 1;

                this.textField.text = this.currentText;
                
                if (this.statement === this.currentText){
                    this.statementFinished = true;
                }
            }
        }
        updateDialogue() {
            
            if (!this.statement) {
                this.statementIndex += 1;

                if (this.statementIndex >= this.dialogue.statements.length) {
                    this.statementIndex = -1;
                    this.dialogue = null;
                }
                else {
                    this.resetText();
                    this.statement = this.dialogue.statements[this.statementIndex];
                    currentStatement = this.statement;

                    if (this.dialogue.altStyle && this.dialogue.altStatements) {
                        var altStyle = dialogueLibrary["TextStyle"][this.dialogue.altStyle];

                        if (this.dialogue.altStatements.includes(this.statementIndex))
                            this.applyNewStyle(altStyle);
                        else if (this.textStyle == altStyle)
                            this.applyNewStyle(dialogueLibrary["TextStyle"][this.dialogue.style]);
                    }
                }
            }
        }
        applyNewStyle(newStyle) {
            if (newStyle == this.textStyle)
                return;
            else if (!newStyle)
                newStyle = dialogueLibrary["TextStyle"]["default"];

            if (newStyle.orientation && newStyle.orientation != this.textStyle.orientation)
                this.redrawDialogueBox(newStyle.orientation);
                
            this.textStyle = newStyle;
        }

        progressText() {
            if (this.statement === null) 
                return;
            else if (this.statementFinished === true)
                this.statement = null;
            else
                this.skipText();
        }
        isFinished() {
            if (!this.statementFinished)
                return false;

            if (this.dialogue == null)
                return true;
            else if (this.statementIndex >= this.dialogue.statements.length - 1)
                return true;
            else
                return false;
        }

        skipText() {
            this.currentText = this.statement;
            this.textField.text = this.currentText;
            this.statementFinished = true;
        }

    }

    return DialogueBox;

});