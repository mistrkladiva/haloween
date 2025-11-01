const canvas = document.getElementById('game-canvas');
const parentCanvas = canvas.parentElement.getBoundingClientRect();
canvas.width = parentCanvas.width;
canvas.height = window.innerHeight;
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext('2d');

let playerSprite;
let enemySprites = [];
const enemySpritesTable = [
    { id: 0, xPos: spriteVerticalPosition(0.12), used: false },
    { id: 1, xPos: spriteVerticalPosition(0.35), used: false },
    { id: 2, xPos: spriteVerticalPosition(0.66), used: false },
    { id: 3, xPos: spriteVerticalPosition(0.9), used: false }];

let bgHeight;
let mousePosition = { x: 0, y: 0, clicked: false };

//let score = 0;
let ghosts = { ghostSum: 0, ghostGods: 2, ghostDevils: 2 };

let imagesToLoad = 4;
function imageLoaded() {
    imagesToLoad--;
    if (imagesToLoad === 0) {
        //console.log("VŠECHNY OBRÁZKY JSOU ÚSPĚŠNĚ NAČTENY!");
        //initGame();
    }
}

const spriteSheetGod = new Image();
const spriteSheetDevil = new Image();
const sky = new Image();
const foreground = new Image();

spriteSheetGod.src = '/images/ghost-spritesheet-256.png';
spriteSheetDevil.src = '/images/ghost-devil-spritesheet-256.png';
sky.src = '/images/game-sky.png';
foreground.src = '/images/game-bg.png';

spriteSheetGod.onload = imageLoaded;
spriteSheetDevil.onload = imageLoaded;
sky.onload = imageLoaded;
foreground.onload = imageLoaded;

function initGame() {
    bgHeight = foreground.height * (canvas.width / foreground.width);

    const walkFrames = [
        { x: 0, y: 0 },
        { x: 1 * 256, y: 0 },
        { x: 2 * 256, y: 0 },
        { x: 3 * 256, y: 0 },
        { x: 4 * 256, y: 0 },
        { x: 5 * 256, y: 0 },
        { x: 6 * 256, y: 0 },
        { x: 1 * 256, y: 0 },
    ];

    const animations = {
        walk: walkFrames,
        idle: [{ x: 0, y: 0 }] // Může být jen jeden snímek
    };

    for (let index = 0; index < enemySpritesTable.length; index++) {
        enemySprites.push(new Sprite(ctx, spriteSheetGod, 256, 256, animations));
    }

    // Detekce kliknutí na sprite ducha
    canvas.addEventListener('click', (e) => {
        e.preventDefault();
        mousePosition.x = e.clientX - rect.left;
        mousePosition.y = e.clientY - rect.top;
        mousePosition.clicked = true;
    });

    gameLoop();
}

// function drawScore() {
//     ctx.font = "28px arial";
//     ctx.fillStyle = "red";
//     ctx.textAlign = "center";
//     ctx.fillText(`score: ${score}`, canvas.width / 2, canvas.height - 30);
// }

function drawScoreBar() {
    const bartWidth = 250;
    const barWidthHalf = bartWidth / 2;

    const bar = {
        x: canvas.width / 2 - barWidthHalf,
        y: canvas.height - 60,
        width: bartWidth,
        height: 25
    }
    const devilPercent = ghosts.ghostDevils / ghosts.ghostSum;

    let devilBarWidth = vericalInterpolation(0, bar.width, devilPercent);

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
        if (enemy.isClicked(mousePosition.x, mousePosition.y)) {
            console.log("KLIKNUTO na neprůhlednou část sprite!");
            enemy.spriteStatus.isDevil = !enemy.spriteStatus.isDevil;
            enemy.hitSprite();
            break;
        }
    }
    mousePosition.clicked = false;
}

function gameLoop() {
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

        //drawScore();
        drawScoreBar();
    }

    requestAnimationFrame(gameLoop);
}

// interpolace na šířku canvasu
function spriteVerticalPosition(t) {
    const newPosition = 0 + (canvas.width - 0) * t;
    return newPosition;
}
function vericalInterpolation(x1, x2, t) {
    return x1 + (x2 - x1) * t;
}