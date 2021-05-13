import { Maybe } from 'highlight.run/dist/client/src/graph/generated/operations';
import React from 'react';
import Confetti from 'react-confetti';

import { Session } from '../../../../../graph/generated/schemas';
import FirstTimeIndicator from '../FirstTimeIndicator/FirstTimeIndicator';

interface Props {
    containerRef: React.RefObject<HTMLDivElement>;
    session: Maybe<Session>;
}

const FirstTimeDecorations = ({ containerRef, session }: Props) => {
    if (!session?.first_time) {
        return null;
    }

    return (
        <>
            <FirstTimeIndicator userIdentifier={session.identifier} />
            {!session?.viewed &&
                containerRef.current?.offsetHeight &&
                containerRef.current.offsetWidth && (
                    <Confetti
                        height={containerRef.current.offsetHeight}
                        width={containerRef.current.offsetWidth}
                        numberOfPieces={150}
                        recycle={false}
                        tweenDuration={5000 * 2}
                    />
                )}
        </>
    );
};

export default FirstTimeDecorations;
