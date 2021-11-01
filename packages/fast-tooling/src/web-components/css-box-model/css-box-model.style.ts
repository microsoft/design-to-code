import { css } from "@microsoft/fast-element";

export const cssBoxModelStyles = css`
    :host {
        display: flex;
    }
    .grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        border: 1px dashed var(--neutral-foreground-rest);
        color: var(--neutral-foreground-rest);
    }
    .grid-border,
    .grid-dimension {
        border: 1px solid var(--neutral-foreground-rest);
    }

    .item {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2px;
    }

    .item-text {
        min-width: 25px;
        max-width: 60px;
    }

    .item-label {
        overflow: visible;
        justify-content: start;
        font-size: var(--type-ramp-base-font-size);
        width: 25px;
    }
    .item-top {
        grid-column: 2;
    }
    .item-left {
        grid-row: 2;
    }
    .item-middle {
        grid-row: 2;
    }
    .item-right {
        grid-row: 2;
    }
    .item-bottom {
        grid-column: 2;
    }
`;
