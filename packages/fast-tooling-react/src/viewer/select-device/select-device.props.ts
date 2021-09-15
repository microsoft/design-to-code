import { ManagedClasses } from "@microsoft/fast-components-class-name-contracts-base";
import { Device } from "./devices";
import { SelectDeviceClassNameContract } from "./select-device.class-name-contract";

export type SelectDeviceManagedClasses = ManagedClasses<SelectDeviceClassNameContract>;
export type SelectDeviceUnhandledProps = React.AllHTMLAttributes<HTMLElement>;
export interface SelectDeviceHandledProps extends SelectDeviceManagedClasses {
    /**
     * The label for the select
     */
    label?: string;

    /**
     * The disabled state for the select
     */
    disabled?: boolean;

    /**
     * The list of devices to use as options
     */
    devices: Device[];

    /**
     * The active device
     */
    activeDeviceId: string;

    /**
     * The update device event handler
     */
    onUpdateDevice: (id: string) => void;
}

export type SelectDeviceProps = SelectDeviceUnhandledProps & SelectDeviceHandledProps;
