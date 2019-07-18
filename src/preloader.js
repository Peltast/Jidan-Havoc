
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

var mainMenu;
var gameStarted = false;
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
var mapData = {};
var tileData = {};

// Game global variables
var gameWorld = {};
var player;
var currentLevel;
var objectFactory;

// Global vars for relocating the player
var transition = null;
var currentCheckpoint = null;

// UI global vars
var currentStatement = null;
var currentDialogue = null;
var healthBar;


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

        {src: "ui/MenuSplash.png", id: "MenuSplash"}, {src: "ui/MenuTitle.png", id: "MenuTitle"}, {src: "ui/MenuSandbox.png", id: "MenuSandbox"},
        {src: "ui/MenuPlay.png", id: "MenuPlay"}, {src: "ui/MenuInstructions.png", id: "MenuInstructions"},
        {src: "ui/PlayerInstructions.png", id: "PlayerInstructions"},
        
        {src: "ui/Cursor.png", id: "Cursor"},
        {src: "ui/HealthSlot.png", id: "HealthSlot"}, 
        {src: "ui/HealthPoint.png", id: "HealthPoint"},
    ];
    soundManifest = [
        {src: "ping1.mp3", id: "ping1"},
        {src: "ping2.mp3", id: "ping2"},
        {src: "ping3.mp3", id: "ping3"},
        {src: "ping4.mp3", id: "ping4"},
        {src: "ping5.mp3", id: "ping5"},
        {src: "ping6.mp3", id: "ping6"}
    ];

    mapList = [
        "DevRoom"
    ];
    tileList = [
        "World1"
    ];
    dialogueList = [];

    totalMapsInGame = mapList.length;
    totalFilesInGame = dialogueList.length + tileList.length + 4; // actionData.json, dialogue.json, particleEffects.json, backgrounds.json
    startingMap = "DevRoom";

    totalGameManifest = imageManifest.length + soundManifest.length + totalFilesInGame;

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
    
    loadFile("./data/actionData.json?v=", actionLibrary);
    loadFile("./data/particleEffects.json?v=", particleEffectLibrary);
    loadFile("./data/backgrounds.json?v=", backgroundLibrary);
    loadFile("./data/dialogue.json?v=", dialogueLibrary);
    for (let d = 0; d < dialogueList.length; d++) {
        loadFile(dialogueRoot + dialogueList[d], dialogueLibrary);
    }

    for (let t = 0; t < tileList.length; t++) {
        loadTileset(tileList[t]);
    }
    for (let j = 0; j < mapList.length; j++) {
        loadMap(mapList[j]);
    }

}
function loadSounds() {
    for (let j = 0; j < soundManifest.length; j++) {
        var sound = new Howl({
            src: [soundRoot + soundManifest[j].src],
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
