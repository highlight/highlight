import '@fontsource/poppins'
import '@highlight-run/ui/styles.css'
import './index.css'

import { ErrorBoundary } from '@highlight-run/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { H } from 'highlight.run'
import {
  Badge,
  Box,
  Button,
  ButtonIcon,
  Form,
  FormState,
  IconSolidCog,
  IconSolidHighlight,
  IconSolidPlayCircle,
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
  const [editingConfig, setEditingConfig] = React.useState<boolean>(false)
  const formStore = Form.useStore({
    defaultValues: {
      projectId: '',
      session: '',
    },
  })

  React.useEffect(() => {
    chrome.storage.sync.get(['sessionSecureID'], async ({ sessionSecureID }) => {
      formStore.setValue(formStore.names.session, sessionSecureID)
    })
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
  const session = formStore.useValue(formStore.names.session)
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
      <Box width={'full'} height={'full'} display="flex" flexDirection="column">
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
            onClick={() => window.close()}
            icon={
              <IconSolidX size={14} color={vars.theme.interactive.fill.secondary.content.text} />
            }
          />
        </Box>
        <Form store={formStore}>
          <Box display="flex" justifyContent="center" flexDirection="column" p="12">
            {editingConfig ? (
              <Box width="full" display="flex" flexDirection="column" gap="4">
                <Form.Label label={'Project ID'} name={formStore.names.projectId} />
                <Form.Input name={formStore.names.projectId} placeholder="Project ID" />
              </Box>
            ) : (
              <RecordingState formStore={formStore} />
            )}
            <Box my={'12'} borderBottom="divider" />
            <Box display="flex" justifyContent="flex-start" alignItems="center" gap="6">
              {editingConfig ? (
                <RecordingState formStore={formStore} />
              ) : (
                <>
                  <Button
                    kind="secondary"
                    size="small"
                    emphasis={'medium'}
                    style={{ flexGrow: 1 }}
                    onClick={() => window.open('https://app.highlight.io', '_blank')}
                  >
                    Open Highlight
                  </Button>
                  <ButtonIcon
                    kind="secondary"
                    size="small"
                    shape="square"
                    icon={<IconSolidCog width={14} height={14} />}
                    onClick={() => setEditingConfig(true)}
                  />
                </>
              )}
            </Box>
          </Box>
        </Form>
      </Box>
    </Stack>
  )
}

const RecordingState = ({
  formStore,
}: {
  formStore: FormState<{ projectId: string; session: string }>
}) => {
  const projectId = formStore.useValue(formStore.names.projectId)
  const session = formStore.useValue(formStore.names.session)
  return (
    <Badge
      shape={'basic'}
      variant={session ? 'purple' : 'gray'}
      label={session ? 'Recording' : 'Not recording'}
      iconStart={<IconSolidPlayCircle />}
      onClick={() =>
        session
          ? window.open(`https://app.highlight.io/${projectId}/sessions/${session}`, '_blank')
          : null
      }
    />
  )
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
