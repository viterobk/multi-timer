import { ITimerData, parseTimersJson } from './Stores/timersStore';

type CompactInterval = number | [number, string];

type CompactTimer = {
  n: string;
  d?: string;
  i: CompactInterval[];
};

type CompactPayload = {
  v: 1;
  t: CompactTimer[];
};

const utf8ToBinary = (text: string): string => (
  encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, hex) => (
    String.fromCharCode(Number.parseInt(hex, 16))
  ))
);

const binaryToUtf8 = (binary: string): string => {
  const encoded = Array.from(binary, (char) => (
    `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`
  )).join('');
  return decodeURIComponent(encoded);
};

const toBase64Url = (text: string): string => (
  btoa(utf8ToBinary(text)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
);

const fromBase64Url = (payload: string): string => {
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return binaryToUtf8(atob(normalized + '='.repeat(padLength)));
};

const toCompactTimer = (timer: ITimerData): CompactTimer => {
  const compact: CompactTimer = {
    n: timer.name,
    i: timer.intervals.map((interval) => (
      interval.description
        ? [interval.duration, interval.description]
        : interval.duration
    )),
  };
  if (timer.description) {
    compact.d = timer.description;
  }
  return compact;
};

const expandCompactTimer = (timer: CompactTimer) => ({
  name: timer.n,
  description: timer.d || '',
  intervals: (timer.i || []).map((interval) => {
    if (typeof interval === 'number') {
      return { duration: interval, description: '' };
    }
    return {
      duration: interval[0],
      description: interval[1] || '',
    };
  }),
});

export const encodeTimersForLink = (timers: ITimerData[]): string => {
  const payload: CompactPayload = {
    v: 1,
    t: timers.map(toCompactTimer),
  };
  return toBase64Url(JSON.stringify(payload));
};

export const encodeTimerForLink = (timer: ITimerData): string => (
  encodeTimersForLink([timer])
);

export const decodeTimersFromLink = (payload: string): ITimerData[] => {
  if (!payload) {
    throw new Error('В ссылке нет конфигурации таймера');
  }

  let jsonText: string;
  try {
    jsonText = fromBase64Url(payload);
  } catch {
    throw new Error('Некорректная ссылка');
  }

  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error('Некорректная ссылка');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Некорректная ссылка');
  }

  const compact = data as Partial<CompactPayload>;
  if (compact.v === 1 && Array.isArray(compact.t)) {
    return parseTimersJson(JSON.stringify({
      version: 1,
      timers: compact.t.map(expandCompactTimer),
    }));
  }

  return parseTimersJson(jsonText);
};

export const decodeTimerFromLink = (payload: string): ITimerData => {
  const timers = decodeTimersFromLink(payload);
  if (timers.length === 0) {
    throw new Error('В ссылке нет конфигурации таймера');
  }
  return timers[0];
};

export const timersHaveSameConfig = (left: ITimerData, right: ITimerData): boolean => {
  if (left.name !== right.name || (left.description || '') !== (right.description || '')) {
    return false;
  }
  if (left.intervals.length !== right.intervals.length) {
    return false;
  }
  return left.intervals.every((interval, index) => {
    const other = right.intervals[index];
    return interval.duration === other.duration
      && (interval.description || '') === (other.description || '');
  });
};

export type SharedTimerResolution =
  | { type: 'add' }
  | { type: 'open'; key: number }
  | { type: 'conflict'; existingKey: number };

export const resolveSharedTimer = (
  incoming: ITimerData,
  existingTimers: Array<ITimerData & { key: number }>,
): SharedTimerResolution => {
  const sameName = existingTimers.filter((timer) => timer.name === incoming.name);
  const identical = sameName.find((timer) => timersHaveSameConfig(timer, incoming));
  if (identical) {
    return { type: 'open', key: identical.key };
  }
  if (sameName.length === 0) {
    return { type: 'add' };
  }
  return { type: 'conflict', existingKey: sameName[0].key };
};

export const buildShareUrl = (timer: ITimerData): string => {
  const encoded = encodeTimerForLink(timer);
  return `${window.location.origin}${window.location.pathname}#/t/${encoded}`;
};
