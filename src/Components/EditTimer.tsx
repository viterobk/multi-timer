import {
  TextField,
  Fab,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useParams } from "react-router-dom";
import { arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import timersStore from "../Stores/timersStore";
import './EditTimer.css';
import { useRef, useState } from 'react';
import { ITimer } from './interfaces';
import TopBar from './TopBar';
import TimeInterval, { IInterval } from './TimeInterval';
import ConfirmDialog from './ConfirmDialog';
import DragHandle from './DragHandle';
import VerticalSortableList from './VerticalSortableList';
import { timersHaveSameConfig } from '../shareLink';

type DraftInterval = IInterval & { id: string };

let nextIntervalId = 1;
const createIntervalId = () => `interval-${nextIntervalId++}`;

const toDraftInterval = (interval: IInterval): DraftInterval => ({
  duration: interval.duration,
  description: interval.description,
  id: (interval as DraftInterval).id || createIntervalId(),
});

const addInterval = (timer: ITimer, interval: IInterval) => {
  timer.intervals.push(toDraftInterval(interval));
  return timer;
}
const deleteInterval = (timer: ITimer, index: number) => {
  timer.intervals.splice(index, 1);
  return timer;
}
const emptyTimer = (key: number): ITimer => ({
  key,
  name: '',
  description: '',
  intervals: [],
});

const copyTimer = (source: ITimer): ITimer => ({
  ...source,
  description: source.description || '',
  intervals: source.intervals.map(toDraftInterval),
});

const toPersistedTimer = (timer: ITimer): ITimer => ({
  ...timer,
  intervals: timer.intervals.map(({ duration, description }) => ({ duration, description })),
});

const isDraftUnchanged = (key: number, draft: ITimer): boolean => {
  const original = timersStore.timers.find((timer) => timer.key === key) || emptyTimer(key);
  return timersHaveSameConfig(original, draft);
};

const SortableIntervalCard = ({
  id,
  index,
  interval,
  sortable,
  onChange,
  onDelete,
}: {
  id: string;
  index: number;
  interval: IInterval;
  sortable: boolean;
  onChange: (value: IInterval) => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !sortable,
  });

  return (
    <article
      ref={setNodeRef}
      className={`interval-card ${isDragging ? 'is-dragging' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="interval-card-head">
        {sortable && (
          <DragHandle
            label="Переместить интервал"
            attributes={attributes}
            listeners={listeners}
          />
        )}
        <span className="interval-card-index">{index + 1}</span>
        <span>Интервал</span>
        <IconButton
          className="interval-card-delete"
          aria-label="Удалить интервал"
          onClick={onDelete}
        >
          <DeleteIcon />
        </IconButton>
      </div>
      <TimeInterval value={interval} onChange={onChange} />
    </article>
  );
};

export default function (props) {
  const { key: keyStr } = useParams();
  const key = !keyStr
    ? -1
    : Number.parseInt(keyStr);
  const navigate = useNavigate();
  const draftRef = useRef<ITimer | null>(null);
  if (!draftRef.current) {
    const found = timersStore.timers.find((item) => item.key === key);
    draftRef.current = copyTimer(found || emptyTimer(key));
  }
  const timer = draftRef.current;
  const [, setVersion] = useState(0);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const rerender = () => setVersion((value) => value + 1);

  const closeLeaveDialog = () => setLeaveOpen(false);

  const beforeNavigateBack = (event: { cancel: boolean }) => {
    if (isDraftUnchanged(key, timer)) {
      return;
    }
    event.cancel = true;
    setLeaveOpen(true);
  };

  const submitChanges = () => {
    props.onUpdate && props.onUpdate(toPersistedTimer(timer));
  };

  const saveAndLeave = () => {
    submitChanges();
    navigate('/');
  };

  const discardAndLeave = () => {
    navigate('/');
  };

  const reorderIntervals = (from: number, to: number) => {
    timer.intervals = arrayMove(timer.intervals, from, to);
    rerender();
  };

  const intervalIds = timer.intervals.map((interval) => (interval as DraftInterval).id);
  const sortable = timer.intervals.length > 1;

  return (
    <div className="Edit">
      <TopBar
        title={key < 0 ? 'Новый таймер' : 'Редактирование'}
        backPath="/"
        onOkClick={submitChanges}
        onBackClick={beforeNavigateBack}
      />
      <div className="page">
        <TextField
          autoFocus
          className="Edit-name"
          label="Название таймера"
          defaultValue={timer.name}
          onChange={(e) => { timer.name = e.target.value }}
        />
        <TextField
          className="Edit-description"
          label="Описание"
          placeholder="Как выполнять, инвентарь, ссылки…"
          helperText="Можно Markdown: ссылки, списки, **жирный**, *курсив*, заголовки."
          defaultValue={timer.description || ''}
          multiline
          minRows={3}
          onChange={(e) => { timer.description = e.target.value }}
        />
        <div className="Edit-list">
          {timer.intervals.length === 0 && (
            <p className="Edit-hint">Добавьте хотя бы один интервал — работу, отдых или паузу.</p>
          )}
          {timer.intervals.length > 0 && (
            <VerticalSortableList className="Edit-list-items" items={intervalIds} onReorder={reorderIntervals}>
              {timer.intervals.map((interval, index) => (
                <SortableIntervalCard
                  key={(interval as DraftInterval).id}
                  id={(interval as DraftInterval).id}
                  index={index}
                  interval={interval}
                  sortable={sortable}
                  onChange={(value) => {
                    const current = timer.intervals[index];
                    current.duration = value.duration;
                    current.description = value.description;
                  }}
                  onDelete={() => { deleteInterval(timer, index); rerender(); }}
                />
              ))}
            </VerticalSortableList>
          )}
        </div>
        <Fab
          className="App-fab"
          color="primary"
          aria-label="Добавить интервал"
          onClick={() => { addInterval(timer, { duration: 0, description: '' }); rerender(); }}
        >
          <AddIcon />
        </Fab>
      </div>
      <ConfirmDialog
        open={leaveOpen}
        title="Сохранить изменения?"
        onClose={closeLeaveDialog}
        actions={[
          { label: 'Отмена', onClick: closeLeaveDialog },
          { label: 'Сбросить', onClick: discardAndLeave },
          { label: 'Сохранить', variant: 'contained', onClick: saveAndLeave },
        ]}
      >
        <p>Настройки таймера изменены. Можно сохранить их или выйти без сохранения.</p>
      </ConfirmDialog>
    </div>
  )
}
