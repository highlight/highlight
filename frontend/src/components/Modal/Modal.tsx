// eslint-disable-next-line no-restricted-imports
import { ModalProps, Modal as AntDesignModal } from 'antd';
import React from 'react';
import Close from '../../static/Close';
import styles from './Modal.module.scss';

type Props = Pick<ModalProps, 'width' | 'onCancel' | 'visible' | 'style'> & {
    title?: string;
};

const Modal: React.FC<Props> = ({ children, title, ...props }) => {
    return (
        <AntDesignModal
            footer={null}
            {...props}
            closeIcon={<Close height="18px" width="18px" />}
            className={styles.modal}
        >
            {title && <h1 className={styles.title}>{title}</h1>}
            <main>{children}</main>
        </AntDesignModal>
    );
};

export default Modal;
