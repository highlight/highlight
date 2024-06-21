import '@fontsource/poppins'
import '@highlight-run/ui/styles.css'
import './index.css'

import { ErrorBoundary } from '@highlight-run/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { H } from 'highlight.run'
import {
  Box,
  Button,
  ButtonIcon,
  Form,
  IconSolidCog,
  IconSolidHighlight,
  IconSolidX,
  Stack,
  Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'

document.body.className = 'highlight-light-theme'

const App = () => {
  return (
    <ErrorBoundary>
      <ChromeExtensionPopup />
    </ErrorBoundary>
  )
}

const ChromeExtensionPopup = () => {
  const [session, setSession] = React.useState<string>()

  const formStore = Form.useStore({
    defaultValues: {
      projectId: '',
    },
  })

  React.useEffect(() => {
    H.getSessionURL().then((url) => setSession(url))
  }, [])

  React.useEffect(() => {
    chrome.storage.sync.get(['projectId'], async ({ projectId }) => {
      formStore.setValue(formStore.names.projectId, projectId || '')
    })
  }, [])

  formStore.useSubmit(async (formState) => {
    await chrome.storage.sync.set({ projectId: formState.values.projectId })
    await chrome.runtime.sendMessage({ type: 'projectId', projectId: formState.values.projectId })
  })

  return (
    <Stack
      justifyContent={'center'}
      width={'full'}
      height={'full'}
      gap="12"
      style={{
        width: 360,
      }}
    >
      <Box
        width={'full'}
        height={'full'}
        display="flex"
        flexDirection="column"
        borderRadius="8"
        border="secondary"
        shadow="medium"
        backgroundColor="white"
      >
        <Box
          display="flex"
          alignItems="center"
          userSelect="none"
          px="8"
          py="4"
          bb="secondary"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={'4'}>
            <IconSolidHighlight width={12} height={12} />
            <Text size="xxSmall" color="secondaryContentText" weight="medium">
              Highlight.io
            </Text>
          </Box>
          <ButtonIcon
            kind="secondary"
            emphasis="none"
            size="minimal"
            icon={
              <IconSolidX size={14} color={vars.theme.interactive.fill.secondary.content.text} />
            }
          />
        </Box>
        <Box width="full" display="flex" justifyContent="center" flexDirection="column">
          <Form store={formStore}>
            <Stack p="12">
              <Text weight="medium" size="small" color="moderate">
                TODO(vkorolik) {session}
              </Text>
              <Form.Input name={formStore.names.projectId} placeholder="Project ID" size="xSmall" />
            </Stack>
            <Box borderBottom="divider" />
            <Box display="flex" justifyContent="flex-start" alignItems="center" p={'12'} gap="6">
              <Button kind="secondary" size="small" emphasis={'medium'} style={{ flexGrow: 1 }}>
                Open Highlight
              </Button>
              <ButtonIcon icon={<IconSolidCog />} />
            </Box>
          </Form>
        </Box>
      </Box>
    </Stack>
  )
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
