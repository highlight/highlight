// ../packages/ui/src/components/Button/styles.css.ts
import { createRuntimeFn as _7a468 } from "@vanilla-extract/recipes/createRuntimeFn";
var defaultSize = "small";
var iconVariants = _7a468({ defaultClassName: "_1oerpj90", variantClassNames: { size: { xSmall: "_1oerpj91", small: "_1oerpj92", medium: "_1oerpj93", large: "_1oerpj94", xLarge: "_1oerpj95" }, emphasis: { high: "_1oerpj96", medium: "_1oerpj97", low: "_1oerpj98" }, kind: { primary: "_1oerpj99", secondary: "_1oerpj9a", danger: "_1oerpj9b" } }, defaultVariants: { size: "small" }, compoundVariants: [[{ kind: "primary", emphasis: "high" }, "_1oerpj9c"]] });
var shadows = { grey: "inset 0px -1px 0px rgba(0, 0, 0, 0.1)", primary: "inset 0px -1px 0px rgba(0, 0, 0, 0.32)", neutral: "0 0 0 1px #f9f8f9 inset", n5: "0 0 0 1px #e9e8ea inset" };
var variants = _7a468({ defaultClassName: "_1oerpj9h mt0ih2sz mt0ih2ex mt0ih221 mt0ih2wf", variantClassNames: { emphasis: { high: "_1oerpj9i", medium: "_1oerpj9j", low: "_1oerpj9k" }, kind: { primary: "_1oerpj9l", secondary: "_1oerpj9m", danger: "_1oerpj9n" }, size: { xSmall: "_1oerpj9o mt0ih24c mt0ih24w mt0ih23 mt0ih2uf", small: "_1oerpj9p mt0ih24c mt0ih24w mt0ih25 mt0ih2uj", medium: "_1oerpj9q mt0ih24e mt0ih24y mt0ih25 mt0ih2uj" } }, defaultVariants: { kind: "primary", emphasis: "high", size: "small" }, compoundVariants: [[{ kind: "primary", emphasis: "high" }, "_1oerpj9r"], [{ kind: "primary", emphasis: "medium" }, "_1oerpj9s"], [{ kind: "primary", emphasis: "low" }, "_1oerpj9t"], [{ kind: "secondary", emphasis: "high" }, "_1oerpj9u"], [{ kind: "secondary", emphasis: "medium" }, "_1oerpj9v"], [{ kind: "secondary", emphasis: "low" }, "_1oerpj9w"]] });
export {
  defaultSize,
  iconVariants,
  shadows,
  variants
};
