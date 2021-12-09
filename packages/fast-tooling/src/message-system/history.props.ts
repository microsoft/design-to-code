import { MessageSystemIncoming } from "./message-system.utilities.props";

export interface HistoryItem {
    data: MessageSystemIncoming;
    id: string;
}

export interface History {
    items: HistoryItem[];
    limit: number;
}
