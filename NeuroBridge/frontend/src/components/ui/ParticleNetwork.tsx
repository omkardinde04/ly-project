import React, { useEffect, useRef } from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function ParticleNetwork({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduceMotion } = useDyslexia();

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    // Listen on window since canvas is pointer-events-none
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor(width: number, height: number, startX?: number, startY?: number) {
        this.x = startX !== undefined ? startX : Math.random() * width;
        this.y = startY !== undefined ? startY : Math.random() * height;
        // Slow horizontal movement
        this.vx = (Math.random() - 0.5) * 0.4;
        // Anti-gravity bias: moves upward more than downward
        this.vy = (Math.random() - 0.8) * 0.4;
        this.radius = Math.random() * 1.5 + 0.8;
      }

      update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen seamlessly
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        let opacity = 0.4;

        // 1. Fade out near the bottom (keeps the bottom cards clear of dots)
        const bottomFadeHeight = 220; 
        if (this.y > height - bottomFadeHeight) {
          opacity *= Math.max(0, (height - this.y) / bottomFadeHeight);
        }

        // 2. Fade out near the center heading text and buttons to maintain readability
        // Instead of completely hiding them, fade them to be very faint and light.
        const textX = width / 2;
        const textY = 240; 
        // Use an elliptical distance (divide dx by 1.5) because the text block is wider than it is tall
        const dx = (this.x - textX) / 1.5;
        const dy = this.y - textY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 350) {
           // Fade down to a minimum of ~15% of their original opacity (so they remain as faint specks)
           const fadeFactor = 0.15 + 0.85 * Math.pow(dist / 350, 2);
           opacity *= Math.min(1, fadeFactor); 
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`; 
        ctx.fill();
        
        return opacity;
      }
    }

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = window.innerWidth;
        canvas.height = parent.offsetHeight;
        
        // Calculate density based on surface area - DRAMATICALLY INCREASED
        const area = canvas.width * canvas.height;
        // Super high max limit so ultra-wide screens are completely filled
        const numParticles = Math.min(Math.floor(area / 2500), 800); 
        
        // Generate cluster centers (about 1 cluster per 20 particles)
        const numClusters = Math.max(1, Math.floor(numParticles / 20));
        const clusters = [];
        for (let i = 0; i < numClusters; i++) {
          clusters.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
          });
        }
        
        particles = [];
        for (let i = 0; i < numParticles; i++) {
          // 80% of particles spawn near a cluster center, 20% are completely random
          if (Math.random() < 0.8 && clusters.length > 0) {
            const cluster = clusters[Math.floor(Math.random() * clusters.length)];
            // Use random angle and distance for a natural gaussian-like spread
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200; // cluster radius
            particles.push(new Particle(canvas.width, canvas.height, cluster.x + Math.cos(angle) * distance, cluster.y + Math.sin(angle) * distance));
          } else {
            particles.push(new Particle(canvas.width, canvas.height));
          }
        }
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw each particle, saving its opacity state for connections
      const particleOpacities = particles.map((p) => {
        p.update(canvas.width, canvas.height);
        return p.draw(ctx, canvas.width, canvas.height);
      });

      // Draw neural connections between close particles and the mouse
      const pDistMax = 110;
      const mDistMax = 180;

      for (let i = 0; i < particles.length; i++) {
        // Skip connections if the particle is completely invisible
        if (particleOpacities[i] < 0.01) continue;

        // Connections between particles
        for (let j = i + 1; j < particles.length; j++) {
          if (particleOpacities[j] < 0.01) continue;

          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < pDistMax) {
            ctx.beginPath();
            // Scale line opacity by distance AND the fade-out zones
            const lineBaseOpacity = 0.15 * (1 - distance / pDistMax);
            const finalLineOpacity = lineBaseOpacity * (particleOpacities[i] / 0.4) * (particleOpacities[j] / 0.4);
            
            ctx.strokeStyle = `rgba(99, 102, 241, ${finalLineOpacity})`; 
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Connection to mouse
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mDist < mDistMax) {
          ctx.beginPath();
          const mouseLineOpacity = 0.3 * (1 - mDist / mDistMax) * (particleOpacities[i] / 0.4);
          ctx.strokeStyle = `rgba(139, 92, 246, ${mouseLineOpacity})`; 
          ctx.lineWidth = 1.0;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
