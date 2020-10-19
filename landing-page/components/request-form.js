import styles from '../styles/Home.module.css';
import useFetch, {FetchData} from 'use-http';
import Spinner from 'react-bootstrap/Spinner';
import { useForm } from 'react-hook-form';

const RequestForm = (props) => {
    const { handleSubmit, register } = useForm();
    const { get, post, error, data, loading } = useFetch(
        process.env.NEXT_PUBLIC_BACKEND_URI
    );
    const onSubmit = (values) => {
        console.log(values);
        var d = new FormData()
        d.set("email", values.email)
        post("/email", {email: values.email})
    };

    if (error) {
        return <p>{JSON.stringify(error)}</p>;
    }

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
                        {loading ? (
                            <Spinner animation="border" style={{height:20, width:20}}/>
                        ) : data ? (
                            <CheckMark/>
                        ) : (
                            <span className={styles.accessText}>
                                Request Access
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

const CheckMark = () => {
    return (
        <div>
            <svg
                width="20"
                height="20"
                viewBox="0 0 64 64"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g>
                    <path
                        d="M17.6 56.3998C17 56.3998 16.3 56.1998 15.8 55.6998L0.700001 40.5998C-0.299999 39.5998 -0.299999 37.9998 0.700001 37.0998C1.7 36.0998 3.3 36.0998 4.2 37.0998L17.6 50.4998L59.7 8.2998C60.7 7.2998 62.3 7.2998 63.2 8.2998C64.2 9.2998 64.2 10.8998 63.2 11.7998L19.4 55.6998C18.9 56.1998 18.3 56.3998 17.6 56.3998Z"
                        fill="white"
                    />
                </g>
                <defs>
                    <clipPath id="clip0">
                        <rect width="64" height="64" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        </div>
    );
};

export default RequestForm;
