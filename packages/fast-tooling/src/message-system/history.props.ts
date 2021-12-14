import { MessageSystemIncoming } from "./message-system.utilities.props";

export interface HistoryItem {
    next: MessageSystemIncoming;
    previous: MessageSystemIncoming;
    id: string;
}

export interface History {
    items: HistoryItem[];
    limit: number;
}
