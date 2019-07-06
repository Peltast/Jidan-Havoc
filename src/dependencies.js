require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {

      "point" : "src/gameObjects/point",
      "collisionBox" : "src/gameObjects/collisionBox",
      "gameObject" : "src/gameObjects/gameObject",
      "objectFactory": "src/gameObjects/objectFactory",

      "tile": "src/levels/tile",
      "actor": "src/actors/actor",
      "attack": "src/actors/attack",
      "prop": "src/props/prop",
      "transition": "src/levels/transition",

      "dialogueBox" : "src/interface/dialogueBox",
      "healthBar": "src/interface/healthBar",
      
      "switchProp": "src/props/switchProp",
      "triggerProp": "src/props/triggerProp",

      "particle": "src/effects/particle",
      "particleSystem": "src/effects/particleSystem",

      "actorController": "src/actors/actorController",
      "enemy": "src/actors/enemy",
      "player": "src/actors/player",

      "level": "src/levels/level",
      "levelParser": "src/levels/levelParser",
      "game": "src/game"
    }
});
  
requirejs(['point'], function() {

    requirejs(['gameObject', 'collisionBox', 'actorController', 'levelParser', 'particle', 'healthBar'], function() {

        requirejs(['tile', 'actor', 'attack', 'prop', 'transition', 'particleSystem', 'dialogueBox'], function() {

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