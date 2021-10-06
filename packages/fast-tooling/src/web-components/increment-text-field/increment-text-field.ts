import { keyArrowDown, keyArrowUp } from "@microsoft/fast-web-utilities";
import { TextField, TextFieldType } from "@microsoft/fast-foundation";
import { DOM } from "@microsoft/fast-element";

export class IncrementTextField extends TextField {
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
    private indexOf(searchString: string, regex: RegExp, position: number) {
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
    private lastIndexOf(searchString: string, regex: RegExp, position: number) {
        const str = position ? searchString.substring(0, position) : searchString;
        const match = str.match(regex);
        return match ? str.lastIndexOf(match[match.length - 1]) : -1;
    }

    public handleKeyDown = (ev: KeyboardEvent): boolean => {
        if (ev.key === keyArrowUp || ev.key === keyArrowDown) {
            const amount: number =
                (ev.shiftKey ? 10 : 1) * (ev.key === keyArrowUp ? 1 : -1);
            const startPos: number = this.control.selectionStart;
            const endPos: number = this.control.selectionEnd;
            const origValue: string = this.control.value;
            const isSelected: boolean = startPos !== endPos;

            let replaceText: string = "";

            // Find the "word" closest to the cursor or selected area
            // startPos is the cursor location and startPos === endPos when nothing is selected

            // Find the last index of a non-alphanumeric character, dot or minus before the start position
            let startIndex =
                startPos > 0
                    ? this.lastIndexOf(origValue, /[^a-zA-Z0-9.-]/g, startPos) + 1
                    : 0;
            // Find the first index of a non-alphanumeric character, dot or minus after the start position
            let endIndex = this.indexOf(origValue, /[^a-zA-Z0-9.-]/g, startPos);

            // Set indexes to beginning or end of string if no matches
            startIndex = startIndex < 0 ? 0 : startIndex;
            endIndex = endIndex < 0 ? origValue.length : endIndex;

            // Get the substring that we are acting on
            replaceText = origValue.substring(startIndex, endIndex);

            // Parse the substring into a number ignoring non-numeric characters
            let origNum = parseFloat(replaceText);

            // Adjust the value
            let newNum = origNum + amount;

            // Replace the original text with the new number value
            const newValue =
                origValue.substring(0, startIndex) +
                origValue
                    .substring(startIndex)
                    .replace(origNum.toString(), newNum.toString());

            // If no change (likely because there was no numeric value present) do nothing
            if (newValue !== origValue) {
                // Set the control to the new value
                this.value = newValue;

                DOM.queueUpdate(() => {
                    // Update the selected range to match the length of the new number
                    this.control.setSelectionRange(
                        isSelected ? startIndex : startPos,
                        isSelected
                            ? endIndex +
                                  newNum.toString().length -
                                  origNum.toString().length
                            : startPos
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
