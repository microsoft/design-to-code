import { expect, test } from "@playwright/test";

test.describe("Color Picker", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/color-picker");
    });

    test("should exist and initialize", async ({ page }) => {
        const color_picker = page.locator("#color_picker");
        await expect(color_picker).not.toBeNull();
        await expect(page.locator('#control input[type="text"]')).toHaveValue("");
    });

    test("should open when clicked", async ({ page }) => {
        await page.click('#control input[type="text"]');
        const colorUI = page.locator(".color-ui");
        await expect(colorUI).not.toBeNull();
        await expect(colorUI).toHaveCSS("display", "flex");
    });

    test("setting value should update UI", async ({ page }) => {
        await expect(page.locator('#control input[type="text"]')).toHaveValue("");
        await page.click('#control input[type="text"]');
        await page.fill('#control input[type="text"]', "#AABBCC");
        // Testing #outputValue ensures that the change event was fired.
        await expect(page.locator("#outputValue")).toHaveValue("#AABBCC");

        await expect(
            page.locator('.color-ui fast-text-field:nth-child(1) input[type="text"]')
        ).toHaveValue("170");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(2) input[type="text"]')
        ).toHaveValue("187");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(3) input[type="text"]')
        ).toHaveValue("204");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(4) input[type="text"]')
        ).toHaveValue("210");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(5) input[type="text"]')
        ).toHaveValue("17");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(6) input[type="text"]')
        ).toHaveValue("80");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(7) input[type="text"]')
        ).toHaveValue("100");
        await page.fill('#control input[type="text"]', "rgba(64,128,127,0.5)");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(1) input[type="text"]')
        ).toHaveValue("64");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(2) input[type="text"]')
        ).toHaveValue("128");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(3) input[type="text"]')
        ).toHaveValue("127");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(4) input[type="text"]')
        ).toHaveValue("179");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(5) input[type="text"]')
        ).toHaveValue("50");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(6) input[type="text"]')
        ).toHaveValue("50");
        await expect(
            page.locator('.color-ui fast-text-field:nth-child(7) input[type="text"]')
        ).toHaveValue("50");
    });

    test("setting UI should update value", async ({ page }) => {
        await expect(page.locator('#control input[type="text"]')).toHaveValue("");
        await page.click('#control input[type="text"]');
        await page.fill(
            '.color-ui fast-text-field:nth-child(1) input[type="text"]',
            "170"
        );
        await page.fill(
            '.color-ui fast-text-field:nth-child(2) input[type="text"]',
            "187"
        );
        await page.fill(
            '.color-ui fast-text-field:nth-child(3) input[type="text"]',
            "204"
        );
        await expect(page.locator('#control input[type="text"]')).toHaveValue("#aabbcc");
        await expect(page.locator("#outputValue")).toHaveValue("#aabbcc");
        await page.fill(
            '.color-ui fast-text-field:nth-child(4) input[type="text"]',
            "179"
        );
        await page.fill(
            '.color-ui fast-text-field:nth-child(5) input[type="text"]',
            "50"
        );
        await page.fill(
            '.color-ui fast-text-field:nth-child(6) input[type="text"]',
            "50"
        );
        await page.fill(
            '.color-ui fast-text-field:nth-child(7) input[type="text"]',
            "50"
        );
        await expect(page.locator('#control input[type="text"]')).toHaveValue(
            "rgba(64,128,126,0.5)"
        );
        await expect(page.locator("#outputValue")).toHaveValue("rgba(64,128,126,0.5)");
    });

    test("clicking pickers should change value", async ({ page }) => {
        await expect(page.locator('#control input[type="text"]')).toHaveValue("");
        await page.click('#control input[type="text"]');
        await page.click(".sat-light-picker");
        await expect(page.locator('#control input[type="text"]')).toHaveValue("#804040");
        await expect(page.locator("#outputValue")).toHaveValue("#804040");

        await page.click(".hue-picker");
        await expect(page.locator('#control input[type="text"]')).toHaveValue("#40807f");
        await expect(page.locator("#outputValue")).toHaveValue("#40807f");

        await page.click(".alpha-mask");
        await expect(page.locator('#control input[type="text"]')).toHaveValue(
            "rgba(64,128,127,0.5)"
        );
        await expect(page.locator("#outputValue")).toHaveValue("rgba(64,128,127,0.5)");
    });

    test("dragging sliders should change value", async ({ page }) => {
        await expect(page.locator('#control input[type="text"]')).toHaveValue("");
        await page.click('#control input[type="text"]');
        await page.click(".sat-light-picker");
        await expect(page.locator('#control input[type="text"]')).toHaveValue("#804040");
        await page.mouse.move(142, 212);
        await page.mouse.down();
        await page.mouse.move(200, 212);
        await page.mouse.up();
        await expect(page.locator('#control input[type="text"]')).toHaveValue("#821d1d");
        await expect(page.locator("#outputValue")).toHaveValue("#821d1d");
        await page.mouse.move(44, 344);
        await page.mouse.down();
        await page.mouse.move(180, 344);
        await page.mouse.up();
        await expect(page.locator('#control input[type="text"]')).toHaveValue("#251d82");
        await expect(page.locator("#outputValue")).toHaveValue("#251d82");
        await page.mouse.move(242, 395);
        await page.mouse.down();
        await page.mouse.move(100, 395);
        await page.mouse.up();
        await expect(page.locator('#control input[type="text"]')).toHaveValue(
            "rgba(37,29,130,0.29)"
        );
        await expect(page.locator("#outputValue")).toHaveValue("rgba(37,29,130,0.29)");
    });
});
