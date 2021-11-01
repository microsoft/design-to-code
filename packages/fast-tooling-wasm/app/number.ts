import NumberSchema from "./schemas/number.schema.json";
import NumberDefaultSchema from "./schemas/number.default.schema.json";
import NumberExamplesSchema from "./schemas/number.examples.schema.json";
import NumberEnumSchema from "./schemas/number.enum.schema.json";
import NumberExclusiveMinimumSchema from "./schemas/number.exclusive-minimum.schema.json";
import NumberMinimumSchema from "./schemas/number.minimum.schema.json";
import NumberExclusiveMaximumSchema from "./schemas/number.exclusive-maximum.schema.json";
import NumberMaximumSchema from "./schemas/number.maximum.schema.json";
import NumberMultipleOfSchema from "./schemas/number.multiple-of.schema.json";

export interface PermutatorConfig {
    schema: any;
    iteration: number;
}

const content = document.getElementById("number");

const configs: PermutatorConfig[] = [
    {
        schema: NumberSchema,
        iteration: 2,
    },
    {
        schema: NumberDefaultSchema,
        iteration: 1,
    },
    {
        schema: NumberExamplesSchema,
        iteration: 2,
    },
    {
        schema: NumberEnumSchema,
        iteration: 11,
    },
    {
        schema: NumberExclusiveMinimumSchema,
        iteration: 4,
    },
    {
        schema: NumberMinimumSchema,
        iteration: 1,
    },
    {
        schema: NumberExclusiveMaximumSchema,
        iteration: 1,
    },
    {
        schema: NumberMaximumSchema,
        iteration: 1,
    },
    {
        schema: NumberMultipleOfSchema,
        iteration: 1,
    },
];

function createNumberButton(config: PermutatorConfig, permutate: (s: string) => any) {
    const button = document.createElement("button");
    button.innerText = `Get Permutation: ${(config.schema as any).$id}`;
    button.onclick = callNumberPermutationFactory(config, permutate);
    content.appendChild(button);
}

function callNumberPermutationFactory(
    config: PermutatorConfig,
    permutate: (s: string) => any
) {
    return () => {
        console.log(permutate(JSON.stringify(config)));
    };
}

function createJSONSchemaPreview(config: PermutatorConfig) {
    const pre = document.createElement("pre");
    pre.innerText = JSON.stringify(config.schema, null, 2);
    content.appendChild(pre);
}

export function createNumberButtonFactory(permutate: (s: string) => any) {
    configs.forEach(config => {
        createNumberButton(config, permutate);
        createJSONSchemaPreview(config);
    });
}
