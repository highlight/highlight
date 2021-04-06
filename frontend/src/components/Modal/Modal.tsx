// eslint-disable-next-line no-restricted-imports
import { ModalProps, Modal as AntDesignModal } from 'antd';
import React from 'react';
import Close from '../../static/Close';
import styles from './Modal.module.scss';

type Props = Pick<
    ModalProps,
    'width' | 'onCancel' | 'visible' | 'style' | 'forceRender' | 'style'
> & {
    hideCloseIcon?: boolean;
    title?: string;
};

const Modal: React.FC<Props> = ({
    children,
    title,
    hideCloseIcon,
    ...props
}) => {
    return (
        <AntDesignModal
            footer={null}
            {...props}
            closeIcon={
                hideCloseIcon ? <Close height="18px" width="18px" /> : <></>
            }
        >
            {title && <h1 className={styles.title}>{title}</h1>}
            <main style={props.style}>{children}</main>
        </AntDesignModal>
    );
};

export default Modal;
