import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import fs from "fs-extra";
import { template as templateResolver } from "lodash-es";
import { ghPagesBaseUrl } from "./build/constants.js";

const __dirname = process.cwd();
const baseUrl = process.env.npm_lifecycle_event.includes("gh-pages")
    ? ghPagesBaseUrl
    : "";
const appDir = path.resolve(__dirname, "./src");
const outDir = path.resolve(__dirname, "./www");
const frontpageContent = path.resolve(appDir, "templates/content.html");
const toolbarTemplate = path.resolve(appDir, "templates/toolbar/index.html");
const footerTemplate = path.resolve(appDir, "./templates/footer/index.html");
const styleTemplate = path.resolve(appDir, "./templates/style/index.html");
const metaTemplate = path.resolve(appDir, "./templates/meta/index.html");

export default {
    entry: {
        app: path.resolve(appDir, "index.ts"),
    },
    output: {
        path: outDir,
        publicPath: "/",
        filename: "[name].js",
        clean: true,
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /.ts$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {
                                declaration: false,
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            inject: true,
            content: templateResolver(fs.readFileSync(frontpageContent, "utf8"))({
                baseUrl,
            }),
            toolbarTemplate: templateResolver(fs.readFileSync(toolbarTemplate, "utf8"))({
                baseUrl,
            }),
            footerTemplate: templateResolver(fs.readFileSync(footerTemplate, "utf8"))(),
            styleTemplate: fs.readFileSync(styleTemplate, "utf8"),
            metaTemplate: templateResolver(fs.readFileSync(metaTemplate, "utf8"))({
                baseUrl,
            }),
            isFrontpage: true,
        }),
    ],
    resolve: {
        extensions: [".js", ".ts", ".json"],
    },
};
