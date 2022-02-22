import { beep1 as beepSound } from './Sounds';

export const beep = (repetitions: number = 1) => {
    let count = 0;
    beepSound.onended = (e) => {
        count += 1;

        if(count >= repetitions) return;
        
        beepSound.currentTime = 0;
        beepSound.play();
    }
    beepSound.play();
}