import { ShortcutsAction } from "../shortcuts.service-action.js";
import { MessageSystem, MessageSystemType } from "../../message-system/index.js";
import { shortcutsId } from "../shortcuts.service.js";
import { MessageSystemHistoryTypeAction } from "../../message-system/message-system.utilities.props.js";

/**
 * @alpha
 */
export default function ShortcutsActionUndo(
    messageSystem: MessageSystem
): ShortcutsAction {
    return new ShortcutsAction({
        id: "undo",
        name: "Undo",
        keys: [
            {
                ctrlKey: true,
            },
            {
                value: "z",
            },
        ],
        action: config => {
            messageSystem.postMessage({
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.previous,
                options: {
                    originatorId: shortcutsId,
                },
            });
        },
    });
}
