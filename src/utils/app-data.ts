export type RoutineRecord = {
    date: Date;
    value?: boolean | number;
    notes?: string;
}

export type Routine = {
    name: string;
    records: RoutineRecord[];
}

export type AppData = {
    routines: Routine[];
}
