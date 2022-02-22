import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Check from '@mui/icons-material/Check';
import { Link } from 'react-router-dom';

export default (props) => {
    const renderOkButton = () => {
        if(!props.backPath || !props.onOkClick) {
            return;
        }
        return (
            <IconButton
                component={Link}
                to={props.backPath}
                onClick={props.onOkClick}>
                <Check style={{color: '5f5'}}/>
            </IconButton>
        )
    }
    const renderBackButton = () => {
        if(props.backPath) {
            return <IconButton
                color='inherit'
                component={Link}
                to={props.backPath}
                onClick={props.onBackClick}
            >
                <ArrowBack/>
            </IconButton>
        }
        return <IconButton disabled>
            <ArrowBack/>
        </IconButton>
    }
    return (
        <AppBar position="sticky">
            <Toolbar>
                {renderBackButton()}
            <Typography variant='h6' noWrap>Multi-Timer</Typography>
            <Box style={{flex: 1}}/>
            {renderOkButton()}
            </Toolbar>
        </AppBar>
    )
}