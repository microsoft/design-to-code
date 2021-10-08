import { expect } from "chai";
import { DOM, html } from "@microsoft/fast-element";
import { DesignSystem } from "@microsoft/fast-foundation";
import { fixture } from "../../__test__/fixture";
import { UnitsTextField } from "./units-text-field";
import { fastToolingUnitsTextField } from ".";
import { keyArrowDown, keyArrowUp } from "@microsoft/fast-web-utilities";

const fakeArrowUpEvent: KeyboardEvent = new KeyboardEvent("keydown", { key: keyArrowUp });
const fakeArrowShiftUpEvent: KeyboardEvent = new KeyboardEvent("keydown", {
    key: keyArrowUp,
    shiftKey: true,
});
const fakeArrowDownEvent: KeyboardEvent = new KeyboardEvent("keydown", {
    key: keyArrowDown,
});
const fakeArrowShiftDownEvent: KeyboardEvent = new KeyboardEvent("keydown", {
    key: keyArrowDown,
    shiftKey: true,
});

async function setup() {
    const { element, connect, disconnect } = await fixture<UnitsTextField>(
        html`
            <fast-tooling-units-text-field
                placeholder="placeholder text"
                id="units_text_field"
            >
                Units Text Field
            </fast-tooling-units-text-field>
        `,
        {
            designSystem: DesignSystem.getOrCreate()
                .withPrefix("fast-tooling")
                .register(fastToolingUnitsTextField()),
        }
    );

    return { element, connect, disconnect };
}

describe("UnitsTextField", () => {
    it("should initialize and render", async () => {
        const { element, connect, disconnect } = await setup();
        const event = new Event("input", {
            key: "a",
        } as KeyboardEventInit);
        let wasChanged: boolean = false;

        await connect();

        expect(element.id).to.equal("units_text_field");

        element.addEventListener("change", (e: Event) => {
            wasChanged = true;
        });

        element.control.dispatchEvent(event);

        expect(wasChanged).to.equal(true);

        await disconnect();
    });
    it("should do nothing without a numeric value", async () => {
        const { element, connect, disconnect } = await setup();
        const event = new KeyboardEvent("input", {
            key: "a",
        } as KeyboardEventInit);

        await connect();

        element.value = "abcd";
        element.control.setSelectionRange(0, 0);

        element.handleKeyDown(fakeArrowUpEvent);
        expect(element.value).to.equal("abcd");
        await DOM.nextUpdate();

        element.handleKeyDown(event);
        expect(element.value).to.equal("abcd");
        await DOM.nextUpdate();

        await disconnect();
    });
    it("should find correct string locations", async () => {
        const { element, connect, disconnect } = await setup();
        const regex: RegExp = new RegExp(/[^a-zA-Z0-9.-]/g);

        await connect();

        expect(element.indexOf("10px 20px", regex, 0)).to.equal(4);
        expect(element.indexOf("10px 20px", regex, 2)).to.equal(4);
        expect(element.indexOf("10px 20px", regex, 9)).to.equal(-1);
        expect(element.lastIndexOf("10px 20px", regex, 0)).to.equal(4);
        expect(element.lastIndexOf("10px 20px", regex, 4)).to.equal(-1);
        expect(element.lastIndexOf("10px 20px", regex, 7)).to.equal(4);

        await disconnect();
    });

    it("should modify a single value", async () => {
        const { element, connect, disconnect } = await setup();
        element.value = "10px";

        await connect();

        // up arrow at beginning
        element.control.setSelectionRange(0, 0);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("11px");

        // shift up at beginning
        element.handleKeyDown(fakeArrowShiftUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("21px");

        // down shift at beginning
        element.handleKeyDown(fakeArrowShiftDownEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("11px");

        // shift down at beginning
        element.handleKeyDown(fakeArrowDownEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("10px");

        // up arrow in middle
        element.control.setSelectionRange(2, 2);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("11px");

        // up arrow at end
        element.control.setSelectionRange(4, 4);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px");

        await disconnect();
    });

    it("should handle negatives and decimals", async () => {
        const { element, connect, disconnect } = await setup();
        element.value = "10px";

        await connect();

        element.control.setSelectionRange(0, 0);
        element.handleKeyDown(fakeArrowShiftDownEvent);
        await DOM.nextUpdate();
        element.handleKeyDown(fakeArrowShiftDownEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("-10px");

        element.handleKeyDown(fakeArrowShiftUpEvent);
        await DOM.nextUpdate();
        element.handleKeyDown(fakeArrowShiftUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("10px");

        element.value = "1.5em";
        await DOM.nextUpdate();
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("2.5em");

        await disconnect();
    });

    it("should handle multple values", async () => {
        const { element, connect, disconnect } = await setup();
        element.value = "10px 20px 30px";

        await connect();

        element.control.setSelectionRange(0, 0);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("11px 20px 30px");

        element.control.setSelectionRange(4, 4);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 20px 30px");

        element.control.setSelectionRange(5, 5);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 21px 30px");

        element.control.setSelectionRange(11, 11);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 21px 31px");

        element.control.setSelectionRange(14, 14);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 21px 32px");

        await disconnect();
    });

    it("should handle highlighted values", async () => {
        const { element, connect, disconnect } = await setup();
        element.value = "10px 20px 30px";

        await connect();

        element.control.setSelectionRange(0, 2);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("11px 20px 30px");

        element.control.setSelectionRange(2, 4);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 20px 30px");

        element.control.setSelectionRange(5, 9);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 21px 30px");

        element.control.setSelectionRange(8, 14);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 22px 30px");

        element.control.setSelectionRange(10, 14);
        element.handleKeyDown(fakeArrowUpEvent);
        await DOM.nextUpdate();
        expect(element.value).to.equal("12px 22px 31px");

        await disconnect();
    });
});
