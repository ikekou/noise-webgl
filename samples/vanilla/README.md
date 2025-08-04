# Vanilla WebGL 3D Simplex Noise Renderer

このディレクトリには、ピュアなWebGLを使用した3D Simplexノイズの可視化実装が含まれています。フレームワークに依存しない軽量な実装として設計されています。

## ファイル構成

- `noise-renderer.js` - メインのNoiseRendererクラス
- `gl-utils.js` - WebGL ユーティリティ関数群
- `shaders.js` - 頂点・フラグメントシェーダーのコード
- `main.js` - アプリケーションエントリーポイント
- `index.html` - デモ用HTML
- `style.css` - デモ用スタイル

## 基本的な使用方法

### 1. 必要なファイルをプロジェクトにコピー

既存のWebGLプロジェクトに以下のファイルをコピーしてください：
- `noise-renderer.js`
- `gl-utils.js`
- `shaders.js`

### 2. レンダラーをインポートして使用

```javascript
import { NoiseRenderer } from './noise-renderer.js';

// キャンバス要素を取得
const canvas = document.getElementById('canvas');

// ノイズレンダラーを作成
const renderer = new NoiseRenderer(canvas);
```

### 3. パラメータの動的変更

```javascript
// ノイズレンダラーのインスタンスを取得後
renderer.noiseScale = 3.0;        // ノイズのスケール変更
renderer.animationSpeed = 0.5;    // アニメーション速度変更

// 変更を反映するには、シェーダーのuniformを更新
renderer.gl.useProgram(renderer.program);
renderer.gl.uniform1f(renderer.uniforms.uNoiseScale, renderer.noiseScale);
renderer.gl.uniform1f(renderer.uniforms.uAnimationSpeed, renderer.animationSpeed);
```

## API リファレンス

### NoiseRenderer クラス

#### コンストラクター
```javascript
const renderer = new NoiseRenderer(canvas);
```

**パラメータ:**
- `canvas` (HTMLCanvasElement) - WebGLコンテキストを作成するキャンバス要素

#### プロパティ

- `noiseScale` (number, default: 5.0) - ノイズパターンのスケール
- `animationSpeed` (number, default: 0.2) - アニメーション速度
- `isRunning` (boolean) - アニメーションの実行状態
- `gl` (WebGL2RenderingContext) - WebGLコンテキスト
- `program` (WebGLProgram) - シェーダープログラム
- `uniforms` (Object) - ユニフォームロケーション

#### メソッド

##### `resize()`
キャンバスサイズを現在のクライアントサイズに合わせて更新します。

##### `render()`
単一フレームをレンダリングします。

##### `animate()`
アニメーションループを開始します。自動的にrequestAnimationFrameを使用します。

### ユーティリティ関数 (gl-utils.js)

#### `createShader(gl, type, source)`
WebGLシェーダーを作成・コンパイルします。

**パラメータ:**
- `gl` (WebGL2RenderingContext) - WebGLコンテキスト
- `type` (number) - シェーダータイプ (gl.VERTEX_SHADER または gl.FRAGMENT_SHADER)
- `source` (string) - シェーダーソースコード

#### `createProgram(gl, vertexSource, fragmentSource)`
WebGLプログラムを作成・リンクします。

#### `getUniforms(gl, program, names)`
複数のユニフォームロケーションを一度に取得します。

#### `showError(message)`
エラーメッセージをユーザーに表示します。

## 機能詳細

### Hi-DPI サポート
デバイスピクセル比に対応し、高解像度ディスプレイでクリアな描画を提供します。パフォーマンス考慮で最大2倍までに制限しています。

### WebGL バージョン対応
WebGL2を優先的に使用し、利用できない場合はWebGL1にフォールバックします。シェーダーコードも自動的に変換されます。

### パフォーマンス最適化
- Page Visibility API による省電力機能
- ResizeObserver による効率的なリサイズハンドリング
- WebGLコンテキストロス対応
- フルスクリーン三角形によるフラグメントシェーダー実行

### FPS カウンター
リアルタイムでフレームレートを監視し、パフォーマンスを確認できます。

## 使用例

### 1. カスタムパラメータでの初期化

```javascript
const canvas = document.getElementById('canvas');
const renderer = new NoiseRenderer(canvas);

// カスタムパラメータを設定
renderer.noiseScale = 8.0;
renderer.animationSpeed = 0.1;

// シェーダーに反映
renderer.gl.useProgram(renderer.program);
renderer.gl.uniform1f(renderer.uniforms.uNoiseScale, renderer.noiseScale);
renderer.gl.uniform1f(renderer.uniforms.uAnimationSpeed, renderer.animationSpeed);
```

### 2. キーボードでのパラメータ制御

```javascript
document.addEventListener('keydown', (e) => {
    const renderer = window.noiseRenderer; // グローバルに保存した場合
    
    switch(e.key) {
        case '1':
            renderer.noiseScale = 2.0;
            break;
        case '2':
            renderer.noiseScale = 10.0;
            break;
        case ' ': // スペースキーでアニメーション停止/再開
            renderer.isRunning = !renderer.isRunning;
            break;
    }
    
    // 変更をシェーダーに反映
    renderer.gl.useProgram(renderer.program);
    renderer.gl.uniform1f(renderer.uniforms.uNoiseScale, renderer.noiseScale);
});
```

### 3. アニメーションの制御

```javascript
// アニメーション停止
renderer.isRunning = false;

// アニメーション再開
renderer.isRunning = true;

// 手動でフレームレンダリング
renderer.render();
```

## パフォーマンスの考慮事項

- WebGL2を使用することで最新のGPU機能を活用
- フルスクリーン三角形による効率的な描画
- 不要なWebGL状態変更を最小化
- Hi-DPI環境でのパフォーマンス調整
- タブが非アクティブ時の自動一時停止

## ブラウザ対応

- WebGL2対応ブラウザ（推奨）
- WebGL1対応ブラウザ（フォールバック）
- モダンブラウザでのES6モジュール対応

## ライセンス

このコードはMITライセンスの下で提供されています。3D Simplexノイズアルゴリズムは[Ashima Arts](https://github.com/ashima/webgl-noise)によるものです。