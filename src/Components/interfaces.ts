import { IInterval } from "./TimeInterval";

export interface ITimer {
    key: number,
    name: string;
    description?: string;
    intervals: Array<IInterval>;
}