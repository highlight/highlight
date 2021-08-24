import { namedOperations } from '@graph/operations';
import { message } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';

import commonStyles from '../../../../Common.module.scss';
import Button from '../../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../../components/Loading/Loading';
import Modal from '../../../../components/Modal/Modal';
import ModalBody from '../../../../components/ModalBody/ModalBody';
import { useCreateErrorSegmentMutation } from '../../../../graph/generated/hooks';
import { useErrorSearchContext } from '../../ErrorSearchContext/ErrorSearchContext';
import styles from './SegmentButtons.module.scss';

interface Props {
    showModal: boolean;
    onHideModal: () => void;
    /** Called after a segment is created. */
    afterCreateHandler?: (segmentId: string, segmentValue: string) => void;
}

type Inputs = {
    name: string;
};

const CreateErrorSegmentModal = ({
    showModal,
    onHideModal,
    afterCreateHandler,
}: Props) => {
    const [createSegment, { loading }] = useCreateErrorSegmentMutation({
        refetchQueries: [namedOperations.Query.GetErrorSegments],
    });
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { organization_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const { searchParams, setExistingParams } = useErrorSearchContext();
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
            if (afterCreateHandler) {
                afterCreateHandler(
                    r.data?.createErrorSegment?.id as string,
                    r.data?.createErrorSegment?.name as string
                );
            } else {
                history.push(
                    `/${organization_id}/errors/segment/${r.data?.createErrorSegment?.id}`
                );
            }
            onHideModal();
            reset();
            message.success(
                `Created '${r.data?.createErrorSegment?.name}' segment`,
                5
            );
        });
    };

    return (
        <Modal
            title="Create a Segment"
            visible={showModal}
            onCancel={onHideModal}
            style={{ display: 'flex' }}
            width={500}
        >
            <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <p className={styles.modalSubTitle}>
                        Enter the name of your segment and you'll be good to go!
                    </p>
                    <input
                        className={commonStyles.input}
                        name="name"
                        ref={register({ required: true })}
                        placeholder={'Segment Name'}
                        autoFocus
                    />
                    <div className={commonStyles.errorMessage}>
                        {errors.name &&
                            'Error with segment name ' + errors.name.message}
                    </div>
                    <Button
                        trackingId="SaveErrorSegmentFromExistingSegment"
                        style={{
                            width: '100%',
                            marginTop: 24,
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

export default CreateErrorSegmentModal;
