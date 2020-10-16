import styles from '../styles/Home.module.css';

import { useForm } from 'react-hook-form';

const RequestForm = (props) => {
    const { handleSubmit, register } = useForm();
    const onSubmit = (values) => {
        console.log(values)
    };

    return (
        <div className={styles.formSection}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formWrapper}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className={styles.requestInput}
                        ref={register({
                            required: true,
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'invalid email address',
                            },
                        })}
                    />
                    <br />
                    <button className={styles.requestButton}>
                        <span className={styles.accessText}>
                            Request Access
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequestForm;
