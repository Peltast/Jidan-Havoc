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

            return new AttackPhase(phaseController, phaseHitboxes, phaseData);
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
                    player.playSound("StunFloor", 0.5);
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

    }

    class AttackPhase {

        constructor(controller, hitboxes, phaseData) {

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
                    newEffect.direction = effectData["direction"];
                    newEffect.position = effectData["distanceInterval"] ? 0 : -1;
                    newEffect.system = null;

                    console.log(newEffect);
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
                effect.system = new ParticleSystem(effect.name);
                this.updatePhaseEffect(hostActor, effect);
                effect.system.particleData[0].startVelocity = (hostActor.orientation === "right" ? "-1.5~0" : "0~1.5") + ", -1~-0.2";
                
                hostActor.addParticleEffectObj(effect.system);
            }
        }
        updatePhaseEffect(hostActor, effect) {

            if (effect.direction && effect.system) {
                if (effect.position >= 0) {
                    var delta = Math.abs(hostActor.location.X - effect.position);
                    effect.system.spawnTimer = delta;

                    if (delta >= effect.system.spawnInterval) {
                        var xOrigin = hostActor.orientation === "right" ? hostActor.location.X - 24 : hostActor.location.X + hostActor.size.X + 16;
                        effect.system.effectAreaOrigin = new Point(xOrigin, hostActor.location.Y + hostActor.size.Y / 2);
                        effect.position = hostActor.location.X;
                    }
                }
            }
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
