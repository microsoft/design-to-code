import { DesignSystem, ElementDefinitionContext } from "@microsoft/fast-foundation";
import {
    MessageSystem,
    MessageSystemDataTypeAction,
    MessageSystemNavigationTypeAction,
    MessageSystemType,
} from "../../../src";
import { HTMLRender } from "../../../src/web-components/html-render/html-render.js";
import { htmlRenderComponent } from "../../../src/web-components/html-render/index.js";
import { htmlRenderLayerNavigationComponent } from "../../../src/web-components/html-render-layer-navigation/index.js";
import { htmlRenderLayerInlineEditComponent } from "../../../src/web-components/html-render-layer-inline-edit/index.js";
import { nativeElementDefinitions } from "../../../src/definitions/index.js";
import dataDictionaryConfig from "../../../src/__test__/html-render/data-dictionary-config.js";
import schemaDictionary from "../../../src/__test__/html-render/schema-dictionary.js";
import {
    ActivityType,
    HTMLRenderLayer,
} from "../../../src/web-components/html-render-layer/html-render-layer";
import { html, ViewTemplate } from "@microsoft/fast-element";

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const MessageSystemWorker = require("../../../dist/message-system.min.js");
document.body.setAttribute("style", "margin: 0");

export class HTMLRenderLayerTest extends HTMLRenderLayer {
    public layerActivityId: string = "testLayer";

    public elementActivity(
        layerActivityId: string,
        activityType: ActivityType,
        datadictionaryId: string,
        elementRef: HTMLElement
    ) {
        UpdateMessageContainer(`${activityType.toString()} ${datadictionaryId}`);
    }
}

export const htmlRenderLayerNavigationTemplate: (
    context: ElementDefinitionContext
) => ViewTemplate<HTMLRenderLayerTest> = context => html<HTMLRenderLayerTest>`
    <div id="testContainer"></div>
`;

const htmlRenderLayerTestComponent = HTMLRenderLayerTest.compose({
    baseName: "html-render-layer-test",
    template: htmlRenderLayerNavigationTemplate,
});

DesignSystem.getOrCreate()
    .withPrefix("dtc")
    .register(
        htmlRenderComponent(),
        htmlRenderLayerNavigationComponent(),
        htmlRenderLayerInlineEditComponent(),
        htmlRenderLayerTestComponent()
    );

const fastMessageSystemWorker = new MessageSystemWorker();
let fastMessageSystem: MessageSystem;

const htmlRender: HTMLRender = document.getElementById("htmlRender") as HTMLRender;
const button1: HTMLElement = document.getElementById("testbutton1");
const button2: HTMLElement = document.getElementById("testbutton2");
const messageContainer: HTMLElement = document.getElementById("messageContainer");

function handleMessageSystem(e: MessageEvent) {
    if (e.data) {
        if (
            e.data.type === MessageSystemType.initialize ||
            e.data.type === MessageSystemType.data
        ) {
            if (e.data.action === MessageSystemDataTypeAction.update) {
                UpdateMessageContainer(
                    `Inline Edit: ${e.data.dictionaryId} = ${e.data.data}`
                );
            }
        }

        if (e.data.type === MessageSystemType.initialize) {
            //            const config: any = fastMessageSystem.getConfigById(shortcutsId) as any;
        }
        if (
            e.data.type === MessageSystemType.navigation &&
            e.data.action === MessageSystemNavigationTypeAction.update &&
            e.data.activeNavigationConfigId !== "foo"
        ) {
            UpdateMessageContainer(`Navigation: ${e.data.activeDictionaryId}`);
        }
    }
}

function UpdateMessageContainer(text: string) {
    const span = document.createElement("span");
    span.innerHTML = text.trim();
    messageContainer.appendChild(span);
}

if ((window as any).Worker) {
    fastMessageSystem = new MessageSystem({
        webWorker: fastMessageSystemWorker,
        dataDictionary: dataDictionaryConfig as any,
        schemaDictionary,
    });
    fastMessageSystem.add({
        onMessage: handleMessageSystem,
    });
    htmlRender.markupDefinitions = Object.values(nativeElementDefinitions);
    htmlRender.messageSystem = fastMessageSystem;
    button1.onclick = () => {
        fastMessageSystem.postMessage({
            type: MessageSystemType.navigation,
            action: MessageSystemNavigationTypeAction.update,
            activeDictionaryId: "root",
            activeNavigationConfigId: "foo",
        });
    };
    button2.onclick = () => {
        fastMessageSystem.postMessage({
            type: MessageSystemType.navigation,
            action: MessageSystemNavigationTypeAction.update,
            activeDictionaryId: "span",
            activeNavigationConfigId: "foo",
        });
    };
}
