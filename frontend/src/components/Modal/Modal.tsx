// eslint-disable-next-line no-restricted-imports
import { Modal as AntDesignModal, ModalProps } from 'antd';
import React from 'react';

import Close from '../../static/Close';
import styles from './Modal.module.scss';

type Props = Pick<
    ModalProps,
    | 'width'
    | 'onCancel'
    | 'visible'
    | 'style'
    | 'forceRender'
    | 'modalRender'
    | 'destroyOnClose'
    | 'centered'
    | 'mask'
    | 'getContainer'
> & {
    title?: string;
    minimal?: boolean;
};

const Modal: React.FC<Props> = ({ children, title, minimal, ...props }) => {
    const bodyStyle: React.CSSProperties = minimal
        ? {
              paddingTop: `var(--size-xSmall)`,
              paddingBottom: `var(--size-xSmall)`,
              paddingLeft: `var(--size-xSmall)`,
              paddingRight: `var(--size-xSmall)`,
          }
        : {};

    return (
        <AntDesignModal
            footer={null}
            {...props}
            closeIcon={!minimal ? <Close height="18px" width="18px" /> : null}
            className={styles.modal}
            closable={!minimal}
            bodyStyle={bodyStyle}
        >
            {title && <h2 className={styles.title}>{title}</h2>}
            <main className={styles.modalContent}>{children}</main>
        </AntDesignModal>
    );
};

export default Modal;
