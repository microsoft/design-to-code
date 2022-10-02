import { PlaywrightTestConfig } from "@playwright/test";
const config: PlaywrightTestConfig = {
    testDir: "src",
    testMatch: "**/?(*.)+(spec).+(pw).+(ts)",
    globalSetup: "playwright.global-setup.ts",
    use: {
        baseURL: "http://localhost:7776",
    },
};
export default config;
