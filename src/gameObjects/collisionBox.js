define("CollisionBox", ['Point'], function(Point) {
    
    class CollisionBox {

        constructor(hitBox = true, x = 0, y = 0, width = 0, height = 0) {
            this.type = hitBox ? "hitBox" : "hurtBox";
            this.location = new Point(x, y);
            this.size = new Point(width, height);

            this.collisionDisplay = new createjs.Shape();
            this.collisionDisplay.graphics.beginFill(this.type == "hitBox" ? "#dd0000" : "#333333").drawRect(x, y, width, height);
            this.collisionDisplay.alpha = 0;
            this.isVisible = false;
            this.parentObject = null;
        }

        get() {
            return new CollisionBox(this.location.X, this.location.Y, this.size.X, this.size.Y);
        }

        getX() {
            return this.location.X + this.parentObject.location.X;
        }
        getY() {
            return this.location.Y + this.parentObject.location.Y;
        }

        intersects(otherBox) {
            if (!(otherBox instanceof CollisionBox)) {
                console.log("Collision tried to intersect with non-collision object " + otherBox);
                return;
            }

            if (
                otherBox.getX() < this.getX() + this.size.X && 
                otherBox.getX() + otherBox.size.X > this.getX() &&

                otherBox.getY() < this.getY() + this.size.Y && 
                otherBox.getY() + otherBox.size.Y > this.getY()
            ) {
                return true;
            }
            else
                return false;
        }
        
        getCollisionDistance(otherBox, xAxis) {

            var boxCenter = new Point(this.getX() + this.size.X / 2, this.getY() + this.size.Y / 2);
            var otherCenter = new Point(otherBox.getX() + otherBox.size.X / 2, otherBox.getY() + otherBox.size.Y / 2);
            
            if (xAxis) {
                if (boxCenter.X - otherCenter.X >= 0)		// distance from left edge
                    return this.getX() - (otherBox.getX() + otherBox.size.X); 
                else if (boxCenter.X - otherCenter.X < 0)	// distance from right edge
                    return (this.getX() + this.size.X) - otherBox.getX();
            }
            else {
                if (boxCenter.Y - otherCenter.Y >= 0)		// distance from top edge
                    return this.getY() - (otherBox.getY() + otherBox.size.Y); 
                else if (boxCenter.Y - otherCenter.Y < 0)	// distance from bottom edge
                    return (this.getY() + this.size.Y) - otherBox.getY();
            }
        }
        
        getCollisionVector(otherBox) {
            
            var objectCenter = new Point(this.getX() + this.size.X / 2, this.getY() + this.size.Y / 2);
            var otherCenter = new Point(otherBox.getX() + otherBox.size.X / 2, otherBox.getY() + otherBox.size.Y / 2);

            return new Point(objectCenter.X - otherCenter.X, objectCenter.Y - otherCenter.Y);
        }

        toggleDisplay() {
            this.collisionDisplay.alpha = this.collisionDisplay.alpha > 0 ? 0 : 0.5;
            this.isVisible = !this.isVisible;
        }
        setVisible(v) {
            this.drawCollisionDisplay();
            this.collisionDisplay.alpha = v ? 0.5 : 0;
            this.isVisible = v;
        }
        drawCollisionDisplay() {
            this.collisionDisplay = new createjs.Shape();
            this.collisionDisplay.graphics.beginFill(this.type == "hitBox" ? "#dd0000" : "#333333").drawRect(this.location.X, this.location.Y, this.size.X, this.size.Y);
        }

    }

    return CollisionBox;

});
