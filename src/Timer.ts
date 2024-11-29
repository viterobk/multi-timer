import { IInterval } from "./Components/TimeInterval";
import { intervalToString } from "./interval";

const invokeEvent = (handler: Function | undefined, args: unknown) => {
  handler && handler(args);
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
  private onReset?: (e: ITimerArgs) => void;

  private timerInterval;

  private isRunning: boolean = false;
  private intervals: IInterval[];
  private intervalQueue: IInterval[];
  private currentInterval: IInterval = { duration: 0, description: '' };
  private totalInterval: number = 0;
  private startTime: number = 0;
  private runDuration: number = 0;
  private prevSeconds: number = 0;
  private totalSeconds: number;

  constructor(
    intervals: IInterval[],
    handlers: {
      onProgress?: ((e: ITimerArgs) => void),
      onIntervalFinished?: ((e: ITimerArgs) => void),
      onFinished?: ((e: ITimerArgs) => void),
      onStarted?: ((e: ITimerArgs) => void),
      onPaused?: ((e: ITimerArgs) => void),
      onReset?: ((e: ITimerArgs) => void),
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
    this.onReset = handlers.onReset;
    this.totalSeconds = intervals.reduce((sum, i) => sum += i.duration, 0);
    this.shiftIntervalQueue();
  }

  getTotalPercent(): number {
    return this.getSecondsLeft() / this.totalSeconds * 100;
  };
  getIntervalSecondsLeft(): number {
    return this.totalInterval - this.getSeconds();
  }
  getIntervalPercent(): number {
    return this.getIntervalSecondsLeft() / this.currentInterval.duration * 100;
  };
  getCurrentInterval(): IInterval {
    return this.currentInterval;
  }
  getRestIntervals(): IInterval[] {
    return [...this.intervalQueue];
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
    if (!this.isRunning) {
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
      this._reset();
      invokeEvent(this.onFinished, { target: this });
      return;
    }
    if (intervalSecondsLeft <= 0) {
      this.currentInterval = this.intervalQueue.shift() || { duration: 0, description: '' };
      this.totalInterval += this.currentInterval.duration;
      invokeEvent(this.onIntervalFinished, { target: this });
    }
  }

  start() {
    if (this.isRunning) return;
    this.timerInterval = setInterval(this.checkInterval, 50);
    this.startTime = new Date().getTime();
    this.isRunning = true;
    invokeEvent(this.onStarted, { target: this });
  }

  pause() {
    clearInterval(this.timerInterval);
    this.runDuration += new Date().getTime() - this.startTime;
    this.isRunning = false;
    invokeEvent(this.onPaused, { target: this });
  }

  reset() {
    this._reset()
    invokeEvent(this.onReset, { target: this });
  }

  private _reset() {
    clearInterval(this.timerInterval);
    this.prevSeconds = 0;
    this.isRunning = false;
    this.runDuration = 0;
    this.intervalQueue = [...this.intervals];
    this.totalInterval = 0;
    this.shiftIntervalQueue();
    this.startTime = new Date().getTime();
  }

  getIsRunning() {
    return this.isRunning;
  }

  private shiftIntervalQueue() {
    this.currentInterval = this.intervalQueue.shift() || { duration: 0, description: '' };
    this.totalInterval += this.currentInterval.duration;
  }
}