# pino-highlight

## Usage

```tsx
import pino from 'pino'

const logger = pino({
    level: 'trace',
    transport: {
        targets: [
            {
                target: '@highlight-run/pino',
                options: {
                    projectID: '4d7k1xeo',
                },
                level: 'trace',
            },
            {
                target: 'pino-pretty',
                options: {},
                level: 'trace',
            },
        ],
    },
})

logger.info('generating sitemap')
```
