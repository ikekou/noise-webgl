/**
 * NoiseRenderer - 3D Simplex Noise WebGL Renderer
 */

import { createProgram, getUniforms, showError } from './gl-utils.js';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';

export class NoiseRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.startTime = Date.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.startTime;
        this.lastFpsDisplay = this.startTime;
        
        // Hi-DPI support - cap at 2 for performance
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        // Animation state for power saving
        this.isRunning = true;
        
        // === パラメータ調整用変数 ===
        // ノイズの大きさ調整（大きいほど細かいパターン、小さいほど大きなパターン）
        this.noiseScale = 5.0;
        
        // アニメーション速度（大きいほど早く、小さいほどゆっくり）
        this.animationSpeed = 0.2;
        // ========================
        
        this.init();
    }
    
    init() {
        // Get WebGL context (try WebGL2 first, fallback to WebGL1)
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            console.warn('WebGL2 not available, falling back to WebGL1');
            this.gl = this.canvas.getContext('webgl');
            if (!this.gl) {
                throw new Error('WebGL not supported');
            }
        }
        
        this.setupShaders();
        this.setupWebGL();
        this.resize();
        
        // Start animation
        this.animate();
        
        // Handle canvas resize with ResizeObserver for better responsiveness
        this.setupResizeObserver();
        
        // Setup Page Visibility API for power saving
        this.setupVisibilityHandler();
        
        // Setup WebGL context loss handling
        this.setupContextLossHandling();
    }
    
    setupShaders() {
        try {
            this.program = createProgram(this.gl, vertexShaderSource, fragmentShaderSource);
            
            // Get uniform locations using utility function
            this.uniforms = getUniforms(this.gl, this.program, [
                'uTime',
                'uResolution', 
                'uNoiseScale',
                'uAnimationSpeed'
            ]);
        } catch (error) {
            showError(error.message);
            throw error;
        }
    }
    
    setupWebGL() {
        // Create and bind VAO for clean state management
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        
        // Disable unnecessary features for fullscreen pass
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.BLEND);
        this.gl.disable(this.gl.CULL_FACE);
        
        // Clear color
        this.gl.clearColor(0, 0, 0, 1);
        
        // Set static uniforms once
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.uniforms.uNoiseScale, this.noiseScale);
        this.gl.uniform1f(this.uniforms.uAnimationSpeed, this.animationSpeed);
    }
    
    setupResizeObserver() {
        // Use ResizeObserver for better resize handling
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.resize();
            });
            resizeObserver.observe(this.canvas);
        } else {
            // Fallback to window resize event
            window.addEventListener('resize', () => this.resize());
        }
    }
    
    setupVisibilityHandler() {
        // Use Page Visibility API to pause animation when tab is hidden
        document.addEventListener('visibilitychange', () => {
            this.isRunning = !document.hidden;
        });
    }
    
    setupContextLossHandling() {
        // Handle WebGL context loss (common on Android devices)
        this.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL context lost');
            this.isRunning = false;
        });
        
        this.canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored, reinitializing...');
            this.init();
        });
    }
    
    resize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        const delta = now - this.lastFpsUpdate;
        
        if (delta >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / delta);
            
            // Only update DOM every 200ms to avoid layout thrashing
            if (now - this.lastFpsDisplay >= 200) {
                document.getElementById('fps-value').textContent = fps;
                this.lastFpsDisplay = now;
            }
            
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Update only dynamic uniforms each frame
        const time = (Date.now() - this.startTime) / 1000.0;
        this.gl.uniform1f(this.uniforms.uTime, time);
        this.gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
        
        // Draw fullscreen triangle
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }
    
    animate() {
        if (this.isRunning) {
            this.render();
            this.updateFPS();
        }
        requestAnimationFrame(() => this.animate());
    }
}