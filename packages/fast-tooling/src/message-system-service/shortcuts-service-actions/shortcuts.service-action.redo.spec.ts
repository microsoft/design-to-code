import chai, { expect } from "chai";
import spies from "chai-spies";
import { Register } from "../../message-system/message-system.props";
import MessageSystem from "../../message-system/message-system";
import {
    MessageSystemHistoryTypeAction,
    MessageSystemNavigationTypeAction,
} from "../../message-system/message-system.utilities.props";
import { MessageSystemType } from "../../message-system/types";
import { Shortcuts } from "../shortcuts.service";
import { ShortcutsAction } from "../shortcuts.service-action";
import ShortcutsActionRedo from "./shortcuts.service-action.redo";
import dataDictionary from "./__test__/data-dictionary";
import schemaDictionary from "./__test__/schema-dictionary";

chai.use(spies);

/**
 * These tests rely on some async functionality.
 * They are therefore not included with the rest of the coverage
 * and should be run only locally when making changes to the MonacoAdapter service.
 *
 * TODO: enable these tests #4602
 */
/* eslint-disable @typescript-eslint/no-empty-function */
xdescribe("ShortcutsActionRedo", () => {
    it("should return an instance of a ShortcutAction", () => {
        expect(
            ShortcutsActionRedo(new MessageSystem({ webWorker: "" })) instanceof
                ShortcutsAction
        ).to.equal(true);
    });
    it("should should return the result of the next message to be sent", () => {
        const inputElement = document.createElement("input");
        let callbackArgs = null;
        const postMessageCallback: any = chai.spy((config: any) => {
            callbackArgs = config;
        });
        const messageSystem = new MessageSystem({
            webWorker: "",
            dataDictionary,
            schemaDictionary,
        });
        messageSystem.postMessage = postMessageCallback;

        const shortcutsService = new Shortcuts({
            messageSystem: messageSystem,
            target: inputElement,
            actions: [ShortcutsActionRedo(messageSystem)],
        });

        messageSystem["register"].forEach((registeredItem: Register) => {
            registeredItem.onMessage({
                data: {
                    type: MessageSystemType.navigation,
                    action: MessageSystemNavigationTypeAction.update,
                    activeDictionaryId: "text",
                },
            } as any);
        });
        messageSystem["register"].forEach((registeredItem: Register) => {
            registeredItem.onMessage({
                data: {
                    type: MessageSystemType.history,
                    action: MessageSystemHistoryTypeAction.previous,
                },
            } as any);
        });

        expect(postMessageCallback).to.have.been.called.exactly(0);

        shortcutsService["dataDictionary"] = dataDictionary;
        shortcutsService["activeDictionaryId"] = "text";

        const keyboardEvent = new KeyboardEvent("keydown", {
            ctrlKey: true,
            shiftKey: true,
            key: "z",
        });
        inputElement.dispatchEvent(keyboardEvent);

        expect(postMessageCallback).to.have.been.called.exactly(1);
    });
});
