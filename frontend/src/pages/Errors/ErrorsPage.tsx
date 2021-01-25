import React from 'react';
import {useState, useEffect} from 'react';
import {Button} from 'antd';
import styles from './ErrorsPage.module.scss';

export const ErrorsPage = () => {
    const [data, setData] = useState<Array<Error>>([]);

    useEffect

    function throwError() : void {
        /*try {
            throw new Error("Bad stuff");
        } catch (error) {
            setErrors([
                ...Errors, error
            ]);
        }*/
        throw new Error("This error is from a throw");
    }

    function consoleError(): void{
        console.log("This error was from the console")
    }

    return (
        <div>
            <div className={styles.advancedText}>
                <Button type="primary" onClick={throwError}>Throw Error</Button>
                <Button type="primary" onClick={consoleError}>Console Error</Button>
            </div>
            <div className={styles.errorText}> 
                {Errors.map((object: any) => (
                    <p>{object.message} --- {object.stack}</p>
                ))}
            </div>
        </div>
    )
    
}