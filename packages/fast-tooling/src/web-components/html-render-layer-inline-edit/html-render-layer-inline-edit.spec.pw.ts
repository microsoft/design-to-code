import { expect, Page, test } from "@playwright/test";

async function getMessage(page: Page, positionFromEnd: number): Promise<string> {
    const messageOutput = await page.locator(
        "#messageContainer span:nth-last-child(" + positionFromEnd + ")"
    );
    await expect(messageOutput).not.toBeNull();
    return await messageOutput.textContent();
}

test.describe("HTML Render Layer Inline Edit", () => {
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
        const editor = await page.locator(
            "fast-tooling-html-render-layer-inline-edit .edit-textArea"
        );
        expect(editor).not.toBeNull();
        await expect(editor).toHaveCSS("display", "none");
    });

    test("should show on double click", async ({ page }) => {
        page.mouse.dblclick(55, 60);
        await page.waitForTimeout(100);

        const editor = await page.locator(
            "fast-tooling-html-render-layer-inline-edit .edit-textArea__active"
        );
        expect(editor).not.toBeNull();
        await expect(editor).toHaveCSS("display", "block");
        await expect(editor).toHaveCSS("top", "52px");
        await expect(editor).toHaveCSS("height", "24px");
        await expect(editor).toHaveCSS("width", "126.484px");
    });

    test("should take focus and navigate on double click", async ({ page }) => {
        page.mouse.dblclick(55, 60);
        await page.waitForTimeout(500);
        const messageOutput = await page.locator("#messageContainer");
        await expect(messageOutput).toHaveText(/takeFocus/);
        await expect(messageOutput).toHaveText(/dblclick text/);
        await expect(messageOutput).toHaveText(/Navigation: text/);
    });

    test("should release and commit on enter or loss of focus", async ({ page }) => {
        page.mouse.dblclick(55, 60);
        await page.waitForTimeout(100);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(100);
        await expect(await getMessage(page, 2)).toBe("release");
        await expect(await getMessage(page, 1)).toBe(
            "Inline Edit: text = Dynamic Markup!"
        );
    });

    test("should update text on commit", async ({ page }) => {
        page.mouse.dblclick(55, 60);
        await page.waitForTimeout(100);
        await page.keyboard.type("foo");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(100);
        await expect(await getMessage(page, 1)).toBe(
            "Inline Edit: text = Dynamic Markup!foo"
        );
        const htmlRender = page.locator("#htmlRender");
        await expect(htmlRender).not.toBeNull();
        const content = await htmlRender.locator("span").textContent();
        expect(content).toBe("Dynamic Markup!foo");
    });
});
