export const countAllIntervals = (intervals: number[]): { min: number, sec: number, totalSec: number, text: string } => {
    const totalLength = intervals.reduce((interval, sum) => sum += interval, 0);
    return countInterval(totalLength);
}

export const countInterval = (interval: number) => {
    const sec = interval % 60;
    const min = (interval - sec) / 60;
    const lengthParts = Array<string>();
    if(min) lengthParts.push(`${min} min`)
    if(sec) lengthParts.push(`${sec} sec`)
    const text = lengthParts.join(', ') || '0 sec';
    return {
        min,
        sec,
        totalSec: interval,
        text,
    };
}