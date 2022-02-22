import { intervalToString } from "./interval";

export default class Timer {
    private onProgress?: (totalLeft: number, intervalLeft: number, text: string) => void;
    private onIntervalFinished?: () => void;
    private onFinished?: () => void;
    private onStarted?: () => void;
    private onPaused?: () => void;

    private timerInterval;

    private isRunning: boolean = false;
    private intervals: number[];
    private currentInterval: number = -1;
    private totalInterval: number = -1;
    private startTime: number = 0;
    private runDuration: number = 0;
    private seconds: number = 0;
    private totalSeconds: number;
    
    constructor(
        intervals: number[],
        handlers: {
            onProgress?: ((secondsLeft: number, intervalLeft: number, text: string) => void),
            onIntervalFinished?: (() => void),
            onFinished?: (() => void),
            onStarted?: (() => void),
            onPaused?: (() => void),
        } = {}
    ) {
        this.intervals = [...intervals];
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

        console.log(intervalPercent);
        this.onProgress && this.onProgress(intervalPercent, totalPercent, intervalToString(secondsLeft));

        if (secondsLeft === 0) {
            this.onFinished && this.onFinished();
            this.reset();
            return;
        }
        if (intervalLeft === 0) {
            this.currentInterval = this.intervals.shift() || 0
            this.totalInterval += this.currentInterval;
            this.onIntervalFinished && this.onIntervalFinished()
        }
    }

    start() {
        if (this.isRunning) return;
        if (!this.runDuration) {
            this.currentInterval = this.intervals.shift() || -1;
            this.totalInterval = this.currentInterval;
        }
        console.log("Timer started")
        this.timerInterval = setInterval(this.checkInterval, 50);
        this.startTime = new Date().getTime();
        this.isRunning = true;
    }

    pause() {
        clearInterval(this.timerInterval);
        this.runDuration += new Date().getTime() - this.startTime;
        this.isRunning = false;
    }

    reset() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.runDuration = 0;
    }
}