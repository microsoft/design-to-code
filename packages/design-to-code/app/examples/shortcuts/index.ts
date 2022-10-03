import {
    MessageSystem,
    MessageSystemType,
    MessageSystemNavigationTypeAction,
    ShortcutsActionDelete,
    ShortcutsActionDuplicate,
    ShortcutsActionUndo,
    ShortcutsActionRedo,
} from "../../../src";
import { Shortcuts } from "../../../src/message-system-service/shortcuts.service.js";
import dataDictionaryConfig from "./data-dictionary-config.js";
import schemaDictionary from "./schema-dictionary.js";

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const MessageSystemWorker = require("../../../dist/message-system.min.js");
const dataElement = document.getElementById("data");
const inputElement = document.getElementById("input");
const activeIdElement = document.getElementById("activeid");
document.body.setAttribute("style", "margin: 0");

/* eslint-disable @typescript-eslint/no-unused-vars */
const fastMessageSystemWorker = new MessageSystemWorker();
let fastMessageSystem: MessageSystem;
let fastShortcuts: Shortcuts;
let dataDictionary;

function handleMessageSystem(e: MessageEvent) {
    if (e.data) {
        if (e.data.type !== MessageSystemType.custom) {
            activeIdElement.innerHTML = e.data.activeDictionaryId;
        }

        if (
            e.data.type === MessageSystemType.initialize ||
            e.data.type === MessageSystemType.data
        ) {
            dataDictionary = e.data.dataDictionary;
            dataElement.innerHTML = JSON.stringify(dataDictionary, null, 2);
        }

        if (e.data.type === MessageSystemType.initialize) {
            inputElement.removeAttribute("disabled");
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
    fastMessageSystem.postMessage({
        type: MessageSystemType.navigation,
        action: MessageSystemNavigationTypeAction.update,
        activeDictionaryId: "text",
        activeNavigationConfigId: "",
    });

    fastShortcuts = new Shortcuts({
        messageSystem: fastMessageSystem,
        target: inputElement,
        actions: [
            ShortcutsActionDelete(fastMessageSystem),
            ShortcutsActionDuplicate(fastMessageSystem),
            ShortcutsActionRedo(fastMessageSystem),
            ShortcutsActionUndo(fastMessageSystem),
        ],
    });
}
