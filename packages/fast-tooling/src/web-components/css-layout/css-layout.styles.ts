import { css } from "@microsoft/fast-element";

const radioBackgroundColor = "#222";
const activeRadioBackgroundColor = "#333";
const numberfieldBorderColor = "#333";
const activeRadioBorderColor = "#282828";
const borderRadius = "3px";

export const cssLayoutStyles = css`
    :host {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }

    label {
        display: block;
        font-size: var(--type-ramp-base-font-size);
        line-height: var(--type-ramp-base-line-height);
        margin: 10px 0 5px;
    }

    .flexboxRegion {
        display: none;
    }

    .flexboxRegion__active {
        display: block;
    }

    .controlRegion,
    .controlRegion-row {
        display: flex;
        flex-direction: column;
    }

    .controlRegion-row {
        flex-direction: row;
    }

    .numberfield {
        display: flex;
        column-gap: 12px;
    }

    .numberfield-icon {
        position: relative;
        padding: 5px;
        width: 12px;
        height: 12px;
    }

    .numberfield-input {
        background: transparent;
        vertical-align: middle;
        outline: none;
        border: none;
        width: 40px;
        border-left: 1px solid ${numberfieldBorderColor};
        color: #fff;
    }

    .numberfield-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }

    .numberfield-item {
        display: flex;
        border: 1px solid ${numberfieldBorderColor};
        border-radius: ${borderRadius};
    }

    .radioRegion {
        display: flex;
        column-gap: 2px;
    }

    .radioRegion-contentItem {
        background: ${radioBackgroundColor};
        border-radius: ${borderRadius};
        border: 3px solid #1b1b1b;
        position: relative;
        height: 24px;
        max-width: 24px;
    }

    .radioRegion-contentItem__active {
        background: ${activeRadioBackgroundColor};
        border-color: ${activeRadioBorderColor};
    }

    .radioRegion-input {
        width: 24px;
        height: 24px;
        margin: 0;
        opacity: 0;
    }

    svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    svg,
    path,
    rect {
        pointer-events: none;
    }
`;
