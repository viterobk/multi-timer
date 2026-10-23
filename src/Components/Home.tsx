import { useState } from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import timersStore from '../Stores/timersStore';
import './Home.css';
import { observer } from 'mobx-react';
import TopBar from './TopBar';
import HomeMenu from './HomeMenu';
import ConfirmDialog from './ConfirmDialog';
import DragHandle from './DragHandle';
import VerticalSortableList from './VerticalSortableList';
import { ITimer } from './interfaces';
import { countAllIntervals as countTotalInterval } from '../interval';

const intervalWord = (count: number) => {
    const n10 = count % 10;
    const n100 = count % 100;
    if (n10 === 1 && n100 !== 11) return 'интервал';
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'интервала';
    return 'интервалов';
};

const SortableTimerCard = ({
    timer,
    sortable,
    onAskDelete,
}: {
    timer: ITimer;
    sortable: boolean;
    onAskDelete: (timer: ITimer) => void;
}) => {
    const interval = countTotalInterval(timer.intervals.map((item) => item.duration));
    const count = timer.intervals.length;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: String(timer.key),
        disabled: !sortable,
    });

    return (
        <article
            ref={setNodeRef}
            className={`timer-card ${isDragging ? 'is-dragging' : ''}`}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {sortable && (
                <DragHandle
                    label="Переместить таймер"
                    attributes={attributes}
                    listeners={listeners}
                />
            )}
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
                    onClick={() => { onAskDelete(timer); }}
                    aria-label="Удалить"
                >
                    <DeleteIcon />
                </IconButton>
            </div>
        </article>
    );
};

const Home = observer(() => {
    const timers = timersStore.timers;
    const [pendingDelete, setPendingDelete] = useState<ITimer | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const sortable = timers.length > 1;
    const timerIds = timers.map((timer) => String(timer.key));

    const closeDeleteDialog = () => setDeleteOpen(false);

    const confirmDelete = () => {
        if (pendingDelete) {
            timersStore.delete(pendingDelete.key);
        }
        closeDeleteDialog();
    };

    const cards = timers.map((timer) => (
        <SortableTimerCard
            key={timer.key}
            timer={timer}
            sortable={sortable}
            onAskDelete={(item) => {
                setPendingDelete(item);
                setDeleteOpen(true);
            }}
        />
    ));

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
                    <VerticalSortableList
                        className="Home-list"
                        items={timerIds}
                        onReorder={(from, to) => timersStore.move(from, to)}
                    >
                        {cards}
                    </VerticalSortableList>
                )}
                <IconButton
                    className="Home-add"
                    component={Link}
                    to="/edit/"
                    aria-label="Создать таймер"
                >
                    <AddIcon />
                </IconButton>
            </div>
            <ConfirmDialog
                open={deleteOpen}
                title="Удалить таймер?"
                onClose={closeDeleteDialog}
                actions={[
                    { label: 'Отмена', onClick: closeDeleteDialog },
                    {
                        label: 'Удалить',
                        color: 'error',
                        variant: 'contained',
                        onClick: confirmDelete,
                    },
                ]}
            >
                <p>
                    «{pendingDelete?.name || 'Без названия'}» будет удалён с этого устройства.
                </p>
            </ConfirmDialog>
        </div>
    );
});

export default Home;
