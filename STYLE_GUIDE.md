# Introduction

This is the code style guide for the FAST tooling repository. When contributing to this project please follow the standards defined in this guide.

## Branches

Branches that will be used to create a pull request to the default branch or a feature branch should use the naming pattern `users/{username}/{purpose-of-change}`.

### Features

Branches encompassing a larger body of work that will be contributed by multiple users or include multiple pull requests should use the naming pattern `features/*`.

## Files

File and folder naming in general should not include special characters or spaces. Alphanumeric is preffered, separated by dash or underscore depending on the type of file. Names should be as concise as possible while also being meaningful, and should attempt to follow any standard set by a standards governing body such as W3C.

### Organization

Folder structure should be as flat as possible. This is not to say that all files should go into a single folder, folders should exist where they make sense for larger categorizing purposes and file names can be leveraged to supply additional context.

Example:
```text
my-component/
└─ my-component.ts
└─ my-component.styles.ts
└─ my-component.template.ts
└─ my-component.spec.ts
```

### Scripts

As seen in the above example, script files should be all lowercase and dash separated. If there is need for additional context, marking a test file in the example above, this should be included separating the additional context with a period at the end of the file name.

### Markdown

Markdown files should be all uppercase, separated by an underscore e.g., CODE_OF_CONDUCT.md. This allows them to stand out from the rest of the files as documentation.

## Syntax

Much of the primarily TypeScript syntax is taken care of via `eslint` and prettier. There are times when the linter is unable to determine when naming conventions are broken, these situations are covered in the sections below.

### Functions & Methods

Functions & methods should be camelCase.

Example:
```ts
myFunction(): void {
    // example code
}
```

### Web Component Attributes

Web component attributes should be camelCased as properties and be dash separated as the HTML attribute.

Example:
```ts
@attr({ attribute: "select-mode" })
public selectMode: string;
```

An exception to this is if an attribute matches a standard HTML attribute which may not include a dash.

Example:
```ts
@attr({ attribute: "readonly" })
public readOnly: boolean;
```

When naming attributes:
- **Avoid auxiliary verbs** - prefer `selected` over `isSelected`
- **Avoid unnecessary prefixing** - prefer `collapsed` instead of `accordionCollapsed`. Unless there are multiple collapsed things, prefixing as such is redundant

### HTML class names

Class names should follow the BEM guides, where there is a single block and an optional element and modifier. The separator for a block and element should be a hypen and the separator for a block/element and modifier should be two underscores.

Examples:
```css
.block {}
.block__modifier {}
.block-element__modifier {}
.button-icon__active {}
.button__primary {}
```

Note that there is only ever a single block present, and optionally a single element and/or modifier. There are never multiple blocks, elements, or modifiers which should keep CSS class names short and readable.
