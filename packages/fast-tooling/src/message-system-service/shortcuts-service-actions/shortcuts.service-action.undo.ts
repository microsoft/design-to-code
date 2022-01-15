import { ShortcutsAction } from "../shortcuts.service-action";
import { MessageSystem, MessageSystemType } from "../../message-system";
import { shortcutsId } from "../shortcuts.service";
import { MessageSystemHistoryTypeAction } from "../../message-system/message-system.utilities.props";

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
