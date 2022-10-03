import { fastSwitch, fastTooltip } from "@microsoft/fast-components";
import { DesignSystem } from "@microsoft/fast-foundation";
import { cssLayoutComponent } from "../../../src/web-components/css-layout/index.js";

DesignSystem.getOrCreate()
    .withPrefix("dtc")
    .register(fastSwitch(), fastTooltip(), cssLayoutComponent());
