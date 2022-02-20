import { Button, TextField } from "@mui/material";
import { Component } from "react";
import { countInterval } from "../interval";
import './TimeInterval.css';

export default class TimeInterval extends Component<{ value: number }> {
    state: { value: number };
    constructor(props) {
        super(props);
        this.state = { value: props.value };
    }
    changeMinutes(value: string) {

    }
    changeSeconds(value: string) {

    }

    render() {
        const interval = countInterval(this.state.value);
        return (
            <div className="TimeInterval">
                <TextField
                    inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]{1,3}',
                    }}
                    defaultValue={interval.min}
                    onChange={(e) => {this.changeMinutes(e.target.value)}}/>
                <span> min, </span>
                <TextField
                    inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-5][0-9]',
                    }}
                    defaultValue={interval.sec}
                    onChange={(e) => {this.changeMinutes(e.target.value)}}/>
                <span> sec</span>
            </div>
        )
    }
}