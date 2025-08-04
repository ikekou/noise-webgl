/**
 * WebGL utility functions
 */

/**
 * Create and compile a WebGL shader
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source - Shader source code
 * @returns {WebGLShader} Compiled shader
 */
export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    
    // Adjust source for WebGL1 if necessary
    if (!gl.getParameter(gl.VERSION).includes('2.0')) {
        source = source.replace('#version 300 es', '#version 100');
        source = source.replace(/\bin\b/g, 'attribute');
        source = source.replace(/\bout\b/g, 'varying');
        source = source.replace('out vec4 fragColor;', '');
        source = source.replace(/fragColor/g, 'gl_FragColor');
    }
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        console.error('Shader compilation error:', error);
        gl.deleteShader(shader);
        throw new Error(`Shader compilation failed: ${error}`);
    }
    
    return shader;
}

/**
 * Create and link a WebGL program
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {string} vertexSource - Vertex shader source
 * @param {string} fragmentSource - Fragment shader source
 * @returns {WebGLProgram} Linked program
 */
export function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        console.error('Program linking error:', error);
        throw new Error(`Program linking failed: ${error}`);
    }
    
    // Clean up shaders (they're now part of the program)
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    return program;
}

/**
 * Get uniform locations for a program
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {WebGLProgram} program - WebGL program
 * @param {string[]} names - Array of uniform names
 * @returns {Object} Object with uniform locations
 */
export function getUniforms(gl, program, names) {
    const uniforms = {};
    for (const name of names) {
        uniforms[name] = gl.getUniformLocation(program, name);
    }
    return uniforms;
}

/**
 * Show error message to user
 * @param {string} message - Error message
 */
export function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-family: monospace;
        max-width: 80%;
        z-index: 1000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}