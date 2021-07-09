import { Context } from '@apollo/client';

import { PlayerURL } from './PlayerURL';

export const getPlayerGraphQLContext = (isDemo: boolean): Context => {
    console.log('Getting context');
    const context: Context = {
        headers: {
            'Highlight-Demo': isDemo,
        },
    };
    console.log('Player URL:', PlayerURL.currentURL());
    const shareableSecret = PlayerURL.currentURL().getShareableSecret();
    if (!!shareableSecret) {
        console.log('Adding shareable secret');
        context.headers['Shareable-Secret'] = shareableSecret;
    }
    console.log(context);
    return context;
};
