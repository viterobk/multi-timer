import {
    CircularProgress,
    Button,
    IconButton,
    Typography,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useParams } from "react-router-dom";
import timersStore from "../Stores/timersStore";
import './RunTimer.css';
import { useState } from 'react';
import TopBar from './TopBar';
import { Box } from '@mui/system';
import Timer, { ITimerArgs } from '../Timer';
import { useEffect } from 'react';
import NoSleep from 'nosleep.js';

const noSleep = new NoSleep();

export default function() {
    const { key: keyStr } = useParams();
    if (!keyStr) throw Error("Timer key is empty");

    const key = Number.parseInt(keyStr);
    const timer = timersStore.timers.find(timer => timer.key === key);
    if (!timer) throw Error("Timer is empty");

    const [isRunning, setRunning] = useState(false);

    const [timerState, updateTimerState] = useState({
        timerRunner: new Timer(
            timer.intervals,
            {
                onProgress: (e: ITimerArgs) => {
                    updateRunState(e.target);
                },
                onStarted: (e: ITimerArgs) => {
                    setRunning(e.target.getIsRunning());
                },
                onPaused: (e: ITimerArgs) => {
                    setRunning(e.target.getIsRunning());
                },
                onFinished: (e: ITimerArgs) => {
                    updateRunState(e.target);
                    setRunning(e.target.getIsRunning());
                }
            }
        )
    })
    
    const [runState, setRunState] = useState({
        intervalPercent: timerState.timerRunner.getIntervalPercent(), 
        totalPercent: timerState.timerRunner.getTotalPercent(),
        text: timerState.timerRunner.getText(),
        restIntervals: timerState.timerRunner.getRestIntervals(),
    });

    const updateRunState = (timerInstance: Timer) => {
        setRunState({
            intervalPercent: timerInstance.getIntervalPercent(), 
            totalPercent: timerInstance.getTotalPercent(),
            text: timerInstance.getText(),
            restIntervals: timerInstance.getRestIntervals(),
        })
    }
    const startTimer = () => {
        const noSleep = new NoSleep();
        document.addEventListener('click', function enableNoSleep() {
            noSleep.enable();
            document.removeEventListener('click', enableNoSleep, false);
        }, false)
        timerState.timerRunner.start();
    }
    const pauseTimer = () => {
        noSleep.disable();
        timerState.timerRunner.pause();
    }
    const resetTimer = () => {
        noSleep.disable();
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

    useEffect(() => () => {
        if (timerState.timerRunner.getIsRunning()) resetTimer()
    }, [])

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