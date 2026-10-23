import { Button, IconButton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Check from '@mui/icons-material/Check';
import { Link, useNavigate } from 'react-router-dom';
import './TopBar.css';

export default (props) => {
    const navigate = useNavigate();
    const backClicked = () => {
        const e = { cancel: false };
        props.onBackClick && props.onBackClick(e);
        if (!e.cancel) navigate(props.backPath);
    }
    const renderOkButton = () => {
        if (!props.backPath || !props.onOkClick) {
            return null;
        }
        return (
            <Button
                className="TopBar-done"
                component={Link}
                to={props.backPath}
                onClick={props.onOkClick}
                startIcon={<Check />}
            >
                Готово
            </Button>
        )
    }
    const renderBackButton = () => {
        if (!props.backPath) {
            return null;
        }
        return (
            <IconButton
                color="inherit"
                onClick={backClicked}
                aria-label="Назад"
            >
                <ArrowBack />
            </IconButton>
        )
    }
    return (
        <header className="TopBar">
            <div className="TopBar-inner">
                {renderBackButton()}
                <h1 className="TopBar-title">{props.title || 'Интервальный таймер'}</h1>
                {props.trailing}
                {renderOkButton()}
            </div>
        </header>
    )
}
