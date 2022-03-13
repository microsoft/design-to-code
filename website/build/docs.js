import sidebar from "../docs/sidebar.js";
import path from "path";
import fs from "fs-extra";
import { marked } from "marked";
import { template as templateResolver } from "lodash-es";
import versions from "../docs/versions.json";

const __dirname = process.cwd();
const docsDir = path.resolve(__dirname, "docs");
const outDir = path.resolve(__dirname, "www/docs");
const appDir = path.resolve(__dirname, "src");
const toolbarTemplate = path.resolve(appDir, "templates/toolbar/index.html");
const footerTemplate = path.resolve(appDir, "templates/footer/index.html");
const styleTemplate = path.resolve(appDir, "templates/style/index.html");
const metaTemplate = path.resolve(appDir, "templates/meta/index.html");
const categoryTemplate = path.resolve(docsDir, "templates/category/index.html");
const sidebarTemplate = path.resolve(docsDir, "templates/sidebar/index.html");
const versionTemplate = path.resolve(docsDir, "templates/version/index.html");
const docFiles = {};

const type = {
    category: "category",
    doc: "doc",
};

/**
 * Converts a markdown file to an html string
 *
 * @param {string} markdownPath
 * @param {string} htmlPath
 * @return Promise<string>
 */
function getHTMLStringFromMarkdownPath(markdownPath, htmlPath) {
    return new Promise((resolve, reject) => {
        fs.ensureDir(path.resolve(outDir, htmlPath))
            .then(() => {
                fs.readFile(path.resolve(docsDir, markdownPath), "utf8", (err, data) => {
                    if (err) {
                        throw err;
                    }
                    resolve(marked.parse(data));
                });
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * Returns an object with `version` and `package` strings if a path is tied to
 * a specific version, otherwise returns null.
 *
 * @param {string} path
 * @returns null | object
 */
function getDocumentVersionAndPackageName(path) {
    const pathItems = path.split("/");
    const foundVersion = pathItems.findIndex(pathItem => {
        return pathItem.match(/\d+\.x/);
    });

    if (foundVersion !== -1) {
        return {
            version: pathItems[foundVersion],
            package: `@microsoft/${pathItems[foundVersion - 1]}`,
        };
    }

    return null;
}

/**
 * Converts a document from markdown to HTML and adds it to the docFiles object
 *
 * @param {object} documentationItem
 * @param {string} template
 * @returns Promise
 */
function convertDocument(documentationItem, template, isVersionDoc) {
    return new Promise((resolve, reject) => {
        getHTMLStringFromMarkdownPath(
            path.resolve(docsDir, `${documentationItem.path}.md`),
            documentationItem.path
        )
            .then(html => {
                const versionAndPackageName = getDocumentVersionAndPackageName(
                    documentationItem.path
                );
                let versionInfo = null;

                if (versionAndPackageName !== null) {
                    versionInfo = {
                        docVersion: versionAndPackageName.version,
                        otherAvailableVersions: versions[
                            versionAndPackageName.package
                        ].versions
                            .filter(value => {
                                return value !== versionAndPackageName.version;
                            })
                            .reduce((previousValue, nextValue) => {
                                previousValue.push({
                                    path: documentationItem.path.replace(
                                        versionAndPackageName.version,
                                        nextValue
                                    ),
                                    label: nextValue,
                                });
                                return previousValue;
                            }, []),
                    };
                }

                docFiles[documentationItem.path] = {
                    type: type.doc,
                    path: documentationItem.path,
                    html: templateResolver(template)({
                        htmlWebpackPlugin: {
                            options: {
                                content: html,
                                toolbarTemplate: fs.readFileSync(toolbarTemplate, "utf8"),
                                footerTemplate: templateResolver(
                                    fs.readFileSync(footerTemplate, "utf8")
                                )(),
                                styleTemplate: fs.readFileSync(styleTemplate, "utf8"),
                                metaTemplate: fs.readFileSync(metaTemplate, "utf8"),
                                sidebar: templateResolver(
                                    fs.readFileSync(sidebarTemplate, "utf8")
                                )({
                                    sidebar,
                                    currentPath: documentationItem.path,
                                }),
                                versionInfo:
                                    versionInfo !== null
                                        ? templateResolver(
                                              fs.readFileSync(versionTemplate, "utf8")
                                          )({
                                              versionInfo,
                                          })
                                        : null,
                            },
                        },
                    }),
                };

                if (versionInfo && versionInfo.otherAvailableVersions && !isVersionDoc) {
                    writeToHTML(
                        versionInfo.otherAvailableVersions.reduce(
                            (previousValue, nextValue) => {
                                previousValue.push({
                                    type: type.doc,
                                    label: documentationItem.label,
                                    path: nextValue.path,
                                });

                                return previousValue;
                            },
                            []
                        ),
                        template,
                        true
                    );
                }

                resolve();
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * Converts markdown documentation item, either a category or document
 *
 * @param {string} category
 * @param {string} template
 * @returns Promise
 */
function convertMarkdownDocumentation(category, template, isVersionDoc) {
    return new Promise((resolve, reject) => {
        category.forEach(documentationItem => {
            if (documentationItem.type === type.category) {
                const items = documentationItem.items.reduce(
                    (previousValue, nextDocumentationItem) => {
                        previousValue.push({
                            label: nextDocumentationItem.label,
                            path: nextDocumentationItem.path,
                        });
                        return previousValue;
                    },
                    []
                );
                docFiles[documentationItem.path] = {
                    type: type.category,
                    path: documentationItem.path,
                    html: templateResolver(template)({
                        htmlWebpackPlugin: {
                            options: {
                                content: templateResolver(
                                    fs.readFileSync(categoryTemplate, "utf8")
                                )({
                                    items,
                                    label: documentationItem.label,
                                }),
                                toolbarTemplate: fs.readFileSync(toolbarTemplate, "utf8"),
                                footerTemplate: templateResolver(
                                    fs.readFileSync(footerTemplate, "utf8")
                                )(),
                                styleTemplate: fs.readFileSync(styleTemplate, "utf8"),
                                metaTemplate: fs.readFileSync(metaTemplate, "utf8"),
                                sidebar: templateResolver(
                                    fs.readFileSync(sidebarTemplate, "utf8")
                                )({
                                    sidebar,
                                    currentPath: documentationItem.path,
                                }),
                            },
                        },
                    }),
                };
                writeToHTML(documentationItem.items, template, isVersionDoc).then(() => {
                    resolve();
                });
            } else if (documentationItem.type === type.doc) {
                convertDocument(documentationItem, template, isVersionDoc).then(() => {
                    resolve();
                });
            } else {
                reject("Unrecognizable type used in sidebar");
            }
        });
    });
}

/**
 * Write a document or category to an HTML file
 *
 * @param {array} category
 * @param {string} template
 * @returns Promise
 */
function writeToHTML(category, template, isVersionDoc) {
    return new Promise((resolve, reject) => {
        convertMarkdownDocumentation(category, template, isVersionDoc).then(() => {
            for (const [, value] of Object.entries(docFiles)) {
                fs.ensureDir(path.resolve(outDir, value.path))
                    .then(() => {
                        fs.writeFileSync(
                            path.resolve(outDir, value.path, "index.html"),
                            value.html
                        );
                    })
                    .finally(() => {
                        resolve();
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    });
}

/**
 * Execute the readfile on the index.html which serves as the frontpage template and documentation templates
 * then write to HTML all of the documentation as defined in the sidebar.json
 */
fs.readFile(path.resolve(__dirname, "src/index.html"), "utf8", (err, data) => {
    if (err) {
        throw err;
    }

    writeToHTML(sidebar.documentation, data, false);
});

/**
 * TODO:
 * - styling
 */
