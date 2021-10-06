import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastToolingIncrementTextField } from "../../../src/web-components/increment-text-field";

provideFASTDesignSystem()
    .withPrefix("fast-tooling")
    .register(fastToolingIncrementTextField());
