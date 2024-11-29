import {
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
    const intervals = timer.intervals.map((interval, index) => {
      const updateIntervalValue = (value: IInterval) => {
        timer.intervals[index] = value;
      }
      return (
        <ListItem key={index} className='Edit-listitem'>
          <Card>
            <CardContent className='Edit-cardcontent'>
              <TimeInterval value={interval} onChange={updateIntervalValue}/>
              <IconButton
                onClick={() => { setTimerState(deleteInterval(timer, index)) }}>
                <DeleteIcon></DeleteIcon>
              </IconButton>
            </CardContent>
          </Card>
        </ListItem>
      )
    });
    intervals.push(<ListItem key={-1}>
      <Button onClick={() => { setTimerState(addInterval(timer, { duration: 0, description: '' })) }}>
        <AddIcon />
        <ListItemText
          primary={"Добавить интервал"} />
      </Button>
    </ListItem>);
    return intervals;
  };
  return (
    <div className='Edit'>
      <TopBar backPath='/' onOkClick={submitChanges} onBackClick={beforeNavigateBack} />
      <TextField
        autoFocus
        className='Edit-name'
        label='Название таймера'
        defaultValue={timer.name}
        onChange={(e) => { timer.name = e.target.value }} />
      <List className='Edit-list'>
        {generateIntervalItems()}
      </List>
    </div>
  )
}