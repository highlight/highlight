import { message } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';

import commonStyles from '../../../../Common.module.scss';
import Button from '../../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../../components/Loading/Loading';
import Modal from '../../../../components/Modal/Modal';
import ModalBody from '../../../../components/ModalBody/ModalBody';
import { useCreateSegmentMutation } from '../../../../graph/generated/hooks';
import { useSearchContext } from '../../SearchContext/SearchContext';
import styles from './SegmentButtons.module.scss';

interface Props {
    showModal: boolean;
    onHideModal: () => void;
}

type Inputs = {
    name: string;
};

const CreateSegmentModal = ({ showModal, onHideModal }: Props) => {
    const [createSegment, { loading }] = useCreateSegmentMutation({
        refetchQueries: ['GetSegments'],
    });
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { organization_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const { searchParams, setExistingParams } = useSearchContext();
    const history = useHistory();

    const onSubmit = (inputs: Inputs) => {
        createSegment({
            variables: {
                organization_id,
                name: inputs.name,
                params: searchParams,
            },
        }).then((r) => {
            setExistingParams(searchParams);
            history.push(
                `/${organization_id}/sessions/segment/${r.data?.createSegment?.id}`
            );
            onHideModal();
            reset();
            message.success('Segment Saved!', 5);
        });
    };

    return (
        <Modal
            title="Create a segment"
            visible={showModal}
            onCancel={onHideModal}
            style={{ display: 'flex' }}
        >
            <ModalBody className={styles.modalWrapper}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <p className={styles.modalSubTitle}>
                        Enter the name of your segment and you'll be good to go!
                    </p>
                    <input
                        className={commonStyles.input}
                        name="name"
                        ref={register({ required: true })}
                        placeholder={'Segment Name'}
                    />
                    <div className={commonStyles.errorMessage}>
                        {errors.name &&
                            'Error with segment name ' + errors.name.message}
                    </div>
                    <Button
                        trackingId="SaveSessionSegmentFromExistingSegment"
                        style={{
                            width: '100%',
                            marginTop: 10,
                            justifyContent: 'center',
                        }}
                        type="primary"
                        htmlType="submit"
                    >
                        {loading ? (
                            <CircularSpinner
                                style={{
                                    fontSize: 18,
                                    color: 'var(--text-primary-inverted)',
                                }}
                            />
                        ) : (
                            'Save As Segment'
                        )}
                    </Button>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default CreateSegmentModal;
