import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { countAllIntervals } from '../interval';
import timersStore, { ITimerData } from '../Stores/timersStore';
import { decodeTimerFromLink, resolveSharedTimer } from '../shareLink';
import TopBar from './TopBar';
import './Home.css';
import './ShareImport.css';

const intervalWord = (count: number) => {
  const n10 = count % 10;
  const n100 = count % 100;
  if (n10 === 1 && n100 !== 11) return 'интервал';
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'интервала';
  return 'интервалов';
};

const openTimer = (navigate: ReturnType<typeof useNavigate>, key: number) => {
  navigate(`/run/${key}`, { replace: true });
};

const addIncomingTimer = (incoming: ITimerData) => {
  const [key] = timersStore.importTimers([incoming]);
  return key;
};

const ShareImport = () => {
  const navigate = useNavigate();
  const params = useParams();
  const payload = params['*'] || '';
  const handledPayloadRef = useRef('');
  const [conflictKey, setConflictKey] = useState<number | null>(null);

  const parsed = useMemo(() => {
    try {
      return { timer: decodeTimerFromLink(payload), error: '' };
    } catch (error) {
      return {
        timer: null,
        error: error instanceof Error ? error.message : 'Некорректная ссылка',
      };
    }
  }, [payload]);

  useEffect(() => {
    if (!parsed.timer || handledPayloadRef.current === payload) {
      return;
    }
    handledPayloadRef.current = payload;
    const resolution = resolveSharedTimer(parsed.timer, timersStore.timers);
    if (resolution.type === 'open') {
      openTimer(navigate, resolution.key);
      return;
    }
    if (resolution.type === 'add') {
      openTimer(navigate, addIncomingTimer(parsed.timer));
      return;
    }
    setConflictKey(resolution.existingKey);
  }, [navigate, parsed.timer, payload]);

  const goHome = () => navigate('/', { replace: true });

  const createAnother = () => {
    if (!parsed.timer) {
      return;
    }
    openTimer(navigate, addIncomingTimer(parsed.timer));
  };

  const openExisting = () => {
    if (conflictKey == null) {
      return;
    }
    openTimer(navigate, conflictKey);
  };

  const overwriteExisting = () => {
    if (!parsed.timer || conflictKey == null) {
      return;
    }
    timersStore.update({
      ...parsed.timer,
      key: conflictKey,
    });
    openTimer(navigate, conflictKey);
  };

  const incoming = parsed.timer;
  const total = incoming
    ? countAllIntervals(incoming.intervals.map((interval) => interval.duration))
    : null;

  return (
    <div className="ShareImport">
      <TopBar backPath="/" />
      <div className="page">
        {parsed.error ? (
          <div className="Home-empty">
            <div className="Home-empty-icon">
              <TimerOutlinedIcon />
            </div>
            <h2>Не удалось открыть ссылку</h2>
            <p>{parsed.error}</p>
            <Button className="ShareImport-action" component={Link} to="/" variant="contained">
              На главную
            </Button>
          </div>
        ) : incoming && conflictKey != null ? (
          <>
            <div className="ShareImport-intro">
              <h2>{incoming.name || 'Без названия'}</h2>
              <p>
                {total?.text}
                {incoming.intervals.length > 0
                  ? ` · ${incoming.intervals.length} ${intervalWord(incoming.intervals.length)}`
                  : ''}
              </p>
            </div>
            <Dialog
              className="ShareConflictDialog"
              open
              onClose={goHome}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Таймер с таким именем уже существует</DialogTitle>
              <DialogContent>
                <p className="ShareImport-conflict">
                  «{incoming.name || 'Без названия'}» уже сохранён, но настройки в ссылке другие. Можно открыть текущую версию, заменить её или добавить ещё одну.
                </p>
              </DialogContent>
              <DialogActions className="ShareConflictDialog-actions">
                <Button variant="contained" onClick={openExisting}>Открыть существующий</Button>
                <Button onClick={overwriteExisting}>Перезаписать</Button>
                <Button onClick={createAnother}>Создать ещё один</Button>
                <Button onClick={goHome}>Отмена</Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <div className="ShareImport-intro">
            <h2>Открываем таймер…</h2>
            <p>Конфигурация пришла вместе со ссылкой.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareImport;
