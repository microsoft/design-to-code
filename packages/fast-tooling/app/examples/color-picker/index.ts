import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastTextField } from "@microsoft/fast-components";
import { fastToolingColorPicker } from "../../../src/web-components/color-picker/index.js";

provideFASTDesignSystem()
    .register(fastTextField())
    .withPrefix("fast-tooling")
    .register(fastToolingColorPicker());
