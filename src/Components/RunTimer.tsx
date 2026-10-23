import {
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/PauseRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { useParams } from "react-router-dom";
import timersStore from "../Stores/timersStore";
import './RunTimer.css';
import { useMemo, useState } from 'react';
import TopBar from './TopBar';
import ShareLinkDialog from './ShareLinkDialog';
import { buildShareUrl } from '../shareLink';
import Timer, { ITimerArgs } from '../Timer';
import { useEffect } from 'react';
import { playBeep, unlockBeep } from '../Sounds/beepPlayer';
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
  const { key: keyStr } = useParams();
  if (!keyStr) throw Error("Timer key is empty");

  const key = Number.parseInt(keyStr);
  const timer = timersStore.timers.find(timer => timer.key === key);
  if (!timer) throw Error("Timer is empty");

  const [isRunning, setRunning] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const timerNotes = (timer.description || '').trim();
  const shareUrl = useMemo(() => buildShareUrl({
    name: timer.name,
    description: timer.description || '',
    intervals: timer.intervals,
  }), [timer]);

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
    totalSecondsLeft: timerState.timerRunner.getSecondsLeft(),
    intervalSecondsLeft: timerState.timerRunner.getIntervalSecondsLeft(),
    restIntervals: timerState.timerRunner.getRestIntervals(),
    currentInterval: timerState.timerRunner.getCurrentInterval(),
  });

  const updateRunState = (timerInstance: Timer) => {
    setRunState({
      intervalPercent: timerInstance.getIntervalPercent(),
      totalPercent: timerInstance.getTotalPercent(),
      totalSecondsLeft: timerInstance.getSecondsLeft(),
      intervalSecondsLeft: timerInstance.getIntervalSecondsLeft(),
      restIntervals: timerInstance.getRestIntervals(),
      currentInterval: timerInstance.getCurrentInterval(),
    })
  }
  const startTimer = () => {
    void unlockBeep();
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
    <div className="Run-readout">
      <div className="Run-times">
        <div className="Run-time is-total">
          <span className="Run-time-label">общее</span>
          <p className="Run-clock" aria-label="Оставшееся время таймера">
            {formatClock(runState.totalSecondsLeft)}
          </p>
        </div>
        <div className="Run-time is-interval">
          <span className="Run-time-label">интервал</span>
          <p className="Run-clock" aria-label="Оставшееся время интервала">
            {formatClock(runState.intervalSecondsLeft)}
          </p>
        </div>
      </div>
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
      <TopBar
        backPath="/"
        trailing={
          <IconButton aria-label="Поделиться" onClick={() => setShareOpen(true)}>
            <ShareOutlinedIcon />
          </IconButton>
        }
      />
      <div className="page Run-page">
        <div className="Run-heading">
          <div className="Run-title">
            <h2 className="Run-name">{timer.name || 'Без названия'}</h2>
            {timerNotes && (
              <>
                <button
                  type="button"
                  className="Run-notes-toggle"
                  aria-haspopup="dialog"
                  aria-expanded={notesOpen}
                  onClick={() => setNotesOpen(true)}
                >
                  Подробнее...
                </button>
                <Dialog
                  className="Run-notes-dialog"
                  open={notesOpen}
                  onClose={() => setNotesOpen(false)}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>{timer.name || 'Описание'}</DialogTitle>
                  <DialogContent>
                    <MarkdownContent>{timerNotes}</MarkdownContent>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setNotesOpen(false)}>Закрыть</Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
          </div>
        </div>
        <div className="Run-stage">
          <div className="Run-rings">
            <CircularProgress
              className="Run-track"
              size={220}
              thickness={4}
              variant="determinate"
              value={100}
            />
            <CircularProgress
              className="Run-total"
              size={220}
              thickness={4}
              variant="determinate"
              value={clampPercent(runState.totalPercent)}
            />
            <CircularProgress
              className="Run-track Run-track-inner"
              size={176}
              thickness={9.8}
              variant="determinate"
              value={100}
            />
            <CircularProgress
              className="Run-interval"
              size={176}
              thickness={9.8}
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
      </div>
      <ShareLinkDialog
        open={shareOpen}
        url={shareUrl}
        onClose={() => setShareOpen(false)}
      />
    </div>
  )
}

export default RunTimer;
