import { expect, Page, test } from "@playwright/test";

async function getMessage(page: Page, positionFromEnd: number): Promise<string> {
    const messageOutput = await page.locator(
        "#messageContainer span:nth-last-child(" + positionFromEnd + ")"
    );
    await expect(messageOutput).not.toBeNull();
    return await messageOutput.textContent();
}

test.describe("HTML Render", () => {
    test.beforeEach(async ({ page }) => {
        // Playwright is configured to use http://localhost:7776 as the base URL for all tests
        // so you can use a relative URL to navigate to a different page.
        await page.goto("/render");
        const htmlRender = await page.locator("#htmlRender");
        expect(htmlRender).not.toBeNull();
        const content = await htmlRender.locator("span").textContent();
        expect(content).toBe("Dynamic Markup!");
        await page.waitForTimeout(100);
    });

    test("should exist and initialize", async ({ page }) => {
        const htmlRender = await page.locator("#htmlRender");
        expect(htmlRender).not.toBeNull();
        expect(htmlRender.locator(".htmlRender")).not.toBeNull();
    });
    test("should render markup", async ({ page }) => {
        const htmlRender = await page.locator("#htmlRender");
        expect(htmlRender).not.toBeNull();
        const content = await htmlRender.locator("span").textContent();
        expect(content).toBe("Dynamic Markup!");
    });
    test("should send navigation messages when clicked", async ({ page }) => {
        await page.click("#htmlRender span");
        await expect(await getMessage(page, 1)).toBe("Navigation: span");

        await page.click("#htmlRender div[data-datadictionaryid=root]");
        await expect(await getMessage(page, 1)).toBe("Navigation: root");
    });
    test("should update layers on navigation message", async ({ page }) => {
        await expect(await getMessage(page, 1)).toBe("click root");

        await page.click("#testbutton2");
        await page.waitForTimeout(100);
        await expect(await getMessage(page, 1)).toBe("click span");

        await page.click("#testbutton1");
        await page.waitForTimeout(100);
        await expect(await getMessage(page, 1)).toBe("click root");
    });
    test("should send hover and blur activity to layers", async ({ page }) => {
        page.mouse.move(55, 60);
        await page.waitForTimeout(100);
        await expect(await getMessage(page, 1)).toBe("hover span");

        page.mouse.move(55, 80);
        await page.waitForTimeout(100);
        await expect(await getMessage(page, 1)).toBe("blur");
    });
    test("should not send hover activity on selected element", async ({ page }) => {
        await page.click("#testbutton2");
        await page.waitForTimeout(100);

        page.mouse.move(55, 60);
        await page.waitForTimeout(100);

        await expect(await getMessage(page, 1)).toBe("click span");

        page.mouse.move(55, 80);
        await page.waitForTimeout(100);

        await expect(await getMessage(page, 1)).toBe("hover root");
    });
    test("should click activity to layers", async ({ page }) => {
        page.mouse.click(55, 60);
        await page.waitForTimeout(100);

        await expect(await getMessage(page, 2)).toBe("click span");

        page.mouse.click(55, 80);
        await page.waitForTimeout(100);

        await expect(await getMessage(page, 2)).toBe("click root");
    });
    test("should send navigation on tab", async ({ page }) => {
        page.keyboard.press("Tab");
        page.keyboard.press("Tab");
        page.keyboard.press("Tab");
        await page.waitForTimeout(100);

        await expect(await getMessage(page, 2)).toBe("click span");
        await expect(await getMessage(page, 1)).toBe("Navigation: span");

        page.keyboard.press("Shift+Tab");
        await page.waitForTimeout(100);
        await expect(await getMessage(page, 2)).toBe("click root");
        await expect(await getMessage(page, 1)).toBe("Navigation: root");
    });
});
