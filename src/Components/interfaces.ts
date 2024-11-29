import { IInterval } from "./TimeInterval";

export interface ITimer {
    key: number,
    name: string;
    intervals: Array<IInterval>;
}