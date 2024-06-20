import './index.css'
import { H } from 'highlight.run'

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app')!

  // Create the main element
  const mainElement = document.createElement('main')

  // Create the title element
  const h3Element = document.createElement('h3')
  h3Element.textContent = 'Highlight.io'

  // Create the text element
  const divElement = document.createElement('div')
  divElement.className = 'calc'
  // Create the session element
  const project = document.createElement('p')
  divElement.appendChild(project)
  const session = document.createElement('p')
  session.textContent = 'no session'
  H.getSessionURL().then((url) => (session.textContent = url))
  divElement.appendChild(session)

  // Create the input element
  const projectIdInput = document.createElement('input')

  // Append all elements to the main element
  mainElement.appendChild(h3Element)
  mainElement.appendChild(divElement)
  mainElement.appendChild(projectIdInput)

  // Append the main element to the page
  appElement.appendChild(mainElement)

  let projectId = ''

  // Get the count value from Chrome storage
  chrome.storage.sync.get(['projectId'], async ({ projectId }) => {
    projectId = projectId || ''
    project.textContent = `${projectId}`
  })

  // Increment the count
  projectIdInput.addEventListener('change', async (event) => {
    projectId = (event.target as any)?.value
    project.textContent = projectId
    await chrome.storage.sync.set({ projectId })
    await chrome.runtime.sendMessage({ type: 'projectId', projectId })
  })
})
