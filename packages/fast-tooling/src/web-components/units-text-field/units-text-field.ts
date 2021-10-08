import { keyArrowDown, keyArrowUp } from "@microsoft/fast-web-utilities";
import { TextField, TextFieldType } from "@microsoft/fast-foundation";
import { DOM } from "@microsoft/fast-element";

export class UnitsTextField extends TextField {
    // The word boundry is defined as any whitespace or comma.
    private wordBoundryRegex: RegExp = new RegExp(/[\s,]/g);

    /**
     * @internal
     */
    public connectedCallback(): void {
        this.type = TextFieldType.text;
        super.connectedCallback();

        this.control.addEventListener("keydown", this.handleKeyDown);
    }

    /**
     * Finds the first index of a regular expression in a string.
     * @param searchString The string to search.
     * @param regex The regular expression to match.
     * @param position An optional starting position.
     * @returns The first matching index within the string or -1 if it is not found.
     */
    public indexOf(searchString: string, regex: RegExp, position?: number) {
        const str = position ? searchString.substring(position) : searchString;
        const match = str.match(regex);
        return match ? str.indexOf(match[0]) + position : -1;
    }

    /**
     * Finds the last index of a regular expression in a string.
     * @param searchString The string to search.
     * @param regex The regular expression to match.
     * @param position An optional starting position.
     * @returns The last matching index within the string or -1 if it is not found.
     */
    public lastIndexOf(searchString: string, regex: RegExp, position?: number) {
        const str = position ? searchString.substring(0, position) : searchString;
        const match = str.match(regex);
        return match ? str.lastIndexOf(match[match.length - 1]) : -1;
    }

    public handleKeyDown = (ev: KeyboardEvent): boolean => {
        if (ev.key === keyArrowUp || ev.key === keyArrowDown) {
            const step: number =
                (ev.shiftKey ? 10 : 1) * (ev.key === keyArrowUp ? 1 : -1);
            const startPosition: number = this.control.selectionStart;
            const endPosition: number = this.control.selectionEnd;
            const originalValue: string = this.control.value;
            const isSelected: boolean = startPosition !== endPosition;

            let replaceText: string = "";

            // Find the "word" closest to the cursor or selected area
            // startPosition is the cursor location and startPosition === endPosition when nothing is selected

            // Find the last index of a non-alphanumeric character, dot or minus before the start position
            const startIndex =
                startPosition > 0
                    ? this.lastIndexOf(
                          originalValue,
                          this.wordBoundryRegex,
                          startPosition
                      ) + 1
                    : 0;
            // Find the first index of a non-alphanumeric character, dot or minus after the start position
            let endIndex = this.indexOf(
                originalValue,
                this.wordBoundryRegex,
                startPosition
            );

            // Set end index to end of string if no matches
            endIndex = endIndex < 0 ? originalValue.length : endIndex;

            // Get the substring that we are acting on
            replaceText = originalValue.substring(startIndex, endIndex);

            // Parse the substring into a number ignoring leading non-numeric characters
            const originalNumber = parseInt(replaceText.replace(/^[^\d-]*/, ""), 10);

            // Adjust the value
            const newNum = originalNumber + step;

            // Replace the original text with the new number value
            const newValue =
                originalValue.substring(0, startIndex) +
                originalValue
                    .substring(startIndex)
                    .replace(originalNumber.toString(), newNum.toString());

            // If no change (likely because there was no numeric value present) do nothing
            if (newValue !== originalValue) {
                // Set the control to the new value
                this.value = newValue;

                DOM.queueUpdate(() => {
                    // Update the selected range to match the length of the new number
                    this.control.setSelectionRange(
                        isSelected ? startIndex : startPosition,
                        isSelected
                            ? endIndex +
                                  newNum.toString().length -
                                  originalNumber.toString().length
                            : startPosition
                    );
                });

                this.$emit("change");
            }

            // Prevent the default otherwise up and down arrow moves the cursor to the beginning or end of the text
            ev.preventDefault();
            return false;
        }
    };

    public handleTextInput() {
        super.handleTextInput();
        // override base class handleTextInput so we can emit a change event with every keypress and not just when it loses focus
        this.$emit("change");
    }
}
