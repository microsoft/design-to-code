import { html } from "@microsoft/fast-element";
import { ElementDefinitionContext } from "@microsoft/fast-foundation";
import { CSSBoxModel } from "./css-box-model";

/**
 * The template for the box-model component.
 * @public
 */
export const cssBoxModelTemplate = (context: ElementDefinitionContext) => html<
    CSSBoxModel
>`
    <template>
        <div class="grid grid-margin">
            <div class="item item-label">margin</div>
            <div class="item item-top">
                <fast-tooling-units-text-field
                    id="margin-top"
                    class="item-text"
                    title="margin-top"
                    tabindex="1"
                    :value="${x => x.uiValues.margin.top}"
                    @change="${(x, c) => x.handleInputChange("margin-top", c.event)}"
                ></fast-tooling-units-text-field>
            </div>
            <div class="item item-left">
                <fast-tooling-units-text-field
                    id="margin-left"
                    class="item-text"
                    title="margin-left"
                    tabindex="2"
                    :value="${x => x.uiValues.margin.left}"
                    @change="${(x, c) => x.handleInputChange("margin-left", c.event)}"
                ></fast-tooling-units-text-field>
            </div>
            <div class="item item-middle">
                <div class="grid grid-border">
                    <div class="item item-label">border</div>
                    <div class="item item-top">
                        <fast-tooling-units-text-field
                            id="border-top-width"
                            class="item-text"
                            title="border-top-width"
                            tabindex="5"
                            :value="${x => x.uiValues.borderWidth.top}"
                            @change="${(x, c) =>
                                x.handleInputChange("border-top-width", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                    <div class="item item-left">
                        <fast-tooling-units-text-field
                            id="border-left-width"
                            class="item-text"
                            title="border-left-width"
                            tabindex="6"
                            :value="${x => x.uiValues.borderWidth.left}"
                            @change="${(x, c) =>
                                x.handleInputChange("border-left-width", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                    <div class="item item-middle">
                        <div class="grid grid-padding">
                            <div class="item item-label">padding</div>
                            <div class="item item-top">
                                <fast-tooling-units-text-field
                                    id="padding-top"
                                    class="item-text"
                                    title="padding-top"
                                    tabindex="9"
                                    :value="${x => x.uiValues.padding.top}"
                                    @change="${(x, c) =>
                                        x.handleInputChange("padding-top", c.event)}"
                                ></fast-tooling-units-text-field>
                            </div>
                            <div class="item item-left">
                                <fast-tooling-units-text-field
                                    id="padding-left"
                                    class="item-text"
                                    title="padding-left"
                                    tabindex="10"
                                    :value="${x => x.uiValues.padding.left}"
                                    @change="${(x, c) =>
                                        x.handleInputChange("padding-left", c.event)}"
                                ></fast-tooling-units-text-field>
                            </div>
                            <div class="item item-middle">
                                <div class="grid grid-dimension">
                                    <div class="item">
                                        <fast-tooling-units-text-field
                                            id="width"
                                            class="item-text"
                                            title="width"
                                            tabindex="13"
                                            :value="${x => x.uiValues.width}"
                                            @change="${(x, c) =>
                                                x.handleInputChange("width", c.event)}"
                                        ></fast-tooling-units-text-field>
                                    </div>
                                    <div class="item">x</div>
                                    <div class="item">
                                        <fast-tooling-units-text-field
                                            id="height"
                                            class="item-text"
                                            title="height"
                                            tabindex="14"
                                            :value="${x => x.uiValues.height}"
                                            @change="${(x, c) =>
                                                x.handleInputChange("height", c.event)}"
                                        ></fast-tooling-units-text-field>
                                    </div>
                                </div>
                            </div>
                            <div class="item item-right">
                                <fast-tooling-units-text-field
                                    id="padding-right"
                                    class="item-text"
                                    title="padding-right"
                                    tabindex="11"
                                    :value="${x => x.uiValues.padding.right}"
                                    @change="${(x, c) =>
                                        x.handleInputChange("padding-right", c.event)}"
                                ></fast-tooling-units-text-field>
                            </div>
                            <div class="item item-bottom">
                                <fast-tooling-units-text-field
                                    id="padding-bottom"
                                    class="item-text"
                                    title="padding-bottom"
                                    tabindex="12"
                                    :value="${x => x.uiValues.padding.bottom}"
                                    @change="${(x, c) =>
                                        x.handleInputChange("padding-bottom", c.event)}"
                                ></fast-tooling-units-text-field>
                            </div>
                        </div>
                    </div>
                    <div class="item item-right">
                        <fast-tooling-units-text-field
                            id="border-right-width"
                            class="item-text"
                            title="border-right-width"
                            tabindex="7"
                            :value="${x => x.uiValues.borderWidth.right}"
                            @change="${(x, c) =>
                                x.handleInputChange("border-right-width", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                    <div class="item item-bottom">
                        <fast-tooling-units-text-field
                            id="border-bottom-width"
                            class="item-text"
                            title="border-bottom-width"
                            tabindex="8"
                            :value="${x => x.uiValues.borderWidth.bottom}"
                            @change="${(x, c) =>
                                x.handleInputChange("border-bottom-width", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                </div>
            </div>
            <div class="item item-right">
                <fast-tooling-units-text-field
                    id="margin-right"
                    class="item-text"
                    title="margin-right"
                    tabindex="3"
                    :value="${x => x.uiValues.margin.right}"
                    @change="${(x, c) => x.handleInputChange("margin-right", c.event)}"
                ></fast-tooling-units-text-field>
            </div>
            <div class="item item-bottom">
                <fast-tooling-units-text-field
                    id="margin-bottom"
                    class="item-text"
                    title="margin-bottom"
                    tabindex="4"
                    :value="${x => x.uiValues.margin.bottom}"
                    @change="${(x, c) => x.handleInputChange("margin-bottom", c.event)}"
                ></fast-tooling-units-text-field>
            </div>
        </div>
    </template>
`;
