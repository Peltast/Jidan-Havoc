define("Attack", ['CollisionBox'], function(CollisionBox) {
    
    class Attack {

        constructor(hitBox = true, x = 0, y = 0, width = 0, height = 0) {
            
            this.area;

            this.mainDuration;
            this.mainState;
            this.startupState;
            this.startupDuration;
            this.recoveryState;
            this.recoveryDuration;

            this.altController;
            this.spawnObject;

            this.progressionStatus = 0;
            this.progressionTimer = 0;
        }

        updateAttack() {
            if (this.progressionStatus == 0)
                this.updateStartup();
            else if (this.progressionStatus == 1)
                this.updateMain();
            else if (this.progressionStatus == 2)
                this.updateRecovery();
        }
        updateStartup() {
            progressionTimer += 1;
            if (progressionTimer >= this.startupDuration) {
                this.progressionTimer = 0;
                this.progressionStatus = 1;
            }
        }
        updateMain() {
            progressionTimer += 1;
            if (progressionTimer >= this.mainDuration) {
                this.progressionTimer = 0;
                this.progressionStatus = 2;
            }
        }
        updateRecovery() {
            progressionTimer += 1;
            if (progressionTimer >= this.recoveryDuration) {
                this.progressionTimer = 0;
                this.progressionStatus = -1;
            }
        }

    }

    return Attack;

});
