import {
  CircularProgress,
  Button,
  IconButton,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/PauseRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import { useParams } from "react-router-dom";
import timersStore from "../Stores/timersStore";
import './RunTimer.css';
import { createRef, useState } from 'react';
import TopBar from './TopBar';
import Timer, { ITimerArgs } from '../Timer';
import { useEffect } from 'react';
import { beep1 as base64beep } from '../Sounds';
import { intervalToString } from '../interval';
import MarkdownContent from './MarkdownContent';

let wakeLock: any = undefined;

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

const formatClock = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

const RunTimer = () => {
  const beepRef = createRef<HTMLAudioElement>();
  let currentAudioElement: HTMLAudioElement | null;

  const { key: keyStr } = useParams();
  if (!keyStr) throw Error("Timer key is empty");

  const key = Number.parseInt(keyStr);
  const timer = timersStore.timers.find(timer => timer.key === key);
  if (!timer) throw Error("Timer is empty");

  const [isRunning, setRunning] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const timerNotes = (timer.description || '').trim();

  const [timerState] = useState({
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
          playBeep(3);
          updateRunState(e.target);
          setRunning(e.target.getIsRunning());
        },
        onIntervalFinished: (e: ITimerArgs) => {
          playBeep();
        },
        onReset: (e: ITimerArgs) => {
          updateRunState(e.target);
          setRunning(e.target.getIsRunning());
        }
      }
    )
  })

  const playBeep = (repetitions: number = 1) => {
    if (!currentAudioElement) {
      return;
    }
    let count = 0;
    currentAudioElement.onended = (e) => {
      count += 1;

      if (!currentAudioElement || count >= repetitions) return;

      currentAudioElement.currentTime = 0;
      currentAudioElement.play();
    }
    currentAudioElement.play();
  }
  const lockScreen = () => {
    if (!('wakeLock' in navigator)) {
      console.warn('wakeLock is not supported');
      return;
    }
    global.navigator['wakeLock'].request('screen').then(wl => {
      wakeLock = wl;
    })
  }
  const unlockScreen = () => {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = undefined;
    }
  }
  const [runState, setRunState] = useState({
    intervalPercent: timerState.timerRunner.getIntervalPercent(),
    totalPercent: timerState.timerRunner.getTotalPercent(),
    text: timerState.timerRunner.getText(),
    intervalSecondsLeft: timerState.timerRunner.getIntervalSecondsLeft(),
    restIntervals: timerState.timerRunner.getRestIntervals(),
    currentInterval: timerState.timerRunner.getCurrentInterval(),
  });

  const updateRunState = (timerInstance: Timer) => {
    setRunState({
      intervalPercent: timerInstance.getIntervalPercent(),
      totalPercent: timerInstance.getTotalPercent(),
      text: timerInstance.getText(),
      intervalSecondsLeft: timerInstance.getIntervalSecondsLeft(),
      restIntervals: timerInstance.getRestIntervals(),
      currentInterval: timerInstance.getCurrentInterval(),
    })
  }
  const startTimer = () => {
    currentAudioElement = beepRef.current;
    lockScreen();
    timerState.timerRunner.start();
  }
  const pauseTimer = () => {
    unlockScreen();
    timerState.timerRunner.pause();
  }
  const resetTimer = () => {
    unlockScreen();
    timerState.timerRunner.reset();
  }

  const generateCenterButton = () => {
    if (isRunning) {
      return (
        <IconButton className="Run-toggle is-pause" onClick={pauseTimer} aria-label="Пауза">
          <PauseIcon />
        </IconButton>
      );
    }
    return (
      <IconButton className="Run-toggle is-play" onClick={startTimer} aria-label="Старт">
        <PlayArrowIcon />
      </IconButton>
    );
  }
  const renderResetButton = () => {
    if (!isRunning && runState.totalPercent < 100) {
      return (<Button className="Run-reset" onClick={resetTimer}>Сбросить</Button>)
    }
    return;
  }

  const renderCurrentInterval = ({ description }) => (
    <div className="Run-current">
      <div className="Run-clock">{formatClock(runState.intervalSecondsLeft)}</div>
      {description
        ? <p className="Run-caption">{description}</p>
        : <p className="Run-caption muted">Текущий интервал</p>
      }
    </div>
  )

  const renderRestIntervals = () => {
    if (!runState.restIntervals.length) {
      return null;
    }
    return (
      <div className="Run-upcoming">
        <h2>Дальше</h2>
        <ol>
          {runState.restIntervals.map(({ duration, description }, index) => (
            <li key={index}>
              <span>{description || `Интервал ${index + 2}`}</span>
              <strong>{intervalToString(duration)}</strong>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  useEffect(() => () => {
    if (timerState.timerRunner.getIsRunning()) resetTimer()
  }, [])

  return (
    <div className={`Run ${isRunning ? 'is-running' : ''}`}>
      <TopBar backPath="/" />
      <div className="page Run-page">
        <div className="Run-heading">
          <p className="Run-kicker">Всего {runState.text}</p>
          <h2 className="Run-name">{timer.name || 'Без названия'}</h2>
          {timerNotes && (
            <div className="Run-notes">
              <button
                type="button"
                className="Run-notes-toggle"
                aria-expanded={notesOpen}
                onClick={() => setNotesOpen((open) => !open)}
              >
                {notesOpen ? 'Свернуть' : 'Подробнее...'}
              </button>
              {notesOpen && (
                <div className="Run-notes-body">
                  <MarkdownContent>{timerNotes}</MarkdownContent>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="Run-stage">
          <div className="Run-rings">
            <CircularProgress
              className="Run-track"
              size={220}
              thickness={2.2}
              variant="determinate"
              value={100}
            />
            <CircularProgress
              className="Run-total"
              size={220}
              thickness={2.2}
              variant="determinate"
              value={clampPercent(runState.totalPercent)}
            />
            <CircularProgress
              className="Run-track Run-track-inner"
              size={176}
              thickness={3.4}
              variant="determinate"
              value={100}
            />
            <CircularProgress
              className="Run-interval"
              size={176}
              thickness={3.4}
              variant="determinate"
              value={clampPercent(runState.intervalPercent)}
            />
            <div className="Run-center">
              {generateCenterButton()}
            </div>
          </div>
          {renderCurrentInterval(runState.currentInterval)}
        </div>
        {renderResetButton()}
        {renderRestIntervals()}
        <audio ref={beepRef} src={base64beep} />
      </div>
    </div>
  )
}

export default RunTimer;
