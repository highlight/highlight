import { H } from 'highlight.run'

H.init('1', {
  debug: { clientInteractions: true, domRecording: true },
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
  tracingOrigins: true,
  enableCanvasRecording: true,
  samplingStrategy: {
    canvas: 1,
    canvasMaxSnapshotDimension: 480,
    canvasFactor: 0.5,
  },
  inlineStylesheet: true,
  inlineImages: true,
  version: '0.0.1',
  serviceName: 'chrome-extension',
  sendMode: 'local',
})
