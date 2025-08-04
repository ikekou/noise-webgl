# Pixi.js 3D Simplex Noise Filter

このディレクトリには、既存のPixi.jsプロジェクトで簡単に使用できる再利用可能な3D Simplexノイズフィルターが含まれています。

## ファイル構成

- `NoiseFilter.js` - 再利用可能なノイズフィルタークラス
- `noise-shaders.js` - シェーダーコードのモジュール
- `main.js` - 使用例のデモアプリケーション
- `index.html` - デモ用HTML
- `style.css` - デモ用スタイル

## 基本的な使用方法

### 1. 必要なファイルをプロジェクトにコピー

既存のPixi.jsプロジェクトに以下のファイルをコピーしてください：
- `NoiseFilter.js`
- `noise-shaders.js`

### 2. フィルターをインポートして使用

```javascript
import { NoiseFilter } from './NoiseFilter.js';

// Pixi.jsアプリケーションを作成
const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x000000
});

// ノイズフィルターを作成
const noiseFilter = new NoiseFilter({
    noiseScale: 5.0,        // ノイズのスケール（大きいほど細かいパターン）
    animationSpeed: 0.2     // アニメーション速度
});

// スプライトを作成（ヘルパーメソッドを使用）
const sprite = NoiseFilter.createBaseSprite(app);
sprite.filters = [noiseFilter];

// ステージに追加
app.stage.addChild(sprite);

// アニメーションループでフィルターを更新
app.ticker.add(() => {
    noiseFilter.updateTime();
});
```

### 3. 既存のスプライトにフィルターを適用

```javascript
// 既存のスプライトにノイズフィルターを適用
existingSprite.filters = [noiseFilter];

// 複数のフィルターと組み合わせることも可能
existingSprite.filters = [blurFilter, noiseFilter, colorMatrixFilter];
```

## API リファレンス

### NoiseFilter コンストラクター

```javascript
const noiseFilter = new NoiseFilter(options);
```

**options (オブジェクト):**
- `noiseScale` (number, default: 5.0) - ノイズパターンのスケール
- `animationSpeed` (number, default: 0.2) - アニメーション速度
- `resolution` (Array, default: [window.innerWidth, window.innerHeight]) - 解像度 [幅, 高さ]

### インスタンスメソッド

#### `updateTime(time?)`
アニメーション用の時間を更新します。
- `time` (number, optional) - 秒単位の時間。省略時は内部時計を使用

#### `updateResolution(width, height)`
画面解像度を更新します。
- `width` (number) - 幅
- `height` (number) - 高さ

#### `resetTime()`
アニメーション時間をリセットします。

### プロパティ

#### `noiseScale` (get/set)
ノイズのスケールを取得・設定します。

#### `animationSpeed` (get/set)
アニメーション速度を取得・設定します。

### 静的メソッド

#### `NoiseFilter.createBaseSprite(app, width?, height?)`
フィルターに適した白いスプライトを作成します。
- `app` (PIXI.Application) - Pixiアプリケーションインスタンス
- `width` (number, optional) - スプライトの幅
- `height` (number, optional) - スプライトの高さ

## 使用例

### 1. 背景として使用

```javascript
const backgroundNoise = new NoiseFilter({
    noiseScale: 3.0,
    animationSpeed: 0.1
});

const background = NoiseFilter.createBaseSprite(app);
background.filters = [backgroundNoise];
app.stage.addChildAt(background, 0); // 背景として最背面に配置
```

### 2. 動的にパラメータを変更

```javascript
// ユーザーインタラクションに応じてパラメータを変更
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case '1':
            noiseFilter.noiseScale = 2.0;
            noiseFilter.animationSpeed = 0.05;
            break;
        case '2':
            noiseFilter.noiseScale = 10.0;
            noiseFilter.animationSpeed = 0.8;
            break;
    }
});
```

### 3. 複数のオブジェクトに異なる設定で適用

```javascript
const clouds = new NoiseFilter({ noiseScale: 3.0, animationSpeed: 0.1 });
const water = new NoiseFilter({ noiseScale: 8.0, animationSpeed: 0.3 });

cloudSprite.filters = [clouds];
waterSprite.filters = [water];
```

## パフォーマンスの考慮事項

- フィルターはGPUで実行されるため、通常は高いパフォーマンスを発揮します
- 複数のオブジェクトに同じフィルターを適用する場合は、同じインスタンスを再利用することができます
- 非常に大きな解像度では、パフォーマンスに影響する可能性があります

## ライセンス

このコードはMITライセンスの下で提供されています。3D Simplexノイズアルゴリズムは[Ashima Arts](https://github.com/ashima/webgl-noise)によるものです。