import {
    neutralFillStealthActive,
    neutralForegroundRest,
    typeRampBaseFontSize,
} from "@microsoft/fast-components";
import { css } from "@microsoft/fast-element";

export const cssBoxModelStyles = css`
    :host {
        display: inline-block;
    }
    .section {
        display: inline-block;
        margin-bottom: 10px;
        white-space: nowrap;
    }
    .section-label {
        display: inline-block;
        margin-bottom: 10px;
    }
    .singleInput__hidden {
        display: none;
    }
    .sideButton {
        vertical-align: top;
    }
    .sideButton path {
        fill: ${neutralForegroundRest};
    }
    .sideButton__active {
        background-color: ${neutralFillStealthActive};
    }
    .grid {
        display: grid;
        grid-template-columns: 33% 33% 33%;
        color: ${neutralForegroundRest};
    }
    .grid-dimension {
        grid-template-columns: 50% 50%;
    }
    .grid__hidden {
        display: none;
    }
    .item {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2px;
    }

    .item-label {
        overflow: visible;
        justify-content: start;
        font-size: ${typeRampBaseFontSize};
        width: 25px;
    }
    .item-top {
        grid-row: 1;
        grid-column: 2;
    }
    .item-topRight {
        grid-column: 3;
        justify-content: right;
    }
    .item-left {
        grid-row: 2;
    }
    .item-right {
        grid-row: 2;
        grid-column: 3;
    }
    .item-bottom {
        grid-row: 3;
        grid-column: 2;
    }
`;
