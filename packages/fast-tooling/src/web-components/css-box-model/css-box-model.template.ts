import { html } from "@microsoft/fast-element";
import { ElementDefinitionContext } from "@microsoft/fast-foundation";
import { CSSBoxModel } from "./css-box-model";

const sidesButton = html`
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5 1H11V2H5V1Z" />
        <path d="M14 5H15V11H14V5Z" />
        <path d="M1 5H2V11H1V5Z" />
        <path d="M5 14H11V15H5V14Z" />
    </svg>
`;

/**
 * The template for the box-model component.
 * @public
 */
export const cssBoxModelTemplate = (context: ElementDefinitionContext) => html<
    CSSBoxModel
>`
    <template>
        <div class="section">
            <label for="margin" class="section_label">Margin</label>
            <br />
            <div
                class="${x =>
                    x.marginOpen ? "singleInput singleInput_hidden" : "singleInput"}"
            >
                <fast-tooling-units-text-field
                    id="margin"
                    title="margin"
                    tabindex="1"
                    :value="${x => x.uiValues.margin.getCSSShorthandFourValues()}"
                    @change="${(x, c) => x.handleInputChange("margin", c.event)}"
                ></fast-tooling-units-text-field>
                <fast-button
                    appearance="stealth"
                    class="sideButton"
                    @click="${(x, c) => x.handleOpenButtonClick("marginOpen")}"
                >
                    ${sidesButton}
                </fast-button>
            </div>
            <div class="${x => (x.marginOpen ? "grid" : "grid grid_hidden")}">
                <div class="item item-top">
                    <fast-tooling-units-text-field
                        id="margin-top"
                        title="margin-top"
                        tabindex="2"
                        :value="${x => x.uiValues.margin.top}"
                        @change="${(x, c) => x.handleInputChange("margin-top", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-topRight">
                    <fast-button
                        appearance="stealth"
                        class="sideButton sideButton_active"
                        @click="${(x, c) => x.handleOpenButtonClick("marginOpen")}"
                    >
                        ${sidesButton}
                    </fast-button>
                </div>
                <div class="item item-left">
                    <fast-tooling-units-text-field
                        id="margin-left"
                        title="margin-left"
                        tabindex="3"
                        :value="${x => x.uiValues.margin.left}"
                        @change="${(x, c) => x.handleInputChange("margin-left", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-right">
                    <fast-tooling-units-text-field
                        id="margin-right"
                        title="margin-right"
                        tabindex="4"
                        :value="${x => x.uiValues.margin.right}"
                        @change="${(x, c) =>
                            x.handleInputChange("margin-right", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-bottom">
                    <fast-tooling-units-text-field
                        id="margin-bottom"
                        title="margin-bottom"
                        tabindex="5"
                        :value="${x => x.uiValues.margin.bottom}"
                        @change="${(x, c) =>
                            x.handleInputChange("margin-bottom", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
            </div>
        </div>
        <br />
        <div class="section">
            <label for="border" class="section_label">Border Width</label>
            <div
                class="${x =>
                    x.borderOpen ? "singleInput singleInput_hidden" : "singleInput"}"
            >
                <fast-tooling-units-text-field
                    id="border"
                    title="border-width"
                    tabindex="6"
                    :value="${x => x.uiValues.borderWidth.getCSSShorthandFourValues()}"
                    @change="${(x, c) => x.handleInputChange("border-width", c.event)}"
                ></fast-tooling-units-text-field>
                <fast-button
                    appearance="stealth"
                    class="sideButton"
                    @click="${(x, c) => x.handleOpenButtonClick("borderOpen")}"
                >
                    ${sidesButton}
                </fast-button>
            </div>
            <div class="${x => (x.borderOpen ? "grid" : "grid grid_hidden")}">
                <div class="item item-top">
                    <fast-tooling-units-text-field
                        id="border-top-width"
                        title="border-top-width"
                        tabindex="7"
                        :value="${x => x.uiValues.borderWidth.top}"
                        @change="${(x, c) =>
                            x.handleInputChange("border-top-width", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-topRight">
                    <fast-button
                        appearance="stealth"
                        class="sideButton sideButton_active"
                        @click="${(x, c) => x.handleOpenButtonClick("borderOpen")}"
                    >
                        ${sidesButton}
                    </fast-button>
                </div>
                <div class="item item-left">
                    <fast-tooling-units-text-field
                        id="border-left-width"
                        title="border-left-width"
                        tabindex="8"
                        :value="${x => x.uiValues.borderWidth.left}"
                        @change="${(x, c) =>
                            x.handleInputChange("border-left-width", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-right">
                    <fast-tooling-units-text-field
                        id="border-right-width"
                        title="border-right-width"
                        tabindex="9"
                        :value="${x => x.uiValues.borderWidth.right}"
                        @change="${(x, c) =>
                            x.handleInputChange("border-right-width", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-bottom">
                    <fast-tooling-units-text-field
                        id="border-bottom-width"
                        title="border-bottom-width"
                        tabindex="10"
                        :value="${x => x.uiValues.borderWidth.bottom}"
                        @change="${(x, c) =>
                            x.handleInputChange("border-bottom-width", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
            </div>
        </div>
        <br />
        <div class="section">
            <label for="padding" class="section_label">Padding</label>
            <div
                class="${x =>
                    x.paddingOpen ? "singleInput singleInput_hidden" : "singleInput"}"
            >
                <fast-tooling-units-text-field
                    id="padding"
                    title="padding"
                    tabindex="11"
                    :value="${x => x.uiValues.padding.getCSSShorthandFourValues()}"
                    @change="${(x, c) => x.handleInputChange("padding", c.event)}"
                ></fast-tooling-units-text-field>
                <fast-button
                    appearance="stealth"
                    class="sideButton"
                    @click="${(x, c) => x.handleOpenButtonClick("paddingOpen")}"
                >
                    ${sidesButton}
                </fast-button>
            </div>
            <div class="${x => (x.paddingOpen ? "grid" : "grid grid_hidden")}">
                <div class="item item-top">
                    <fast-tooling-units-text-field
                        id="padding-top"
                        title="padding-top"
                        tabindex="12"
                        :value="${x => x.uiValues.padding.top}"
                        @change="${(x, c) => x.handleInputChange("padding-top", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-topRight">
                    <fast-button
                        appearance="stealth"
                        class="sideButton sideButton_active"
                        @click="${(x, c) => x.handleOpenButtonClick("paddingOpen")}"
                    >
                        ${sidesButton}
                    </fast-button>
                </div>
                <div class="item item-left">
                    <fast-tooling-units-text-field
                        id="padding-left"
                        title="padding-left"
                        tabindex="13"
                        :value="${x => x.uiValues.padding.left}"
                        @change="${(x, c) =>
                            x.handleInputChange("padding-left", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-middle"></div>
                <div class="item item-right">
                    <fast-tooling-units-text-field
                        id="padding-right"
                        title="padding-right"
                        tabindex="14"
                        :value="${x => x.uiValues.padding.right}"
                        @change="${(x, c) =>
                            x.handleInputChange("padding-right", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
                <div class="item item-bottom">
                    <fast-tooling-units-text-field
                        id="padding-bottom"
                        title="padding-bottom"
                        tabindex="15"
                        :value="${x => x.uiValues.padding.bottom}"
                        @change="${(x, c) =>
                            x.handleInputChange("padding-bottom", c.event)}"
                    ></fast-tooling-units-text-field>
                </div>
            </div>
        </div>
        <br />
        <div class="section">
            <div class="grid grid-dimension">
                <div class="item">
                    <div class="dimension">
                        <label for="width" class="section_label">Width</label>
                        <br />
                        <fast-tooling-units-text-field
                            id="width"
                            title="width"
                            tabindex="16"
                            :value="${x => x.uiValues.width}"
                            @change="${(x, c) => x.handleInputChange("width", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                </div>
                <div class="item">
                    <div class="dimension">
                        <label for="height" class="section_label">Height</label>
                        <br />
                        <fast-tooling-units-text-field
                            id="height"
                            title="height"
                            tabindex="17"
                            :value="${x => x.uiValues.height}"
                            @change="${(x, c) => x.handleInputChange("height", c.event)}"
                        ></fast-tooling-units-text-field>
                    </div>
                </div>
            </div>
        </div>
    </template>
`;
