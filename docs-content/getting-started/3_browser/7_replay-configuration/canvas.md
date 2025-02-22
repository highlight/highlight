---
title: Canvas & WebGL
slug: canvas
createdAt: 2021-10-13T22:55:19.000Z
updatedAt: 2022-09-29T18:01:58.000Z
---
<br/>

<div style={{position: "relative", paddingBottom: "64.90384615384616%", height: 0 }}>
    <iframe src="https://www.loom.com/embed/ebb971bf5fdd4aaf9ae1924e7e536fb7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe>
</div>
## Canvas Recording

Highlight can record the contents of `<canvas>` elements, with support for 2D and 3D contexts. Canvas recording can be enabled and configured via the `H.init` options, set up depending on the type of HTML5 Canvas application you are building. For example, a video game WebGL application or three.js visualization may require a higher snapshotting framerate to ensure the replay has enough frames to understand what was happening.

Enable canvas recording by configuring [H.init()](../../../sdk/client.md#Hinit) in the following way:

```javascript
H.init('<YOUR_PROJECT_ID>', {
  enableCanvasRecording: true,        // enable canvas recording
  samplingStrategy: {
    canvas: 2,                        // snapshot at 2 fps
    canvasMaxSnapshotDimension: 480,  // snapshot at a max 480p resolution
  },
})
```

With these settings, the canvas is serialized as a 480p video at 2FPS.

`samplingStrategy.canvas` is the frame per second rate used to record the HTML canvas. A value < 5 is recommended to ensure the recording is not too large and does not have issues with playback.

`samplingStrategy.canvasManualSnapshot` is the frame per second rate used in manual snapshotting mode. See `Manual Snapshotting` below.

`samplingStrategy.canvasFactor`: a resolution scaling factor applied to both dimensions of the canvas.

`samplingStrategy.canvasMaxSnapshotDimension`: max recording resolution of the largest dimension of the canvas.

`samplingStrategy.canvasClearWebGLBuffer`: (advanced) set to false to disable webgl buffer clearing (if the canvas flickers when recording).

`samplingStrategy.canvasInitialSnapshotDelay`: (advanced) time (in milliseconds) to wait before the initial snapshot of canvas/video elements.

```hint
[Privacy](../../../general/6_product-features/1_session-replay/privacy.md) controls do not apply to canvas recording at this time.
```

Enabling canvas recording should not have any impact on the performance your application. We've recently changed our uploading client to use browser web-workers to ensure that data serialization cannot block the rendering of your application. If you run into any issues please [let us know](https://highlight.io/community)!

## WebGL Recording

Highlight is able to record websites that use WebGL in the `<canvas>` element. 

To enable WebGL recording, enable canvas recording by following the steps above.

```hint
If you use WebGL(2) and fail to see a canvas recorded or see a transparent image, setup manual snapshotting.
```

## Manual Snapshotting

A canvas may fail to be recorded (recorded as a transparent image) because of WebGL 
double buffering. The canvas is not accessible from the javascript thread because it may
no longer be loaded in memory, despite being rendered by the GPU (see this [chrome bug report](https://bugs.chromium.org/p/chromium/issues/detail?id=838108) for additional context). 

If you can avoid using `preserveDrawingBuffer`, automatic snapshotting should work correctly. In libraries, this is often configured via a `renderMode="always"` or similar setting.

Manual snapshotting hooks into your WebGL render function to call `H.snapshot(canvas)` after
you paint to the WebGL context. To set this up, pass the following options to highlight first:

```javascript
H.init('<YOUR_PROJECT_ID>', {
  enableCanvasRecording: true,        // enable canvas recording
  samplingStrategy: {
      canvasManualSnapshot: 2,        // snapshot at 2 fps
    canvasMaxSnapshotDimension: 480,  // snapshot at a max 480p resolution
    // any other settings...
  },
})
```

Now, hook into your WebGL rendering code and call `H.snapshot`.
```typescript
// babylon.js
engine.runRenderLoop(() => {
    scene.render()
    H.snapshot(canvasElementRef.current)
})
```

### WebGL Render Libraries

Three.js exports an [onAfterRender](https://threejs.org/docs/#api/en/core/Object3D.onAfterRender) method that you can use to call `H.snapshot`. You should use it at the highest-order rendered component to capture as much of the rendered canvas as possible. Otherwise, your recording may show the canvas mid-way through rendering.

Setting up snapshotting for [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) is similar via the `onAfterRender` method exposed on the base Three.js components. Snapshotting may be possible using the [useFrame](https://docs.pmnd.rs/react-three-fiber/api/hooks#taking-over-the-render-loop) hook with manual rendering, but you will have to control the render order to make sure `H.snapshot` is called last. See [our example app that uses react-three-fiber](https://github.com/highlight/highlight/tree/main/e2e/react-three-vite) for more details.

## Webcam Recording and Inlining Video Resources

If you use `src=blob:` `<video>` elements in your app (for example, you are using javascript to dynamically generate a video stream) or are streaming a webcam feed to a `<video>` element, you'll need to inline the `<video>` elements for them to appear correctly in the playback. Do this by enabling the `inlineImages` setting.

```javascript
H.init('<YOUR_PROJECT_ID>', {
  ..., 
  inlineImages: true,
})
```
