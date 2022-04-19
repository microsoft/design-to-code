import { provideFASTDesignSystem } from "@microsoft/fast-components";
import { fastButton } from "@microsoft/fast-components";
import { fastToolingFile } from "../../../src/web-components/file/index.js";
import { fastToolingFileActionObjectUrl } from "../../../src/web-components/file-action-objecturl/index.js";

provideFASTDesignSystem()
    .register(fastButton())
    .withPrefix("fast-tooling")
    .register(fastToolingFile())
    .register(fastToolingFileActionObjectUrl());
