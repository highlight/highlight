import { getTargetSelector } from './click-listener';

describe('click-listener', () => {
    const mockGetAttribute = (context: any) => (attribute: string) => {
        const mapping = {
            class: 'className',
            id: 'id',
        };
        return context[mapping[attribute]];
    };

    it('should handle elements with no class names and no ids', () => {
        const mockEvent = ({
            target: {
                id: '',
                className: '',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe('button');
    });

    it('should handle elements with a class name', () => {
        const mockEvent = ({
            target: {
                id: '',
                className: 'abc123',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe('.abc123');
    });

    it('should handle elements with multiple class names', () => {
        const mockEvent = ({
            target: {
                id: '',
                className: 'abc123 foo023 bar123 baz123',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe('.abc123.foo023.bar123.baz123');
    });

    it('should handle elements with an id', () => {
        const mockEvent = ({
            target: {
                id: 'uniqueId123',
                className: '',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe('#uniqueId123');
    });

    it('should handle elements with multiple ids', () => {
        const mockEvent = ({
            target: {
                id: 'uniqueId123 fo___o0823 baHJKFSDHGsdfdf',
                className: '',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe('#uniqueId123#fo___o0823#baHJKFSDHGsdfdf');
    });

    it('should handle elements with multiple ids and multiple class names', () => {
        const mockEvent = ({
            target: {
                id: 'uniqueId123 fo___o0823 baHJKFSDHGsdfdf',
                className: 'abc123 foo023 bar123 baz123',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe(
            '#uniqueId123#fo___o0823#baHJKFSDHGsdfdf.abc123.foo023.bar123.baz123'
        );
    });

    it('should handle elements with whitespace in the class name', () => {
        const mockEvent = ({
            target: {
                id: '',
                className: ' foobar   ',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe('.foobar');
    });

    it('should handle elements with a whitespace in the id', () => {
        const mockEvent = ({
            target: {
                id: '   bar',
                className: '',
                tagName: 'BUTTON',
                getAttribute: function (attribute: string) {
                    return mockGetAttribute(this)(attribute);
                },
            } as Element,
        } as unknown) as MouseEvent;
        const result = getTargetSelector(mockEvent);

        expect(result).toBe('#bar');
    });
});
