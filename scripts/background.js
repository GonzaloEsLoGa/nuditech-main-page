// Advanced particle wave grid with smooth mouse, touch, zoom, and SCROLL reaction
const AMOUNTX = 100, AMOUNTY = 75;
const SEPARATION = 45;

let container, camera, scene, renderer, particleSystem;
let positions, colors;
let count = 0;

let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

// Scroll reaction state
let scrollY = 0;
let targetScrollY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Brand colors: Purple -> Cyan -> Emerald Green
const c1 = new THREE.Color('#8B5CF6'); 
const c2 = new THREE.Color('#06B6D4'); 
const c3 = new THREE.Color('#10B981'); 

// Generates a soft, glowing particle sprite texture using Canvas 2D
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

function init() {
    container = document.getElementById('bg-canvas-container');
    const canvasEl = document.getElementById('wave-canvas');
    if (!container || !canvasEl) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    windowHalfX = width / 2;
    windowHalfY = height / 2;

    // Camera and Scene configuration
    camera = new THREE.PerspectiveCamera(65, width / height, 1, 10000);
    adjustCameraAspect(width, height);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0004);

    // Particle Position and Color arrays
    const numParticles = AMOUNTX * AMOUNTY;
    positions = new Float32Array(numParticles * 3);
    colors = new Float32Array(numParticles * 3);

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
            positions[i + 1] = 0;
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);

            const t = ix / AMOUNTX;
            let color = new THREE.Color();
            if (t < 0.5) { color.lerpColors(c1, c2, t * 2); } 
            else { color.lerpColors(c2, c3, (t - 0.5) * 2); }

            colors[i] = color.r; 
            colors[i + 1] = color.g; 
            colors[i + 2] = color.b;
            i += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle material with additive blending for glowing effect
    const material = new THREE.PointsMaterial({
        size: 13.2,
        map: createParticleTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x030712, 1);

    // Event listeners for interactivity, window resize, zoom, and SCROLL
    // document.addEventListener('mousemove', onMouseMove, { passive: true });
    // document.addEventListener('touchmove', onTouchMove, { passive: true });
    // window.addEventListener('scroll', onWindowScroll, { passive: true });
    // window.addEventListener('resize', onWindowResize);
    // window.addEventListener('orientationchange', onWindowResize);

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onWindowResize);
    }

    // ResizeObserver for zoom / container changes
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            onWindowResize();
        });
        resizeObserver.observe(container);
    }

    // Initial scroll position
    targetScrollY = window.scrollY || window.pageYOffset || 0;

    animate();
}

function adjustCameraAspect(width, height) {
    if (!camera) return;
    const aspect = width / height;
    camera.aspect = aspect;

    // Adjust camera distance based on aspect ratio for high zoom / vertical orientation
    if (aspect < 1) {
        camera.position.z = 1100 / aspect;
        camera.position.y = 450 / aspect;
    } else {
        camera.position.z = 1100;
        camera.position.y = 450;
    }
    camera.updateProjectionMatrix();
}

// function onMouseMove(event) {
//     targetMouseX = (event.clientX - windowHalfX) * 0.4;
//     targetMouseY = (event.clientY - windowHalfY) * 0.4;
// }

// function onTouchMove(event) {
//     if (event.touches.length === 1) {
//         targetMouseX = (event.touches[0].clientX - windowHalfX) * 0.4;
//         targetMouseY = (event.touches[0].clientY - windowHalfY) * 0.4;
//     }
// }

// function onWindowScroll() {
//     targetScrollY = window.scrollY || window.pageYOffset || 0;
// }

function onWindowResize() {
    if (!camera || !renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    windowHalfX = width / 2;
    windowHalfY = height / 2;

    adjustCameraAspect(width, height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    if (!particleSystem) return;

    // Smooth inertia for mouse movement
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Smooth inertia for scroll progression
    scrollY += (targetScrollY - scrollY) * 0.06;

    // Camera base elevation depending on screen aspect
    const basePosY = (camera.aspect < 1) ? (450 / camera.aspect) : 450;

    // Scroll effect calculations: shift camera elevation and rotation as user scrolls down
    const scrollOffset = scrollY * 0.4;
    const scrollAngle = scrollY * 0.0003;

    camera.position.x = mouseX * 0.8 + Math.sin(scrollAngle) * 150;
    camera.position.y = basePosY + (-mouseY * 0.8) + scrollOffset * 0.6;
    camera.position.z = ((camera.aspect < 1) ? (1100 / camera.aspect) : 1100) - scrollOffset * 0.3;
    
    // Smoothly tilt camera view based on scroll position
    camera.lookAt(0, -scrollOffset * 0.4, 0);

    // Particle rotation response to scroll
    particleSystem.rotation.y = scrollY * 0.00025;

    // Sine wave motion algorithm modulated by time count AND scroll dynamics
    const positionArray = particleSystem.geometry.attributes.position.array;
    const scrollWaveFactor = scrollY * 0.002;
    let i = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            const waveX = Math.sin((ix + count + scrollWaveFactor) * 0.25) * 63;
            const waveY = Math.cos((iy + count + scrollWaveFactor) * 0.35) * 63;
            const diagonal = Math.sin((ix + iy + count + scrollWaveFactor) * 0.15) * 45;

            positionArray[i + 1] = waveX + waveY + diagonal;
            i += 3;
        }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    count += 0.0025;

    renderer.render(scene, camera);
}

// Safe initialisation on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}