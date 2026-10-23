import { playBeep, preloadBeep, unlockBeep } from './beepPlayer';

test('preload and play do not throw when the audio graph is unavailable', async () => {
  await expect(preloadBeep()).resolves.toBeUndefined();
  await expect(unlockBeep()).resolves.toBeUndefined();
  expect(() => playBeep()).not.toThrow();
  expect(() => playBeep(3)).not.toThrow();
});
