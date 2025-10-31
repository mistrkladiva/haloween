class Sprite {
    constructor(ctx, image, x, y, frameWidth, frameHeight, animationData) {
        this.ctx = ctx; // Kontext canvasu
        this.image = image; // Načtený objekt Image (PNG)
        this.x = x;       // X pozice na canvasu
        this.y = y;       // Y pozice na canvasu
        this.w = frameWidth;   // Šířka jednoho rámečku (framu)
        this.h = frameHeight;  // Výška jednoho rámečku (framu)

        // Animace: 
        this.animationData = animationData; // Např. { walk: [{x: 0, y: 0}, {x: 48, y: 0}], idle: [...] }
        this.currentAnimation = 'idle';
        this.currentFrameIndex = 0;
        this.frameCounter = 0; // Pomocný čítač pro zpomalení animace (stagger)
        this.frameSpeed = 6;   // Zpomalení: Měň rámeček každých 5 updatů
        this.scale = 0.5;
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
        this.y -= 1.5;
        if (this.y <= 0)
            this.y = canvas.height;
    }

    draw() {
        const frame = this.animationData[this.currentAnimation][this.currentFrameIndex];

        // Vykreslení aktuálního rámečku (drawImage)
        // Používá drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
        this.ctx.drawImage(
            this.image,
            frame.x,          // sx: X-souřadnice na sprite sheetu
            frame.y,          // sy: Y-souřadnice na sprite sheetu
            this.w,           // sw: Šířka rámečku (výřezu)
            this.h,           // sh: Výška rámečku (výřezu)
            this.x,           // dx: X-pozice na canvasu
            this.y,           // dy: Y-pozice na canvasu
            this.w * this.scale,           // dw: Cílová šířka na canvasu
            this.h * this.scale            // dh: Cílová výška na canvasu
        );
    }

    // --- METODA PRO DETEKCI KOLIZE MYŠI (PIXEL-PERFECT) ---

    isClicked(mouseX, mouseY) {
        // 1. Rychlá kontrola ohraničujícího rámečku (bounding box)
        if (mouseX < this.x ||
            mouseX > this.x + this.w ||
            mouseY < this.y ||
            mouseY > this.y + this.h) {

            return false; // Myš je mimo hranice sprite
        }

        // Přepočet souřadnic myši na lokální pozici uvnitř sprite
        const localX = mouseX - this.x;
        const localY = mouseY - this.y;

        // Použití getImageData pro získání dat pixelu 1x1
        try {
            const pixelData = this.ctx.getImageData(this.x + localX, this.y + localY, 1, 1).data;
            const alpha = pixelData[3];
            return alpha > 0;
        } catch (e) {
            // Zde by nemělo dojít k chybě (CORS), pokud jsou obrázky na stejném serveru,
            // ale pro jistotu ji zachytíme.
            console.error("Chyba při kontrole pixelů:", e);
            return false;
        }
    }
}


const canvas = document.getElementById('canvas');
const parentCanvas = canvas.parentElement.getBoundingClientRect();
canvas.width = parentCanvas.width;
canvas.height = parentCanvas.height;

const ctx = canvas.getContext('2d', { willReadFrequently: true });

const spriteSheet = new Image();
const background = new Image();
spriteSheet.src = '/images/ghost-spritesheet-256.png';
background.src = '/images/game-bg.png';


spriteSheet.onload = () => {

    // 2. Definice animací a vytvoření instance
    const walkFrames = [
        { x: 0, y: 0 },
        { x: 1 * 256, y: 0 }, // Předpokládejme, že šířka framu je 48px
        { x: 2 * 256, y: 0 },
        { x: 3 * 256, y: 0 },
        { x: 4 * 256, y: 0 },
        { x: 5 * 256, y: 0 },

    ];
    const animations = {
        walk: walkFrames,
        idle: [{ x: 0, y: 0 }] // Může být jen jeden snímek
    };

    const playerSprite = new Sprite(ctx, spriteSheet, 100, 100, 256, 256, animations);
    const bgAspectRatio = canvas.width / background.width;
    const bgHeight = background.height * bgAspectRatio;

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        playerSprite.update();
        playerSprite.draw();

        ctx.drawImage(
            background, 0, 0, background.width, background.height,
            0, canvas.height - bgHeight, canvas.width, bgHeight);

        requestAnimationFrame(gameLoop);
    }
    gameLoop();


    // 4. Detekce kliknutí/pohybu myši
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
};