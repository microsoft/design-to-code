import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastToolingCSSBoxModel } from "../../../src/web-components/css-box-model";

provideFASTDesignSystem().withPrefix("fast-tooling").register(fastToolingCSSBoxModel());
