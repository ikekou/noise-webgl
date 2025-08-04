// WebGL 4D Simplex Noise Visualization

// Vertex shader source
const vertexShaderSource = `#version 300 es
precision highp float;

const vec2 pos[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2( 3.0, -1.0),
    vec2(-1.0,  3.0)
);

out vec2 vUV;

void main() {
    gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
    vUV = (pos[gl_VertexID] + 1.0) * 0.5;
}`;

// Fragment shader source
const fragmentShaderSource = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 vUV;

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

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i); 
    vec4 p = permute(permute(permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    float n_ = 0.142857142857; // 1.0/7.0
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

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution.xy;
    st.x *= uResolution.x/uResolution.y;

    vec3 color = vec3(0.0);
    
    // Create 3D position with Z moving through time
    vec3 pos = vec3(
        st.x * uNoiseScale,
        st.y * uNoiseScale,
        uTime * uAnimationSpeed
    );
    
    // 3D Simplex noise for smooth cloud-like appearance
    float n = snoise(pos);
    
    // Normalize to 0-1 range
    n = n * 0.5 + 0.5;
    
    // Apply smoothstep for softer transitions
    n = smoothstep(0.0, 1.0, n);
    
    color = vec3(n);

    fragColor = vec4(color, 1.0);
}`;

// WebGL setup and animation
class NoiseRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.startTime = Date.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.startTime;
        
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
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        
        // Adjust source for WebGL1 if necessary
        if (!this.gl.getParameter(this.gl.VERSION).includes('2.0')) {
            source = source.replace('#version 300 es', '#version 100');
            source = source.replace(/\bin\b/g, 'attribute');
            source = source.replace(/\bout\b/g, 'varying');
            source = source.replace('out vec4 fragColor;', '');
            source = source.replace(/fragColor/g, 'gl_FragColor');
        }
        
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    setupShaders() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(this.program));
            return;
        }
        
        // Get uniform locations
        this.uniforms = {
            uTime: this.gl.getUniformLocation(this.program, 'uTime'),
            uResolution: this.gl.getUniformLocation(this.program, 'uResolution'),
            uNoiseScale: this.gl.getUniformLocation(this.program, 'uNoiseScale'),
            uAnimationSpeed: this.gl.getUniformLocation(this.program, 'uAnimationSpeed')
        };
    }
    
    setupWebGL() {
        // Disable unnecessary features
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.BLEND);
        this.gl.disable(this.gl.CULL_FACE);
        
        // Clear color
        this.gl.clearColor(0, 0, 0, 1);
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        const delta = now - this.lastFpsUpdate;
        
        if (delta >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / delta);
            document.getElementById('fps-value').textContent = fps;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        
        // Update uniforms
        const time = (Date.now() - this.startTime) / 1000.0;
        this.gl.uniform1f(this.uniforms.uTime, time);
        this.gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.uNoiseScale, this.noiseScale);
        this.gl.uniform1f(this.uniforms.uAnimationSpeed, this.animationSpeed);
        
        // Draw fullscreen triangle
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }
    
    animate() {
        this.render();
        this.updateFPS();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    new NoiseRenderer(canvas);
});