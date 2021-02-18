export function MillisToMinutesAndSeconds(millis: number) {
    const minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    seconds = (seconds.length === 1 ? '0' : '') + seconds;
    return minutes + ':' + seconds;
}

export function MillisToMinutesAndSecondsVerbose(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    let str = '';
    if (minutes) {
        str += minutes + ' min ';
    }
    return str + seconds + ' seconds';
}

export type Duration = {
    days: number;
    hours: number;
    minutes: number;
};

export function MillisToDaysHoursMinSeconds(t: number): Duration {
    const cd = 24 * 60 * 60 * 1000;
    const ch = 60 * 60 * 1000;
    const pad = function (n: number) {
        return n < 10 ? 0 + n : n;
    };

    let d = Math.floor(t / cd);
    let h = Math.floor((t - d * cd) / ch);
    let m = Math.round((t - d * cd - h * ch) / 60000);

    if (m === 60) {
        h++;
        m = 0;
    }
    if (h === 24) {
        d++;
        h = 0;
    }
    return {
        days: d,
        hours: pad(h),
        minutes: pad(m),
    };
}
