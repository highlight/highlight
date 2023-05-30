# UI Component Library

Highlight's UI component library.

## Adding A Component

You can run the component generator to create the files needed for a new component.

```sh
yarn g ui component [ComponentName]
```

Try to avoid adding components to the UI package unless you are confident they will be reused many times across the app. As a rule of thumb, try to create the component in the main app and promote it to the UI package after seeing it used more than twice.

## Adding An Icon

Watch [this quick screencast](https://www.loom.com/share/9232df2413fd4719b1a01c67d9cb6cc4) to learn how to export the SVG for an icon from Figma and generate the React for using it in our app.
