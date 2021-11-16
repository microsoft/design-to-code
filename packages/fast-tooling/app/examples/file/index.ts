import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastButton } from "@microsoft/fast-components";
import { fastToolingFile } from "../../../src/web-components/file";
import { fastToolingFileActionObjectUrl } from "../../../src/web-components/file-action-objecturl";

provideFASTDesignSystem()
    .register(fastButton())
    .withPrefix("fast-tooling")
    .register(fastToolingFile())
    .register(fastToolingFileActionObjectUrl());
