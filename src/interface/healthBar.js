define("HealthBar", ['Point'], function(Point) {

    class HealthBar {

        constructor() {
            
            this.healthBarContainer = new createjs.Container();
            this.healthBarContainer.x = Math.round(stageWidth * .04);
            this.healthBarContainer.y = Math.round(stageHeight * .04);
            
            this.isShowing = false;
            this.fadeOutTime = 600;
            this.fadeOutCounter = 0;

            this.slotList = [];
            this.selection = 0;

            this.drawHealthBar();
        }

        drawHealthBar() {
            this.healthBarContainer.removeAllChildren();
            this.slotList = [];

            for (let i = 0; i < player.maxHealth; i++) {
                var slot = new HealthSlot(i, (i < player.currentHealth));
                this.healthBarContainer.addChild(slot.slotContainer);
                this.slotList.push(slot);
            }
        }

        updateHealthBar() {
            this.showHealthBar(true);

            for (let i = 0; i < player.maxHealth; i++) {
                var hasHealth = (i < player.currentHealth);
                if (this.slotList[i].isFull !== hasHealth)
                    this.slotList[i].updateSlot(hasHealth);
            }
        }

        takeDamage() {
            this.showHealthBar(true);

            for (let i = this.slotList.length - 1; i >= 0; i--) {
                if (this.slotList[i].isFull) {
                    this.slotList[i].removeHealthPoint();
                    return;
                }
            }
        }
        regenHealth() {
            this.showHealthBar(true);
            
            for (let i = 0; i < this.slotList.length; i++) {
                if (!this.slotList[i].isFull) {
                    this.slotList[i].regenHealthPoint();
                    return;
                }
            }
        }

        showHealthBar(temporary) {
            this.healthBarContainer.alpha = 1;
            this.fadeOutCounter = 0;
            this.isShowing = !temporary;
        }
        updateAlpha() {
            if (this.healthBarContainer.alpha > 0 && !this.isShowing) {
                if (this.fadeOutCounter < this.fadeOutTime)
                    this.fadeOutCounter += 1;
                else {
                    this.healthBarContainer.alpha -= .02;
                }
            }
        }

    }

    class HealthSlot {
        
        constructor(index, isFull) {
            this.slotMargin = 5;
            this.slotContainer = new createjs.Container();

            this.slotSpriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["HealthSlot"]],
                "frames": {"width": 32, "height": 28, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            this.pointSpriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["HealthPoint"]],
                "frames": {"width": 32, "height": 28, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            this.slotSprite = null;
            this.pointSprite = null;
            this.isFull = isFull;
            
            this.createSlot(index);
        }

        createSlot(index) {
            
            this.slotContainer.x = (index * this.slotMargin) + (index * 32);

            this.slotSprite = new createjs.Sprite(this.slotSpriteSheet);
            this.pointSprite = new createjs.Sprite(this.pointSpriteSheet);
            this.slotSprite.gotoAndStop("idle");
            this.pointSprite.gotoAndStop("idle");

            this.slotContainer.addChild(this.slotSprite);
            this.slotContainer.addChild(this.pointSprite);

            if (!this.isFull) {
                this.pointSprite.alpha = 0;
            }
        }

        fillHealthPoint() {
            this.pointSprite.alpha = 1;
            this.isFull = true;
        }
        removeHealthPoint() {
            this.pointSprite.alpha = 0;
            this.isFull = false;
        }

        updateSlot(fill) {
            if (fill)
                this.fillHealthPoint();
            else
                this.removeHealthPoint();
        }

        regenHealthPoint() {
            this.pointSprite.alpha += .005;
            if (this.pointSprite.alpha >= .5) {
                this.pointSprite.alpha = 1;
                this.isFull = true;
                player.currentHealth += 1;
            }
        }
        
    }
    
    return HealthBar;

});