import { HTMLRender, htmlRenderOriginatorId } from "./html-render.js";
import { htmlRenderTemplate as template } from "./html-render.template.js";
import { htmlRenderStyles as styles } from "./html-render.styles.js";

/**
 * A web component for rendering HTML using the MessageSystem.
 *
 * @alpha
 * @remarks
 * HTML Element: \<html-render\>
 */
export const fastToolingHTMLRender = HTMLRender.compose({
    baseName: "html-render",
    template,
    styles,
});

export { htmlRenderOriginatorId };
