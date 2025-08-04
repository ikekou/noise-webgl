/**
 * 3D Simplex Noise Pixi.js Visualization - Modular Implementation
 * 
 * This example demonstrates how to use the reusable NoiseFilter
 * in a Pixi.js application.
 */

import { NoiseFilter } from './NoiseFilter.js';

class NoisePixiApp {
    constructor() {
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();
        this.lastFpsDisplay = Date.now();
        
        this.init();
    }
    
    init() {
        // Create Pixi Application
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        // Add canvas to DOM
        document.getElementById('app').appendChild(this.app.view);
        
        // Create the reusable noise filter
        this.noiseFilter = new NoiseFilter({
            noiseScale: 5.0,
            animationSpeed: 0.2,
            resolution: [window.innerWidth, window.innerHeight]
        });
        
        // Create a sprite using the helper method
        this.sprite = NoiseFilter.createBaseSprite(this.app);
        this.sprite.filters = [this.noiseFilter];
        
        // Add to stage
        this.app.stage.addChild(this.sprite);
        
        // Setup event handlers
        this.setupResize();
        this.setupVisibilityHandler();
        
        // Start animation loop
        this.app.ticker.add(() => this.animate());
        
        console.log('NoiseFilter initialized with properties:', {
            noiseScale: this.noiseFilter.noiseScale,
            animationSpeed: this.noiseFilter.animationSpeed
        });
    }
    
    setupResize() {
        window.addEventListener('resize', () => {
            this.resize();
        });
    }
    
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.app.ticker.stop();
            } else {
                this.app.ticker.start();
            }
        });
    }
    
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Resize the Pixi application
        this.app.renderer.resize(width, height);
        
        // Update sprite size
        if (this.sprite) {
            this.sprite.width = width;
            this.sprite.height = height;
        }
        
        // Update filter resolution using the provided method
        if (this.noiseFilter) {
            this.noiseFilter.updateResolution(width, height);
        }
    }
    
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        const delta = now - this.lastFpsUpdate;
        
        if (delta >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / delta);
            
            // Update FPS display (throttled to avoid performance issues)
            if (now - this.lastFpsDisplay >= 200) {
                const fpsElement = document.getElementById('fps-value');
                if (fpsElement) {
                    fpsElement.textContent = fps;
                }
                this.lastFpsDisplay = now;
            }
            
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    animate() {
        // Update the noise filter time
        this.noiseFilter.updateTime();
        
        // Update FPS counter
        this.updateFPS();
    }
    
    /**
     * Example method showing how to modify filter parameters at runtime
     */
    adjustNoise(scale, speed) {
        if (this.noiseFilter) {
            this.noiseFilter.noiseScale = scale;
            this.noiseFilter.animationSpeed = speed;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new NoisePixiApp();
    
    // Example: Expose app to global scope for debugging/experimentation
    window.noiseApp = app;
    
    // Example: Add some runtime controls (optional)
    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case '1':
                app.adjustNoise(2.0, 0.1); // Slow, large patterns
                console.log('Adjusted to: Large, slow patterns');
                break;
            case '2':
                app.adjustNoise(5.0, 0.2); // Default
                console.log('Adjusted to: Default settings');
                break;
            case '3':
                app.adjustNoise(10.0, 0.5); // Fast, small patterns
                console.log('Adjusted to: Small, fast patterns');
                break;
            case 'r':
                app.noiseFilter.resetTime();
                console.log('Reset animation time');
                break;
        }
    });
    
    console.log('Noise visualization loaded. Try keys 1, 2, 3 to adjust patterns, or R to reset time.');
});