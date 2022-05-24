# Data Format

Data must be formatted as JSON, and descriptions of data must follow JSON Schema.

## Data dictionary

The data dictionary is an array of two items, the first being the root item and the second being the dictionary of data. This is done to enable data nesting behavior.

Example:
```ts
import { DataDictionary } from "@microsoft/fast-tooling";

const myDataDictionary: DataDictionary<unknown> = [
    "root",
    {
        root: {
            schemaId: "myTextSchema",
            data: "Hello world"
        }
    }
]
```

## Schema dictionary

The schema dictionary is a dictionary of possible JSON schemas that the data can conform to. The `$id` is used as the `key` in the dictionary object.

Example:
```ts
import { SchemaDictionary } from "@microsoft/fast-tooling";

const mySchemaDictionary: SchemaDictionary = {
    myTextSchema: {
        title: "Text",
        type: "text"
    },
    myNumberSchema: {
        title: "Number",
        type: "number"
    }
}
```

## JSON Schema caveats

For ease of use, keep JSON Schemas as simple as possible. Avoid use of the following keywords which are currently not supported by the `@microsoft/fast-tooling` or `@microsoft/fast-tooling-react` packages:

- `allOf`
- `$ref`