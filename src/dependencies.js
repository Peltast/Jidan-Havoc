require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {

      "point" : "src/gameObjects/point",
      "collisionBox" : "src/gameObjects/collisionBox",
      "gameObject" : "src/gameObjects/gameObject",
      "objectFactory": "src/gameObjects/objectFactory",

      "tile": "src/levels/tile",
      "actor": "src/actors/actor",
      "prop": "src/props/prop",
      "collectible": "src/props/collectible",
      "transition": "src/levels/transition",

      "mainMenu": "src/interface/mainMenu",
      "statsDisplay": "src/interface/statsDisplay",
      "dialogueBox": "src/interface/dialogueBox",
      "healthBar": "src/interface/healthBar",

      "particle": "src/effects/particle",
      "particleSystem": "src/effects/particleSystem",

      "actorController": "src/actors/actorController",
      "enemy": "src/actors/enemy",
      "enemyBehavior": "src/ai/enemyBehavior",
      "pacingBehavior": "src/ai/pacingBehavior",
      "player": "src/actors/player",

      "attack": "src/action/attack",
      "chargeAttack": "src/action/chargeAttack",

      "level": "src/levels/level",
      "levelParser": "src/levels/levelParser",
      "game": "src/game"
    }
});
  
requirejs(['point', 'mainMenu'], function() {

    requirejs(['gameObject', 'collisionBox', 'actorController', 'levelParser', 'particle', 'healthBar', 'statsDisplay', 'enemyBehavior'], function() {

        requirejs(['tile', 'actor', 'attack', 'prop', 'transition', 'particleSystem', 'dialogueBox', 'pacingBehavior',], function() {

            requirejs(['enemy', 'collectible', 'chargeAttack'], function() {

                requirejs(['player', 'objectFactory'], function() {

                    requirejs(['level'], function() {

                        requirejs(['game']);

                    });
                });
            });
        });
    });
});