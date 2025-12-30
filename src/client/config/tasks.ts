export interface Task {
    id: string;
    text: string;
    days?: number[]; // 0=søndag, 1=mandag, ... tom=alle dager
}

export const tasks: Task[] = [
    { id: "oppvaskmaskin_pa", text: "Har du satt på oppvaskmaskinen?", days: [1, 2, 3, 4, 5] },
    { id: "oppvaskmaskin_ut", text: "Har du tømt oppvaskmaskinen?", days: [1, 2, 3, 4, 5] },
    { id: "overflater", text: "Har du rengjort overflatene?", days: [] }, // Alle dager
    { id: "soppel", text: "Har du tømt søppelet?", days: [5] }, // Bare fredag
    { id: "ryddet", text: "Er fellesområdet ryddig?", days: [] },
];
