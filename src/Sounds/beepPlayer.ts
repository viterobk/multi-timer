import embeddedBeep from './beep1';

const BEEP_URL = `${process.env.PUBLIC_URL || ''}/sounds/beep.mp3`;

let audioContext: AudioContext | null = null;
let beepBuffer: AudioBuffer | null = null;
let htmlAudio: HTMLAudioElement | null = null;
let loadPromise: Promise<void> | null = null;
let armed = false;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextCtor = window.AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    if (!audioContext) {
      audioContext = new AudioContextCtor();
    }
    return audioContext;
  } catch (error) {
    return null;
  }
}

function dataUriToArrayBuffer(uri: string): ArrayBuffer {
  const comma = uri.indexOf(',');
  const base64 = comma >= 0 ? uri.slice(comma + 1) : uri;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function safeLoad(audio: HTMLAudioElement): void {
  try {
    audio.load();
  } catch (error) {
    // jsdom does not implement media loading.
  }
}

function createHtmlAudio(src: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.setAttribute('playsinline', 'true');
  audio.setAttribute('webkit-playsinline', 'true');
  audio.src = src;
  safeLoad(audio);
  return audio;
}

async function fetchBeepBytes(): Promise<{ bytes: ArrayBuffer, fromFile: boolean }> {
  try {
    const response = await fetch(BEEP_URL, { credentials: 'same-origin' });
    if (response.ok) {
      return { bytes: await response.arrayBuffer(), fromFile: true };
    }
  } catch (error) {
    // Use the bundled sample if the public file is not cached yet.
  }
  return { bytes: dataUriToArrayBuffer(embeddedBeep), fromFile: false };
}

export function preloadBeep(): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    if (!htmlAudio) {
      htmlAudio = createHtmlAudio(BEEP_URL);
    }

    const context = getAudioContext();
    const { bytes, fromFile } = await fetchBeepBytes();
    if (!fromFile && htmlAudio) {
      htmlAudio.src = embeddedBeep;
      safeLoad(htmlAudio);
    }
    if (!context) {
      return;
    }

    try {
      beepBuffer = await context.decodeAudioData(bytes.slice(0));
    } catch (error) {
      const fallback = dataUriToArrayBuffer(embeddedBeep);
      beepBuffer = await context.decodeAudioData(fallback.slice(0));
      if (htmlAudio) {
        htmlAudio.src = embeddedBeep;
        safeLoad(htmlAudio);
      }
    }
  })().catch((error) => {
    loadPromise = null;
    console.warn('Failed to preload beep', error);
  });

  return loadPromise;
}

function resumeContext(): Promise<void> {
  const context = getAudioContext();
  if (!context || context.state === 'running') {
    return Promise.resolve();
  }
  return context.resume().then(() => undefined).catch(() => undefined);
}

function playMedia(el: HTMLAudioElement): Promise<void> {
  try {
    const result = el.play();
    if (result && typeof result.then === 'function') {
      return result.catch(() => undefined);
    }
  } catch (error) {
    // jsdom and autoplay policies may reject playback.
  }
  return Promise.resolve();
}

function primeHtmlAudio(): void {
  if (!htmlAudio) {
    htmlAudio = createHtmlAudio(BEEP_URL);
  }
  htmlAudio.muted = true;
  void playMedia(htmlAudio).then(() => {
    if (!htmlAudio) return;
    try {
      htmlAudio.pause();
    } catch (error) {
      // jsdom does not implement media pause.
    }
    htmlAudio.currentTime = 0;
    htmlAudio.muted = false;
  });
}

export function unlockBeep(): Promise<void> {
  const resume = resumeContext();
  primeHtmlAudio();
  return Promise.all([resume, preloadBeep()]).then(() => undefined);
}

function playWithWebAudio(repetitions: number): boolean {
  const context = audioContext;
  if (!context || context.state !== 'running' || !beepBuffer) {
    return false;
  }

  const gap = 0.08;
  const duration = Math.max(beepBuffer.duration, 0.05);
  for (let i = 0; i < repetitions; i += 1) {
    const source = context.createBufferSource();
    source.buffer = beepBuffer;
    source.connect(context.destination);
    source.start(context.currentTime + i * (duration + gap));
  }
  return true;
}

function playWithHtmlAudio(repetitions: number): void {
  if (!htmlAudio) {
    htmlAudio = createHtmlAudio(embeddedBeep);
  }

  let count = 0;
  htmlAudio.onended = () => {
    count += 1;
    if (!htmlAudio || count >= repetitions) {
      return;
    }
    htmlAudio.currentTime = 0;
    void playMedia(htmlAudio);
  };
  htmlAudio.muted = false;
  htmlAudio.currentTime = 0;
  void playMedia(htmlAudio).then(() => {
    if (!htmlAudio || htmlAudio.readyState > 0 || htmlAudio.src === embeddedBeep) {
      return;
    }
    htmlAudio.src = embeddedBeep;
    safeLoad(htmlAudio);
    void playMedia(htmlAudio);
  });
}

export function playBeep(repetitions: number = 1): void {
  const count = Math.max(1, repetitions);
  if (playWithWebAudio(count)) {
    return;
  }

  void unlockBeep().then(() => {
    if (!playWithWebAudio(count)) {
      playWithHtmlAudio(count);
    }
  });
}

export function startBeepPlayer(): void {
  if (typeof window === 'undefined' || armed) {
    return;
  }
  armed = true;

  const preload = () => {
    void preloadBeep();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preload, { once: true });
  } else {
    preload();
  }

  const unlock = () => {
    void unlockBeep();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void resumeContext();
    }
  });
}
