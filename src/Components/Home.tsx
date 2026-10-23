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
import HomeMenu from './HomeMenu';
import ConfirmDialog from './ConfirmDialog';
import { ITimer } from './interfaces';
import { countAllIntervals as countTotalInterval } from '../interval';

const intervalWord = (count: number) => {
    const n10 = count % 10;
    const n100 = count % 100;
    if (n10 === 1 && n100 !== 11) return 'интервал';
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'интервала';
    return 'интервалов';
};

class Home extends Component {
    state: { pendingDelete: ITimer | null, deleteOpen: boolean } = {
        pendingDelete: null,
        deleteOpen: false,
    };

    closeDeleteDialog = () => {
        this.setState({ deleteOpen: false });
    };

    confirmDelete = () => {
        const timer = this.state.pendingDelete;
        if (timer) {
            timersStore.delete(timer.key);
        }
        this.closeDeleteDialog();
    };

    render() {
        const timers = timersStore.timers;
        const { pendingDelete, deleteOpen } = this.state;

        return (
            <div className="Home">
                <TopBar trailing={<HomeMenu />} />
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
                                                onClick={() => { this.setState({ pendingDelete: timer, deleteOpen: true }) }}
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
                <ConfirmDialog
                    open={deleteOpen}
                    title="Удалить таймер?"
                    onClose={this.closeDeleteDialog}
                    actions={[
                        { label: 'Отмена', onClick: this.closeDeleteDialog },
                        {
                            label: 'Удалить',
                            color: 'error',
                            variant: 'contained',
                            onClick: this.confirmDelete,
                        },
                    ]}
                >
                    <p>
                        «{pendingDelete?.name || 'Без названия'}» будет удалён с этого устройства.
                    </p>
                </ConfirmDialog>
            </div>
        )
    }
}
export default observer(Home);
