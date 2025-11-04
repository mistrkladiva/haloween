const canvas = document.getElementById('game-canvas');
const parentCanvas = canvas.parentElement.getBoundingClientRect();
canvas.width = parentCanvas.width;
canvas.height = window.innerHeight;
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext('2d');
const btnStart = document.getElementById('btnStart');
const menuContainer = document.getElementById('menu-container');

btnStart.onclick = () => {
    menuContainer.style.display = "none";
    initGame();
}

if (!canvas || !btnStart || !menuContainer) {
    console.error("Některý DOM element nebyl nalezen.");
    btnStart.disabled = true;
}

// event událostí podle zařízení
if (!detectTouchscreen()) {
    canvas.addEventListener('click', (e) => {
        e.preventDefault();
        mousePosition.x = e.clientX - rect.left;
        mousePosition.y = e.clientY - rect.top;
        mousePosition.clicked = true;

    });
}
else {
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches && e.touches.length > 0) {
            mousePosition.x = e.touches[0].clientX - rect.left;
            mousePosition.y = e.touches[0].clientY - rect.top;
            mousePosition.clicked = true;
        }
    });
}

// herní proměnné
let ghostsStatistic;

// sprite proměnné
let enemySprites = [];
let enemySlotsTable = [];
let speedMultipiler;
let speedInterval;

// pomocné proměnné
let bgHeight;
let mousePosition = { x: 0, y: 0, clicked: false };

// načítání assetů (možno dotvořit ukazatel)
let assetsToLoad = 5;
function imageLoaded() {
    assetsToLoad--;
    if (assetsToLoad === 0) {
        console.log("All assets is loaded");
        btnStart.disabled = false;
    }
}

const ghostSpritesheet = new Image();
const sky = new Image();
const foreground = new Image();
const gameMusic = new Audio()
const spell = new Audio()

ghostSpritesheet.src = './images/ghost-complete-spritesheet-256.png';
sky.src = './images/game-sky.png';
foreground.src = './images/game-bg.png';
gameMusic.src = './audio/haunted-laughter-parade.mp3';
gameMusic.loop = true;
spell.src = './audio/spell.mp3'

ghostSpritesheet.onload = imageLoaded;
sky.onload = imageLoaded;
foreground.onload = imageLoaded;
gameMusic.oncanplay = imageLoaded;
spell.oncanplay = imageLoaded;

function initGame() {

    ghostsStatistic = {
        ghostSum: 30,
        ghostGods: 3,
        ghostDevils: 25,
        getDevilPercent: function () { return this.ghostDevils / this.ghostSum }
    };

    enemySlotsTable = [
        { id: 0, xPos: vericalInterpolation(0, canvas.width, 0.12), used: false },
        { id: 1, xPos: vericalInterpolation(0, canvas.width, 0.35), used: false },
        { id: 2, xPos: vericalInterpolation(0, canvas.width, 0.66), used: false },
        { id: 3, xPos: vericalInterpolation(0, canvas.width, 0.9), used: false }
    ];

    const animations = {
        godAnimation: [
            { x: 0, y: 0 },
            { x: 1 * 256, y: 0 },
            { x: 2 * 256, y: 0 },
            { x: 3 * 256, y: 0 },
            { x: 4 * 256, y: 0 },
            { x: 5 * 256, y: 0 },
            { x: 6 * 256, y: 0 },
            { x: 7 * 256, y: 0 },
        ],
        devilAnimation: [
            { x: 0, y: 256 },
            { x: 1 * 256, y: 256 },
            { x: 2 * 256, y: 256 },
            { x: 3 * 256, y: 256 },
            { x: 4 * 256, y: 256 },
            { x: 5 * 256, y: 256 },
            { x: 6 * 256, y: 256 },
            { x: 7 * 256, y: 256 },
        ]
    };

    bgHeight = foreground.height * (canvas.width / foreground.width);

    speedMultipiler = 1.2;
    speedInterval = setInterval(() => {
        speedMultipiler *= 1.2;
    }, 10000);

    enemySprites = [];
    for (let index = 0; index < enemySlotsTable.length; index++) {
        enemySprites.push(new Sprite(ctx, ghostSpritesheet, 256, 256, enemySlotsTable, animations, ghostsStatistic));
    }

    gameMusic.play();
    gameLoop();
}

// 1. If Pointer Events are supported, it will just check the navigator.maxTouchPoints property
// 2. If Pointer Events are not supported, it checks the any-pointer:coarse interaction media feature using window.matchMedia.
// 3. Check for Touch Events support
function detectTouchscreen() {
    var result = false;
    if (window.PointerEvent && ('maxTouchPoints' in navigator)) {
        // if Pointer Events are supported, just check maxTouchPoints
        if (navigator.maxTouchPoints > 0) {
            result = true;
        }
    } else {
        // no Pointer Events...
        if (window.matchMedia && window.matchMedia("(any-pointer:coarse)").matches) {
            // check for any-pointer:coarse which mostly means touchscreen
            result = true;
        } else if (window.TouchEvent || ('ontouchstart' in window)) {
            // last resort - check for exposed touch events API / event handler
            result = true;
        }
    }
    return result;
}

function drawInfo(text, color) {

    menuContainer.style.display = "flex";
    clearInterval(speedInterval);

    const fontSize = 28;
    ctx.font = `${fontSize}px arial`;

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    const textPosition = {
        x: canvas.width / 2,
        y: canvas.height / 2 - 100
    }

    const bgRectangleOffset = 20;
    const bgRectangle = {
        x: textPosition.x - textWidth / 2 - bgRectangleOffset,
        y: textPosition.y - fontSize / 2 - bgRectangleOffset,
        width: textWidth + 2 * bgRectangleOffset,
        height: fontSize + 2 * bgRectangleOffset
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(bgRectangle.x, bgRectangle.y, bgRectangle.width, bgRectangle.height, 10);
    ctx.fill();

    ctx.fillStyle = "rgba(213, 213, 213, 1)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.beginPath();
    ctx.fillText(text, textPosition.x, textPosition.y);
}

function drawScoreBar() {
    const bartWidth = 250;
    const barWidthHalf = bartWidth / 2;

    const bar = {
        x: canvas.width / 2 - barWidthHalf,
        y: canvas.height - 60,
        width: bartWidth,
        height: 25
    }

    let devilBarWidth = vericalInterpolation(0, bar.width, ghostsStatistic.getDevilPercent());

    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.roundRect(bar.x, bar.y, bar.width, bar.height, 5);
    ctx.fill();

    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bar.x, bar.y, devilBarWidth, bar.height, 5);
    ctx.stroke();
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vericalInterpolation(bar.x, bar.x + bar.width, 0.25), bar.y);
    ctx.lineTo(vericalInterpolation(bar.x, bar.x + bar.width, 0.25), bar.y + bar.height);
    ctx.moveTo(vericalInterpolation(bar.x, bar.x + bar.width, 0.75), bar.y);
    ctx.lineTo(vericalInterpolation(bar.x, bar.x + bar.width, 0.75), bar.y + bar.height);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(vericalInterpolation(bar.x, bar.x + bar.width, 0.5), bar.y);
    ctx.lineTo(vericalInterpolation(bar.x, bar.x + bar.width, 0.5), bar.y + bar.height);
    ctx.stroke();
}

function checkHit() {
    for (const enemy of enemySprites) {
        enemy.isClicked(mousePosition.x, mousePosition.y);
    }
    mousePosition.clicked = false;
}

function gameLoop() {

    if (ghostsStatistic.getDevilPercent() >= 0.75) {
        drawInfo("Nebe teď ovládá peklo!", "rgba(255, 0, 0, 0.8)");
        return;
    }

    if (ghostsStatistic.getDevilPercent() <= 0.25) {
        drawInfo("V nebi je klid a mír.", "rgba(0, 255, 0, 0.8)");
        return;
    }

    if (mousePosition.clicked) {
        checkHit();
    }
    else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        enemySprites.forEach(enemy => {
            enemy.update();
            enemy.draw();
        });

        ctx.drawImage(
            foreground, 0, 0, foreground.width, foreground.height,
            0, canvas.height - bgHeight, canvas.width, bgHeight);

        ctx.drawImage(
            sky, 0, 0, sky.width, sky.height,
            0, -40, canvas.width, sky.height * (canvas.width / sky.width));

        drawScoreBar();
    }
    requestAnimationFrame(gameLoop);
}

// interpolace
function vericalInterpolation(x1, x2, t) {
    return x1 + (x2 - x1) * t;
}