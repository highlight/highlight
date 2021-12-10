export const initializeFeedbackWidget = () => {
    const container = document.createElement('div');
    container.id = 'highlight-feedback-container';
    container.style.setProperty('position', 'fixed');
    container.style.setProperty('z-index', '2147483001');
    container.style.setProperty('bottom', '12px');
    container.style.setProperty('right', '12px');

    const formContainer = document.createElement('div');
    formContainer.id = 'highlight-form-container';
    const form = document.createElement('form');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    const verbatimInput = document.createElement('textarea');
    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.innerText = 'Send Feedback!';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // @ts-expect-error
        if (window?.H?.addSessionFeedback) {
            // @ts-expect-error
            window.H.addSessionFeedback({
                verbatim: verbatimInput.value,
                userEmail: emailInput.value,
                userName: 'Bob Hyle',
            });
        }
    });

    [nameInput, emailInput, verbatimInput, submitButton].forEach((element) => {
        form.appendChild(element);
    });

    formContainer.appendChild(form);

    const button = document.createElement('button');
    button.addEventListener('click', () => {
        if (document.body.querySelector('#highlight-form-container')) {
            document.body.removeChild(formContainer);
        } else {
            document.body.appendChild(formContainer);

            const nameFromSessionStorage = window.sessionStorage.getItem(
                'highlightIdentifier'
            );

            if (nameFromSessionStorage) {
                nameInput.value = nameFromSessionStorage;
            }
        }
    });
    button.textContent = 'Highlight';

    container.appendChild(button);

    document.body.appendChild(container);
    // 2. Add an event listener to the button to show the widget
    // 3. Render the widget
};
