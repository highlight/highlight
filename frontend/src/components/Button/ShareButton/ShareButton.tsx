import classNames from 'classnames';
import React from 'react';

import SvgShareIcon from '../../../static/ShareIcon';
import Button, { GenericHighlightButtonProps } from '../Button/Button';
import styles from './ShareButton.module.scss';

type Props = {} & Pick<React.HTMLAttributes<HTMLButtonElement>, 'onClick'> &
    GenericHighlightButtonProps;

const ShareButton = (props: Props) => {
    return (
        <Button
            type="link"
            {...props}
            className={classNames(props.className, styles.button)}
        >
            <SvgShareIcon />
            Share
        </Button>
    );
};

export default ShareButton;
