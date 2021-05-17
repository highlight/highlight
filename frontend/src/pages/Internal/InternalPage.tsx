import React, { ReactElement, useState } from 'react';

function InternalPage(): ReactElement {
    const [value, setValue] = useState('foobar');

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '8px',
            }}
        >
            <label>
                Password without a value attribute
                <input type="password" name="" id="" />
            </label>
            <label>
                Password with a value attribute
                <input
                    type="password"
                    name=""
                    id=""
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                />
            </label>
            <input type="text" />
        </div>
    );
}

export default InternalPage;
