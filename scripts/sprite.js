class Sprite {
    constructor(ctx, image, vertPositionTable, y, frameWidth, frameHeight, animationData) {
        this.ctx = ctx;
        this.image = image;

        this.xPosTable;
        this.xPosObject;
        this.xPosId;
        this.x;

        this.y = y;       // Y pozice na hlavním canvasu
        this.w = frameWidth;   // Šířka jednoho rámečku (framu)
        this.h = frameHeight;  // Výška jednoho rámečku (framu)

        // Animace: 
        this.animationData = animationData; // Např. { walk: [{x: 0, y: 0}, {x: 48, y: 0}], idle: [...] }
        this.currentAnimation = 'walk';
        this.currentFrameIndex;
        this.frameCounter; // Pomocný čítač pro zpomalení animace (stagger)
        this.frameSpeed = 6;   // Zpomalení: Měň rámeček každých 5 updatů
        this.scale;
        this.movespeed;

        this.scaledW;
        this.scaledH;

        // vlastní canvas
        this.mainCanvas = document.createElement('canvas');
        this.mainCanvas.width = this.w;
        this.mainCanvas.height = this.h;
        this.mainCtx = this.mainCanvas.getContext('2d', { willReadFrequently: true });

        this.spriteStatus = {
            isAlive: true,
            isDevil: false
        }

        this.rebornSprite();
    }

    rebornSprite() {
        this.scale = Math.random() * (0.5 - 0.3) + 0.3;
        this.movespeed = Math.random() * (3 - 1.2) + 1.2;

        this.scaledW = this.w * this.scale;
        this.scaledH = this.h * this.scale;

        this.xPosTable = enemySpritesTable.filter(x => x.used === false);
        if (this.xPosTable.length <= 0) {
            return;
        }

        this.xPosObject = this.xPosTable[Math.floor(Math.random() * this.xPosTable.length)];
        this.xPosId = this.xPosObject.id;
        this.x = this.xPosObject.xPos;
        enemySpritesTable.find(x => x.id === this.xPosId).used = true;

        this.currentFrameIndex = 0;
        this.frameCounter = 0;

        // náhodný váběr god/devil
        this.spriteStatus.isDevil = Math.random() >= 0.75 ? true : false;
        this.hitSprite();
    }

    // --- METODY PRO ANIMACI A VYKRESLENÍ ---
    update() {
        // Kontroluje, zda je čas přejít na další rámeček animace
        if (!this.spriteStatus.isAlive) return;

        this.frameCounter++;
        if (this.frameCounter >= this.frameSpeed) {
            this.frameCounter = 0;

            const frames = this.animationData[this.currentAnimation];
            this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
        }
        // Posun ducha nahoru
        this.y -= this.movespeed;
        if (this.y <= 0) {
            this.y = canvas.height - bgHeight;
            enemySpritesTable.find(x => x.id === this.xPosId).used = false;
            this.rebornSprite();
        }
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

    hitSprite() {

        if (this.spriteStatus.isDevil) {
            this.image = spriteSheetDevil;
        }
        else {
            this.image = spriteSheet;
        }
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