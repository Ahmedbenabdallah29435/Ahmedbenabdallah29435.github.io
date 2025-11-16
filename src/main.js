import { dialogueData, scaleFactor } from "./constants.js";
import { k } from "./kaboomCtx.js";
import { displayDialogue, setCamScale } from "./utils.js";
import kaboom from 'kaboom';



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

const visitorCounter = document.getElementById("visitor-counter");


k.scene("menu", () => {
  visitorCounter.style.display = "block"; // Show counter


  // 🔥 Google Analytics - Suivi des Visites
  if (typeof gtag === "function") {
    gtag('event', 'page_view', { page_path: '/menu' });
  } else {
    console.warn("Google Analytics not loaded yet!");
  }
// 🔥 Sauvegarde locale pour voir le nombre de visiteurs
let visits = localStorage.getItem("visits") || 0;
visits++;
localStorage.setItem("visits", visits);
console.log(`🌍 Nombre total de visiteurs : ${visits}`);

  // Background and Title
  k.add([
    k.rect(k.width(), k.height()), 
    k.color(30, 30, 30), // Dark background
    k.pos(0, 0),
  ]);

  k.add([
    k.text("🎮2D Portfolio🎮", { size: 48 }),
    k.pos(k.width() / 2, 80),
    k.anchor("center"),
  ]);

  k.add([
    k.text(
      "Learn about me through a mini 2D game!\n\nInteract with 5 objects to unlock the real link!",
      { size: 18, align: "center", width: 300 }
    ),
    k.pos(k.width() / 2, 170),
    k.anchor("center"),
  ]);

  // 🎮 Start Button
  const startBtn = k.add([
    k.text("▶ Start 2D Portfolio", { size: 20 }),
    k.pos(k.width() / 2,250),
    k.anchor("center"),
    k.area(),
    k.color(255, 255, 255),
    "start-btn",
  ]);

  startBtn.onClick(() => k.go("main"));

  // 🔥 Animated Start Button
  function animateStartButton() {
    k.loop(1, () => {
      k.tween(1, 1, 0.9, (val) => startBtn.scale = k.vec2(val, val), k.easings.easeInOutSine, () => {
        k.tween(1.2, 1, 0.9, (val) => startBtn.scale = k.vec2(val, val), k.easings.easeInOutSine);
      });

      k.tween(0.5, 1, 0.6, (val) => startBtn.opacity = val, k.easings.easeInOutSine, () => {
        k.tween(1, 0.5, 0.6, (val) => startBtn.opacity = val, k.easings.easeInOutSine);
      });
    });
  }

  animateStartButton(); // Start infinite animation loop
// 🌍 Visitors Count (Below Portfolio Button)
const visitorsCounter = k.add([
  k.text("▶ (click here)", { size: 18 }),
  k.pos(k.width() / 2.00, 270),
  k.anchor("center"),
  k.area(), // ✅ Makes it clickable
]);

// ✅ Add click event to open visitor counter image
visitorsCounter.onClick(() => k.go("main"));

// 🔥 Generalized Animation Function
function animateElement(element) {
  k.loop(1, () => {
    k.tween(1, 1, 0.9, (val) => element.scale = k.vec2(val, val), k.easings.easeInOutSine, () => {
      k.tween(1.2, 1, 0.9, (val) => element.scale = k.vec2(val, val), k.easings.easeInOutSine);
    });

    k.tween(0.5, 1, 0.6, (val) => element.opacity = val, k.easings.easeInOutSine, () => {
      k.tween(1, 0.5, 0.6, (val) => element.opacity = val, k.easings.easeInOutSine);
    });
  });
}
// 🔥 Apply animation to visitorsCounter
animateElement(visitorsCounter);

  // 🕹️ Hover Character (Moves to hovered buttons)
  const hoverCharacter = k.add([
    k.sprite("spritesheet", { anim: "idle-down" }), // Using spritesheet for hover effect
    k.pos(k.width() / 2 - 140, 248), // Default position (Move left)
    k.anchor("center"),
    k.scale(1.4), // Increase scale
  ]);
  function createSocialButton(text, y, link, isDisabled = false) {
    const btn = k.add([
        k.text(text, { size: 28, color: isDisabled ? k.Color.fromHex("#777777") : k.Color.WHITE }),
        k.pos(k.width() / 2, y),
        k.anchor("center"),
        k.area(),
        "social-btn",
        { disabled: isDisabled, link },
    ]);

    // 🌟 **Add a Glow Effect (Hidden Initially)**
    const glowEffect = k.add([
        k.text(text, { size: 30, color: k.Color.YELLOW }), // Slightly bigger
        k.pos(k.width() / 2, y),
        k.anchor("center"),
        k.scale(1.1), // Slightly larger
        k.opacity(0), // Hidden initially
    ]);

    btn.onClick(() => {
        if (!btn.disabled) {
            window.open(link, "_blank");
        } else {
            k.shake(5);
        }
    });

    // **🎵 Play Hover Sound & Show Glow Effect**
    btn.onHover(() => {
        k.play("hover-sound"); // Play hover sound
        glowEffect.opacity = 0.09; // Instantly show glow effect
    });

    // **🛑 Hide Glow When Not Hovered**
    btn.onHoverEnd(() => {
        glowEffect.opacity = 0; // Instantly hide glow effect
    });

    return btn;
}




  createSocialButton("🤖 GitHub", 320, "https://github.com/Ahmedbenabdallah29435/");
  createSocialButton("💼 LinkedIn", 360, "https://www.linkedin.com/in/benabdallah-ahmed-928199215/");

  // 🚨 Portfolio Button (Initially Locked)
  const portfolioBtn = createSocialButton("🔒 Portfolio (Locked)", 400, "https://yourportfolio.com", true);

  // Listen for unlocking event
  k.on("unlockPortfolio", () => {
    portfolioBtn.disabled = false;
    portfolioBtn.use(k.text("🌍 Portfolio (Unlocked!)", { size: 28, color: k.Color.WHITE }));
  });


});









k.scene("main", async () => {
  let isMusicOn = true; // Track music state

   const music = k.play("background-music", {
     loop: true,
     volume: 0.5,
   });
   if (visitorCounter) visitorCounter.style.display = "none"; // ✅ Ensure it's hidden in main game

  const musicToggleBtn = document.getElementById("music-toggle");
  musicToggleBtn.addEventListener("click", () => {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
      music.play();
      musicToggleBtn.textContent = "Music Off";
    } else {
      music.stop();
      musicToggleBtn.textContent = "Music On";
    }
  });
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
