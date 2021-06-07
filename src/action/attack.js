define("Attack", ['Point', 'CollisionBox', 'ActorController', 'ParticleSystem'], function(Point, CollisionBox, ActorController, ParticleSystem) {
    
    class Attack {

        constructor(phases) {
            this.active = false;
            this.phases = [];

            phases.forEach((phase) => {
                this.phases.push(this.constructAttackPhase(phase));
            });
            
            this.initAttack();
        }
        initAttack() { }

        constructAttackPhase(phaseName) {
            var phaseData = attackData[phaseName];
            if (!phaseData)
                return null;
            
            var phaseController;
            var phaseControllerData;
            var phaseHitboxes = [];

            if (phaseData["controller"]) {
                phaseControllerData = controllerData[phaseData["controller"]];
                phaseController = new ActorController(phaseControllerData);
            }
            if (phaseData["hitBoxes"]) {
                var phaseHitboxData = phaseData["hitBoxes"];
                phaseHitboxData.forEach((hitboxName) => {
                    if (hitBoxData[hitboxName]) {
                        var h = hitBoxData[hitboxName];
                        var hitbox = new CollisionBox(true, h["x"], h["y"], h["width"], h["height"]);
                        phaseHitboxes.push(hitbox);
                    }
                });   
            }

            return new AttackPhase(phaseName, phaseController, phaseHitboxes, phaseData);
        }

        beginAttack(hostActor) {
            if (this.phases.length <= 0)
                return;

            this.active = true;
            this.currentIndex = 0;
            this.currentPhase = this.phases[this.currentIndex];
            this.currentPhase.startPhase(hostActor);
        }
        endAttack(hostActor) {
            this.active = false;
            this.currentPhase.endPhase(hostActor);
        }
        updateAttack(hostActor) {

            if (this.currentPhase ? this.currentPhase.isFinished() : true) {
                this.progressAttack(hostActor);
                if (!this.active)
                    return false;
            }
            if (this.currentPhase.aerial && hostActor.onGround) {
                this.progressAttack(hostActor);

                if (hostActor === player)
                    player.handleSlamStun();
            }

            this.currentPhase.updatePhase(hostActor);

            return true;
        }
        progressAttack(hostActor) {

            this.currentPhase.endPhase(hostActor);

            var origin = this.currentIndex;
            this.setNextPhase();
            
            if (this.currentIndex <= origin)
                this.endAttack(hostActor);
            else
                this.currentPhase.startPhase(hostActor);
        }
        setNextPhase() {
            if (this.currentIndex >= this.phases.length - 1)
                this.currentIndex = 0;
            else
                this.currentIndex += 1;
            this.currentPhase = this.phases[this.currentIndex];

            if (!this.currentPhase)
                this.setNextPhase();
        }

        isInCombo() {
            return this.phases[this.currentIndex].comboPiece;
        }

        getPhaseName() {
            return this.currentPhase ? this.currentIndex + ", " + this.currentPhase.name : "null";
        }

    }

    class AttackPhase {

        constructor(name, controller, hitboxes, phaseData) {
            this.name = name;
            this.controller = controller;
            this.hitboxes = hitboxes;

            this.duration = phaseData["duration"];
            this.phaseTimer = this.duration;
            this.animation = phaseData["animation"];
            this.directional = phaseData["directional"];
            this.aerial = phaseData["aerial"];
            this.immune = phaseData["immune"];
            this.comboPiece = phaseData["comboPiece"];

            if (phaseData["effects"]) {
                this.effects = [];
                for (let i = 0; i < phaseData["effects"].length; i++) {
                    var effectData = phaseData["effects"][i];
                    var newEffect = {};

                    newEffect.name = effectData["name"];
                    newEffect.orientationBased = effectData["orientationBased"] === true;
                    newEffect.direction = effectData["direction"];
                    newEffect.originX = effectData["originX"];
                    newEffect.originY = effectData["originY"];
                    newEffect.position = effectData["distanceInterval"] ? 0 : -1;
                    newEffect.randomVel = effectData["randomVel"] === true;
                    newEffect.system = null;

                    this.effects.push(newEffect);
                }
            }
        }

        updatePhase(hostActor) {
            this.phaseTimer -= 1;

            if (this.effects) {
                for (let i = 0; i < this.effects.length; i++)
                    this.updatePhaseEffect(hostActor, this.effects[i]);
            }
        }

        isFinished() {
            return (this.phaseTimer <= 0);
        }

        startPhase(hostActor) {
            this.phaseTimer = this.duration;

            if (this.controller) {
                this.setAttackController(hostActor);
            }
            if (this.animation) {
                this.addPhaseAnimation(hostActor);
            }
            if (this.hitboxes) {
                this.addPhaseHitboxes(hostActor);

                if (this.hitboxes.length > 0 && hostActor === player)
                    player.playSound("Attack", 0.4);
            }
            if (this.immune) {
                hostActor.isImmune = this.immune;
            }

            if (this.effects)
                this.addPhaseEffects(hostActor);
        }

        setAttackController(hostActor) {
            if (this.directional) {
                this.controller.flipDirectionalProperties(hostActor.orientation);
            }
            hostActor.setController(this.controller);
        }

        addPhaseAnimation(hostActor) {
            var phaseAnimation = this.animation;
            if (this.directional) {
                phaseAnimation = (hostActor.orientation === "left" ? "left" : "right") + this.animation;
            }
            hostActor.state = phaseAnimation;
            hostActor.currentController.setAnimation = phaseAnimation;
        }

        addPhaseHitboxes(hostActor) {
            this.hitboxes.forEach((hitbox) => {
                if (this.directional) {
                    hitbox.location.X = hostActor.orientation === "left" ? -hitbox.size.X : hostActor.size.X;
                }
                hostActor.addHitbox(hitbox);
            });
        }

        addPhaseEffects(hostActor) {
            
            for (let i = 0; i < this.effects.length; i++) {
                var effect = this.effects[i];

                var fullName = effect.orientationBased ? hostActor.orientation + effect.name : effect.name;
                effect.system = new ParticleSystem(fullName);
                this.updatePhaseEffect(hostActor, effect);

                if (effect.randomVel) {
                    if (this.isEffectHorizontal(effect))
                        effect.system.particleData[0].startVelocity = (hostActor.orientation === "right" ? "-1.5~0" : "0~1.5") + ", -1~-0.2";
                    else
                        effect.system.particleData[0].startVelocity = "-1.5~1.5,-1~-0.2";
                }
                
                hostActor.addParticleEffectObj(effect.system);
            }
        }
        updatePhaseEffect(hostActor, effect) {

            if (effect.direction && effect.system) {
                if (effect.position >= 0) {
                    var delta = Math.abs( (this.isEffectHorizontal(effect) ? hostActor.location.X : hostActor.location.Y) - effect.position);
                    effect.system.spawnTimer = delta;

                    if (delta >= effect.system.spawnInterval) {
                        var newOrigin = this.getEffectPosition(hostActor, effect);

                        effect.system.effectAreaOrigin = newOrigin;
                        effect.position = this.isEffectHorizontal(effect) ? hostActor.location.X : hostActor.location.Y;
                    }
                }
            }
        }
        getEffectPosition(hostActor, effect) {
            var newOrigin = new Point(hostActor.location.X, hostActor.location.Y);

            if (effect.originX) {
                var directionMod = (this.isEffectHorizontal(effect) && hostActor.orientation == "left") ? -1 : 1;
                newOrigin.X += hostActor.size.X * effect.originX * directionMod;
            }
            if (effect.originY) {
                newOrigin.Y += hostActor.size.Y * effect.originY;
            }

            return newOrigin;
        }
        isEffectHorizontal(e) {
            return (e.direction == "horizontal" || e.direction == "left" || e.direction == "right");
        }

        endPhase(hostActor) {
            this.phaseTimer = -1;

            if (this.animation) {
                hostActor.state = "";
            }
            if (this.controller) {
                hostActor.setController(hostActor.defaultController);
            }
            if (this.hitboxes) {
                this.hitboxes.forEach((hitbox) => {
                    hostActor.removeHitbox(hitbox);
                });
            }
            if (this.immune)
                hostActor.isImmune = false;
            
            if (this.effects) {
                for (var i = 0; i < this.effects.length; i++) {
                    if (this.effects[i].system)
                        this.effects[i].system.stopParticleEffect();
                }
            }
        }

    }

    return Attack;

});
