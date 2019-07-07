define("Attack", ['CollisionBox', 'ActorController'], function(CollisionBox, ActorController) {
    
    class Attack {

        constructor(startUpKey, mainKey, recoveryKey) {
            this.active = false;

            this.startUpPhase = this.constructAttackPhase(startUpKey);
            this.mainPhase = this.constructAttackPhase(mainKey);
            this.recoveryPhase = this.constructAttackPhase(recoveryKey);

            this.currentPhase = this.startUpPhase ? this.startUpPhase : this.mainPhase;
        }
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

            return new AttackPhase(phaseData["duration"], phaseData["animation"], phaseController, phaseHitboxes);
        }

        beginAttack(hostActor) {
            this.active = true;
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

            this.currentPhase.updatePhase();

            return true;
        }
        progressAttack(hostActor) {

            if (!this.currentPhase) {
                this.currentPhase = this.startUpPhase ? this.startUpPhase : this.mainPhase;
            }

            else if (this.currentPhase == this.startUpPhase) {
                this.currentPhase.endPhase(hostActor);

                this.currentPhase = this.mainPhase;
                this.currentPhase.startPhase(hostActor);
            }
            else if (this.currentPhase == this.mainPhase) {
                console.log("main phase ended");
                this.currentPhase.endPhase(hostActor);

                this.currentPhase = this.recoveryPhase ? this.recoveryPhase : null;
                this.currentPhase.startPhase(hostActor);
            }
            else if (this.currentPhase == this.recoveryPhase) {
                console.log("recovery phase ended");
                this.currentPhase.endPhase(hostActor);
                this.currentPhase = this.startUpPhase ? this.startUpPhase : this.mainPhase;

                this.active = false;
            }
        }


    }

    class AttackPhase {

        constructor(duration, animation, controller, hitboxes) {
            this.duration = duration;
            this.animation = animation;
            this.controller = controller;
            this.hitboxes = hitboxes;
            // this.spawnObject = spawnObject;

            this.phaseTimer = this.duration;
        }

        updatePhase() {
            this.phaseTimer -= 1;
        }

        isFinished() {
            return (this.phaseTimer <= 0);
        }

        startPhase(hostActor) {
            this.phaseTimer = this.duration;

            if (this.animation) {
                hostActor.state = this.animation;
            }
            if (this.controller) {
                console.log(this.controller);
                hostActor.currentController = this.controller;
            }
            if (this.hitboxes) {
                this.hitboxes.forEach((hitbox) => {
                    console.log(hitbox);
                    hostActor.addHitbox(hitbox);
                });
            }
        }

        endPhase(hostActor) {
            if (this.animation) {
                hostActor.state = "";
            }
            if (this.controller) {
                hostActor.currentController = hostActor.defaultController;
            }
            if (this.hitboxes) {
                this.hitboxes.forEach((hitbox) => {
                    hostActor.removeHitbox(hitbox);
                });
            }
        }

    }

    return Attack;

});
