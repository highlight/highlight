import React from 'react';
import { components } from 'react-select';
import Highlighter from 'react-highlight-words';

export const SearchMatchOption = (props: any) => {
    const label = props.data.label;
    const selectProps = props.selectProps.inputValue
        ? props.selectProps.inputValue
        : '';
    const foundIndex =
        selectProps.length < 2
            ? label.length
            : Math.min(
                  label.toLowerCase().search(selectProps.toLowerCase()) +
                      selectProps.length +
                      20,
                  label.length
              );
    const parsedLabel =
        (foundIndex === label.length ? '' : '...') +
        label.substring(0, foundIndex);
    return (
        <components.Option {...props}>
            <Highlighter
                searchWords={[selectProps.length < 2 ? '' : selectProps]}
                highlightStyle={{
                    fontWeight: 400,
                    padding: '0px',
                    backgroundColor: 'transparent',
                }}
                textToHighlight={parsedLabel}
            />
        </components.Option>
    );
};
