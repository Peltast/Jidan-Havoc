(createjs.Graphics.Polygon = function(x, y, points) {
    this.x = x;
    this.y = y;
    this.points = points;
}).prototype.exec = function(ctx) {
    // Start at the end to simplify loop
    var end = this.points[this.points.length - 1];
    ctx.moveTo(end.x, end.y);
    this.points.forEach(function(point) {
        ctx.lineTo(point.x, point.y);
    });
};
createjs.Graphics.prototype.drawPolygon = function(x, y, args) {
    var points = [];
    if (Array.isArray(args)) {
        args.forEach(function(point) {
            point = Array.isArray(point) ? {x:point[0], y:point[1]} : point;
            points.push(point);
        });
    } else {
        args = Array.prototype.slice.call(arguments).slice(2);
        var px = null;
        args.forEach(function(val) {
            if (px === null) {
                px = val;
            } else {
                points.push({x: px, y: val});
                px = null;
            }
        });
    }
    return this.append(new createjs.Graphics.Polygon(x, y, points));
};