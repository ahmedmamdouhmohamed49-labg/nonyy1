"use strict";

const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

let W, H, DPR;
let textParticles = [];
let fireworks = [];
let rockets = [];
let fountains = [];
let smoke = [];
let stars = [];

const COLORS = ["#ffffff", "#eeeeff", "#dce5ff"];

const random = (min, max) =>
    Math.random() * (max - min) + min;

// =====================
// SCREEN
// =====================

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = W * DPR;
    canvas.height = H * DPR;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    createStars();
    createText();
}

function createStars() {
    stars = [];

    for (let i = 0; i < 90; i++) {
        stars.push({
            x: random(0, W),
            y: random(0, H),
            size: random(.5, 1.5),
            alpha: random(.2, 1)
        });
    }
}

// =====================
// TEXT
// =====================

function createText() {
    const temp = document.createElement("canvas");
    temp.width = W;
    temp.height = H;

    const t = temp.getContext("2d");

    const size = Math.min(
        W * (W < 500 ? .105 : .085),
        H * .11,
        90
    );

    const gap = size * 1.4;

    t.textAlign = "center";
    t.textBaseline = "middle";
    t.fillStyle = "#FFFFFF";

    const words = ["Happy", "Birthday", "Hanin"];

    words.forEach((word, i) => {
        const font = word === "Birthday" ? size * .88 : size;

        t.font = `900 ${font}px Arial`;

        t.fillText(
            word,
            W / 2,
            H * .47 + (i - 1) * gap
        );
    });

    const data = t.getImageData(0, 0, W, H).data;

    textParticles = [];

    for (let y = 0; y < H; y += 3) {
        for (let x = 0; x < W; x += 3) {
            const index = (y * W + x) * 4;

            if (data[index + 3] > 100) {
                textParticles.push({
                    x: random(0, W),
                    y: H + random(0, H),
                    tx: x,
                    ty: y,
                    alpha: 0,
                    size: random(.7, 1.5)
                });
            }
        }
    }
}

// =====================
// ROCKETS
// =====================

function launchRocket() {
    rockets.push({
        x: random(W * .1, W * .9),
        y: H * .92,
        targetY: random(H * .1, H * .38),
        speed: random(8, 12),
        trail: []
    });
}

function drawRockets() {
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];

        r.trail.push({ x: r.x, y: r.y });

        if (r.trail.length > 12) {
            r.trail.shift();
        }

        r.y -= r.speed;

        ctx.strokeStyle = "rgba(255,255,255,.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();

        r.trail.forEach((p, j) => {
            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });

        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#db1277";
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();

        if (r.y <= r.targetY) {
            explosion(r.x, r.y);
            rockets.splice(i, 1);
        }
    }

    ctx.shadowBlur = 0;
}

// =====================
// EXPLOSIONS
// =====================

function explosion(x, y) {
    for (let i = 0; i < 120; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(2, 8);

        fireworks.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: random(.012, .02),
            size: random(.7, 2),
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
    }

    for (let i = 0; i < 10; i++) {
        addSmoke(x + random(-20, 20), y + random(-20, 20));
    }
}

function drawFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const p = fireworks[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += .045;
        p.vx *= .99;
        p.life -= p.decay;

        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
            fireworks.splice(i, 1);
        }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// =====================
// GROUND FOUNTAINS
// =====================

function createFountain(x) {
    for (let i = 0; i < 5; i++) {
        fountains.push({
            x: x + random(-5, 5),
            y: H * .9,
            vx: random(-3, 3),
            vy: random(-11, -5),
            life: 1,
            size: random(.7, 2)
        });
    }
}


function drawFountains() {
    for (let i = fountains.length - 1; i >= 0; i--) {
        const p = fountains[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += .15;
        p.life -= .018;

        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = "#721515";
        ctx.shadowColor = "#4e17a7";
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
            fountains.splice(i, 1);
        }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// =====================
// SMOKE
// =====================

function addSmoke(x, y) {
    smoke.push({
        x, y,
        radius: random(10, 25),
        life: .5,
        vx: random(-.5, .5),
        vy: random(-.8, -.2)
    });
}

function drawSmoke() {
    for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];

        p.x += p.vx;
        p.y += p.vy;
        p.radius += .3;
        p.life -= .003;

        const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.radius
        );

        gradient.addColorStop(
            0,
            `rgba(180,180,190,${p.life * .2})`
        );

        gradient.addColorStop(1, "rgba(60,60,70,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
            smoke.splice(i, 1);
        }
    }
}

// =====================
// LETTERS
// =====================

function drawText() {
    textParticles.forEach(p => {
        p.x += (p.tx - p.x) * .045;
        p.y += (p.ty - p.y) * .045;

        p.alpha = Math.min(1, p.alpha + .018);

        ctx.globalAlpha = p.alpha * random(.8, 1);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#8b8b8b";
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// =====================
// BACKGROUND
// =====================

function drawBackground() {
    ctx.fillStyle = "rgba(3,3,6,.20)";
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
        ctx.globalAlpha = s.alpha * random(.6, 1);
        ctx.fillStyle = "#c7a7a7";

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

// =====================
// MAIN ANIMATION
// =====================

let lastRocket = 0;
let lastFountain = 0;

function animate(time) {
    drawBackground();
    drawSmoke();
    drawFountains();
    drawRockets();
    drawFireworks();
    drawText();

    if (time - lastRocket > 650) {
        launchRocket();
        lastRocket = time;
    }

    if (time - lastFountain > 100) {
        createFountain(W * .12);
        createFountain(W * .35);
        createFountain(W * .65);
        createFountain(W * .88);

        lastFountain = time;
    }

    requestAnimationFrame(animate);
}

// Click or touch
canvas.addEventListener("pointerdown", e => {
    explosion(e.clientX, e.clientY);
});

// Start
window.addEventListener("resize", resize);

resize();
requestAnimationFrame(animate);