--- a/packages/highlight/src/CanvasSnapshotter.js
+++ b/packages/highlight/src/CanvasSnapshotter.js
@@ -23,7 +23,7 @@
 
 export function snapshotCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
-  return new Promise((resolve, reject) => {
+  return new Promise((resolve, reject) => {
     try {
-      canvas.toBlob((blob) => {
+      const context = canvas.getContext('2d');
+      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
+      const blob = new Blob([imageData.data], { type: 'image/png' });
       resolve(blob);
     }, 'image/png');
