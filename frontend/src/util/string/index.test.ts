import { validateEmail } from './index';

describe('validateEmail', () => {
    const CASES = [
        ['', false],
        ['.@highlight.run', false],
        ['foo@bar.', false],
        ['foo', false],
        ['foo@Æ.run', false],
        ['¥@highlight.run', true],
        ['foo@highlight.run', true],
    ];

    it.each(CASES)('should validate %s as %s', (email, expected) => {
        expect(validateEmail(email as string)).toBe(expected as Boolean);
    });
});
