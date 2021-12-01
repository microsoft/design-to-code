import { default as PlaywrightTestConfig } from "./playwright.config";

const config = PlaywrightTestConfig;
config.webServer = {
    command: "npm run start",
    port: 7003,
    timeout: 240 * 1000,
    reuseExistingServer: !process.env.CI,
};

export default config;
