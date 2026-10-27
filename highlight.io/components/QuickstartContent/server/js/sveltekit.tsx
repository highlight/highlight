import { jsGetSnippet } from '../../backend/js/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'

export const JSSvelteKitContent: QuickStartContent = {
    title: 'SvelteKit',
    subtitle: 'Learn how to set up highlight.io in your SvelteKit application.',
    entries: [
        jsGetSnippet(['node']),
        {
            title: 'Install the Highlight SDK',
            content: 'Install the Highlight Node.js SDK to capture backend errors and logs.',
            code: [
                {
                    text: `npm install @highlight-run/node`,
                    language: 'bash',
                },
            ],
        },
        {
            title: 'Initialize Highlight in server hooks',
            content: 'Create or edit src/hooks.server.ts to initialize Highlight and wrap your SvelteKit server.',
            code: [
                {
                    text: `import type { Handle } from '@sveltejs/kit'
import { Node } from '@highlight-run/node'

const highlight = new Node({
    projectID: 'YOUR_PROJECT_ID',
})

export const handle: Handle = async ({ event, resolve }) => {
    return highlight.handleHttp(event, () => resolve(event))
}`,
                    language: 'js',
                },
            ],
        },
        {
            title: 'Verify the integration',
            content: 'Start your SvelteKit dev server and trigger an error to verify Highlight captures it.',
            code: [
                {
                    text: `npm run dev

# Visit your app and trigger an error
# Check your Highlight dashboard`,
                    language: 'bash',
                },
            ],
        },
    ],
}
