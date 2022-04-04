import { ShortcutsAction } from "../shortcuts.service-action.js";
import { MessageSystem, MessageSystemType } from "../../message-system/index.js";
import { shortcutsId } from "../shortcuts.service.js";
import { MessageSystemHistoryTypeAction } from "../../message-system/message-system.utilities.props.js";

/**
 * @alpha
 */
export default function ShortcutsActionRedo(
    messageSystem: MessageSystem
): ShortcutsAction {
    return new ShortcutsAction({
        id: "redo",
        name: "Redo",
        keys: [
            {
                ctrlKey: true,
            },
            {
                shiftKey: true,
            },
            {
                value: "Z",
            },
        ],
        action: config => {
            messageSystem.postMessage({
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.next,
                options: {
                    originatorId: shortcutsId,
                },
            });
        },
    });
}
