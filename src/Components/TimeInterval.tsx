import { TextField } from "@mui/material";
import { Component } from "react";
import { countInterval } from "../interval";
import './TimeInterval.css';

export interface IInterval {
  duration: number;
  description: string;
}

export default class TimeInterval extends Component<{ value: IInterval, onChange: (value: IInterval) => void }> {
  state: { min: number, sec: number, description?: string };
  constructor(props) {
    super(props);
    const interval = countInterval(props.value.duration);
    this.state = { min: interval.min, sec: interval.sec, description: props.value.description };
  }

  componentDidUpdate = () => {
    this.props.onChange(this.stateToInterval(this.state));
  }

  stateToInterval(state: { min: number, sec: number, description?: string }): IInterval {
    return {
      duration: state.min * 60 + state.sec,
      description: state.description || '',
    }
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
    const onDescriptionChanged = (e) => {
      const description = e.target.value || '';
      this.setState({ description });
    }
    return (
      <div className='TimeInterval'>
        <TextField
          className='TimeInterval-textfield TimeInterval-textfield-fullwidth'
          type='text'
          size='small'
          label='Описание'
          defaultValue={this.state.description}
          onBlur={onDescriptionChanged}
          onFocus={(e) => { e.target.select() }}
        />
        <TextField
          type={'numeric'}
          className='TimeInterval-textfield TimeInterval-textfield-narrow'
          label='минуты'
          size='small'
          defaultValue={this.state.min}
          onBlur={onMinChanged}
          onFocus={(e) => { e.target.select() }}
        />
        <TextField
          type='numeric'
          className='TimeInterval-textfield TimeInterval-textfield-narrow'
          label='секунды'
          size='small'
          defaultValue={this.state.sec}
          onBlur={onSecChanged}
          onFocus={(e) => { e.target.select() }}
        />
      </div>
    )
  }
}