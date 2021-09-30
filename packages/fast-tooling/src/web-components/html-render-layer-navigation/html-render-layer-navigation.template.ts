import { html, ref, ViewTemplate } from "@microsoft/fast-element";
import { ElementDefinitionContext } from "@microsoft/fast-foundation";
import { FocusOutlineWidthProperty } from "../style/css-properties";
import { HTMLRenderLayerNavigation } from "./html-render-layer-navigation";

export const htmlRenderLayerNavigationTemplate: (
    context: ElementDefinitionContext
) => ViewTemplate<HTMLRenderLayerNavigation> = context => {
    return html`
        <div class="navigation">
            <div
                class="navigation-select${x =>
                    x.selectLayerActive && !x.selectLayerHide
                        ? " navigation-select__active"
                        : null}
                        ${x =>
                    x.selectPosition.top === 0 ? " navigation-select__insetVert" : ""}
                        ${x =>
                    x.selectPosition.left === 0 ? " navigation-select__insetHorz" : ""}"
                style="top:${x => x.selectPosition.top}px;left:${x =>
                    x.selectPosition.left}px;width:${x =>
                    x.selectPosition.left === 0
                        ? `calc(${x.selectPosition.width}px - ${FocusOutlineWidthProperty} * 2px)`
                        : `${x.selectPosition.width}px`};height:${x =>
                    x.selectPosition.top === 0
                        ? `calc(${x.selectPosition.height}px - ${FocusOutlineWidthProperty} * 2px)`
                        : `${x.selectPosition.height}px`}"
            >
                <div
                    class="select-pill ${x =>
                        x.selectPosition.top <= x.selectPillHeight
                            ? "select-pill__inset"
                            : ""}"
                    ${ref("selectPillElement")}
                >
                    ${x => x.selectPillContent}
                </div>
            </div>
            <div
                class="navigation-hover ${x =>
                    x.hoverLayerActive && !x.hoverLayerHide
                        ? "navigation-hover__active"
                        : null}"
                style="top:${x => x.hoverPosition.top}px;left:${x =>
                    x.hoverPosition.left}px;width:${x =>
                    x.hoverPosition.width}px;height:${x => x.hoverPosition.height}px"
            >
                <div
                    class="hover-pill ${x =>
                        x.hoverPosition.top <= x.hoverPillHeight
                            ? "hover-pill__inset"
                            : ""}"
                    ${ref("hoverPillElement")}
                >
                    ${x => x.hoverPillContent}
                </div>
            </div>
        </div>
    `;
};
