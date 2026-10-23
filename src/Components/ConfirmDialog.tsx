import { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import './ConfirmDialog.css';

type Action = {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'contained';
  color?: 'primary' | 'error';
};

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  actions: Action[];
  onClose: () => void;
};

const ConfirmDialog = ({ open, title, children, actions, onClose }: Props) => (
  <Dialog
    className="ConfirmDialog"
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <div className="ConfirmDialog-body">{children}</div>
    </DialogContent>
    <DialogActions className="ConfirmDialog-actions">
      {actions.map((action) => (
        <Button
          key={action.label}
          color={action.color || 'primary'}
          variant={action.variant || 'text'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
