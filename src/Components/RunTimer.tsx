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
import MarkdownContent from './MarkdownContent';
import { IInterval } from './TimeInterval';

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

const UNIQUE_SLOTS = 5;
const SLOT_TOPS = [0, 2.25, 3.85, 5.28, 6.58];
const SLOT_HEIGHTS = [1.75, 1.55, 1.38, 1.26, 1.16];
const REST_STEP = 1.16;

const slotTop = (slot: number) => {
  if (slot < 0) return -SLOT_HEIGHTS[0];
  if (slot < SLOT_TOPS.length) return SLOT_TOPS[slot];
  return SLOT_TOPS[SLOT_TOPS.length - 1] + (slot - (SLOT_TOPS.length - 1)) * REST_STEP;
};

const slotHeight = (slot: number) => (
  slot < SLOT_HEIGHTS.length ? SLOT_HEIGHTS[Math.max(0, slot)] : REST_STEP
);

const intervalLabel = (interval: IInterval, order: number) => {
  const name = (interval.description || '').trim();
  return name || `Интервал ${order}`;
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
          updateRunState(e.target);
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

  const queue = timer.intervals
    .map((interval, order) => ({
      interval,
      id: `interval-${order}`,
      label: intervalLabel(interval, order + 1),
    }))
    .filter((item) => item.interval.duration > 0 || Boolean((item.interval.description || '').trim()));
  const currentIndex = queue.findIndex((item) => item.interval === runState.currentInterval);
  const queueOffset = currentIndex >= 0 ? currentIndex : 0;
  const remaining = Math.max(0, queue.length - queueOffset);
  const lastSlot = remaining - 1;
  const queueHeight = remaining <= 0
    ? 0
    : slotTop(lastSlot) + slotHeight(lastSlot);

  const renderReadout = () => (
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
      {queue.length > 0 && (
        <ol
          className={`Run-queue${remaining > 1 ? ' has-upcoming' : ''}`}
          aria-label="Очередь интервалов"
          style={{ height: `${queueHeight}rem` }}
        >
          {queue.map((item, index) => {
            const slot = index - queueOffset;
            const slotClass = slot < 0
              ? 'is-slot-exit'
              : slot >= UNIQUE_SLOTS
                ? 'is-slot-rest'
                : `is-slot-${slot}`;
            return (
              <li
                key={item.id}
                className={`Run-queue-item ${slotClass}`}
                style={{ top: `${slotTop(slot)}rem` }}
              >
                {item.label}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  )

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
          {renderReadout()}
        </div>
        {renderResetButton()}
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
