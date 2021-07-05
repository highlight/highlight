import { ButtonProps } from 'antd';
import { H } from 'highlight.run';
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import Button from '../../../components/Button/Button/Button';
import CopyText from '../../../components/CopyText/CopyText';
import Popover from '../../../components/Popover/Popover';
import Switch from '../../../components/Switch/Switch';
import { DemoContext } from '../../../DemoContext';
import { useGetSessionQuery } from '../../../graph/generated/hooks';
import ReplayerContext from '../ReplayerContext';
import { ConsolePage } from '../Toolbar/DevToolsWindow/ConsolePage/ConsolePage';
import styles from './ShareButton.module.scss';
import { onGetLinkWithTimestamp, PlayerURL } from './utils/utils';

const ShareButton = (props: ButtonProps) => {
    const { time } = useContext(ReplayerContext);
    const { demo } = useContext(DemoContext);
    const { session_id } = useParams<{ session_id: string }>();
    const { loading, data } = useGetSessionQuery({
        variables: {
            id: demo ? process.env.REACT_APP_DEMO_SESSION ?? '0' : session_id,
        },
        context: { headers: { 'Highlight-Demo': demo } },
    });

    // const onClickHandler = () => {
    //     const url = onGetLinkWithTimestamp(time);
    //     message.success('Copied link!');
    //     navigator.clipboard.writeText(url.href);
    // };

    return (
        <Popover
            hasBorder
            placement="bottomLeft"
            isList
            content={
                <div className={styles.popover}>
                    <div className={styles.popoverContent}>
                        <h3>Share internally</h3>
                        <p>
                            All members of your organization are able to view
                            this session.
                        </p>
                        <CopyText
                            text={PlayerURL.currentURL()
                                .setTimestamp(time)
                                .toString()}
                        />
                        <h3>Share externally</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <div>
                                <Switch
                                    checked={!!data?.session?.is_shareable}
                                    onChange={() => {
                                        console.log(data);
                                    }}
                                    label="Allow anyone with the shareable link to view this session."
                                />
                                {!!data?.session?.shareable_secret ? (
                                    <CopyText
                                        text={PlayerURL.currentURL()
                                            .setShareableSecret(
                                                data?.session
                                                    ?.shareable_secret as string
                                            )
                                            .setTimestamp(time)
                                            .toString()}
                                    />
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            }
            onVisibleChange={(visible) => {
                if (visible) {
                    H.track('Clicked share popover', {});
                }
            }}
            trigger="click"
        >
            <Button type="primary" {...props} trackingId="ShareSession">
                Share
            </Button>
        </Popover>
    );
};

export default ShareButton;
