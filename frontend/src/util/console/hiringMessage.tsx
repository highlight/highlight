export const showHiringMessage = () => {
    printMessage("We'd love to chat! 👉 https://careers.highlight.run");
};

function printMessage(displayText: string) {
    const consolePayload = {
        line: !!displayText,
        logo: [
            /Safari/.test(navigator.userAgent) &&
                /Apple Comp/.test(navigator.vendor),
            /Chrome/.test(navigator.userAgent) &&
                /Google Inc/.test(navigator.vendor),
        ],
    };
    const highlightPurple = '#5629c6';
    const styles = `color: ${highlightPurple};font-size: 30px;padding-top: 12px;`;
    const message = {
        text: '%cWant to help build Highlight?',
        styles: [styles + '; font-weight: 900;'],
        logo: {
            text: '%c %c',
            styles: [
                '\n      font-size: 34px;\n     margin-right: 0px;\n      padding: 20px 20px 20px 20px;\n      background:\n        url("https://files.readme.io/e6aae4c-small-prod.png")\n        0 50% / 40px 40px\n        no-repeat;\n    ',
                '',
            ],
        },
        line: {
            text: '%c\n' + displayText + '\n ',
            styles: [
                `color: ${highlightPurple}; font-style: italic; font-size: 1.5em; padding-bottom: 12px;`,
            ],
        },
    };
    let r;
    let o;
    if (consolePayload.logo.indexOf(!0) >= 0) {
        let c;
        (message.text = '' + message.logo.text + message.text),
            (c = message.styles).unshift.apply(c, message.logo.styles);
    }
    if (consolePayload.line)
        (message.text += message.line.text),
            (o = message.styles).push.apply(o, message.line.styles);

    // @ts-ignore
    console.log.apply(r, ['\n' + message.text].concat(message.styles));
}
