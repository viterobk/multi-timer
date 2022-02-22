import { beep } from "./beeper";
import { intervalToString } from "./interval";

export interface ITimerArgs {
    target: Timer
}

export interface IProgressArgs extends ITimerArgs{
    totalPercent: number;
    intervalPercent: number;
    text: string;
    restIntervals: number;
}

export default class Timer {
    private onProgress?: (e: IProgressArgs) => void;
    private onIntervalFinished?: (e: ITimerArgs) => void;
    private onFinished?: (e: IProgressArgs) => void;
    private onStarted?: (e: ITimerArgs) => void;
    private onPaused?: (e: ITimerArgs) => void;

    private timerInterval;

    private isRunning: boolean = false;
    private intervals: number[];
    private intervalQueue: number[];
    private currentInterval: number = -1;
    private totalInterval: number = -1;
    private startTime: number = 0;
    private runDuration: number = 0;
    private seconds: number = 0;
    private totalSeconds: number;
    
    constructor(
        intervals: number[],
        handlers: {
            onProgress?: ((e: IProgressArgs) => void),
            onIntervalFinished?: ((e: ITimerArgs) => void),
            onFinished?: ((e: IProgressArgs) => void),
            onStarted?: ((e: ITimerArgs) => void),
            onPaused?: ((e: ITimerArgs) => void),
        } = {}
    ) {
        this.intervals = intervals;
        this.intervalQueue = [...this.intervals];
        this.onProgress = handlers.onProgress;
        this.onIntervalFinished = handlers.onIntervalFinished;
        this.onFinished = handlers.onFinished;
        this.onStarted = handlers.onStarted;
        this.onPaused = handlers.onPaused;
        this.totalSeconds = intervals.reduce((i, sum) => sum += i, 0);
    }

    checkInterval = () => {
        if(!this.isRunning) {
            clearInterval(this.timerInterval);
        }

        const currentDuration = new Date().getTime() - this.startTime + this.runDuration;
        const seconds = Math.floor(currentDuration / 1000);
        if (this.seconds >= seconds) {
            return;
        }

        this.seconds = seconds;
        const secondsLeft = this.totalSeconds - seconds;
        const intervalLeft = this.totalInterval - seconds;
        const totalPercent = secondsLeft / this.totalSeconds * 100;
        const intervalPercent = intervalLeft / this.currentInterval * 100;

        this.onProgress && this.onProgress({
            intervalPercent,
            totalPercent,
            text: intervalToString(secondsLeft),
            restIntervals: this.intervalQueue.length + 1,
            target: this,
        });

        if (secondsLeft <= 0) {
            beep(3);
            this.reset();
            return;
        }
        if (intervalLeft <= 0) {
            this.currentInterval = this.intervalQueue.shift() || 0
            this.totalInterval += this.currentInterval;
            beep();
            this.onIntervalFinished && this.onIntervalFinished({ target: this })
        }
    }

    start() {
        if (this.isRunning) return;
        if (!this.runDuration) {
            this.currentInterval = this.intervalQueue.shift() || -1;
            this.totalInterval = this.currentInterval;
        }
        this.timerInterval = setInterval(this.checkInterval, 50);
        this.startTime = new Date().getTime();
        this.isRunning = true;
        this.onStarted && this.onStarted({ target: this });
    }

    pause() {
        clearInterval(this.timerInterval);
        this.runDuration += new Date().getTime() - this.startTime;
        this.isRunning = false;
        this.onPaused && this.onPaused({ target: this });
    }

    reset() {
        clearInterval(this.timerInterval);
        this.seconds = 0;
        this.isRunning = false;
        this.runDuration = 0;
        this.intervalQueue = [...this.intervals];
        this.totalInterval = 0;
        this.onFinished && this.onFinished({
            intervalPercent: 100,
            totalPercent: 100,
            text: intervalToString(this.totalSeconds),
            restIntervals: this.intervals.length,
            target: this,
        });
    }

    getIsRunning() {
        return this.isRunning;
    }
}