import { render, screen } from '@testing-library/react';
import React from 'react';
import StreamElementPayload from './StreamElementPayload';

describe('StreamElementPayload', () => {
    it('should handle undefined', () => {
        render(<StreamElementPayload />);
    });

    it('should handle a https url', () => {
        const url = 'https://foobar.com';
        render(<StreamElementPayload payload={url} />);

        expect(screen.getByText(url).getAttribute('href')).toBe(url);
    });

    it('should handle a localhost url', () => {
        const url = 'http://localhost:3000/1/sessions';
        render(<StreamElementPayload payload={url} />);

        expect(screen.getByText(url).getAttribute('href')).toBe(url);
    });

    it('should handle an object', () => {
        const object = {
            name: 'Foo',
            referrer: 'Bar',
        };
        render(<StreamElementPayload payload={JSON.stringify(object)} />);

        Object.keys(object).map((key) => {
            screen.getByText(key);
            screen.getByText(object[key]);
        });
    });

    it('should handle an object that has URL values', () => {
        const object = {
            name: 'Foo',
            referrer: 'Bar',
            url: 'https://foobar.com',
        };
        render(<StreamElementPayload payload={JSON.stringify(object)} />);

        Object.keys(object).map((key) => {
            screen.getByText(key);
            screen.getByText(object[key]);

            if (key === 'url') {
                expect(screen.getByText(object.url).getAttribute('href')).toBe(
                    object.url
                );
            }
        });
    });

    it('should handle a string', () => {
        const string = 'a[href=http://localhost:3000/1/sessions/3]';
        render(<StreamElementPayload payload={string} />);

        screen.getByText(string);
    });

    it('should handle a unknown payload', () => {
        const string = '{thisCould:be an object}';
        render(<StreamElementPayload payload={string} />);

        screen.getByText(string);
    });
});
