export function MillisToMinutesAndSeconds(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return minutes + ':' + seconds.toString().padStart(2, '0');
}

export function MillisToMinutesAndSecondsVerbose(millis: number) {
    if (millis < 1000) {
        return `${millis} milliseconds`;
    }
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    let str = '';
    if (minutes) {
        str += minutes + ' min ';
    }
    return str + seconds + ' seconds';
}
