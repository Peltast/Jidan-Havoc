require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {

      "point" : "src/gameObjects/point",
      "gameObject" : "src/gameObjects/gameObject",
      "objectFactory": "src/gameObjects/objectFactory",

      "tile": "src/levels/tile",
      "actor": "src/actors/actor",
      "prop": "src/props/prop",
      "transition": "src/levels/transition",

      "dialogueBox" : "src/interface/dialogueBox",
      "healthBar": "src/interface/healthBar",
      
      "switchProp": "src/props/switchProp",
      "triggerProp": "src/props/triggerProp",

      "particle": "src/effects/particle",
      "particleSystem": "src/effects/particleSystem",

      "enemy": "src/actors/enemy",
      "player": "src/actors/player",

      "level": "src/levels/level",
      "levelParser": "src/levels/levelParser",
      "game": "src/game"
    }
});
  
requirejs(['point'], function() {

    requirejs(['gameObject', 'levelParser', 'particle', 'healthBar'], function() {

        requirejs(['tile', 'actor', 'prop', 'transition', 'particleSystem', 'dialogueBox'], function() {

            requirejs(['switchProp', 'triggerProp', 'enemy'], function() {

                requirejs(['player', 'objectFactory'], function() {

                    requirejs(['level'], function() {

                        requirejs(['game']);

                    });
                });
            });
        });
    });
});