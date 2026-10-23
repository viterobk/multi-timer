import { action, observable } from 'mobx';
import { ITimer } from '../Components/interfaces';
import { IInterval } from '../Components/TimeInterval';

const CONFIG_VERSION = 1;

interface ITimerConfig {
  version: number;
  timers: Omit<ITimer, 'key'>[];
}

const configConverters = {
  'default': (obsoleteTimerConfig) => {
    const { intervals, ...restProps } = obsoleteTimerConfig;
    return {
      ...restProps,
      intervals: intervals.map((interval) => {
        return typeof interval === 'number'
          ? {
            duration: interval,
            description: '',
          }
          : interval;
      })
    };
  }
}

const getConfigItemConverter = (version) => {
  return version ? configConverters[version] : configConverters['default'];
}
const updateConfig = (config): ITimerConfig => {
  let converter = getConfigItemConverter(config.version);
  if (!converter) {
    throw new Error('Unknown config version');
  }
  const configItems = Array.isArray(config) ? config : config.timers;
  return saveTimers(configItems.map(converter));
}

export type ITimerData = Omit<ITimer, 'key'>;

const toTimerData = ({ key, ...timer }: ITimer): ITimerData => timer;

const saveTimers = (timers: ITimer[]): ITimerConfig => {
  const timersConfig = {
    version: CONFIG_VERSION,
    timers: timers.map(toTimerData),
  }
  localStorage.setItem('timers', JSON.stringify(timersConfig));
  return timersConfig;
}

export const serializeTimers = (timers: Array<ITimer | ITimerData>): ITimerConfig => ({
  version: CONFIG_VERSION,
  timers: timers.map((timer) => (
    'key' in timer ? toTimerData(timer as ITimer) : timer
  )),
});

const normalizeInterval = (interval: unknown): IInterval => {
  if (typeof interval === 'number' && Number.isFinite(interval)) {
    return { duration: interval, description: '' };
  }
  if (interval && typeof interval === 'object') {
    const { duration, description } = interval as { duration?: unknown, description?: unknown };
    return {
      duration: typeof duration === 'number' && Number.isFinite(duration) ? duration : 0,
      description: typeof description === 'string' ? description : '',
    };
  }
  throw new Error('Некорректный интервал');
}

const normalizeTimer = (timer: unknown): ITimerData => {
  if (!timer || typeof timer !== 'object') {
    throw new Error('Некорректный таймер');
  }
  const { name, description, intervals } = timer as {
    name?: unknown,
    description?: unknown,
    intervals?: unknown,
  };
  if (!Array.isArray(intervals)) {
    throw new Error('У таймера нет списка интервалов');
  }
  return {
    name: typeof name === 'string' ? name : '',
    description: typeof description === 'string' ? description : '',
    intervals: intervals.map(normalizeInterval),
  };
}

export const parseTimersJson = (jsonText: string): ITimerData[] => {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error('Файл не является корректным JSON');
  }

  if (Array.isArray(data)) {
    return data.map((item) => normalizeTimer(configConverters.default(item)));
  }

  if (!data || typeof data !== 'object' || !Array.isArray((data as ITimerConfig).timers)) {
    throw new Error('В файле нет списка таймеров');
  }

  const config = data as { version?: number, timers: unknown[] };
  if (config.version != null && config.version !== CONFIG_VERSION) {
    const converter = getConfigItemConverter(config.version);
    if (!converter) {
      throw new Error('Неизвестная версия файла');
    }
    return config.timers.map((item) => normalizeTimer(converter(item)));
  }

  return config.timers.map((item) => normalizeTimer(item));
}


const loadTimers = (): ITimer[] => {
  const timersJson = localStorage.getItem('timers');
  if (!timersJson) return [];
  let config = JSON.parse(timersJson);
  if (config.version !== CONFIG_VERSION) {
    config = updateConfig(config);
  }
  return config.timers.map((timer, index) => ({
    ...timer,
    description: timer.description || '',
    key: index,
  }));
}

class TimersStore {
  timers: ITimer[] = observable(loadTimers());

  update = action((timer: ITimer) => {
    if (timer.key < 0) {
      this.timers.push({
        ...timer,
        key: this.timers.length,
      });
    } else {
      const timerIndex = this.timers.findIndex(t => t.key === timer.key);
      if (timerIndex < 0) throw Error(`Timer with ${timer.key} key not found`);
      this.timers[timerIndex] = timer;
    }
    saveTimers(this.timers)
  });

  importTimers = action((incoming: ITimerData[]): number[] => {
    const start = this.timers.length;
    const keys = incoming.map((_, index) => start + index);
    incoming.forEach((timer, index) => {
      this.timers.push({
        ...timer,
        key: start + index,
      });
    });
    saveTimers(this.timers);
    return keys;
  });

  move = action((fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex
      || fromIndex < 0
      || toIndex < 0
      || fromIndex >= this.timers.length
      || toIndex >= this.timers.length
    ) {
      return;
    }
    const [removed] = this.timers.splice(fromIndex, 1);
    this.timers.splice(toIndex, 0, removed);
    saveTimers(this.timers);
  });

  delete = action((timerKey: number) => {
    const timerIndex = this.timers.findIndex(t => t.key === timerKey);
    if (timerIndex < 0) throw Error(`Timer with ${timerKey} key not found`);

    this.timers.splice(timerIndex, 1);

    this.timers.forEach((timer) => {
      if (timer.key >= timerKey) {
        timer.key++;
      }
    })
    saveTimers(this.timers);
  })
}

export default new TimersStore();