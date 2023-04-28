# Code Guidelines for React

Hat tip to Clean Code by Robert C. Martin (Uncle Bob)

## Goals

- Consistency
- Predictability
- Maintainability
- Readability

## Style

- Take time to craft great variable and function names. It's ok to be verbose. Avoid abbreviations.
- Replace magic numbers with named constants.
- Remove dead code aggressively. We can always recover it from version control.
- Use vertical whitespace to aid readability.
  - Related lines should be vertically close.
  - A block of variable declarations should be followed by a blank line.
  - Use a blank line above return statements.
  - Don't stack code too tight vertically, especially `if` blocks.
- Use Prettier/ESLint to avoid bike-shedding.
- Prefer copy/paste to premature abstraction.
  - Abstractions tend to reveal themselves quickly on the second or third copy/paste.
  - It's easier to abstract code than to remove an abstraction.
- Break switch statements into their own functions with returns rather than `break;`.

## File structure

- Higher-order functions go at the top of the file when possible.
- Named exports are preferred to default exports. It's easier to control naming.
- Inline exports are preferred to the define-then-export pattern.

## Testing

Flakey tests are the worst. The following patterns ensure that tests don't interact.

- Prefer many `describe` blocks.
- Setup and teardown belong in `beforeEach`/`afterEach` blocks if possible. 
- `beforeAll`/`afterAll` can be a reasonable fallback.
- Some setup may be required in `it` blocks, but try to minimize it
- Prefer `uuid` strings to `testing-testing-123`-style strings.
- Don't over-test the DOM structure. 
  - Focus on testing functionality.
  - Simple components need tests too, mostly to make sure we don't break their imports.
  - Testing is as much about easy refactors as anything. We need to be able to refactor confidently.
- Don't be afraid to instrument your code for testing purposes.
- Get good at mocking imports.
  - Declare your mocks variables at the top of the file with the `let mock*` pattern.
  - `jest.mock()` calls should follow the `let mock*` declarations.
  - Jest automatically hoists your `jest.mock()` calls to the top of the file, so avoid confusion by keeping them near the top of the file. 
  - Avoid `mockFn.mockImplementation` and `mockFn.mockImplementationOnce`. They're not **bad**, but they're more verbose and a bit harder to read than the `let mock*` pattern.

## Javascript

- Prefer `const` over `let`. Avoid `var`.
- Prefer named functions, i.e., `function useSomething(){}` over anonymous functions.
- Arrow functions are best for one-liners.
- Write functional JS. `class` and `this` are unnecessary in most modern JavaScript.
- Avoid mutating objects. This is bug-avoidance-rule-number-one in JavaScript.
  - Object mutation is fine if it's visually close to the object declaration.
  - There are times when object mutation simplifies the code, but BE CAREFUL AND EXPLICIT.
- Be wary of using closure-scope for variable access. It's not functional and couples functions together, making refactors difficult.
- Prefer "dot-syntax" over excessive destructuring.
  - Well-crafted destructures can be very readable.
  - Too much destructuring can kill your readability.
  - For instance, always use `import constants from '~/constants';` This enables confident find/replace changes to the constants, because you can search for `constants.SOME_KEY`.
  - Destructuring removes the context of the variable. The reader no longer knows where it came from. This is fine in vertically-adjacent code... but it can be hard to read otherwise.

## Functions

- Prefer a single return. There are definitely exceptions, but early returns can make debugging difficult.
- Try to write small, single-purpose functions. Break functions down as much as is reasonable.
- Prefer single-argument functions. 
  - If multiple inputs are necessary, pass them in as a single object that can be destructured in the function signature.
  - This is just a guideline, but fewer arguments is better.
- Avoid nested conditionals when reasonable.

## Comments

- Comments lie and should be used sparingly.
- If you're changing commented code, make sure to review and edit the comments carefully.
- If you're about to commit a comment, see if you can avoid it with the following strategies:
  - Replace comments with well-named, single-purpose functions where possible.
  - Break multiple, ambiguous operations out into separate variable declarations.
  - Prefer single variables in `if` and `switch` statements over inline operations.

## React

- Use hooks liberally.
- Increase readability by extracting functionality from render functions out into private hooks.
- Prop drilling is fine for one or two levels, but use a context before it gets out of hand.
- Create "connected" functions explicitly in the same file as the main component.
  - The connected function should be the default export
  - Don't test the connected function.
  - Always consume the context via a hook. Contexts are miserable to mock, but hooks are easy.
- Try to keep render functions smallish.
  - This is a balancing act, but large DOM trees in a single function can be hard to read.
  - It's hard to break a render function into too many sub-components.
  - React elements are vanilla JS functions under the hood. Function guidelines apply.
- Prefer heavy contexts to heavy render functions and heavy hooks.
  - Aggressively shrink render functions down to their core job of rendering DOM.
  - Use Contexts for non-local, stateful functionality with render cycle access.
  - Use Hooks to extract stateless functionality that still needs React's render cycle.
  - Utility functions are pure and stateless. They don't access the render cycle.