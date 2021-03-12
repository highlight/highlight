import React from 'react';
import { components } from 'react-select';
import Highlighter from 'react-highlight-words';

export const SearchMatchOption = (props: any) => {
    console.log('trigger');
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
    console.log(foundIndex, label.length, selectProps, parsedLabel);
    return (
        <components.Option {...props}>
            <Highlighter
                searchWords={[selectProps.length < 2 ? '' : selectProps]}
                highlightStyle={{
                    fontWeight: 500,
                    padding: '0px',
                    backgroundColor: 'transparent',
                }}
                textToHighlight={parsedLabel}
            />
        </components.Option>
    );
};
