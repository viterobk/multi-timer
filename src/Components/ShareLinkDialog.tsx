import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import './ShareLinkDialog.css';

type Props = {
  open: boolean;
  url: string;
  onClose: () => void;
};

const ShareLinkDialog = ({ open, url, onClose }: Props) => {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (open) {
      setCopied(false);
    }
  }, [open, url]);

  const copyUrl = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        fieldRef.current?.select();
        document.execCommand('copy');
      }
      setCopied(true);
    } catch {
      fieldRef.current?.select();
    }
  };

  const shareUrl = async () => {
    try {
      await navigator.share({
        title: 'Интервальный таймер',
        url,
      });
    } catch {
      // User cancelled the system share sheet.
    }
  };

  return (
    <Dialog
      className="ShareLinkDialog"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Ссылка на таймер</DialogTitle>
      <DialogContent>
        <p className="ShareLinkDialog-hint">
          По ссылке откроется этот таймер. Если его ещё нет на устройстве, он сохранится.
        </p>
        <textarea
          ref={fieldRef}
          className="ShareLinkDialog-url"
          value={url}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        {canShare && (
          <Button onClick={shareUrl}>Отправить</Button>
        )}
        <Button variant="contained" onClick={copyUrl}>
          {copied ? 'Скопировано' : 'Копировать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareLinkDialog;
