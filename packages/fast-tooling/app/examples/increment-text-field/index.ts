import { DesignSystem } from "@microsoft/fast-foundation";
import { fastToolingIncrementTextField } from "../../../src/web-components/increment-text-field";

DesignSystem.getOrCreate()
    .withPrefix("fast-tooling")
    .register(fastToolingIncrementTextField());

document.body.setAttribute("style", "margin: 0");
