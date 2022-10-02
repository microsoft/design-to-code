# Message System

FAST tooling components rely on including a script which contains a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) as well as a class to manipulate the data being sent to and from it called the `MessageSystem`.

The worker performs all of the data manipulation as well as a navigational data structure based on data passed. The `MessageSystem` class allow functionality to "register" itself to accept and send data.

## Getting started

Add the web worker to your project, it is located at `@microsoft/design-to-code/dist/message-system.min.js`.

To initialize the `MessageSystem`, a config must be passed that includes the data, schemas, and web worker.

Example:
```ts
const fastMessageSystem: MessageSystem = new MessageSystem({
    webWorker: fastMessageSystemWorker,
    dataDictionary: [
        "root",
        {
            root: {
                schemaId: "myTextSchema",
                data: "Hello world"
            }
        }
    ],
    schemaDictionary: {
        myTextSchema: {
            title: "Text",
            type: "text"
        },
    },
});
```

To understand how the data dictionary and schema dictionary are structured and why, check out the section on [data formats](../data-format).

### Webpack

It is recommended that the `worker-loader` be used in a webpack project. This can look like the following setup:

`webpack.config.js`
```js
module.exports = {
    ...yourConfig,
    module: {
        rules: [
            {
                test: /message\-system\.min\.js/,
                use: {
                    loader: "worker-loader",
                },
            },
        ],
    },
};
```

`index.ts`
```ts
import MessageSystemWorker from "@microsoft/design-to-code/dist/message-system.min.js";
import { MessageSystem } from "@microsoft/design-to-code";

// Activate the worker
const fastMessageSystemWorker = new MessageSystemWorker();

// Create a new MessageSystem instance and pass the MessageSystem web worker to it
const fastMessageSystem: MessageSystem = new MessageSystem({
    webWorker: fastMessageSystemWorker,
    dataDictionary: dataDictionaryConfig as any,
    schemaDictionary,
});
```