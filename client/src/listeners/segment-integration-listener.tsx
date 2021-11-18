enum SEGMENT_LOCAL_STORAGE_KEYS {
    USER_ID = 'ajs_user_id',
    USER_TRAITS = 'ajs_user_traits',
    ANONYMOUS_ID = 'ajs_anonymous_id',
}

export const SegmentIntegrationListener = (callback: (obj: any) => void) => {
    callback(window.location.href);
    var send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (data: any) {
        setTimeout(() => {
            var obj: any;
            try {
                obj = JSON.parse(data?.toString() ?? '');
            } catch (e) {
                return;
            }
            if (obj.type === 'track' || obj.type === 'identify') {
                callback(obj);
            }
        }, 100);
        send.call(this, data);
    };

    const localStorageHandler = (e: StorageEvent) => {
        if (
            e.key === SEGMENT_LOCAL_STORAGE_KEYS['USER_ID'] ||
            e.key === SEGMENT_LOCAL_STORAGE_KEYS['ANONYMOUS_ID'] ||
            e.key === SEGMENT_LOCAL_STORAGE_KEYS['USER_TRAITS']
        ) {
            const { userId, userTraits } = getLocalStorageValues();

            if (userId) {
                const payload = {
                    type: 'identify',
                    userId,
                    traits: userTraits,
                };

                callback(payload);
            }
        }
    };

    const { userId, userTraits } = getLocalStorageValues();

    if (userId) {
        let parsedUserTraits = {};
        if (userTraits) {
            parsedUserTraits = JSON.parse(userTraits);
        }
        const payload = {
            type: 'identify',
            userId: userId.toString(),
            traits: parsedUserTraits,
        };

        callback(payload);
    }

    window.addEventListener('storage', localStorageHandler);

    return () => {
        XMLHttpRequest.prototype.send = send;
    };
};

const getLocalStorageValues = () => {
    const userId = window.localStorage.getItem(
        SEGMENT_LOCAL_STORAGE_KEYS['USER_ID']
    );
    const userTraits = window.localStorage.getItem(
        SEGMENT_LOCAL_STORAGE_KEYS['USER_TRAITS']
    );
    const anonymousId = window.localStorage.getItem(
        SEGMENT_LOCAL_STORAGE_KEYS['ANONYMOUS_ID']
    );

    return {
        userId,
        userTraits,
        anonymousId,
    };
};
