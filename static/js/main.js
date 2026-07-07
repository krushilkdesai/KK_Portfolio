/* ==========================================================================
   Krushil Desai - Premium Cinematic Portfolio JS
   Libraries: GSAP, ScrollTrigger, Lenis, SplitType
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Custom Cursor Follower ---
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant position for the dot
        gsap.set(dot, { x: mouseX, y: mouseY });
    });
    
    // Smooth frame loop for the outer ring (lag effect)
    gsap.ticker.add(() => {
        const dt = 1.0 - Math.pow(1.0 - 0.16, gsap.ticker.deltaRatio());
        ringX += (mouseX - ringX) * dt;
        ringY += (mouseY - ringY) * dt;
        gsap.set(ring, { x: ringX, y: ringY });
    });

    // Expand cursor ring on interactive elements
    const addCursorHover = (elements) => {
        elements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hover-interactive');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hover-interactive');
            });
        });
    };

    // Magnetic Element Effect (snaps elements slightly to mouse cursor)
    const initMagnetic = () => {
        const magneticElems = document.querySelectorAll('[data-cursor-magnetic]');
        magneticElems.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                // Move elements slightly towards mouse (35% speed)
                gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: "power2.out" });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            });
        });
    };

    // Attach cursors to common hover elements
    const refreshCursorHovers = () => {
        const hovers = document.querySelectorAll('a, button, input, textarea, [data-cursor-magnetic]');
        addCursorHover(hovers);
    };

    refreshCursorHovers();
    initMagnetic();

    // --- 2. Lenis Smooth Scroll ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // --- 3. Cinematic Loading Screen ---
    const loader = document.getElementById('loader');
    const loaderNum = document.getElementById('loader-num');
    const loaderBar = document.querySelector('.loader-bar');
    
    let loaderProgress = { value: 0 };
    
    const loaderTl = gsap.timeline({
        onComplete: () => {
            // Loader is done - remove it
            if (loader) loader.style.display = 'none';
        }
    });

    gsap.to(loaderProgress, {
        value: 100,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => {
            const currentVal = Math.floor(loaderProgress.value);
            if (loaderNum) {
                // Pad with zeros (e.g. 008, 042, 100)
                loaderNum.innerText = currentVal.toString().padStart(3, '0');
            }
            if (loaderBar) {
                loaderBar.style.width = `${currentVal}%`;
            }
        },
        onComplete: () => {
            // Completed counter - execute slide reveals
            loaderTl.to('.loader-content', {
                opacity: 0,
                y: -50,
                duration: 0.4,
                ease: "power2.in"
            })
            .to('.loader-slide.slide-2', {
                yPercent: -100,
                duration: 0.7,
                ease: "power4.inOut"
            })
            .to('.loader-slide.slide-1', {
                yPercent: -100,
                duration: 0.7,
                ease: "power4.inOut"
            }, "-=0.55")
            .to('header', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.2")
            .from('.hero-subtext', {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.3")
            .from('.hero-huge-title .reveal-word', {
                yPercent: 100,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.4")
            .from('.hero-desc-text, .hero-cta-group, .scroll-indicator', {
                opacity: 0,
                y: 25,
                stagger: 0.1,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.3");
        }
    });

    // --- 4. SplitType & Reveal Animations ---
    const splitElements = document.querySelectorAll('.split-text-reveal');
    let splits = [];

    function initSplits() {
        splits.forEach(s => {
            try { s.revert(); } catch(e) {}
        });
        splits = [];

        splitElements.forEach(el => {
            const splitText = new SplitType(el, { types: 'lines, words' });
            splits.push(splitText);
            
            gsap.fromTo(splitText.words, 
                { opacity: 0.15 },
                {
                    opacity: 1,
                    stagger: 0.015,
                    duration: 1.2,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        end: 'top 45%',
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                }
            );
        });
    }

    initSplits();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initSplits();
            ScrollTrigger.refresh();
        }, 250);
    });

    // --- 5. Horizontal Projects Scrolling Section ---
    const scrollContainer = document.getElementById('work');
    const scrollWrapper = document.querySelector('.horizontal-scroll-wrapper');
    
    if (scrollContainer && scrollWrapper) {
        let mm = gsap.matchMedia();

        mm.add("(min-width: 992px)", () => {
            gsap.to(scrollWrapper, {
                x: () => -(scrollWrapper.scrollWidth - window.innerWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: scrollContainer,
                    pin: true,
                    scrub: 1.2,
                    start: 'top top',
                    end: () => '+=' + (scrollWrapper.scrollWidth - window.innerWidth),
                    invalidateOnRefresh: true
                }
            });
        });
    }

    // --- 6. Stats Section Numeric Counters ---
    const statCounters = document.querySelectorAll('.count-stat');
    statCounters.forEach(counter => {
        const targetVal = parseInt(counter.getAttribute('data-target'), 10);
        
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 92%',
            onEnter: () => {
                let counterObj = { value: 0 };
                gsap.to(counterObj, {
                    value: targetVal,
                    duration: 1.6,
                    ease: "power3.out",
                    onUpdate: () => {
                        counter.innerText = Math.ceil(counterObj.value);
                    }
                });
            },
            once: true
        });
    });

    // --- 7. Skills Constellation Interactive Canvas ---
    const canvas = document.getElementById('skills-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        
        canvas.width = width;
        canvas.height = height;

        const skillsList = [
            'Python', 'SQL', 'Machine Learning', 'Deep Learning', 'NLP', 'LLMs', 
            'Generative AI', 'Data Analysis', 'Feature Engineering', 'EDA', 
            'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Flask', 
            'Django', 'MySQL', 'Git', 'GitHub', 'API Integration', 'Model Deployment'
        ];

        class SkillNode {
            constructor(text, x, y) {
                this.text = text;
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = 4;
                this.fontSize = Math.floor(Math.random() * 3) + 11; // 11px to 13px
                this.density = (Math.random() * 30) + 15;
            }

            draw() {
                // Node dot
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ccff00';
                ctx.fill();

                // Text
                ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
                ctx.font = `600 ${this.fontSize}px 'Space Grotesk', sans-serif`;
                ctx.fillText(this.text, this.x + 8, this.y + 4);
            }

            update(mx, my) {
                // Natural movement
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off boundaries
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Magnetic push/pull from cursor
                const dx = mx - this.x;
                const dy = my - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxForceDistance = 160;

                if (dist < maxForceDistance) {
                    const force = (maxForceDistance - dist) / maxForceDistance;
                    const dirX = dx / dist;
                    const dirY = dy / dist;
                    
                    // Pull effect
                    this.x += dirX * force * 3;
                    this.y += dirY * force * 3;
                } else {
                    // Drift back to neutral base
                    const dxBase = this.baseX - this.x;
                    const dyBase = this.baseY - this.y;
                    this.x += dxBase * 0.01;
                    this.y += dyBase * 0.01;
                }
            }
        }

        const nodes = [];
        
        // Distribute nodes across canvas space
        const createNodes = () => {
            nodes.length = 0;
            const cols = 5;
            const rows = 4;
            const cellW = width / cols;
            const cellH = height / rows;

            let skillIndex = 0;
            for (let i = 0; i < cols && skillIndex < skillsList.length; i++) {
                for (let j = 0; j < rows && skillIndex < skillsList.length; j++) {
                    // Center offset with a bit of random offset inside the grid cell
                    const cx = (i * cellW) + (cellW / 2) + ((Math.random() - 0.5) * cellW * 0.5);
                    const cy = (j * cellH) + (cellH / 2) + ((Math.random() - 0.5) * cellH * 0.5);
                    nodes.push(new SkillNode(skillsList[skillIndex], cx, cy));
                    skillIndex++;
                }
            }
        };
        createNodes();

        // Track cursor on canvas
        let mCanvasX = -9999;
        let mCanvasY = -9999;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mCanvasX = e.clientX - rect.left;
            mCanvasY = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mCanvasX = -9999;
            mCanvasY = -9999;
        });

        // Animation Loop
        const animateCanvas = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw links first
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 140) {
                        ctx.strokeStyle = `rgba(204, 255, 0, ${0.12 - (distance / 140) * 0.12})`;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach(node => {
                node.update(mCanvasX, mCanvasY);
                node.draw();
            });

            requestAnimationFrame(animateCanvas);
        };
        animateCanvas();

        // Responsive resize listener
        window.addEventListener('resize', () => {
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width;
            canvas.height = height;
            createNodes();
        });
    }

    // --- 8. Contact Form AJAX Submission Handler ---
    const contactForm = document.getElementById('contactForm');
    const formNotify = document.getElementById('formNotification');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && formNotify && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous notification
            formNotify.style.display = 'none';
            formNotify.className = 'form-notification';

            // Gather elements
            const name = document.getElementById('formName').value.trim();
            const email = document.getElementById('formEmail').value.trim();
            const subject = document.getElementById('formSubject').value.trim();
            const message = document.getElementById('formMessage').value.trim();

            // Client Validation
            if (!name || !email || !subject || !message) {
                showNotification('FILL ALL REQUIRED FIELD SECTIONS.', 'error');
                return;
            }

            const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
            if (!emailPattern.test(email)) {
                showNotification('PROVIDE A VALID CONTACT EMAIL.', 'error');
                return;
            }

            if (message.length < 10) {
                showNotification('THE BRIEF SHOULD EXCEED 10 CHARACTERS.', 'error');
                return;
            }

            setFormDisabled(true);

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, subject, message })
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    showNotification('MESSAGE RECEIVED. KRUSHIL WILL CONNECT SHORTLY.', 'success');
                    contactForm.reset();
                } else {
                    showNotification(result.message || 'TRANSMISSION FAILED. TRY AGAIN.', 'error');
                }
            } catch (error) {
                console.error(error);
                showNotification('CONNECTION LOST. CHECK NETWORK INTERFACE.', 'error');
            } finally {
                setFormDisabled(false);
                refreshCursorHovers();
            }
        });

        const showNotification = (msg, type) => {
            formNotify.innerText = msg;
            formNotify.classList.add(type);
            formNotify.style.display = 'block';
            formNotify.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        const setFormDisabled = (disabled) => {
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.disabled = disabled;
            });
            if (disabled) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'TRANSMITTING...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'SEND MESSAGE <i class="bi bi-arrow-right"></i>';
            }
        };
    }
});
