import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { unitsTextFieldComponent } from "../../../src/web-components/units-text-field/index.js";

provideFASTDesignSystem().withPrefix("dtc").register(unitsTextFieldComponent());
