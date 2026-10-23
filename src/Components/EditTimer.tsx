import {
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useParams } from "react-router-dom";
import timersStore from "../Stores/timersStore";
import './EditTimer.css';
import { useState } from 'react';
import { ITimer } from './interfaces';
import TopBar from './TopBar';
import TimeInterval, { IInterval } from './TimeInterval';

const addInterval = (timer: ITimer, interval: IInterval) => {
  timer.intervals.push(interval);
  return timer;
}
const deleteInterval = (timer: ITimer, index: number) => {
  timer.intervals.splice(index, 1);
  return timer;
}
const areTimersEqual = (oldTimer: ITimer | undefined, newTimer: ITimer): boolean => {
  if (!oldTimer) return false;
  if (oldTimer.name !== newTimer.name) return false;
  if ((oldTimer.description || '') !== (newTimer.description || '')) return false;
  if (oldTimer.intervals.length !== newTimer.intervals.length) return false;
  return !oldTimer.intervals
    .map((interval, index) => interval === newTimer.intervals[index])
    .some(e => !e);
}

export default function (props) {
  const { key: keyStr } = useParams();
  const key = !keyStr
    ? -1
    : Number.parseInt(keyStr);
  const [timerState, setTimerState] = useState(timersStore.timers.find(timer => timer.key === key)
    || {
    key,
    intervals: [],
    name: '',
    description: '',
  });
  const timer: ITimer = {
    ...timerState,
    intervals: [...timerState.intervals],
  };

  const beforeNavigateBack = () => {
    const newTimer = timer;
    const oldTimer = timersStore.timers.find(timer => timer.key === key);
    if (areTimersEqual(oldTimer, newTimer)) return;

    if (window.confirm('Сохранить изменения?')) submitChanges();
  }
  const submitChanges = () => {
    props.onUpdate && props.onUpdate(timer);
  }

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
              onClick={() => { setTimerState(deleteInterval(timer, index)) }}>
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
          onClick={() => { setTimerState(addInterval(timer, { duration: 0, description: '' })) }}
          startIcon={<AddIcon />}
        >
          Добавить интервал
        </Button>
      </div>
    </div>
  )
}
