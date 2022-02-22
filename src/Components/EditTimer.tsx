import {
    TextField,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useParams } from "react-router";
import timersStore from "../Stores/timersStore";
import './EditTimer.css';
import { useState } from 'react';
import { ITimer } from './interfaces';
import TopBar from './TopBar';
import TimeInterval from './TimeInterval';

const addInterval = (timer: ITimer, interval: number) => {
    timer.intervals.push(interval);
    return timer;
}
const deleteInterval = (timer: ITimer, index: number) => {
    timer.intervals.splice(index, 1);
    return timer;
}

export default function(props) {
    const { key: keyStr } = useParams();
    const key = !keyStr
        ? -1
        : Number.parseInt(keyStr);
    const [timerState, setTimerState] = useState(timersStore.timers.find(timer => timer.key === key)
        || {
            key,
            intervals: [0] as number[],
            name: ""
        });
    const timer: ITimer = {
        ...timerState,
        intervals: [...timerState.intervals],
    };

    const submitChanges = () => {
        props.onUpdate && props.onUpdate(timer);
    }

    const generateIntervalItems = () => {
        const intervals = timer.intervals.map((interval, index) => {
            const updateIntervalValue = (value: number) => {
                timer.intervals[index] = value;
            }
            return (
                <ListItem key={index} >
                    <ListItemButton>
                        <TimeInterval value={interval} onChange={updateIntervalValue}/></ListItemButton>
                    <ListItemSecondaryAction>
                        <IconButton
                            color='inherit'
                            onClick={() => { setTimerState(deleteInterval(timer, index)) }}>
                            <DeleteIcon></DeleteIcon>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            )
        });
        intervals.push(<ListItem key={-1}>
            <Button onClick={() => {setTimerState(addInterval(timer, 0))}}>
                <AddIcon />
                <ListItemText
                    primary={"Add interval"} />
            </Button>
        </ListItem>);
        return intervals;
    };
    return (
        <div className='Edit'>
            <TopBar backPath='/' onOkClick={submitChanges}/>
            <TextField
                className='Edit-name'
                required
                label='Timer name'
                defaultValue={timer.name}
                onChange={(e) => {timer.name = e.target.value}} />
            <List className='Edit-list'>
                {generateIntervalItems()}
            </List>
        </div>
    )
}