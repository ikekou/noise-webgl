# 3D Simplex Noise WebGL Visualization

[🇯🇵 日本語](README.ja.md) | 🇺🇸 English

A real-time 3D Simplex Noise visualization using WebGL. Creates smooth animated noise patterns by varying the Z-coordinate over time.

![3D Simplex Noise WebGL Demo](screenshot.png)

*Smooth 3D Simplex Noise animation running at 60 FPS*

## Features

- **High Performance**: GPU acceleration using WebGL2
- **Full-Screen Display**: Noise patterns rendered across the entire browser viewport
- **Real-Time Animation**: Smooth animation by varying Z-coordinate over time
- **Optimized Implementation**: Branch-less shaders and full-screen triangle technique
- **FPS Counter**: Real-time performance monitoring
- **Responsive Design**: Automatically adjusts to window size changes

## Technical Details

### Simplex Noise 3D
- Improved version of Perlin Noise with faster and higher quality noise generation
- 3D space calculation (XY + time-based Z) enables smooth animation
- Fully computed on GPU using GLSL shaders (Ashima Arts implementation)

### Implementation Features
- **No Vertex Buffers**: Full-screen rendering using `gl_VertexID` with 3 vertices
- **Branch-less Implementation**: Uses `step`/`smoothstep` functions for maximum GPU efficiency
- **WebGL2 Exclusive**: Uses WebGL2 context with `#version 300 es` shaders
- **Class-based Design**: Modular and extensible `NoiseRenderer` class

## Usage

1. Simply open `index.html` in your browser
2. FPS counter is displayed in the top-left corner

## File Structure

- `index.html` - Basic HTML structure  
- `style.css` - Full-screen canvas styling
- `main.js` - Application entry point
- `noise-renderer.js` - NoiseRenderer class (main logic)
- `gl-utils.js` - WebGL utility functions
- `shaders.js` - Shader source code
- `screenshot.png` - Demo image

## Customization

You can adjust the following parameters in `noise-renderer.js`:

```javascript
// Noise scale (higher values = finer patterns)
this.noiseScale = 5.0;

// Animation speed (higher values = faster changes)
this.animationSpeed = 0.2;
```

## System Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- WebGL2 support required

## Performance

- Desktop: 60 FPS (even at 4K resolution)
- Mobile: 30-60 FPS (varies by device)