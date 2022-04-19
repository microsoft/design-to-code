import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastToolingUnitsTextField } from "../../../src/web-components/units-text-field/index.js";

provideFASTDesignSystem()
    .withPrefix("fast-tooling")
    .register(fastToolingUnitsTextField());
