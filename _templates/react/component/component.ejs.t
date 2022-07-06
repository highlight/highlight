---
to: frontend/src/<%= name %>/<%= componentName %>.tsx
---

import React from 'react';

import styles from './<%= name %>.module.scss';

interface Props {}

const <%= componentName %>: React.FC<Props> = (props) => {
    return (
        <div className={styles.<%= h.changeCase.camel(componentName) %>}>Hello from <%= componentName %>!</div>
    );
};

export default <%= componentName %>;
