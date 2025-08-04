/**
 * NoiseFilter - Reusable 3D Simplex Noise Filter for Pixi.js
 * 
 * Usage:
 * ```javascript
 * import { NoiseFilter } from './NoiseFilter.js';
 * 
 * const noiseFilter = new NoiseFilter({
 *   noiseScale: 5.0,
 *   animationSpeed: 0.2
 * });
 * 
 * sprite.filters = [noiseFilter];
 * 
 * // In animation loop:
 * noiseFilter.updateTime(elapsedTime);
 * ```
 */

import { noiseFragmentShader } from './noise-shaders.js';

export class NoiseFilter extends PIXI.Filter {
    /**
     * Create a NoiseFilter
     * @param {Object} options - Configuration options
     * @param {number} [options.noiseScale=5.0] - Scale of the noise pattern
     * @param {number} [options.animationSpeed=0.2] - Speed of animation
     * @param {number[]} [options.resolution] - Screen resolution [width, height]
     */
    constructor(options = {}) {
        const {
            noiseScale = 5.0,
            animationSpeed = 0.2,
            resolution = [window.innerWidth, window.innerHeight]
        } = options;

        // Initialize the filter with our noise shader
        super(null, noiseFragmentShader, {
            uTime: 0.0,
            uResolution: resolution,
            uNoiseScale: noiseScale,
            uAnimationSpeed: animationSpeed
        });

        // Store initial values for easy access
        this._noiseScale = noiseScale;
        this._animationSpeed = animationSpeed;
        this._startTime = Date.now();
    }

    /**
     * Update the time uniform for animation
     * @param {number} [time] - Time in seconds. If not provided, uses elapsed time since creation
     */
    updateTime(time) {
        if (time !== undefined) {
            this.uniforms.uTime = time;
        } else {
            this.uniforms.uTime = (Date.now() - this._startTime) / 1000.0;
        }
    }

    /**
     * Update the resolution uniform
     * @param {number} width - Screen width
     * @param {number} height - Screen height
     */
    updateResolution(width, height) {
        this.uniforms.uResolution = [width, height];
    }

    /**
     * Get the current noise scale
     * @returns {number} The noise scale value
     */
    get noiseScale() {
        return this._noiseScale;
    }

    /**
     * Set the noise scale
     * @param {number} value - The new noise scale value
     */
    set noiseScale(value) {
        this._noiseScale = value;
        this.uniforms.uNoiseScale = value;
    }

    /**
     * Get the current animation speed
     * @returns {number} The animation speed value
     */
    get animationSpeed() {
        return this._animationSpeed;
    }

    /**
     * Set the animation speed
     * @param {number} value - The new animation speed value
     */
    set animationSpeed(value) {
        this._animationSpeed = value;
        this.uniforms.uAnimationSpeed = value;
    }

    /**
     * Reset the animation time to zero
     */
    resetTime() {
        this._startTime = Date.now();
        this.uniforms.uTime = 0.0;
    }

    /**
     * Create a simple white texture sprite that works well with this filter
     * @param {PIXI.Application} app - The Pixi application instance
     * @param {number} [width] - Sprite width (defaults to app width)
     * @param {number} [height] - Sprite height (defaults to app height)
     * @returns {PIXI.Sprite} A sprite ready to use with this filter
     */
    static createBaseSprite(app, width, height) {
        const w = width || app.screen.width;
        const h = height || app.screen.height;

        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, w, h);
        graphics.endFill();

        const texture = app.renderer.generateTexture(graphics);
        return new PIXI.Sprite(texture);
    }
}