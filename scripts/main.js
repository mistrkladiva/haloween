class Sprite {
    constructor(ctx, image, x, y, frameWidth, frameHeight, animationData) {
        this.ctx = ctx; // Kontext hlavního canvasu
        this.image = image; // Načtený objekt Image (PNG)
        this.x = x;       // X pozice na canvasu
        this.y = y;       // Y pozice na canvasu
        this.w = frameWidth;   // Šířka jednoho rámečku (framu)
        this.h = frameHeight;  // Výška jednoho rámečku (framu)

        // Animace: 
        this.animationData = animationData; // Např. { walk: [{x: 0, y: 0}, {x: 48, y: 0}], idle: [...] }
        this.currentAnimation = 'walk';
        this.currentFrameIndex = 0;
        this.frameCounter = 0; // Pomocný čítač pro zpomalení animace (stagger)
        this.frameSpeed = 6;   // Zpomalení: Měň rámeček každých 5 updatů
        this.scale = 0.6;
        this.movespeed = 1.5;
        // Vypočítané skutečné rozměry na hlavním Canvasu
        this.scaledW = this.w * this.scale;
        this.scaledH = this.h * this.scale;

        // vlastní canvas
        this.mainCanvas = document.createElement('canvas');
        this.mainCanvas.width = this.w;
        this.mainCanvas.height = this.h;
        this.mainCtx = this.mainCanvas.getContext('2d', { willReadFrequently: true });
    }

    // --- METODY PRO ANIMACI A VYKRESLENÍ ---
    update() {
        // Kontroluje, zda je čas přejít na další rámeček animace
        this.frameCounter++;
        if (this.frameCounter >= this.frameSpeed) {
            this.frameCounter = 0;

            const frames = this.animationData[this.currentAnimation];
            this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
        }
        // Posun ducha nahoru
        this.y -= this.movespeed;
        if (this.y <= 0)
            this.y = canvas.height;
    }

    draw() {
        const frame = this.animationData[this.currentAnimation][this.currentFrameIndex];
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        // 1. Vykreslení aktuálního rámečku do vlastního canvasu
        this.mainCtx.drawImage(
            this.image,
            frame.x,            // sx: X-souřadnice na sprite sheetu
            frame.y,            // sy: Y-souřadnice na sprite sheetu
            this.w,             // sw: Šířka rámečku (výřezu)
            this.h,             // sh: Výška rámečku (výřezu)
            0,                  // dx: X-pozice na canvasu
            0,                  // dy: Y-pozice na canvasu
            this.w,             // dw: Cílová šířka na canvasu
            this.h              // dh: Cílová výška na canvasu
        );

        // 2. vykreslení vlastního canvasu do hlavního canvasu
        this.ctx.drawImage(
            this.mainCanvas,
            this.x - this.scaledW / 2,              // dx: Cílová X-pozice na mainCtx
            this.y,              // dy: Cílová Y-pozice na mainCtx
            this.scaledW,        // dw: Cílová šířka
            this.scaledH         // dh: Cílová výška
        );
    }

    // --- METODA PRO DETEKCI KOLIZE MYŠI (PIXEL-PERFECT) ---
    isClicked(mouseX, mouseY) {
        const startX = this.x - this.scaledW / 2;
        const endX = this.x + this.scaledW / 2;

        // 1. Rychlá kontrola ohraničujícího rámečku (Bounding Box)
        if (mouseX < startX ||
            mouseX > endX ||
            mouseY < this.y ||
            mouseY > this.y + this.scaledH) {
            return false;
        }

        // 2. Přepočet souřadnic myši na LOKÁLNÍ souřadnice UVNITŘ off-screen Canvasu (1:1)
        const localX = Math.floor((mouseX - startX) / this.scale);
        const localY = Math.floor((mouseY - this.y) / this.scale);

        // 3. Kontrola alfa kanálu na off-screen Canvasu (Pixel-Perfect)
        try {
            // Kontrolujeme off-screen kontext, který má čistý obrázek 1:1
            const pixelData = this.mainCtx.getImageData(localX, localY, 1, 1).data;
            const alpha = pixelData[3];
            return alpha > 0;
        } catch (e) {
            console.error("Chyba při kontrole pixelů (CORS problém?):", e);
            return false;
        }
    }
}


const canvas = document.getElementById('game-canvas');
const parentCanvas = canvas.parentElement.getBoundingClientRect();
canvas.width = parentCanvas.width;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

let playerSprite;
let bgHeight;
let mousePosition = { x: 0, y: 0 };

let imagesToLoad = 2; // Počet obrázků k načtení
function imageLoaded() {
    imagesToLoad--;
    if (imagesToLoad === 0) {
        console.log("VŠECHNY OBRÁZKY JSOU ÚSPĚŠNĚ NAČTENY!");
        initGame();
    }
}

const spriteSheet = new Image();
const background = new Image();
spriteSheet.src = '/images/ghost-spritesheet-256.png';
background.src = '/images/game-bg.png';

spriteSheet.onload = imageLoaded;
background.onload = imageLoaded;

function initGame() {
    bgHeight = background.height * (canvas.width / background.width);

    const walkFrames = [
        { x: 0, y: 0 },
        { x: 1 * 256, y: 0 },
        { x: 2 * 256, y: 0 },
        { x: 3 * 256, y: 0 },
        { x: 4 * 256, y: 0 },
        { x: 5 * 256, y: 0 },

    ];

    const animations = {
        walk: walkFrames,
        idle: [{ x: 0, y: 0 }] // Může být jen jeden snímek
    };

    playerSprite = new Sprite(ctx, spriteSheet, spriteVerticalPosition(0.25), 500, 256, 256, animations);

    canvas.addEventListener('mousemove', (e) => {

        const rect = canvas.getBoundingClientRect();
        mousePosition.x = e.clientX - rect.left;
        mousePosition.y = e.clientY - rect.top;
    })

    // Detekce kliknutí na sprite ducha
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (playerSprite.isClicked(mouseX, mouseY)) {
            console.log("KLIKNUTO na neprůhlednou část sprite!");
            playerSprite.currentAnimation = 'walk'; // Změna stavu animace
        } else {
            console.log("Kliknuto mimo sprite nebo na průhlednou část.");
        }
    });

    gameLoop();
}

function drawTarget() {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.arc(mousePosition.x, mousePosition.y, 10, 0, Math.PI * 2);
    ctx.stroke();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    playerSprite.update();
    playerSprite.draw();

    ctx.drawImage(
        background, 0, 0, background.width, background.height,
        0, canvas.height - bgHeight, canvas.width, bgHeight);

    drawTarget();

    requestAnimationFrame(gameLoop);
}

function spriteVerticalPosition(t) {
    const newPosition = 0 + (canvas.width - 0) * t;
    return newPosition;
}