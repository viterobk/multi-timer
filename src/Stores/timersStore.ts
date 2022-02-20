import { action, observable } from 'mobx';
import { ITimer } from '../Components/interfaces';

const saveTimers = (timers: ITimer[]): void => {
    console.log('Saving timers');
}

const loadTimers = (): ITimer[] => {
    console.log('Loading timers');
    return [
        {
            key: 0,
            name: "Объемное восприятие",
            intervals: [60, 60, 60, 180, 180, 180],
        }, {
            key: 1,
            name: "Коррекция органа",
            intervals: [30, 30, 30],
        }, {
            key: 2,
            name: "Коррекция зрения",
            intervals: [30, 10, 30, 10, 30],
        },{
            key: 3,
            name: "Объемное восприятие",
            intervals: [60, 60, 60, 180, 180, 180],
        }, {
            key: 4,
            name: "Коррекция органа",
            intervals: [30, 30, 30],
        }, {
            key: 5,
            name: "Коррекция зрения",
            intervals: [30, 10, 30, 10, 30],
        },{
            key: 6,
            name: "Объемное восприятие",
            intervals: [60, 60, 60, 180, 180, 180],
        }, {
            key: 7,
            name: "Коррекция органа",
            intervals: [30, 30, 30],
        }, {
            key: 8,
            name: "Коррекция зрения",
            intervals: [30, 10, 30, 10, 30],
        }
    ];
}

class TimersStore {
    timers: ITimer[] = observable(loadTimers());

    update = action((timer: ITimer) => {
        if (!timer.key) {
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