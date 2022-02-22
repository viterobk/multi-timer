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
import Timer, { IProgressArgs, ITimerArgs } from '../Timer';
import { intervalToString } from '../interval';

export default function() {
    const { key: keyStr } = useParams();
    if (!keyStr) throw Error("Timer key is empty");

    const key = Number.parseInt(keyStr);
    const timer = timersStore.timers.find(timer => timer.key === key);
    if (!timer) throw Error("Timer is empty");

    const [isRunning, setRunning] = useState(false);

    const [runState, setRunState] = useState({
        intervalPercent: 100, 
        totalPercent: 100,
        text: intervalToString(timer.intervals.reduce((i, s) => s += i,0)),
        restIntervals: timer.intervals.length,
    });
    const [timerState, updateTimerState] = useState({
        timerRunner: new Timer(
            timer.intervals,
            {
                onProgress: (e: IProgressArgs) => {
                    //console.log(`${totalPercent}, ${intervalPercent}`);
                    setRunState(e);
                },
                onStarted: (e: ITimerArgs) => {
                    setRunning(e.target.getIsRunning());
                },
                onPaused: (e: ITimerArgs) => {
                    setRunning(e.target.getIsRunning());
                },
                onFinished: (e: IProgressArgs) => {
                    setRunState(e);
                    setRunning(e.target.getIsRunning());
                }
            }
        )
    })
    const startTimer = () => {
        timerState.timerRunner.start();
    }
    const pauseTimer = () => {
        timerState.timerRunner.pause();
    }
    const resetTimer = () => {
        timerState.timerRunner.reset();
    }

    const generateCenterButton = () => {
        if (isRunning) {
            return (
                <IconButton className='Run-runicons' onClick={pauseTimer}>
                    <PauseIcon style={{color: '#AA0000'}}/>
                </IconButton>
            );
        }
        return (
            <IconButton className='Run-runicons' onClick={startTimer}>
                <PlayArrowIcon style={{color: '#00AA00'}}/>
            </IconButton>
        );
    }
    const renderResetButton = () => {
        if(!isRunning && runState.totalPercent < 100) {
            return (<Button onClick={resetTimer}>Reset</Button>)
        }
        return;
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
                    {generateCenterButton()}
                </Box>
            </Box>
            <Typography variant='h3'>{runState.text}</Typography>
            <Typography variant='h6'>{runState.restIntervals} intervals left</Typography>
            {renderResetButton()}
        </div>
    )
}