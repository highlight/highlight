import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export const useDashboardKeyboardShortcuts = () => {
    const timepickerRef = useRef<HTMLInputElement | null>(null);

    /**
     * This function needs to be called before each hot key.
     * This moves the window's focus from any interactable elements to the window.
     * Without this, undefined behavior will occur.
     * Example: If the user clicks a button, then presses space, space will trigger the default action on the button and also the space hotkey.
     */
    const moveFocusToDocument = (e: KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
        window.focus();

        if (
            document.activeElement &&
            document.activeElement instanceof HTMLElement
        ) {
            document.activeElement.blur();
        }
    };

    useHotkeys(
        't',
        (e) => {
            if (timepickerRef.current) {
                moveFocusToDocument(e);
                timepickerRef.current.click();
            }
        },
        []
    );

    return {
        timepickerRef,
    };
};
