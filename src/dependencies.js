require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    waitSeconds: 200,
    paths: {

      "point" : "src/gameObjects/point",
      "collisionBox" : "src/gameObjects/collisionBox",
      "gameObject" : "src/gameObjects/gameObject",
      "objectFactory": "src/gameObjects/objectFactory",

      "tile": "src/levels/tile",
      "actor": "src/actors/actor",
      "prop": "src/props/prop", 
      "parallaxProp": "src/props/parallaxProp", "reactiveProp": "src/props/reactiveProp",
      "collectible": "src/props/collectible", "transition": "src/levels/transition",

      "soundManager": "src/interface/soundManager",
      "menuItem": "src/interface/menuItem", "menuGrid": "src/interface/menuGrid",
      "mainMenu": "src/interface/mainMenu", "levelSelectMenu": "src/interface/levelSelectMenu", "levelEndMenu": "src/interface/levelEndMenu",
      "statsDisplay": "src/interface/statsDisplay",
      "dialogueBox": "src/interface/dialogueBox", "healthBar": "src/interface/healthBar",

      "particle": "src/effects/particle", "particleSystem": "src/effects/particleSystem",

      "actorController": "src/actors/actorController",
      "enemy": "src/actors/enemy", 
      "enemyBehavior": "src/ai/enemyBehavior", "pacingBehavior": "src/ai/pacingBehavior",
      "player": "src/actors/player",

      "attack": "src/action/attack", "chargeAttack": "src/action/chargeAttack",

      "level": "src/levels/level", "levelParser": "src/levels/levelParser",
      "game": "src/game"
    }
});
  
requirejs(['point', 'menuItem', 'menuGrid', 'soundManager'], function() {

    requirejs([
        'mainMenu', 'levelSelectMenu', 'levelEndMenu', 'gameObject', 'collisionBox', 'actorController',
        'levelParser', 'particle', 'healthBar', 'statsDisplay', 'enemyBehavior'], function() {

        requirejs(['tile', 'actor', 'prop', 'transition', 'particleSystem', 'dialogueBox', 'pacingBehavior'], function() {

            requirejs(['enemy', 'attack', 'collectible', 'parallaxProp', 'reactiveProp'], function() {

                requirejs(['objectFactory', 'chargeAttack'], function() {

                    requirejs(['player', 'level'], function() {

                        requirejs(['game']);

                    });
                });
            });
        });
    });
});