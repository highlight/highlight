import { H } from 'highlight.run'

async function startHighlight(projectId: string) {
  if (H.getRecordingState() === 'Recording') {
    H.stop()
  }
  const data = H.init(projectId, {
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
  await chrome.storage.sync.set({ sessionSecureID: data?.sessionSecureID })
}

const init = async () => {
  console.log('initializing highlight')
  chrome.storage.sync.get(['projectId'], async ({ projectId }) => {
    console.log('fetched projectId', { projectId })
    await startHighlight(projectId)
  })
  chrome.runtime.onMessage.addListener(
    async ({ type, projectId }: { type: 'projectId'; projectId: string }, sender, sendResponse) => {
      console.log('updated projectId', { projectId })
      await startHighlight(projectId)
    },
  )
}

init()
