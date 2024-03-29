import { HTMLRenderLayerNavigation } from "./html-render-layer-navigation.js";
import { htmlRenderLayerNavigationTemplate as template } from "./html-render-layer-navigation.template.js";
import { htmlRenderLayerNavigationStyles as styles } from "./html-render-layer-navigation.style.js";

/**
 * A web component for use in the default slot of the \<html-render\> web component.
 * It is used to navigate the DOM.
 *
 * @alpha
 * @remarks
 * HTML Element: \<html-render-layer-navigation\>
 */
export const htmlRenderLayerNavigationComponent = HTMLRenderLayerNavigation.compose({
    baseName: "html-render-layer-navigation",
    template,
    styles,
});
