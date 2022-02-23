import { beep } from "./beeper";
import { intervalToString } from "./interval";

const invokeEvent = (handler: Function | undefined, args: unknown, invokeWhenHidden: boolean = false) => {
    if(!handler || (document.hidden && !invokeWhenHidden)) return;

    setTimeout(() => {
        handler(args);
    }, 0);
}

export interface ITimerArgs {
    target: Timer
}

export default class Timer {
    private onProgress?: (e: ITimerArgs) => void;
    private onIntervalFinished?: (e: ITimerArgs) => void;
    private onFinished?: (e: ITimerArgs) => void;
    private onStarted?: (e: ITimerArgs) => void;
    private onPaused?: (e: ITimerArgs) => void;

    private timerInterval;

    private isRunning: boolean = false;
    private intervals: number[];
    private intervalQueue: number[];
    private currentInterval: number = 0;
    private totalInterval: number = 0;
    private startTime: number = 0;
    private runDuration: number = 0;
    private prevSeconds: number = 0;
    private totalSeconds: number;
    
    constructor(
        intervals: number[],
        handlers: {
            onProgress?: ((e: ITimerArgs) => void),
            onIntervalFinished?: ((e: ITimerArgs) => void),
            onFinished?: ((e: ITimerArgs) => void),
            onStarted?: ((e: ITimerArgs) => void),
            onPaused?: ((e: ITimerArgs) => void),
        } = {}
    ) {
        this.intervals = intervals;
        this.intervalQueue = [...this.intervals];
        this.startTime = new Date().getTime();
        this.onProgress = handlers.onProgress;
        this.onIntervalFinished = handlers.onIntervalFinished;
        this.onFinished = handlers.onFinished;
        this.onStarted = handlers.onStarted;
        this.onPaused = handlers.onPaused;
        this.totalSeconds = intervals.reduce((i, sum) => sum += i, 0);
        this.shiftIntervalQueue();
    }

    getTotalPercent(): number {
        return this.getSecondsLeft() / this.totalSeconds * 100;
    };
    getIntervalSecondsLeft(): number {
        return this.totalInterval - this.getSeconds();
    }
    getIntervalPercent(): number {
        return this.getIntervalSecondsLeft() / this.currentInterval * 100;
    };
    getRestIntervals(): number {
        return this.intervalQueue.length + 1;
    };
    getSeconds(): number {
        const currentDuration = new Date().getTime() - this.startTime + this.runDuration;
        return Math.floor(currentDuration / 1000);
    }
    getSecondsLeft(): number {
        return this.totalSeconds - this.getSeconds();
    };
    getText(): string {
        return intervalToString(this.getSecondsLeft());
    }

    checkInterval = () => {
        if(!this.isRunning) {
            clearInterval(this.timerInterval);
        }

        const seconds = this.getSeconds();
        if (this.prevSeconds >= seconds) {
            return;
        }

        this.prevSeconds = seconds;
        const secondsLeft = this.getSecondsLeft();
        const intervalSecondsLeft = this.getIntervalSecondsLeft();

        invokeEvent(this.onProgress, { target: this });

        if (secondsLeft <= 0) {
            beep(3);
            this.reset();
            return;
        }
        if (intervalSecondsLeft <= 0) {
            this.currentInterval = this.intervalQueue.shift() || 0
            this.totalInterval += this.currentInterval;
            beep();
            console.log("Interval finished");
            invokeEvent(this.onIntervalFinished, { target: this });
        }
    }

    start() {
        if (this.isRunning) return;
        this.timerInterval = setInterval(this.checkInterval, 50);
        this.startTime = new Date().getTime();
        this.isRunning = true;
        invokeEvent(this.onStarted,{ target: this });
    }

    pause() {
        clearInterval(this.timerInterval);
        this.runDuration += new Date().getTime() - this.startTime;
        this.isRunning = false;
        invokeEvent(this.onPaused, { target: this });
    }

    reset() {
        clearInterval(this.timerInterval);
        this.prevSeconds = 0;
        this.isRunning = false;
        this.runDuration = 0;
        this.intervalQueue = [...this.intervals];
        this.totalInterval = 0;
        this.shiftIntervalQueue();
        this.startTime = new Date().getTime();
        invokeEvent(this.onFinished, { target: this }, true);
    }

    getIsRunning() {
        return this.isRunning;
    }

    private shiftIntervalQueue() {
        this.currentInterval = this.intervalQueue.shift() || 0
        this.totalInterval += this.currentInterval;
    }
}