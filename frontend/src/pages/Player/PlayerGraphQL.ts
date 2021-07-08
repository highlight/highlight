import { Context } from '@apollo/client';

import { PlayerURL } from './PlayerURL';

export const getPlayerGraphQLContext = (isDemo: boolean): Context => {
    const context: Context = {
        headers: {
            'Highlight-Demo': isDemo,
        },
    };
    const shareableSecret = PlayerURL.currentURL().getShareableSecret();
    if (!!shareableSecret) {
        context.headers['Shareable-Secret'] = shareableSecret;
    }
    return context;
};
