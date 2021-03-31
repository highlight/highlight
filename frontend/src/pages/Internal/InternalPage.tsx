import React, { ReactElement } from 'react';

function InternalPage(): ReactElement {
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
                <input type="password" name="" id="" value="foobar" />
            </label>
        </div>
    );
}

export default InternalPage;
