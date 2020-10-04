import React from 'react'
import { ImpulseSpinner } from 'react-spinners-kit'
import styles from './Spinner.module.css'

export const Spinner: React.FC = (props) => {
    return (
        <div className={styles.spinnerStyle}>
            <ImpulseSpinner frontColor="#5629C6" backColor="#5629C6" />
        </div>
    )
}
