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
                    title="margin-top"
                    tabindex="1"
                    size="2"
                    :value="${x => x.uiValues.margin.top}"
                    @change="${(x, c) => x.handleInputChange("margin-top", c.event)}"
                ></fast-tooling-units-text-field>
            </div>
            <div class="item item-left">
                <fast-tooling-units-text-field
                    id="margin-left"
                    title="margin-left"
                    tabindex="2"
                    size="2"
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
                            title="border-top-width"
                            tabindex="5"
                            size="2"
                            :value="${x => x.uiValues.borderWidth.top}"
                            @change="${(x, c) =>
                                x.handleInputChange("border-top-width", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                    <div class="item item-left">
                        <fast-tooling-units-text-field
                            id="border-left-width"
                            title="border-left-width"
                            tabindex="6"
                            size="2"
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
                                    title="padding-top"
                                    tabindex="9"
                                    size="2"
                                    :value="${x => x.uiValues.padding.top}"
                                    @change="${(x, c) =>
                                        x.handleInputChange("padding-top", c.event)}"
                                ></fast-tooling-units-text-field>
                            </div>
                            <div class="item item-left">
                                <fast-tooling-units-text-field
                                    id="padding-left"
                                    title="padding-left"
                                    tabindex="10"
                                    size="2"
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
                                            title="width"
                                            tabindex="13"
                                            size="2"
                                            :value="${x => x.uiValues.width}"
                                            @change="${(x, c) =>
                                                x.handleInputChange("width", c.event)}"
                                        ></fast-tooling-units-text-field>
                                    </div>
                                    <div class="item">x</div>
                                    <div class="item">
                                        <fast-tooling-units-text-field
                                            id="height"
                                            title="height"
                                            tabindex="14"
                                            size="2"
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
                                    title="padding-right"
                                    tabindex="11"
                                    size="2"
                                    :value="${x => x.uiValues.padding.right}"
                                    @change="${(x, c) =>
                                        x.handleInputChange("padding-right", c.event)}"
                                ></fast-tooling-units-text-field>
                            </div>
                            <div class="item item-bottom">
                                <fast-tooling-units-text-field
                                    id="padding-bottom"
                                    title="padding-bottom"
                                    tabindex="12"
                                    size="2"
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
                            title="border-right-width"
                            tabindex="7"
                            size="2"
                            :value="${x => x.uiValues.borderWidth.right}"
                            @change="${(x, c) =>
                                x.handleInputChange("border-right-width", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                    <div class="item item-bottom">
                        <fast-tooling-units-text-field
                            id="border-bottom-width"
                            title="border-bottom-width"
                            tabindex="8"
                            size="2"
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
                    title="margin-right"
                    tabindex="3"
                    size="2"
                    :value="${x => x.uiValues.margin.right}"
                    @change="${(x, c) => x.handleInputChange("margin-right", c.event)}"
                ></fast-tooling-units-text-field>
            </div>
            <div class="item item-bottom">
                <fast-tooling-units-text-field
                    id="margin-bottom"
                    title="margin-bottom"
                    tabindex="4"
                    size="2"
                    :value="${x => x.uiValues.margin.bottom}"
                    @change="${(x, c) => x.handleInputChange("margin-bottom", c.event)}"
                ></fast-tooling-units-text-field>
            </div>
        </div>
    </template>
`;
