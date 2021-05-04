import React from 'react';
import Button from '../../Button/Button/Button';
import Popover from '../../Popover/Popover';
import { FaBell } from 'react-icons/fa';
import styles from './Notification.module.scss';
import { useGetNotificationsQuery } from '../../../graph/generated/hooks';
import PopoverListContent from '../../Popover/PopoverListContent';

const Notifications = () => {
    const { loading, data } = useGetNotificationsQuery();

    console.log(data);
    return (
        <Popover
            hasBorder
            placement="bottomLeft"
            visible
            isList
            content={
                <div className={styles.popover}>
                    <PopoverListContent
                        listItems={
                            data?.comments_for_admin.map((comment, index) => (
                                <div key={comment?.id || index}>
                                    {comment?.text}
                                </div>
                            )) || []
                        }
                    />
                </div>
            }
        >
            <Button type="text" className={styles.button}>
                <FaBell />
            </Button>
        </Popover>
    );
};

export default Notifications;
