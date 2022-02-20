import React, { Component } from 'react';
import {
    Button,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import timersStore from '../Stores/timersStore';
import './Home.css';
import { observer } from 'mobx-react';
import TopBar from './TopBar';
import { countAllIntervals as countTotalInterval } from '../interval';

class Home extends Component {
    render() {
        const generateListItems = () => {
            const items = timersStore.timers.map(timer => {
                const interval = countTotalInterval(timer.intervals);

                return (
                    <ListItem key={timer.key} className="Home-listitem-doublepadding">
                        <ListItemButton
                            className='Home-timeritem'
                            component={Link}
                            to={`/run/${timer.key}`}>
                            <ListItemText
                                primary={timer.name}
                                secondary={interval.text} />
                        </ListItemButton>
                        <ListItemSecondaryAction>
                            <IconButton component={Link} to={`/Edit/${timer.key}`}>
                                <EditIcon></EditIcon>
                            </IconButton>
                            <IconButton onClick={() => { timersStore.delete(timer.key) }}>
                                <DeleteIcon></DeleteIcon>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                )
            })
            items.push(<ListItem key={-1}>
                <Button
                    component={Link}
                    to='/edit/'
                >
                    <AddIcon />
                    <ListItemText
                        primary={"Add timer"} />
                </Button>
            </ListItem>);
            return items;
        };
        return (
            <div className='Home'>
                <TopBar />
                <List className='Home-list'>
                    {generateListItems()}
                </List>
            </div>
        )
    }
}
export default observer(Home);