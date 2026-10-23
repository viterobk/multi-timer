import React, { Component } from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { Link } from 'react-router-dom';
import timersStore from '../Stores/timersStore';
import './Home.css';
import { observer } from 'mobx-react';
import TopBar from './TopBar';
import { countAllIntervals as countTotalInterval } from '../interval';

const intervalWord = (count: number) => {
    const n10 = count % 10;
    const n100 = count % 100;
    if (n10 === 1 && n100 !== 11) return 'интервал';
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'интервала';
    return 'интервалов';
};

class Home extends Component {
    render() {
        const timers = timersStore.timers;

        return (
            <div className="Home">
                <TopBar />
                <div className="page">
                    {timers.length === 0 ? (
                        <div className="Home-empty">
                            <div className="Home-empty-icon">
                                <TimerOutlinedIcon />
                            </div>
                            <h2>Пока нет таймеров</h2>
                            <p>Соберите интервальную тренировку: работа, пауза, повтор.</p>
                        </div>
                    ) : (
                        <div className="Home-list">
                            {timers.map((timer) => {
                                const interval = countTotalInterval(timer.intervals.map(i => i.duration));
                                const count = timer.intervals.length;

                                return (
                                    <article key={timer.key} className="timer-card">
                                        <Link className="timer-card-main" to={`/run/${timer.key}`}>
                                            <div className="timer-card-copy">
                                                <h2>{timer.name || 'Без названия'}</h2>
                                                <p>
                                                    {interval.text}
                                                    {count > 0 ? ` · ${count} ${intervalWord(count)}` : ''}
                                                </p>
                                            </div>
                                            <span className="timer-card-play" aria-hidden>
                                                <PlayArrowIcon />
                                            </span>
                                        </Link>
                                        <div className="timer-card-actions">
                                            <IconButton
                                                component={Link}
                                                to={`/edit/${timer.key}`}
                                                aria-label="Редактировать"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                className="timer-card-delete"
                                                onClick={() => { timersStore.delete(timer.key) }}
                                                aria-label="Удалить"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                    <Link className="Home-create" to="/edit/">
                        <AddIcon />
                        Создать таймер
                    </Link>
                </div>
            </div>
        )
    }
}
export default observer(Home);
