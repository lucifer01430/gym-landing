    // === THREE.JS BACKGROUND ===
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    cam.position.z = 5;

    const geo = new THREE.IcosahedronGeometry(2, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xDFFF00, wireframe: true });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // second smaller orb
    const geo2 = new THREE.OctahedronGeometry(0.8, 0);
    const mat2 = new THREE.MeshBasicMaterial({ color: 0xBF5AF2, wireframe: true });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    mesh2.position.set(3, -1.5, -1);
    scene.add(mesh2);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / innerWidth - 0.5) * 0.5;
      mouseY = (e.clientY / innerHeight - 0.5) * 0.5;
    });

    (function animate() {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.0015;
      mesh.rotation.y += 0.002;
      mesh.rotation.x += mouseY * 0.01;
      mesh.rotation.y += mouseX * 0.01;
      mesh2.rotation.x += 0.003;
      mesh2.rotation.y -= 0.004;
      renderer.render(scene, cam);
    })();

    window.addEventListener('resize', () => {
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    // === SCROLL REVEAL ===
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.setProperty('--i', i % 6);
      observer.observe(el);
    });

    // === COUNTER ANIMATION ===
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.target);
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current).toLocaleString();
          if (current >= target) clearInterval(timer);
        }, 16);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

    // === MAGNETIC BUTTONS ===
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
        btn.style.transform = `translate(${x}px, ${y}px)`;
        btn.style.transition = 'transform 0.1s';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });
    });

    // === TEXT SCRAMBLE ===
    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
      }
      setText(newText) {
        const queue = [...newText].map((to, i) => ({
          from: '?', to,
          start: Math.floor(Math.random() * 8),
          end: Math.floor(Math.random() * 8) + 8,
          char: ''
        }));
        let frame = 0;
        const tick = () => {
          let output = '', complete = 0;
          queue.forEach(item => {
            if (frame >= item.end) { complete++; output += item.to; }
            else if (frame >= item.start) {
              item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
              output += `<span style="opacity:0.35;color:#fff">${item.char}</span>`;
            } else output += `<span style="opacity:0.2">_</span>`;
          });
          this.el.innerHTML = output;
          if (complete < queue.length) { requestAnimationFrame(tick); frame++; }
        };
        requestAnimationFrame(tick);
      }
    }

    // Fire scramble after page loads
    setTimeout(() => {
      const el = document.getElementById('scramble-title');
      if (el) {
        const fx = new TextScramble(el);
        const words = ['LIMITS', 'EXCUSES', 'WEAKNESS', 'MEDIOCRITY', 'LIMITS'];
        let idx = 0;
        const cycle = () => {
          fx.setText(words[idx]);
          idx = (idx + 1) % words.length;
          setTimeout(cycle, 3200);
        };
        cycle();
      }
    }, 800);
