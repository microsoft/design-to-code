import { get, set, uniqueId } from "lodash-es";
import { getDataWithDuplicate } from "../data-utilities/duplicate";
import {
    getDataUpdatedWithoutSourceData,
    getDataUpdatedWithSourceData,
    getNextActiveParentDictionaryId,
} from "../data-utilities/relocate";
import { XOR } from "../data-utilities/type.utilities";
import { getLinkedDataDictionary, getLinkedDataList } from "./data";
import { MessageSystemType } from "./types";
import {
    CustomMessage,
    DataDictionaryMessageIncoming,
    DataDictionaryMessageOutgoing,
    DataMessageIncoming,
    DataMessageOutgoing,
    ErrorMessageOutgoing,
    HistoryMessageIncoming,
    HistoryMessageOutgoing,
    InitializeMessageOutgoing,
    InternalMessageSystemIncoming,
    InternalMessageSystemOutgoing,
    InternalOutgoingMessage,
    MessageSystemDataDictionaryTypeAction,
    MessageSystemDataTypeAction,
    MessageSystemHistoryTypeAction,
    MessageSystemIncoming,
    MessageSystemNavigationDictionaryTypeAction,
    MessageSystemNavigationTypeAction,
    MessageSystemSchemaDictionaryTypeAction,
    MessageSystemValidationTypeAction,
    NavigationDictionaryMessageIncoming,
    NavigationDictionaryMessageOutgoing,
    NavigationMessageIncoming,
    NavigationMessageOutgoing,
    SchemaDictionaryMessageIncoming,
    SchemaDictionaryMessageOutgoing,
    ValidationMessageIncoming,
    ValidationMessageOutgoing,
} from "./message-system.utilities.props";
import { getNavigationDictionary } from "./navigation";
import { NavigationConfigDictionary } from "./navigation.props";
import { DataDictionary, LinkedData } from "./data.props";
import { defaultHistoryLimit } from "./history";
import { History } from "./history.props";
import { SchemaDictionary } from "./schema.props";
import { Validation } from "./validation.props";
import { removeRootDataNodeErrorMessage } from "./errors";

/**
 * The default name that the display text maps to
 */
export const dataSetName: string = "data-fast-tooling-name";

/**
 * This is the Message System, through which:
 * - Data manipulation may be performed
 * - Navigation will be updated
 *
 * The main purpose of this is to tie together
 * process heavy actions onto a separate thread,
 * as well as to allow services to opt into a
 * single source for data updates.
 */

const history: History = {
    items: [],
    limit: defaultHistoryLimit,
};
let activeHistoryIndex: number = 0;
let dataDictionary: DataDictionary<unknown>;
let navigationDictionary: NavigationConfigDictionary;
let activeNavigationConfigId: string;
let activeDictionaryId: string; // this controls both the data and navigation dictionaries which must remain in sync
let schemaDictionary: SchemaDictionary;
const validation: Validation = {};

/**
 * Handles all custom messages
 */
function getCustomMessage<C, OConfig>(
    data: CustomMessage<C, OConfig>
): CustomMessage<C, OConfig> {
    return data;
}

/**
 * Handles all validation messages
 */
function getValidationMessage(
    data: ValidationMessageIncoming,
    historyId: string
): ValidationMessageOutgoing {
    switch (data.action) {
        case MessageSystemValidationTypeAction.update:
            validation[data.dictionaryId] = data.validationErrors;

            return {
                type: MessageSystemType.validation,
                action: MessageSystemValidationTypeAction.update,
                activeDictionaryId: data.dictionaryId,
                dictionaryId: data.dictionaryId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                validation,
                validationErrors: data.validationErrors,
                options: data.options,
            };
        case MessageSystemValidationTypeAction.get:
            return {
                type: MessageSystemType.validation,
                action: MessageSystemValidationTypeAction.get,
                activeDictionaryId: data.dictionaryId,
                dictionaryId: data.dictionaryId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                validation,
                validationErrors: validation[data.dictionaryId],
                options: data.options,
            };
    }
}

/**
 * Handles all data dictionary messages
 */
function getDataDictionaryMessage(
    data: DataDictionaryMessageIncoming,
    historyId: string
): DataDictionaryMessageOutgoing {
    switch (data.action) {
        case MessageSystemDataDictionaryTypeAction.get:
            return {
                type: MessageSystemType.dataDictionary,
                action: MessageSystemDataDictionaryTypeAction.get,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemDataDictionaryTypeAction.updateActiveId:
            activeDictionaryId = data.activeDictionaryId;

            return {
                type: MessageSystemType.dataDictionary,
                action: MessageSystemDataDictionaryTypeAction.updateActiveId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
    }
}

/**
 * Handles all navigation dictionary messages
 */
function getNavigationDictionaryMessage(
    data: NavigationDictionaryMessageIncoming,
    historyId: string
): NavigationDictionaryMessageOutgoing {
    switch (data.action) {
        case MessageSystemNavigationDictionaryTypeAction.get:
            return {
                type: MessageSystemType.navigationDictionary,
                action: MessageSystemNavigationDictionaryTypeAction.get,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemNavigationDictionaryTypeAction.updateActiveId:
            activeDictionaryId = data.activeDictionaryId;

            return {
                type: MessageSystemType.navigationDictionary,
                action: MessageSystemNavigationDictionaryTypeAction.updateActiveId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
    }
}

/**
 * Handles all history manipulation messages
 */
function getHistoryMessage(
    data: HistoryMessageIncoming,
    historyId: string
): HistoryMessageOutgoing {
    switch (data.action) {
        case MessageSystemHistoryTypeAction.get:
            return {
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.get,
                history,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
            };
    }
}

/**
 * Handles all schema dictionary manipulation messages
 */
function getSchemaDictionaryMessage(
    data: SchemaDictionaryMessageIncoming,
    historyId: string
): SchemaDictionaryMessageOutgoing {
    switch (data.action) {
        case MessageSystemSchemaDictionaryTypeAction.add:
            schemaDictionary = data.schemas.reduce(
                (previousSchemaDictionary, currentSchema) => {
                    return {
                        ...previousSchemaDictionary,
                        [currentSchema.$id]: currentSchema,
                    };
                },
                schemaDictionary
            );

            return {
                type: MessageSystemType.schemaDictionary,
                action: MessageSystemSchemaDictionaryTypeAction.add,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
            };
    }
}

/**
 * Handles all data manipulation messages
 */
function getDataMessage(
    data: DataMessageIncoming,
    historyId: string
): XOR<DataMessageOutgoing, ErrorMessageOutgoing> {
    switch (data.action) {
        case MessageSystemDataTypeAction.duplicate:
            dataDictionary[0][activeDictionaryId].data = getDataWithDuplicate(
                data.sourceDataLocation,
                dataDictionary[0][activeDictionaryId].data
            );
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.duplicate,
                sourceDataLocation: data.sourceDataLocation,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemDataTypeAction.remove:
            dataDictionary[0][activeDictionaryId].data = getDataUpdatedWithoutSourceData({
                sourceDataLocation: data.dataLocation,
                data: dataDictionary[0][activeDictionaryId].data,
            });
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.remove,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemDataTypeAction.add:
            dataDictionary[0][activeDictionaryId].data = getDataUpdatedWithSourceData({
                targetDataLocation: data.dataLocation,
                targetDataType: data.dataType,
                sourceData: data.data,
                data: dataDictionary[0][activeDictionaryId].data,
            });
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.add,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemDataTypeAction.update: {
            const dictionaryId: string =
                data.dictionaryId !== undefined ? data.dictionaryId : activeDictionaryId;

            if (data.dataLocation === "") {
                dataDictionary[0][dictionaryId].data = data.data;
            } else {
                set(
                    dataDictionary[0][dictionaryId].data as object,
                    data.dataLocation,
                    data.data
                );
            }

            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.update,
                data: dataDictionary[0][dictionaryId].data,
                navigation: navigationDictionary[0][dictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId,
                validation,
                options: data.options,
            };
        }
        case MessageSystemDataTypeAction.addLinkedData: {
            const addLinkedDataDictionaryId: string =
                typeof data.dictionaryId === "string"
                    ? data.dictionaryId
                    : activeDictionaryId;

            const updatedDataForDataDictionary = getLinkedDataDictionary({
                linkedData: data.linkedData,
                dictionaryId: addLinkedDataDictionaryId,
                dataLocation: data.dataLocation,
            });
            let currentLinkedDataRefs: LinkedData[] | void = get(
                dataDictionary[0][addLinkedDataDictionaryId].data,
                data.dataLocation
            );

            if (Array.isArray(currentLinkedDataRefs)) {
                if (typeof data.index === "number") {
                    currentLinkedDataRefs.splice(data.index, 0, {
                        id: updatedDataForDataDictionary.dataDictionary[1],
                    });
                } else {
                    currentLinkedDataRefs = currentLinkedDataRefs.concat([
                        {
                            id: updatedDataForDataDictionary.dataDictionary[1],
                        },
                    ]);
                }
            } else {
                currentLinkedDataRefs = [
                    {
                        id: updatedDataForDataDictionary.dataDictionary[1],
                    },
                ];
            }

            // update the data dictionary root dictionary id location with
            // the update linked data references
            set(
                dataDictionary[0][addLinkedDataDictionaryId].data as object,
                data.dataLocation,
                currentLinkedDataRefs
            );

            // update the data dictionary keys with the update data dictionary
            // of linked data items
            dataDictionary[0] = {
                ...dataDictionary[0],
                ...updatedDataForDataDictionary.dataDictionary[0],
            };

            // update the navigation dictionary
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.addLinkedData,
                dictionaryId: addLinkedDataDictionaryId,
                linkedDataIds: Object.keys(
                    updatedDataForDataDictionary.dataDictionary[0]
                ).map((dataDictionaryKey: string) => {
                    return { id: dataDictionaryKey };
                }),
                data: dataDictionary[0][addLinkedDataDictionaryId].data,
                navigation: navigationDictionary[0][addLinkedDataDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                validation,
                options: data.options,
            };
        }
        case MessageSystemDataTypeAction.removeLinkedData: {
            /**
             * The removal of linked data can be done in 3 different ways:
             *
             * 1. If the dictionary ID is provided, this is the parent
             * 2. If the dictionary ID is not provided, assume the active dictionary ID is the parent
             * 3. If the dictionary ID is not provided and the linked data is not provided, assume the
             *    active dictionary ID is the linked data to be removed and the parent is the active dictionary ID's parent
             * 4. If in the case of 3. the active dictionary ID has no parent (is the root ID), send an error message
             */
            enum ParentType {
                activeDictionaryId,
                activeDictionaryIdParent,
                suppliedDictionaryId,
            }

            const parentType: XOR<ParentType, null> = data.dictionaryId
                ? ParentType.suppliedDictionaryId
                : Array.isArray(data.linkedData)
                ? ParentType.activeDictionaryId
                : activeDictionaryId !== dataDictionary[1]
                ? ParentType.activeDictionaryIdParent
                : null;

            const linkedDataIds: string[] = [];
            let linkedDataParentDictionaryId: string;
            let linkedData: LinkedData[];
            let dataLocation: string;

            switch (parentType) {
                case ParentType.suppliedDictionaryId: {
                    linkedDataParentDictionaryId = data.dictionaryId;
                    linkedData = data.linkedData;
                    dataLocation = data.dataLocation;
                    break;
                }
                case ParentType.activeDictionaryId: {
                    linkedDataParentDictionaryId = activeDictionaryId;
                    linkedData = data.linkedData;
                    dataLocation = data.dataLocation;
                    break;
                }
                case ParentType.activeDictionaryIdParent: {
                    linkedDataParentDictionaryId =
                        dataDictionary[0][activeDictionaryId].parent.id;
                    linkedData = [{ id: activeDictionaryId }];
                    dataLocation =
                        dataDictionary[0][activeDictionaryId].parent.dataLocation;
                    break;
                }
                case null:
                    return {
                        type: MessageSystemType.error,
                        message: removeRootDataNodeErrorMessage,
                    };
            }

            const removedLinkedData: unknown =
                dataDictionary[0][linkedDataParentDictionaryId].data;

            // add linked data IDs to be removed
            linkedData.forEach((linkedDataItem: LinkedData) => {
                linkedDataIds.push(linkedDataItem.id);

                // add linked data IDs that are children of the linked data items being removed
                getLinkedDataList(dataDictionary, linkedDataItem.id).forEach(
                    (id: string) => {
                        linkedDataIds.push(id);
                    }
                );
            });

            // get the active dictionary ID in case it is among those being removed
            activeDictionaryId = getNextActiveParentDictionaryId(
                activeDictionaryId,
                linkedDataIds,
                dataDictionary
            );

            // remove linked data from the dictionary
            linkedDataIds.forEach((linkedDataId: string) => {
                delete dataDictionary[0][linkedDataId];
            });

            let filteredLinkedDataRefs: LinkedData[] = get(
                dataDictionary[0][linkedDataParentDictionaryId].data,
                dataLocation,
                []
            );

            // filter the linkedData in the item the linkedData are being removed from to not include
            // those that were just removed
            filteredLinkedDataRefs = filteredLinkedDataRefs.filter(
                (filteredLinkedDataRef: LinkedData) => {
                    return (
                        linkedData.findIndex((linkedDataItem: LinkedData) => {
                            return linkedDataItem.id === filteredLinkedDataRef.id;
                        }) === -1
                    );
                }
            );

            set(
                dataDictionary[0][linkedDataParentDictionaryId].data as object,
                dataLocation,
                filteredLinkedDataRefs
            );

            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.removeLinkedData,
                data: removedLinkedData,
                navigation: navigationDictionary[0][activeDictionaryId],
                linkedDataIds,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        }
        case MessageSystemDataTypeAction.reorderLinkedData:
            set(
                dataDictionary[0][activeDictionaryId].data as object,
                data.dataLocation,
                data.linkedData
            );

            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.reorderLinkedData,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
    }
}

function getNavigationMessage(
    data: NavigationMessageIncoming,
    historyId: string
): NavigationMessageOutgoing {
    switch (data.action) {
        case MessageSystemNavigationTypeAction.update:
            activeDictionaryId = data.activeDictionaryId;
            activeNavigationConfigId = data.activeNavigationConfigId;

            return {
                type: MessageSystemType.navigation,
                action: MessageSystemNavigationTypeAction.update,
                activeDictionaryId: data.activeDictionaryId,
                activeNavigationConfigId: data.activeNavigationConfigId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                schemaDictionary,
                historyId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemNavigationTypeAction.get:
            return {
                type: MessageSystemType.navigation,
                action: MessageSystemNavigationTypeAction.get,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
    }
}

function updateHistory<C>(data: MessageSystemIncoming<C>): string {
    const id = uniqueId();
    history.items.push({ data, id });
    const historyItemsLength = history.items.length;

    if (historyItemsLength > history.limit) {
        history.items.splice(0, historyItemsLength - history.limit);
    }

    if (activeHistoryIndex !== historyItemsLength) {
        activeHistoryIndex = historyItemsLength;
    }

    return id;
}

export function getMessage<C = {}>(
    data: InternalMessageSystemIncoming
): InternalMessageSystemOutgoing<C> {
    let historyId;

    if (data[0].type !== MessageSystemType.history) {
        historyId = updateHistory(data[0]);
    }

    switch (data[0].type) {
        case MessageSystemType.custom:
            return [
                getCustomMessage(data[0] as CustomMessage<C, {}>),
                data[1],
            ] as InternalOutgoingMessage<CustomMessage<C, {}>>;
        case MessageSystemType.data:
            return [
                getDataMessage(data[0] as DataMessageIncoming, historyId),
                data[1],
            ] as InternalOutgoingMessage<DataMessageOutgoing>;
        case MessageSystemType.dataDictionary:
            return [
                getDataDictionaryMessage(
                    data[0] as DataDictionaryMessageIncoming,
                    historyId
                ),
                data[1],
            ] as InternalOutgoingMessage<DataDictionaryMessageOutgoing>;
        case MessageSystemType.navigation:
            return [
                getNavigationMessage(data[0] as NavigationMessageIncoming, historyId),
                data[1],
            ] as InternalOutgoingMessage<NavigationMessageOutgoing>;
        case MessageSystemType.navigationDictionary:
            return [
                getNavigationDictionaryMessage(
                    data[0] as NavigationDictionaryMessageIncoming,
                    historyId
                ),
                data[1],
            ] as InternalOutgoingMessage<NavigationDictionaryMessageOutgoing>;
        case MessageSystemType.validation:
            return [
                getValidationMessage(data[0] as ValidationMessageIncoming, historyId),
                data[1],
            ] as InternalOutgoingMessage<ValidationMessageOutgoing>;
        case MessageSystemType.history:
            return [
                getHistoryMessage(
                    data[0] as HistoryMessageIncoming,
                    history.items?.[history.items.length - 1]?.id || undefined
                ),
                data[1],
            ];
        case MessageSystemType.schemaDictionary:
            return [
                getSchemaDictionaryMessage(
                    data[0] as SchemaDictionaryMessageIncoming,
                    historyId
                ),
                data[1],
            ];
        case MessageSystemType.initialize:
            /**
             * TODO: remove this ternary to rely on the dataDictionary
             * as data is @deprecated
             */
            dataDictionary = Array.isArray(data[0].dataDictionary)
                ? data[0].dataDictionary
                : data[0].data;
            activeDictionaryId =
                typeof data[0].dictionaryId === "string"
                    ? data[0].dictionaryId
                    : dataDictionary[1];
            schemaDictionary = data[0].schemaDictionary;
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );
            activeNavigationConfigId =
                navigationDictionary[0][navigationDictionary[1]][1];
            history.limit = data[0].historyLimit || defaultHistoryLimit;

            return [
                {
                    type: MessageSystemType.initialize,
                    data: dataDictionary[0][activeDictionaryId].data,
                    navigation: navigationDictionary[0][activeDictionaryId],
                    schema:
                        schemaDictionary[dataDictionary[0][activeDictionaryId].schemaId],
                    historyLimit: history.limit,
                    dataDictionary,
                    navigationDictionary,
                    activeHistoryIndex,
                    activeNavigationConfigId,
                    schemaDictionary,
                    historyId,
                    activeDictionaryId,
                    dictionaryId: activeDictionaryId,
                    validation,
                    options: data[0].options,
                },
                data[1],
            ] as InternalOutgoingMessage<InitializeMessageOutgoing>;
    }
}
