define("Attack", ['CollisionBox', 'ActorController'], function(CollisionBox, ActorController) {
    
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

            return new AttackPhase(
                phaseData["duration"], phaseData["animation"], phaseController, phaseHitboxes,
                phaseData["directional"], phaseData["aerial"], phaseData["immune"]);
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
            if (this.currentPhase.aerial && hostActor.onGround)
                this.progressAttack(hostActor);

            this.currentPhase.updatePhase();

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

    }

    class AttackPhase {

        constructor(duration, animation, controller, hitboxes, directional, aerial, immune) {
            this.duration = duration;
            this.animation = animation;
            this.controller = controller;
            this.hitboxes = hitboxes;
            // this.spawnObject = spawnObject;

            this.phaseTimer = this.duration;
            this.directional = directional;
            this.aerial = aerial;
            this.immune = immune;
        }

        updatePhase() {
            this.phaseTimer -= 1;
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
            }
            if (this.immune) {
                hostActor.isImmune = this.immune;
            }
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

        endPhase(hostActor) {
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
        }

    }

    return Attack;

});
