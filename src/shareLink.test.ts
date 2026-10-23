import {
  decodeTimerFromLink,
  decodeTimersFromLink,
  encodeTimerForLink,
  encodeTimersForLink,
  resolveSharedTimer,
  timersHaveSameConfig,
} from './shareLink';
import { ITimerData } from './Stores/timersStore';

const sample: ITimerData = {
  name: 'Табата',
  description: '**20** сек работа',
  intervals: [
    { duration: 40, description: 'Работа' },
    { duration: 20, description: '' },
  ],
};

test('round-trips a timer through a share payload', () => {
  const encoded = encodeTimerForLink(sample);
  expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  expect(decodeTimerFromLink(encoded)).toEqual(sample);
  expect(decodeTimersFromLink(encodeTimersForLink([sample]))).toEqual([sample]);
});

test('rejects a broken payload', () => {
  expect(() => decodeTimersFromLink('%%%')).toThrow('Некорректная ссылка');
});

test('compares timer configs without the key', () => {
  expect(timersHaveSameConfig(sample, { ...sample })).toBe(true);
  expect(timersHaveSameConfig(sample, {
    ...sample,
    intervals: [{ duration: 99, description: 'Работа' }],
  })).toBe(false);
});

test('opens an identical saved timer and asks when the name matches a different config', () => {
  const saved = [{ ...sample, key: 3 }];
  expect(resolveSharedTimer(sample, saved)).toEqual({ type: 'open', key: 3 });
  expect(resolveSharedTimer({ ...sample, intervals: [{ duration: 5, description: '' }] }, saved)).toEqual({
    type: 'conflict',
    existingKey: 3,
  });
  expect(resolveSharedTimer({ ...sample, name: 'Другой' }, saved)).toEqual({ type: 'add' });
});
