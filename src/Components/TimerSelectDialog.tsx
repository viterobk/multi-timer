import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { ITimerData } from '../Stores/timersStore';
import { countAllIntervals } from '../interval';
import './TimerSelectDialog.css';

const intervalWord = (count: number) => {
  const n10 = count % 10;
  const n100 = count % 100;
  if (n10 === 1 && n100 !== 11) return 'интервал';
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'интервала';
  return 'интервалов';
};

type Props = {
  open: boolean;
  title: string;
  confirmLabel: string;
  timers: ITimerData[];
  onClose: () => void;
  onConfirm: (selected: ITimerData[]) => void;
};

const TimerSelectDialog = ({ open, title, confirmLabel, timers, onClose, onConfirm }: Props) => {
  const [selected, setSelected] = useState<boolean[]>([]);

  useEffect(() => {
    if (open) {
      setSelected(timers.map(() => true));
    }
  }, [open, timers]);

  const selectedCount = selected.filter(Boolean).length;
  const allSelected = timers.length > 0 && selectedCount === timers.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggleAll = () => {
    const next = !allSelected;
    setSelected(timers.map(() => next));
  };

  const toggleOne = (index: number) => {
    setSelected((current) => current.map((value, i) => (i === index ? !value : value)));
  };

  const confirm = () => {
    onConfirm(timers.filter((_, index) => selected[index]));
  };

  return (
    <Dialog
      className="TimerSelectDialog"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {timers.length === 0 ? (
          <p className="TimerSelectDialog-empty">Нет таймеров для выбора.</p>
        ) : (
          <div className="TimerSelectDialog-list">
            <label className="TimerSelectDialog-row is-all">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
              />
              <span>Выбрать все</span>
            </label>
            {timers.map((timer, index) => {
              const total = countAllIntervals(timer.intervals.map((interval) => interval.duration));
              const count = timer.intervals.length;
              return (
                <label key={index} className="TimerSelectDialog-row">
                  <Checkbox
                    checked={Boolean(selected[index])}
                    onChange={() => toggleOne(index)}
                  />
                  <span className="TimerSelectDialog-copy">
                    <strong>{timer.name || 'Без названия'}</strong>
                    <em>
                      {total.text}
                      {count > 0 ? ` · ${count} ${intervalWord(count)}` : ''}
                    </em>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          disabled={selectedCount === 0}
          onClick={confirm}
        >
          {confirmLabel}
          {selectedCount > 0 ? ` (${selectedCount})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimerSelectDialog;
