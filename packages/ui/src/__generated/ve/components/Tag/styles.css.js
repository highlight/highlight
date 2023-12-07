// ../packages/ui/src/components/Tag/styles.css.ts
import { createRuntimeFn as _7a468 } from "@vanilla-extract/recipes/createRuntimeFn";
var defaultEmphasis = "high";
var defaultKind = "primary";
var defaultShape = "rounded";
var defaultSize = "medium";
var iconVariants = _7a468({ defaultClassName: "_1nph9oi0", variantClassNames: { size: { small: "_1nph9oi1", medium: "_1nph9oi2", large: "_1nph9oi3" } }, defaultVariants: { size: "medium" }, compoundVariants: [] });
var shadows = { grey: "inset 0px -1px 0px rgba(0, 0, 0, 0.1)", primary: "inset 0px -1px 0px rgba(0, 0, 0, 0.32)" };
var variants = _7a468({ defaultClassName: "_1nph9oib mt0ih24h mt0ih24y mt0ih23h mt0ih23y mt0ih22 mt0ih2ei mt0ih224 mt0ih22j", variantClassNames: { emphasis: { low: "_1nph9oic", medium: "_1nph9oid", high: "_1nph9oie" }, kind: { primary: "_1nph9oif", secondary: "_1nph9oig" }, shape: { rounded: "_1nph9oih", basic: "_1nph9oii" }, size: { small: "_1nph9oij", medium: "_1nph9oik", large: "_1nph9oil" } }, defaultVariants: { emphasis: "high", kind: "primary", size: "medium", shape: "rounded" }, compoundVariants: [[{ kind: "primary", emphasis: "high" }, "_1nph9oim"], [{ kind: "primary", emphasis: "medium" }, "_1nph9oin"], [{ kind: "primary", emphasis: "low" }, "_1nph9oio"], [{ kind: "secondary", emphasis: "high" }, "_1nph9oip"], [{ kind: "secondary", emphasis: "medium" }, "_1nph9oiq"], [{ kind: "secondary", emphasis: "low" }, "_1nph9oir"], [{ size: "small", shape: "rounded" }, "mt0ih24i mt0ih24z mt0ih23f mt0ih23w mt0ih2sw mt0ih2h"], [{ size: "medium", shape: "rounded" }, "mt0ih24k mt0ih251 mt0ih23h mt0ih23y mt0ih2t0 mt0ih2g"], [{ size: "large", shape: "rounded" }, "mt0ih24m mt0ih253 mt0ih23h mt0ih23y mt0ih2t0 mt0ih2e"], [{ size: "small", shape: "basic" }, "mt0ih24h mt0ih24y mt0ih23f mt0ih23w mt0ih2sw mt0ih29"], [{ size: "medium", shape: "basic" }, "mt0ih24h mt0ih24y mt0ih23h mt0ih23y mt0ih2sw mt0ih2b"], [{ size: "large", shape: "basic" }, "mt0ih24i mt0ih24z mt0ih23h mt0ih23y mt0ih2sw mt0ih2c"]] });
export {
  defaultEmphasis,
  defaultKind,
  defaultShape,
  defaultSize,
  iconVariants,
  shadows,
  variants
};
