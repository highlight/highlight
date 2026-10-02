import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'
import { styledVerticalScrollbar } from '@/style/common.css'

// Mirrors SettingsRouter.css.ts exactly — same tokens, same sizing logic.

export const sidebaritem = style({
    borderRadius: 4,
    color: themeVars.interactive.fill.secondary.content.text,
    cursor: 'pointer',
    padding: '8px 8px',
    width: 220,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    selectors: {
        '&:hover': {
            backgroundColor: themeVars.interactive.overlay.secondary.hover,
            color: themeVars.interactive.fill.secondary.content.onEnabled,
        },
    },
})

export const sidebarItemActive = style({
    backgroundColor: themeVars.interactive.overlay.secondary.pressed,
    color: themeVars.interactive.fill.secondary.content.onEnabled,
})

export const sidebarLabel = style({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
})

export const sidebarScroll = style([
    sprinkles({
        overflowY: 'auto',
        overflowX: 'hidden',
    }),
    styledVerticalScrollbar,
])

export const integrationIcon = style({
    flexShrink: 0,
    objectFit: 'contain',
    borderRadius: 4,
})

export const detailIcon = style({
    objectFit: 'contain',
    borderRadius: 6,
})

export const statusDot = style({
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
})

export const statusDotEnabled = style({
    backgroundColor: themeVars.static.content.good,
})

export const statusDotDisabled = style({
    backgroundColor: themeVars.interactive.fill.secondary.content.text,
})