import { dialogueData, scaleFactor } from "./constants.js";
import { k } from "./kaboomCtx.js";
import { displayDialogue, setCamScale } from "./utils.js";
import { createLiquidEther } from "./liquidEther.js";

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

// 🌊 Liquid fluid background (WebGL) — skipped for reduced-motion users
let liquidEther = null;
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  try {
    liquidEther = createLiquidEther(document.querySelector(".menu-bg"), {
      colors: ["#5227FF", "#FF9FFC", "#B497CF"],
      mouseForce: 20,
      cursorSize: 100,
      isViscous: true,
      viscous: 30,
      iterationsViscous: 32,
      iterationsPoisson: 32,
      resolution: 0.5,
      isBounce: false,
      autoDemo: true,
      autoSpeed: 0.5,
      autoIntensity: 2.2,
      takeoverDuration: 0.25,
      autoResumeDelay: 3000,
      autoRampDuration: 0.6,
    });
  } catch (e) {
    console.warn("Liquid background unavailable, keeping gradient:", e);
  }
}

// 🔥 Local visit count + analytics (once per page load, not per menu visit)
const visits = Number(localStorage.getItem("visits") || 0) + 1;
localStorage.setItem("visits", visits);
console.log(`🌍 Nombre total de visiteurs : ${visits}`);
if (typeof gtag === "function") {
  gtag("event", "page_view", { page_path: "/menu" });
}

// 🌍 Global visitor counter — falls back to the local count if the API is down
const visitorCount = document.getElementById("visitor-count");
fetch("https://abacus.jasoncameron.dev/hit/ahmedbenabdallah29435.github.io/visits")
  .then((res) => res.json())
  .then((data) => {
    visitorCount.textContent = data.value;
  })
  .catch(() => {
    visitorCount.textContent = visits;
  });

document.getElementById("copyright-year").textContent = new Date().getFullYear();

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

const backToMenuBtn = document.getElementById("back-to-menu");
let gameStarted = false;

startBtn.addEventListener("click", () => {
  menuEl.classList.add("menu--hidden");
  musicToggleBtn.classList.add("is-visible");
  backToMenuBtn.classList.add("is-visible");
  if (liquidEther) liquidEther.pause(); // don't burn GPU behind the game

  if (!gameStarted) {
    gameStarted = true;
    startMusic();
    k.go("main");
  } else {
    k.debug.paused = false; // resume the frozen game — audio comes back with it
  }
});

backToMenuBtn.addEventListener("click", () => {
  document.getElementById("close").click(); // close any open dialogue cleanly
  k.debug.paused = true; // freezes the game loop and suspends all audio
  startBtn.textContent = "▶ Resume Adventure";
  menuEl.classList.remove("menu--hidden");
  backToMenuBtn.classList.remove("is-visible");
  musicToggleBtn.classList.remove("is-visible");
  if (liquidEther) liquidEther.start();
});

k.scene("menu", () => {
  // Boot scene — the DOM menu overlay is already visible; Start launches "main"
});









k.scene("main", async () => {
  let hasCelebrated = false; // confetti fires once per playthrough

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
              if (boundary.name === "pc2" && !hasCelebrated) {
                hasCelebrated = true;
                spawnConfetti(); // 🎉 reached the final reward
              }
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
                    showUnlockBanner("DOOR UNLOCKED!");
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

  // 🔓 Big animated banner shown when the new area unlocks
  function showUnlockBanner(msg) {
    const banner = k.add([
      k.text(msg, { size: 48 }),
      k.pos(k.width() / 2, k.height() / 2 - 120),
      k.anchor("center"),
      k.fixed(),
      k.z(100),
      k.color(255, 209, 102),
      k.opacity(0),
      k.scale(0.5),
    ]);

    k.tween(0, 1, 0.35, (v) => (banner.opacity = v), k.easings.easeOutQuad);
    k.tween(0.5, 1, 0.5, (v) => (banner.scale = k.vec2(v, v)), k.easings.easeOutBack);

    k.wait(2.2, () => {
      k.tween(1, 0, 0.6, (v) => (banner.opacity = v), k.easings.easeInQuad).then(() =>
        banner.destroy()
      );
    });
  }

  // 🎉 Confetti burst for reaching the final reward
  function spawnConfetti() {
    const palette = [
      [255, 209, 102],
      [78, 205, 196],
      [255, 107, 107],
      [199, 125, 255],
      [255, 159, 252],
    ];

    for (let i = 0; i < 120; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      const piece = k.add([
        k.rect(k.rand(4, 9), k.rand(4, 9)),
        k.color(c[0], c[1], c[2]),
        k.pos(k.rand(0, k.width()), k.rand(-80, -10)),
        k.anchor("center"),
        k.fixed(),
        k.z(99),
        k.opacity(1),
        k.rotate(k.rand(0, 360)),
        k.lifespan(k.rand(2, 3.5), { fade: 0.5 }),
        {
          vx: k.rand(-70, 70),
          vy: k.rand(100, 260),
          vr: k.rand(-240, 240),
        },
      ]);

      piece.onUpdate(() => {
        piece.pos.x += piece.vx * k.dt();
        piece.pos.y += piece.vy * k.dt();
        piece.angle += piece.vr * k.dt();
        piece.vy += 220 * k.dt(); // gravity
      });
    }
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
