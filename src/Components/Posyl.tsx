import TopBar from './TopBar';
import './Posyl.css';
import { playBeep, unlockBeep } from '../Sounds/beepPlayer';
import { useState, useEffect, useRef } from 'react';
import Time from '../Time';
import VolumeOffIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeUpIcon from '@mui/icons-material/VolumeUpRounded';

const getTimeString = (time) => {
  const hPrefix = time.hours < 10 ? '0' : '';
  const mPrefix = time.minutes < 10 ? '0' : '';
  const sPrefix = time.seconds < 10 ? '0' : '';
  return `${hPrefix}${time.hours}:${mPrefix}${time.minutes}:${sPrefix}${time.seconds}`
}
const time = new Time();

const Posyl = () => {
  const [ currentTime, setCurrentTime ] = useState(time.getTime());
  const [ soundOn, setSoundOn ] = useState(false);
  const soundOnRef = useRef(false);

  const toggleSound = () => {
    if (!soundOn) {
      soundOnRef.current = true;
      void unlockBeep();
      setSoundOn(true);
    } else {
      soundOnRef.current = false;
      setSoundOn(false);
    }
  }

  useEffect(() => {
    if ('wakeLock' in navigator) {
      global.navigator['wakeLock'].request('screen');
    }
    time.onTimeChange((time) => {
      setCurrentTime(time);
      if (!soundOnRef.current) {
        return;
      }
      if (time.minutes === 55 && time.seconds === 0) {
        playBeep(1);
      } else if (time.minutes === 58 && time.seconds === 0) {
        playBeep(1);
      } else if (time.minutes === 59 && time.seconds === 45) {
        playBeep(1);
      } else if (time.minutes === 0 && time.seconds === 0) {
        playBeep(2);
      }
    })
    return () => {
      time.onTimeChange();
    }
  }, [])

  return (
    <div className="Posyl">
      <TopBar title="Посыл" backPath="/" />
      <div className="page Posyl-page">
        <p className="Posyl-kicker">Текущее время</p>
        <div className="Posyl-clock">{ getTimeString(currentTime) }</div>
        <button
          type="button"
          className={`Posyl-sound ${soundOn ? 'is-on' : 'is-off'}`}
          onClick={toggleSound}
        >
          <span className="Posyl-sound-icon">
            {soundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </span>
          <span>{soundOn ? 'Звук включён' : 'Звук выключен'}</span>
        </button>
      </div>
    </div>
  )
}

export default Posyl;
