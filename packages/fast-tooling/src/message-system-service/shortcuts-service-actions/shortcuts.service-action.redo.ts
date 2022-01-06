import { ShortcutsAction } from "../shortcuts.service-action";
import { MessageSystem, MessageSystemType } from "../../message-system";
import { shortcutsId } from "../shortcuts.service";
import { MessageSystemHistoryTypeAction } from "../../message-system/message-system.utilities.props";

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
                value: "z",
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
