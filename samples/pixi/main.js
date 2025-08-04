/**
 * 3D Simplex Noise Pixi.js Visualization - Proper Pixi.js Implementation
 */

// Fragment shader for noise rendering
const fragmentShader = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTime;
uniform vec2 uResolution;
uniform float uNoiseScale;
uniform float uAnimationSpeed;

// 3D Simplex Noise from Ashima Arts
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i); 
    vec4 p = permute(permute(permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution.xy;
    st.x *= uResolution.x/uResolution.y;

    vec3 pos = vec3(
        st.x * uNoiseScale,
        st.y * uNoiseScale,
        uTime * uAnimationSpeed
    );
    
    float n = snoise(pos);
    n = n * 0.5 + 0.5;
    n = smoothstep(0.0, 1.0, n);
    
    gl_FragColor = vec4(vec3(n), 1.0);
}
`;

class NoisePixiApp {
    constructor() {
        this.startTime = Date.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.startTime;
        this.lastFpsDisplay = this.startTime;
        
        // Parameters for noise visualization
        this.noiseScale = 5.0;
        this.animationSpeed = 0.2;
        
        this.init();
    }
    
    init() {
        // Create Pixi Application (v7 compatible)
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
        
        // Create noise filter
        this.createNoiseFilter();
        
        // Create sprite with the filter
        this.createSprite();
        
        // Setup resize handling
        this.setupResize();
        
        // Setup visibility handling
        this.setupVisibilityHandler();
        
        // Start animation loop
        this.app.ticker.add(() => this.animate());
    }
    
    createNoiseFilter() {
        // Create Pixi.js filter with our noise shader
        this.noiseFilter = new PIXI.Filter(null, fragmentShader, {
            uTime: 0.0,
            uResolution: [window.innerWidth, window.innerHeight],
            uNoiseScale: this.noiseScale,
            uAnimationSpeed: this.animationSpeed
        });
    }
    
    createSprite() {
        // Create a simple white rectangle as the base for our filter
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);
        graphics.endFill();
        
        // Convert graphics to texture
        const texture = this.app.renderer.generateTexture(graphics);
        
        // Create sprite and apply our noise filter
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.filters = [this.noiseFilter];
        
        // Add to stage
        this.app.stage.addChild(this.sprite);
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
        
        // Update filter uniforms
        if (this.noiseFilter) {
            this.noiseFilter.uniforms.uResolution = [width, height];
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
                document.getElementById('fps-value').textContent = fps;
                this.lastFpsDisplay = now;
            }
            
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    animate() {
        // Update time uniform for animation
        const time = (Date.now() - this.startTime) / 1000.0;
        if (this.noiseFilter) {
            this.noiseFilter.uniforms.uTime = time;
        }
        
        // Update FPS counter
        this.updateFPS();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NoisePixiApp();
});