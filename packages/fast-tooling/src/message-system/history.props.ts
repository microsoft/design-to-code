import { MessageSystemIncoming } from "./message-system.utilities.props";

export interface HistoryItem {
    next: MessageSystemIncoming;
    previous: Array<MessageSystemIncoming>;
    id: string;
}

export interface History {
    items: HistoryItem[];
    limit: number;
}
