import { css } from "@microsoft/fast-element";
import {
    AccentFillRestProperty,
    BackgroundColorProperty,
    FocusOutlineWidthProperty,
    FontSize1Property,
    ForegroundColorProperty,
    LineHeight1Property,
} from "../style/css-properties.js";

export const htmlRenderLayerNavigationStyles = (context, definition) => css`
    .navigation {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
    }
    .navigation-select,
    .navigation-hover {
        display: none;
        position: absolute;
        box-sizing: content-box;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        margin: calc(${FocusOutlineWidthProperty} * -1px) 0 0
            calc(${FocusOutlineWidthProperty} * -1px);
    }
    .navigation-select__insetY {
        margin-top: 0;
    }
    .navigation-select__insetX {
        margin-left: 0;
    }
    .navigation-select__active {
        display: block;
        border: calc(${FocusOutlineWidthProperty} * 1px) solid ${AccentFillRestProperty};
    }
    .navigation-hover__active {
        display: block;
    }
    .navigation-hover__active:after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0.16;
        border: calc(${FocusOutlineWidthProperty} * 1px) solid ${AccentFillRestProperty};
        background-color: ${AccentFillRestProperty};
    }
    .select-pill,
    .hover-pill {
        position: absolute;
        box-sizing: border-box;
        top: calc((${LineHeight1Property} + (${FocusOutlineWidthProperty} * 4px)) * -1);
        line-height: ${LineHeight1Property};
        border-radius: calc(${LineHeight1Property} / 2);
        background-color: ${AccentFillRestProperty};
        padding: 0 6px;
        border: calc(${FocusOutlineWidthProperty} * 1px) solid ${AccentFillRestProperty};
        font-size: ${FontSize1Property};
        text-transform: uppercase;
        font-weight: 700;
        color: ${BackgroundColorProperty};
        white-space: nowrap;
    }
    .select-pill__inset {
        top: calc(${FocusOutlineWidthProperty} * 1px + 2px);
        left: calc(${FocusOutlineWidthProperty} * 1px + 2px);
    }
    .hover-pill__inset {
        top: calc(${FocusOutlineWidthProperty} * 2px + 2px);
        left: calc(${FocusOutlineWidthProperty} * 2px + 2px);
    }
    .hover-pill {
        background-color: ${BackgroundColorProperty};
        color: ${ForegroundColorProperty};
    }
`;
