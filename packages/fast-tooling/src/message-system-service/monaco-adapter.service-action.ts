import { MessageSystemType } from "../message-system";
import { MessageSystemServiceAction } from "./message-system.service-action";

export interface MonacoAdapterActionCallbackConfig {
    /**
     * Retrieve the Monaco Model value
     */
    getMonacoModelValue: () => string[];

    /**
     * Update the Monaco Model value
     */
    updateMonacoModelValue: (value: string[], isExternal: boolean) => void;

    /**
     * The message system type to run on
     */
    messageSystemType: MessageSystemType;
}

/**
 * Actions for the monaco adapter
 */
export class MonacoAdapterAction extends MessageSystemServiceAction<
    MonacoAdapterActionCallbackConfig,
    MessageSystemType
> {
    private getMonacoModelValue: () => string[];
    private updateMonacoModelValue: (value: string[], isExternal: boolean) => void;
    private messageSystemType: MessageSystemType;

    constructor(config) {
        super(config);

        this.messageSystemType = config.messageSystemType;
    }

    /**
     * Invokes the action
     */
    public invoke = (): void => {
        this.getAction({
            getMonacoModelValue: this.getMonacoModelValue,
            updateMonacoModelValue: this.updateMonacoModelValue,
            messageSystemType: this.messageSystemType,
        })();
    };

    /**
     * Retrieve callbacks from parent adapter
     */
    public addConfig(config: MonacoAdapterActionCallbackConfig): void {
        this.getMonacoModelValue = config.getMonacoModelValue;
        this.updateMonacoModelValue = config.updateMonacoModelValue;
        this.messageSystemType = config.messageSystemType;
    }

    /**
     * Retrieve the message system type for this action
     */
    public getMessageSystemType(): MessageSystemType {
        return this.messageSystemType;
    }

    matches = (type: MessageSystemType) => {
        return this.messageSystemType === type;
    };
}
