# pino-highlight

## Usage

```tsx
import pino from 'pino'

const logger = pino({
    level: 'info',
    transport: {
        targets: [
            {
                target: '@highlight-run/pino',
                options: {
                    projectID: '<YOUR_PROJECT_ID>',
                },
                level: 'info',
            },
        ],
    },
})

logger.info('generating sitemap')
```
