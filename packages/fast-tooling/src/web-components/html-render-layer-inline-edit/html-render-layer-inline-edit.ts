import { attr, observable } from "@microsoft/fast-element";
import { MessageSystemDataTypeAction, MessageSystemType } from "../../message-system";
import {
    ActivityType,
    HTMLRenderLayer,
    OverlayPosition,
} from "../html-render-layer/html-render-layer";
import { htmlRenderOriginatorId } from "../html-render/html-render";

export enum CommitMode {
    onBlurOrEnter = "on-blur-or-enter",
    onEnterOnly = "on-enter-only",
}

export class HTMLRenderLayerInlineEdit extends HTMLRenderLayer {
    /**
     * Specifies whether to automatically select all text when editing
     * is initiated. If present then all text within the textarea will
     * be selected otherwise it will just be given focus with the cursor
     * placed at the end of the text.
     */
    @attr({ mode: "boolean" })
    public autoselect: boolean;

    /**
     * Specifies when changes to the text should be committed.
     * Only on "Enter" keypress or any time the textarea loses focus.
     * Default: CommitMode.onBlur
     */
    @attr({ attribute: "commit-mode" })
    public commitMode: CommitMode;

    public layerActivityId: string = "InlineEditLayer";

    @observable
    public textAreaActive: boolean = false;

    @observable
    public textPosition: OverlayPosition = new OverlayPosition(0, 0, 0, 0);

    @observable
    public textValue: string = "";

    public textAreaRef: HTMLTextAreaElement;

    private currentDataId: string = null;
    private originalTextValue: string = null;
    private currentStyleTarget: HTMLElement;
    private currentTextNode: Node;
    private currentMinimumSize: number = 0;

    connectedCallback() {
        super.connectedCallback();

        if (!this.commitMode) {
            this.commitMode = CommitMode.onBlurOrEnter;
        }
        window.addEventListener("scroll", this.handleWindowChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        window.removeEventListener("scroll", this.handleWindowChange);
    }

    private handleWindowChange = () => {
        if (this.textAreaActive) {
            this.applySizeAndPositionToTextbox();
        }
    };

    public handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Tab" && this.commitMode === CommitMode.onBlurOrEnter) {
            this.commitEdit();
            e.preventDefault();
            return false;
        }
        if (e.key.length === 1) {
            this.currentTextNode.textContent += e.key;
            this.applySizeAndPositionToTextbox();
        }
        return true;
    }

    public handleTextInput(e: KeyboardEvent) {
        if (e.key === "Enter") {
            this.commitEdit();
            e.preventDefault();
            return false;
        } else if (e.key === "Escape") {
            this.cancelEdit();
            e.preventDefault();
            return false;
        }
        const inputVal = (e.composedPath()[0] as HTMLInputElement).value;

        // Make sure the text node always has at least one character in it othewise we lose
        // positioning and size.
        this.currentTextNode.textContent = inputVal.trim().length === 0 ? "W" : inputVal;
        this.applySizeAndPositionToTextbox();
        if (this.activityCallback) {
            this.activityCallback(this.layerActivityId, ActivityType.update);
        }
    }

    public handleBlur(e: InputEvent) {
        this.commitMode === CommitMode.onBlurOrEnter
            ? this.commitEdit()
            : this.cancelEdit();
    }

    private getPositionFromElement(target: Node): OverlayPosition {
        const range: Range = document.createRange();
        range.selectNode(target);
        const pos: DOMRect = range.getBoundingClientRect();
        return new OverlayPosition(pos.top, pos.left, pos.width, pos.height);
    }

    private applySizeAndPositionToTextbox() {
        this.textPosition = this.getPositionFromElement(this.currentTextNode);
        this.textAreaRef.style.top = `${this.textPosition.top}px`;
        this.textAreaRef.style.left = `${this.textPosition.left}px`;
        this.textAreaRef.style.width = `${
            this.currentMinimumSize > this.textPosition.width
                ? this.currentMinimumSize
                : this.textPosition.width + 2
        }px`;
        this.textAreaRef.style.height = `${
            this.currentMinimumSize > this.textPosition.height
                ? this.currentMinimumSize
                : this.textAreaRef.scrollHeight > this.textPosition.height
                ? this.textAreaRef.scrollHeight
                : this.textPosition.height + 2
        }px`;
    }

    private applyStylesToTextbox() {
        const styles: CSSStyleDeclaration = window.getComputedStyle(
            this.currentStyleTarget
        );
        this.textAreaRef.style.font = styles.font;
        this.textAreaRef.style.fontWeight = styles.fontWeight;
        this.textAreaRef.style.lineHeight = styles.lineHeight;
        // Let's use the computed line height as a convenient minimum size for the text area.
        // In some cases line height returns 'normal'. In this case use 1.5 * the font size.
        const minimumSize: number = parseInt(styles.lineHeight, 10);
        this.currentMinimumSize = isNaN(minimumSize)
            ? parseInt(styles.fontSize, 10) * 1.5
            : minimumSize;
    }

    private startEdit(datadictionaryId: string, elementRef: Node, event: MouseEvent) {
        if (this.currentDataId === datadictionaryId) {
            this.cancelEdit();
        }
        if (this.activityCallback) {
            this.activityCallback(this.layerActivityId, ActivityType.takeFocus);
        }

        this.currentDataId = datadictionaryId;
        this.currentTextNode = elementRef;

        this.textValue = (this.dataDictionary[0][datadictionaryId].data as string).trim();
        this.originalTextValue = this.textValue;
        const path: EventTarget[] = event.composedPath();
        let i = 0;
        this.currentStyleTarget = path[i] as HTMLElement;
        // walk up the composedPath until we find an element that isn't a text node, document fragment or a slot.
        while (
            this.currentStyleTarget.nodeType === 3 ||
            this.currentStyleTarget.nodeType === 11 ||
            this.currentStyleTarget.nodeName === "SLOT"
        ) {
            i++;
            this.currentStyleTarget = path[i] as HTMLElement;
        }
        // position, style and show the textarea
        this.applyStylesToTextbox();
        this.applySizeAndPositionToTextbox();
        this.textAreaActive = true;

        // give the dom time to update and show the textarea before giving it focus
        window.setTimeout(() => {
            this.textAreaRef.focus();
            if (this.autoselect) {
                this.textAreaRef.select();
            }
        }, 10);
    }

    private commitEdit() {
        if (!this.textAreaActive) return;

        this.textAreaActive = false;
        const newValue = this.textAreaRef.value.replaceAll("\n", " ").trim();
        this.currentTextNode.textContent = newValue;
        this.textValue = "";
        this.originalTextValue = "";
        // send the data update message
        this.messageSystem.postMessage({
            type: MessageSystemType.data,
            action: MessageSystemDataTypeAction.update,
            dataLocation: "",
            dictionaryId: this.currentDataId,
            data: newValue,
            options: {
                originatorId: htmlRenderOriginatorId,
            },
        });
        this.currentDataId = null;
        this.currentTextNode = null;
        if (this.activityCallback) {
            this.activityCallback(this.layerActivityId, ActivityType.releaseFocus);
        }
    }

    private cancelEdit() {
        if (!this.textAreaActive) return;
        // reset all changes
        this.textAreaActive = false;
        if (this.currentTextNode) {
            this.currentTextNode.textContent = this.originalTextValue;
        }
        this.currentDataId = null;
        this.currentTextNode = null;
        this.textValue = "";
        this.originalTextValue = "";
        if (this.activityCallback) {
            this.activityCallback(this.layerActivityId, ActivityType.update);
            this.activityCallback(this.layerActivityId, ActivityType.releaseFocus);
        }
    }

    // Handle element activity events from the HTMLRender component
    public elementActivity(
        layerActivityId: string,
        activityType: ActivityType,
        datadictionaryId: string,
        elementRef: Node,
        event: Event
    ) {
        if (layerActivityId === this.layerActivityId) {
            return;
        }
        switch (activityType) {
            case ActivityType.click:
                if (
                    this.currentDataId !== null &&
                    this.currentDataId !== datadictionaryId
                ) {
                    // currently editing and something else was clicked
                    this.cancelEdit();
                }
                break;
            case ActivityType.clear:
                if (this.currentDataId !== null) {
                    this.cancelEdit();
                }
                break;
            case ActivityType.doubleClick:
                this.cancelEdit();
                this.startEdit(datadictionaryId, elementRef, event as MouseEvent);
                break;
        }
    }
}
