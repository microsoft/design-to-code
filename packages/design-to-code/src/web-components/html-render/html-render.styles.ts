import { css } from "@microsoft/fast-element";

export const htmlRenderStyles = (context, definition) => css`
    .container,
    .container__interactive {
        width: 100%;
        height: 100%;
        padding: 0;
        box-sizing: border-box;
    }
    .htmlRender {
        width: 100%;
        height: 100%;
        outline: none;
        display: flow-root;
    }
    .htmlRender > * {
        display: flow-root;
    }
`;
