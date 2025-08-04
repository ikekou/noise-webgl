/**
 * 3D Simplex Noise WebGL Visualization - Application Entry Point
 */

import { NoiseRenderer } from './noise-renderer.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    new NoiseRenderer(canvas);
});