import Button from '@components/Button/Button/Button';
import { DropdownIndicator } from '@components/DropdownIndicator/DropdownIndicator';
import Input from '@components/Input/Input';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import { useGetSuggestedMetricsQuery } from '@graph/hooks';
import { DashboardMetricConfig } from '@graph/schemas';
import AsyncSelect from '@highlight-run/react-select/async';
import PlusIcon from '@icons/PlusIcon';
import alertStyles from '@pages/Alerts/Alerts.module.scss';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { DEFAULT_METRICS_LAYOUT } from '@pages/Dashboards/Metrics';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { styleProps } from '@pages/Sessions/SessionsFeedV2/components/QuickSearch/QuickSearch';
import { useParams } from '@util/react-router/useParams';
import { Slider } from 'antd';
import { H } from 'highlight.run';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './CreateDashboardModal.module.scss';

interface MetricOption {
    value: string;
    label: string;
}

const getDefaultMetricConfig = (name: string): DashboardMetricConfig => {
    let cfg: DashboardMetricConfig | undefined = undefined;
    if (WEB_VITALS_CONFIGURATION.hasOwnProperty(name.toUpperCase())) {
        cfg = WEB_VITALS_CONFIGURATION[name.toUpperCase()];
    }
    return {
        name: name,
        help_article: cfg?.help_article || '',
        units: cfg?.units || 'ms',
        max_good_value: cfg?.max_good_value || 10,
        max_needs_improvement_value: cfg?.max_needs_improvement_value || 100,
        poor_value: cfg?.poor_value || 1000,
    };
};

const CreateDashboardModal = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const history = useHistory();
    const { updateDashboard } = useDashboardsContext();
    const [showModal, setShowModal] = useState(false);
    const [newMetric, setNewMetric] = useState<string>();
    const [isTyping, setIsTyping] = useState(false);
    const [newDashboard, setNewDashboard] = useState<{
        name: string;
        metrics: DashboardMetricConfig[];
    }>({
        name: '',
        metrics: [],
    });
    const { loading, refetch } = useGetSuggestedMetricsQuery({
        variables: {
            project_id,
            prefix: '',
        },
    });

    const getValueOptions = (
        input: string,
        callback: (s: MetricOption[]) => void
    ) => {
        refetch({
            project_id,
            prefix: input,
        })?.then((fetched) => {
            setIsTyping(false);
            callback(
                fetched.data.suggested_metrics.map((s) => ({
                    label: s,
                    value: s,
                }))
            );
        });
    };

    // Ignore this so we have a consistent reference so debounce works.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadOptions = useMemo(() => _.debounce(getValueOptions, 100), []);

    const onCreateNewDashboard = () => {
        if (!newDashboard) return;
        updateDashboard({
            name: newDashboard.name,
            metrics: newDashboard.metrics,
            layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
        }).then((r) => {
            const newId = r.data?.upsertDashboard || '';
            history.push(`/${project_id}/dashboards/${newId}`);
        });
    };

    const updateMetric = (
        idx: number,
        attr: keyof DashboardMetricConfig,
        val: any
    ) => {
        newDashboard.metrics[idx] = {
            ...newDashboard.metrics[idx],
            [attr]: val,
        };
        setNewDashboard((d) => ({
            ...d,
            metrics: newDashboard.metrics,
        }));
    };

    return (
        <>
            <Modal
                onCancel={() => {
                    setShowModal(false);
                }}
                visible={showModal}
                title={'Create a New Dashboard'}
                width="800px"
            >
                <ModalBody>
                    <section className={styles.section}>
                        <h3 style={{ fontWeight: 'normal' }}>
                            What do you want to call it?
                        </h3>
                        <div className={styles.name}>
                            <Input
                                placeholder="Name"
                                name="Dashboard Name"
                                value={newDashboard.name}
                                onChange={(e) => {
                                    const val = e.target?.value || '';
                                    setNewDashboard((d) => ({
                                        ...d,
                                        name: val,
                                    }));
                                }}
                                autoFocus
                            />
                        </div>
                    </section>
                    <section
                        className={styles.section}
                        hidden={!newDashboard.name.length}
                    >
                        <h3 style={{ fontWeight: 'normal' }}>
                            What metrics do you want to show?
                        </h3>
                        {newDashboard.metrics.map((m, idx) => (
                            <div className={styles.metric} key={m.name}>
                                <Input
                                    placeholder="Metric"
                                    name="Metric"
                                    value={m.name}
                                    onChange={(e) => {
                                        updateMetric(
                                            idx,
                                            'name',
                                            e.target?.value || ''
                                        );
                                    }}
                                    autoFocus
                                />
                                <Input
                                    placeholder="Units"
                                    name="Units"
                                    value={m.units}
                                    onChange={(e) => {
                                        updateMetric(
                                            idx,
                                            'units',
                                            e.target?.value || ''
                                        );
                                    }}
                                />
                                <Input
                                    placeholder="Help Article"
                                    name="Help Article"
                                    value={m.help_article}
                                    onChange={(e) => {
                                        updateMetric(
                                            idx,
                                            'help_article',
                                            e.target?.value || ''
                                        );
                                    }}
                                />
                                {/*TODO(vkorolik) incorporate all three values*/}
                                <Slider
                                    range
                                    step={1}
                                    tooltipVisible={true}
                                    tooltipPlacement={'top'}
                                    getTooltipPopupContainer={() =>
                                        document.querySelector(
                                            '.ant-slider-step'
                                        )!
                                    }
                                    disabled={false}
                                    min={0}
                                    max={1000}
                                    value={[m.max_good_value, m.poor_value]}
                                    onChange={([min, max]) => {
                                        updateMetric(
                                            idx,
                                            'max_good_value',
                                            min
                                        );
                                        updateMetric(idx, 'poor_value', max);
                                    }}
                                />
                            </div>
                        ))}
                        <div className={styles.newMetric}>
                            <div className={styles.container}>
                                <DropdownIndicator
                                    height={26}
                                    isLoading={loading || isTyping}
                                />
                                <AsyncSelect
                                    // @ts-expect-error
                                    styles={{
                                        ...styleProps,
                                        valueContainer: (provided) => ({
                                            ...provided,
                                            padding: '0 12px',
                                            height: '40px',
                                            cursor: 'text',
                                        }),
                                    }}
                                    components={{
                                        DropdownIndicator: () => (
                                            <div
                                                className={
                                                    styles.dropdownPlaceholder
                                                }
                                            ></div>
                                        ),
                                    }}
                                    loadOptions={(
                                        input,
                                        callback: (
                                            options: MetricOption[]
                                        ) => void
                                    ) => {
                                        loadOptions(input, callback);
                                    }}
                                    onInputChange={(newValue) => {
                                        setIsTyping(newValue !== '');
                                    }}
                                    onChange={(newValue: MetricOption) => {
                                        setNewMetric(newValue.value);
                                    }}
                                    isLoading={loading}
                                    isClearable={false}
                                    value={{
                                        value: newMetric,
                                        label: newMetric,
                                    }}
                                    escapeClearsValue={true}
                                    defaultOptions={Object.keys(
                                        WEB_VITALS_CONFIGURATION
                                    ).map(
                                        (k) =>
                                            ({
                                                label: k,
                                                value: k,
                                            } as MetricOption)
                                    )}
                                    noOptionsMessage={({ inputValue }) =>
                                        !inputValue
                                            ? null
                                            : `No results for "${inputValue}"`
                                    }
                                    placeholder="Search for a metric..."
                                    isSearchable
                                    maxMenuHeight={500}
                                />
                            </div>
                            <Button
                                style={{ width: 90 }}
                                trackingId={'AddNewMetric'}
                                onClick={() => {
                                    if (newMetric?.length) {
                                        setNewDashboard((d) => ({
                                            ...d,
                                            metrics: [
                                                ...newDashboard.metrics,
                                                getDefaultMetricConfig(
                                                    newMetric
                                                ),
                                            ],
                                        }));
                                        setNewMetric('');
                                    }
                                }}
                            >
                                Add
                                <PlusIcon style={{ marginLeft: '1em' }} />
                            </Button>
                        </div>
                    </section>
                    <div className={styles.actionsContainer}>
                        <Button
                            trackingId="CreateDashboardModalCancelButton"
                            onClick={() => {
                                setShowModal(false);
                            }}
                            type="default"
                            className={styles.button}
                        >
                            Cancel
                        </Button>
                        <Button
                            trackingId="CreateDashboardModalConfirmButton"
                            onClick={onCreateNewDashboard}
                            type="primary"
                            className={styles.button}
                        >
                            Create
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
            <Button
                trackingId={'NewDashboard'}
                className={alertStyles.callToAction}
                onClick={() => {
                    setShowModal(true);
                    H.track(`CreateDashboardModal-Open`);
                }}
            >
                New Dashboard
            </Button>
        </>
    );
};

export default CreateDashboardModal;
