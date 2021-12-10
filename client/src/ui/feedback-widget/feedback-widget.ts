const CONTAINER_ID = 'highlight-feedback-container';
const FORM_CONTAINER_ID = 'highlight-form-container';

export const initializeFeedbackWidget = () => {
    const container = createContainer(CONTAINER_ID);
    const formContainer = createFormContainer(FORM_CONTAINER_ID);

    const formTitle = createFormTitle('Got Feedback?');

    const nameInput = createInput('text');
    const emailInput = createInput('email');
    const verbatimInput = createTextArea();

    const form = createFormElement((e) => {
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

    const submitButton = createSubmitButton('Submit Feedback!');

    [formTitle, nameInput, emailInput, verbatimInput, submitButton].forEach(
        (element) => {
            form.appendChild(element);
        }
    );
    formContainer.appendChild(form);

    const onToggleFeedbackFormVisibility = () => {
        if (document.body.querySelector(`#${FORM_CONTAINER_ID}`)) {
            container.removeChild(formContainer);
        } else {
            container.appendChild(formContainer);

            const nameFromSessionStorage = window.sessionStorage.getItem(
                'highlightIdentifier'
            );

            if (nameFromSessionStorage) {
                nameInput.value = nameFromSessionStorage;
            }
        }
    };

    const launcherButton = createLauncherButton(onToggleFeedbackFormVisibility);

    container.appendChild(launcherButton);

    document.body.appendChild(container);
};

const applyInputStyles = (element: HTMLElement) => {
    element.style.setProperty('border', '0');
    element.style.setProperty('border-radius', '8px');
    element.style.setProperty('font-size', '14px');
    element.style.setProperty('padding', '16px');
    element.style.setProperty('width', '100%');
    element.style.setProperty('background-color', '#f2f2f2');
    element.style.setProperty('color', '#111111');
    element.style.setProperty('outline', 'none');
};

const applyButtonStyles = (element: HTMLElement) => {
    element.style.setProperty('align-items', 'center');
    element.style.setProperty('display', 'flex');
    element.style.setProperty('justify-content', 'center');
    element.style.setProperty('min-height', '40px');
    element.style.setProperty('height', 'auto');
    element.style.setProperty('padding-bottom', '8px');
    element.style.setProperty('padding-top', '8px');
    element.style.setProperty('color', 'white');
    element.style.setProperty('background', '#5629c6');
    element.style.setProperty('text-shadow', 'none');
    element.style.setProperty('box-shadow', 'none');
    element.style.setProperty('padding', '4px 16px');
    element.style.setProperty('font-size', '14px');
    element.style.setProperty('border-radius', '8px');
    element.style.setProperty('border', '0');
    element.style.setProperty('cursor', 'pointer');
};

const createFormElement = (onSubmitCallback: (e: any) => void) => {
    const form = document.createElement('form');

    form.style.setProperty('position', 'fixed');
    form.style.setProperty('transform', 'translate(-50%, -50%)');
    form.style.setProperty('top', '50%');
    form.style.setProperty('left', '50%');
    form.style.setProperty('background', 'white');
    form.style.setProperty('width', '400px');
    form.style.setProperty(
        'box-shadow',
        '0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%)'
    );
    form.style.setProperty('padding', '32px');
    form.style.setProperty('padding-top', '24px');
    form.style.setProperty('border-radius', '8px');
    form.style.setProperty('border', '1px solid #eaeaea');
    form.style.setProperty('display', 'flex');
    form.style.setProperty('flex-direction', 'column');
    form.style.setProperty('row-gap', '24px');

    form.addEventListener('submit', onSubmitCallback);

    return form;
};

const createInput = (type: string) => {
    const input = document.createElement('input');
    input.type = type;
    applyInputStyles(input);

    return input;
};

const createTextArea = () => {
    const textArea = document.createElement('textarea');
    applyInputStyles(textArea);

    return textArea;
};

const createSubmitButton = (label: string) => {
    const submitButton = document.createElement('input');
    applyButtonStyles(submitButton);
    submitButton.type = 'submit';
    submitButton.innerText = label;

    return submitButton;
};

const createFormTitle = (label: string) => {
    const formTitle = document.createElement('h1');
    formTitle.innerText = label;
    formTitle.style.setProperty('font-size', '24px');
    formTitle.style.setProperty('margin', '0');

    return formTitle;
};

const createContainer = (id: string) => {
    const container = document.createElement('div');
    container.id = id;
    container.style.setProperty('position', 'fixed');
    container.style.setProperty('z-index', '2147483001');
    container.style.setProperty('bottom', '12px');
    container.style.setProperty('right', '12px');

    return container;
};

const createFormContainer = (id: string) => {
    const formContainer = document.createElement('div');
    formContainer.id = id;

    return formContainer;
};

const createLauncherButton = (onClickHandler: () => void) => {
    const button = document.createElement('button');
    button.addEventListener('click', onClickHandler);
    button.textContent = 'Highlight';

    return button;
};
