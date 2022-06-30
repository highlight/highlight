---
to: frontend/src/<%= isPage && 'pages' || 'components' %>/<%= name %>/<%= name %>.tsx
---

import React from 'react';

import styles from './TestComponent.module.scss';

interface Props {}

const TestComponent: React.FC<Props> = (props) => {
    return (
        <div className={styles.testComponent}>Hello from TestComponent!</div>
    );
};

export default TestComponent;
