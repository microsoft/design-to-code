import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { html_beautify } from "vscode-html-languageservice/lib/esm/beautify/beautify-html";
import {
    MessageSystem,
    MessageSystemDataTypeAction,
    MessageSystemType,
} from "../../../src";
import {
    findDictionaryIdByMonacoEditorHTMLPosition,
    findMonacoEditorHTMLPositionByDictionaryId,
    mapDataDictionaryToMonacoEditorHTML,
} from "../../../src/data-utilities/monaco.js";
import { XOR } from "../../../src/data-utilities/type.utilities.js";
import {
    MonacoAdapter,
    monacoAdapterId,
} from "../../../src/message-system-service/monaco-adapter.service";
import { MonacoAdapterAction } from "../../../src/message-system-service/monaco-adapter.service-action.js";
import dataDictionaryConfig from "./data-dictionary-config.js";
import monacoEditorConfig from "./monaco-editor-config.js";
import schemaDictionary from "./schema-dictionary.js";

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const MessageSystemWorker = require("../../../dist/message-system.min.js");

document.body.setAttribute("style", "margin: 0");
const root = document.getElementById("root");
const setPosition = document.getElementById("setPosition");
const setPositionInput: HTMLSelectElement = document.getElementById(
    "setPositionValue"
) as HTMLSelectElement;
const currentDictionaryIdInput: HTMLInputElement = document.getElementById(
    "currentDictionaryId"
) as HTMLInputElement;
const currentPosition: HTMLInputElement = document.getElementById(
    "currentPosition"
) as HTMLInputElement;
root.setAttribute("style", "height: 100vh");
const textInput = document.getElementById("foo") as HTMLInputElement;
const boolInput = document.getElementById("bar") as HTMLInputElement;

const fastMessageSystemWorker = new MessageSystemWorker();
let monacoValue = [];
let monacoEditorModel;
let fastMessageSystem: MessageSystem;
let dataDictionary;

function updateFormInputs() {
    textInput.value = dataDictionary[0][dataDictionary[1]].data.foo;
    boolInput.checked = dataDictionary[0][dataDictionary[1]].data.bar;
}

function updateMonacoEditor() {
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    editor.setValue(
        html_beautify(
            mapDataDictionaryToMonacoEditorHTML(dataDictionary, schemaDictionary)
        )
    );
}

function handleMessageSystem(e: MessageEvent) {
    if (e.data) {
        if (e.data.type === MessageSystemType.initialize) {
            dataDictionary = e.data.dataDictionary;

            if (e.data.options && e.data.options.originatorId === monacoAdapterId) {
                updateFormInputs();
            } else {
                updateFormInputs();
                updateMonacoEditor();
            }
        }

        if (e.data.type === MessageSystemType.data) {
            dataDictionary = e.data.dataDictionary;

            updateFormInputs();
            updateMonacoEditor();
        }
    }
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
}

const adapter = new MonacoAdapter({
    messageSystem: fastMessageSystem,
    actions: [
        new MonacoAdapterAction({
            id: "monaco.setValue",
            action: config => {
                // trigger an update to the monaco value that
                // also updates the DataDictionary which fires a
                // postMessage to the MessageSystem
                config.updateMonacoModelValue(
                    [html_beautify(monacoValue.join(""))],
                    true
                );
            },
        }),
        new MonacoAdapterAction({
            id: "monaco.setPosition",
            action: config => {
                editor.setPosition(config.updateMonacoModelPosition());
            },
        }),
    ],
});

monaco.editor.onDidCreateModel((listener: monaco.editor.ITextModel) => {
    monacoEditorModel = monaco.editor.getModel(listener.uri) as monaco.editor.ITextModel;

    let firstRun = true;
    monacoEditorModel.onDidChangeContent((e: monaco.editor.IModelContentChangedEvent) => {
        /**
         * Sets the value to be used by monaco
         */
        const modelValue = monacoEditorModel.getValue();
        monacoValue = Array.isArray(modelValue) ? modelValue : modelValue.split("\n");

        if (!firstRun) {
            adapter.action("monaco.setValue").run();
        }

        firstRun = false;
    });
});

const editor = monaco.editor.create(root, monacoEditorConfig as any);

enum PositionInHTML {
    top = "top",
    middle = "middle",
    bottom = "bottom",
}

/**
 * When cursor position changed, fire an event that will update the active dictionary id after identifying from the event
 * where the dictionary id is, this should not affect the monaco editor motion as this is an external event
 */
editor.onDidChangeCursorPosition((e: monaco.editor.ICursorPositionChangedEvent): void => {
    if (monacoValue?.length) {
        const dictionaryId = findDictionaryIdByMonacoEditorHTMLPosition(
            e.position,
            dataDictionary,
            schemaDictionary,
            monacoValue
        );
        currentDictionaryIdInput.value = dictionaryId;
        currentPosition.value = JSON.stringify(e.position);
    } else {
        currentDictionaryIdInput.value = dataDictionary[1];
        currentPosition.value = JSON.stringify({
            lineNumber: 1,
            column: 1,
        });
    }
});

/**
 * Set the position to an active dictionary id
 */
setPosition.addEventListener("click", (e: MouseEvent) => {
    e.preventDefault();

    const value: PositionInHTML =
        (setPositionInput.value as XOR<PositionInHTML, void>) || PositionInHTML.bottom;

    switch (value) {
        case PositionInHTML.top:
            // set position to active dictionary id div1
            currentDictionaryIdInput.value = "div1";
            break;
        case PositionInHTML.middle:
            // set position to active dictionary id div10
            currentDictionaryIdInput.value = "div10";
            break;
        case PositionInHTML.bottom:
            // set position to active dictionary id div20
            currentDictionaryIdInput.value = "div20";
            break;
    }

    const changeEvent = new Event("change");
    currentDictionaryIdInput.dispatchEvent(changeEvent);
});

currentDictionaryIdInput.addEventListener("change", (e: Event) => {
    const position = findMonacoEditorHTMLPositionByDictionaryId(
        (e.target as HTMLInputElement).value,
        dataDictionary,
        schemaDictionary,
        monacoValue
    );
    editor.setPosition(position);

    editor.revealPositionInCenter(position, 0); // 0 means smooth scroll
});

function handleTextInputOnKeyUp() {
    fastMessageSystem.postMessage({
        type: MessageSystemType.data,
        action: MessageSystemDataTypeAction.update,
        dataLocation: "foo",
        data: textInput.value,
    });
}

function handleBooleanInputOnChange() {
    fastMessageSystem.postMessage({
        type: MessageSystemType.data,
        action: MessageSystemDataTypeAction.update,
        dataLocation: "bar",
        data: boolInput.checked,
    });
}

textInput.addEventListener("keyup", handleTextInputOnKeyUp);
boolInput.addEventListener("change", handleBooleanInputOnChange);
