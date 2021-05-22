import { getElementSelector } from './index';

describe('getElementSelector', () => {
    const mockGetAttribute = (context: any) => (attribute: string) => {
        const mapping: { class: string; id: string } = {
            class: 'className',
            id: 'id',
        };
        // @ts-ignore
        return context[mapping[attribute]];
    };

    it('should handle elements with no class names and no ids', () => {
        const target = {
            id: '',
            className: '',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe('button');
    });

    it('should handle elements with a class name', () => {
        const target = {
            id: '',
            className: 'abc123',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe('.abc123');
    });

    it('should handle elements with multiple class names', () => {
        const target = {
            id: '',
            className: 'abc123 foo023 bar123 baz123',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe('.abc123.foo023.bar123.baz123');
    });

    it('should handle elements with an id', () => {
        const target = {
            id: 'uniqueId123',
            className: '',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe('#uniqueId123');
    });

    it('should handle elements with multiple ids', () => {
        const target = {
            id: 'uniqueId123 fo___o0823 baHJKFSDHGsdfdf',
            className: '',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe('#uniqueId123#fo___o0823#baHJKFSDHGsdfdf');
    });

    it('should handle elements with multiple ids and multiple class names', () => {
        const target = {
            id: 'uniqueId123 fo___o0823 baHJKFSDHGsdfdf',
            className: 'abc123 foo023 bar123 baz123',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe(
            '#uniqueId123#fo___o0823#baHJKFSDHGsdfdf.abc123.foo023.bar123.baz123'
        );
    });

    it('should handle elements with whitespace in the class name', () => {
        const target = {
            id: '',
            className: ' foobar   ',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe('.foobar');
    });

    it('should handle elements with a whitespace in the id', () => {
        const target = {
            id: '   bar',
            className: '',
            tagName: 'BUTTON',
            getAttribute: function (attribute: string) {
                return mockGetAttribute(this)(attribute);
            },
        } as Element;
        const result = getElementSelector(target);

        expect(result).toBe('#bar');
    });
});
