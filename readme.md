# Halloween Game

Jednoduchá klikací hra na motivy Halloweenu. Cílem je měnit duchy mezi "god" (anděl) a "devil" (ďábel) klikáním na ně. Hra sleduje poměr andělů a ďáblů, který je vizuálně zobrazen v dolní části obrazovky.

## Jak hrát

- Klikněte na tlačítko **Start Hry**.
- Na herním plátně se pohybují duchové.
- Kliknutím na ducha změníte jeho stav (anděl/ďábel).
- Cílem je udržet poměr ďáblů pod 75 % nebo nad 25 % pro vítězství.
- Hra končí, pokud poměr ďáblů překročí 75 % nebo klesne pod 25 %.

## Struktura projektu

```
index.html
audio/
images/
scripts/
    main.js
    sprite.js
style/
    styles.css
```

- `index.html` — hlavní HTML soubor s plátnem a menu.
- `scripts/main.js` — logika hry, inicializace, vykreslování, ovládání.
- `scripts/sprite.js` — třída pro duchy (sprite), animace a interakce.
- `style/styles.css` — styly pro vzhled hry.
- `audio/` — zvukové soubory.
- `images/` — obrázky a sprite sheet.

## Spuštění hry

1. Otevřete `index.html` v prohlížeči.
2. Po načtení assetů klikněte na **Start Hry**.
3. Hrajte klikáním na duchy.

## Poznámky ke kódu

- Hra je napsána v JavaScriptu bez externích knihoven.
- Rychlost duchů se postupně zvyšuje.
- Kód je rozdělen do dvou hlavních skriptů: [`main.js`](scripts/main.js) a [`sprite.js`](scripts/sprite.js).
- Pro úpravu animací nebo logiky upravte příslušné soubory ve složce `scripts/`.

## Autor

Roman Pausch - AppSmithery