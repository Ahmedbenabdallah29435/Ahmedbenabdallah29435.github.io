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

k.setBackground(k.Color.fromHex("#acacac"));






k.scene("menu", () => {
  // 🎨 Dynamic sizing based on screen width for mobile responsiveness
  const isMobile = k.width() < 768;
  const titleSize = isMobile ? Math.max(32, k.width() * 0.08) : 56;
  const subtitleSize = isMobile ? Math.max(16, k.width() * 0.035) : 24;
  const buttonSize = isMobile ? Math.max(24, k.width() * 0.055) : 36;
  const socialSize = isMobile ? Math.max(20, k.width() * 0.045) : 30;

  // 🌟 Animated Gradient Background
  const bg1 = k.add([
    k.rect(k.width(), k.height()),
    k.color(20, 20, 40), // Deep blue-purple
    k.pos(0, 0),
    k.z(-2),
  ]);

  const bg2 = k.add([
    k.rect(k.width(), k.height()),
    k.color(40, 20, 60), // Purple accent
    k.pos(0, 0),
    k.opacity(0.3),
    k.z(-1),
  ]);

  // Animate background color shift
  k.loop(3, () => {
    k.tween(0.3, 0.6, 2, (val) => bg2.opacity = val, k.easings.easeInOutSine, () => {
      k.tween(0.6, 0.3, 2, (val) => bg2.opacity = val, k.easings.easeInOutSine);
    });
  });

  // ✨ Particle System for Background
  function createParticles() {
    for (let i = 0; i < 30; i++) {
      const particle = k.add([
        k.circle(Math.random() * 3 + 1),
        k.pos(Math.random() * k.width(), Math.random() * k.height()),
        k.color(Math.random() * 100 + 155, Math.random() * 100 + 155, 255),
        k.opacity(Math.random() * 0.5 + 0.2),
        k.z(-1),
        { speed: Math.random() * 20 + 10 }
      ]);

      // Floating animation
      k.loop(Math.random() * 2 + 2, () => {
        const newY = particle.pos.y + particle.speed;
        const duration = Math.random() * 3 + 2;
        k.tween(particle.pos.y, newY > k.height() ? -20 : newY, duration,
          (val) => particle.pos.y = val, k.easings.linear);
      });
    }
  }

  createParticles();

  // 🎮 Title with shadow effect
  const titleShadow = k.add([
    k.text("🎮2D Portfolio🎮", { size: titleSize }),
    k.pos(k.width() / 2 + 3, 63),
    k.anchor("center"),
    k.color(0, 0, 0),
    k.opacity(0.5),
  ]);

  const title = k.add([
    k.text("🎮2D Portfolio🎮", { size: titleSize }),
    k.pos(k.width() / 2, 60),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  // Title pulse animation
  k.loop(2, () => {
    k.tween(1, 1.05, 1, (val) => {
      title.scale = k.vec2(val, val);
      titleShadow.scale = k.vec2(val, val);
    }, k.easings.easeInOutSine, () => {
      k.tween(1.05, 1, 1, (val) => {
        title.scale = k.vec2(val, val);
        titleShadow.scale = k.vec2(val, val);
      }, k.easings.easeInOutSine);
    });
  });

  const subtitleY = isMobile ? 120 : 150;
  const subtitle = k.add([
    k.text(
      "Learn about me through a mini 2D game!\nInteract with 3 objects to unlock\nthe real portfolio link!",
      { size: subtitleSize, align: "center", width: isMobile ? k.width() * 0.9 : 600 }
    ),
    k.pos(k.width() / 2, subtitleY),
    k.anchor("center"),
    k.color(200, 200, 255),
  ]);

  // 🎮 Enhanced Start Button with border and background
  const startBtnY = isMobile ? 210 : 240;

  const startBtnBg = k.add([
    k.rect(isMobile ? k.width() * 0.7 : 380, isMobile ? 70 : 80),
    k.pos(k.width() / 2, startBtnY),
    k.anchor("center"),
    k.color(70, 130, 255), // Vibrant blue
    k.area(),
    k.z(1),
    "start-btn-bg",
  ]);

  const startBtnBorder = k.add([
    k.rect(isMobile ? k.width() * 0.7 + 6 : 386, isMobile ? 76 : 86),
    k.pos(k.width() / 2, startBtnY),
    k.anchor("center"),
    k.color(150, 200, 255), // Light blue border
    k.z(0),
  ]);

  const startBtn = k.add([
    k.text("▶ Start 2D Portfolio", { size: buttonSize }),
    k.pos(k.width() / 2, startBtnY),
    k.anchor("center"),
    k.area(),
    k.color(255, 255, 255),
    k.z(2),
    "start-btn",
  ]);

  startBtn.onClick(() => {
    k.play("interaction-sound");
    k.go("main");
  });

  startBtnBg.onClick(() => k.go("main"));

  // 🔥 Enhanced Start Button Animation
  k.loop(1.5, () => {
    k.tween(1, 1.08, 0.75, (val) => {
      startBtn.scale = k.vec2(val, val);
      startBtnBg.scale = k.vec2(val, val);
      startBtnBorder.scale = k.vec2(val * 1.02, val * 1.02);
    }, k.easings.easeInOutSine, () => {
      k.tween(1.08, 1, 0.75, (val) => {
        startBtn.scale = k.vec2(val, val);
        startBtnBg.scale = k.vec2(val, val);
        startBtnBorder.scale = k.vec2(val * 1.02, val * 1.02);
      }, k.easings.easeInOutSine);
    });

    // Color pulse
    k.tween(70, 100, 0.75, (val) => {
      startBtnBg.color.r = val;
      startBtnBg.color.g = val + 60;
    }, k.easings.easeInOutSine, () => {
      k.tween(100, 70, 0.75, (val) => {
        startBtnBg.color.r = val;
        startBtnBg.color.g = val + 60;
      }, k.easings.easeInOutSine);
    });
  });

  // Hover effect for start button
  startBtn.onHover(() => {
    k.tween(startBtnBg.color.r, 120, 0.2, (val) => startBtnBg.color.r = val);
    k.tween(startBtnBg.color.g, 180, 0.2, (val) => startBtnBg.color.g = val);
  });

  startBtn.onHoverEnd(() => {
    k.tween(startBtnBg.color.r, 70, 0.2, (val) => startBtnBg.color.r = val);
    k.tween(startBtnBg.color.g, 130, 0.2, (val) => startBtnBg.color.g = val);
  });

  // 🕹️ Hover Character (Moves to hovered buttons) - Only on desktop
  let hoverCharacter = null;
  if (!isMobile) {
    hoverCharacter = k.add([
      k.sprite("spritesheet", { anim: "idle-down" }),
      k.pos(k.width() / 2 - 200, startBtnY),
      k.anchor("center"),
      k.scale(1.4),
      k.z(3),
    ]);
  }

  // 📌 Enhanced Function to Create Social Buttons
  const socialStartY = isMobile ? 320 : 360;
  const socialSpacing = isMobile ? 55 : 50;

  function createSocialButton(text, index, link, isDisabled = false) {
    const y = socialStartY + (index * socialSpacing);
    const btnWidth = isMobile ? k.width() * 0.75 : 350;
    const btnHeight = isMobile ? 55 : 45;

    // Button border
    const btnBorder = k.add([
      k.rect(btnWidth + 4, btnHeight + 4),
      k.pos(k.width() / 2, y),
      k.anchor("center"),
      k.color(isDisabled ? 80 : 100, isDisabled ? 80 : 100, isDisabled ? 80 : 150),
      k.z(0),
    ]);

    // Button background
    const btnBg = k.add([
      k.rect(btnWidth, btnHeight),
      k.pos(k.width() / 2, y),
      k.anchor("center"),
      k.color(isDisabled ? 50 : 40, isDisabled ? 50 : 40, isDisabled ? 50 : 70),
      k.area(),
      k.z(1),
    ]);

    const btn = k.add([
      k.text(text, { size: socialSize }),
      k.pos(k.width() / 2, y),
      k.anchor("center"),
      k.area(),
      k.color(isDisabled ? 120 : 255, isDisabled ? 120 : 255, isDisabled ? 120 : 255),
      k.z(2),
      "social-btn",
      { disabled: isDisabled, link, bg: btnBg, border: btnBorder },
    ]);

    btn.onClick(() => {
      if (!btn.disabled) {
        k.play("interaction-sound");
        window.open(link, "_blank");
      } else {
        k.shake(5);
      }
    });

    btnBg.onClick(() => btn.onClick());

    // Enhanced hover effects
    btn.onHover(() => {
      if (!btn.disabled) {
        k.tween(btn.scale.x, 1.05, 0.15, (val) => {
          btn.scale = k.vec2(val, val);
          btnBg.scale = k.vec2(val, val);
          btnBorder.scale = k.vec2(val * 1.02, val * 1.02);
        });
        k.tween(btnBg.color.r, 70, 0.2, (val) => btnBg.color.r = val);
        k.tween(btnBg.color.b, 120, 0.2, (val) => btnBg.color.b = val);

        if (hoverCharacter) {
          hoverCharacter.play("walk-side");
          k.tween(hoverCharacter.pos, k.vec2(k.width() / 2 - 200, y), 0.3,
            k.easings.easeInOutSine, () => {
            hoverCharacter.play("idle-down");
          });
        }
      }
    });

    btn.onHoverEnd(() => {
      if (!btn.disabled) {
        k.tween(btn.scale.x, 1, 0.15, (val) => {
          btn.scale = k.vec2(val, val);
          btnBg.scale = k.vec2(val, val);
          btnBorder.scale = k.vec2(val * 1.02, val * 1.02);
        });
        k.tween(btnBg.color.r, 40, 0.2, (val) => btnBg.color.r = val);
        k.tween(btnBg.color.b, 70, 0.2, (val) => btnBg.color.b = val);
      }
    });

    return btn;
  }

  createSocialButton("🤖 GitHub", 0, "https://github.com/yourgithub");
  createSocialButton("💼 LinkedIn", 1, "https://linkedin.com/in/yourlinkedin");

  // 🚨 Portfolio Button (Initially Locked)
  const portfolioBtn = createSocialButton("🔒 Portfolio (Locked)", 2, "https://yourportfolio.com", true);

  // Listen for unlocking event
  k.on("unlockPortfolio", () => {
    portfolioBtn.disabled = false;
    portfolioBtn.text = "🌍 Portfolio (Unlocked!)";
    portfolioBtn.color = k.Color.WHITE;
    portfolioBtn.bg.color = k.rgb(40, 40, 70);
    portfolioBtn.border.color = k.rgb(100, 100, 150);
  });

  // ⚡ Responsive resize handler
  k.onResize(() => {
    k.go("menu"); // Reload menu on resize for proper scaling
  });
});









k.scene("main", async () => {
  let isMusicOn = true; // Track music state

   const music = k.play("background-music", {
     loop: true,
     volume: 0.5,
   });

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
    if (player.interactions >= 5) {
      console.log("✅ Removing blocker, access granted!");
      newAreaBlocker.destroy(); // Remove the blocker
    } else {
      const remaining = 5 - player.interactions;
      showMessage(`❌ You need to interact with ${remaining} more items!`);
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

k.go("menu");
