import { ChangeEvent, useRef, useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { observer } from 'mobx-react';
import timersStore, { ITimerData, parseTimersJson, serializeTimers } from '../Stores/timersStore';
import TimerSelectDialog from './TimerSelectDialog';

const downloadTimersJson = (timers: ITimerData[]) => {
  const payload = JSON.stringify(serializeTimers(timers), null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'timers.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const HomeMenu = observer(() => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTimers, setExportTimers] = useState<ITimerData[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importedTimers, setImportedTimers] = useState<ITimerData[]>([]);

  const closeMenu = () => setMenuAnchor(null);

  const openExport = () => {
    closeMenu();
    setExportTimers(timersStore.timers.map(({ key, ...timer }) => timer));
    setExportOpen(true);
  };

  const openImportPicker = () => {
    closeMenu();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const timers = parseTimersJson(text);
      if (timers.length === 0) {
        window.alert('В файле нет таймеров.');
        return;
      }
      setImportedTimers(timers);
      setImportOpen(true);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Не удалось прочитать файл.');
    }
  };

  const confirmExport = (selected: ITimerData[]) => {
    downloadTimersJson(selected);
    setExportOpen(false);
  };

  const confirmImport = (selected: ITimerData[]) => {
    timersStore.importTimers(selected);
    setImportOpen(false);
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportedTimers([]);
  };

  return (
    <>
      <IconButton
        aria-label="Меню"
        aria-haspopup="true"
        onClick={(event) => setMenuAnchor(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 240, mt: 0.75 } }}
      >
        <MenuItem onClick={openImportPicker}>
          <ListItemIcon>
            <FileUploadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Импорт таймеров</ListItemText>
        </MenuItem>
        <MenuItem onClick={openExport} disabled={timersStore.timers.length === 0}>
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Экспорт таймеров</ListItemText>
        </MenuItem>
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={onFileChosen}
      />
      <TimerSelectDialog
        open={exportOpen}
        title="Экспорт таймеров"
        confirmLabel="Экспортировать"
        timers={exportTimers}
        onClose={() => setExportOpen(false)}
        onConfirm={confirmExport}
      />
      <TimerSelectDialog
        open={importOpen}
        title="Импорт таймеров"
        confirmLabel="Импортировать"
        timers={importedTimers}
        onClose={closeImport}
        onConfirm={confirmImport}
      />
    </>
  );
});

export default HomeMenu;
