import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastToolingCSSBoxModel } from "../../../src/web-components/css-box-model";
import { fastToolingUnitsTextField } from "../../../src/web-components/units-text-field";

provideFASTDesignSystem()
    .withPrefix("fast-tooling")
    .register(fastToolingUnitsTextField(), fastToolingCSSBoxModel());
