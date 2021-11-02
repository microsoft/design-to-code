import { expect } from "chai";
import { DOM, html } from "@microsoft/fast-element";
import { DesignSystem } from "@microsoft/fast-foundation";
import { fixture } from "../../__test__/fixture";
import { CSSBoxModel } from "./css-box-model";
import { fastToolingCSSBoxModel } from ".";
import { fastToolingUnitsTextField } from "../units-text-field";

async function setup() {
    const { element, connect, disconnect } = await fixture<CSSBoxModel>(
        html`
            <fast-tooling-css-box-model id="css-box-model"></fast-tooling-css-box-model>
        `,
        {
            designSystem: DesignSystem.getOrCreate()
                .withPrefix("fast-tooling")
                .register(fastToolingUnitsTextField(), fastToolingCSSBoxModel()),
        }
    );

    return { element, connect, disconnect };
}

describe("CSSBoxModel", () => {
    it("should initialize and render", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();

        const event = new Event("change", {} as Event);
        let wasChanged: boolean = false;

        expect(element.id).to.equal("css-box-model");

        element.addEventListener("change", (e: Event) => {
            wasChanged = true;
        });
        const marginTopInput = element.shadowRoot.getElementById(
            "margin-top"
        ) as HTMLInputElement;
        marginTopInput.value = "1px";
        marginTopInput.dispatchEvent(event);

        await DOM.nextUpdate();

        expect(wasChanged).to.equal(true);
        expect(element.value).to.equal("margin-top:1px;");

        await disconnect();
    });
    it("should parse margin values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const marginTopInput = element.shadowRoot.getElementById(
            "margin-top"
        ) as HTMLInputElement;
        const marginLeftInput = element.shadowRoot.getElementById(
            "margin-left"
        ) as HTMLInputElement;
        const marginRightInput = element.shadowRoot.getElementById(
            "margin-right"
        ) as HTMLInputElement;
        const marginBottomInput = element.shadowRoot.getElementById(
            "margin-bottom"
        ) as HTMLInputElement;

        element.initialValue = "margin:10px";
        await DOM.nextUpdate();
        expect(marginTopInput.value).to.equal("10px");
        expect(marginLeftInput.value).to.equal("10px");
        expect(marginRightInput.value).to.equal("10px");
        expect(marginBottomInput.value).to.equal("10px");

        element.value = "margin:10px 20px";
        await DOM.nextUpdate();
        expect(marginTopInput.value).to.equal("10px");
        expect(marginLeftInput.value).to.equal("20px");
        expect(marginRightInput.value).to.equal("20px");
        expect(marginBottomInput.value).to.equal("10px");

        element.value = "margin:10px 20px 30px";
        await DOM.nextUpdate();
        expect(marginTopInput.value).to.equal("10px");
        expect(marginLeftInput.value).to.equal("20px");
        expect(marginRightInput.value).to.equal("20px");
        expect(marginBottomInput.value).to.equal("30px");

        element.value = "margin:10px 20px 30px 40px";
        await DOM.nextUpdate();
        expect(marginTopInput.value).to.equal("10px");
        expect(marginLeftInput.value).to.equal("40px");
        expect(marginRightInput.value).to.equal("20px");
        expect(marginBottomInput.value).to.equal("30px");

        element.value = "margin:10px 20px 30px 40 px";
        await DOM.nextUpdate();
        expect(marginTopInput.value).to.equal("");
        expect(marginLeftInput.value).to.equal("");
        expect(marginRightInput.value).to.equal("");
        expect(marginBottomInput.value).to.equal("");

        element.value = "margin:";
        await DOM.nextUpdate();
        expect(marginTopInput.value).to.equal("");
        expect(marginLeftInput.value).to.equal("");
        expect(marginRightInput.value).to.equal("");
        expect(marginBottomInput.value).to.equal("");

        await disconnect();
    });
    it("should produce margin values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const event = new Event("change", {} as Event);
        let newValue: string = "";

        element.addEventListener("change", (e: Event) => {
            newValue = (e.target as HTMLInputElement).value;
        });

        const marginTopInput = element.shadowRoot.getElementById(
            "margin-top"
        ) as HTMLInputElement;
        const marginLeftInput = element.shadowRoot.getElementById(
            "margin-left"
        ) as HTMLInputElement;
        const marginRightInput = element.shadowRoot.getElementById(
            "margin-right"
        ) as HTMLInputElement;
        const marginBottomInput = element.shadowRoot.getElementById(
            "margin-bottom"
        ) as HTMLInputElement;

        element.initialValue = "";
        await DOM.nextUpdate();

        marginTopInput.value = "10px";
        marginTopInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin-top:10px;");

        marginLeftInput.value = "10px";
        marginLeftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin-top:10px;margin-left:10px;");

        marginRightInput.value = "10px";
        marginRightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin-top:10px;margin-left:10px;margin-right:10px;");

        marginBottomInput.value = "10px";
        marginBottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin:10px;");

        marginLeftInput.value = "20px";
        marginLeftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin:10px 10px 10px 20px;");

        marginRightInput.value = "20px";
        marginRightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin:10px 20px;");

        marginRightInput.value = "30px";
        marginRightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin:10px 30px 10px 20px;");

        marginBottomInput.value = "40px";
        marginBottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin:10px 30px 40px 20px;");

        marginRightInput.value = "";
        marginRightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin-top:10px;margin-bottom:40px;margin-left:20px;");

        await disconnect();
    });

    it("should parse padding values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const topInput = element.shadowRoot.getElementById(
            "padding-top"
        ) as HTMLInputElement;
        const leftInput = element.shadowRoot.getElementById(
            "padding-left"
        ) as HTMLInputElement;
        const rightInput = element.shadowRoot.getElementById(
            "padding-right"
        ) as HTMLInputElement;
        const bottomInput = element.shadowRoot.getElementById(
            "padding-bottom"
        ) as HTMLInputElement;

        element.initialValue = "padding:10px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("10px");
        expect(rightInput.value).to.equal("10px");
        expect(bottomInput.value).to.equal("10px");

        element.value = "padding:10px 20px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("20px");
        expect(rightInput.value).to.equal("20px");
        expect(bottomInput.value).to.equal("10px");

        element.value = "padding:10px 20px 30px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("20px");
        expect(rightInput.value).to.equal("20px");
        expect(bottomInput.value).to.equal("30px");

        element.value = "padding:10px 20px 30px 40px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("40px");
        expect(rightInput.value).to.equal("20px");
        expect(bottomInput.value).to.equal("30px");

        element.value = "padding:10px 20px 30px 40 px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("");
        expect(leftInput.value).to.equal("");
        expect(rightInput.value).to.equal("");
        expect(bottomInput.value).to.equal("");

        element.value = "padding:";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("");
        expect(leftInput.value).to.equal("");
        expect(rightInput.value).to.equal("");
        expect(bottomInput.value).to.equal("");

        await disconnect();
    });
    it("should produce padding values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const event = new Event("change", {} as Event);
        let newValue: string = "";

        element.addEventListener("change", (e: Event) => {
            newValue = (e.target as HTMLInputElement).value;
        });

        const topInput = element.shadowRoot.getElementById(
            "padding-top"
        ) as HTMLInputElement;
        const leftInput = element.shadowRoot.getElementById(
            "padding-left"
        ) as HTMLInputElement;
        const rightInput = element.shadowRoot.getElementById(
            "padding-right"
        ) as HTMLInputElement;
        const bottomInput = element.shadowRoot.getElementById(
            "padding-bottom"
        ) as HTMLInputElement;

        element.initialValue = "";
        await DOM.nextUpdate();

        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("padding-top:10px;");

        leftInput.value = "10px";
        leftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("padding-top:10px;padding-left:10px;");

        rightInput.value = "10px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal(
            "padding-top:10px;padding-left:10px;padding-right:10px;"
        );

        bottomInput.value = "10px";
        bottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("padding:10px;");

        leftInput.value = "20px";
        leftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("padding:10px 10px 10px 20px;");

        rightInput.value = "20px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("padding:10px 20px;");

        rightInput.value = "30px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("padding:10px 30px 10px 20px;");

        bottomInput.value = "40px";
        bottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("padding:10px 30px 40px 20px;");

        rightInput.value = "";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal(
            "padding-top:10px;padding-bottom:40px;padding-left:20px;"
        );

        await disconnect();
    });

    it("should parse width and height values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const widthInput = element.shadowRoot.getElementById("width") as HTMLInputElement;
        const heightInput = element.shadowRoot.getElementById(
            "height"
        ) as HTMLInputElement;

        element.initialValue = "width:10px";
        await DOM.nextUpdate();
        expect(widthInput.value).to.equal("10px");
        expect(heightInput.value).to.equal("");

        element.initialValue = "height:10px";
        await DOM.nextUpdate();
        expect(widthInput.value).to.equal("");
        expect(heightInput.value).to.equal("10px");

        element.initialValue = "width:100%;height:1vh;";
        await DOM.nextUpdate();
        expect(widthInput.value).to.equal("100%");
        expect(heightInput.value).to.equal("1vh");

        element.initialValue = "width:;height:1vh;";
        await DOM.nextUpdate();
        expect(widthInput.value).to.equal("");
        expect(heightInput.value).to.equal("1vh");

        await disconnect();
    });

    it("should produce width and height values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const event = new Event("change", {} as Event);
        let newValue: string = "";

        element.addEventListener("change", (e: Event) => {
            newValue = (e.target as HTMLInputElement).value;
        });

        const widthInput = element.shadowRoot.getElementById("width") as HTMLInputElement;
        const heightInput = element.shadowRoot.getElementById(
            "height"
        ) as HTMLInputElement;

        element.initialValue = "";
        await DOM.nextUpdate();

        widthInput.value = "10px";
        widthInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("width:10px;");

        widthInput.value = "";
        widthInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("");

        heightInput.value = "10px";
        heightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("height:10px;");

        widthInput.value = "100%";
        widthInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("width:100%;height:10px;");

        await disconnect();
    });

    it("should parse border-width values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const topInput = element.shadowRoot.getElementById(
            "border-top-width"
        ) as HTMLInputElement;
        const leftInput = element.shadowRoot.getElementById(
            "border-left-width"
        ) as HTMLInputElement;
        const rightInput = element.shadowRoot.getElementById(
            "border-right-width"
        ) as HTMLInputElement;
        const bottomInput = element.shadowRoot.getElementById(
            "border-bottom-width"
        ) as HTMLInputElement;

        element.initialValue = "border-width:10px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("10px");
        expect(rightInput.value).to.equal("10px");
        expect(bottomInput.value).to.equal("10px");

        element.value = "border-width:10px 20px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("20px");
        expect(rightInput.value).to.equal("20px");
        expect(bottomInput.value).to.equal("10px");

        element.value = "border-width:10px 20px 30px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("20px");
        expect(rightInput.value).to.equal("20px");
        expect(bottomInput.value).to.equal("30px");

        element.value = "border-width:10px 20px 30px 40px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("40px");
        expect(rightInput.value).to.equal("20px");
        expect(bottomInput.value).to.equal("30px");

        element.value = "border-width:10px 20px 30px 40 px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("");
        expect(leftInput.value).to.equal("");
        expect(rightInput.value).to.equal("");
        expect(bottomInput.value).to.equal("");

        element.value = "border-width:";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("");
        expect(leftInput.value).to.equal("");
        expect(rightInput.value).to.equal("");
        expect(bottomInput.value).to.equal("");

        await disconnect();
    });
    it("should produce border-width values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const event = new Event("change", {} as Event);
        let newValue: string = "";

        element.addEventListener("change", (e: Event) => {
            newValue = (e.target as HTMLInputElement).value;
        });

        const topInput = element.shadowRoot.getElementById(
            "border-top-width"
        ) as HTMLInputElement;
        const leftInput = element.shadowRoot.getElementById(
            "border-left-width"
        ) as HTMLInputElement;
        const rightInput = element.shadowRoot.getElementById(
            "border-right-width"
        ) as HTMLInputElement;
        const bottomInput = element.shadowRoot.getElementById(
            "border-bottom-width"
        ) as HTMLInputElement;

        element.initialValue = "";
        await DOM.nextUpdate();

        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-top-width:10px;");

        leftInput.value = "10px";
        leftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-top-width:10px;border-left-width:10px;");

        rightInput.value = "10px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal(
            "border-top-width:10px;border-left-width:10px;border-right-width:10px;"
        );

        bottomInput.value = "10px";
        bottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-width:10px;");

        leftInput.value = "20px";
        leftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-width:10px 10px 10px 20px;");

        rightInput.value = "20px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-width:10px 20px;");

        rightInput.value = "30px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-width:10px 30px 10px 20px;");

        bottomInput.value = "40px";
        bottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-width:10px 30px 40px 20px;");

        rightInput.value = "";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal(
            "border-top-width:10px;border-bottom-width:40px;border-left-width:20px;"
        );

        await disconnect();
    });

    it("should parse border values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const topInput = element.shadowRoot.getElementById(
            "border-top-width"
        ) as HTMLInputElement;
        const leftInput = element.shadowRoot.getElementById(
            "border-left-width"
        ) as HTMLInputElement;
        const rightInput = element.shadowRoot.getElementById(
            "border-right-width"
        ) as HTMLInputElement;
        const bottomInput = element.shadowRoot.getElementById(
            "border-bottom-width"
        ) as HTMLInputElement;

        element.initialValue = "border:solid 10px rgb(0, 0, 0)";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("10px");
        expect(rightInput.value).to.equal("10px");
        expect(bottomInput.value).to.equal("10px");

        element.initialValue = "border:1em rgb(0, 0, 0) solid";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("1em");
        expect(leftInput.value).to.equal("1em");
        expect(rightInput.value).to.equal("1em");
        expect(bottomInput.value).to.equal("1em");

        element.initialValue = "border:red thin dotted";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("thin");
        expect(leftInput.value).to.equal("thin");
        expect(rightInput.value).to.equal("thin");
        expect(bottomInput.value).to.equal("thin");

        element.initialValue = "border-top:solid rgb(0, 0, 0) 10px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("");
        expect(rightInput.value).to.equal("");
        expect(bottomInput.value).to.equal("");

        element.initialValue = "border-top-width:10px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("");
        expect(rightInput.value).to.equal("");
        expect(bottomInput.value).to.equal("");

        element.initialValue =
            "border:solid 10px rgb(0, 0, 0);border-top:solid rgb(0, 0, 0) 20px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("20px");
        expect(leftInput.value).to.equal("10px");
        expect(rightInput.value).to.equal("10px");
        expect(bottomInput.value).to.equal("10px");

        element.initialValue = "border:solid 10px rgb(0, 0, 0);border-top-width:20px";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("20px");
        expect(leftInput.value).to.equal("10px");
        expect(rightInput.value).to.equal("10px");
        expect(bottomInput.value).to.equal("10px");

        element.initialValue = "border-top-width:20px;border:solid 10px rgb(0, 0, 0);";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("10px");
        expect(rightInput.value).to.equal("10px");
        expect(bottomInput.value).to.equal("10px");

        element.initialValue = "border-top-width:20px;border:solid 10px rgb(0, 0, 0);";
        await DOM.nextUpdate();
        expect(topInput.value).to.equal("10px");
        expect(leftInput.value).to.equal("10px");
        expect(rightInput.value).to.equal("10px");
        expect(bottomInput.value).to.equal("10px");

        await disconnect();
    });
    it("should produce border-width values", async () => {
        const { element, connect, disconnect } = await setup();
        await connect();
        const event = new Event("change", {} as Event);
        let newValue: string = "";

        element.addEventListener("change", (e: Event) => {
            newValue = (e.target as HTMLInputElement).value;
        });

        const topInput = element.shadowRoot.getElementById(
            "border-top-width"
        ) as HTMLInputElement;
        const leftInput = element.shadowRoot.getElementById(
            "border-left-width"
        ) as HTMLInputElement;
        const rightInput = element.shadowRoot.getElementById(
            "border-right-width"
        ) as HTMLInputElement;
        const bottomInput = element.shadowRoot.getElementById(
            "border-bottom-width"
        ) as HTMLInputElement;

        element.initialValue = "border:1px solid red";
        await DOM.nextUpdate();
        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border:1px solid red;border-width:10px 1px 1px;");

        element.initialValue = "border:1px solid red";
        await DOM.nextUpdate();
        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border:1px solid red;border-width:10px 1px 1px;");
        bottomInput.value = "10px";
        bottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border:1px solid red;border-width:10px 1px;");
        leftInput.value = "10px";
        leftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal(
            "border:1px solid red;border-width:10px 1px 10px 10px;"
        );
        rightInput.value = "10px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border:10px solid red;");

        rightInput.value = "";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal(
            "border:1px solid red;border-top-width:10px;border-bottom-width:10px;border-left-width:10px;border-right-width:initial;"
        );

        element.initialValue = "border-top-width:20px;border:1px solid red";
        await DOM.nextUpdate();
        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border:1px solid red;border-width:10px 1px 1px;");

        element.initialValue = "";
        await DOM.nextUpdate();
        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-top-width:10px;");

        element.initialValue = "";
        await DOM.nextUpdate();
        bottomInput.value = "10px";
        bottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-bottom-width:10px;");

        element.initialValue = "";
        await DOM.nextUpdate();
        leftInput.value = "10px";
        leftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-left-width:10px;");

        element.initialValue = "";
        await DOM.nextUpdate();
        rightInput.value = "10px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-right-width:10px;");

        element.initialValue = "border-top:1px solid red;";
        await DOM.nextUpdate();
        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-top:10px solid red;");

        element.initialValue = "border-bottom:1px solid red;";
        await DOM.nextUpdate();
        bottomInput.value = "10px";
        bottomInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-bottom:10px solid red;");

        element.initialValue = "border-left:1px solid red;";
        await DOM.nextUpdate();
        leftInput.value = "10px";
        leftInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-left:10px solid red;");

        element.initialValue = "border-right:1px solid red;";
        await DOM.nextUpdate();
        rightInput.value = "10px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border-right:10px solid red;");

        element.initialValue = "border-top-width:20px;border:1px solid red;";
        await DOM.nextUpdate();
        rightInput.value = "10px";
        rightInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("border:1px solid red;border-width:1px 10px 1px 1px;");

        element.initialValue = "border-top-width:20px;margin:10px;";
        await DOM.nextUpdate();
        topInput.value = "10px";
        topInput.dispatchEvent(event);
        await DOM.nextUpdate();
        expect(newValue).to.equal("margin:10px;border-top-width:10px;");

        await disconnect();
    });
});
