document.addEventListener("DOMContentLoaded", () => {

    /* ======================
       PAGE TRANSITION
    ====================== */
  
    const landing = document.getElementById("landing");
    const spacePage = document.getElementById("spacePage");
    const enterBtn = document.getElementById("enter");
  
    enterBtn.addEventListener("click", () => {
      landing.classList.remove("active");
      spacePage.classList.add("active");
    });
  
    /* ======================
       THREE.JS SETUP
    ====================== */
  
    const canvas = document.getElementById("space");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04040a);
  
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 12);
  
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.pointerEvents = "none";
  
    /* ======================
       LIGHTING
    ====================== */
  
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  
    const keyLight = new THREE.PointLight(0xffffff, 1.4);
    keyLight.position.set(6, 6, 8);
    scene.add(keyLight);
  
    const rimLight = new THREE.PointLight(0x88aaff, 0.6);
    rimLight.position.set(-6, -6, -6);
    scene.add(rimLight);
  
    /* ======================
       STARFIELD
    ====================== */
  
    function createStars(count, depth, opacity) {
      const geo = new THREE.BufferGeometry();
      const pos = [];
  
      for (let i = 0; i < count; i++) {
        pos.push(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60,
          -Math.random() * depth
        );
      }
  
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  
      return new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.06,
          transparent: true,
          opacity
        })
      );
    }
  
    const starsNear = createStars(400, 20, 0.8);
    const starsFar = createStars(600, 50, 0.5);
    scene.add(starsNear, starsFar);
  
    /* ======================
       MOODS / PLANETS
    ====================== */
  
    const moods = [
      {
        title: "HAPPY",
        color: new THREE.Color(0xffc1e3),
        bg: new THREE.Color(0x2a0f1e),
        text: `When you are happy,
  the universe feels lighter.
  
  Your laughter bends time,
  and your smile becomes gravity.
  
  I love existing in the same moment
  as your joy.`
      },
      {
        title: "CALM",
        color: new THREE.Color(0xa7f3d0),
        bg: new THREE.Color(0x0f2a1e),
        text: `With you, everything slows.
  
  You are my quiet orbit,
  the place where my thoughts soften.
  
  Peace feels real
  when it carries your name.`
      },
      {
        title: "OVERWHELMED",
        color: new THREE.Color(0x93c5fd),
        bg: new THREE.Color(0x0f1a2a),
        text: `If the world feels too loud,
  come closer.
  
  You don’t have to carry everything.
  Let me share the weight.
  
  You are not alone here.`
      },
      {
        title: "ROMANTIC",
        color: new THREE.Color(0xff7aa2),
        bg: new THREE.Color(0x2a0f18),
        text: `I would find you
  in every universe.
  
  Across space,
  across time,
  across every forever.
  
  You are my constant.`
      }
    ];
  
    const planets = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
  
    function createLabel(text) {
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d");
      c.width = 512;
      c.height = 128;
  
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, c.width, c.height);
  
      ctx.font = "bold 42px Georgia";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, c.width / 2, c.height / 2);
  
      const tex = new THREE.CanvasTexture(c);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true })
      );
  
      sprite.scale.set(3.6, 0.9, 1);
      sprite.position.set(0, 1.5, 0);
      return sprite;
    }
  
    moods.forEach((m, i) => {
      const geo = new THREE.SphereGeometry(0.9, 64, 64);
      const mat = new THREE.MeshStandardMaterial({
        color: m.color,
        roughness: 0.45,
        emissive: m.color,
        emissiveIntensity: 0.2
      });
  
      const planet = new THREE.Mesh(geo, mat);
      planet.position.set(-4 + i * 2.7, i % 2 ? -1.8 : 1.8, 0);
      planet.userData = { ...m, opened: false };
  
      const glow = new THREE.Mesh(
        geo.clone(),
        new THREE.MeshBasicMaterial({
          color: m.color,
          transparent: true,
          opacity: 0.15
        })
      );
      glow.scale.set(1.15, 1.15, 1.15);
      planet.add(glow);
  
      planet.add(createLabel(m.title));
      planets.push(planet);
      scene.add(planet);
    });
  
    /* ======================
       FINAL HIDDEN PLANET
    ====================== */
  
    let finalPlanet = null;
  
    function unlockFinalPlanet() {
      if (finalPlanet) return;
  
      const geo = new THREE.SphereGeometry(1.2, 64, 64);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.35
      });
  
      finalPlanet = new THREE.Mesh(geo, mat);
      finalPlanet.position.set(0, 0, -2);
      finalPlanet.userData = {
        title: "YOU",
        text: `No matter the mood.
  No matter the distance.
  This universe always ends with you.`
      };
  
      finalPlanet.add(createLabel("YOU"));
      planets.push(finalPlanet);
      scene.add(finalPlanet);
    }
  
    /* ======================
       INTERACTION STATE
    ====================== */
  
    let focusedPlanet = null;
    let openedCount = 0;
    const targetCam = new THREE.Vector3(0, 0, 12);
    const targetBg = scene.background.clone();
  
    const card = document.getElementById("card");
    const cardTitle = document.getElementById("cardTitle");
    const cardText = document.getElementById("cardText");
    const closeBtn = document.getElementById("close");
  
    const clickSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-soft-click-tone-1112.mp3");
  
    function handlePointer(e) {
      if (card.classList.contains("active")) return;
  
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(planets, false);
      if (!hits.length) return;
  
      focusedPlanet = hits[0].object;
      const data = focusedPlanet.userData;
  
      clickSound.currentTime = 0;
      clickSound.play();
  
      cardTitle.textContent = data.title;
      cardText.textContent = data.text;
      cardTitle.style.color = `#${data.color?.getHexString?.() || "ffffff"}`;
      card.style.background = "rgba(255,255,255,0.08)";
  
      if (!data.opened) {
        data.opened = true;
        openedCount++;
        if (openedCount === moods.length) unlockFinalPlanet();
      }
  
      targetCam.set(
        focusedPlanet.position.x * 0.3,
        focusedPlanet.position.y * 0.3,
        6
      );
  
      if (data.bg) targetBg.copy(data.bg);
      card.classList.add("active");
    }
  
    window.addEventListener("pointerdown", handlePointer);
  
    closeBtn.addEventListener("click", () => {
      focusedPlanet = null;
      targetCam.set(0, 0, 12);
      targetBg.set(0x04040a);
      card.classList.remove("active");
    });
  
    /* ======================
       ANIMATION LOOP
    ====================== */
  
    let orbitAngle = 0;
  
    function animate() {
      requestAnimationFrame(animate);
  
      orbitAngle += 0.0005;
      camera.position.x += (Math.sin(orbitAngle) * 1.2 - camera.position.x) * 0.02;
      camera.position.z += (12 + Math.cos(orbitAngle) * 0.6 - camera.position.z) * 0.02;
  
      scene.background.lerp(targetBg, 0.03);
      camera.lookAt(0, 0, 0);
  
      starsNear.rotation.y += focusedPlanet ? 0.0001 : 0.00025;
      starsFar.rotation.y += 0.00008;
  
      planets.forEach((p, i) => {
        const isFocus = p === focusedPlanet;
  
        p.rotation.y += 0.002;
        p.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
  
        const targetScale = isFocus ? 1.45 : 1;
        p.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
  
        p.material.emissiveIntensity +=
          ((isFocus ? 0.6 : 0.2) - p.material.emissiveIntensity) * 0.08;
      });
  
      renderer.render(scene, camera);
    }
  
    animate();
  
    /* ======================
       RESIZE
    ====================== */
  
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  
  });
  