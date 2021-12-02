import chai, { expect } from "chai";
import spies from "chai-spies";
import { Register } from "../../message-system/message-system.props";
import MessageSystem from "../../message-system/message-system";
import {
    MessageSystemDataTypeAction,
    MessageSystemNavigationDictionaryTypeAction,
} from "../../message-system/message-system.utilities.props";
import { MessageSystemType } from "../../message-system/types";
import { Shortcuts } from "../shortcuts.service";
import { ShortcutsAction } from "../shortcuts.service-action";
import ShortcutsActionDelete from "./shortcuts.service-action.delete";
import dataDictionary from "./__test__/data-dictionary";
import schemaDictionary from "./__test__/schema-dictionary";

chai.use(spies);

/* eslint-disable @typescript-eslint/no-empty-function */
describe("ShortcutsActionDelete", () => {
    it("should return an instance of a ShortcutAction", () => {
        expect(
            ShortcutsActionDelete(new MessageSystem({ webWorker: "" })) instanceof
                ShortcutsAction
        ).to.be.true;
    });
    it("should call an event to delete the active dictionary ID item when the keyboard event is used", () => {
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
        messageSystem["register"].forEach((registeredItem: Register) => {
            registeredItem.onMessage({
                data: {
                    type: MessageSystemType.navigationDictionary,
                    action: MessageSystemNavigationDictionaryTypeAction.updateActiveId,
                    activeDictionaryId: "text",
                },
            } as any);
        });

        new Shortcuts({
            messageSystem: messageSystem,
            target: inputElement,
            actions: [ShortcutsActionDelete(messageSystem)],
        });

        expect(postMessageCallback).to.have.been.called.exactly(0);

        const keyboardEvent = new KeyboardEvent("keydown", {
            key: "Delete",
        });
        inputElement.dispatchEvent(keyboardEvent);

        expect(postMessageCallback).to.have.been.called.exactly(1);
        expect(callbackArgs.type).to.equal(MessageSystemType.data);
        expect(callbackArgs.action).to.equal(
            MessageSystemDataTypeAction.removeLinkedData
        );
    });
});
