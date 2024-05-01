// ../packages/ui/src/components/Text/styles.css.ts
import { createRuntimeFn as _7a468 } from "@vanilla-extract/recipes/createRuntimeFn";
var family = { body: { fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol" }, heading: { fontFamily: "Inter, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif" }, monospace: { fontFamily: "IBM Plex Mono, Menlo, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier, monospace" } };
var fontWeights = { regular: "400", medium: "500", bold: "600" };
var large = { fontSize: "16px", lineHeight: "24px", "::before": { content: "''", marginBottom: "-0.3864em", display: "table" }, "::after": { content: "''", marginTop: "-0.3864em", display: "table" } };
var medium = { fontSize: "14px", lineHeight: "20px", "::before": { content: "''", marginBottom: "-0.3506em", display: "table" }, "::after": { content: "''", marginTop: "-0.3506em", display: "table" } };
var sMonotype = { fontSize: "13px", lineHeight: "20px", "::before": { content: "''", marginBottom: "-0.4462em", display: "table" }, "::after": { content: "''", marginTop: "-0.3942em", display: "table" } };
var small = { fontSize: "13px", lineHeight: "20px", "::before": { content: "''", marginBottom: "-0.4056em", display: "table" }, "::after": { content: "''", marginTop: "-0.4056em", display: "table" } };
var typographyStyles = { family, size: { xxSmall, xSmall, small, medium, large }, weight: { regular: { fontWeight: "400" }, medium: { fontWeight: "500" }, bold: { fontWeight: "600" } } };
var variants = _7a468({ defaultClassName: "_145lkmv0", variantClassNames: { align: { center: "_145lkmv1", left: "_145lkmv2", right: "_145lkmv3" }, family: { body: "_145lkmv4", heading: "_145lkmv5", monospace: "_145lkmv6" }, size: { xxSmall: "_145lkmv7", xSmall: "_145lkmv8", small: "_145lkmv9", medium: "_145lkmva", large: "_145lkmvb" }, weight: { regular: "_145lkmvc", medium: "_145lkmvd", bold: "_145lkmve" }, "case": { capital: "_145lkmvf", upper: "_145lkmvg", lower: "_145lkmvh" }, "break": { all: "_145lkmvi", word: "_145lkmvj", normal: "_145lkmvk", none: "_145lkmvl" } }, defaultVariants: { family: "body", size: "small", weight: "medium" }, compoundVariants: [[{ family: "monospace", size: "small" }, "_145lkmvm"], [{ family: "monospace", size: "xSmall" }, "_145lkmvn"], [{ family: "monospace", size: "xxSmall" }, "_145lkmvo"]] });
var xSmall = { fontSize: "12px", lineHeight: "16px", "::before": { content: "''", marginBottom: "-0.303em", display: "table" }, "::after": { content: "''", marginTop: "-0.303em", display: "table" } };
var xxSmall = { fontSize: "11px", lineHeight: "12px", "::before": { content: "''", marginBottom: "-0.1818em", display: "table" }, "::after": { content: "''", marginTop: "-0.1818em", display: "table" } };
export {
  family,
  fontWeights,
  large,
  medium,
  sMonotype,
  small,
  typographyStyles,
  variants,
  xSmall,
  xxSmall
};
