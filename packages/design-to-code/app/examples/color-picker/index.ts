import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastTextField } from "@microsoft/fast-components";
import { colorPickerComponent } from "../../../src/web-components/color-picker/index.js";

provideFASTDesignSystem()
    .withPrefix("dtc")
    .register(fastTextField())
    .register(colorPickerComponent());
