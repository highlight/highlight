/*
 * Safari createImageBitmap performance workaround
 * ------------------------------------------------
 * WebKit (Safari 16/17, iOS) becomes synchronous and
 * extremely slow when resizeWidth / resizeHeight are
 * supplied to createImageBitmap.  We polyfill
 * window.createImageBitmap so that on Safari we perform
 * the resize ourselves via an off-screen canvas and then
 * delegate to the native implementation **without** the
 * resize parameters.  On all other browsers we leave the
 * original behaviour untouched.
 */

// Bail out during SSR / server side rendering.
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari && 'createImageBitmap' in window) {
    const nativeCreateImageBitmap: typeof window.createImageBitmap = window.createImageBitmap.bind(window);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – we deliberately broaden the signature here
    window.createImageBitmap = function (source: any, ...rest: any[]): Promise<ImageBitmap> {
      // Safari slow-path detection: 5 argument overload implies resize options.
      if (rest.length === 5) {
        // Arguments: sx, sy, sw, sh, options
        const [sx, sy, sw, sh, options] = rest;
        if (options && (options.resizeWidth || options.resizeHeight)) {
          const targetW = options.resizeWidth ?? sw;
          const targetH = options.resizeHeight ?? sh;

          // Create a temporary canvas to perform the resize.
          const resizeCanvas = document.createElement('canvas');
          resizeCanvas.width = targetW;
          resizeCanvas.height = targetH;

          const ctx = resizeCanvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(source, sx, sy, sw, sh, 0, 0, targetW, targetH);
          }

          // Delegate to native createImageBitmap **without** resize options.
          return nativeCreateImageBitmap(resizeCanvas);
        }
      }

      // Non-Safari or non-resize usage – fall back to native.
      // eslint-disable-next-line prefer-spread
      return nativeCreateImageBitmap.apply(window, [source].concat(rest) as unknown as Parameters<typeof nativeCreateImageBitmap>);
    };
  }
}

export {}; // ensure this file is treated as a module
