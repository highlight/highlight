export function MillisToMinutesAndSeconds(millis: any) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ':' + seconds
}

export function MillisToMinutesAndSecondsVerbose(millis: any) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    var str = ''
    if (minutes) {
        str += minutes + ' min '
    }
    return str + seconds + ' seconds'
}
