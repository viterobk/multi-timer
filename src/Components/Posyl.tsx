import {
  Typography,
  IconButton,
} from '@mui/material';
import TopBar from './TopBar';
import './Posyl.css';
import { beep1 as base64beep } from '../Sounds';
import { createRef, useState, useEffect, useRef } from 'react';
import Time from '../Time';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const getTimeString = (time) => {
  const hPrefix = time.hours < 10 ? '0' : '';
  const mPrefix = time.minutes < 10 ? '0' : '';
  const sPrefix = time.seconds < 10 ? '0' : '';
  return `${hPrefix}${time.hours}:${mPrefix}${time.minutes}:${sPrefix}${time.seconds}`
}
const time = new Time();
let currentAudioElement: HTMLAudioElement | null = null;

const Posyl = () => {
  const beepRef = createRef<HTMLAudioElement>();
  const [ currentTime, setCurrentTime ] = useState(time.getTime());

  const generateSoundButton = () => {
    if (currentAudioElement) {
      return <>
        <IconButton
          className='Posyl-icons'
          onClick={toggleSound}
        >
          <VolumeUpIcon style={{ color: '#00AA00'}}/>
        </IconButton>
      </>
    }
    return <>
        <IconButton
          className='Posyl-icons'
          onClick={toggleSound}
        >
          <VolumeOffIcon style={{ color: '#AA0000'}} />
        </IconButton>
        <Typography variant='h4'>Звук выключен!</Typography>
      </>
  }

  const toggleSound = () => {
    if (!currentAudioElement) {
      currentAudioElement = beepRef.current;
    } else {
      currentAudioElement = null;
    }
  }

  const playBeep = (repetitions: number = 1) => {
    if (!currentAudioElement) {
        console.warn('No audio element found');
        return;
    }
    let count = 0;
    currentAudioElement.onended = (e) => {
        count += 1;

        if(!currentAudioElement || count >= repetitions) return;
        
        currentAudioElement.currentTime = 0;
        currentAudioElement.play();
    }
    currentAudioElement.play();
  }

  useEffect(() => {
    if ('wakeLock' in navigator) {
      global.navigator['wakeLock'].request('screen');
    }
    time.onTimeChange((time) => {
      setCurrentTime(time);
      if(!currentAudioElement) {
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

  return <div className='Posyl'>
    <TopBar/>
    <Typography variant='h1'>{ getTimeString(currentTime) }</Typography>
    {generateSoundButton()}
    <audio ref={beepRef} src={base64beep} />
  </div>
}

export default Posyl;