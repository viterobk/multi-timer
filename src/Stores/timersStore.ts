import { action, observable } from 'mobx';
import { ITimer } from '../Components/interfaces';

const saveTimers = (timers: ITimer[]): void => {
    localStorage.setItem('timers', JSON.stringify(timers));
}

const loadTimers = (): ITimer[] => {
    const timersJson = localStorage.getItem('timers');
    if(!timersJson) return [];
    const timers = JSON.parse(timersJson);
    return timers.map((t, i) => ({
        ...t,
        key: i
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

        this.timers.map(timer => {
            if (timer.key < timerKey) return;
            timer.key++;
        })
        saveTimers(this.timers);
    })
}

export default new TimersStore();