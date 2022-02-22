import {
    CircularProgress,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
} from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useParams } from "react-router";
import timersStore from "../Stores/timersStore";
import './RunTimer.css';
import { useState } from 'react';
import TopBar from './TopBar';
import { Box } from '@mui/system';
import Timer from '../Timer';
import { intervalToString } from '../interval';

export default function() {
    const { key: keyStr } = useParams();
    if (!keyStr) throw Error("Timer key is empty");

    const key = Number.parseInt(keyStr);
    const timer = timersStore.timers.find(timer => timer.key === key);
    if (!timer) throw Error("Timer is empty");

    const [runState, setRunState] = useState({
        intervalPercent: 100, 
        totalPercent: 100,
        text: intervalToString(timer.intervals.reduce((i, s) => s += i,0)),
    });
    const [timerState, updateTimerState] = useState({
        timerRunner: new Timer(
            timer.intervals,
            {
                onProgress: (intervalPercent, totalPercent, text) => {
                    //console.log(`${totalPercent}, ${intervalPercent}`);
                    setRunState({
                        intervalPercent,
                        totalPercent,
                        text,
                    });
                }
            }
        )
    })
    const startTimer = () => {
        timerState.timerRunner.start();
    }

    return (
        <div className='Run'>
            <TopBar backPath='/'/>
            <h1>{timer.name}</h1>
            <Box className='Run-outerbox'>
                <CircularProgress
                    size={170}
                    variant="determinate"
                    value={runState.totalPercent}
                />
                <Box className='Run-innerbox'>
                    <CircularProgress
                        size={140}
                        variant="determinate"
                        value={runState.intervalPercent}
                    />
                </Box>
                <Box className='Run-innerbox'>
                    <IconButton className='Run-runicons' onClick={startTimer}>
                        <PlayArrowIcon style={{color: '#00AA00'}}/>
                    </IconButton>
                </Box>
            </Box>
            <Typography variant='h3'>{runState.text}</Typography>
        </div>
    )
}