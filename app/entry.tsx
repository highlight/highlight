// This is the entry point to your app.

// It's a good place to execute one-time side effects, such as initializing the React root,
// because it will never get fast-refreshed in development mode.

// react and react-dom are installed by default, so we can just import them.
import * as react from 'react'
import * as reactDom from 'react-dom/client'
// We import with .js extension because typescript will complain if we used .ts,
// though Reflame itself supports all of .js, .ts and extensionless import specifiers
// through import maps.
//
// Also note we're using / to refer to the root directory (/app in this case).
// This is just how absolute paths on the web works natively.
import { Root } from '/root.tsx'

// CSS imports also work out of the box
import './global.css'

export const init = () => {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('missing root element')
  }
  reactDom
    .createRoot(root)
    .render(
      <react.StrictMode>
        <Root />
      </react.StrictMode>
    )
}
