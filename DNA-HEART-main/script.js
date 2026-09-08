(function () {
    "use strict";

    var canvas = document.getElementById("heart");
    var ctx = canvas.getContext("2d");
    var message = document.querySelector(".love-message");
    var width = 0;
    var height = 0;
    var dpr = 1;
    var centerX = 0;
    var centerY = 0;
    var elapsed = 0;
    var lastTime = 0;
    var phase = "idle";
    var phaseTime = 0;
    var messageX = 0;
    var messageY = 0;
    var messageVX = 1.1;
    var messageVY = 0.75;
    var mobile = window.matchMedia("(max-width: 700px)").matches || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    var config = { particles: mobile ? 720 : 1500, symbolHearts: mobile ? 90 : 180, dust: mobile ? 65 : 130, sparks: mobile ? 30 : 60, maxDpr: mobile ? 1.5 : 2 };
    var mouse = { x: 0, y: 0, active: false };
    var particles = [];
    var symbolHearts = [];
    var dust = [];
    var sparks = [];
    var ripples = [];
    var bursts = [];

    function heartPosition(angle) {
        return [Math.pow(Math.sin(angle), 3), -(15 * Math.cos(angle) - 5 * Math.cos(angle * 2) - 2 * Math.cos(angle * 3) - Math.cos(angle * 4))];
    }

    function heartPoint(index, pulse) {
        var point = heartPosition(index * Math.PI * 2);
        var size = Math.min(width, height);
        return { x: centerX + point[0] * size * 0.27 * pulse, y: centerY + point[1] * size * 0.021 * pulse };
    }

    function heartbeat() {
        if (phase !== "complete") return 0;
        var cycle = elapsed % 3.15;
        return Math.min(1, Math.exp(-Math.pow((cycle - 0.18) / 0.105, 2)) + Math.exp(-Math.pow((cycle - 0.42) / 0.075, 2)) * 0.72);
    }

    function color(alpha) {
        var colors = ["255,23,68", "220,20,60", "139,0,0", "255,75,105", "180,8,35"];
        return "rgba(" + colors[Math.floor(Math.random() * colors.length)] + "," + alpha + ")";
    }

    function makeParticle() {
        var angle = Math.random() * Math.PI * 2;
        var radius = Math.random() * Math.min(width, height) * 0.55;
        return { index: Math.floor(Math.random() * 520) / 520, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, size: 0.5 + Math.random() * 1.8, alpha: 0.3 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2, color: color(0.85) };
    }

    function makeDust() {
        var angle = Math.random() * Math.PI * 2;
        var radius = Math.random() * Math.min(width, height) * 0.6;
        return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius, phase: Math.random() * Math.PI * 2, size: 0.3 + Math.random() * 1.1, alpha: 0.08 + Math.random() * 0.28 };
    }

    function makeSymbolHeart() {
        var angle = Math.random() * Math.PI * 2;
        var radius = Math.random() * Math.min(width, height) * 0.28;
        return {
            index: Math.floor(Math.random() * 160) / 160,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            size: 7 + Math.random() * 8,
            alpha: 0.25 + Math.random() * 0.65,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.72 ? "#ff91a5" : "#dc143c"
        };
    }

    function createSpark(x, y, force) {
        var angle = Math.random() * Math.PI * 2;
        var speed = (0.4 + Math.random() * 2) * (force || 1);
        return { x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.5 + Math.random(), maxLife: 1.5, size: 0.5 + Math.random() * 1.8 };
    }

    function resetParticles() {
        var i;
        particles.length = 0;
        symbolHearts.length = 0;
        dust.length = 0;
        for (i = 0; i < config.particles; i += 1) particles.push(makeParticle());
        for (i = 0; i < config.symbolHearts; i += 1) symbolHearts.push(makeSymbolHeart());
        for (i = 0; i < config.dust; i += 1) dust.push(makeDust());
    }

    function resetSparks() {
        sparks.length = 0;
        for (var i = 0; i < config.sparks; i += 1) {
            var spark = createSpark(centerX + (Math.random() - 0.5) * width * 0.7, centerY + (Math.random() - 0.5) * height * 0.7, 0.2);
            spark.life = Math.random() * 1.5;
            sparks.push(spark);
        }
    }

    function begin() {
        if (phase !== "idle") return;
        phase = "forming";
        phaseTime = 0;
        for (var i = 0; i < particles.length; i += 1) {
            var angle = Math.random() * Math.PI * 2;
            var speed = 2 + Math.random() * 7;
            particles[i].x = centerX;
            particles[i].y = centerY;
            particles[i].vx = Math.cos(angle) * speed;
            particles[i].vy = Math.sin(angle) * speed;
        }
        for (var j = 0; j < 90; j += 1) bursts.push(createSpark(centerX, centerY, 2.5));
        ripples.push({ radius: 4, alpha: 1, speed: 8 });
    }

    function clickBurst(x, y) {
        ripples.push({ x: x, y: y, radius: 6, alpha: 1, speed: 5 });
        for (var i = 0; i < 22; i += 1) bursts.push(createSpark(x, y, 2.5));
    }

    function wingPoint(side, t, feather) {
        var size = Math.min(width, height);
        var baseX = size * 0.285;
        var baseY = centerY + (feather - 2.5) * size * 0.018;
        var reach = size * (0.25 + feather * 0.02);
        var arch = size * (0.09 + feather * 0.014);
        var wave = Math.sin(t * 7 + feather * 1.4 + elapsed * 1.4) * size * 0.006;
        return {
            x: centerX + side * (baseX + t * reach + wave),
            y: baseY - Math.sin(t * Math.PI * 0.92) * arch - t * size * 0.16 + Math.sin(t * 4 + elapsed) * 2
        };
    }

    function drawBackground(beat) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(5,0,5,.25)";
        ctx.fillRect(0, 0, width, height);
        var glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.7);
        glow.addColorStop(0, "rgba(115,0,25," + (0.08 + beat * 0.08) + ")");
        glow.addColorStop(0.48, "rgba(45,0,15,.045)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        var size = Math.min(width, height);
        var moonX = centerX;
        var moonY = height * 0.38;
        var moonRadius = size * 0.28;
        var moon = ctx.createRadialGradient(moonX - moonRadius * 0.22, moonY - moonRadius * 0.25, moonRadius * 0.08, moonX, moonY, moonRadius);
        moon.addColorStop(0, "rgba(255,55,55,.18)");
        moon.addColorStop(0.58, "rgba(139,0,0,.13)");
        moon.addColorStop(0.9, "rgba(75,0,10,.08)");
        moon.addColorStop(1, "rgba(20,0,4,0)");
        ctx.fillStyle = moon;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(150,0,20,.12)";
        ctx.lineWidth = 1;
        for (var ring = 0; ring < 5; ring += 1) {
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius * (0.72 + ring * 0.055), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        var horizon = ctx.createLinearGradient(0, height * 0.62, 0, height);
        horizon.addColorStop(0, "rgba(100,0,12,.08)");
        horizon.addColorStop(1, "rgba(0,0,0,.42)");
        ctx.fillStyle = horizon;
        ctx.fillRect(0, height * 0.62, width, height * 0.38);

        ctx.fillStyle = "rgba(8,0,7,.7)";
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, height * .78);
        ctx.lineTo(width * .08, height * .7);
        ctx.lineTo(width * .14, height * .84);
        ctx.lineTo(width * .22, height * .73);
        ctx.lineTo(width * .31, height * .86);
        ctx.lineTo(width * .4, height * .78);
        ctx.lineTo(width * .52, height * .87);
        ctx.lineTo(width * .68, height * .76);
        ctx.lineTo(width * .8, height * .83);
        ctx.lineTo(width * .9, height * .7);
        ctx.lineTo(width, height * .79);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
    }

    function drawIdle() {
        var pulse = 0.65 + Math.sin(elapsed * 2.4) * 0.16;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = "#ff1744";
        ctx.shadowBlur = 18 + pulse * 22;
        ctx.fillStyle = "rgba(255,23,68," + (0.72 + pulse * 0.2) + ")";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2.1 + pulse * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawDust(delta) {
        if (phase === "idle") return;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (var i = 0; i < dust.length; i += 1) {
            var speck = dust[i];
            speck.x += Math.sin(elapsed + speck.phase) * delta * 1.5;
            speck.y += Math.cos(elapsed * 0.7 + speck.phase) * delta * 1.5;
            ctx.fillStyle = "rgba(220,20,60," + speck.alpha + ")";
            ctx.fillRect(speck.x, speck.y, speck.size, speck.size);
        }
        ctx.restore();
    }

    function drawFormation(delta, beat) {
        var progress = phase === "forming" ? Math.min(1, phaseTime / 5.5) : 1;
        var pulse = 1 + beat * 0.06;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (var i = 0; i < particles.length; i += 1) {
            var particle = particles[i];
            var target = heartPoint(particle.index, pulse);
            var distance = mouse.active ? Math.hypot(target.x - mouse.x, target.y - mouse.y) : 9999;
            var influence = Math.max(0, 1 - distance / 170);
            var orbit = Math.sin(elapsed * 0.9 + particle.phase) * (1 - progress) * 50;
            var targetX = centerX + (target.x - centerX) * progress + orbit;
            var targetY = centerY + (target.y - centerY) * progress + Math.cos(particle.phase) * (1 - progress) * 50;
            particle.vx += (targetX - particle.x) * delta * (2.8 + progress * 5);
            particle.vy += (targetY - particle.y) * delta * (2.8 + progress * 5);
            particle.vx *= 0.88;
            particle.vy *= 0.88;
            particle.x += particle.vx * delta * 60 + (mouse.x - particle.x) * influence * delta * 0.22;
            particle.y += particle.vy * delta * 60 + (mouse.y - particle.y) * influence * delta * 0.22;
            var size = particle.size * (1 + beat * 0.5 + influence * 0.4);
            ctx.globalAlpha = particle.alpha * (0.18 + progress * 0.82) * (0.75 + beat * 0.3);
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
        }
        ctx.restore();
    }

    function drawSymbolHearts(delta, beat) {
        if (phase === "idle") return;
        var progress = phase === "forming" ? Math.min(1, phaseTime / 5.5) : 1;
        var size = Math.min(width, height);
        var spiralRadius = Math.max(width, height) * 0.72;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (var i = 0; i < symbolHearts.length; i += 1) {
            var heart = symbolHearts[i];
            var orbitSpeed = 0.3 + (i % 9) * 0.018;
            var angle = heart.phase + elapsed * orbitSpeed + heart.index * Math.PI * 8;
            var radius = ((heart.index * spiralRadius) + elapsed * (8 + heart.index * 14)) % spiralRadius;
            var swirl = Math.sin(elapsed * 1.2 + heart.phase) * size * 0.035;
            var targetX = centerX + Math.cos(angle) * (radius + swirl);
            var targetY = centerY + Math.sin(angle) * (radius + swirl) * 0.62;
            heart.x += (targetX - heart.x) * delta * (3 + progress * 4);
            heart.y += (targetY - heart.y) * delta * (3 + progress * 4);
            var float = Math.sin(elapsed * 1.8 + heart.phase) * 2.5;
            ctx.globalAlpha = heart.alpha * (0.2 + progress * 0.8) * (0.75 + beat * 0.25);
            ctx.fillStyle = heart.color;
            ctx.font = (heart.size * (1 + beat * 0.2)) + "px Georgia, serif";
            ctx.shadowBlur = 10 + beat * 8;
            ctx.shadowColor = "#ff1744";
            ctx.fillText("♥", heart.x, heart.y + float);
        }
        ctx.restore();
    }

    function drawWings(progress, beat) {
        if (progress < 0.28) return;
        var reveal = Math.min(1, (progress - 0.28) / 0.72);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Pointed outer silhouettes echo the sharp wing shapes in the reference.
        for (var bladeSide = -1; bladeSide <= 1; bladeSide += 2) {
            var bladeSize = Math.min(width, height);
            var bladeBaseX = centerX + bladeSide * bladeSize * 0.285;
            var bladeTipX = centerX + bladeSide * bladeSize * 0.69 * reveal;
            ctx.beginPath();
            ctx.moveTo(bladeBaseX, centerY + bladeSize * 0.035);
            ctx.lineTo(bladeTipX, centerY - bladeSize * 0.25);
            ctx.quadraticCurveTo(centerX + bladeSide * bladeSize * 0.53, centerY - bladeSize * 0.1, bladeBaseX, centerY - bladeSize * 0.02);
            ctx.closePath();
            ctx.fillStyle = "rgba(130,0,16,.11)";
            ctx.strokeStyle = "rgba(255,38,72,.68)";
            ctx.lineWidth = 1.2 + beat;
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#b00016";
            ctx.fill();
            ctx.stroke();
        }

        for (var ribbon = 0; ribbon < (mobile ? 5 : 7); ribbon += 1) {
            for (var side = -1; side <= 1; side += 2) {
                ctx.beginPath();
                var steps = Math.floor(32 * reveal);
                for (var step = 0; step <= steps; step += 1) {
                    var point = wingPoint(side, step / 32, ribbon);
                    if (step === 0) ctx.moveTo(point.x, point.y);
                    else ctx.lineTo(point.x, point.y);
                }
                ctx.lineWidth = ribbon === 0 ? 2 + beat * 1.8 : 0.7;
                ctx.strokeStyle = ribbon === 0 ? "rgba(255,23,68,.82)" : "rgba(190,0,38,.42)";
                ctx.shadowBlur = ribbon === 0 ? 24 + beat * 18 : 10;
                ctx.shadowColor = "#dc143c";
                ctx.stroke();

                if (ribbon > 0) {
                    var featherBase = wingPoint(side, 0.1, ribbon);
                    var featherTip = wingPoint(side, 0.86, ribbon);
                    ctx.beginPath();
                    ctx.moveTo(featherBase.x, featherBase.y);
                    ctx.lineTo(featherTip.x, featherTip.y);
                    ctx.lineWidth = 0.35;
                    ctx.strokeStyle = "rgba(255,85,112,.34)";
                    ctx.stroke();
                }
            }
        }

        // Short tapered shafts make the outer arcs read as layered feathers.
        for (var feather = 0; feather < 6; feather += 1) {
            for (var wingSide = -1; wingSide <= 1; wingSide += 2) {
                var size = Math.min(width, height);
                var startX = centerX + wingSide * size * 0.29;
                var startY = centerY + (feather - 2.5) * size * 0.018;
                var endX = centerX + wingSide * size * (0.43 + feather * 0.045) * reveal;
                var endY = centerY - size * (0.18 - feather * 0.018) - feather * size * 0.012;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(
                    centerX + wingSide * size * (0.35 + feather * 0.02),
                    centerY - size * (0.08 + feather * 0.025),
                    endX,
                    endY
                );
                ctx.lineWidth = 0.8 + beat * 0.5;
                ctx.strokeStyle = "rgba(255,52,91,.48)";
                ctx.shadowBlur = 12;
                ctx.shadowColor = "#ff1744";
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    function drawEffects(delta, beat) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (var i = sparks.length - 1; i >= 0; i -= 1) {
            var spark = sparks[i];
            spark.x += spark.vx * delta * 60;
            spark.y += spark.vy * delta * 60;
            spark.life -= delta * 0.12;
            if (spark.life <= 0) { spark.life = 1.4; spark.x = centerX + (Math.random() - 0.5) * width * 0.7; spark.y = centerY + (Math.random() - 0.5) * height * 0.7; }
            ctx.globalAlpha = Math.max(0, spark.life / spark.maxLife) * (0.5 + beat * 0.4);
            ctx.fillStyle = i % 8 === 0 ? "#ffb0bc" : "#ff1744";
            ctx.fillRect(spark.x, spark.y, spark.size, spark.size);
        }
        for (var j = bursts.length - 1; j >= 0; j -= 1) {
            var burst = bursts[j];
            burst.x += burst.vx * delta * 60;
            burst.y += burst.vy * delta * 60;
            burst.vx *= 0.97;
            burst.vy *= 0.97;
            burst.life -= delta;
            ctx.globalAlpha = Math.max(0, burst.life / burst.maxLife);
            ctx.fillStyle = "#ff5575";
            ctx.fillRect(burst.x, burst.y, burst.size, burst.size);
            if (burst.life <= 0) bursts.splice(j, 1);
        }
        ctx.restore();
    }

    function drawRipples(delta) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (var i = ripples.length - 1; i >= 0; i -= 1) {
            var ripple = ripples[i];
            ripple.radius += ripple.speed * delta * 60;
            ripple.alpha -= delta * 0.55;
            ctx.beginPath();
            ctx.arc(ripple.x || centerX, ripple.y || centerY, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,23,68," + Math.max(0, ripple.alpha * 0.45) + ")";
            ctx.shadowBlur = 16;
            ctx.shadowColor = "#dc143c";
            ctx.stroke();
            if (ripple.alpha <= 0) ripples.splice(i, 1);
        }
        ctx.restore();
    }

    function vignette() {
        var gradient = ctx.createRadialGradient(centerX, centerY, Math.min(width, height) * 0.2, centerX, centerY, Math.max(width, height) * 0.72);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.75, "rgba(0,0,0,.14)");
        gradient.addColorStop(1, "rgba(0,0,0,.86)");
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function moveLoveMessage(delta) {
        if (!message.classList.contains("visible")) return;
        var messageWidth = message.offsetWidth;
        var messageHeight = message.offsetHeight;
        var padding = 24;
        messageX += messageVX * delta * 60;
        messageY += messageVY * delta * 60;
        if (messageX < padding || messageX > width - padding) {
            messageVX *= -1;
            messageX = Math.max(padding, Math.min(width - padding, messageX));
        }
        if (messageY < padding || messageY > height - padding) {
            messageVY *= -1;
            messageY = Math.max(padding, Math.min(height - padding, messageY));
        }
        message.style.left = messageX + "px";
        message.style.top = messageY + "px";
        message.style.transform = "translate(-50%, -50%) rotate(" + Math.sin(elapsed * 2.2) * 3 + "deg)";
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr);
        width = window.innerWidth;
        height = window.innerHeight;
        centerX = width / 2;
        centerY = height * 0.5;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        resetParticles();
        resetSparks();
    }

    function animate(timestamp) {
        var delta = Math.min(0.033, lastTime ? (timestamp - lastTime) / 1000 : 0.016);
        lastTime = timestamp;
        elapsed += delta;
        phaseTime += delta;
        if (phase === "forming" && phaseTime > 7.5) {
            phase = "complete";
            message.classList.add("visible");
        }
        var beat = heartbeat();
        var progress = phase === "idle" ? 0 : Math.min(1, phaseTime / 5.5);
        drawBackground(beat);
        drawDust(delta);
        if (phase === "idle") drawIdle();
        else { drawWings(progress, beat); drawFormation(delta, beat); }
        drawSymbolHearts(delta, beat);
        drawEffects(delta, beat);
        drawRipples(delta);
        vignette();
        moveLoveMessage(delta);
        requestAnimationFrame(animate);
    }

    function pointerMove(event) {
        var point = event.touches ? event.touches[0] : event;
        if (!point) return;
        mouse.x = point.clientX;
        mouse.y = point.clientY;
        mouse.active = true;
        if (phase === "idle" && Math.hypot(mouse.x - centerX, mouse.y - centerY) < 45) begin();
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", pointerMove);
    window.addEventListener("touchstart", function (event) { pointerMove(event); begin(); clickBurst(mouse.x, mouse.y); }, { passive: true });
    window.addEventListener("touchmove", pointerMove, { passive: true });
    window.addEventListener("mouseleave", function () { mouse.active = false; });
    window.addEventListener("click", function (event) {
        if (phase === "idle") begin();
        else clickBurst(event.clientX, event.clientY);
    });

    resize();
    messageX = width * 0.5;
    messageY = height * 0.72;
    requestAnimationFrame(animate);
}());
