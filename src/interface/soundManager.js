define("SoundManager", function () {

    class SoundManager {

        constructor() {
            this.soundLibrary = {};
            this.currentSound = "";
        }

        playMusic(trackName, vol = 0.4) {
            if (!musicOn)
                return;
            
            if (trackName === this.currentSound && this.isSoundPlaying(this.currentSound)) {
                return;
            }
            
            this.stopCurrentMusic();

            if (!this.soundLibrary[trackName]) {
                var trackPlayer = new Howl({
                    src: [soundRoot + soundAssets[trackName]], loop: true, volume: vol
                });
                var trackID = trackPlayer.play();
                
                this.soundLibrary[trackName] = new SoundInstance(trackPlayer, trackID);
                this.currentSound = trackName;
            }
            else {
                this.soundLibrary[trackName].playSound();
                this.currentSound = trackName;
            }
        }

        stopCurrentMusic() {
            if (this.isSoundPlaying(this.currentSound)) {
                this.soundLibrary[this.currentSound].player.stop();
            }
        }
        pauseCurrentMusic() {
            if (this.isSoundPlaying(this.currentSound))
                this.soundLibrary[this.currentSound].pauseSound();
        }

        isSoundPlaying(soundName) {
            if (!this.soundLibrary[soundName])
                return false;

            var soundInstance = this.soundLibrary[soundName];
            return soundInstance.isPlaying();
        }

        
        playSound(soundName, vol) {
            if (!soundEffectsOn)
                return;
            
            var soundInstance = new Howl({
                src: [soundRoot + soundAssets[soundName]], loop: false, volume: vol
            });
            soundInstance.play();
        }

    }

    class SoundInstance {

        constructor(player, id) {
            this.player = player;
            this.id = id;
        }

        isPlaying() {
            return this.player.playing(this.id);
        }

        playSound() {
            this.player.play(this.id);
        }
        pauseSound() {
            this.player.pause(this.id);
        }

    }

    return SoundManager;

});