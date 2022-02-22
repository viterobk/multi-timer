import { TextField } from "@mui/material";
import { Component } from "react";
import { countInterval } from "../interval";
import './TimeInterval.css';

export default class TimeInterval extends Component<{ value: number, onChange: (value: number) => void }> {
    state: { min: number, sec: number };
    constructor(props) {
        super(props);
        const interval = countInterval(props.value);
        this.state = { min: interval.min, sec: interval.sec };
    }

    componentDidUpdate = () => {
        this.props.onChange(this.stateToInterval(this.state))
    }

    stateToInterval(state: {min: number, sec: number}) {
        return state.min * 60 + state.sec;
    }

    render() {
        const onMinChanged = (e) => {
            const numValue = Number.parseInt(e.target.value);
            if (Number.isNaN(numValue) || numValue < 0 || numValue > 999) {
                e.target.value = this.state.min;
            } else {
                this.setState({ min: numValue });
            }
        }
        const onSecChanged = (e) => {
            const numValue = Number.parseInt(e.target.value);
            if (Number.isNaN(numValue) || numValue < 0 || numValue > 59) {
                e.target.value = this.state.sec.toString();
            } else {
                this.setState({ sec: numValue });
            }
        }
        return (
            <div className="TimeInterval">
                <input
                    type={'numeric'}
                    defaultValue={this.state.min}
                    onBlur={onMinChanged}
                    />
                <span> min, </span>
                <input
                    type='numeric'
                    defaultValue={this.state.sec}
                    onBlur={onSecChanged}/>
                <span> sec</span>
            </div>
        )
    }
}