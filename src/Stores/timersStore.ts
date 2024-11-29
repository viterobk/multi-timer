import { action, observable } from 'mobx';
import { ITimer } from '../Components/interfaces';

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

const saveTimers = (timers: ITimer[]): ITimerConfig => {
  const timersConfig = {
    version: CONFIG_VERSION,
    timers: timers.map(({ key, ...timer }) => timer),
  }
  localStorage.setItem('timers', JSON.stringify(timersConfig));
  return timersConfig;
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