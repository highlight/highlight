import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { H } from 'highlight.run'

H.init('6glrrmmg', {
  // Get your project ID from https://app.highlight.io/setup
  environment: 'production',
  version: 'commit:abcdefg12345',
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
    urlBlocklist: [
      // insert full or partial urls that you don't want to record here
      // Out of the box, Highlight will not record these URLs (they can be safely removed):
      'https://www.googleapis.com/identitytoolkit',
      'https://securetoken.googleapis.com'
    ]
  },
  enableCanvasRecording: true,
  samplingStrategy: {
    canvasManualSnapshot: 3,
    canvasMaxSnapshotDimension: 480,
    canvasClearWebGLBuffer: false
  }
})

createRoot(document.getElementById('root')).render(<App />)
