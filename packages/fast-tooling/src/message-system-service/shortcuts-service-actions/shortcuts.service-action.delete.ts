import { ShortcutsAction } from "../shortcuts.service-action";
import {
    MessageSystem,
    MessageSystemDataTypeAction,
    MessageSystemType,
} from "../../message-system";
import { shortcutsId } from "../shortcuts.service";

/**
 * @alpha
 */
export default function ShortcutsActionDelete(
    messageSystem: MessageSystem
): ShortcutsAction {
    return new ShortcutsAction({
        id: "delete",
        name: "Delete",
        keys: [
            {
                value: "Delete",
            },
        ],
        action: () => {
            messageSystem.postMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.removeLinkedData,
                options: {
                    originatorId: shortcutsId,
                },
            });
        },
    });
}
