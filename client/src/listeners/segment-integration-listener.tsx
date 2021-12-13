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

    const localStorageHandler = (e: Pick<StorageEvent, 'key'>) => {
        if (
            e.key === SEGMENT_LOCAL_STORAGE_KEYS['USER_ID'] ||
            e.key === SEGMENT_LOCAL_STORAGE_KEYS['ANONYMOUS_ID'] ||
            e.key === SEGMENT_LOCAL_STORAGE_KEYS['USER_TRAITS']
        ) {
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

    // `window.addEventListener('storage', localStorageHandler)` only gets called when the storage
    // is changed on a different window/tab. Same-page changes do not cause an event to get created.
    // This breaks our use case here since Segment sets the localStorage values on the same tab that
    // Highlight is running on. Without this, we won't be able to read the Segment identify values.
    monkeyPatchLocalStorage(({ keyName }) => {
        const mockStorageEvent = {
            key: keyName,
        };

        localStorageHandler(mockStorageEvent);
    });

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

const monkeyPatchLocalStorage = (
    onSetItemHandler: ({
        keyName,
        keyValue,
    }: {
        keyName: string;
        keyValue: string;
    }) => void
) => {
    const originalSetItem = window.localStorage.setItem;

    window.localStorage.setItem = function () {
        const [keyName, keyValue] = (arguments as unknown) as [
            key: string,
            value: string
        ];
        onSetItemHandler({ keyName, keyValue });
        originalSetItem.apply(this, [keyName, keyValue]);
    };
};
