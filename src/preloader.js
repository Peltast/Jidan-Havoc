

const GameState = { "PRELOADING": 1, "PRELOADED": 2, "LOADING": 3, "LOADED": 4 };
const ButtonTypes = {"NULL" : 1, "NEWGAME": 2, "INSTRUCTIONS": 3, "SANDBOX": 10, "LOADLEVEL": 4 };

// Display variables
var stage;
var stageWidth;
var stageHeight;
var borderSize;
var tileSize;
var gameScale;

// Preloader variables
var soundRoot = "./lib/sounds/";
var imageRoot = "./lib/images/";
var dialogueRoot = "./data/dialogues/";
var imageManifest;
var soundManifest;
var assetLoader;

var dialogueList = [];
var mapList = [];
var tileList = [];

var assetsLoaded = 0;
var totalMapsLoaded = 0;
var totalMapsInGame = 0;
var totalFilesLoaded = 0;
var totalFilesInGame = 0;

var totalGameManifest;
var loadProgress = 0;
var gameStatus;

var startingMap;

// Asset variables
var dialogueLibrary = {};
var particleEffectLibrary = {};
var backgroundLibrary = {};

var actionLibrary = {};
var controllerData;
var hitBoxData;
var attackData;

var gameAssets = {};
var soundAssets = {};
var mapData = {};
var tileData = {};

// Game global variables
var gameWorld = {};
var player;
var currentLevel;
var objectFactory;
var levelSeriesMatrix;

// Global vars for relocating the player
var transition = null;
var currentCheckpoint = null;

// UI global vars
var currentMenu = null;
var mainMenu;
var levelSelectMenu;

var currentStatement = null;
var currentDialogue = null;
var gameStatsDisplay;
var gameScore;


$(function() { 
    init(); 
});

function init() {

    stage = new createjs.Stage("gameCanvas", { "antialias" : false });
    stageWidth = 640;
    stageHeight = 480;
    createjs.Ticker.framerate = 60;
    gameScale = 1;
    tileSize = 32;
    
    imageManifest = [
        {src: "tiles/CoreTileset.png", id: "CoreTileset"},
        {src: "tiles/World1Tiles.png", id: "World1"},

        {src: "actors/Player.png", id: "Player"},

        {src: "actors/SleepingEnemy.png", id: "SleepingEnemy"}, {src: "actors/ChasingEnemy.png", id: "ChasingEnemy"},
        {src: "actors/DustBunny.png", id: "DustBunny"}, {src: "actors/FlyingBat.png", id: "FlyingBat"}, {src: "actors/FloatingBug.png", id: "FloatingBug"},

        {src: "props/Jidan.png", id: "Jidan"}, {src: "props/Transition.png", id: "Transition"},
        
        {src: "props/JidanBit.png", id: "JidanBit"}, {src: "props/DamageStars.png", id: "DamageStars"},
        {src: "props/DustParticle.png", id: "DustParticle"}, {src: "props/DustParticle2.png", id: "DustParticle2"}, {src: "props/DirtParticle.png", id: "DirtParticle"},
        {src: "props/DashLinesH.png", id: "DashLinesH"}, {src: "props/DashLinesV.png", id: "DashLinesV"}, {src: "props/CancelLines.png", id: "CancelLines"},

        {src: "ui/MenuSplash.png", id: "MenuSplash"}, {src: "ui/MenuTitle.png", id: "MenuTitle"}, {src: "ui/MenuSandbox.png", id: "MenuSandbox"},
        {src: "ui/MenuPlay.png", id: "MenuPlay"}, {src: "ui/MenuInstructions.png", id: "MenuInstructions"},
        {src: "ui/PlayerInstructions.png", id: "PlayerInstructions"},

        {src: "ui/LevelSelectTile.png", id: "LevelSelectTile"}, {src: "ui/LevelSelectTileComplete.png", id: "LevelSelectTileComplete"}, {src: "ui/LevelSelectCollectible.png", id: "LevelSelectCollectible"},
        
        {src: "ui/CollectibleIcon.png", id: "CollectibleIcon"},
        
        {src: "ui/Cursor.png", id: "Cursor"},
        {src: "ui/HealthSlot.png", id: "HealthSlot"}, 
        {src: "ui/HealthPoint.png", id: "HealthPoint"},
    ];
    soundManifest = [
        {src: "Walk.wav", id: "Walk"}, {src: "Jump.wav", id: "Jump"}, {src: "DoubleJump.wav", id: "DoubleJump"}, {src: "Land.wav", id: "Land"},
        {src: "Windup.wav", id: "Windup"}, {src: "Attack.wav", id: "Attack"}, {src: "Hit.wav", id: "Hit"}, {src: "Death.wav", id: "Death"},
        {src: "Miss.wav", id: "Miss"}, {src: "StunFloor.wav", id: "StunFloor"}, {src: "StunWall.wav", id: "StunWall"}, 

        {src: "Combo1.wav", id: "Combo1"}, {src: "Combo2.wav", id: "Combo2"}, {src: "Combo3.wav", id: "Combo3"}, {src: "Combo4.wav", id: "Combo4"},
        {src: "ComboCancel.wav", id: "ComboCancel"},

        {src: "Collectible.wav", id: "Collectible"},

    ];

    mapList = [
        "DevRoom"
    ];
    tileList = [
        "World1"
    ];
    levelSeriesMatrix = [
        [1, 3],
        [2, 5],
        [3, 11]
    ];

    dialogueList = [];
    totalMapsInGame = mapList.length + 3 + 5;
    totalFilesInGame = dialogueList.length + tileList.length + 4; // actionData.json, dialogue.json, particleEffects.json, backgrounds.json
    startingMap = "Stage_3_1";

    totalGameManifest = imageManifest.length + soundManifest.length + totalFilesInGame + totalMapsInGame;

    assetLoader = new createjs.LoadQueue(false);
    assetLoader.addEventListener("complete", handleAssetsLoaded);
    loadSounds();
    assetLoader.loadManifest(imageManifest, true, imageRoot);
    
    gameCanvas.setAttribute("tabindex", "0");
    gameCanvas.addEventListener("mouseover", function(event) {
        gameCanvas.focus();
    }, false);
}


function finishedLoading() {
    return (
        (totalMapsLoaded >= totalMapsInGame) && 
        (totalFilesLoaded >= totalFilesInGame) && 
        (dialogueLibrary != null && particleEffectLibrary != null && backgroundLibrary != null) &&
        (assetsLoaded >= imageManifest.length + soundManifest.length)
    );
}

function handleAssetsLoaded(event) {
    for (let i = 0; i < imageManifest.length; i++) {
        console.log("Loaded asset: " + imageManifest[i].id);
        gameAssets[imageManifest[i].id] = assetLoader.getResult(imageManifest[i].id);
        assetsLoaded += 1;
    }
    
    for (let s = 0; s < levelSeriesMatrix.length; s++) {
        var series = levelSeriesMatrix[s];
        loadMapSeries(series[0], series[1]);
    }

    for (let j = 0; j < mapList.length; j++) {
        loadMap(mapList[j]);
    }
    for (let t = 0; t < tileList.length; t++) {
        loadTileset(tileList[t]);
    }

    loadFile("./data/actionData.json?v=", actionLibrary);
    loadFile("./data/particleEffects.json?v=", particleEffectLibrary);
    loadFile("./data/backgrounds.json?v=", backgroundLibrary);
    loadFile("./data/dialogue.json?v=", dialogueLibrary);
    for (let d = 0; d < dialogueList.length; d++) {
        loadFile(dialogueRoot + dialogueList[d], dialogueLibrary);
    }

}
function loadSounds() {
    for (let j = 0; j < soundManifest.length; j++) {
        soundAssets[soundManifest[j].id] = soundManifest[j].src + "?v=" + Math.round(1000 * Math.random(1000));
        var sound = new Howl({
            src: [soundRoot + soundAssets[soundManifest[j].id]],
            loop: true,
            volume: 0,
            stereo: 0
        });
        sound.once('load', function() {
            console.log("Loaded asset: " + soundManifest[j].src);
            assetsLoaded += 1;
        });
    }
}

function loadFile(filePath, fileLibrary) {
    $.getJSON(filePath + ".json?v=" +  (new Date()).getTime(), function(data) {
        Object.assign(fileLibrary, data);
        totalFilesLoaded += 1;
    })
    .fail(function() {
        totalFilesLoaded += 1;
        console.log(filePath + " failed to load"); 
    });
}
function loadMapSeries(seriesNum, numOfLevels) {
    for (var i = 1; i <= numOfLevels; i++) {
        var mapName = getLevelName(seriesNum, i);
        loadMap(mapName);
    }
}
function loadMap(mapName) {
    $.getJSON("./lib/maps/" + mapName + ".json?v=" +  (new Date()).getTime(), function(data) {
        totalMapsLoaded += 1;
        mapData[mapName] = data;
    })
    .fail(function() {
        totalMapsLoaded += 1;
        console.log(mapName + " failed to load"); 
    });
}
function loadTileset(tilesetName) {
    $.getJSON("./lib/tiles/" + tilesetName + ".json?v=" +  (new Date()).getTime(), function(data) {
        totalFilesLoaded += 1;
        tileData[tilesetName] = data;
    })
    .fail(function() {
        totalFilesLoaded += 1;
        console.log(tilesetName + " failed to load");
    });
}

function getLevelName(seriesNum, levelNum) {
    return "Stage_" + seriesNum + "_" + levelNum;
}
function getMapSeries(mapName) {
    if (mapName.indexOf("Stage_") == 0)
        return parseInt(mapName[6]);
}
function getMapLevel(mapName) {
    if (mapName.indexOf("Stage_") == 0)
        return parseInt(mapName[8]);
}