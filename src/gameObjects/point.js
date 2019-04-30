define("Point", function() {
    
    class Point {

        constructor(x = 0, y = 0) {
            this.X = x;
            this.Y = y;
        }

        get() {
            return new Point(this.X, this.Y);
        }

        add(deltaPoint) {
            if (!(deltaPoint instanceof Point))
                return;
            
            this.X += deltaPoint.X;
            this.Y += deltaPoint.Y;
        }
        subtract(deltaPoint) {
            if (!(deltaPoint instanceof Point))
                return;
            
            this.X -= deltaPoint.X;
            this.Y -= deltaPoint.Y;
        }
        multiply(deltaPoint) {
            if (!(deltaPoint instanceof Point))
                return;
                
            this.X *= deltaPoint.X;
            this.Y *= deltaPoint.Y;
        }
        divide(deltaPoint) {
            if (!(deltaPoint instanceof Point))
                return;
                
            this.X /= deltaPoint.X;
            this.Y /= deltaPoint.Y;
        }

        magnitude() {
            return Math.sqrt(Math.pow(this.X, 2) + Math.pow(this.Y, 2));
        }

        normalize() {
            var magn = this.magnitude();
            if (magn == 0)
                return;
            this.divide(new Point(magn, magn));
        }
        setMagnitude(newMagnitude) {
            var currentMagnitude = this.magnitude();
            this.multiply(new Point(newMagnitude / currentMagnitude, newMagnitude / currentMagnitude));
        }

    }

    return Point;

});
