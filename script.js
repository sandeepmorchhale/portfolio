// ==========================================================================
// 1. INTERACTIVE CANVAS PARTICLE SYSTEM (Plexus Effect with Spotlight & Bursts)
// ==========================================================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Create dynamic mouse-glow element in document body
const mouseGlow = document.createElement('div');
mouseGlow.className = 'mouse-glow';
document.body.appendChild(mouseGlow);

// Handle resize
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const particles = [];
const maxParticles = Math.min(75, Math.floor((width * height) / 16000)); // Responsive count
const connectionDistance = 125;
const mouse = { x: null, y: null, radius: 160 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Position spotlight
    mouseGlow.style.left = e.clientX + 'px';
    mouseGlow.style.top = e.clientY + 'px';
    mouseGlow.style.opacity = '1';
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    mouseGlow.style.opacity = '0';
});

// Interactive Click Wave Burst
window.addEventListener('click', (e) => {
    const burstCount = 10;
    for (let i = 0; i < burstCount; i++) {
        particles.push(new Particle(e.clientX, e.clientY, true));
    }
    // Limit total particles to prevent performance hit
    if (particles.length > maxParticles + 30) {
        particles.splice(0, burstCount);
    }
});

class Particle {
    constructor(x, y, isBurst = false) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        
        const speedMultiplier = isBurst ? 2.2 : 0.6;
        this.vx = (Math.random() - 0.5) * speedMultiplier;
        this.vy = (Math.random() - 0.5) * speedMultiplier;
        
        this.radius = isBurst ? Math.random() * 2.5 + 1 : Math.random() * 2 + 1;
        this.isBurst = isBurst;
        this.life = isBurst ? 1.0 : null; // Fading life for burst particles
        this.color = isBurst ? 'rgba(20, 184, 166, ' : 'rgba(129, 140, 248, ';
    }

    update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Decelerate and fade burst particles
        if (this.isBurst) {
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.life -= 0.015;
        }

        // Mouse interaction (gentle repulsion)
        if (!this.isBurst && mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * force * 1.5;
                this.y += Math.sin(angle) * force * 1.5;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (this.isBurst) {
            ctx.fillStyle = `${this.color}${this.life})`;
        } else {
            ctx.fillStyle = 'rgba(129, 140, 248, 0.45)'; // Indigo
        }
        
        // Add subtle glow to each particle
        ctx.shadowBlur = this.isBurst ? 10 : 6;
        ctx.shadowColor = this.isBurst ? 'rgba(20, 184, 166, 0.6)' : 'rgba(129, 140, 248, 0.4)';
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow glow
    }
}

// Initialize base particles
for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles, filtering out dead burst ones
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.isBurst && p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        p.update();
        p.draw();
    }

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Connect particles to mouse cursor (glowing interactive nodes)
        if (mouse.x !== null && mouse.y !== null) {
            const dx = p1.x - mouse.x;
            const dy = p1.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance * 1.1) {
                const alpha = (1 - dist / (connectionDistance * 1.1)) * 0.22;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(20, 184, 166, ${alpha})`; // Teal connections to cursor
                ctx.lineWidth = 0.9;
                ctx.stroke();
            }
        }

        // Connect particles to each other
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                const alpha = (1 - dist / connectionDistance) * 0.15;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = (p1.isBurst || p2.isBurst)
                    ? `rgba(20, 184, 166, ${alpha})` // Teal connection lines
                    : `rgba(99, 102, 241, ${alpha})`; // Indigo connection lines
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}
animate();


// ==========================================================================
// 2. MOBILE MENU & NAVIGATION STICKY ACTIVE STATES
// ==========================================================================
const navToggle = document.getElementById('nav-toggle');
const navLinksContainer = document.getElementById('nav-links');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const header = document.querySelector('.main-header');

// Sticky header styling on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Update active nav links based on viewport scroll position
    let currentSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
});

// Mobile menu toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle) navToggle.classList.remove('active');
        if (navLinksContainer) navLinksContainer.classList.remove('active');
    });
});


// ==========================================================================
// 3. STATS COUNTER ANIMATION WITH INTERSECTION OBSERVER
// ==========================================================================
const statsSection = document.querySelector('.stats');
const counters = document.querySelectorAll('.count');

const startCounterAnimation = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let current = 0;
        const increment = target / 50; // Controls speed duration
        
        const update = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                setTimeout(update, 30);
            } else {
                counter.innerText = target;
            }
        };
        update();
    });
};

if (statsSection && counters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounterAnimation();
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// ==========================================================================
// 4. SKILLS PROGRESS BAR ANIMATION WITH INTERSECTION OBSERVER
// ==========================================================================
const skillBars = document.querySelectorAll('.skill-bar-fill');
if (skillBars.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.getAttribute('data-percent');
                skillObserver.unobserve(bar); // Trigger only once
            }
        });
    }, { threshold: 0.1 });

    skillBars.forEach(bar => skillObserver.observe(bar));
}
