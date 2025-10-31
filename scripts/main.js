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

let imagesToLoad = 3;
function imageLoaded() {
    imagesToLoad--;
    if (imagesToLoad === 0) {
        //console.log("VŠECHNY OBRÁZKY JSOU ÚSPĚŠNĚ NAČTENY!");
        initGame();
    }
}

const spriteSheet = new Image();
const foreground = new Image();
const spriteSheetDevil = new Image();

spriteSheet.src = '/images/ghost-spritesheet-256.png';
spriteSheetDevil.src = '/images/ghost-devil-spritesheet-256.png';
foreground.src = '/images/game-bg.png';

spriteSheet.onload = imageLoaded;
spriteSheetDevil.onload = imageLoaded;
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
    ];

    const animations = {
        walk: walkFrames,
        idle: [{ x: 0, y: 0 }] // Může být jen jeden snímek
    };

    for (let index = 0; index < enemySpritesTable.length; index++) {
        enemySprites.push(new Sprite(ctx, spriteSheet, enemySpritesTable, 500, 256, 256, animations));
    }

    // canvas.addEventListener('mousemove', (e) => {
    //     const rect = canvas.getBoundingClientRect();
    //     mousePosition.x = e.clientX - rect.left;
    //     mousePosition.y = e.clientY - rect.top;
    // })

    // Detekce kliknutí na sprite ducha
    // canvas.addEventListener('click', (e) => {
    //     //e.preventDefault();
    //     const rect = canvas.getBoundingClientRect();
    //     const mouseX = e.clientX - rect.left;
    //     const mouseY = e.clientY - rect.top;

    //     enemySprites.forEach(enemy => {
    //         if (enemy.isClicked(mouseX, mouseY)) {
    //             console.log("KLIKNUTO na neprůhlednou část sprite!");
    //             enemy.spriteStatus.isDevil = !enemy.spriteStatus.isDevil;
    //             enemy.hitSprite();
    //             return;
    //         }
    //     });
    // });

    // Detekce kliknutí na sprite ducha
    canvas.addEventListener('click', (e) => {
        e.preventDefault();
        mousePosition.x = e.clientX - rect.left;
        mousePosition.y = e.clientY - rect.top;
        mousePosition.clicked = true;
    });

    gameLoop();
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
    }

    requestAnimationFrame(gameLoop);
}

// interpolace na šířku canvasu
function spriteVerticalPosition(t) {
    const newPosition = 0 + (canvas.width - 0) * t;
    return newPosition;
}