import React from "react";
import manageJss, { ManagedJSSProps } from "@microsoft/fast-jss-manager-react";
import { ManagedClasses } from "@microsoft/fast-components-class-name-contracts-base";
import { classNames, format } from "@microsoft/fast-web-utilities";
import styles, {
    SectionLinkControlClassNameContract,
} from "./control.section-link.style";
import { SectionLinkControlProps } from "./control.section-link.props";
import { isDefault } from "./utilities/form";

/**
 * Form control definition
 */
class SectionLinkControl extends React.Component<
    SectionLinkControlProps & ManagedClasses<SectionLinkControlClassNameContract>,
    {}
> {
    public static displayName: string = "SectionLinkControl";

    public static defaultProps: Partial<
        SectionLinkControlProps & ManagedClasses<SectionLinkControlClassNameContract>
    > = {
        managedClasses: {},
    };

    public render(): React.ReactNode {
        const {
            sectionLinkControl,
            sectionLinkControl__disabled,
            sectionLinkControl__default,
            sectionLinkControl__invalid,
        }: SectionLinkControlClassNameContract = this.props.managedClasses;

        return (
            <a
                className={classNames(
                    sectionLinkControl,
                    [sectionLinkControl__disabled, this.props.disabled],
                    [sectionLinkControl__invalid, this.props.invalidMessage !== ""],
                    [
                        sectionLinkControl__default,
                        isDefault(this.props.value, this.props.default),
                    ]
                )}
                onClick={this.handleUpdateSection}
            >
                {format(this.props.strings.sectionLinkEditLabel, this.props.label)}
            </a>
        );
    }

    private handleUpdateSection = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        this.props.onUpdateSection(
            this.props.dictionaryId,
            this.props.navigationConfigId
        );
    };
}

export { SectionLinkControl };
export default manageJss(styles)(SectionLinkControl);
