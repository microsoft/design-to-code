export interface MessageSystemServiceActionCallbackConfig {
    /**
     * The unique identifier
     */
    id: string;
}

export interface MessageSystemServiceActionCallback<TCallback>
    extends MessageSystemServiceActionCallbackConfig {
    /**
     * The action to take when the key values have been pressed
     */
    action: (config: TCallback) => void;
}

export type MessageSystemServiceActionConfig<
    TCallback,
    TOptions
> = MessageSystemServiceActionCallbackConfig &
    MessageSystemServiceActionCallback<TCallback> &
    TOptions;

/**
 * This abstract class is for actions intended to be part
 * of a registered class
 *
 * It takes three generics, TCallback, an object which is added to the
 * MessageSystemServiceActionCallbackConfig and provided to the class constructor,
 * TMatch, a generic used for matching against to determine if the action should run,
 * and TOptions for additional options to be passed in the constructor.
 */
export abstract class MessageSystemServiceAction<
    TCallback = {},
    TMatch = {},
    TOptions = {}
> {
    private action: (
        config: TCallback & MessageSystemServiceActionCallbackConfig
    ) => void;
    public id: string;

    constructor(config: MessageSystemServiceActionConfig<TCallback, TOptions>) {
        this.id = config.id;
        this.action = config.action;
    }

    /**
     * Gets the action to be called
     */
    public getAction = (config: TCallback): (() => void) => {
        return (): void => {
            this.action({
                ...config,
                id: this.id,
            });
        };
    };

    /**
     * Tests to see if this matches a given condition
     */
    abstract matches(config: TMatch): boolean;
}
