define("ParticleSystem", ['Point', 'Particle'], function(Point, Particle) {

    class ParticleSystem {

        constructor(effectName) {
            if (particleEffectLibrary[effectName] == null) {
                console.log("Unable to load particle effect of type " + effectName);
            }

            this.effectName = effectName;
            this.effectData = particleEffectLibrary[effectName];
            this.maxParticles = this.effectData["numOfParticles"] ? this.effectData["numOfParticles"] : 100;
            this.particleData = this.effectData["particles"];
            
            this.simpleForces = this.effectData["simpleForces"];
            this.physicsData = this.effectData["physics"];
            this.attractionType = this.effectData["attraction"];
            this.repulsionType = this.effectData["repulsion"];

            this.isOneOff = (this.effectData["oneOff"] === true);
            this.isForegroundEffect = (this.effectData["foreground"] === true);
            this.isScreenWrap = (this.effectData["screenWrap"] === true);
            this.areaSpansMap = (this.effectData["areaSpansMap"] === true);
            this.randomSpawn = (this.effectData["randomSpawn"] === true);
            this.spawnInterval = this.effectData["spawnInterval"] ? this.effectData["spawnInterval"] : 0;
            this.spawnTimer = 0;

            this.effectArea = this.parsePointValue(this.effectData["effectArea"], new Point(stageWidth, stageHeight));
            this.effectAreaOrigin = this.parsePointValue(this.effectData["effectAreaOrigin"], new Point(0, 0));
            if (this.effectData["effectAreaAlignment"] === "center")
                this.effectAreaOrigin = new Point(this.effectAreaOrigin.X - this.effectArea.X / 2, this.effectAreaOrigin.Y - this.effectArea.Y / 2);
            this.parallaxDistX = parseFloat(this.effectData["parallaxDistX"]) ? parseFloat(this.effectData["parallaxDistX"]) : 0;
            this.parallaxDistY = parseFloat(this.effectData["parallaxDistY"]) ? parseFloat(this.effectData["parallaxDistY"]) : 0;

            this.spawnGrid = this.parsePointValue(this.effectData["spawnGrid"], new Point(-1, -1));
            this.spawnGridCellSize = this.effectData["spawnGridCellSize"];
            this.minimumCells = this.effectData["minimumCells"];

            this.reachedMaxParticles = false;
            this.isFinished = false;

            this.particles = [];
            this.systemContainer = new createjs.Container();
            this.initSimpleForces();
        }
        initSimpleForces() {
            if (!this.simpleForces)
                return;
            for (let i = 0; i < this.simpleForces.length; i++) {
                var f = this.simpleForces[i];
                this.simpleForces[i] = new SimpleForce(f["deltaVelocity"], f["durationRange"], f["intervalRange"]);
            }
        }

        addParticle(newParticle) {    
            this.particles.push(newParticle);
            this.systemContainer.addChild(newParticle.particleContainer);
        }

        removeParticle(oldParticle, index) {
            this.particles.splice(index, 1);
            this.systemContainer.removeChild(oldParticle.particleContainer);
        }

        updateSystem() {
            this.updateParticleSpawn();
            this.updateParallax();
            this.applySimpleForces();

            for (let i = this.particles.length - 1; i >= 0; i--) {
                
                this.applyParticleForces(this.particles[i]);
                this.updateScreenWrap(this.particles[i]);
                this.particles[i].update();

                if (this.particles[i].isDead()) {
                    this.removeParticle(this.particles[i], i);
                    // console.log(this.particleContainer.numChildren + ", " + this.particles.length);
                }
            }

            this.checkFinished();
        }

        setParticleAltVelocity(altVel) {
            for (let i = 0; i < this.particleData.length; i++) {
                this.particleData[i]["altStartVelocity"] = altVel;
            }
        }

        // #region Particle Creation

        updateParticleSpawn() {
            if (this.spawnGridCellSize && !this.reachedMaxParticles) {
                this.spawnParticleGrid();
            } 
            else {
                while (this.particles.length < this.maxParticles && !(this.isOneOff && this.reachedMaxParticles) ) {
                    
                    if (this.spawnInterval > 0) {
                        this.spawnTimer += 1;
                        if (this.spawnTimer >= this.spawnInterval)
                            this.spawnTimer = 0;
                        else
                            break;
                    }
                    this.createParticleInArea();
                }

                if ((this.isOneOff && this.particles.length >= this.maxParticles) || this.stopSpawning) {
                    this.reachedMaxParticles = true;
                    this.maxParticles = 0;
                }
            }
        }
        stopParticleEffect() {
            if (this.isOneOff)
                this.reachedMaxParticles = true;
            else
                this.stopSpawning = true;
        }
        checkFinished() {
            if ( (this.isOneOff || this.stopSpawning) && this.particles.length == 0) {
                this.isFinished = true;
            }
        }
        
        createParticleInArea() {
            var newParticle = new Particle(this.chooseParticleData());
            this.addParticle(newParticle);

            if (this.randomSpawn) {
                var randomXpos = Math.floor( Math.random() * this.effectArea.X ) + this.effectAreaOrigin.X;
                var randomYpos = Math.floor( Math.random() * this.effectArea.Y ) + this.effectAreaOrigin.Y;

                newParticle.location = new Point(randomXpos, randomYpos);
            }
            else {
                newParticle.location = new Point(this.effectAreaOrigin.X, this.effectAreaOrigin.Y);
            }
        }

        spawnParticleGrid() {
            var cellsInGrid = (this.spawnGrid.X * this.spawnGrid.Y) / (Math.pow(this.spawnGridCellSize, 2));
            var cellsCreated = 0;
            var yPos = 0;
            var xPos = 0;
            while (true) {

                var cellParticle = new Particle(this.chooseParticleData());
                this.addParticle(cellParticle);
                cellParticle.location = new Point(xPos + this.effectAreaOrigin.X, yPos + this.effectAreaOrigin.Y);

                cellsCreated += 1;
                xPos += this.spawnGridCellSize;
                if (xPos >= this.spawnGrid.X) {
                    xPos = 0;
                    yPos += this.spawnGridCellSize;
                    if (yPos >= this.spawnGrid.Y)
                        yPos = 0;
                }

                if (cellsCreated >= cellsInGrid && cellsCreated >= this.minimumCells)
                    break;
            }

            this.reachedMaxParticles = true;
        }

        chooseParticleData() {
            if (this.particleData.length == 1)
                return this.particleData[0];
            else {
                var randomIndex = Math.floor( Math.random() * (this.particleData.length) );
                return this.particleData[randomIndex];
            }
        }
        modifyParticleData(newData) {
            for (let i = 0; i < this.particleData.length; i++) {
                for (var key in newData) {
                    if (this.particleData[i][key]) {
                        this.particleData[i][key] = newData[key];
                    }
                }
            }
        }

        // #endregion

        // #region Particle forces

        applyParticleForces(tempParticle) {
            if (!this.physicsData)
                return;
            this.applyFrictionForce(tempParticle);

            if (this.attractionType)
                this.applyAttractionForce(tempParticle);
            if (this.repulsionType)
                this.applyRepulsionForce(tempParticle);
        }
        applyFrictionForce(tempParticle) {
            var frictionCoefficient = this.physicsData["frictionStrength"] / 100;
            var frictionForce = new Point(-1 * tempParticle.velocity.X, -1 * tempParticle.velocity.Y);
            frictionForce.normalize();
            frictionForce.multiply(new Point(frictionCoefficient, frictionCoefficient));
            
            tempParticle.applyForce(frictionForce);
        }
        applyAttractionForce(tempParticle) {
            if (this.attractionType === "player") {
                var attractionForce = this.findGravitationForce(tempParticle, player, true);
                tempParticle.applyForce(attractionForce);
            }
            else if (this.attractionType === "particles") {
                for (let j = 0; j < this.particles.length; j++) {
                    if (this.particles[j] === tempParticle)
                        continue;
                        
                    var particleAttraction = this.findGravitationForce(tempParticle, this.particles[j], true);
                    tempParticle.applyForce(particleAttraction);
                }
            }
        }
        applyRepulsionForce(tempParticle) {
            if (this.repulsionType === "player") {
                var repulsionForce = this.findGravitationForce(tempParticle, player, false);
                tempParticle.applyForce(repulsionForce);
            }
        }
        findGravitationForce(particle, attractor, isAttraction) {
            var gravityConstant = this.physicsData["gConstant"] * (isAttraction ? -1 : 1);
            var attraction = new Point(
                particle.location.X - (attractor.location.X + attractor.size.X / 2), 
                particle.location.Y - attractor.location.Y);
            var distance = Math.min(this.physicsData["distanceCeiling"], Math.max(attraction.magnitude(), this.physicsData["distanceFloor"]));
            var gravitationForce = (gravityConstant * particle.mass * attractor.mass) / (Math.pow(distance, 2));

            attraction.normalize();
            attraction.multiply(new Point(gravitationForce, gravitationForce));
            
            return attraction;
        }

        applySimpleForces() {
            if (!this.simpleForces)
                return;
            
            for (let i = 0; i < this.simpleForces.length; i++) {
                var force = this.simpleForces[i];
                force.updateSimpleForce(this.particles);
            }
        }
        // #endregion


        updateParallax() {
            
            if (this.parallaxDistX !== 0) {
                this.systemContainer.x = 
                    Math.round(this.effectAreaOrigin.X) 
                    - (currentLevel.screenPosition.X * (1 - this.parallaxDistX));
            }
            if (this.parallaxDistY !== 0) {
                this.systemContainer.y = 
                    Math.round(this.effectAreaOrigin.Y)
                    - (currentLevel.screenPosition.Y * (1 - this.parallaxDistY));
            }            
        }

        updateScreenWrap(tempParticle) {
            if (this.isScreenWrap) {
                if (this.particleIsOffScreen(tempParticle))
                    this.wrapParticleAcrossScreen(tempParticle);
            }
        }
        particleIsOffScreen(particle) {
            return (
                particle.location.X + particle.size.X < this.effectAreaOrigin.X - 1 ||
                particle.location.Y + particle.size.Y < this.effectAreaOrigin.Y - 1 ||
                particle.location.X - particle.size.X > this.effectArea.X + this.effectAreaOrigin.X + 1 ||
                particle.location.Y - particle.size.Y > this.effectArea.Y + this.effectAreaOrigin.Y + 1
            );
        }
        wrapParticleAcrossScreen(particle) {
            if (particle.location.X + particle.size.X < this.effectAreaOrigin.X - 1) {
                particle.location.X = this.effectAreaOrigin.X + this.effectArea.X;
            }
            else if (particle.location.Y + particle.size.Y < this.effectAreaOrigin.Y - 1) {
                particle.location.Y = this.effectAreaOrigin.Y + this.effectArea.Y;
            }
            else if (particle.location.X - particle.size.X > this.effectArea.X + this.effectAreaOrigin.X + 1) {
                particle.location.X = this.effectAreaOrigin.X - particle.size.X;
            }
            else if (particle.location.Y - particle.size.Y > this.effectArea.Y + this.effectAreaOrigin.Y + 1) {
                particle.location.Y = this.effectAreaOrigin.Y - particle.size.Y;
            }
        }

        
        parsePointValue(pointStr, defaultPoint) {
            if (pointStr == null)
                return defaultPoint;
            if (pointStr.indexOf(',') < 0)
                return defaultPoint;

            var pointVals = pointStr.split(',');
            var pointX = parseFloat(parseFloat(pointVals[0]).toFixed(2));
            var pointY = parseFloat(parseFloat(pointVals[1]).toFixed(2));

            if (isNaN(pointX) || isNaN(pointY))
                return defaultPoint;
            else
                return new Point(pointX, pointY);
        }
        
    }
    
    class SimpleForce {
        constructor(deltaVelocity, durationRange, intervalRange) {
            this.deltaVelocity = deltaVelocity;
            this.durationRange = durationRange;
            this.intervalRange = intervalRange;
            
            this.interval = this.parseRandomizableNumber(this.intervalRange);
            this.intervalCount = 0;
            this.duration = this.parseRandomizableNumber(this.durationRange);
            this.durationCount = 0;
            this.active = false;
        }

        updateSimpleForce(particles) {
            if (this.active) {
                if (this.durationCount >= this.duration) {
                    this.durationCount = 0;
                    this.duration = this.parseRandomizableNumber(this.durationRange);
                    this.active = false;

                    for (let j = 0; j < particles.length; j++) {
                        particles[j].applySimpleForce(deltaVelocity, false);
                    }
                }
                else {
                    this.durationCount += 1;
                }
            }
            else {
                if (this.intervalCount >= this.interval) {
                    this.intervalCount = 0;
                    this.interval = this.parseRandomizableNumber(this.intervalRange);
                    this.active = true;
                    var deltaVelocity = this.parseVector(this.deltaVelocity, new Point());

                    for (let j = 0; j < particles.length; j++) {
                        particles[j].applySimpleForce(deltaVelocity, true);
                    }
                }
                else {
                    this.intervalCount += 1;
                }
            }
        }
        
        parseVector(pointStr, defaultPoint) {
            if (pointStr == null)
                return defaultPoint;
            if (pointStr.indexOf(',') < 0)
                return defaultPoint;

            var pointVals = pointStr.split(',');
            var pointX = this.parseRandomizableNumber(pointVals[0]);
            var pointY = this.parseRandomizableNumber(pointVals[1]);

            if (isNaN(pointX) || isNaN(pointY))
                return defaultPoint;
            else
                return new Point(pointX, pointY);
        }
        parseRandomizableNumber(dataStr) {
            if (dataStr.indexOf("~") > 0) {
                var range = dataStr.split("~");
                var min = parseFloat(parseFloat(range[0]).toFixed(2));
                var max = parseFloat(parseFloat(range[1]).toFixed(2));
                if (min % 1 == 0 && max % 1 == 0)
                    return parseFloat((Math.floor( Math.random() * (max - min) ) + min).toFixed(2));
                else
                    return parseFloat( (( Math.random() * (max - min) ) + min).toFixed(2) );
            }
            else
                return parseFloat(parseFloat(dataStr).toFixed(2));
        }

    }

    return ParticleSystem;

});