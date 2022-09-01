import { parseErrorDescription } from './utils'

describe('ErrorDescriptionUtils', () => {
	describe('parseErrorDescription', () => {
		it('should parse string interpolation', () => {
			const input = [
				'Warning: %s is deprecated in StrictMode. %s was passed an instance of %s which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://fb.me/react-strict-mode-find-node%s',
				'findDOMNode',
				'findDOMNode',
				'Draggable',
				'hello world',
			]
			const result = parseErrorDescription(input)

			expect(result).toBe(
				'Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Draggable which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://fb.me/react-strict-mode-find-nodehello world',
			)
		})

		it('should handle a string with no string interpolation', () => {
			const input = ['hello world%d', 'my name is foobar']
			const result = parseErrorDescription(input)

			expect(result).toBe('hello world%dmy name is foobar')
		})
	})
})
