import { dialogueData, scaleFactor } from "./constants.js";
import { k } from "./kaboomCtx.js";
import { displayDialogue, setCamScale } from "./utils.js";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 940,
    "walk-down": { from: 940, to: 943, loop: true, speed: 8 },
    "idle-side": 979,
    "walk-side": { from: 979, to: 982, loop: true, speed: 8 },
    "idle-up": 1018,
    "walk-up": { from: 1018, to: 1021, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#a86434"));

// ============ DOM MENU ============
const menuEl = document.getElementById("menu");
const startBtn = document.getElementById("start-btn");
const portfolioBtn = document.getElementById("portfolio-btn");
const musicToggleBtn = document.getElementById("music-toggle");

const PORTFOLIO_URL = "https://ahmed-ben-abdallah-portfolio.github.io/";

// 🎵 Music state — created lazily on the first user gesture (autoplay policy)
let music = null;
let isMusicOn = true;

function startMusic() {
  if (!music) {
    music = k.play("background-music", { loop: true, volume: 0.5 });
  }
  music.paused = !isMusicOn;
}

musicToggleBtn.addEventListener("click", () => {
  isMusicOn = !isMusicOn;
  if (music) music.paused = !isMusicOn;
  musicToggleBtn.textContent = isMusicOn ? "🔊" : "🔇";
  musicToggleBtn.title = isMusicOn ? "Mute music" : "Unmute music";
});

// ✨ Twinkling starfield background
const starsContainer = document.querySelector(".menu-stars");
for (let i = 0; i < 70; i++) {
  const star = document.createElement("div");
  const variant = Math.random();
  star.className =
    "star" + (variant > 0.85 ? " star--accent" : variant > 0.7 ? " star--cyan" : "");
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.setProperty("--dur", `${2 + Math.random() * 4}s`);
  star.style.setProperty("--delay", `${Math.random() * 4}s`);
  starsContainer.appendChild(star);
}

// 🔓 Portfolio unlock (persists across visits once the game is completed)
function unlockPortfolioButton() {
  portfolioBtn.classList.remove("menu-btn--locked");
  portfolioBtn.classList.add("menu-btn--unlocked");
  portfolioBtn.textContent = "🌍 Portfolio (Unlocked!)";
}

if (localStorage.getItem("portfolioUnlocked") === "true") {
  unlockPortfolioButton();
}

portfolioBtn.addEventListener("click", () => {
  if (portfolioBtn.classList.contains("menu-btn--unlocked")) {
    window.open(PORTFOLIO_URL, "_blank");
  } else {
    portfolioBtn.classList.remove("shake");
    void portfolioBtn.offsetWidth; // restart the CSS animation
    portfolioBtn.classList.add("shake");
  }
});

// 🎧 Hover sound on menu buttons (silently ignored until audio is unlocked)
for (const btn of document.querySelectorAll("#menu .menu-btn")) {
  btn.addEventListener("mouseenter", () => {
    try {
      k.play("hover-sound", { volume: 0.3 });
    } catch (e) { /* audio not unlocked yet */ }
  });
}

startBtn.addEventListener("click", () => {
  menuEl.classList.add("menu--hidden");
  musicToggleBtn.classList.add("is-visible");
  startMusic();
  k.go("main");
});

k.scene("menu", () => {
  menuEl.classList.remove("menu--hidden");
  musicToggleBtn.classList.remove("is-visible");

  // 🔥 Google Analytics
  if (typeof gtag === "function") {
    gtag("event", "page_view", { page_path: "/menu" });
  }

  // 🔥 Local visit counter
  let visits = Number(localStorage.getItem("visits") || 0) + 1;
  localStorage.setItem("visits", visits);
  console.log(`🌍 Nombre total de visiteurs : ${visits}`);
});









k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
      interactions: 0, // Track interactions
      interactedObjects: new Set(), // Store unique objects interacted with
    },
    "player",
  ]);

  let newAreaBlocker = k.add([
    k.area({ shape: new k.Rect(k.vec2(0), 20, 20) }),
    k.body({ isStatic: true }),
    k.pos(192.73, 89.93), // Same as "new-area"
    "newarea-blocker",
  ]);

  let newAreaBoundary = null; // Store the boundary so we can remove it later

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        console.log("Boundary detected:", boundary.name); // Debugging
  
        const boundaryObject = map.add([
          k.area({ shape: new k.Rect(k.vec2(0), boundary.width, boundary.height) }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);
  
        if (boundary.name === "newarea") {
          newAreaBoundary = boundaryObject; // Store it for later removal
        }
  
        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            if (!player.isInDialogue) {
              player.isInDialogue = true;
              displayDialogue(dialogueData[boundary.name], () => {
                player.isInDialogue = false;
                if (!player.interactedObjects.has(boundary.name) && boundary.name !== "newarea") {
                  player.interactedObjects.add(boundary.name);
                  player.interactions = player.interactedObjects.size;
                
                  
                  k.play("interaction-sound"); // ✅ Play sound effect when interacting
                
                  console.log(`📌 Interactions: ${player.interactions}`);
                  
                  if (player.interactions >= 5 && newAreaBoundary) {
                    console.log("✅ Removing boundary, access granted!");
                
                    flashScreen(); // 🌟 Apply Flash Effect when unlocking the new area
                    newAreaBoundary.destroy();
                    newAreaBoundary = null;
                  }
                }
                
              });
            }
          });
        }
      }
    }
  
  
    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  k.onCollide("player", "newarea-blocker", () => {
    console.log(`🔍 Current Interactions: ${player.interactions}`); // Debugging

    if (player.interactions >= 5) {
        console.log("🎯 Un joueur a complété toutes les interactions !");

        // 🔥 Vérifier la récupération de localStorage
        let completions = localStorage.getItem("completions");
        console.log(`📦 Avant: Completions stockées: ${completions}`);

        completions = completions ? parseInt(completions) + 1 : 1;
        localStorage.setItem("completions", completions);

        console.log(`🏆 Après: Nombre total de joueurs ayant terminé: ${completions}`);

        // 🔥 Vérifier si gtag est défini avant de l'utiliser
        if (typeof gtag === "function") {
            console.log("📊 Envoi des données à Google Analytics...");
            gtag('event', 'game_complete', { 
                event_category: 'Game', 
                event_label: 'Utilisateur a complété les interactions' 
            });
        } else {
            console.warn("⚠️ gtag n'est pas défini !");
        }

        console.log("✅ Removing blocker, access granted!");
        localStorage.setItem("portfolioUnlocked", "true"); // 🔓 Unlock the menu portfolio button
        unlockPortfolioButton();
        newAreaBlocker.destroy(); // Remove the blocker
    } else {
        const remaining = 5 - player.interactions;
        console.warn(`❌ You need to interact with ${remaining} more items!`);
        player.moveTo(k.vec2(player.pos.x, player.pos.y - 20)); // Push back
    }
});


  setCamScale(k);
  k.onResize(() => setCamScale(k));

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);
    const lowerBound = 50;
    const upperBound = 125;

    if (mouseAngle > lowerBound && mouseAngle < upperBound) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (mouseAngle < -lowerBound && mouseAngle > -upperBound) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
    }
  });

  function stopAnims() {
    player.play(player.direction === "down" ? "idle-down" :
                player.direction === "up" ? "idle-up" : "idle-side");
  }

  k.onMouseRelease(stopAnims);
  k.onKeyRelease(stopAnims);

  k.onKeyDown(() => {
    if (player.isInDialogue) return;
    const keyMap = [k.isKeyDown("right"), k.isKeyDown("left"), k.isKeyDown("up"), k.isKeyDown("down")];
    if (keyMap.filter(Boolean).length > 1) return;

    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }
    if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }
    if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }
    if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
  function flashScreen() {
    k.play("door-sound"); // 🔊 Play door sound effect when unlocking new area
  
    const flash = k.add([
      k.rect(k.width(), k.height()),
      k.color(255, 255, 255),
      k.pos(0, 0),
      k.opacity(1),
      k.fixed(),
    ]);
  
    k.wait(0.1, () => {
      k.tween(1, 0, 1, (val) => (flash.opacity = val), k.easings.easeOutQuad);
    });
  
    k.shake(5);
  }
  
  
  function showMessage(text) {
    k.add([
      k.text(text, { size: 24 }),
      k.pos(player.pos.x, player.pos.y - 50),
      k.color(255, 0, 0),
      k.lifespan(2),
    ]);
  }
});



k.loadSound("background-music", "./sounds/background-music.mp3"); // Replace with your file path
k.loadSound("interaction-sound", "./sounds/interaction.mp3"); // Sound effect when interacting
k.loadSound("door-sound", "./sounds/door.mp3"); // Sound effect when interacting
k.loadSound("hover-sound", "./sounds/hover.mp3"); // Add a hover sound effect

k.go("menu");
