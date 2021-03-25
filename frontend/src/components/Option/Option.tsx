import React from 'react';
import { components, OptionProps } from 'react-select';
import Highlighter from 'react-highlight-words';
import styles from './Option.module.scss';

const SearchMatch = ({
    label,
    selectProps,
    className,
    reverse,
}: {
    label: string;
    selectProps: string;
    className?: string;
    reverse?: boolean;
}) => {
    const startLength = reverse ? label.length : 0;
    const foundIndex =
        selectProps.length < 2
            ? startLength
            : reverse
            ? Math.min(
                  label.toLowerCase().search(selectProps.toLowerCase()) +
                      selectProps.length +
                      20,
                  label.length
              )
            : Math.max(
                  label.toLowerCase().search(selectProps.toLowerCase()) - 20,
                  0
              );
    const parsedLabel =
        (foundIndex === startLength ? '' : '...') +
        (reverse
            ? label.substring(0, foundIndex)
            : label.substring(foundIndex));
    return (
        <Highlighter
            className={className}
            searchWords={[selectProps.length < 2 ? '' : selectProps]}
            highlightStyle={{
                fontWeight: 400,
                padding: '0px',
                backgroundColor: 'transparent',
            }}
            textToHighlight={parsedLabel}
        />
    );
};

export const SearchMatchOption = (
    props: React.PropsWithChildren<
        OptionProps<
            {
                label: string;
                value: string;
            },
            false
        >
    >
) => (
    <div title={props.data.label}>
        <components.Option {...props}>
            <SearchMatch
                selectProps={props.selectProps.inputValue || ''}
                label={props.data.label}
                reverse={true}
            />
        </components.Option>
    </div>
);

export const PropertyOption = (
    props: React.PropsWithChildren<
        OptionProps<
            {
                label: string;
                value: string;
                name: string;
            },
            true
        >
    >
) => {
    const {
        data: { name, value, label },
    } = props;
    return (
        <div title={label}>
            <components.Option {...props}>
                <div className={styles.propertyWrapper}>
                    <SearchMatch
                        className={styles.propertyLabel}
                        selectProps={props.selectProps.inputValue || ''}
                        label={name ? value : label}
                    />
                    {name && <span className={styles.propertyTag}>{name}</span>}
                </div>
            </components.Option>
        </div>
    );
};
