import React, { useState, useEffect } from 'react';

import styles from './Foo.module.css';
import { useQuery, gql } from '@apollo/client';

export const Foo = () => {
    return <p className={styles.test}>
        <Bar />
    </p>;
}

const Bar = () => {
    const [isFoo, setIsFoo] = useState<boolean>(true);
    const { loading, error, data } = useQuery<{
        admin: { id: string; name: string; email: string };
    }>(
        gql`
            query GetAdmin {
                admin {
                    id
                    name
                    email
                }
            }
        `,
    );
    useEffect(() => console.log('hi'), [isFoo])
    if (loading) {
        return <p>loading...</p>;
    }
    if (error) {
        return <p>{JSON.stringify(error)}</p>;
    }
    return (
        <>
            <p className={styles.test}>
                {JSON.stringify(data)}
                I am bar: {isFoo ? "true" : "false"}
            </p>
            <button onClick={() => setIsFoo(!isFoo)}>Change</button>
            <Baz value={isFoo} />
        </>
    );
}

const Baz = ({ value }: { value: boolean }) => {
    return <p className={styles.test}>{JSON.stringify(value)}</p>
}