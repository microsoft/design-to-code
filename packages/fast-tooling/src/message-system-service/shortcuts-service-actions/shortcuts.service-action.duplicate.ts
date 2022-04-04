import { ShortcutsAction } from "../shortcuts.service-action.js";
import {
    MessageSystem,
    MessageSystemDataTypeAction,
    MessageSystemType,
} from "../../message-system";
import { shortcutsId } from "../shortcuts.service.js";
import { AddLinkedDataDataMessageIncoming } from "../../message-system/message-system.utilities.props.js";

/**
 * @alpha
 */
export default function ShortcutsActionDuplicate(
    messageSystem: MessageSystem
): ShortcutsAction {
    return new ShortcutsAction({
        id: "duplicate",
        name: "Duplicate",
        keys: [
            {
                ctrlKey: true,
            },
            {
                value: "d",
            },
        ],
        action: config => {
            if (config?.dataDictionary?.[0]?.[config?.activeDictionaryId]?.parent.id) {
                messageSystem.postMessage({
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.addLinkedData,
                    dictionaryId:
                        config.dataDictionary[0][config.activeDictionaryId].parent.id,
                    dataLocation:
                        config.dataDictionary[0][config.activeDictionaryId].parent
                            .dataLocation,
                    linkedData: [config.dataDictionary[0][config.activeDictionaryId]],
                    options: {
                        originatorId: shortcutsId,
                    },
                } as AddLinkedDataDataMessageIncoming);
            }
        },
    });
}
