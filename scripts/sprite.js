class Sprite {
    constructor(ctx, spritesheet, frameWidth, frameHeight, enemySlotsTable, animationData, ghostsStatistic) {

        this.enemySlotsTable = enemySlotsTable; // tabulka slotů pro sprite (umístění x, volný pro znovuzrození)
        this.enemySlotsTableFree;               // filtrovaná tabulka volných slotů
        this.enemySlot;                         // náhodně vybraný slot
        this.enemySlotId;                       // id vybraného slotu

        // Pozice a rozměry vlastního canvasu
        this.x;                                 // X pozice na hlavním canvasu
        this.y;                                 // Y pozice na hlavním canvasu
        this.w = frameWidth;                    // Šířka jednoho rámečku (framu)
        this.h = frameHeight;                   // Výška jednoho rámečku (framu)

        this.scale;                             // měřítko pro vykreslení na hlavní canvas
        this.scaledW;                           // šířka rámu po aplikování měřítka
        this.scaledH;                           // výška rámu po aplikování měřítka

        // Animace:
        this.spritesheet = spritesheet;
        this.animationData = animationData;
        this.currentAnimation = 'godAnimation';
        this.currentFrameIndex;
        this.frameCounter;                      // Pomocný čítač pro zpomalení animace (stagger)
        this.frameSpeed = 6;                    // Zpomalení: Měň rámeček každých 5 updatů

        this.movespeed;                         // Rychlost posunu nahoru

        // hlavní canvas
        this.ctx = ctx;
        // vlastní canvas
        this.mainCanvas = document.createElement('canvas');
        this.mainCanvas.width = this.w;
        this.mainCanvas.height = this.h;
        this.mainCtx = this.mainCanvas.getContext('2d', { willReadFrequently: true });

        this.spriteStatus = { isDevil: false };
        this.ghostsStatistic = ghostsStatistic; // globální statistiky pro zápis skore

        this.rebornSprite();
    }

    rebornSprite() {
        // přičti ducha jakmile je znovuzrozen
        this.ghostsStatistic.ghostSum++;
        // vypočítej nové měřítko
        this.scale = Math.random() * (0.5 - 0.3) + 0.3;
        this.scaledW = Math.floor(this.w * this.scale);
        this.scaledH = Math.floor(this.h * this.scale);
        // nastav rychlostu posunu nahoru
        let moveSpeedMin = 1.2 * speedMultipiler;
        let moveSpeedMax = 3 * speedMultipiler;
        this.movespeed = Math.random() * (moveSpeedMax - moveSpeedMin) + moveSpeedMin;
        // vyfiltruj volné sloty
        this.enemySlotsTableFree = this.enemySlotsTable.filter(x => x.used === false);
        if (this.enemySlotsTableFree.length <= 0) {
            return;
        }
        // vyber jeden náhodný volný slot a ulož jeho id pro možnost uvolnění slotu
        // nastav slot jako použitý a nastav X souřadnice
        this.enemySlot = this.enemySlotsTableFree[Math.floor(Math.random() * this.enemySlotsTableFree.length)];
        this.enemySlot.used = true;
        this.enemySlotId = this.enemySlot.id;

        this.x = this.enemySlot.xPos;
        this.y = canvas.height - bgHeight;

        this.currentFrameIndex = 0;
        this.frameCounter = 0;

        // náhodný výběr god/devil 15% že bude god
        this.spriteStatus.isDevil = Math.random() >= 0.15 ? true : false;
        this.hitSprite();
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

        // Posun ducha nahoru a kontrola, jestli je nad canvasem
        this.y -= this.movespeed;
        if (this.y <= -50) {
            this.y = canvas.height - bgHeight;
            this.enemySlotsTable.find(x => x.id === this.enemySlotId).used = false;
            if (!this.spriteStatus.isDevil) {
                this.ghostsStatistic.ghostGods++;
            } else {
                this.ghostsStatistic.ghostDevils++;
            }
            this.rebornSprite();
        }
    }

    draw() {
        const frame = this.animationData[this.currentAnimation][this.currentFrameIndex];
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        // 1. Vykreslení aktuálního rámečku do vlastního canvasu
        this.mainCtx.drawImage(
            this.spritesheet,
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
            this.x - this.scaledW / 2,      // dx: Cílová X-pozice na hlavním canvasu od středu
            this.y,                         // dy: Cílová Y-pozice na mainCtx
            this.scaledW,                   // dw: Cílová šířka
            this.scaledH                    // dh: Cílová výška
        );
    }

    hitSprite() {
        if (this.spriteStatus.isDevil) {
            this.currentAnimation = "devilAnimation";
        }
        else {
            this.currentAnimation = "godAnimation"
        }
    }

    // --- METODA PRO DETEKCI KOLIZE MYŠI ---
    isClicked(mouseX, mouseY) {
        const startX = Math.floor(this.x - this.scaledW / 2);
        const endX = Math.floor(this.x + this.scaledW / 2);

        // pokud není klik nad rámečkem sprite return;
        if (mouseX < startX ||
            mouseX > endX ||
            mouseY < this.y ||
            mouseY > this.y + this.scaledH) {
            return;
        }

        this.spriteStatus.isDevil = !this.spriteStatus.isDevil;
        this.hitSprite();
    }
}