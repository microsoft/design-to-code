# Form

The `Form` is a React component that generates fields based on the JSON Schema, so if a JSON Schema specifies a "type" of "string", a text input will appear.

The component is pluggable and stylable, so if there is a requirement to replace any fields or change the styling to match the rest of your application, this is easy to do.

## Usage

The basic usage only requires the passing of the `MessageSystem`. The component will then register itself and begin sending and recieving data.

```tsx
import { Form } from "@microsoft/dtc-react";

<Form messageSystem={fastMessageSystem} />
```

### Modular Usage

There are two exports for the `Form`, the default `Form` and `ModularForm`. The `ModularForm` is for use with any React component that may share a dependency on `react-dnd` such as the `Navigation` component, or the `Viewer`. It's safe to assume that if you are using more than one React component from the `@microsoft/dtc-react` package you must use the `ModularForm`.

```tsx
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { ModularForm } from "@microsoft/dtc-react";

<DndProvider backend={HTML5Backend}>
    <ModularForm messageSystem={fastMessageSystem} />
</DndProvider>
```

## Styling

The `Form` leverages [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) and the following are available:

- `--dtc-accent-color`
- `--dtc-l1-color`
- `--dtc-l4-color`
- `--dtc-text-color`
- `--dtc-l3-fill-color`
- `--dtc-error-color`
- `--dtc-floating-color`

## Adding a custom control

There may be occasions where a custom control will serve better than the default form elements provided by the `Form`. For this situation a `StandardControlPlugin` is made available that will provide the surrounding UI for the `Form` but allow the form element or custom control to be created.

```tsx
import { ModularForm, StandardControlPlugin } from "@microsoft/dtc-react";

<Form
    messageSystem={fastMessageSystem}
    controls={[
        new StandardControlPlugin({
            id: "foo",
            control: (config) => {
                return (
                    <input
                        value={config.value}
                    />
                )
            }
        })
    ]}
/>
```