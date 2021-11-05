import { observable } from "@microsoft/fast-element";
import {
    CSSDeclarationDictionary,
    mapCSSInlineStyleToCSSPropertyDictionary,
} from "../../data-utilities/mapping.mdn-data";
import { FormAssociatedCSSBoxModel } from "./css-box-model.form-associated";

/**
 * Regular expression for identifying the length part of a shorthand CSS statement.
 * i.e. It will match the "1px" part of "1px solid red".
 */
const cssLengthRegExp: RegExp = new RegExp(
    /^auto$|^thin$|^medium$|^thick$|^[+-]?[0-9]+\.?([0-9]+)?(ch|rem|vh|vw|vmin|vmax|px|em|ex|%|in|cm|mm|pt|pc)?$/
);

enum valueType {
    shorthandWithFourValues = "shorthand-with-four-values",
    oneValue = "one-value",
    shorthandWithMixedTypes = "shorthand-with-mixed-types",
    override = "override",
}

export enum expandableSection {
    margin = "marginOpen",
    border = "borderOpen",
    padding = "paddingOpen",
}

/**
 * Mapping of CSS style names to properties of the BoxModelValues class.
 */
const CSSToUIValueMapping = {
    width: [valueType.oneValue, "width"],
    height: [valueType.oneValue, "height"],
    margin: [valueType.shorthandWithFourValues, "margin"],
    "margin-top": [valueType.oneValue, "margin", "top"],
    "margin-bottom": [valueType.oneValue, "margin", "bottom"],
    "margin-left": [valueType.oneValue, "margin", "left"],
    "margin-right": [valueType.oneValue, "margin", "right"],
    padding: [valueType.shorthandWithFourValues, "padding"],
    "padding-top": [valueType.oneValue, "padding", "top"],
    "padding-bottom": [valueType.oneValue, "padding", "bottom"],
    "padding-left": [valueType.oneValue, "padding", "left"],
    "padding-right": [valueType.oneValue, "padding", "right"],
    border: [valueType.shorthandWithMixedTypes, "border"],
    "border-width": [valueType.shorthandWithFourValues, "borderWidth"],
    "border-top": [valueType.shorthandWithMixedTypes, "borderTop"],
    "border-top-width": [valueType.override, "borderWidth", "top"],
    "border-bottom": [valueType.shorthandWithMixedTypes, "borderBottom"],
    "border-bottom-width": [valueType.override, "borderWidth", "bottom"],
    "border-left": [valueType.shorthandWithMixedTypes, "borderLeft"],
    "border-left-width": [valueType.override, "borderWidth", "left"],
    "border-right": [valueType.shorthandWithMixedTypes, "borderRight"],
    "border-right-width": [valueType.override, "borderWidth", "right"],
};

/**
 * Utility class for storing all four side width values of a box.
 * Also has helper functions for parsing and building margin, padding and border-width type css values.
 */
class CSSBox {
    public top: string = "";
    public bottom: string = "";
    public left: string = "";
    public right: string = "";

    /**
     * Resets values to default empty strings.
     */
    private resetValues(): void {
        this.top = this.bottom = this.left = this.right = "";
    }

    public hasValues(): boolean {
        return (
            this.top !== "" || this.bottom !== "" || this.left !== "" || this.right !== ""
        );
    }

    /**
     * Sets the values based on a 1-4 part css value string
     * @param value A string value with 1 to 4 parts seperated by spaces (i.e: "10px 20px", "1em 2em 3em 4em")
     */
    public setFromCSSValue(value: string): void {
        // can't do anything with null or whitespace
        if (!value || value.trim().length === 0) {
            this.resetValues();
            return;
        }

        // value should contain 1 to 4 values seperated by spaces
        const values: string[] = value.split(" ");
        switch (values.length) {
            case 1:
                this.top = this.bottom = this.left = this.right = values[0];
                break;
            case 2:
                this.top = this.bottom = values[0];
                this.left = this.right = values[1];
                break;
            case 3:
                this.top = values[0];
                this.left = this.right = values[1];
                this.bottom = values[2];
                break;
            case 4:
                this.top = values[0];
                this.right = values[1];
                this.bottom = values[2];
                this.left = values[3];
                break;
            default:
                this.resetValues();
        }
    }

    /**
     * Converts the values into the most efficient css string.
     * @returns A string containing the the 1 to 4 parts of a margin, padding, border-width type style or an empty string
     * if the values can not be correctly represented (one of the values is empty).
     */
    public getCSSShorthandFourValues(): string {
        const top = this.top.trim();
        const bottom = this.bottom.trim();
        const left = this.left.trim();
        const right = this.right.trim();

        if (top === bottom && top === right && top === left) {
            // all values are the same
            return top;
        } else if (
            top.length > 0 &&
            top === bottom &&
            left.length > 0 &&
            left === right
        ) {
            // vertical and horizontal values are the same
            return `${top} ${left}`;
        } else if (
            top.length > 0 &&
            bottom.length > 0 &&
            top !== bottom &&
            left.length > 0 &&
            left === right
        ) {
            // top and bottom are different but sides are the same
            return `${top} ${left} ${bottom}`;
        } else if (
            top.length > 0 &&
            bottom.length > 0 &&
            left.length > 0 &&
            right.length > 0
        ) {
            // all values are different
            return `${top} ${right} ${bottom} ${left}`;
        }
        return "";
    }
}

class BorderValue {
    public originalValue: string = "";
    public lengthValue: string = "";
}

class BorderValues {
    public all: BorderValue = new BorderValue();
    public top: BorderValue = new BorderValue();
    public left: BorderValue = new BorderValue();
    public right: BorderValue = new BorderValue();
    public bottom: BorderValue = new BorderValue();
}
/**
 * Helper class for managing the text field values for the BoxModel UI. The border property should be used for the
 * "border" shorthand style values (i.e. "border:1px solid red"). It will attempt to identify the length part of the value
 * and set the borderWidth property accordingly. The border getter will return the original border value with the length
 * part replaced with the new value in borderWidth if all four values are the same, otherwise it returns an empty string.
 */
class CSSBoxModelValues {
    public margin: CSSBox = new CSSBox();
    public borderWidth: CSSBox = new CSSBox();
    public padding: CSSBox = new CSSBox();
    public width: string = "";
    public height: string = "";
    public borderValues: BorderValues = new BorderValues();
    get border(): string {
        return this.getBorderValue("all");
    }
    set border(value: string) {
        this.setBorderValue("all", value);
    }
    get borderTop(): string {
        return this.getBorderValue("top");
    }
    set borderTop(value: string) {
        this.setBorderValue("top", value);
    }
    get borderLeft(): string {
        return this.getBorderValue("left");
    }
    set borderLeft(value: string) {
        this.setBorderValue("left", value);
    }
    get borderRight(): string {
        return this.getBorderValue("right");
    }
    set borderRight(value: string) {
        this.setBorderValue("right", value);
    }
    get borderBottom(): string {
        return this.getBorderValue("bottom");
    }
    set borderBottom(value: string) {
        this.setBorderValue("bottom", value);
    }
    private getBorderValue(side: string) {
        const newVal: string =
            side === "all"
                ? this.borderWidth.getCSSShorthandFourValues()
                : this.borderWidth[side];
        if (
            this.borderValues[side].originalValue !== "" &&
            newVal !== "" &&
            (side !== "all" || (side === "all" && newVal.split(" ").length === 1))
        ) {
            return this.borderValues[side].originalValue.replace(
                this.borderValues[side].lengthValue,
                newVal
            );
        }
        return "";
    }
    private setBorderValue(side: string, value: string) {
        if (value && value.trim().length > 0) {
            this.borderValues[side] = { originalValue: value, lengthValue: "" };
            const parts: string[] = value.split(" ");
            parts.forEach(val => {
                if (val.toLowerCase().match(cssLengthRegExp)) {
                    this.borderValues[side].lengthValue = val;
                    if (side === "all") {
                        this.borderWidth.setFromCSSValue(val);
                    } else {
                        this.borderWidth[side] = val;
                    }
                }
            });
        }
    }
}

/**
 * A Box Model Custom HTML Element.
 *
 * @public
 */
export class CSSBoxModel extends FormAssociatedCSSBoxModel {
    @observable
    public uiValues: CSSBoxModelValues = new CSSBoxModelValues();

    @observable
    public marginOpen: boolean;

    // setting to keep the margin grid section open when the user has clicked the button to expand it
    private marginStick: boolean;

    @observable
    public borderOpen: boolean;

    // setting to keep the border grid section open when the user has clicked the button to expand it
    private borderStick: boolean;

    @observable
    public paddingOpen: boolean;

    // setting to keep the padding grid section open when the user has clicked the button to expand it
    private paddingStick: boolean;

    valueChanged(previous: any, next: any): void {
        if (!this.internalChange) {
            // reset values and attempt to parse the new value
            this.cssPropertyDictionary = {};
            this.parseCSSStyles(next);
            this.marginOpen = this.marginStick
                ? true
                : this.uiValues.margin.hasValues() &&
                  this.uiValues.margin.getCSSShorthandFourValues() === "";
            this.borderOpen = this.borderStick
                ? true
                : this.uiValues.borderWidth.hasValues() &&
                  this.uiValues.borderWidth.getCSSShorthandFourValues() === "";
            this.paddingOpen = this.paddingStick
                ? true
                : this.uiValues.padding.hasValues() &&
                  this.uiValues.padding.getCSSShorthandFourValues() === "";
        }
        this.internalChange = false;
        super.valueChanged(previous, next);
    }

    public handleOpenButtonClick = (section: expandableSection) => {
        let uiVal = "";
        switch (section) {
            case expandableSection.margin:
                uiVal = "margin";
                this.marginStick = !this.marginStick;
                break;
            case expandableSection.border:
                uiVal = "borderWidth";
                this.borderStick = !this.borderStick;
                break;
            case expandableSection.padding:
                uiVal = "padding";
                this.paddingStick = !this.paddingStick;
                break;
        }
        if (
            !this.uiValues[uiVal].hasValues() ||
            this.uiValues[uiVal].getCSSShorthandFourValues() !== ""
        ) {
            this[section] = !this[section];
            this.uiValues = { ...this.uiValues } as CSSBoxModelValues;
        }
    };

    private cssPropertyDictionary: CSSDeclarationDictionary = {};
    private internalChange: boolean = false;

    /**
     * Handle changes made in the UI text fields
     * @param param The css style being modified.
     * @param e The event object.
     * @returns false
     */
    public handleInputChange = (param: string, e: Event) => {
        // get the mapping and the new value
        const mapping = CSSToUIValueMapping[param];
        const inputVal = (e.composedPath()[0] as HTMLInputElement).value;
        if (mapping[0] === valueType.shorthandWithFourValues) {
            (this.uiValues[mapping[1]] as CSSBox).setFromCSSValue(inputVal);
        } else if (mapping.length > 2) {
            // two part value (padding-top -> uiValues.padding.top)
            this.uiValues[mapping[1]][mapping[2]] = inputVal;
        } else {
            // one part value (width -> uiValues.width)
            this.uiValues[mapping[1]] = inputVal;
        }
        // set the internalChange to true so the UI isn't refreshed when we update the initialValue
        this.internalChange = true;
        // set the initialValue to the css string for the updated value
        this.initialValue = this.buildCSSStyles();
        e.stopPropagation();
        // emit the change event
        this.$emit("change");
        return false;
    };

    /**
     * Parses a css style string and sets the uiValues values.
     * @param style A css style string (i.e. "margin:0;padding:10px 20px;")
     */
    private parseCSSStyles(style: string) {
        const newUIValues: CSSBoxModelValues = new CSSBoxModelValues();
        if (style) {
            // Parse the styles into a dictionary
            this.cssPropertyDictionary = mapCSSInlineStyleToCSSPropertyDictionary(style);

            // loop thru each css property
            for (const i in this.cssPropertyDictionary) {
                if (this.cssPropertyDictionary.hasOwnProperty(i)) {
                    // Get the property value and check if the property is in CSSToUIValueMapping
                    const propertyValue: string = this.cssPropertyDictionary[i];
                    const mapping = CSSToUIValueMapping[i.trim().toLowerCase()];
                    // Is it a style we care about?
                    if (mapping) {
                        if (mapping.length === 2) {
                            // This is a shorthand value (margin,padding,border or height/width)
                            if ((newUIValues[mapping[1]] as CSSBox).setFromCSSValue) {
                                // Set the value via the setFromCSSValue method
                                (newUIValues[mapping[1]] as CSSBox).setFromCSSValue(
                                    propertyValue
                                );
                            } else {
                                // Set the value via a setter.
                                newUIValues[mapping[1]] = propertyValue;
                            }
                        } else {
                            // This is not a shorthand (margin-top) so just set the value
                            newUIValues[mapping[1]][mapping[2]] = propertyValue;
                        }
                    }
                }
            }
        }
        // Set the uiValues to the new values. This triggers the UI update.
        this.uiValues = newUIValues;
    }

    /**
     * Builds a css style string based on the original styles passed to parseCSSStyles() and the values in uiValues.
     * Any styles in the original string not modified by the ui will be retained.
     * @returns A css style string representing the current state of the UI.
     */
    private buildCSSStyles(): string {
        // copy any styles from the original dictionary not in the mapping so styles not modified by the UI are preserved
        const newPropertyDictionary: CSSDeclarationDictionary = {
            ...this.cssPropertyDictionary,
        };
        let useShortHand: boolean = false;
        // check each style that we care about and update the dictionary if it has changed
        for (const styleName in CSSToUIValueMapping) {
            const mapping = CSSToUIValueMapping[styleName];
            if (mapping[0] === valueType.shorthandWithFourValues) {
                // this is a quad value shorthand (padding or margin)
                // clear previous shorthand if any
                useShortHand = false;

                // get value
                const shortValue: string = (this.uiValues[
                    mapping[1]
                ] as CSSBox).getCSSShorthandFourValues();

                // check for shortmixed
                const splitName: Array<string> = styleName.split("-");
                const shortMixed: string =
                    splitName.length > 1
                        ? newPropertyDictionary[splitName[0]]
                        : undefined;
                if (
                    shortValue !== "" &&
                    !(shortMixed !== undefined && shortMixed.indexOf(shortValue) >= 0)
                ) {
                    // the style is expressable as a quad value and there isn't a shorthand or if there is then the value is
                    // not expressed as a single length unit.
                    useShortHand = true;
                    if (newPropertyDictionary[styleName] !== undefined) {
                        // if it already exists delete it so it moves to the end of the list when we add it back
                        delete newPropertyDictionary[styleName];
                    }
                    newPropertyDictionary[styleName] = shortValue;
                } else {
                    // a shorthand exists and the quad value is expressable as a single length unit so we can just use the
                    // existing shorthand instead of this one
                    newPropertyDictionary[styleName] = "";
                }
            } else if (mapping[0] === valueType.oneValue) {
                // set the dictionary with the new value unless we have already used the shorthand for this style
                newPropertyDictionary[styleName] = !useShortHand
                    ? mapping.length > 2
                        ? this.uiValues[mapping[1]][mapping[2]]
                        : this.uiValues[mapping[1]]
                    : "";
            } else if (mapping[0] === valueType.shorthandWithMixedTypes) {
                // border shorthand style
                if (
                    newPropertyDictionary[styleName] !== undefined &&
                    newPropertyDictionary[styleName] !== ""
                ) {
                    const value: string = this.uiValues[mapping[1]];
                    // border shorthand exists
                    if (value !== undefined && value !== "") {
                        newPropertyDictionary[styleName] = value;
                    }
                    // remove all instances of border styles before this one as they are being overriden
                    // regardless if the value is updated.
                    Object.entries(newPropertyDictionary).every(value => {
                        if (value[0] === styleName) return false;
                        if (value[0].startsWith(styleName)) {
                            newPropertyDictionary[value[0]] = "";
                        }
                        return true;
                    });
                }
            } else if (mapping[0] === valueType.override) {
                if (useShortHand) {
                    newPropertyDictionary[styleName] = "";
                } else {
                    let value: string = this.uiValues[mapping[1]][mapping[2]];
                    // figure out if a shorthand exists
                    const nameParts: Array<string> = styleName.split("-");
                    nameParts.pop();
                    while (nameParts.length > 0) {
                        const shortName: string = nameParts.join("-");
                        if (newPropertyDictionary[shortName] !== undefined) {
                            // shorthand exists

                            // if shorthand is a shortmixed and value is empty we need to set value to 'initial'
                            if (
                                CSSToUIValueMapping[shortName][0] ===
                                    valueType.shorthandWithMixedTypes &&
                                value === ""
                            ) {
                                value = "initial";
                            } else if (
                                newPropertyDictionary[shortName].indexOf(value) >= 0
                            ) {
                                // shorthand exists and has same value so we don't need this style
                                value = "";
                            }
                        }
                        nameParts.pop();
                    }
                    if (value !== "") {
                        // we need to include this value
                        if (newPropertyDictionary[styleName] !== undefined) {
                            // if it already exists delete it so it moves to the end of the list when we add it back
                            delete newPropertyDictionary[styleName];
                        }
                        newPropertyDictionary[styleName] = value;
                    }
                }
            }
        }
        // condense the dictionary into a css string ignoring empty values, the result should be the simplest string possible
        return Object.entries(newPropertyDictionary)
            .map(value => {
                return value[1].trim().length > 0 ? value.join(":") + ";" : null;
            })
            .filter(value => {
                return value != null;
            })
            .join("");
    }
}
