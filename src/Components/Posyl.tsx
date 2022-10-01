import {
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import TopBar from './TopBar';
import './Posyl.css';
import base64video from '../video';
import { beep1 as base64beep } from '../Sounds';
import { createRef, useState, useEffect } from 'react';
import Time from '../Time';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const getTimeString = (time) => {
  const hPrefix = time.hours < 10 ? '0' : '';
  const mPrefix = time.minutes < 10 ? '0' : '';
  const sPrefix = time.seconds < 10 ? '0' : '';
  return `${hPrefix}${time.hours}:${mPrefix}${time.minutes}:${sPrefix}${time.seconds}`
}

export default function() {
  const videoRef = createRef<HTMLVideoElement>();
  const beepRef = createRef<HTMLAudioElement>();
  let currentVideoElement: HTMLVideoElement | null;
  let currentAudioElement: HTMLAudioElement | null;

  const [ time, setTime ] = useState(new Time());
  const [ currentTime, setCurrentTime ] = useState(time.getTime());
  const [ playSound, setPlaySound ] = useState(false); 

  const generateSoundButton = () => {
    if (playSound) {
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
    if(currentVideoElement) {
      playSound ? currentVideoElement.pause() : currentVideoElement.play();
    }
    setPlaySound(!playSound);
  }

  const playBeep = (repetitions: number = 1) => {
    if (!currentAudioElement) {
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
    currentAudioElement = beepRef.current;
    currentVideoElement = videoRef.current;
    time.onTimeChange((time) => {
      setCurrentTime(time);
      if(!playSound) {
        return;
      }
      if (time.minutes === 55 && time.seconds === 0) {
        playBeep(1);
      } else if (time.minutes === 59 && time.seconds === 30) {
        playBeep(1);
      } else if (time.minutes === 0 && time.seconds === 0) {
        playBeep(2);
      }
    })
    return () => {
      time.onTimeChange();
    }
  })

  return <div className='Posyl'>
    <TopBar/>
    <Typography variant='h1'>{ getTimeString(currentTime) }</Typography>
    {generateSoundButton()}
    <video ref={videoRef} src={base64video} loop/>
    <audio ref={beepRef} src={base64beep} />
  </div>
}