import React from 'react';
import {useState} from 'react';
import {Button} from 'antd';
import styles from './ErrorsPage.module.scss';

export const ErrorsPage = () => {
    const [Errors, setErrors] = useState([] as any);

    function throwError() : void {
        try {
            throw new Error("Bad stuff");
        } catch (error) {
            setErrors([
                ...Errors, error
            ]);
        }
    }

    return (
        <div>
            <div className={styles.advancedText}>
                <Button type="primary" onClick={throwError}>Primary Button</Button>
            </div>
            <div className={styles.errorText}> 
                {Errors.map((object: any) => (
                    <p>{object.message} --- {object.stack}</p>
                ))}
            </div>
        </div>
    )
    
}