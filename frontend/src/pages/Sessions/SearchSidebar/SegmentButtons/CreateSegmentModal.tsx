import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import Input from '@components/Input/Input';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

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
    /** Called after a segment is created. */
    afterCreateHandler?: (segmentId: string, segmentValue: string) => void;
}

type Inputs = {
    name: string;
};

const CreateSegmentModal = ({
    showModal,
    onHideModal,
    afterCreateHandler,
}: Props) => {
    const [createSegment, { loading }] = useCreateSegmentMutation({
        refetchQueries: [namedOperations.Query.GetSegments],
    });
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { project_id } = useParams<{
        project_id: string;
        segment_id: string;
    }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;
    const { searchParams, setExistingParams } = useSearchContext();
    const history = useHistory();

    const onSubmit = (inputs: Inputs) => {
        createSegment({
            variables: {
                project_id,
                name: inputs.name,
                params: searchParams,
            },
        }).then((r) => {
            setExistingParams(searchParams);
            if (afterCreateHandler) {
                afterCreateHandler(
                    r.data?.createSegment?.id as string,
                    r.data?.createSegment?.name as string
                );
            } else {
                history.push(
                    `/${projectIdRemapped}/sessions/segment/${r.data?.createSegment?.id}`
                );
            }
            onHideModal();
            reset();
            message.success(
                `Created '${r.data?.createSegment?.name}' segment`,
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
            destroyOnClose
        >
            <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <p className={styles.modalSubTitle}>
                        Enter the name of your segment and you'll be good to go!
                    </p>
                    <Input
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
                        trackingId="SaveSessionSegmentFromExistingSegment"
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

export default CreateSegmentModal;
