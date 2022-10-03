import { expect, Page, test } from "@playwright/test";

/* eslint-disable-next-line */
async function getMessage(page: Page, positionFromEnd: number): Promise<string> {
    const messageOutput = await page.locator(
        "#messageContainer span:nth-last-child(" + positionFromEnd + ")"
    );
    await expect(messageOutput).not.toBeNull();
    return await messageOutput.textContent();
}

test.describe("HTML Render Layer Navigation", () => {
    test.beforeEach(async ({ page }) => {
        // Playwright is configured to use http://localhost:7776 as the base URL for all tests
        // so you can use a relative URL to navigate to a different page.
        await page.goto("/render");
        const htmlRender = page.locator("#htmlRender");
        await expect(htmlRender).not.toBeNull();
        const content = await htmlRender.locator("span").textContent();
        expect(content).toBe("Dynamic Markup!");
        await page.waitForTimeout(100);
    });

    test("should exist and initialize", async ({ page }) => {
        const layer = await page.locator(
            "dtc-html-render-layer-navigation .navigation-select"
        );
        expect(layer).not.toBeNull();
        await expect(layer).toHaveClass(
            "navigation-select navigation-select__insetX navigation-select__active"
        );
    });

    test("should show hover on hover target", async ({ page }) => {
        let layer = await page.locator(
            "dtc-html-render-layer-navigation .navigation-hover"
        );
        expect(layer).not.toBeNull();
        await expect(layer).not.toHaveClass("navigation-hover navigation-hover__active");

        page.mouse.move(55, 60);
        await page.waitForTimeout(100);

        layer = await page.locator("dtc-html-render-layer-navigation .navigation-hover");
        await expect(layer).toHaveClass("navigation-hover navigation-hover__active");
    });

    test("should not show hover on selected target", async ({ page }) => {
        let layer = await page.locator(
            "dtc-html-render-layer-navigation .navigation-hover"
        );
        expect(layer).not.toBeNull();
        await expect(layer).not.toHaveClass("navigation-hover navigation-hover__active");

        page.mouse.move(55, 80);
        await page.waitForTimeout(100);

        layer = await page.locator("dtc-html-render-layer-navigation .navigation-hover");
        await expect(layer).not.toHaveClass("navigation-hover navigation-hover__active");
    });

    test("should select click target", async ({ page }) => {
        let layer = await page.locator(
            "dtc-html-render-layer-navigation .navigation-select"
        );
        expect(layer).not.toBeNull();
        await expect(layer).toHaveCSS("top", "21px");
        await expect(layer.locator(".select-pill")).toHaveText("root_div");

        await page.click("#testbutton2");
        await page.waitForTimeout(100);

        layer = await page.locator("dtc-html-render-layer-navigation .navigation-select");
        expect(layer).not.toBeNull();
        await expect(layer).toHaveCSS("top", "52px");
        await expect(layer.locator(".select-pill")).toHaveText("span");
    });

    test("should inset selected area only when adjacent to edge of window", async ({
        page,
    }) => {
        let layer = await page.locator(
            "dtc-html-render-layer-navigation .navigation-select"
        );
        expect(layer).not.toBeNull();
        await expect(layer).toHaveClass(
            "navigation-select navigation-select__insetX navigation-select__active"
        );

        await page.click("#testbutton2");
        await page.waitForTimeout(100);

        layer = await page.locator("dtc-html-render-layer-navigation .navigation-select");
        expect(layer).not.toBeNull();
        await expect(layer).toHaveClass("navigation-select navigation-select__active");
    });
});
