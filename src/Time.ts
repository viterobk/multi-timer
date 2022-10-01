async function getCurrentTime() {
  let result;
  try {
    const timestamp = await (await fetch('https://time100.ru/api.php?type=ts')).json();
    result = new Date(timestamp);
  } catch (e) {
    console.log(e);
  }
  return result;
}
function getTimeParts(timestamp) {
  const date = new Date(timestamp);
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}
function isTimeDiffer(time1, time2) {
  return time1.seconds != time2.seconds
    || time1.minutes != time2.minutes
    || time2.hours != time2.hours;
}
export default class Time {
  private _creationTime;
  private _exactCreationTime;
  private _onTimeChange?: (e: { hours, minutes, seconds }) => void;
  private _prevTime;

  private check = () => {
    if (!this._onTimeChange) {
      return;
    }

    const time = this.getTime();
    if (isTimeDiffer(this._prevTime, time)) {
      this._prevTime = time;
      this._onTimeChange(time);
    }
    setTimeout(this.check, 200);
  }

  constructor() {
    this._creationTime = new Date().getTime();
    this._exactCreationTime = this._creationTime;
    getCurrentTime().then((time) => {
      if (time) {
        this._exactCreationTime = time.getTime();
      }
    });
    this._prevTime = getTimeParts(this._exactCreationTime)
  }

  getTime() {
    const currentTime = new Date().getTime();
    return getTimeParts(new Date(this._exactCreationTime + (currentTime - this._creationTime)));
  }

  onTimeChange(onTimeChangeHandler?) {
    this._onTimeChange = onTimeChangeHandler;
    this.check();
  }
}