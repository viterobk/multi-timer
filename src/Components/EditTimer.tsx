import {
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useParams } from "react-router-dom";
import timersStore from "../Stores/timersStore";
import './EditTimer.css';
import { useRef, useState } from 'react';
import { ITimer } from './interfaces';
import TopBar from './TopBar';
import TimeInterval, { IInterval } from './TimeInterval';
import ConfirmDialog from './ConfirmDialog';
import { timersHaveSameConfig } from '../shareLink';

const addInterval = (timer: ITimer, interval: IInterval) => {
  timer.intervals.push(interval);
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
  intervals: source.intervals.map((interval) => ({ ...interval })),
});

const isDraftUnchanged = (key: number, draft: ITimer): boolean => {
  const original = timersStore.timers.find((timer) => timer.key === key) || emptyTimer(key);
  return timersHaveSameConfig(original, draft);
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
    props.onUpdate && props.onUpdate(timer);
  };

  const saveAndLeave = () => {
    submitChanges();
    navigate('/');
  };

  const discardAndLeave = () => {
    navigate('/');
  };

  const generateIntervalItems = () => {
    return timer.intervals.map((interval, index) => {
      const updateIntervalValue = (value: IInterval) => {
        timer.intervals[index] = value;
      }
      return (
        <article key={index} className="interval-card">
          <div className="interval-card-head">
            <span className="interval-card-index">{index + 1}</span>
            <span>Интервал</span>
            <IconButton
              className="interval-card-delete"
              aria-label="Удалить интервал"
              onClick={() => { deleteInterval(timer, index); rerender(); }}>
              <DeleteIcon />
            </IconButton>
          </div>
          <TimeInterval value={interval} onChange={updateIntervalValue}/>
        </article>
      )
    });
  };

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
          {generateIntervalItems()}
        </div>
        <Button
          className="Edit-add"
          onClick={() => { addInterval(timer, { duration: 0, description: '' }); rerender(); }}
          startIcon={<AddIcon />}
        >
          Добавить интервал
        </Button>
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
