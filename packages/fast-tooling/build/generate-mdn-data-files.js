import {
    mapCSSProperties,
    mapCSSSyntaxes,
} from "../dist/cjs/data-utilities/mapping.mdn-data";
import { css as mdnCSS } from "mdn-data";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const outFilePath = path.resolve(__dirname, "../src/css-data.js");
const propertiesOutFilePath = path.resolve(__dirname, "../src/css-data.properties.ts");
const syntaxOutFilePath = path.resolve(__dirname, "../src/css-data.syntax.ts");
const typesOutFilePath = path.resolve(__dirname, "../src/css-data.types.ts");
const today = new Date();
const comment = `/**
 * This file is generated from build/generate-mdn-data-files.js
 * any modifications will be overwritten.
 * 
 * Last modified: ${today.toLocaleDateString()}
 */
`;

/**
 * This function generates the file src/css-data.ts
 */

(function () {
    fs.writeFile(
        outFilePath,
        `${comment}export const properties = ${JSON.stringify(
            mapCSSProperties(
                {
                    properties: mdnCSS.properties,
                    syntaxes: mdnCSS.syntaxes,
                    types: mdnCSS.types,
                },
                {
                    status: "standard",
                }
            ),
            null,
            4
        )}\n\nexport const syntaxes = ${JSON.stringify(
            mapCSSSyntaxes({
                properties: mdnCSS.properties,
                syntaxes: mdnCSS.syntaxes,
                types: mdnCSS.types,
            }),
            null,
            4
        )}`,
        {},
        error => {
            chalk.red(error);
        }
    );

    fs.writeFile(
        propertiesOutFilePath,
        `${comment}export type Property = ${Object.keys(mdnCSS.properties)
            .map(propertyItem => {
                return `"<'${propertyItem}'>"`;
            })
            .join(" | ")};`,
        {},
        error => {
            chalk.red(error);
        }
    );

    fs.writeFile(
        syntaxOutFilePath,
        `${comment}export type Syntax = ${Object.keys(mdnCSS.syntaxes)
            .map(syntaxItem => {
                return `"<${syntaxItem}>"`;
            })
            .join(" | ")};`,
        {},
        error => {
            chalk.red(error);
        }
    );

    fs.writeFile(
        typesOutFilePath,
        `${comment}export type Type = ${Object.keys(mdnCSS.types)
            .map(typeItem => {
                return `"<${typeItem}>"`;
            })
            .join(" | ")};`,
        {},
        error => {
            chalk.red(error);
        }
    );
})();
