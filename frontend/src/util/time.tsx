export function MillisToMinutesAndSeconds(millis: number) {
    const minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    seconds = (seconds.length === 1 ? '0' : '') + seconds;
    return minutes + ':' + seconds;
}

export function MillisToMinutesAndSecondsVerbose(millis: number) {
    if (millis < 1000) {
        return `${millis} milliseconds`;
    }
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    let str = '';
    if (minutes) {
        str += minutes + ' min ';
    }
    return str + seconds + ' seconds';
}
