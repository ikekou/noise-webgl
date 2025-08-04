# 3D Simplex Noise Visualizer (WebGL)
*Vanilla WebGL & Pixi.js implementations*

[🇯🇵 日本語](README.ja.md) | 🇺🇸 English

GPU-accelerated 3D Simplex Noise visualization with real-time animation. Features both pure WebGL and Pixi.js filter implementations for different use cases.

![3D Simplex Noise WebGL Demo](screenshot.png)

*Smooth 3D Simplex Noise animation running at 60 FPS*

## 🌐 Live Demos

- **Vanilla WebGL**: [https://ikekou.github.io/noise-webgl/samples/vanilla/](https://ikekou.github.io/noise-webgl/samples/vanilla/)
- **Pixi.js Filter**: [https://ikekou.github.io/noise-webgl/samples/pixi/](https://ikekou.github.io/noise-webgl/samples/pixi/)

## 🎯 Which Implementation Should You Choose?

| Use Case | Vanilla (samples/vanilla) | Pixi.js Filter (samples/pixi) |
|----------|--------------------------|--------------------------------|
| **Learning WebGL** | ✅ Complete low-level control | ❌ Abstracted away |
| **Adding to existing Pixi.js project** | ⚠️ Requires integration work | ✅ One-line filter addition |
| **Maximum performance** | ✅ No framework overhead | ⚠️ Pixi.js abstraction layer |
| **Minimal bundle size** | ✅ Tiny footprint | ⚠️ Requires Pixi.js dependency |
| **Customization flexibility** | ✅ Full shader control | ✅ Configurable parameters |

## 📁 Project Structure

```
.
├── README.md              ← You are here
├── README.ja.md           ← Japanese version
├── screenshot.png
└── samples/               ← All implementations are here
    ├── vanilla/           ← Pure WebGL implementation
    │   ├── index.html
    │   ├── main.js
    │   ├── noise-renderer.js
    │   ├── gl-utils.js
    │   ├── shaders.js
    │   └── style.css
    └── pixi/              ← Pixi.js filter implementation
        ├── index.html
        ├── main.js
        ├── NoiseFilter.js ← Reusable filter class
        ├── noise-shaders.js
        ├── style.css
        └── README.md      ← Detailed Pixi.js usage guide
```

> **Note**: This repository contains multiple sample implementations. The actual source code is located in the `samples/` directory.

## 🚀 Quick Start

### Option 1: Vanilla WebGL Implementation
For learning WebGL or maximum performance

```bash
# Clone and navigate
git clone [repository-url]
cd noise-webgl

# Open in browser
open samples/vanilla/index.html
# or serve with any local server
python -m http.server 8000
# Navigate to http://localhost:8000/samples/vanilla
```

### Option 2: Pixi.js Filter Implementation
For integration with existing Pixi.js projects

```bash
# Open the demo
open samples/pixi/index.html

# Or copy NoiseFilter.js and noise-shaders.js to your project
cp samples/pixi/NoiseFilter.js your-project/
cp samples/pixi/noise-shaders.js your-project/
```

## 🎨 Features

### Common Features (Both Implementations)
- **GPU Acceleration**: WebGL2-powered 3D Simplex Noise
- **Real-time Animation**: Smooth Z-axis animation over time
- **High Performance**: 60 FPS even at 4K resolution
- **Responsive Design**: Automatic viewport adaptation
- **FPS Monitoring**: Built-in performance counter

### Vanilla WebGL Specific
- **Educational Value**: Complete shader pipeline visibility
- **Zero Dependencies**: Pure WebGL2 implementation
- **Optimized Rendering**: Full-screen triangle technique
- **Branch-less Shaders**: Maximum GPU efficiency

### Pixi.js Filter Specific
- **Easy Integration**: Drop-in filter for existing projects
- **Modular Design**: Reusable `NoiseFilter` class
- **Parameter Control**: Runtime adjustment of noise properties
- **Framework Benefits**: Pixi.js ecosystem compatibility

## 🔧 Technical Details

### Simplex Noise Implementation
- Based on improved Perlin Noise algorithm
- 3D coordinate space (XY + time-based Z)  
- GLSL shader implementation (Ashima Arts)
- GPU-computed for maximum performance

### WebGL Features
- WebGL2 context with `#version 300 es`
- Branch-less shader design using `step`/`smoothstep`
- Efficient full-screen rendering techniques
- No vertex buffer overhead

## 📖 Usage Examples

### Vanilla WebGL
```javascript
// Simple initialization
const canvas = document.getElementById('canvas');
const renderer = new NoiseRenderer(canvas);

// Customize parameters
renderer.noiseScale = 8.0;
renderer.animationSpeed = 0.5;
```

### Pixi.js Filter
```javascript
import { NoiseFilter } from './NoiseFilter.js';

// Create filter
const noiseFilter = new NoiseFilter({
    noiseScale: 5.0,
    animationSpeed: 0.2
});

// Apply to sprite
sprite.filters = [noiseFilter];

// Animate
app.ticker.add(() => noiseFilter.updateTime());
```

## 🎛️ Customization

Both implementations support these parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `noiseScale` | 5.0 | Pattern detail (higher = finer) |
| `animationSpeed` | 0.2 | Animation rate |
| Resolution | Window size | Render dimensions |

## 🖥️ System Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- WebGL2 support
- Hardware-accelerated graphics recommended

## 📊 Performance

- **Desktop**: 60 FPS (tested up to 4K)
- **Mobile**: 30-60 FPS (device dependent)
- **Memory**: < 50MB typical usage

## 🤔 FAQ

**Q: Why is there no code in the root directory?**  
A: This repository showcases multiple implementation approaches. Each complete implementation lives in its own `samples/` subdirectory for clarity.

**Q: Can I use both implementations together?**  
A: Yes! They share the same GLSL shader code and can coexist in the same project.

**Q: Which implementation should I start with?**  
A: If you're learning WebGL, start with `vanilla/`. If you have an existing Pixi.js project, use `pixi/`.

## 📄 License

MIT License - see individual implementation directories for details.

## 🔗 References

- [Simplex Noise Paper (Ken Perlin, 2001)](https://weber.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf)
- [WebGL Noise by Ashima Arts](https://github.com/ashima/webgl-noise)
- [Pixi.js Documentation](https://pixijs.com/)