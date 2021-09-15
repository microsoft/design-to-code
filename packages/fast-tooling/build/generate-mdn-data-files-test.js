import { mapCSSProperties } from "../src/data-utilities/mapping.mdn-data";
import { css as mdnCSS } from "mdn-data";
import chalk from "chalk";
import { properties } from "../src/css-data";
import { isEqual } from "lodash-es";

(function () {
    const updatedCSSProperties = mapCSSProperties(
        {
            properties: mdnCSS.properties,
            syntaxes: mdnCSS.syntaxes,
            types: mdnCSS.types,
        },
        {
            status: "standard",
        }
    );

    if (isEqual(updatedCSSProperties, properties)) {
        console.log(
            chalk.green("The CSS data file is up to date with the properties from MDN.")
        );
    } else {
        console.log(
            chalk.yellow(
                "The CSS properties from MDN have been updated, run `yarn convert:mdn-data` to update the CSS data file."
            )
        );
    }
});
