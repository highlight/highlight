---
title: Building a Type-Safe Tailwind with vanilla-extract
createdAt: 2023-04-18T12:00:00.000Z
readingTime: 13
authorFirstName: Chris
authorLastName: Schmitz
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/ccschmitz'
authorLinkedIn: 'https://www.linkedin.com/in/ccschmitz'
authorGithub: 'https://github.com/ccschmitz'
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FViK27IG7TCe0YDK20tFy&w=3840&q=75
tags: 'Frontend, Engineering'
metaTitle: Building a Type-Safe Tailwind with vanilla-extract
---

[_Tailwind CSS_](https://tailwindcss.com/ "https://tailwindcss.com/") is a popular utility-first CSS framework that provides a great workflow for building UI. I encourage you to try it out if you haven't already; there's a reason it's [_growing so quickly_](https://npmtrends.com/tailwindcss "https://npmtrends.com/tailwindcss") in popularity.

Although Tailwind has been a big step forward in many ways, it has always felt a little lacking in certain areas. One key issue is that there's no type safety, which can lead to referencing an incorrect value and not realizing it until runtime. Another problem I've seen is people getting lost in the sea of classes provided out of the box. Finally, building up the string of classes that need to be applied conditionally can get very messy.

We believe we've found a great middle ground to this by using [_vanilla-extract_](https://vanilla-extract.style/ "https://vanilla-extract.style/")'s [_Sprinkles_](https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles "https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles") to build some utilities that can be used to generate and apply utility classes via a prop-based API (&lt;Card pt={10}>…&lt;/Card> instead of &lt;Card className="pt-10">...&lt;/Card>). This gives us complete control over our API out of the box to ensure we only introduce classes we need and ensures developers don't accidentally apply a class that doesn't exist. It also provides nice intellisense for prop names and values.

At a high level, our process for building this is:

\- Use design tokens to create a theme

\- Use our theme values to create a set of utility classes via [_Sprinkles_](https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles "https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles")

\- Package it up in a prop-based API via the Box component

Let's dig into each aspect of this. You can play with and fork the code we go over in this article at [_https://stackblitz.com/edit/typesafe-tailwind_](https://stackblitz.com/edit/typesafe-tailwind "https://stackblitz.com/edit/typesafe-tailwind").

## **Creating A Theme**

At Highlight, we export our design tokens from Figma via [_Tokens Studio for Figma_](https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma "https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma"), then use those values to create a theme with vanilla-extract using [_createTheme_](https://vanilla-extract.style/documentation/api/create-theme/ "https://vanilla-extract.style/documentation/api/create-theme/"). However, for this example, let's start with something very basic that only captures a few basic tokens for background and text colors.

```
import { createTheme } from '@vanilla-extract/css';

import { createTheme } from '@vanilla-extract/css';

export const [themeClass, themeVars] = createTheme({
  backgroundColors: {
    primary: 'white',
    secondary: 'lightgray',
    brand: '#744ed4',
    good: 'lightgreen',
    bad: 'pink',
  },
  textColors: {
    default: 'black',
    secondary: 'gray',
    white: 'white',
    brand: '#744ed4',
    good: 'green',
    bad: 'red',
  },
  spaces: {
    auto: 'auto',
    '0': '0',
    '4': '4px',
    '8': '8px',
    '12': '12px',
    '16': '16px',
  },
});
```

This gives us two things:

- A class string (themeClass) that can be applied somewhere near the top of our DOM tree. It ends up being a string that looks something like theme_themeClass\_\_prfuqw0.
- A "theme contract" (themeVars) which is an object that matches the structure of the object passed to createTheme, but the values are replaced with CSS variable names (e.g. bad: "var(--backgroundColors-bad\_\_prfuqw5)".

The theme contract could actually be used to create another theme to enforce the new theme matches the shape of the existing theme, but we'll save that for another article. For now, we can move on to creating our utility classes.

## **Create Our Utility Classes**

The theme is useful, and you can probably see how you could quickly add support for theming and enforce the "contract" between all your themes thanks to createTheme. It's a nice way of managing our design tokens in code, but we still need all of our utility classes which can apply these values as CSS properties. That's where [_Sprinkles_](https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles "https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles") comes in 🧁

```
import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
import { themeVars } from './theme.css';

export const spaceProperties = defineProperties({
  properties: {
    margin: themeVars.spaces,
    marginTop: themeVars.spaces,
    marginRight: themeVars.spaces,
    marginBottom: themeVars.spaces,
    marginLeft: themeVars.spaces,
    padding: themeVars.spaces,
    paddingTop: themeVars.spaces,
    paddingRight: themeVars.spaces,
    paddingBottom: themeVars.spaces,
    paddingLeft: themeVars.spaces,
  },
  shorthands: {
    m: ['margin'],
    mx: ['marginLeft', 'marginRight'],
    my: ['marginTop', 'marginBottom'],
    p: ['padding'],
    px: ['paddingLeft', 'paddingRight'],
    py: ['paddingTop', 'paddingBottom'],
  },
});

export const colorProperties = defineProperties({
  properties: {
    backgroundColor: themeVars.backgroundColors,
    color: themeVars.textColors,
  },
});

export const sprinkles = createSprinkles(spaceProperties, colorProperties);
```

Using defineProperties and createSprinkles , we've just created a sprinkles utility that can be used to generate a class name string that can be passed down to our components. For example:
```
sprinkles({ px: 8, backgroundColor: 'good' })
```
Will generate a classname string that can be passed down to your DOM element's class attribute:

```
sprinkles_paddingLeft_8__m095qc1m
sprinkles_paddingRight_8__m095qc1a
sprinkles_backgroundColor_good__m095qc1r
```

This already is useful if you want to use the sprinkles utility directly inside a stylesheet:

```
// button.css.ts
export const buttonClass = sprinkles({
  color: 'brand',
  px: '8',
  py: '4',
})

// button.tsx
<button className={buttonClass} onClick={...}>
  Click Me
</button>
```

You could also use sprinkles at runtime right inside a component:

```
// button.tsx
<button
  className={sprinkles({
    color: 'brand',
    px: '8',
    py: '4',
  })}
  onClick={...}
>
  Click Me
</button>
```

This already gives us a nice type-safe way of applying all our utility classes without needing to create stylesheets for each component. However, we didn't like having to import sprinkles everywhere and still didn't feel the UI was super intuitive. We wanted to provide a prop-based API for accessing the utility classes.

## **The Box Component**

A common pattern in component libraries like [_MUI_](https://mui.com/material-ui/react-box/ "https://mui.com/material-ui/react-box/") and [_Chakra_](https://chakra-ui.com/docs/components/box "https://chakra-ui.com/docs/components/box") is to create a Box component that wraps your utility classes and serves as the foundational building block for all other components.

You can probably imagine how we could pass props directly through to our sprinkles function from a prop. However, declaring all these props and maintaining them by hand would be fairly tedious. Luckily, we can export the parameters of our sprinkles function as a type that can be used in the interface for our props! We just need to add the following line underneath where we define sprinkles:

```
export type Sprinkles = Parameters<typeof sprinkles>[0];
```

With this type we can make our Box component props interface.

```
import { Sprinkles } from './sprinkles.css';

export type BoxProps = React.PropsWithChildren &
  Sprinkles &
  Omit<React.AllHTMLAttributes<HTMLElement>, 'color'> & {
    as?: React.ElementType;
  };
```

Here we combine a few types to create props for all the attributes we could possibly want to pass through to the underlying elements:

-   React.PropsWithChildren - Basically just gives us the children prop.
-   Sprinkles - Covers all the props values that could be passed to sprinkles.
-   React.AllHTMLAttributes&lt;HTMLElement> - A generic HTML attribute interface that covers all the standard DOM attributes we may want to pass down, like id, className, aria-\*, etc. Note that we omit color because we want to control that with our utility classes.
-   The last type is custom, adding the as prop. This will allow us to render the component **as** any valid element type. e.g. as="button" or as="span".

Now we can write the component:

```
export const Box: React.FC<BoxProps> = ({ as = 'div', className, ...props }) => {
  const sprinklesProps: Record<string, unknown> = {};
  const nativeProps: Record<string, unknown> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (sprinkles.properties.has(key as keyof Sprinkles)) {
      sprinklesProps[key] = value;
    } else {
      nativeProps[key] = value;
    }
  });

  return React.createElement(as, {
    className: clsx([sprinkles(sprinklesProps), className]),
    ...nativeProps,
  });
};
```

We iterate over all the props and check whether they can be passed to sprinkles. If they can, we put them into an object which is ultimately passed to sprinkles to create the class string for the component. We also accept a custom className which can apply additional classes. The rest of the props are put into a different object which is spread onto the underlying component as props.

One thing missing in our example is supporting ref. Let's quickly add support for that via forwardRef. This gives us our final Box component code:

```
import React from 'react';
import clsx from 'clsx';
import { Sprinkles, sprinkles } from './sprinkles.css';

export type BoxProps = React.PropsWithChildren &
  Sprinkles &
  Omit<React.AllHTMLAttributes<HTMLElement>, 'color' | 'height' | 'width'> & {
    as?: React.ElementType;
  };

export const Box = React.forwardRef<unknown, BoxProps>(
  ({ as = 'div', className, ...props }, ref) => {
    const sprinklesProps: Record<string, unknown> = {};
    const nativeProps: Record<string, unknown> = {};

    Object.entries(props).forEach(([key, value]) => {
      if (sprinkles.properties.has(key as keyof Sprinkles)) {
        sprinklesProps[key] = value;
      } else {
        nativeProps[key] = value;
      }
    });

    return React.createElement(as, {
      className: clsx([sprinkles(sprinklesProps), className]),
      ref,
      ...nativeProps,
    });
  }
);
```

// Required because of forwardRef
Box.displayName = 'Box';

## **Adding Custom Styles**

Using sprinkles and our Box component gives us most of what we need to build UI at Highlight. However, it's inevitable that you'll want to write some custom styles at some point, and vanilla-extract has you covered there as well.

You can use the [style](https://vanilla-extract.style/documentation/api/style/) for creating a new hashed class name that can be imported and applied on a component just like you would normally write CSS, but with type safety and the ability to use your sprinkles in tandem with other custom CSS properties.

```
import { style } from '@vanilla-extract/css';

export const button = style([
  sprinkles({
    px: '4',
    py: '8',
  }),
  {
    outline: '2px solid currentColor'
  }
])
```

Or you can even apply styles globally for resetting styles or applying generic rules like font-family across your app:

```
import { globalStyle } from '@vanilla-extract/css';

globalStyle('body', {
  fontFamily: 'arial',
  margin: 0,
});
```

## **Using Recipes**

One of the most common things we need to do in a component library is define a set of attributes for different variants of a component. For example, we want to have different sizes and colors for buttons. vanilla-extract makes this easy for us using [_Recipes_](https://vanilla-extract.style/documentation/packages/recipes/ "https://vanilla-extract.style/documentation/packages/recipes/").

Recipes allow us to provide some base styles for a component as well as combinations of styles that will be applied conditionally depending on which variant is being used. Here is a simple example for a Button component:

```
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { themeVars } from './theme.css';

export const button = recipe({
  base: {
    border: 0,
    borderRadius: 6,
  },

  variants: {
    kind: {
      primary: {
        background: themeVars.backgroundColors.brand,
        color: themeVars.textColors.white,
      },
      secondary: {
        background: themeVars.backgroundColors.secondary,
      },
    },
    size: {
      small: { padding: themeVars.spaces['4'] },
      medium: { padding: themeVars.spaces['8'] },
      large: { padding: themeVars.spaces['16'] },
    },
    rounded: {
      true: { borderRadius: 999 },
    },
  },

  defaultVariants: {
    kind: 'primary',
    size: 'medium',
  },
});

export type ButtonVariants = RecipeVariants<typeof button>;
```

Now we can take the button recipe and the ButtonVariants types to create our component.

```
import * as React from 'react';
import { Box } from './Box';
import * as styles from './Button.css';

type Props = React.PropsWithChildren &
  styles.ButtonVariants & {
    onClick: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  };

export const Button: React.FC<Props> = ({ children, onClick, ...rest }) => {
  return (
    <Box as="button" onClick={onClick} className={styles.button(rest)}>
      {children}
    </Box>
  );
};
```
As we add more recipes they are automatically supported as props on the component. Usage would look something like this:

```
<Button size="small" kind="secondary" onClick={...}>Dismiss</Button>
```

## **Tradeoffs**

While we clearly are fans of vanilla-extract, there are still some things we don't like or feel could be improved in our usage. For example, we don't have utility classes for things like hover or focus from sprinkles. Technically, we could add these with [_conditions_](https://vanilla-extract.style/documentation/packages/sprinkles/#conditions "https://vanilla-extract.style/documentation/packages/sprinkles/#conditions"), but we didn't want to generate a lot of style rules that have a low probability of being used. We haven't figured out a good way to clean up unused classes/styles, but we also generate a lot less of them since we are only adding what we need to the system when we need it.

One other consideration is the learning curve for vanilla-extract. Many people are familiar with Tailwind, but VE is not as mainstream and will require a little ramp up time for engineers to get used to. There's more going on under the hood and you'll need to [_add some configuration_](https://vanilla-extract.style/documentation/integrations/vite/ "https://vanilla-extract.style/documentation/integrations/vite/") for your build tool as well.

## **Conclusion**

We recognize vanilla-extract isn't going to be right for everyone, but if you're building a design system in TypeScript we think it's worth a look. It's helped us provide a great developer experience at Highlight and helped us iterate more quickly on our UI.

We only scratched the surface of vanilla-extract here, so check out [_the documentation_](https://vanilla-extract.style/documentation/getting-started "https://vanilla-extract.style/documentation/getting-started") if you're interested in learning more. We'll continue to share about how we are leveraging it to build the Highlight design system, [_and all our code is open source_](https://github.com/highlight/highlight/tree/main/packages/ui "https://github.com/highlight/highlight/tree/main/packages/ui") if you're interested in exploring our usage more. All the code for the examples in this article are also [_available for anyone_](https://stackblitz.com/edit/typesafe-tailwind "https://stackblitz.com/edit/typesafe-tailwind") to fork and play around with as well.

We would love to hear about your experiences building component libraries. Please [_join us on Discord_](https://discord.gg/yxaXEAqgwN "https://discord.gg/yxaXEAqgwN") or [_hit us up on Twitter_](https://twitter.com/highlightio "https://twitter.com/highlightio") to chat more!
