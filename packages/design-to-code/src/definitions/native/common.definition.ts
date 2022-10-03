import { WebComponentAttribute } from "../../data-utilities/web-component.js";
import { DataType } from "../../data-utilities/index.js";

export const commonHTMLAttributes: WebComponentAttribute[] = [
    {
        name: "style",
        type: DataType.string,
        title: "CSS",
        description: "The inline CSS style",
        default: "",
        required: false,
    },
];
