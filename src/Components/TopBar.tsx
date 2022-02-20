import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

export default (props) => {
    const renderBackButton = (backPath) => {
        console.log(backPath);
        if(backPath) {
            return <IconButton
                color='inherit'
                component={Link}
                to={props.backPath}
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
                {renderBackButton(props.backPath)}
            <Typography variant='h6' noWrap style={{ flex: 1 }}>Multi-Timer</Typography>
            </Toolbar>
        </AppBar>
    )
}