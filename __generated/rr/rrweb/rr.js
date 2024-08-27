// ../rrweb/packages/rrweb/dist/rrweb.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var NodeType$2 = /* @__PURE__ */ ((NodeType2) => {
  NodeType2[NodeType2["Document"] = 0] = "Document";
  NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
  NodeType2[NodeType2["Element"] = 2] = "Element";
  NodeType2[NodeType2["Text"] = 3] = "Text";
  NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
  NodeType2[NodeType2["Comment"] = 5] = "Comment";
  return NodeType2;
})(NodeType$2 || {});
var testableAccessors$1 = {
  Node: ["childNodes", "parentNode", "parentElement", "textContent"],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
};
var testableMethods$1 = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
};
var untaintedBasePrototype$1 = {};
function getUntaintedPrototype$1(key) {
  if (untaintedBasePrototype$1[key])
    return untaintedBasePrototype$1[key];
  const defaultObj = globalThis[key];
  const defaultPrototype = defaultObj.prototype;
  const accessorNames = key in testableAccessors$1 ? testableAccessors$1[key] : void 0;
  const isUntaintedAccessors = Boolean(
    accessorNames && // @ts-expect-error 2345
    accessorNames.every(
      (accessor) => {
        var _a2, _b;
        return Boolean(
          (_b = (_a2 = Object.getOwnPropertyDescriptor(defaultPrototype, accessor)) == null ? void 0 : _a2.get) == null ? void 0 : _b.toString().includes("[native code]")
        );
      }
    )
  );
  const methodNames = key in testableMethods$1 ? testableMethods$1[key] : void 0;
  const isUntaintedMethods = Boolean(
    methodNames && methodNames.every(
      // @ts-expect-error 2345
      (method) => {
        var _a2;
        return typeof defaultPrototype[method] === "function" && ((_a2 = defaultPrototype[method]) == null ? void 0 : _a2.toString().includes("[native code]"));
      }
    )
  );
  if (isUntaintedAccessors && isUntaintedMethods) {
    untaintedBasePrototype$1[key] = defaultObj.prototype;
    return defaultObj.prototype;
  }
  try {
    const iframeEl = document.createElement("iframe");
    document.body.appendChild(iframeEl);
    const win = iframeEl.contentWindow;
    if (!win)
      return defaultObj.prototype;
    const untaintedObject = win[key].prototype;
    document.body.removeChild(iframeEl);
    if (!untaintedObject)
      return defaultPrototype;
    return untaintedBasePrototype$1[key] = untaintedObject;
  } catch {
    return defaultPrototype;
  }
}
var untaintedAccessorCache$1 = {};
function getUntaintedAccessor$1(key, instance, accessor) {
  var _a2;
  const cacheKey = `${key}.${String(accessor)}`;
  if (untaintedAccessorCache$1[cacheKey])
    return untaintedAccessorCache$1[cacheKey].call(
      instance
    );
  const untaintedPrototype = getUntaintedPrototype$1(key);
  const untaintedAccessor = (_a2 = Object.getOwnPropertyDescriptor(
    untaintedPrototype,
    accessor
  )) == null ? void 0 : _a2.get;
  if (!untaintedAccessor)
    return instance[accessor];
  untaintedAccessorCache$1[cacheKey] = untaintedAccessor;
  return untaintedAccessor.call(instance);
}
var untaintedMethodCache$1 = {};
function getUntaintedMethod$1(key, instance, method) {
  const cacheKey = `${key}.${String(method)}`;
  if (untaintedMethodCache$1[cacheKey])
    return untaintedMethodCache$1[cacheKey].bind(
      instance
    );
  const untaintedPrototype = getUntaintedPrototype$1(key);
  const untaintedMethod = untaintedPrototype[method];
  if (typeof untaintedMethod !== "function")
    return instance[method];
  untaintedMethodCache$1[cacheKey] = untaintedMethod;
  return untaintedMethod.bind(instance);
}
function childNodes$1(n2) {
  return getUntaintedAccessor$1("Node", n2, "childNodes");
}
function parentNode$1(n2) {
  return getUntaintedAccessor$1("Node", n2, "parentNode");
}
function parentElement$1(n2) {
  return getUntaintedAccessor$1("Node", n2, "parentElement");
}
function textContent$1(n2) {
  return getUntaintedAccessor$1("Node", n2, "textContent");
}
function contains$1(n2, other) {
  return getUntaintedMethod$1("Node", n2, "contains")(other);
}
function getRootNode$1(n2) {
  return getUntaintedMethod$1("Node", n2, "getRootNode")();
}
function host$1(n2) {
  if (!n2 || !("host" in n2))
    return null;
  return getUntaintedAccessor$1("ShadowRoot", n2, "host");
}
function styleSheets$1(n2) {
  return n2.styleSheets;
}
function shadowRoot$1(n2) {
  if (!n2 || !("shadowRoot" in n2))
    return null;
  return getUntaintedAccessor$1("Element", n2, "shadowRoot");
}
function querySelector$1(n2, selectors) {
  return getUntaintedAccessor$1("Element", n2, "querySelector")(selectors);
}
function querySelectorAll$1(n2, selectors) {
  return getUntaintedAccessor$1("Element", n2, "querySelectorAll")(selectors);
}
function mutationObserverCtor$1() {
  return getUntaintedPrototype$1("MutationObserver").constructor;
}
var index$1 = {
  childNodes: childNodes$1,
  parentNode: parentNode$1,
  parentElement: parentElement$1,
  textContent: textContent$1,
  contains: contains$1,
  getRootNode: getRootNode$1,
  host: host$1,
  styleSheets: styleSheets$1,
  shadowRoot: shadowRoot$1,
  querySelector: querySelector$1,
  querySelectorAll: querySelectorAll$1,
  mutationObserver: mutationObserverCtor$1
};
function isElement(n2) {
  return n2.nodeType === n2.ELEMENT_NODE;
}
function isShadowRoot(n2) {
  const hostEl = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    n2 && "host" in n2 && "mode" in n2 && index$1.host(n2) || null
  );
  return Boolean(
    hostEl && "shadowRoot" in hostEl && index$1.shadowRoot(hostEl) === n2
  );
}
function isNativeShadowDom(shadowRoot2) {
  return Object.prototype.toString.call(shadowRoot2) === "[object ShadowRoot]";
}
function fixBrowserCompatibilityIssuesInCSS(cssText) {
  if (cssText.includes(" background-clip: text;") && !cssText.includes(" -webkit-background-clip: text;")) {
    cssText = cssText.replace(
      /\sbackground-clip:\s*text;/g,
      " -webkit-background-clip: text; background-clip: text;"
    );
  }
  return cssText;
}
function escapeImportStatement(rule) {
  const { cssText } = rule;
  if (cssText.split('"').length < 3)
    return cssText;
  const statement = ["@import", `url(${JSON.stringify(rule.href)})`];
  if (rule.layerName === "") {
    statement.push(`layer`);
  } else if (rule.layerName) {
    statement.push(`layer(${rule.layerName})`);
  }
  if (rule.supportsText) {
    statement.push(`supports(${rule.supportsText})`);
  }
  if (rule.media.length) {
    statement.push(rule.media.mediaText);
  }
  return statement.join(" ") + ";";
}
function stringifyStylesheet(s2) {
  try {
    const rules2 = s2.rules || s2.cssRules;
    if (!rules2) {
      return null;
    }
    const stringifiedRules = Array.from(
      rules2,
      (rule) => stringifyRule(rule, s2.href)
    ).join("");
    return fixBrowserCompatibilityIssuesInCSS(stringifiedRules);
  } catch (error) {
    return null;
  }
}
function stringifyRule(rule, sheetHref) {
  if (isCSSImportRule(rule)) {
    let importStringified;
    try {
      importStringified = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      stringifyStylesheet(rule.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      escapeImportStatement(rule);
    } catch (error) {
      importStringified = rule.cssText;
    }
    if (rule.styleSheet.href) {
      return absolutifyURLs(importStringified, rule.styleSheet.href);
    }
    return importStringified;
  } else {
    let ruleStringified = rule.cssText;
    if (isCSSStyleRule(rule) && rule.selectorText.includes(":")) {
      ruleStringified = fixSafariColons(ruleStringified);
    }
    if (sheetHref) {
      return absolutifyURLs(ruleStringified, sheetHref);
    }
    return ruleStringified;
  }
}
function fixSafariColons(cssStringified) {
  const regex = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return cssStringified.replace(regex, "$1\\$2");
}
function isCSSImportRule(rule) {
  return "styleSheet" in rule;
}
function isCSSStyleRule(rule) {
  return "selectorText" in rule;
}
var Mirror = class {
  constructor() {
    __publicField$1(this, "idNodeMap", /* @__PURE__ */ new Map());
    __publicField$1(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(n2) {
    var _a2;
    if (!n2)
      return -1;
    const id = (_a2 = this.getMeta(n2)) == null ? void 0 : _a2.id;
    return id ?? -1;
  }
  getNode(id) {
    return this.idNodeMap.get(id) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(n2) {
    return this.nodeMetaMap.get(n2) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(n2) {
    const id = this.getId(n2);
    this.idNodeMap.delete(id);
    if (n2.childNodes) {
      n2.childNodes.forEach(
        (childNode) => this.removeNodeFromMap(childNode)
      );
    }
  }
  has(id) {
    return this.idNodeMap.has(id);
  }
  hasNode(node) {
    return this.nodeMetaMap.has(node);
  }
  add(n2, meta) {
    const id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  }
  replace(id, n2) {
    const oldNode = this.getNode(id);
    if (oldNode) {
      const meta = this.nodeMetaMap.get(oldNode);
      if (meta)
        this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
};
function createMirror$2() {
  return new Mirror();
}
function maskInputValue({
  element,
  maskInputOptions,
  tagName,
  type,
  value,
  overwriteRecord,
  maskInputFn
}) {
  let text = value || "";
  if (maskedInputType({
    maskInputOptions,
    tagName,
    type,
    overwriteRecord
  })) {
    if (maskInputFn) {
      text = maskInputFn(text, element);
    } else {
      text = "*".repeat(text.length);
    }
  }
  return text;
}
function toLowerCase(str) {
  return str.toLowerCase();
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx)
    return true;
  const chunkSize = 50;
  for (let x = 0; x < canvas.width; x += chunkSize) {
    for (let y = 0; y < canvas.height; y += chunkSize) {
      const getImageData = ctx.getImageData;
      const originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
      const pixelBuffer = new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        originalGetImageData.call(
          ctx,
          x,
          y,
          Math.min(chunkSize, canvas.width - x),
          Math.min(chunkSize, canvas.height - y)
        ).data.buffer
      );
      if (pixelBuffer.some((pixel) => pixel !== 0))
        return false;
    }
  }
  return true;
}
function isNodeMetaEqual(a2, b) {
  if (!a2 || !b || a2.type !== b.type)
    return false;
  if (a2.type === NodeType$2.Document)
    return a2.compatMode === b.compatMode;
  else if (a2.type === NodeType$2.DocumentType)
    return a2.name === b.name && a2.publicId === b.publicId && a2.systemId === b.systemId;
  else if (a2.type === NodeType$2.Comment || a2.type === NodeType$2.Text || a2.type === NodeType$2.CDATA)
    return a2.textContent === b.textContent;
  else if (a2.type === NodeType$2.Element)
    return a2.tagName === b.tagName && JSON.stringify(a2.attributes) === JSON.stringify(b.attributes) && a2.isSVG === b.isSVG && a2.needBlock === b.needBlock;
  return false;
}
function getInputType(element) {
  const type = element.type;
  return element.hasAttribute("data-rr-is-password") ? "password" : type ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    toLowerCase(type)
  ) : null;
}
function extractFileExtension(path, baseURL) {
  let url;
  try {
    url = new URL(path, baseURL ?? window.location.href);
  } catch (err) {
    return null;
  }
  const regex = /\.([0-9a-z]+)(?:$)/i;
  const match = url.pathname.match(regex);
  return (match == null ? void 0 : match[1]) ?? null;
}
function extractOrigin(url) {
  let origin = "";
  if (url.indexOf("//") > -1) {
    origin = url.split("/").slice(0, 3).join("/");
  } else {
    origin = url.split("/")[0];
  }
  origin = origin.split("?")[0];
  return origin;
}
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
var URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
var URL_WWW_MATCH = /^www\..*/i;
var DATA_URI = /^(data:)([^,]*),(.*)/i;
function absolutifyURLs(cssText, href) {
  return (cssText || "").replace(
    URL_IN_CSS_REF,
    (origin, quote1, path1, quote2, path2, path3) => {
      const filePath = path1 || path2 || path3;
      const maybeQuote = quote1 || quote2 || "";
      if (!filePath) {
        return origin;
      }
      if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) {
        return `url(${maybeQuote}${filePath}${maybeQuote})`;
      }
      if (DATA_URI.test(filePath)) {
        return `url(${maybeQuote}${filePath}${maybeQuote})`;
      }
      if (filePath[0] === "/") {
        return `url(${maybeQuote}${extractOrigin(href) + filePath}${maybeQuote})`;
      }
      const stack = href.split("/");
      const parts = filePath.split("/");
      stack.pop();
      for (const part of parts) {
        if (part === ".") {
          continue;
        } else if (part === "..") {
          stack.pop();
        } else {
          stack.push(part);
        }
      }
      return `url(${maybeQuote}${stack.join("/")}${maybeQuote})`;
    }
  );
}
function obfuscateText(text) {
  text = text.replace(/[^ -~]+/g, "");
  text = (text == null ? void 0 : text.split(" ").map((word) => Math.random().toString(20).substr(2, word.length)).join(" ")) || "";
  return text;
}
function isElementSrcBlocked(tagName) {
  return tagName === "img" || tagName === "video" || tagName === "audio" || tagName === "source";
}
var EMAIL_REGEX = new RegExp(
  /[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*/
);
var LONG_NUMBER_REGEX = new RegExp(/[0-9]{9,16}/);
var SSN_REGEX = new RegExp(/[0-9]{3}-?[0-9]{2}-?[0-9]{4}/);
var PHONE_NUMBER_REGEX = new RegExp(
  /[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/
);
var CREDIT_CARD_REGEX = new RegExp(/[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}/);
var ADDRESS_REGEX = new RegExp(
  /[0-9]{1,5}.?[0-9]{0,3}\s[a-zA-Z]{2,30}\s[a-zA-Z]{2,15}/
);
var IP_REGEX = new RegExp(/(?:[0-9]{1,3}.){3}[0-9]{1,3}/);
var DEFAULT_OBFUSCATE_REGEXES = [
  EMAIL_REGEX,
  LONG_NUMBER_REGEX,
  SSN_REGEX,
  PHONE_NUMBER_REGEX,
  CREDIT_CARD_REGEX,
  ADDRESS_REGEX,
  IP_REGEX
];
function shouldObfuscateTextByDefault(text) {
  if (!text)
    return false;
  return DEFAULT_OBFUSCATE_REGEXES.some((regex) => regex.test(text));
}
var maskedInputType = ({
  maskInputOptions,
  tagName,
  type,
  overwriteRecord
}) => {
  const actualType = type && type.toLowerCase();
  return overwriteRecord !== "true" && (!!maskInputOptions[tagName.toLowerCase()] || !!(actualType && maskInputOptions[actualType]));
};
var _id = 1;
var tagNameRegex = new RegExp("[^a-z0-9-_:]");
var IGNORED_NODE = -2;
function genId() {
  return _id++;
}
function getValidTagName$1(element) {
  if (element instanceof HTMLFormElement) {
    return "form";
  }
  const processedTagName = toLowerCase(element.tagName);
  if (tagNameRegex.test(processedTagName)) {
    return "div";
  }
  return processedTagName;
}
var canvasService;
var canvasCtx;
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
  if (attributeValue.trim() === "") {
    return attributeValue;
  }
  let pos = 0;
  function collectCharacters(regEx) {
    let chars2;
    const match = regEx.exec(attributeValue.substring(pos));
    if (match) {
      chars2 = match[0];
      pos += chars2.length;
      return chars2;
    }
    return "";
  }
  const output = [];
  while (true) {
    collectCharacters(SRCSET_COMMAS_OR_SPACES);
    if (pos >= attributeValue.length) {
      break;
    }
    let url = collectCharacters(SRCSET_NOT_SPACES);
    if (url.slice(-1) === ",") {
      url = absoluteToDoc(doc, url.substring(0, url.length - 1));
      output.push(url);
    } else {
      let descriptorsStr = "";
      url = absoluteToDoc(doc, url);
      let inParens = false;
      while (true) {
        const c2 = attributeValue.charAt(pos);
        if (c2 === "") {
          output.push((url + descriptorsStr).trim());
          break;
        } else if (!inParens) {
          if (c2 === ",") {
            pos += 1;
            output.push((url + descriptorsStr).trim());
            break;
          } else if (c2 === "(") {
            inParens = true;
          }
        } else {
          if (c2 === ")") {
            inParens = false;
          }
        }
        descriptorsStr += c2;
        pos += 1;
      }
    }
  }
  return output.join(", ");
}
var cachedDocument = /* @__PURE__ */ new WeakMap();
function absoluteToDoc(doc, attributeValue) {
  if (!attributeValue || attributeValue.trim() === "") {
    return attributeValue;
  }
  return getHref(doc, attributeValue);
}
function isSVGElement(el) {
  return Boolean(el.tagName === "svg" || el.ownerSVGElement);
}
function getHref(doc, customHref) {
  let a2 = cachedDocument.get(doc);
  if (!a2) {
    a2 = doc.createElement("a");
    cachedDocument.set(doc, a2);
  }
  if (!customHref) {
    customHref = "";
  } else if (customHref.startsWith("blob:") || customHref.startsWith("data:")) {
    return customHref;
  }
  a2.setAttribute("href", customHref);
  return a2.href;
}
function transformAttribute(doc, tagName, name, value) {
  if (!value) {
    return value;
  }
  if (name === "src" || name === "href" && !(tagName === "use" && value[0] === "#")) {
    return absoluteToDoc(doc, value);
  } else if (name === "xlink:href" && value[0] !== "#") {
    return absoluteToDoc(doc, value);
  } else if (name === "background" && (tagName === "table" || tagName === "td" || tagName === "th")) {
    return absoluteToDoc(doc, value);
  } else if (name === "srcset") {
    return getAbsoluteSrcsetString(doc, value);
  } else if (name === "style") {
    return absolutifyURLs(value, getHref(doc));
  } else if (tagName === "object" && name === "data") {
    return absoluteToDoc(doc, value);
  }
  return value;
}
function ignoreAttribute(tagName, name, _value) {
  return (tagName === "video" || tagName === "audio") && name === "autoplay";
}
function _isBlockedElement(element, blockClass, blockSelector) {
  try {
    if (typeof blockClass === "string") {
      if (element.classList.contains(blockClass)) {
        return true;
      }
    } else {
      for (let eIndex = element.classList.length; eIndex--; ) {
        const className = element.classList[eIndex];
        if (blockClass.test(className)) {
          return true;
        }
      }
    }
    if (blockSelector) {
      return element.matches(blockSelector);
    }
  } catch (e2) {
  }
  return false;
}
function classMatchesRegex(node, regex, checkAncestors) {
  if (!node)
    return false;
  if (node.nodeType !== node.ELEMENT_NODE) {
    if (!checkAncestors)
      return false;
    return classMatchesRegex(index$1.parentNode(node), regex, checkAncestors);
  }
  for (let eIndex = node.classList.length; eIndex--; ) {
    const className = node.classList[eIndex];
    if (regex.test(className)) {
      return true;
    }
  }
  if (!checkAncestors)
    return false;
  return classMatchesRegex(index$1.parentNode(node), regex, checkAncestors);
}
function needMaskingText(node, maskTextClass, maskTextSelector, checkAncestors) {
  let el;
  if (isElement(node)) {
    el = node;
    if (!index$1.childNodes(el).length) {
      return false;
    }
  } else if (index$1.parentElement(node) === null) {
    return false;
  } else {
    el = index$1.parentElement(node);
  }
  try {
    if (typeof maskTextClass === "string") {
      if (checkAncestors) {
        if (el.closest(`.${maskTextClass}`))
          return true;
      } else {
        if (el.classList.contains(maskTextClass))
          return true;
      }
    } else {
      if (classMatchesRegex(el, maskTextClass, checkAncestors))
        return true;
    }
    if (maskTextSelector) {
      if (checkAncestors) {
        if (el.closest(maskTextSelector))
          return true;
      } else {
        if (el.matches(maskTextSelector))
          return true;
      }
    }
  } catch (e2) {
  }
  return false;
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
  const win = iframeEl.contentWindow;
  if (!win) {
    return;
  }
  let fired = false;
  let readyState;
  try {
    readyState = win.document.readyState;
  } catch (error) {
    return;
  }
  if (readyState !== "complete") {
    const timer = setTimeout(() => {
      if (!fired) {
        listener();
        fired = true;
      }
    }, iframeLoadTimeout);
    iframeEl.addEventListener("load", () => {
      clearTimeout(timer);
      fired = true;
      listener();
    });
    return;
  }
  const blankUrl = "about:blank";
  if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
    setTimeout(listener, 0);
    return iframeEl.addEventListener("load", listener);
  }
  iframeEl.addEventListener("load", listener);
}
function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
  let fired = false;
  let styleSheetLoaded;
  try {
    styleSheetLoaded = link.sheet;
  } catch (error) {
    return;
  }
  if (styleSheetLoaded)
    return;
  const timer = setTimeout(() => {
    if (!fired) {
      listener();
      fired = true;
    }
  }, styleSheetLoadTimeout);
  link.addEventListener("load", () => {
    clearTimeout(timer);
    fired = true;
    listener();
  });
}
function serializeNode(n2, options) {
  const {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    needsMask,
    inlineStylesheet,
    maskInputOptions = {},
    maskTextClass,
    maskTextFn,
    maskInputFn,
    dataURLOptions = {},
    inlineImages,
    recordCanvas,
    keepIframeSrcFn,
    newlyAddedElement = false,
    privacySetting
  } = options;
  const rootId = getRootId(doc, mirror2);
  switch (n2.nodeType) {
    case n2.DOCUMENT_NODE:
      if (n2.compatMode !== "CSS1Compat") {
        return {
          type: NodeType$2.Document,
          childNodes: [],
          compatMode: n2.compatMode
          // probably "BackCompat"
        };
      } else {
        return {
          type: NodeType$2.Document,
          childNodes: []
        };
      }
    case n2.DOCUMENT_TYPE_NODE:
      return {
        type: NodeType$2.DocumentType,
        name: n2.name,
        publicId: n2.publicId,
        systemId: n2.systemId,
        rootId
      };
    case n2.ELEMENT_NODE:
      return serializeElementNode(n2, {
        doc,
        blockClass,
        blockSelector,
        inlineStylesheet,
        maskInputOptions,
        maskInputFn,
        maskTextClass,
        dataURLOptions,
        inlineImages,
        recordCanvas,
        keepIframeSrcFn,
        newlyAddedElement,
        privacySetting,
        rootId
      });
    case n2.TEXT_NODE:
      return serializeTextNode(n2, {
        doc,
        needsMask,
        maskTextFn,
        privacySetting,
        rootId
      });
    case n2.CDATA_SECTION_NODE:
      return {
        type: NodeType$2.CDATA,
        textContent: "",
        rootId
      };
    case n2.COMMENT_NODE:
      return {
        type: NodeType$2.Comment,
        textContent: index$1.textContent(n2) || "",
        rootId
      };
    default:
      return false;
  }
}
function getRootId(doc, mirror2) {
  if (!mirror2.hasNode(doc))
    return void 0;
  const docId = mirror2.getId(doc);
  return docId === 1 ? void 0 : docId;
}
function serializeTextNode(n2, options) {
  var _a2, _b;
  const {
    needsMask,
    maskTextFn,
    privacySetting,
    rootId
  } = options;
  const parent = index$1.parentNode(n2);
  const parentTagName = parent && parent.tagName;
  let text = index$1.textContent(n2);
  const isStyle = parentTagName === "STYLE" ? true : void 0;
  const isScript = parentTagName === "SCRIPT" ? true : void 0;
  let textContentHandled = false;
  if (isStyle && text) {
    try {
      if (n2.nextSibling || n2.previousSibling) {
      } else if ((_a2 = parent.sheet) == null ? void 0 : _a2.cssRules) {
        text = stringifyStylesheet(parent.sheet);
      }
    } catch (err) {
      console.warn(
        `Cannot get CSS styles from text's parentNode. Error: ${err}`,
        n2
      );
    }
    text = absolutifyURLs(text, getHref(options.doc));
    textContentHandled = true;
  }
  if (isScript) {
    text = "SCRIPT_PLACEHOLDER";
    textContentHandled = true;
  } else if (parentTagName === "NOSCRIPT") {
    text = "";
    textContentHandled = true;
  }
  if (!isStyle && !isScript && text && needsMask) {
    text = maskTextFn ? maskTextFn(text, index$1.parentElement(n2)) : text.replace(/[\S]/g, "*");
  }
  const enableStrictPrivacy = privacySetting === "strict";
  const highlightOverwriteRecord = (_b = n2.parentElement) == null ? void 0 : _b.getAttribute("data-hl-record");
  const obfuscateDefaultPrivacy = privacySetting === "default" && shouldObfuscateTextByDefault(text);
  if ((enableStrictPrivacy || obfuscateDefaultPrivacy) && !highlightOverwriteRecord && !textContentHandled && parentTagName) {
    const IGNORE_TAG_NAMES = /* @__PURE__ */ new Set([
      "HEAD",
      "TITLE",
      "STYLE",
      "SCRIPT",
      "HTML",
      "BODY",
      "NOSCRIPT"
    ]);
    if (!IGNORE_TAG_NAMES.has(parentTagName) && text) {
      text = obfuscateText(text);
    }
  }
  return {
    type: NodeType$2.Text,
    textContent: text || "",
    isStyle,
    rootId
  };
}
function serializeElementNode(n2, options) {
  const {
    doc,
    blockClass,
    blockSelector,
    inlineStylesheet,
    maskInputOptions = {},
    maskInputFn,
    maskTextClass,
    dataURLOptions = {},
    inlineImages,
    recordCanvas,
    keepIframeSrcFn,
    newlyAddedElement = false,
    privacySetting,
    rootId
  } = options;
  let needBlock = _isBlockedElement(n2, blockClass, blockSelector);
  const needMask = _isBlockedElement(n2, maskTextClass, null);
  const enableStrictPrivacy = privacySetting === "strict";
  let tagName = getValidTagName$1(n2);
  let attributes = {};
  const len = n2.attributes.length;
  for (let i2 = 0; i2 < len; i2++) {
    const attr = n2.attributes[i2];
    if (!ignoreAttribute(tagName, attr.name, attr.value)) {
      attributes[attr.name] = transformAttribute(
        doc,
        tagName,
        toLowerCase(attr.name),
        attr.value
      );
    }
  }
  if (tagName === "link" && inlineStylesheet) {
    const stylesheet = Array.from(doc.styleSheets).find((s2) => {
      return s2.href === n2.href;
    });
    let cssText = null;
    if (stylesheet) {
      cssText = stringifyStylesheet(stylesheet);
    }
    if (cssText) {
      delete attributes.rel;
      delete attributes.href;
      attributes._cssText = cssText;
    }
  }
  if (tagName === "style" && n2.sheet && // TODO: Currently we only try to get dynamic stylesheet when it is an empty style element
  !(n2.innerText || index$1.textContent(n2) || "").trim().length) {
    const cssText = stringifyStylesheet(
      n2.sheet
    );
    if (cssText) {
      attributes._cssText = cssText;
    }
  }
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    const value = n2.value;
    const checked = n2.checked;
    if (attributes.type !== "radio" && attributes.type !== "checkbox" && attributes.type !== "submit" && attributes.type !== "button" && value) {
      attributes.value = maskInputValue({
        element: n2,
        type: getInputType(n2),
        tagName,
        value,
        overwriteRecord: n2.getAttribute("data-hl-record"),
        maskInputOptions,
        maskInputFn
      });
    } else if (checked) {
      attributes.checked = checked;
    }
  }
  if (tagName === "option") {
    if (n2.selected && !maskInputOptions["select"]) {
      attributes.selected = true;
    } else {
      delete attributes.selected;
    }
  }
  if (tagName === "dialog" && n2.open) {
    attributes.rr_open_mode = n2.matches("dialog:modal") ? "modal" : "non-modal";
  }
  if (tagName === "canvas" && recordCanvas) {
    if (n2.__context === "2d") {
      if (!is2DCanvasBlank(n2)) {
        attributes.rr_dataURL = n2.toDataURL(
          dataURLOptions.type,
          dataURLOptions.quality
        );
      }
    } else if (!("__context" in n2)) {
      const canvasDataURL = n2.toDataURL(
        dataURLOptions.type,
        dataURLOptions.quality
      );
      const blankCanvas = doc.createElement("canvas");
      blankCanvas.width = n2.width;
      blankCanvas.height = n2.height;
      const blankCanvasDataURL = blankCanvas.toDataURL(
        dataURLOptions.type,
        dataURLOptions.quality
      );
      if (canvasDataURL !== blankCanvasDataURL) {
        attributes.rr_dataURL = canvasDataURL;
      }
    }
  }
  if (tagName === "img" && inlineImages && !needBlock && !needMask && !enableStrictPrivacy) {
    if (!canvasService) {
      canvasService = doc.createElement("canvas");
      canvasCtx = canvasService.getContext("2d");
    }
    const image = n2;
    const imageSrc = image.currentSrc || image.getAttribute("src") || "<unknown-src>";
    const priorCrossOrigin = image.crossOrigin;
    const recordInlineImage = () => {
      image.removeEventListener("load", recordInlineImage);
      try {
        canvasService.width = image.naturalWidth;
        canvasService.height = image.naturalHeight;
        canvasCtx.drawImage(image, 0, 0);
        attributes.rr_dataURL = canvasService.toDataURL(
          dataURLOptions.type,
          dataURLOptions.quality
        );
      } catch (err) {
        if (image.crossOrigin !== "anonymous") {
          image.crossOrigin = "anonymous";
          if (image.complete && image.naturalWidth !== 0)
            recordInlineImage();
          else
            image.addEventListener("load", recordInlineImage);
          return;
        } else {
          console.warn(
            `Cannot inline img src=${imageSrc}! Error: ${err}`
          );
        }
      }
      if (image.crossOrigin === "anonymous") {
        priorCrossOrigin ? attributes.crossOrigin = priorCrossOrigin : image.removeAttribute("crossorigin");
      }
    };
    if (image.complete && image.naturalWidth !== 0)
      recordInlineImage();
    else
      image.addEventListener("load", recordInlineImage);
  }
  if (tagName === "audio" || tagName === "video") {
    const mediaAttributes = attributes;
    mediaAttributes.rr_mediaState = n2.paused ? "paused" : "played";
    mediaAttributes.rr_mediaCurrentTime = n2.currentTime;
    mediaAttributes.rr_mediaPlaybackRate = n2.playbackRate;
    mediaAttributes.rr_mediaMuted = n2.muted;
    mediaAttributes.rr_mediaLoop = n2.loop;
    mediaAttributes.rr_mediaVolume = n2.volume;
  }
  if (!newlyAddedElement) {
    if (n2.scrollLeft) {
      attributes.rr_scrollLeft = n2.scrollLeft;
    }
    if (n2.scrollTop) {
      attributes.rr_scrollTop = n2.scrollTop;
    }
  }
  if (needBlock || needMask || enableStrictPrivacy && isElementSrcBlocked(tagName)) {
    const { width, height } = n2.getBoundingClientRect();
    attributes = {
      class: attributes.class,
      rr_width: `${width}px`,
      rr_height: `${height}px`
    };
  }
  if (enableStrictPrivacy && isElementSrcBlocked(tagName)) {
    needBlock = true;
  }
  if (tagName === "iframe" && !keepIframeSrcFn(attributes.src)) {
    if (!n2.contentDocument) {
      attributes.rr_src = attributes.src;
    }
    delete attributes.src;
  }
  let isCustomElement;
  try {
    if (customElements.get(tagName))
      isCustomElement = true;
  } catch (e2) {
  }
  if (inlineImages && tagName === "video") {
    const video = n2;
    if (video.src === "" || video.src.indexOf("blob:") !== -1) {
      const { width, height } = n2.getBoundingClientRect();
      attributes = {
        width,
        height,
        rr_width: `${width}px`,
        rr_height: `${height}px`,
        rr_inlined_video: true
      };
      tagName = "canvas";
      const blankCanvas = doc.createElement("canvas");
      blankCanvas.width = n2.width;
      blankCanvas.height = n2.height;
      attributes.rr_dataURL = blankCanvas.toDataURL(
        dataURLOptions.type,
        dataURLOptions.quality
      );
    }
  }
  return {
    type: NodeType$2.Element,
    tagName,
    attributes,
    childNodes: [],
    isSVG: isSVGElement(n2) || void 0,
    needBlock,
    needMask,
    rootId,
    isCustom: isCustomElement
  };
}
function lowerIfExists(maybeAttr) {
  if (maybeAttr === void 0 || maybeAttr === null) {
    return "";
  } else {
    return maybeAttr.toLowerCase();
  }
}
function slimDOMExcluded(sn, slimDOMOptions) {
  if (slimDOMOptions.comment && sn.type === NodeType$2.Comment) {
    return true;
  } else if (sn.type === NodeType$2.Element) {
    if (slimDOMOptions.script && // script tag
    (sn.tagName === "script" || // (module)preload link
    sn.tagName === "link" && (sn.attributes.rel === "preload" || sn.attributes.rel === "modulepreload") && sn.attributes.as === "script" || // prefetch link
    sn.tagName === "link" && sn.attributes.rel === "prefetch" && typeof sn.attributes.href === "string" && extractFileExtension(sn.attributes.href) === "js")) {
      return true;
    } else if (slimDOMOptions.headFavicon && (sn.tagName === "link" && sn.attributes.rel === "shortcut icon" || sn.tagName === "meta" && (lowerIfExists(sn.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || lowerIfExists(sn.attributes.name) === "application-name" || lowerIfExists(sn.attributes.rel) === "icon" || lowerIfExists(sn.attributes.rel) === "apple-touch-icon" || lowerIfExists(sn.attributes.rel) === "shortcut icon"))) {
      return true;
    } else if (sn.tagName === "meta") {
      if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
        return true;
      } else if (slimDOMOptions.headMetaSocial && (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) || lowerIfExists(sn.attributes.name) === "pinterest")) {
        return true;
      } else if (slimDOMOptions.headMetaRobots && (lowerIfExists(sn.attributes.name) === "robots" || lowerIfExists(sn.attributes.name) === "googlebot" || lowerIfExists(sn.attributes.name) === "bingbot")) {
        return true;
      } else if (slimDOMOptions.headMetaHttpEquiv && sn.attributes["http-equiv"] !== void 0) {
        return true;
      } else if (slimDOMOptions.headMetaAuthorship && (lowerIfExists(sn.attributes.name) === "author" || lowerIfExists(sn.attributes.name) === "generator" || lowerIfExists(sn.attributes.name) === "framework" || lowerIfExists(sn.attributes.name) === "publisher" || lowerIfExists(sn.attributes.name) === "progid" || lowerIfExists(sn.attributes.property).match(/^article:/) || lowerIfExists(sn.attributes.property).match(/^product:/))) {
        return true;
      } else if (slimDOMOptions.headMetaVerification && (lowerIfExists(sn.attributes.name) === "google-site-verification" || lowerIfExists(sn.attributes.name) === "yandex-verification" || lowerIfExists(sn.attributes.name) === "csrf-token" || lowerIfExists(sn.attributes.name) === "p:domain_verify" || lowerIfExists(sn.attributes.name) === "verify-v1" || lowerIfExists(sn.attributes.name) === "verification" || lowerIfExists(sn.attributes.name) === "shopify-checkout-api-token")) {
        return true;
      }
    }
  }
  return false;
}
function serializeNodeWithId(n2, options) {
  const {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    maskTextClass,
    maskTextSelector,
    skipChild = false,
    inlineStylesheet = true,
    maskInputOptions = {},
    maskTextFn,
    maskInputFn,
    slimDOMOptions,
    dataURLOptions = {},
    inlineImages = false,
    recordCanvas = false,
    onSerialize,
    onIframeLoad,
    iframeLoadTimeout = 5e3,
    onStylesheetLoad,
    stylesheetLoadTimeout = 5e3,
    keepIframeSrcFn = () => false,
    newlyAddedElement = false,
    privacySetting
  } = options;
  let { needsMask } = options;
  let { preserveWhiteSpace = true } = options;
  if (!needsMask) {
    const checkAncestors = needsMask === void 0;
    needsMask = needMaskingText(
      n2,
      maskTextClass,
      maskTextSelector,
      checkAncestors
    );
  }
  const _serializedNode = serializeNode(n2, {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    needsMask,
    inlineStylesheet,
    maskInputOptions,
    maskTextClass,
    maskTextFn,
    maskInputFn,
    dataURLOptions,
    inlineImages,
    recordCanvas,
    keepIframeSrcFn,
    newlyAddedElement,
    privacySetting
  });
  if (!_serializedNode) {
    console.warn(n2, "not serialized");
    return null;
  }
  let id;
  if (mirror2.hasNode(n2)) {
    id = mirror2.getId(n2);
  } else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType$2.Text && !_serializedNode.isStyle && !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length) {
    id = IGNORED_NODE;
  } else {
    id = genId();
  }
  const serializedNode = Object.assign(_serializedNode, { id });
  mirror2.add(n2, serializedNode);
  if (id === IGNORED_NODE) {
    return null;
  }
  if (onSerialize) {
    onSerialize(n2);
  }
  let recordChild = !skipChild;
  let overwrittenPrivacySetting = privacySetting;
  let strictPrivacy = privacySetting === "strict";
  if (serializedNode.type === NodeType$2.Element) {
    recordChild = recordChild && !serializedNode.needBlock;
    strictPrivacy || (strictPrivacy = !!serializedNode.needBlock || !!serializedNode.needMask);
    overwrittenPrivacySetting = strictPrivacy ? "strict" : overwrittenPrivacySetting;
    if (strictPrivacy && isElementSrcBlocked(serializedNode.tagName)) {
      const clone = n2.cloneNode();
      clone.src = "";
      mirror2.add(clone, serializedNode);
    }
    delete serializedNode.needBlock;
    delete serializedNode.needMask;
    const shadowRootEl = index$1.shadowRoot(n2);
    if (shadowRootEl && isNativeShadowDom(shadowRootEl))
      serializedNode.isShadowHost = true;
  }
  if ((serializedNode.type === NodeType$2.Document || serializedNode.type === NodeType$2.Element) && recordChild) {
    if (slimDOMOptions.headWhitespace && serializedNode.type === NodeType$2.Element && serializedNode.tagName === "head") {
      preserveWhiteSpace = false;
    }
    const bypassOptions = {
      doc,
      mirror: mirror2,
      blockClass,
      blockSelector,
      needsMask,
      maskTextClass,
      maskTextSelector,
      skipChild,
      inlineStylesheet,
      maskInputOptions,
      maskTextFn,
      maskInputFn,
      slimDOMOptions,
      dataURLOptions,
      inlineImages,
      recordCanvas,
      preserveWhiteSpace,
      onSerialize,
      onIframeLoad,
      iframeLoadTimeout,
      onStylesheetLoad,
      stylesheetLoadTimeout,
      keepIframeSrcFn,
      privacySetting: overwrittenPrivacySetting
    };
    if (serializedNode.type === NodeType$2.Element && serializedNode.tagName === "textarea" && serializedNode.attributes.value !== void 0)
      ;
    else {
      for (const childN of Array.from(index$1.childNodes(n2))) {
        const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
        if (serializedChildNode) {
          serializedNode.childNodes.push(serializedChildNode);
        }
      }
    }
    let shadowRootEl = null;
    if (isElement(n2) && (shadowRootEl = index$1.shadowRoot(n2))) {
      for (const childN of Array.from(index$1.childNodes(shadowRootEl))) {
        const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
        if (serializedChildNode) {
          isNativeShadowDom(shadowRootEl) && (serializedChildNode.isShadow = true);
          serializedNode.childNodes.push(serializedChildNode);
        }
      }
    }
  }
  const parent = index$1.parentNode(n2);
  if (parent && isShadowRoot(parent) && isNativeShadowDom(parent)) {
    serializedNode.isShadow = true;
  }
  if (serializedNode.type === NodeType$2.Element && serializedNode.tagName === "iframe") {
    onceIframeLoaded(
      n2,
      () => {
        const iframeDoc = n2.contentDocument;
        if (iframeDoc && onIframeLoad) {
          const serializedIframeNode = serializeNodeWithId(iframeDoc, {
            doc: iframeDoc,
            mirror: mirror2,
            blockClass,
            blockSelector,
            needsMask,
            maskTextClass,
            maskTextSelector,
            skipChild: false,
            inlineStylesheet,
            maskInputOptions,
            maskTextFn,
            maskInputFn,
            slimDOMOptions,
            dataURLOptions,
            inlineImages,
            recordCanvas,
            preserveWhiteSpace,
            onSerialize,
            onIframeLoad,
            iframeLoadTimeout,
            onStylesheetLoad,
            stylesheetLoadTimeout,
            keepIframeSrcFn,
            privacySetting
          });
          if (serializedIframeNode) {
            onIframeLoad(
              n2,
              serializedIframeNode
            );
          }
        }
      },
      iframeLoadTimeout
    );
  }
  if (serializedNode.type === NodeType$2.Element && serializedNode.tagName === "link" && typeof serializedNode.attributes.rel === "string" && (serializedNode.attributes.rel === "stylesheet" || serializedNode.attributes.rel === "preload" && typeof serializedNode.attributes.href === "string" && extractFileExtension(serializedNode.attributes.href) === "css")) {
    onceStylesheetLoaded(
      n2,
      () => {
        if (onStylesheetLoad) {
          const serializedLinkNode = serializeNodeWithId(n2, {
            doc,
            mirror: mirror2,
            blockClass,
            blockSelector,
            needsMask,
            maskTextClass,
            maskTextSelector,
            skipChild: false,
            inlineStylesheet,
            maskInputOptions,
            maskTextFn,
            maskInputFn,
            slimDOMOptions,
            dataURLOptions,
            inlineImages,
            recordCanvas,
            preserveWhiteSpace,
            onSerialize,
            onIframeLoad,
            iframeLoadTimeout,
            onStylesheetLoad,
            stylesheetLoadTimeout,
            keepIframeSrcFn,
            privacySetting
          });
          if (serializedLinkNode) {
            onStylesheetLoad(
              n2,
              serializedLinkNode
            );
          }
        }
      },
      stylesheetLoadTimeout
    );
  }
  return serializedNode;
}
function snapshot(n2, options) {
  const {
    mirror: mirror2 = new Mirror(),
    blockClass = "highlight-block",
    blockSelector = null,
    maskTextClass = "highlight-mask",
    maskTextSelector = null,
    inlineStylesheet = true,
    inlineImages = false,
    recordCanvas = false,
    maskAllInputs = false,
    maskTextFn,
    maskInputFn,
    slimDOM = false,
    dataURLOptions,
    preserveWhiteSpace,
    onSerialize,
    onIframeLoad,
    iframeLoadTimeout,
    onStylesheetLoad,
    stylesheetLoadTimeout,
    keepIframeSrcFn = () => false,
    privacySetting = "default"
  } = options || {};
  const maskInputOptions = maskAllInputs === true ? {
    color: true,
    date: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
    textarea: true,
    select: true,
    password: true
  } : maskAllInputs === false ? {
    password: true
  } : maskAllInputs;
  const slimDOMOptions = slimDOM || slimDOM === "all" ? (
    // if true: set of sensible options that should not throw away any information
    {
      script: true,
      comment: true,
      headFavicon: true,
      headWhitespace: true,
      headMetaDescKeywords: slimDOM === "all",
      // destructive
      headMetaSocial: true,
      headMetaRobots: true,
      headMetaHttpEquiv: true,
      headMetaAuthorship: true,
      headMetaVerification: true
    }
  ) : !slimDOM ? {} : slimDOM;
  return serializeNodeWithId(n2, {
    doc: n2,
    mirror: mirror2,
    blockClass,
    blockSelector,
    maskTextClass,
    maskTextSelector,
    skipChild: false,
    inlineStylesheet,
    maskInputOptions,
    maskTextFn,
    maskInputFn,
    slimDOMOptions,
    dataURLOptions,
    inlineImages,
    recordCanvas,
    preserveWhiteSpace,
    onSerialize,
    onIframeLoad,
    iframeLoadTimeout,
    onStylesheetLoad,
    stylesheetLoadTimeout,
    keepIframeSrcFn,
    newlyAddedElement: false,
    privacySetting
  });
}
var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
function parse(css, options = {}) {
  let lineno = 1;
  let column = 1;
  function updatePosition(str) {
    const lines = str.match(/\n/g);
    if (lines) {
      lineno += lines.length;
    }
    const i2 = str.lastIndexOf("\n");
    column = i2 === -1 ? column + str.length : str.length - i2;
  }
  function position() {
    const start = { line: lineno, column };
    return (node) => {
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }
  const _Position = class _Position2 {
    constructor(start) {
      __publicField$1(this, "content");
      __publicField$1(this, "start");
      __publicField$1(this, "end");
      __publicField$1(this, "source");
      this.start = start;
      this.end = { line: lineno, column };
      this.source = options.source;
      this.content = _Position2.content;
    }
  };
  __publicField$1(_Position, "content");
  let Position = _Position;
  Position.content = css;
  const errorsList = [];
  function error(msg) {
    const err = new Error(
      `${options.source || ""}:${lineno}:${column}: ${msg}`
    );
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = css;
    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }
  function stylesheet() {
    const rulesList = rules2();
    return {
      type: "stylesheet",
      stylesheet: {
        source: options.source,
        rules: rulesList,
        parsingErrors: errorsList
      }
    };
  }
  function open() {
    return match(/^{\s*/);
  }
  function close() {
    return match(/^}/);
  }
  function rules2() {
    let node;
    const rules22 = [];
    whitespace();
    comments(rules22);
    while (css.length && css.charAt(0) !== "}" && (node = atrule() || rule())) {
      if (node) {
        rules22.push(node);
        comments(rules22);
      }
    }
    return rules22;
  }
  function match(re) {
    const m = re.exec(css);
    if (!m) {
      return;
    }
    const str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }
  function whitespace() {
    match(/^\s*/);
  }
  function comments(rules22 = []) {
    let c2;
    while (c2 = comment()) {
      if (c2) {
        rules22.push(c2);
      }
      c2 = comment();
    }
    return rules22;
  }
  function comment() {
    const pos = position();
    if ("/" !== css.charAt(0) || "*" !== css.charAt(1)) {
      return;
    }
    let i2 = 2;
    while ("" !== css.charAt(i2) && ("*" !== css.charAt(i2) || "/" !== css.charAt(i2 + 1))) {
      ++i2;
    }
    i2 += 2;
    if ("" === css.charAt(i2 - 1)) {
      return error("End of comment missing");
    }
    const str = css.slice(2, i2 - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i2);
    column += 2;
    return pos({
      type: "comment",
      comment: str
    });
  }
  const selectorMatcher = new RegExp(
    "^((" + [
      /[^\\]"(?:\\"|[^"])*"/.source,
      // consume any quoted parts (checking that the double quote isn't itself escaped)
      /[^\\]'(?:\\'|[^'])*'/.source,
      // same but for single quotes
      "[^{]"
    ].join("|") + ")+)"
  );
  function selector() {
    whitespace();
    while (css[0] == "}") {
      error("extra closing bracket");
      css = css.slice(1);
      whitespace();
    }
    const m = match(selectorMatcher);
    if (!m) {
      return;
    }
    const cleanedInput = m[0].trim().replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (m2) => {
      return m2.replace(/,/g, "\u200C");
    });
    return customSplit(cleanedInput).map(
      (s2) => s2.replace(/\u200C/g, ",").trim()
    );
  }
  function customSplit(input) {
    const result = [];
    let currentSegment = "";
    let depthParentheses = 0;
    let depthBrackets = 0;
    let currentStringChar = null;
    for (const char of input) {
      const hasStringEscape = currentSegment.endsWith("\\");
      if (currentStringChar) {
        if (currentStringChar === char && !hasStringEscape) {
          currentStringChar = null;
        }
      } else if (char === "(") {
        depthParentheses++;
      } else if (char === ")") {
        depthParentheses--;
      } else if (char === "[") {
        depthBrackets++;
      } else if (char === "]") {
        depthBrackets--;
      } else if (`'"`.includes(char)) {
        currentStringChar = char;
      }
      if (char === "," && depthParentheses === 0 && depthBrackets === 0) {
        result.push(currentSegment);
        currentSegment = "";
      } else {
        currentSegment += char;
      }
    }
    if (currentSegment) {
      result.push(currentSegment);
    }
    return result;
  }
  function declaration() {
    const pos = position();
    const propMatch = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!propMatch) {
      return;
    }
    const prop = trim(propMatch[0]);
    if (!match(/^:\s*/)) {
      return error(`property missing ':'`);
    }
    const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
    const ret = pos({
      type: "declaration",
      property: prop.replace(commentre, ""),
      value: val ? trim(val[0]).replace(commentre, "") : ""
    });
    match(/^[;\s]*/);
    return ret;
  }
  function declarations() {
    const decls = [];
    if (!open()) {
      return error(`missing '{'`);
    }
    comments(decls);
    let decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
      decl = declaration();
    }
    if (!close()) {
      return error(`missing '}'`);
    }
    return decls;
  }
  function keyframe() {
    let m;
    const vals = [];
    const pos = position();
    while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }
    if (!vals.length) {
      return;
    }
    return pos({
      type: "keyframe",
      values: vals,
      declarations: declarations()
    });
  }
  function atkeyframes() {
    const pos = position();
    let m = match(/^@([-\w]+)?keyframes\s*/);
    if (!m) {
      return;
    }
    const vendor = m[1];
    m = match(/^([-\w]+)\s*/);
    if (!m) {
      return error("@keyframes missing name");
    }
    const name = m[1];
    if (!open()) {
      return error(`@keyframes missing '{'`);
    }
    let frame;
    let frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }
    if (!close()) {
      return error(`@keyframes missing '}'`);
    }
    return pos({
      type: "keyframes",
      name,
      vendor,
      keyframes: frames
    });
  }
  function atsupports() {
    const pos = position();
    const m = match(/^@supports *([^{]+)/);
    if (!m) {
      return;
    }
    const supports = trim(m[1]);
    if (!open()) {
      return error(`@supports missing '{'`);
    }
    const style = comments().concat(rules2());
    if (!close()) {
      return error(`@supports missing '}'`);
    }
    return pos({
      type: "supports",
      supports,
      rules: style
    });
  }
  function athost() {
    const pos = position();
    const m = match(/^@host\s*/);
    if (!m) {
      return;
    }
    if (!open()) {
      return error(`@host missing '{'`);
    }
    const style = comments().concat(rules2());
    if (!close()) {
      return error(`@host missing '}'`);
    }
    return pos({
      type: "host",
      rules: style
    });
  }
  function atmedia() {
    const pos = position();
    const m = match(/^@media *([^{]+)/);
    if (!m) {
      return;
    }
    const media = trim(m[1]);
    if (!open()) {
      return error(`@media missing '{'`);
    }
    const style = comments().concat(rules2());
    if (!close()) {
      return error(`@media missing '}'`);
    }
    return pos({
      type: "media",
      media,
      rules: style
    });
  }
  function atcustommedia() {
    const pos = position();
    const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) {
      return;
    }
    return pos({
      type: "custom-media",
      name: trim(m[1]),
      media: trim(m[2])
    });
  }
  function atpage() {
    const pos = position();
    const m = match(/^@page */);
    if (!m) {
      return;
    }
    const sel = selector() || [];
    if (!open()) {
      return error(`@page missing '{'`);
    }
    let decls = comments();
    let decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }
    if (!close()) {
      return error(`@page missing '}'`);
    }
    return pos({
      type: "page",
      selectors: sel,
      declarations: decls
    });
  }
  function atdocument() {
    const pos = position();
    const m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) {
      return;
    }
    const vendor = trim(m[1]);
    const doc = trim(m[2]);
    if (!open()) {
      return error(`@document missing '{'`);
    }
    const style = comments().concat(rules2());
    if (!close()) {
      return error(`@document missing '}'`);
    }
    return pos({
      type: "document",
      document: doc,
      vendor,
      rules: style
    });
  }
  function atfontface() {
    const pos = position();
    const m = match(/^@font-face\s*/);
    if (!m) {
      return;
    }
    if (!open()) {
      return error(`@font-face missing '{'`);
    }
    let decls = comments();
    let decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }
    if (!close()) {
      return error(`@font-face missing '}'`);
    }
    return pos({
      type: "font-face",
      declarations: decls
    });
  }
  const atimport = _compileAtrule("import");
  const atcharset = _compileAtrule("charset");
  const atnamespace = _compileAtrule("namespace");
  function _compileAtrule(name) {
    const re = new RegExp(
      "^@" + name + "\\s*((?:" + [
        /[^\\]"(?:\\"|[^"])*"/.source,
        // consume any quoted parts (checking that the double quote isn't itself escaped)
        /[^\\]'(?:\\'|[^'])*'/.source,
        // same but for single quotes
        "[^;]"
      ].join("|") + ")+);"
    );
    return () => {
      const pos = position();
      const m = match(re);
      if (!m) {
        return;
      }
      const ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    };
  }
  function atrule() {
    if (css[0] !== "@") {
      return;
    }
    return atkeyframes() || atmedia() || atcustommedia() || atsupports() || atimport() || atcharset() || atnamespace() || atdocument() || atpage() || athost() || atfontface();
  }
  function rule() {
    const pos = position();
    const sel = selector();
    if (!sel) {
      return error("selector missing");
    }
    comments();
    return pos({
      type: "rule",
      selectors: sel,
      declarations: declarations()
    });
  }
  return addParent(stylesheet());
}
function trim(str) {
  return str ? str.replace(/^\s+|\s+$/g, "") : "";
}
function addParent(obj, parent) {
  const isNode = obj && typeof obj.type === "string";
  const childParent = isNode ? obj : parent;
  for (const k of Object.keys(obj)) {
    const value = obj[k];
    if (Array.isArray(value)) {
      value.forEach((v2) => {
        addParent(v2, childParent);
      });
    } else if (value && typeof value === "object") {
      addParent(value, childParent);
    }
  }
  if (isNode) {
    Object.defineProperty(obj, "parent", {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }
  return obj;
}
var tagMap = {
  script: "noscript",
  // camel case svg element tag names
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient"
};
function getTagName(n2) {
  let tagName = tagMap[n2.tagName] ? tagMap[n2.tagName] : n2.tagName;
  if (tagName === "link" && n2.attributes._cssText) {
    tagName = "style";
  }
  return tagName;
}
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var MEDIA_SELECTOR = /(max|min)-device-(width|height)/;
var MEDIA_SELECTOR_GLOBAL = new RegExp(MEDIA_SELECTOR.source, "g");
var HOVER_SELECTOR = /([^\\]):hover/;
var HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, "g");
function adaptCssForReplay(cssText, cache) {
  const cachedStyle = cache == null ? void 0 : cache.stylesWithHoverClass.get(cssText);
  if (cachedStyle)
    return cachedStyle;
  const ast = parse(cssText, {
    silent: true
  });
  if (!ast.stylesheet) {
    return cssText;
  }
  const selectors = [];
  const medias = [];
  function getSelectors(rule) {
    if ("selectors" in rule && rule.selectors) {
      rule.selectors.forEach((selector) => {
        if (HOVER_SELECTOR.test(selector)) {
          selectors.push(selector);
        }
      });
    }
    if ("media" in rule && rule.media && MEDIA_SELECTOR.test(rule.media)) {
      medias.push(rule.media);
    }
    if ("rules" in rule && rule.rules) {
      rule.rules.forEach(getSelectors);
    }
  }
  getSelectors(ast.stylesheet);
  let result = cssText;
  if (selectors.length > 0) {
    const selectorMatcher = new RegExp(
      selectors.filter((selector, index2) => selectors.indexOf(selector) === index2).sort((a2, b) => b.length - a2.length).map((selector) => {
        return escapeRegExp(selector);
      }).join("|"),
      "g"
    );
    result = result.replace(selectorMatcher, (selector) => {
      const newSelector = selector.replace(
        HOVER_SELECTOR_GLOBAL,
        "$1.\\:hover"
      );
      return `${selector}, ${newSelector}`;
    });
  }
  if (medias.length > 0) {
    const mediaMatcher = new RegExp(
      medias.filter((media, index2) => medias.indexOf(media) === index2).sort((a2, b) => b.length - a2.length).map((media) => {
        return escapeRegExp(media);
      }).join("|"),
      "g"
    );
    result = result.replace(mediaMatcher, (media) => {
      return media.replace(MEDIA_SELECTOR_GLOBAL, "$1-$2");
    });
  }
  cache == null ? void 0 : cache.stylesWithHoverClass.set(cssText, result);
  return result;
}
function createCache() {
  const stylesWithHoverClass = /* @__PURE__ */ new Map();
  return {
    stylesWithHoverClass
  };
}
function buildNode(n2, options) {
  var _a2;
  const { doc, hackCss, cache } = options;
  switch (n2.type) {
    case NodeType$2.Document:
      return doc.implementation.createDocument(null, "", null);
    case NodeType$2.DocumentType:
      return doc.implementation.createDocumentType(
        n2.name || "html",
        n2.publicId,
        n2.systemId
      );
    case NodeType$2.Element: {
      const tagName = getTagName(n2);
      let node;
      if (n2.isSVG) {
        node = doc.createElementNS("http://www.w3.org/2000/svg", tagName);
      } else {
        if (
          // If the tag name is a custom element name
          n2.isCustom && // If the browser supports custom elements
          ((_a2 = doc.defaultView) == null ? void 0 : _a2.customElements) && // If the custom element hasn't been defined yet
          !doc.defaultView.customElements.get(n2.tagName)
        )
          doc.defaultView.customElements.define(
            n2.tagName,
            class extends doc.defaultView.HTMLElement {
            }
          );
        node = doc.createElement(tagName);
      }
      const specialAttributes = {};
      for (const name in n2.attributes) {
        if (!Object.prototype.hasOwnProperty.call(n2.attributes, name)) {
          continue;
        }
        let value = n2.attributes[name];
        if (tagName === "option" && name === "selected" && value === false) {
          continue;
        }
        if (value === null) {
          continue;
        }
        if (value === true)
          value = "";
        if (name.startsWith("rr_")) {
          specialAttributes[name] = value;
          continue;
        }
        const isTextarea = tagName === "textarea" && name === "value";
        const isRemoteOrDynamicCss = tagName === "style" && name === "_cssText";
        if (isRemoteOrDynamicCss && hackCss && typeof value === "string") {
          value = adaptCssForReplay(value, cache);
        }
        if ((isTextarea || isRemoteOrDynamicCss) && typeof value === "string") {
          node.appendChild(doc.createTextNode(value));
          n2.childNodes = [];
          continue;
        }
        try {
          if (n2.isSVG && name === "xlink:href") {
            node.setAttributeNS(
              "http://www.w3.org/1999/xlink",
              name,
              value.toString()
            );
          } else if (name === "onload" || name === "onclick" || name.substring(0, 7) === "onmouse") {
            node.setAttribute("_" + name, value.toString());
          } else if (tagName === "meta" && n2.attributes["http-equiv"] === "Content-Security-Policy" && name === "content") {
            node.setAttribute("csp-content", value.toString());
            continue;
          } else if (tagName === "link" && (n2.attributes.rel === "preload" || n2.attributes.rel === "modulepreload") && n2.attributes.as === "script") {
          } else if (tagName === "link" && n2.attributes.rel === "prefetch" && typeof n2.attributes.href === "string" && n2.attributes.href.endsWith(".js")) {
          } else if (tagName === "img" && n2.attributes.srcset && n2.attributes.rr_dataURL) {
            node.setAttribute(
              "rrweb-original-srcset",
              n2.attributes.srcset
            );
          } else {
            node.setAttribute(name, value.toString());
          }
        } catch (error) {
        }
      }
      for (const name in specialAttributes) {
        const value = specialAttributes[name];
        if (tagName === "canvas" && name === "rr_dataURL") {
          const image = doc.createElement("img");
          image.onload = () => {
            const ctx = node.getContext("2d");
            if (ctx) {
              ctx.drawImage(image, 0, 0, image.width, image.height);
            }
          };
          image.src = value.toString();
          if (node.RRNodeType)
            node.rr_dataURL = value.toString();
        } else if (tagName === "img" && name === "rr_dataURL") {
          const image = node;
          if (!image.currentSrc.startsWith("data:")) {
            image.setAttribute(
              "rrweb-original-src",
              n2.attributes.src
            );
            image.src = value.toString();
          }
        }
        if (name === "rr_width") {
          node.style.width = value.toString();
        } else if (name === "rr_height") {
          node.style.height = value.toString();
        } else if (name === "rr_mediaCurrentTime" && typeof value === "number") {
          node.currentTime = value;
        } else if (name === "rr_mediaState") {
          switch (value) {
            case "played":
              node.play().catch((e2) => console.warn("media playback error", e2));
              break;
            case "paused":
              node.pause();
              break;
          }
        } else if (name === "rr_mediaPlaybackRate" && typeof value === "number") {
          node.playbackRate = value;
        } else if (name === "rr_mediaMuted" && typeof value === "boolean") {
          node.muted = value;
        } else if (name === "rr_mediaLoop" && typeof value === "boolean") {
          node.loop = value;
        } else if (name === "rr_mediaVolume" && typeof value === "number") {
          node.volume = value;
        } else if (name === "rr_open_mode") {
          node.setAttribute(
            "rr_open_mode",
            value
          );
        }
      }
      if (n2.isShadowHost) {
        if (!node.shadowRoot) {
          node.attachShadow({ mode: "open" });
        } else {
          while (node.shadowRoot.firstChild) {
            node.shadowRoot.removeChild(node.shadowRoot.firstChild);
          }
        }
      }
      return node;
    }
    case NodeType$2.Text:
      return doc.createTextNode(
        n2.isStyle && hackCss ? adaptCssForReplay(n2.textContent, cache) : n2.textContent
      );
    case NodeType$2.CDATA:
      return doc.createCDATASection(n2.textContent);
    case NodeType$2.Comment:
      return doc.createComment(n2.textContent);
    default:
      return null;
  }
}
function buildNodeWithSN(n2, options) {
  const {
    doc,
    mirror: mirror2,
    skipChild = false,
    hackCss = true,
    afterAppend,
    cache
  } = options;
  if (mirror2.has(n2.id)) {
    const nodeInMirror = mirror2.getNode(n2.id);
    const meta = mirror2.getMeta(nodeInMirror);
    if (isNodeMetaEqual(meta, n2))
      return mirror2.getNode(n2.id);
  }
  let node = buildNode(n2, { doc, hackCss, cache });
  if (!node) {
    return null;
  }
  if (n2.rootId && mirror2.getNode(n2.rootId) !== doc) {
    mirror2.replace(n2.rootId, doc);
  }
  if (n2.type === NodeType$2.Document) {
    doc.close();
    doc.open();
    if (n2.compatMode === "BackCompat" && n2.childNodes && n2.childNodes[0].type !== NodeType$2.DocumentType) {
      if (n2.childNodes[0].type === NodeType$2.Element && "xmlns" in n2.childNodes[0].attributes && n2.childNodes[0].attributes.xmlns === "http://www.w3.org/1999/xhtml") {
        doc.write(
          '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">'
        );
      } else {
        doc.write(
          '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">'
        );
      }
    }
    node = doc;
  }
  mirror2.add(node, n2);
  if ((n2.type === NodeType$2.Document || n2.type === NodeType$2.Element) && !skipChild) {
    for (const childN of n2.childNodes) {
      const childNode = buildNodeWithSN(childN, {
        doc,
        mirror: mirror2,
        skipChild: false,
        hackCss,
        afterAppend,
        cache
      });
      if (!childNode) {
        console.warn("Failed to rebuild", childN);
        continue;
      }
      if (childN.isShadow && isElement(node) && node.shadowRoot) {
        node.shadowRoot.appendChild(childNode);
      } else if (n2.type === NodeType$2.Document && childN.type == NodeType$2.Element) {
        const htmlElement = childNode;
        let body = null;
        htmlElement.childNodes.forEach((child) => {
          if (child.nodeName === "BODY")
            body = child;
        });
        if (body) {
          htmlElement.removeChild(body);
          node.appendChild(childNode);
          htmlElement.appendChild(body);
        } else {
          node.appendChild(childNode);
        }
      } else {
        node.appendChild(childNode);
      }
      if (afterAppend) {
        afterAppend(childNode, childN.id);
      }
    }
  }
  return node;
}
function visit(mirror2, onVisit) {
  function walk(node) {
    onVisit(node);
  }
  for (const id of mirror2.getIds()) {
    if (mirror2.has(id)) {
      walk(mirror2.getNode(id));
    }
  }
}
function handleScroll(node, mirror2) {
  const n2 = mirror2.getMeta(node);
  if ((n2 == null ? void 0 : n2.type) !== NodeType$2.Element) {
    return;
  }
  const el = node;
  for (const name in n2.attributes) {
    if (!(Object.prototype.hasOwnProperty.call(n2.attributes, name) && name.startsWith("rr_"))) {
      continue;
    }
    const value = n2.attributes[name];
    if (name === "rr_scrollLeft") {
      el.scrollLeft = value;
    }
    if (name === "rr_scrollTop") {
      el.scrollTop = value;
    }
  }
}
function rebuild(n2, options) {
  const {
    doc,
    onVisit,
    hackCss = true,
    afterAppend,
    cache,
    mirror: mirror2 = new Mirror()
  } = options;
  const node = buildNodeWithSN(n2, {
    doc,
    mirror: mirror2,
    skipChild: false,
    hackCss,
    afterAppend,
    cache
  });
  visit(mirror2, (visitedNode) => {
    if (onVisit) {
      onVisit(visitedNode);
    }
    handleScroll(visitedNode, mirror2);
  });
  return node;
}
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __defProp22 = Object.defineProperty;
var __defNormalProp22 = (obj, key, value) => key in obj ? __defProp22(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField22 = (obj, key, value) => __defNormalProp22(obj, typeof key !== "symbol" ? key + "" : key, value);
var NodeType$1 = /* @__PURE__ */ ((NodeType2) => {
  NodeType2[NodeType2["Document"] = 0] = "Document";
  NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
  NodeType2[NodeType2["Element"] = 2] = "Element";
  NodeType2[NodeType2["Text"] = 3] = "Text";
  NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
  NodeType2[NodeType2["Comment"] = 5] = "Comment";
  return NodeType2;
})(NodeType$1 || {});
var Mirror$1 = class Mirror2 {
  constructor() {
    __publicField22(this, "idNodeMap", /* @__PURE__ */ new Map());
    __publicField22(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(n2) {
    var _a2;
    if (!n2)
      return -1;
    const id = (_a2 = this.getMeta(n2)) == null ? void 0 : _a2.id;
    return id ?? -1;
  }
  getNode(id) {
    return this.idNodeMap.get(id) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(n2) {
    return this.nodeMetaMap.get(n2) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(n2) {
    const id = this.getId(n2);
    this.idNodeMap.delete(id);
    if (n2.childNodes) {
      n2.childNodes.forEach(
        (childNode) => this.removeNodeFromMap(childNode)
      );
    }
  }
  has(id) {
    return this.idNodeMap.has(id);
  }
  hasNode(node) {
    return this.nodeMetaMap.has(node);
  }
  add(n2, meta) {
    const id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  }
  replace(id, n2) {
    const oldNode = this.getNode(id);
    if (oldNode) {
      const meta = this.nodeMetaMap.get(oldNode);
      if (meta)
        this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
};
function createMirror$1() {
  return new Mirror$1();
}
function parseCSSText(cssText) {
  const res = {};
  const listDelimiter = /;(?![^(]*\))/g;
  const propertyDelimiter = /:(.+)/;
  const comment = /\/\*.*?\*\//g;
  cssText.replace(comment, "").split(listDelimiter).forEach(function(item) {
    if (item) {
      const tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[camelize(tmp[0].trim())] = tmp[1].trim());
    }
  });
  return res;
}
function toCSSText(style) {
  const properties = [];
  for (const name in style) {
    const value = style[name];
    if (typeof value !== "string")
      continue;
    const normalizedName = hyphenate(name);
    properties.push(`${normalizedName}: ${value};`);
  }
  return properties.join(" ");
}
var camelizeRE = /-([a-z])/g;
var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9-]+$/;
var camelize = (str) => {
  if (CUSTOM_PROPERTY_REGEX.test(str))
    return str;
  return str.replace(camelizeRE, (_, c2) => c2 ? c2.toUpperCase() : "");
};
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = (str) => {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
};
var BaseRRNode = class _BaseRRNode {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(..._args) {
    __publicField2(this, "parentElement", null);
    __publicField2(this, "parentNode", null);
    __publicField2(this, "ownerDocument");
    __publicField2(this, "firstChild", null);
    __publicField2(this, "lastChild", null);
    __publicField2(this, "previousSibling", null);
    __publicField2(this, "nextSibling", null);
    __publicField2(this, "ELEMENT_NODE", 1);
    __publicField2(this, "TEXT_NODE", 3);
    __publicField2(this, "nodeType");
    __publicField2(this, "nodeName");
    __publicField2(this, "RRNodeType");
  }
  get childNodes() {
    const childNodes2 = [];
    let childIterator = this.firstChild;
    while (childIterator) {
      childNodes2.push(childIterator);
      childIterator = childIterator.nextSibling;
    }
    return childNodes2;
  }
  contains(node) {
    if (!(node instanceof _BaseRRNode))
      return false;
    else if (node.ownerDocument !== this.ownerDocument)
      return false;
    else if (node === this)
      return true;
    while (node.parentNode) {
      if (node.parentNode === this)
        return true;
      node = node.parentNode;
    }
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendChild(_newChild) {
    throw new Error(
      `RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.`
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertBefore(_newChild, _refChild) {
    throw new Error(
      `RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.`
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeChild(_node) {
    throw new Error(
      `RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.`
    );
  }
  toString() {
    return "RRNode";
  }
};
var BaseRRDocument = class _BaseRRDocument extends BaseRRNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args) {
    super(args);
    __publicField2(this, "nodeType", 9);
    __publicField2(this, "nodeName", "#document");
    __publicField2(this, "compatMode", "CSS1Compat");
    __publicField2(this, "RRNodeType", NodeType$1.Document);
    __publicField2(this, "textContent", null);
    this.ownerDocument = this;
  }
  get documentElement() {
    return this.childNodes.find(
      (node) => node.RRNodeType === NodeType$1.Element && node.tagName === "HTML"
    ) || null;
  }
  get body() {
    var _a2;
    return ((_a2 = this.documentElement) == null ? void 0 : _a2.childNodes.find(
      (node) => node.RRNodeType === NodeType$1.Element && node.tagName === "BODY"
    )) || null;
  }
  get head() {
    var _a2;
    return ((_a2 = this.documentElement) == null ? void 0 : _a2.childNodes.find(
      (node) => node.RRNodeType === NodeType$1.Element && node.tagName === "HEAD"
    )) || null;
  }
  get implementation() {
    return this;
  }
  get firstElementChild() {
    return this.documentElement;
  }
  appendChild(newChild) {
    const nodeType = newChild.RRNodeType;
    if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
      if (this.childNodes.some((s2) => s2.RRNodeType === nodeType)) {
        throw new Error(
          `RRDomException: Failed to execute 'appendChild' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`
        );
      }
    }
    const child = appendChild(this, newChild);
    child.parentElement = null;
    return child;
  }
  insertBefore(newChild, refChild) {
    const nodeType = newChild.RRNodeType;
    if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
      if (this.childNodes.some((s2) => s2.RRNodeType === nodeType)) {
        throw new Error(
          `RRDomException: Failed to execute 'insertBefore' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`
        );
      }
    }
    const child = insertBefore(this, newChild, refChild);
    child.parentElement = null;
    return child;
  }
  removeChild(node) {
    return removeChild(this, node);
  }
  open() {
    this.firstChild = null;
    this.lastChild = null;
  }
  close() {
  }
  /**
   * Adhoc implementation for setting xhtml namespace in rebuilt.ts (rrweb-snapshot).
   * There are two lines used this function:
   * 1. doc.write('\<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ""\>')
   * 2. doc.write('\<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" ""\>')
   */
  write(content) {
    let publicId;
    if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">')
      publicId = "-//W3C//DTD XHTML 1.0 Transitional//EN";
    else if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">')
      publicId = "-//W3C//DTD HTML 4.0 Transitional//EN";
    if (publicId) {
      const doctype = this.createDocumentType("html", publicId, "");
      this.open();
      this.appendChild(doctype);
    }
  }
  createDocument(_namespace, _qualifiedName, _doctype) {
    return new _BaseRRDocument();
  }
  createDocumentType(qualifiedName, publicId, systemId) {
    const doctype = new BaseRRDocumentType(qualifiedName, publicId, systemId);
    doctype.ownerDocument = this;
    return doctype;
  }
  createElement(tagName) {
    const element = new BaseRRElement(tagName);
    element.ownerDocument = this;
    return element;
  }
  createElementNS(_namespaceURI, qualifiedName) {
    return this.createElement(qualifiedName);
  }
  createTextNode(data) {
    const text = new BaseRRText(data);
    text.ownerDocument = this;
    return text;
  }
  createComment(data) {
    const comment = new BaseRRComment(data);
    comment.ownerDocument = this;
    return comment;
  }
  createCDATASection(data) {
    const CDATASection = new BaseRRCDATASection(data);
    CDATASection.ownerDocument = this;
    return CDATASection;
  }
  toString() {
    return "RRDocument";
  }
};
var BaseRRDocumentType = class extends BaseRRNode {
  constructor(qualifiedName, publicId, systemId) {
    super();
    __publicField2(this, "nodeType", 10);
    __publicField2(this, "RRNodeType", NodeType$1.DocumentType);
    __publicField2(this, "name");
    __publicField2(this, "publicId");
    __publicField2(this, "systemId");
    __publicField2(this, "textContent", null);
    this.name = qualifiedName;
    this.publicId = publicId;
    this.systemId = systemId;
    this.nodeName = qualifiedName;
  }
  toString() {
    return "RRDocumentType";
  }
};
var BaseRRElement = class extends BaseRRNode {
  constructor(tagName) {
    super();
    __publicField2(this, "nodeType", 1);
    __publicField2(this, "RRNodeType", NodeType$1.Element);
    __publicField2(this, "tagName");
    __publicField2(this, "attributes", {});
    __publicField2(this, "shadowRoot", null);
    __publicField2(this, "scrollLeft");
    __publicField2(this, "scrollTop");
    this.tagName = tagName.toUpperCase();
    this.nodeName = tagName.toUpperCase();
  }
  get textContent() {
    let result = "";
    this.childNodes.forEach((node) => result += node.textContent);
    return result;
  }
  set textContent(textContent2) {
    this.firstChild = null;
    this.lastChild = null;
    this.appendChild(this.ownerDocument.createTextNode(textContent2));
  }
  get classList() {
    return new ClassList(
      this.attributes.class,
      (newClassName) => {
        this.attributes.class = newClassName;
      }
    );
  }
  get id() {
    return this.attributes.id || "";
  }
  get className() {
    return this.attributes.class || "";
  }
  get style() {
    const style = this.attributes.style ? parseCSSText(this.attributes.style) : {};
    const hyphenateRE2 = /\B([A-Z])/g;
    style.setProperty = (name, value, priority) => {
      if (hyphenateRE2.test(name))
        return;
      const normalizedName = camelize(name);
      if (!value)
        delete style[normalizedName];
      else
        style[normalizedName] = value;
      if (priority === "important")
        style[normalizedName] += " !important";
      this.attributes.style = toCSSText(style);
    };
    style.removeProperty = (name) => {
      if (hyphenateRE2.test(name))
        return "";
      const normalizedName = camelize(name);
      const value = style[normalizedName] || "";
      delete style[normalizedName];
      this.attributes.style = toCSSText(style);
      return value;
    };
    return style;
  }
  getAttribute(name) {
    if (this.attributes[name] === void 0)
      return null;
    return this.attributes[name];
  }
  setAttribute(name, attribute) {
    this.attributes[name] = attribute;
  }
  setAttributeNS(_namespace, qualifiedName, value) {
    this.setAttribute(qualifiedName, value);
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  appendChild(newChild) {
    return appendChild(this, newChild);
  }
  insertBefore(newChild, refChild) {
    return insertBefore(this, newChild, refChild);
  }
  removeChild(node) {
    return removeChild(this, node);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attachShadow(_init) {
    const shadowRoot2 = this.ownerDocument.createElement("SHADOWROOT");
    this.shadowRoot = shadowRoot2;
    return shadowRoot2;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchEvent(_event) {
    return true;
  }
  toString() {
    let attributeString = "";
    for (const attribute in this.attributes) {
      attributeString += `${attribute}="${this.attributes[attribute]}" `;
    }
    return `${this.tagName} ${attributeString}`;
  }
};
var BaseRRMediaElement = class extends BaseRRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "currentTime");
    __publicField2(this, "volume");
    __publicField2(this, "paused");
    __publicField2(this, "muted");
    __publicField2(this, "playbackRate");
    __publicField2(this, "loop");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attachShadow(_init) {
    throw new Error(
      `RRDomException: Failed to execute 'attachShadow' on 'RRElement': This RRElement does not support attachShadow`
    );
  }
  play() {
    this.paused = false;
  }
  pause() {
    this.paused = true;
  }
};
var BaseRRDialogElement = class extends BaseRRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "tagName", "DIALOG");
    __publicField2(this, "nodeName", "DIALOG");
  }
  get isModal() {
    return this.getAttribute("rr_open_mode") === "modal";
  }
  get open() {
    return this.getAttribute("open") !== null;
  }
  close() {
    this.removeAttribute("open");
    this.removeAttribute("rr_open_mode");
  }
  show() {
    this.setAttribute("open", "");
    this.setAttribute("rr_open_mode", "non-modal");
  }
  showModal() {
    this.setAttribute("open", "");
    this.setAttribute("rr_open_mode", "modal");
  }
};
var BaseRRText = class extends BaseRRNode {
  constructor(data) {
    super();
    __publicField2(this, "nodeType", 3);
    __publicField2(this, "nodeName", "#text");
    __publicField2(this, "RRNodeType", NodeType$1.Text);
    __publicField2(this, "data");
    this.data = data;
  }
  get textContent() {
    return this.data;
  }
  set textContent(textContent2) {
    this.data = textContent2;
  }
  toString() {
    return `RRText text=${JSON.stringify(this.data)}`;
  }
};
var BaseRRComment = class extends BaseRRNode {
  constructor(data) {
    super();
    __publicField2(this, "nodeType", 8);
    __publicField2(this, "nodeName", "#comment");
    __publicField2(this, "RRNodeType", NodeType$1.Comment);
    __publicField2(this, "data");
    this.data = data;
  }
  get textContent() {
    return this.data;
  }
  set textContent(textContent2) {
    this.data = textContent2;
  }
  toString() {
    return `RRComment text=${JSON.stringify(this.data)}`;
  }
};
var BaseRRCDATASection = class extends BaseRRNode {
  constructor(data) {
    super();
    __publicField2(this, "nodeName", "#cdata-section");
    __publicField2(this, "nodeType", 4);
    __publicField2(this, "RRNodeType", NodeType$1.CDATA);
    __publicField2(this, "data");
    this.data = data;
  }
  get textContent() {
    return this.data;
  }
  set textContent(textContent2) {
    this.data = textContent2;
  }
  toString() {
    return `RRCDATASection data=${JSON.stringify(this.data)}`;
  }
};
var ClassList = class {
  constructor(classText, onChange) {
    __publicField2(this, "onChange");
    __publicField2(this, "classes", []);
    __publicField2(this, "add", (...classNames) => {
      for (const item of classNames) {
        const className = String(item);
        if (this.classes.indexOf(className) >= 0)
          continue;
        this.classes.push(className);
      }
      this.onChange && this.onChange(this.classes.join(" "));
    });
    __publicField2(this, "remove", (...classNames) => {
      this.classes = this.classes.filter(
        (item) => classNames.indexOf(item) === -1
      );
      this.onChange && this.onChange(this.classes.join(" "));
    });
    if (classText) {
      const classes = classText.trim().split(/\s+/);
      this.classes.push(...classes);
    }
    this.onChange = onChange;
  }
};
function appendChild(parent, newChild) {
  if (newChild.parentNode)
    newChild.parentNode.removeChild(newChild);
  if (parent.lastChild) {
    parent.lastChild.nextSibling = newChild;
    newChild.previousSibling = parent.lastChild;
  } else {
    parent.firstChild = newChild;
    newChild.previousSibling = null;
  }
  parent.lastChild = newChild;
  newChild.nextSibling = null;
  newChild.parentNode = parent;
  newChild.parentElement = parent;
  newChild.ownerDocument = parent.ownerDocument;
  return newChild;
}
function insertBefore(parent, newChild, refChild) {
  if (!refChild)
    return appendChild(parent, newChild);
  if (refChild.parentNode !== parent)
    throw new Error(
      "Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode."
    );
  if (newChild === refChild)
    return newChild;
  if (newChild.parentNode)
    newChild.parentNode.removeChild(newChild);
  newChild.previousSibling = refChild.previousSibling;
  refChild.previousSibling = newChild;
  newChild.nextSibling = refChild;
  if (newChild.previousSibling)
    newChild.previousSibling.nextSibling = newChild;
  else
    parent.firstChild = newChild;
  newChild.parentElement = parent;
  newChild.parentNode = parent;
  newChild.ownerDocument = parent.ownerDocument;
  return newChild;
}
function removeChild(parent, child) {
  if (child.parentNode !== parent)
    throw new Error(
      "Failed to execute 'removeChild' on 'RRNode': The RRNode to be removed is not a child of this RRNode."
    );
  if (child.previousSibling)
    child.previousSibling.nextSibling = child.nextSibling;
  else
    parent.firstChild = child.nextSibling;
  if (child.nextSibling)
    child.nextSibling.previousSibling = child.previousSibling;
  else
    parent.lastChild = child.previousSibling;
  child.previousSibling = null;
  child.nextSibling = null;
  child.parentElement = null;
  child.parentNode = null;
  return child;
}
var NodeType = /* @__PURE__ */ ((NodeType2) => {
  NodeType2[NodeType2["PLACEHOLDER"] = 0] = "PLACEHOLDER";
  NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
  NodeType2[NodeType2["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
  NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
  NodeType2[NodeType2["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
  NodeType2[NodeType2["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
  NodeType2[NodeType2["ENTITY_NODE"] = 6] = "ENTITY_NODE";
  NodeType2[NodeType2["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
  NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
  NodeType2[NodeType2["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
  return NodeType2;
})(NodeType || {});
var NAMESPACES = {
  svg: "http://www.w3.org/2000/svg",
  "xlink:href": "http://www.w3.org/1999/xlink",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
var SVGTagMap = {
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient"
};
var createdNodeSet = null;
function diff(oldTree, newTree, replayer, rrnodeMirror = newTree.mirror || newTree.ownerDocument.mirror) {
  oldTree = diffBeforeUpdatingChildren(
    oldTree,
    newTree,
    replayer,
    rrnodeMirror
  );
  diffChildren(oldTree, newTree, replayer, rrnodeMirror);
  diffAfterUpdatingChildren(oldTree, newTree, replayer);
}
function diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror) {
  var _a2;
  if (replayer.afterAppend && !createdNodeSet) {
    createdNodeSet = /* @__PURE__ */ new WeakSet();
    setTimeout(() => {
      createdNodeSet = null;
    }, 0);
  }
  if (!sameNodeType(oldTree, newTree)) {
    const calibratedOldTree = createOrGetNode(
      newTree,
      replayer.mirror,
      rrnodeMirror
    );
    (_a2 = oldTree.parentNode) == null ? void 0 : _a2.replaceChild(calibratedOldTree, oldTree);
    oldTree = calibratedOldTree;
  }
  switch (newTree.RRNodeType) {
    case NodeType$1.Document: {
      if (!nodeMatching(oldTree, newTree, replayer.mirror, rrnodeMirror)) {
        const newMeta = rrnodeMirror.getMeta(newTree);
        if (newMeta) {
          replayer.mirror.removeNodeFromMap(oldTree);
          oldTree.close();
          oldTree.open();
          replayer.mirror.add(oldTree, newMeta);
          createdNodeSet == null ? void 0 : createdNodeSet.add(oldTree);
        }
      }
      break;
    }
    case NodeType$1.Element: {
      const oldElement = oldTree;
      const newRRElement = newTree;
      switch (newRRElement.tagName) {
        case "IFRAME": {
          const oldContentDocument = oldTree.contentDocument;
          if (!oldContentDocument)
            break;
          diff(
            oldContentDocument,
            newTree.contentDocument,
            replayer,
            rrnodeMirror
          );
          break;
        }
      }
      if (newRRElement.shadowRoot) {
        if (!oldElement.shadowRoot)
          oldElement.attachShadow({ mode: "open" });
        diffChildren(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          oldElement.shadowRoot,
          newRRElement.shadowRoot,
          replayer,
          rrnodeMirror
        );
      }
      diffProps(oldElement, newRRElement, rrnodeMirror);
      break;
    }
  }
  return oldTree;
}
function diffAfterUpdatingChildren(oldTree, newTree, replayer) {
  var _a2;
  switch (newTree.RRNodeType) {
    case NodeType$1.Document: {
      const scrollData = newTree.scrollData;
      scrollData && replayer.applyScroll(scrollData, true);
      break;
    }
    case NodeType$1.Element: {
      const oldElement = oldTree;
      const newRRElement = newTree;
      newRRElement.scrollData && replayer.applyScroll(newRRElement.scrollData, true);
      newRRElement.inputData && replayer.applyInput(newRRElement.inputData);
      switch (newRRElement.tagName) {
        case "AUDIO":
        case "VIDEO": {
          const oldMediaElement = oldTree;
          const newMediaRRElement = newRRElement;
          if (newMediaRRElement.paused !== void 0)
            newMediaRRElement.paused ? void oldMediaElement.pause() : void oldMediaElement.play();
          if (newMediaRRElement.muted !== void 0)
            oldMediaElement.muted = newMediaRRElement.muted;
          if (newMediaRRElement.volume !== void 0)
            oldMediaElement.volume = newMediaRRElement.volume;
          if (newMediaRRElement.currentTime !== void 0)
            oldMediaElement.currentTime = newMediaRRElement.currentTime;
          if (newMediaRRElement.playbackRate !== void 0)
            oldMediaElement.playbackRate = newMediaRRElement.playbackRate;
          if (newMediaRRElement.loop !== void 0)
            oldMediaElement.loop = newMediaRRElement.loop;
          break;
        }
        case "CANVAS": {
          const rrCanvasElement = newTree;
          if (rrCanvasElement.rr_dataURL !== null) {
            const image = document.createElement("img");
            image.onload = () => {
              const ctx = oldElement.getContext("2d");
              if (ctx) {
                ctx.drawImage(image, 0, 0, image.width, image.height);
              }
            };
            image.src = rrCanvasElement.rr_dataURL;
          }
          rrCanvasElement.canvasMutations.forEach(
            (canvasMutation2) => replayer.applyCanvas(
              canvasMutation2.event,
              canvasMutation2.mutation,
              oldTree
            )
          );
          break;
        }
        case "STYLE": {
          const styleSheet = oldElement.sheet;
          styleSheet && newTree.rules.forEach(
            (data) => replayer.applyStyleSheetMutation(data, styleSheet)
          );
          break;
        }
        case "DIALOG": {
          const dialog = oldElement;
          const rrDialog = newRRElement;
          const wasOpen = dialog.open;
          const wasModal = dialog.matches("dialog:modal");
          const shouldBeOpen = rrDialog.open;
          const shouldBeModal = rrDialog.isModal;
          const modalChanged = wasModal !== shouldBeModal;
          const openChanged = wasOpen !== shouldBeOpen;
          if (modalChanged || wasOpen && openChanged)
            dialog.close();
          if (shouldBeOpen && (openChanged || modalChanged)) {
            try {
              if (shouldBeModal)
                dialog.showModal();
              else
                dialog.show();
            } catch (e2) {
              console.warn(e2);
            }
          }
          break;
        }
      }
      break;
    }
    case NodeType$1.Text:
    case NodeType$1.Comment:
    case NodeType$1.CDATA: {
      if (oldTree.textContent !== newTree.data)
        oldTree.textContent = newTree.data;
      break;
    }
  }
  if (createdNodeSet == null ? void 0 : createdNodeSet.has(oldTree)) {
    createdNodeSet.delete(oldTree);
    (_a2 = replayer.afterAppend) == null ? void 0 : _a2.call(replayer, oldTree, replayer.mirror.getId(oldTree));
  }
}
function diffProps(oldTree, newTree, rrnodeMirror) {
  const oldAttributes = oldTree.attributes;
  const newAttributes = newTree.attributes;
  for (const name in newAttributes) {
    const newValue = newAttributes[name];
    const sn = rrnodeMirror.getMeta(newTree);
    if ((sn == null ? void 0 : sn.isSVG) && NAMESPACES[name])
      oldTree.setAttributeNS(NAMESPACES[name], name, newValue);
    else if (newTree.tagName === "CANVAS" && name === "rr_dataURL") {
      const image = document.createElement("img");
      image.src = newValue;
      image.onload = () => {
        const ctx = oldTree.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0, image.width, image.height);
        }
      };
    } else if (newTree.tagName === "IFRAME" && name === "srcdoc")
      continue;
    else
      oldTree.setAttribute(name, newValue);
  }
  for (const { name } of Array.from(oldAttributes))
    if (!(name in newAttributes))
      oldTree.removeAttribute(name);
  newTree.scrollLeft && (oldTree.scrollLeft = newTree.scrollLeft);
  newTree.scrollTop && (oldTree.scrollTop = newTree.scrollTop);
}
function diffChildren(oldTree, newTree, replayer, rrnodeMirror) {
  const oldChildren = Array.from(oldTree.childNodes);
  const newChildren = newTree.childNodes;
  if (oldChildren.length === 0 && newChildren.length === 0)
    return;
  let oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, newStartIndex = 0, newEndIndex = newChildren.length - 1;
  let oldStartNode = oldChildren[oldStartIndex], oldEndNode = oldChildren[oldEndIndex], newStartNode = newChildren[newStartIndex], newEndNode = newChildren[newEndIndex];
  let oldIdToIndex = void 0, indexInOld = void 0;
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode === void 0) {
      oldStartNode = oldChildren[++oldStartIndex];
    } else if (oldEndNode === void 0) {
      oldEndNode = oldChildren[--oldEndIndex];
    } else if (
      // same first node?
      nodeMatching(oldStartNode, newStartNode, replayer.mirror, rrnodeMirror)
    ) {
      oldStartNode = oldChildren[++oldStartIndex];
      newStartNode = newChildren[++newStartIndex];
    } else if (
      // same last node?
      nodeMatching(oldEndNode, newEndNode, replayer.mirror, rrnodeMirror)
    ) {
      oldEndNode = oldChildren[--oldEndIndex];
      newEndNode = newChildren[--newEndIndex];
    } else if (
      // is the first old node the same as the last new node?
      nodeMatching(oldStartNode, newEndNode, replayer.mirror, rrnodeMirror)
    ) {
      try {
        oldTree.insertBefore(oldStartNode, oldEndNode.nextSibling);
      } catch (e2) {
        console.warn(e2);
      }
      oldStartNode = oldChildren[++oldStartIndex];
      newEndNode = newChildren[--newEndIndex];
    } else if (
      // is the last old node the same as the first new node?
      nodeMatching(oldEndNode, newStartNode, replayer.mirror, rrnodeMirror)
    ) {
      try {
        oldTree.insertBefore(oldEndNode, oldStartNode);
      } catch (e2) {
        console.warn(e2);
      }
      oldEndNode = oldChildren[--oldEndIndex];
      newStartNode = newChildren[++newStartIndex];
    } else {
      if (!oldIdToIndex) {
        oldIdToIndex = {};
        for (let i2 = oldStartIndex; i2 <= oldEndIndex; i2++) {
          const oldChild2 = oldChildren[i2];
          if (oldChild2 && replayer.mirror.hasNode(oldChild2))
            oldIdToIndex[replayer.mirror.getId(oldChild2)] = i2;
        }
      }
      indexInOld = oldIdToIndex[rrnodeMirror.getId(newStartNode)];
      const nodeToMove = oldChildren[indexInOld];
      if (indexInOld !== void 0 && nodeToMove && nodeMatching(nodeToMove, newStartNode, replayer.mirror, rrnodeMirror)) {
        try {
          oldTree.insertBefore(nodeToMove, oldStartNode);
        } catch (e2) {
          console.warn(e2);
        }
        oldChildren[indexInOld] = void 0;
      } else {
        const newNode = createOrGetNode(
          newStartNode,
          replayer.mirror,
          rrnodeMirror
        );
        if (oldTree.nodeName === "#document" && oldStartNode && /**
        * Special case 1: one document isn't allowed to have two doctype nodes at the same time, so we need to remove the old one first before inserting the new one.
        * How this case happens: A parent document in the old tree already has a doctype node with an id e.g. #1. A new full snapshot rebuilds the replayer with a new doctype node with another id #2. According to the algorithm, the new doctype node will be inserted before the old one, which is not allowed by the Document standard.
        */
        (newNode.nodeType === newNode.DOCUMENT_TYPE_NODE && oldStartNode.nodeType === oldStartNode.DOCUMENT_TYPE_NODE || /**
        * Special case 2: one document isn't allowed to have two HTMLElements at the same time, so we need to remove the old one first before inserting the new one.
        * How this case happens: A mounted iframe element has an automatically created HTML element. We should delete it before inserting a serialized one. Otherwise, an error 'Only one element on document allowed' will be thrown.
        */
        newNode.nodeType === newNode.ELEMENT_NODE && oldStartNode.nodeType === oldStartNode.ELEMENT_NODE)) {
          oldTree.removeChild(oldStartNode);
          replayer.mirror.removeNodeFromMap(oldStartNode);
          oldStartNode = oldChildren[++oldStartIndex];
        }
        try {
          oldTree.insertBefore(newNode, oldStartNode || null);
        } catch (e2) {
          console.warn(e2);
        }
      }
      newStartNode = newChildren[++newStartIndex];
    }
  }
  if (oldStartIndex > oldEndIndex) {
    const referenceRRNode = newChildren[newEndIndex + 1];
    let referenceNode = null;
    if (referenceRRNode)
      referenceNode = replayer.mirror.getNode(
        rrnodeMirror.getId(referenceRRNode)
      );
    for (; newStartIndex <= newEndIndex; ++newStartIndex) {
      const newNode = createOrGetNode(
        newChildren[newStartIndex],
        replayer.mirror,
        rrnodeMirror
      );
      try {
        oldTree.insertBefore(newNode, referenceNode);
      } catch (e2) {
        console.warn(e2);
      }
    }
  } else if (newStartIndex > newEndIndex) {
    for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
      const node = oldChildren[oldStartIndex];
      if (!node || node.parentNode !== oldTree)
        continue;
      try {
        oldTree.removeChild(node);
        replayer.mirror.removeNodeFromMap(node);
      } catch (e2) {
        console.warn(e2);
      }
    }
  }
  let oldChild = oldTree.firstChild;
  let newChild = newTree.firstChild;
  while (oldChild !== null && newChild !== null) {
    diff(oldChild, newChild, replayer, rrnodeMirror);
    oldChild = oldChild.nextSibling;
    newChild = newChild.nextSibling;
  }
}
function createOrGetNode(rrNode, domMirror, rrnodeMirror) {
  const nodeId = rrnodeMirror.getId(rrNode);
  const sn = rrnodeMirror.getMeta(rrNode);
  let node = null;
  if (nodeId > -1)
    node = domMirror.getNode(nodeId);
  if (node !== null && sameNodeType(node, rrNode))
    return node;
  switch (rrNode.RRNodeType) {
    case NodeType$1.Document:
      node = new Document();
      break;
    case NodeType$1.DocumentType:
      node = document.implementation.createDocumentType(
        rrNode.name,
        rrNode.publicId,
        rrNode.systemId
      );
      break;
    case NodeType$1.Element: {
      let tagName = rrNode.tagName.toLowerCase();
      tagName = SVGTagMap[tagName] || tagName;
      if (sn && "isSVG" in sn && (sn == null ? void 0 : sn.isSVG)) {
        node = document.createElementNS(NAMESPACES["svg"], tagName);
      } else
        node = document.createElement(rrNode.tagName);
      break;
    }
    case NodeType$1.Text:
      node = document.createTextNode(rrNode.data);
      break;
    case NodeType$1.Comment:
      node = document.createComment(rrNode.data);
      break;
    case NodeType$1.CDATA:
      node = document.createCDATASection(rrNode.data);
      break;
  }
  if (sn)
    domMirror.add(node, { ...sn });
  try {
    createdNodeSet == null ? void 0 : createdNodeSet.add(node);
  } catch (e2) {
  }
  return node;
}
function sameNodeType(node1, node2) {
  if (node1.nodeType !== node2.nodeType)
    return false;
  return node1.nodeType !== node1.ELEMENT_NODE || node1.tagName.toUpperCase() === node2.tagName;
}
function nodeMatching(node1, node2, domMirror, rrdomMirror) {
  const node1Id = domMirror.getId(node1);
  const node2Id = rrdomMirror.getId(node2);
  if (node1Id === -1 || node1Id !== node2Id)
    return false;
  return sameNodeType(node1, node2);
}
var RRDocument = class _RRDocument extends BaseRRDocument {
  constructor(mirror2) {
    super();
    __publicField2(this, "UNSERIALIZED_STARTING_ID", -2);
    __publicField2(this, "_unserializedId", this.UNSERIALIZED_STARTING_ID);
    __publicField2(this, "mirror", createMirror());
    __publicField2(this, "scrollData", null);
    if (mirror2) {
      this.mirror = mirror2;
    }
  }
  /**
   * Every time the id is used, it will minus 1 automatically to avoid collisions.
   */
  get unserializedId() {
    return this._unserializedId--;
  }
  createDocument(_namespace, _qualifiedName, _doctype) {
    return new _RRDocument();
  }
  createDocumentType(qualifiedName, publicId, systemId) {
    const documentTypeNode = new RRDocumentType(
      qualifiedName,
      publicId,
      systemId
    );
    documentTypeNode.ownerDocument = this;
    return documentTypeNode;
  }
  createElement(tagName) {
    const upperTagName = tagName.toUpperCase();
    let element;
    switch (upperTagName) {
      case "AUDIO":
      case "VIDEO":
        element = new RRMediaElement(upperTagName);
        break;
      case "IFRAME":
        element = new RRIFrameElement(upperTagName, this.mirror);
        break;
      case "CANVAS":
        element = new RRCanvasElement(upperTagName);
        break;
      case "STYLE":
        element = new RRStyleElement(upperTagName);
        break;
      case "DIALOG":
        element = new RRDialogElement(upperTagName);
        break;
      default:
        element = new RRElement(upperTagName);
        break;
    }
    element.ownerDocument = this;
    return element;
  }
  createComment(data) {
    const commentNode = new RRComment(data);
    commentNode.ownerDocument = this;
    return commentNode;
  }
  createCDATASection(data) {
    const sectionNode = new RRCDATASection(data);
    sectionNode.ownerDocument = this;
    return sectionNode;
  }
  createTextNode(data) {
    const textNode = new RRText(data);
    textNode.ownerDocument = this;
    return textNode;
  }
  destroyTree() {
    this.firstChild = null;
    this.lastChild = null;
    this.mirror.reset();
  }
  open() {
    super.open();
    this._unserializedId = this.UNSERIALIZED_STARTING_ID;
  }
};
var RRDocumentType = BaseRRDocumentType;
var RRElement = class extends BaseRRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "inputData", null);
    __publicField2(this, "scrollData", null);
  }
};
var RRMediaElement = class extends BaseRRMediaElement {
};
var RRDialogElement = class extends BaseRRDialogElement {
};
var RRCanvasElement = class extends RRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "rr_dataURL", null);
    __publicField2(this, "canvasMutations", []);
  }
  /**
   * This is a dummy implementation to distinguish RRCanvasElement from real HTMLCanvasElement.
   */
  getContext() {
    return null;
  }
};
var RRStyleElement = class extends RRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "rules", []);
  }
};
var RRIFrameElement = class extends RRElement {
  constructor(upperTagName, mirror2) {
    super(upperTagName);
    __publicField2(this, "contentDocument", new RRDocument());
    this.contentDocument.mirror = mirror2;
  }
};
var RRText = BaseRRText;
var RRComment = BaseRRComment;
var RRCDATASection = BaseRRCDATASection;
function getValidTagName(element) {
  if (element instanceof HTMLFormElement) {
    return "FORM";
  }
  return element.tagName.toUpperCase();
}
function buildFromNode(node, rrdom, domMirror, parentRRNode) {
  let rrNode;
  switch (node.nodeType) {
    case NodeType.DOCUMENT_NODE:
      if (parentRRNode && parentRRNode.nodeName === "IFRAME")
        rrNode = parentRRNode.contentDocument;
      else {
        rrNode = rrdom;
        rrNode.compatMode = node.compatMode;
      }
      break;
    case NodeType.DOCUMENT_TYPE_NODE: {
      const documentType = node;
      rrNode = rrdom.createDocumentType(
        documentType.name,
        documentType.publicId,
        documentType.systemId
      );
      break;
    }
    case NodeType.ELEMENT_NODE: {
      const elementNode = node;
      const tagName = getValidTagName(elementNode);
      rrNode = rrdom.createElement(tagName);
      const rrElement = rrNode;
      for (const { name, value } of Array.from(elementNode.attributes)) {
        rrElement.attributes[name] = value;
      }
      elementNode.scrollLeft && (rrElement.scrollLeft = elementNode.scrollLeft);
      elementNode.scrollTop && (rrElement.scrollTop = elementNode.scrollTop);
      break;
    }
    case NodeType.TEXT_NODE:
      rrNode = rrdom.createTextNode(node.textContent || "");
      break;
    case NodeType.CDATA_SECTION_NODE:
      rrNode = rrdom.createCDATASection(node.data);
      break;
    case NodeType.COMMENT_NODE:
      rrNode = rrdom.createComment(node.textContent || "");
      break;
    case NodeType.DOCUMENT_FRAGMENT_NODE:
      rrNode = parentRRNode.attachShadow({ mode: "open" });
      break;
    default:
      return null;
  }
  let sn = domMirror.getMeta(node);
  if (rrdom instanceof RRDocument) {
    if (!sn) {
      sn = getDefaultSN(rrNode, rrdom.unserializedId);
      domMirror.add(node, sn);
    }
    rrdom.mirror.add(rrNode, { ...sn });
  }
  return rrNode;
}
function buildFromDom(dom, domMirror = createMirror$1(), rrdom = new RRDocument()) {
  function walk2(node, parentRRNode) {
    const rrNode = buildFromNode(node, rrdom, domMirror, parentRRNode);
    if (rrNode === null)
      return;
    if (
      // if the parentRRNode isn't a RRIFrameElement
      (parentRRNode == null ? void 0 : parentRRNode.nodeName) !== "IFRAME" && // if node isn't a shadow root
      node.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE
    ) {
      parentRRNode == null ? void 0 : parentRRNode.appendChild(rrNode);
      rrNode.parentNode = parentRRNode;
      rrNode.parentElement = parentRRNode;
    }
    if (node.nodeName === "IFRAME") {
      const iframeDoc = node.contentDocument;
      iframeDoc && walk2(iframeDoc, rrNode);
    } else if (node.nodeType === NodeType.DOCUMENT_NODE || node.nodeType === NodeType.ELEMENT_NODE || node.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
      if (node.nodeType === NodeType.ELEMENT_NODE && node.shadowRoot)
        walk2(node.shadowRoot, rrNode);
      node.childNodes.forEach((childNode) => walk2(childNode, rrNode));
    }
  }
  walk2(dom, null);
  return rrdom;
}
function createMirror() {
  return new Mirror22();
}
var Mirror22 = class {
  constructor() {
    __publicField2(this, "idNodeMap", /* @__PURE__ */ new Map());
    __publicField2(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(n2) {
    var _a2;
    if (!n2)
      return -1;
    const id = (_a2 = this.getMeta(n2)) == null ? void 0 : _a2.id;
    return id ?? -1;
  }
  getNode(id) {
    return this.idNodeMap.get(id) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(n2) {
    return this.nodeMetaMap.get(n2) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(n2) {
    const id = this.getId(n2);
    this.idNodeMap.delete(id);
    if (n2.childNodes) {
      n2.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
    }
  }
  has(id) {
    return this.idNodeMap.has(id);
  }
  hasNode(node) {
    return this.nodeMetaMap.has(node);
  }
  add(n2, meta) {
    const id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  }
  replace(id, n2) {
    const oldNode = this.getNode(id);
    if (oldNode) {
      const meta = this.nodeMetaMap.get(oldNode);
      if (meta)
        this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
};
function getDefaultSN(node, id) {
  switch (node.RRNodeType) {
    case NodeType$1.Document:
      return {
        id,
        type: node.RRNodeType,
        childNodes: []
      };
    case NodeType$1.DocumentType: {
      const doctype = node;
      return {
        id,
        type: node.RRNodeType,
        name: doctype.name,
        publicId: doctype.publicId,
        systemId: doctype.systemId
      };
    }
    case NodeType$1.Element:
      return {
        id,
        type: node.RRNodeType,
        tagName: node.tagName.toLowerCase(),
        // In rrweb data, all tagNames are lowercase.
        attributes: {},
        childNodes: []
      };
    case NodeType$1.Text:
      return {
        id,
        type: node.RRNodeType,
        textContent: node.textContent || ""
      };
    case NodeType$1.Comment:
      return {
        id,
        type: node.RRNodeType,
        textContent: node.textContent || ""
      };
    case NodeType$1.CDATA:
      return {
        id,
        type: node.RRNodeType,
        textContent: ""
      };
  }
}
var testableAccessors = {
  Node: ["childNodes", "parentNode", "parentElement", "textContent"],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
};
var testableMethods = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
};
var untaintedBasePrototype = {};
function getUntaintedPrototype(key) {
  if (untaintedBasePrototype[key])
    return untaintedBasePrototype[key];
  const defaultObj = globalThis[key];
  const defaultPrototype = defaultObj.prototype;
  const accessorNames = key in testableAccessors ? testableAccessors[key] : void 0;
  const isUntaintedAccessors = Boolean(
    accessorNames && // @ts-expect-error 2345
    accessorNames.every(
      (accessor) => {
        var _a2, _b;
        return Boolean(
          (_b = (_a2 = Object.getOwnPropertyDescriptor(defaultPrototype, accessor)) == null ? void 0 : _a2.get) == null ? void 0 : _b.toString().includes("[native code]")
        );
      }
    )
  );
  const methodNames = key in testableMethods ? testableMethods[key] : void 0;
  const isUntaintedMethods = Boolean(
    methodNames && methodNames.every(
      // @ts-expect-error 2345
      (method) => {
        var _a2;
        return typeof defaultPrototype[method] === "function" && ((_a2 = defaultPrototype[method]) == null ? void 0 : _a2.toString().includes("[native code]"));
      }
    )
  );
  if (isUntaintedAccessors && isUntaintedMethods) {
    untaintedBasePrototype[key] = defaultObj.prototype;
    return defaultObj.prototype;
  }
  try {
    const iframeEl = document.createElement("iframe");
    document.body.appendChild(iframeEl);
    const win = iframeEl.contentWindow;
    if (!win)
      return defaultObj.prototype;
    const untaintedObject = win[key].prototype;
    document.body.removeChild(iframeEl);
    if (!untaintedObject)
      return defaultPrototype;
    return untaintedBasePrototype[key] = untaintedObject;
  } catch {
    return defaultPrototype;
  }
}
var untaintedAccessorCache = {};
function getUntaintedAccessor(key, instance, accessor) {
  var _a2;
  const cacheKey = `${key}.${String(accessor)}`;
  if (untaintedAccessorCache[cacheKey])
    return untaintedAccessorCache[cacheKey].call(
      instance
    );
  const untaintedPrototype = getUntaintedPrototype(key);
  const untaintedAccessor = (_a2 = Object.getOwnPropertyDescriptor(
    untaintedPrototype,
    accessor
  )) == null ? void 0 : _a2.get;
  if (!untaintedAccessor)
    return instance[accessor];
  untaintedAccessorCache[cacheKey] = untaintedAccessor;
  return untaintedAccessor.call(instance);
}
var untaintedMethodCache = {};
function getUntaintedMethod(key, instance, method) {
  const cacheKey = `${key}.${String(method)}`;
  if (untaintedMethodCache[cacheKey])
    return untaintedMethodCache[cacheKey].bind(
      instance
    );
  const untaintedPrototype = getUntaintedPrototype(key);
  const untaintedMethod = untaintedPrototype[method];
  if (typeof untaintedMethod !== "function")
    return instance[method];
  untaintedMethodCache[cacheKey] = untaintedMethod;
  return untaintedMethod.bind(instance);
}
function childNodes(n2) {
  return getUntaintedAccessor("Node", n2, "childNodes");
}
function parentNode(n2) {
  return getUntaintedAccessor("Node", n2, "parentNode");
}
function parentElement(n2) {
  return getUntaintedAccessor("Node", n2, "parentElement");
}
function textContent(n2) {
  return getUntaintedAccessor("Node", n2, "textContent");
}
function contains(n2, other) {
  return getUntaintedMethod("Node", n2, "contains")(other);
}
function getRootNode(n2) {
  return getUntaintedMethod("Node", n2, "getRootNode")();
}
function host(n2) {
  if (!n2 || !("host" in n2))
    return null;
  return getUntaintedAccessor("ShadowRoot", n2, "host");
}
function styleSheets(n2) {
  return n2.styleSheets;
}
function shadowRoot(n2) {
  if (!n2 || !("shadowRoot" in n2))
    return null;
  return getUntaintedAccessor("Element", n2, "shadowRoot");
}
function querySelector(n2, selectors) {
  return getUntaintedAccessor("Element", n2, "querySelector")(selectors);
}
function querySelectorAll(n2, selectors) {
  return getUntaintedAccessor("Element", n2, "querySelectorAll")(selectors);
}
function mutationObserverCtor() {
  return getUntaintedPrototype("MutationObserver").constructor;
}
var index = {
  childNodes,
  parentNode,
  parentElement,
  textContent,
  contains,
  getRootNode,
  host,
  styleSheets,
  shadowRoot,
  querySelector,
  querySelectorAll,
  mutationObserver: mutationObserverCtor
};
function on(type, fn, target = document) {
  const options = { capture: true };
  target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}
var DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
var _mirror = {
  map: {},
  getId() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return -1;
  },
  getNode() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return null;
  },
  removeNodeFromMap() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  },
  has() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return false;
  },
  reset() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  }
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
  _mirror = new Proxy(_mirror, {
    get(target, prop, receiver) {
      if (prop === "map") {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function throttle(func, wait, options = {}) {
  let timeout = null;
  let previous = 0;
  return function(...args) {
    const now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    const context = this;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}
function hookSetter(target, key, d, isRevoked, win = window) {
  const original = win.Object.getOwnPropertyDescriptor(target, key);
  win.Object.defineProperty(
    target,
    key,
    isRevoked ? d : {
      set(value) {
        setTimeout(() => {
          d.set.call(this, value);
        }, 0);
        if (original && original.set) {
          original.set.call(this, value);
        }
      }
    }
  );
  return () => hookSetter(target, key, original || {}, true);
}
function patch(source, name, replacement) {
  try {
    if (!(name in source)) {
      return () => {
      };
    }
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === "function") {
      wrapped.prototype = wrapped.prototype || {};
      Object.defineProperties(wrapped, {
        __rrweb_original__: {
          enumerable: false,
          value: original
        }
      });
    }
    source[name] = wrapped;
    return () => {
      source[name] = original;
    };
  } catch {
    return () => {
    };
  }
}
var nowTimestamp = Date.now;
if (!/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString())) {
  nowTimestamp = () => (/* @__PURE__ */ new Date()).getTime();
}
function getWindowScroll(win) {
  var _a2, _b, _c, _d;
  const doc = win.document;
  return {
    left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : doc.documentElement.scrollLeft || (doc == null ? void 0 : doc.body) && ((_a2 = index.parentElement(doc.body)) == null ? void 0 : _a2.scrollLeft) || ((_b = doc == null ? void 0 : doc.body) == null ? void 0 : _b.scrollLeft) || 0,
    top: doc.scrollingElement ? doc.scrollingElement.scrollTop : win.pageYOffset !== void 0 ? win.pageYOffset : (doc == null ? void 0 : doc.documentElement.scrollTop) || (doc == null ? void 0 : doc.body) && ((_c = index.parentElement(doc.body)) == null ? void 0 : _c.scrollTop) || ((_d = doc == null ? void 0 : doc.body) == null ? void 0 : _d.scrollTop) || 0
  };
}
function getWindowHeight() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function getWindowWidth() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function closestElementOfNode(node) {
  if (!node) {
    return null;
  }
  const el = node.nodeType === node.ELEMENT_NODE ? node : index.parentElement(node);
  return el;
}
var isCanvasNode = (node) => {
  try {
    if (node instanceof HTMLElement) {
      return node.tagName === "CANVAS";
    }
  } catch {
    return false;
  }
  return false;
};
function isBlocked(node, blockClass, blockSelector, checkAncestors) {
  if (!node) {
    return false;
  }
  const el = closestElementOfNode(node);
  if (!el) {
    return false;
  }
  try {
    if (typeof blockClass === "string") {
      if (el.classList.contains(blockClass))
        return true;
      if (checkAncestors && el.closest("." + blockClass) !== null)
        return true;
    } else {
      if (classMatchesRegex(el, blockClass, checkAncestors))
        return true;
    }
  } catch (e2) {
  }
  if (blockSelector) {
    if (el.matches(blockSelector))
      return true;
    if (checkAncestors && el.closest(blockSelector) !== null)
      return true;
  }
  return false;
}
function isSerialized(n2, mirror2) {
  return mirror2.getId(n2) !== -1;
}
function isIgnored(n2, mirror2, slimDOMOptions) {
  if (n2.tagName === "TITLE" && slimDOMOptions.headTitleMutations) {
    return true;
  }
  return mirror2.getId(n2) === IGNORED_NODE;
}
function isAncestorRemoved(target, mirror2) {
  if (isShadowRoot(target)) {
    return false;
  }
  const id = mirror2.getId(target);
  if (!mirror2.has(id)) {
    return true;
  }
  const parent = index.parentNode(target);
  if (parent && parent.nodeType === target.DOCUMENT_NODE) {
    return false;
  }
  if (!parent) {
    return true;
  }
  return isAncestorRemoved(parent, mirror2);
}
function legacy_isTouchEvent(event) {
  return Boolean(event.changedTouches);
}
function polyfill$1(win = window) {
  if ("NodeList" in win && !win.NodeList.prototype.forEach) {
    win.NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
    win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
  }
}
function queueToResolveTrees(queue) {
  const queueNodeMap = {};
  const putIntoMap = (m, parent) => {
    const nodeInTree = {
      value: m,
      parent,
      children: []
    };
    queueNodeMap[m.node.id] = nodeInTree;
    return nodeInTree;
  };
  const queueNodeTrees = [];
  for (const mutation of queue) {
    const { nextId, parentId } = mutation;
    if (nextId && nextId in queueNodeMap) {
      const nextInTree = queueNodeMap[nextId];
      if (nextInTree.parent) {
        const idx = nextInTree.parent.children.indexOf(nextInTree);
        nextInTree.parent.children.splice(
          idx,
          0,
          putIntoMap(mutation, nextInTree.parent)
        );
      } else {
        const idx = queueNodeTrees.indexOf(nextInTree);
        queueNodeTrees.splice(idx, 0, putIntoMap(mutation, null));
      }
      continue;
    }
    if (parentId in queueNodeMap) {
      const parentInTree = queueNodeMap[parentId];
      parentInTree.children.push(putIntoMap(mutation, parentInTree));
      continue;
    }
    queueNodeTrees.push(putIntoMap(mutation, null));
  }
  return queueNodeTrees;
}
function iterateResolveTree(tree, cb) {
  cb(tree.value);
  for (let i2 = tree.children.length - 1; i2 >= 0; i2--) {
    iterateResolveTree(tree.children[i2], cb);
  }
}
function isSerializedIframe(n2, mirror2) {
  return Boolean(n2.nodeName === "IFRAME" && mirror2.getMeta(n2));
}
function isSerializedStylesheet(n2, mirror2) {
  return Boolean(
    n2.nodeName === "LINK" && n2.nodeType === n2.ELEMENT_NODE && n2.getAttribute && n2.getAttribute("rel") === "stylesheet" && mirror2.getMeta(n2)
  );
}
function getBaseDimension(node, rootIframe) {
  var _a2, _b;
  const frameElement = (_b = (_a2 = node.ownerDocument) == null ? void 0 : _a2.defaultView) == null ? void 0 : _b.frameElement;
  if (!frameElement || frameElement === rootIframe) {
    return {
      x: 0,
      y: 0,
      relativeScale: 1,
      absoluteScale: 1
    };
  }
  const frameDimension = frameElement.getBoundingClientRect();
  const frameBaseDimension = getBaseDimension(frameElement, rootIframe);
  const relativeScale = frameDimension.height / frameElement.clientHeight;
  return {
    x: frameDimension.x * frameBaseDimension.relativeScale + frameBaseDimension.x,
    y: frameDimension.y * frameBaseDimension.relativeScale + frameBaseDimension.y,
    relativeScale,
    absoluteScale: frameBaseDimension.absoluteScale * relativeScale
  };
}
function hasShadowRoot(n2) {
  if (!n2)
    return false;
  if (n2 instanceof BaseRRNode && "shadowRoot" in n2) {
    return Boolean(n2.shadowRoot);
  }
  return Boolean(index.shadowRoot(n2));
}
function getNestedRule(rules2, position) {
  const rule = rules2[position[0]];
  if (position.length === 1) {
    return rule;
  } else {
    return getNestedRule(
      rule.cssRules[position[1]].cssRules,
      position.slice(2)
    );
  }
}
function getPositionsAndIndex(nestedIndex) {
  const positions = [...nestedIndex];
  const index2 = positions.pop();
  return { positions, index: index2 };
}
function uniqueTextMutations(mutations) {
  const idSet = /* @__PURE__ */ new Set();
  const uniqueMutations = [];
  for (let i2 = mutations.length; i2--; ) {
    const mutation = mutations[i2];
    if (!idSet.has(mutation.id)) {
      uniqueMutations.push(mutation);
      idSet.add(mutation.id);
    }
  }
  return uniqueMutations;
}
var StyleSheetMirror = class {
  constructor() {
    __publicField(this, "id", 1);
    __publicField(this, "styleIDMap", /* @__PURE__ */ new WeakMap());
    __publicField(this, "idStyleMap", /* @__PURE__ */ new Map());
  }
  getId(stylesheet) {
    return this.styleIDMap.get(stylesheet) ?? -1;
  }
  has(stylesheet) {
    return this.styleIDMap.has(stylesheet);
  }
  /**
   * @returns If the stylesheet is in the mirror, returns the id of the stylesheet. If not, return the new assigned id.
   */
  add(stylesheet, id) {
    if (this.has(stylesheet))
      return this.getId(stylesheet);
    let newId;
    if (id === void 0) {
      newId = this.id++;
    } else
      newId = id;
    this.styleIDMap.set(stylesheet, newId);
    this.idStyleMap.set(newId, stylesheet);
    return newId;
  }
  getStyle(id) {
    return this.idStyleMap.get(id) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap();
    this.idStyleMap = /* @__PURE__ */ new Map();
    this.id = 1;
  }
  generateId() {
    return this.id++;
  }
};
function getShadowHost(n2) {
  var _a2;
  let shadowHost = null;
  if ("getRootNode" in n2 && ((_a2 = index.getRootNode(n2)) == null ? void 0 : _a2.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && index.host(index.getRootNode(n2)))
    shadowHost = index.host(index.getRootNode(n2));
  return shadowHost;
}
function getRootShadowHost(n2) {
  let rootShadowHost = n2;
  let shadowHost;
  while (shadowHost = getShadowHost(rootShadowHost))
    rootShadowHost = shadowHost;
  return rootShadowHost;
}
function shadowHostInDom(n2) {
  const doc = n2.ownerDocument;
  if (!doc)
    return false;
  const shadowHost = getRootShadowHost(n2);
  return index.contains(doc, shadowHost);
}
function inDom(n2) {
  const doc = n2.ownerDocument;
  if (!doc)
    return false;
  return index.contains(doc, n2) || shadowHostInDom(n2);
}
var utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  StyleSheetMirror,
  get _mirror() {
    return _mirror;
  },
  closestElementOfNode,
  getBaseDimension,
  getNestedRule,
  getPositionsAndIndex,
  getRootShadowHost,
  getShadowHost,
  getWindowHeight,
  getWindowScroll,
  getWindowWidth,
  hasShadowRoot,
  hookSetter,
  inDom,
  isAncestorRemoved,
  isBlocked,
  isCanvasNode,
  isIgnored,
  isSerialized,
  isSerializedIframe,
  isSerializedStylesheet,
  iterateResolveTree,
  legacy_isTouchEvent,
  get nowTimestamp() {
    return nowTimestamp;
  },
  on,
  patch,
  polyfill: polyfill$1,
  queueToResolveTrees,
  shadowHostInDom,
  throttle,
  uniqueTextMutations
}, Symbol.toStringTag, { value: "Module" }));
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
  EventType2[EventType2["Load"] = 1] = "Load";
  EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
  EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
  EventType2[EventType2["Meta"] = 4] = "Meta";
  EventType2[EventType2["Custom"] = 5] = "Custom";
  EventType2[EventType2["Plugin"] = 6] = "Plugin";
  return EventType2;
})(EventType || {});
var IncrementalSource = /* @__PURE__ */ ((IncrementalSource2) => {
  IncrementalSource2[IncrementalSource2["Mutation"] = 0] = "Mutation";
  IncrementalSource2[IncrementalSource2["MouseMove"] = 1] = "MouseMove";
  IncrementalSource2[IncrementalSource2["MouseInteraction"] = 2] = "MouseInteraction";
  IncrementalSource2[IncrementalSource2["Scroll"] = 3] = "Scroll";
  IncrementalSource2[IncrementalSource2["ViewportResize"] = 4] = "ViewportResize";
  IncrementalSource2[IncrementalSource2["Input"] = 5] = "Input";
  IncrementalSource2[IncrementalSource2["TouchMove"] = 6] = "TouchMove";
  IncrementalSource2[IncrementalSource2["MediaInteraction"] = 7] = "MediaInteraction";
  IncrementalSource2[IncrementalSource2["StyleSheetRule"] = 8] = "StyleSheetRule";
  IncrementalSource2[IncrementalSource2["CanvasMutation"] = 9] = "CanvasMutation";
  IncrementalSource2[IncrementalSource2["Font"] = 10] = "Font";
  IncrementalSource2[IncrementalSource2["Log"] = 11] = "Log";
  IncrementalSource2[IncrementalSource2["Drag"] = 12] = "Drag";
  IncrementalSource2[IncrementalSource2["StyleDeclaration"] = 13] = "StyleDeclaration";
  IncrementalSource2[IncrementalSource2["Selection"] = 14] = "Selection";
  IncrementalSource2[IncrementalSource2["AdoptedStyleSheet"] = 15] = "AdoptedStyleSheet";
  IncrementalSource2[IncrementalSource2["CustomElement"] = 16] = "CustomElement";
  return IncrementalSource2;
})(IncrementalSource || {});
var MouseInteractions = /* @__PURE__ */ ((MouseInteractions2) => {
  MouseInteractions2[MouseInteractions2["MouseUp"] = 0] = "MouseUp";
  MouseInteractions2[MouseInteractions2["MouseDown"] = 1] = "MouseDown";
  MouseInteractions2[MouseInteractions2["Click"] = 2] = "Click";
  MouseInteractions2[MouseInteractions2["ContextMenu"] = 3] = "ContextMenu";
  MouseInteractions2[MouseInteractions2["DblClick"] = 4] = "DblClick";
  MouseInteractions2[MouseInteractions2["Focus"] = 5] = "Focus";
  MouseInteractions2[MouseInteractions2["Blur"] = 6] = "Blur";
  MouseInteractions2[MouseInteractions2["TouchStart"] = 7] = "TouchStart";
  MouseInteractions2[MouseInteractions2["TouchMove_Departed"] = 8] = "TouchMove_Departed";
  MouseInteractions2[MouseInteractions2["TouchEnd"] = 9] = "TouchEnd";
  MouseInteractions2[MouseInteractions2["TouchCancel"] = 10] = "TouchCancel";
  return MouseInteractions2;
})(MouseInteractions || {});
var PointerTypes = /* @__PURE__ */ ((PointerTypes2) => {
  PointerTypes2[PointerTypes2["Mouse"] = 0] = "Mouse";
  PointerTypes2[PointerTypes2["Pen"] = 1] = "Pen";
  PointerTypes2[PointerTypes2["Touch"] = 2] = "Touch";
  return PointerTypes2;
})(PointerTypes || {});
var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
  CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
  CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
  CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
  return CanvasContext2;
})(CanvasContext || {});
var MediaInteractions = /* @__PURE__ */ ((MediaInteractions2) => {
  MediaInteractions2[MediaInteractions2["Play"] = 0] = "Play";
  MediaInteractions2[MediaInteractions2["Pause"] = 1] = "Pause";
  MediaInteractions2[MediaInteractions2["Seeked"] = 2] = "Seeked";
  MediaInteractions2[MediaInteractions2["VolumeChange"] = 3] = "VolumeChange";
  MediaInteractions2[MediaInteractions2["RateChange"] = 4] = "RateChange";
  return MediaInteractions2;
})(MediaInteractions || {});
var ReplayerEvents = /* @__PURE__ */ ((ReplayerEvents2) => {
  ReplayerEvents2["Start"] = "start";
  ReplayerEvents2["Pause"] = "pause";
  ReplayerEvents2["Resume"] = "resume";
  ReplayerEvents2["Resize"] = "resize";
  ReplayerEvents2["Finish"] = "finish";
  ReplayerEvents2["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
  ReplayerEvents2["LoadStylesheetStart"] = "load-stylesheet-start";
  ReplayerEvents2["LoadStylesheetEnd"] = "load-stylesheet-end";
  ReplayerEvents2["SkipStart"] = "skip-start";
  ReplayerEvents2["SkipEnd"] = "skip-end";
  ReplayerEvents2["MouseInteraction"] = "mouse-interaction";
  ReplayerEvents2["EventCast"] = "event-cast";
  ReplayerEvents2["CustomEvent"] = "custom-event";
  ReplayerEvents2["Flush"] = "flush";
  ReplayerEvents2["StateChange"] = "state-change";
  ReplayerEvents2["PlayBack"] = "play-back";
  ReplayerEvents2["Destroy"] = "destroy";
  return ReplayerEvents2;
})(ReplayerEvents || {});
function isNodeInLinkedList(n2) {
  return "__ln" in n2;
}
var DoubleLinkedList = class {
  constructor() {
    __publicField(this, "length", 0);
    __publicField(this, "head", null);
    __publicField(this, "tail", null);
  }
  get(position) {
    if (position >= this.length) {
      throw new Error("Position outside of list range");
    }
    let current = this.head;
    for (let index2 = 0; index2 < position; index2++) {
      current = (current == null ? void 0 : current.next) || null;
    }
    return current;
  }
  addNode(n2) {
    const node = {
      value: n2,
      previous: null,
      next: null
    };
    n2.__ln = node;
    if (n2.previousSibling && isNodeInLinkedList(n2.previousSibling)) {
      const current = n2.previousSibling.__ln.next;
      node.next = current;
      node.previous = n2.previousSibling.__ln;
      n2.previousSibling.__ln.next = node;
      if (current) {
        current.previous = node;
      }
    } else if (n2.nextSibling && isNodeInLinkedList(n2.nextSibling) && n2.nextSibling.__ln.previous) {
      const current = n2.nextSibling.__ln.previous;
      node.previous = current;
      node.next = n2.nextSibling.__ln;
      n2.nextSibling.__ln.previous = node;
      if (current) {
        current.next = node;
      }
    } else {
      if (this.head) {
        this.head.previous = node;
      }
      node.next = this.head;
      this.head = node;
    }
    if (node.next === null) {
      this.tail = node;
    }
    this.length++;
  }
  removeNode(n2) {
    const current = n2.__ln;
    if (!this.head) {
      return;
    }
    if (!current.previous) {
      this.head = current.next;
      if (this.head) {
        this.head.previous = null;
      } else {
        this.tail = null;
      }
    } else {
      current.previous.next = current.next;
      if (current.next) {
        current.next.previous = current.previous;
      } else {
        this.tail = current.previous;
      }
    }
    if (n2.__ln) {
      delete n2.__ln;
    }
    this.length--;
  }
};
var moveKey = (id, parentId) => `${id}@${parentId}`;
var MutationBuffer = class {
  constructor() {
    __publicField(this, "frozen", false);
    __publicField(this, "locked", false);
    __publicField(this, "texts", []);
    __publicField(this, "attributes", []);
    __publicField(this, "attributeMap", /* @__PURE__ */ new WeakMap());
    __publicField(this, "removes", []);
    __publicField(this, "mapRemoves", []);
    __publicField(this, "movedMap", {});
    __publicField(this, "addedSet", /* @__PURE__ */ new Set());
    __publicField(this, "movedSet", /* @__PURE__ */ new Set());
    __publicField(this, "droppedSet", /* @__PURE__ */ new Set());
    __publicField(this, "mutationCb");
    __publicField(this, "blockClass");
    __publicField(this, "blockSelector");
    __publicField(this, "maskTextClass");
    __publicField(this, "maskTextSelector");
    __publicField(this, "inlineStylesheet");
    __publicField(this, "maskInputOptions");
    __publicField(this, "maskTextFn");
    __publicField(this, "maskInputFn");
    __publicField(this, "keepIframeSrcFn");
    __publicField(this, "recordCanvas");
    __publicField(this, "inlineImages");
    __publicField(this, "privacySetting");
    __publicField(this, "slimDOMOptions");
    __publicField(this, "dataURLOptions");
    __publicField(this, "doc");
    __publicField(this, "mirror");
    __publicField(this, "iframeManager");
    __publicField(this, "stylesheetManager");
    __publicField(this, "shadowDomManager");
    __publicField(this, "canvasManager");
    __publicField(this, "processedNodeManager");
    __publicField(this, "unattachedDoc");
    __publicField(this, "processMutations", (mutations) => {
      mutations.forEach(this.processMutation);
      this.emit();
    });
    __publicField(this, "emit", () => {
      if (this.frozen || this.locked) {
        return;
      }
      const adds = [];
      const addedIds = /* @__PURE__ */ new Set();
      const addList = new DoubleLinkedList();
      const getNextId = (n2) => {
        let ns = n2;
        let nextId = IGNORED_NODE;
        while (nextId === IGNORED_NODE) {
          ns = ns && ns.nextSibling;
          nextId = ns && this.mirror.getId(ns);
        }
        return nextId;
      };
      const pushAdd = (n2) => {
        const parent = index.parentNode(n2);
        if (!parent || !inDom(n2) || parent.tagName === "TEXTAREA") {
          return;
        }
        const parentId = isShadowRoot(parent) ? this.mirror.getId(getShadowHost(n2)) : this.mirror.getId(parent);
        const nextId = getNextId(n2);
        if (parentId === -1 || nextId === -1) {
          return addList.addNode(n2);
        }
        const sn = serializeNodeWithId(n2, {
          doc: this.doc,
          mirror: this.mirror,
          blockClass: this.blockClass,
          blockSelector: this.blockSelector,
          maskTextClass: this.maskTextClass,
          maskTextSelector: this.maskTextSelector,
          skipChild: true,
          newlyAddedElement: true,
          inlineStylesheet: this.inlineStylesheet,
          maskInputOptions: this.maskInputOptions,
          maskTextFn: this.maskTextFn,
          maskInputFn: this.maskInputFn,
          slimDOMOptions: this.slimDOMOptions,
          dataURLOptions: this.dataURLOptions,
          recordCanvas: this.recordCanvas,
          inlineImages: this.inlineImages,
          privacySetting: this.privacySetting,
          onSerialize: (currentN) => {
            if (isSerializedIframe(currentN, this.mirror)) {
              this.iframeManager.addIframe(currentN);
            }
            if (isSerializedStylesheet(currentN, this.mirror)) {
              this.stylesheetManager.trackLinkElement(
                currentN
              );
            }
            if (hasShadowRoot(n2)) {
              this.shadowDomManager.addShadowRoot(index.shadowRoot(n2), this.doc);
            }
          },
          onIframeLoad: (iframe, childSn) => {
            this.iframeManager.attachIframe(iframe, childSn);
            this.shadowDomManager.observeAttachShadow(iframe);
          },
          onStylesheetLoad: (link, childSn) => {
            this.stylesheetManager.attachLinkElement(link, childSn);
          }
        });
        if (sn) {
          adds.push({
            parentId,
            nextId,
            node: sn
          });
          addedIds.add(sn.id);
        }
      };
      while (this.mapRemoves.length) {
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      }
      for (const n2 of this.movedSet) {
        if (isParentRemoved(this.removes, n2, this.mirror) && !this.movedSet.has(index.parentNode(n2))) {
          continue;
        }
        pushAdd(n2);
      }
      for (const n2 of this.addedSet) {
        if (!isAncestorInSet(this.droppedSet, n2) && !isParentRemoved(this.removes, n2, this.mirror)) {
          pushAdd(n2);
        } else if (isAncestorInSet(this.movedSet, n2)) {
          pushAdd(n2);
        } else {
          this.droppedSet.add(n2);
        }
      }
      let candidate = null;
      while (addList.length) {
        let node = null;
        if (candidate) {
          const parentId = this.mirror.getId(index.parentNode(candidate.value));
          const nextId = getNextId(candidate.value);
          if (parentId !== -1 && nextId !== -1) {
            node = candidate;
          }
        }
        if (!node) {
          let tailNode = addList.tail;
          while (tailNode) {
            const _node = tailNode;
            tailNode = tailNode.previous;
            if (_node) {
              const parentId = this.mirror.getId(index.parentNode(_node.value));
              const nextId = getNextId(_node.value);
              if (nextId === -1)
                continue;
              else if (parentId !== -1) {
                node = _node;
                break;
              } else {
                const unhandledNode = _node.value;
                const parent = index.parentNode(unhandledNode);
                if (parent && parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const shadowHost = index.host(parent);
                  const parentId2 = this.mirror.getId(shadowHost);
                  if (parentId2 !== -1) {
                    node = _node;
                    break;
                  }
                }
              }
            }
          }
        }
        if (!node) {
          while (addList.head) {
            addList.removeNode(addList.head.value);
          }
          break;
        }
        candidate = node.previous;
        addList.removeNode(node.value);
        pushAdd(node.value);
      }
      const payload = {
        texts: this.texts.map((text) => {
          var _a2, _b;
          const n2 = text.node;
          const parent = index.parentNode(n2);
          if (parent && parent.tagName === "TEXTAREA") {
            this.genTextAreaValueMutation(parent);
          }
          let value = text.value;
          const enableStrictPrivacy = this.privacySetting === "strict";
          const obfuscateDefaultPrivacy = this.privacySetting === "default" && shouldObfuscateTextByDefault(value);
          const highlightOverwriteRecord = (_b = (_a2 = text.node) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b.getAttribute("data-hl-record");
          if ((enableStrictPrivacy || obfuscateDefaultPrivacy) && !highlightOverwriteRecord && value) {
            value = obfuscateText(value);
          }
          return {
            id: this.mirror.getId(n2),
            value
          };
        }).filter((text) => !addedIds.has(text.id)).filter((text) => this.mirror.has(text.id)),
        attributes: this.attributes.map((attribute) => {
          const { attributes } = attribute;
          if (typeof attributes.style === "string") {
            const diffAsStr = JSON.stringify(attribute.styleDiff);
            const unchangedAsStr = JSON.stringify(attribute._unchangedStyles);
            if (diffAsStr.length < attributes.style.length) {
              if ((diffAsStr + unchangedAsStr).split("var(").length === attributes.style.split("var(").length) {
                attributes.style = attribute.styleDiff;
              }
            }
          }
          return {
            id: this.mirror.getId(attribute.node),
            attributes
          };
        }).filter((attribute) => !addedIds.has(attribute.id)).filter((attribute) => this.mirror.has(attribute.id)),
        removes: this.removes,
        adds
      };
      if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) {
        return;
      }
      this.texts = [];
      this.attributes = [];
      this.attributeMap = /* @__PURE__ */ new WeakMap();
      this.removes = [];
      this.addedSet = /* @__PURE__ */ new Set();
      this.movedSet = /* @__PURE__ */ new Set();
      this.droppedSet = /* @__PURE__ */ new Set();
      this.movedMap = {};
      this.mutationCb(payload);
    });
    __publicField(this, "genTextAreaValueMutation", (textarea) => {
      let item = this.attributeMap.get(textarea);
      if (!item) {
        item = {
          node: textarea,
          attributes: {},
          styleDiff: {},
          _unchangedStyles: {}
        };
        this.attributes.push(item);
        this.attributeMap.set(textarea, item);
      }
      item.attributes.value = Array.from(
        index.childNodes(textarea),
        (cn) => index.textContent(cn) || ""
      ).join("");
    });
    __publicField(this, "processMutation", (m) => {
      if (isIgnored(m.target, this.mirror, this.slimDOMOptions)) {
        return;
      }
      switch (m.type) {
        case "characterData": {
          const value = index.textContent(m.target);
          if (!isBlocked(m.target, this.blockClass, this.blockSelector, false) && value !== m.oldValue) {
            this.texts.push({
              value: needMaskingText(
                m.target,
                this.maskTextClass,
                this.maskTextSelector,
                true
                // checkAncestors
              ) && value ? this.maskTextFn ? this.maskTextFn(value, closestElementOfNode(m.target)) : value.replace(/[\S]/g, "*") : value,
              node: m.target
            });
          }
          break;
        }
        case "attributes": {
          const target = m.target;
          let attributeName = m.attributeName;
          let value = m.target.getAttribute(attributeName);
          if (attributeName === "value") {
            const type = getInputType(target);
            value = maskInputValue({
              element: target,
              maskInputOptions: this.maskInputOptions,
              tagName: target.tagName,
              type,
              value,
              overwriteRecord: target.getAttribute("data-hl-record"),
              maskInputFn: this.maskInputFn
            });
          }
          if (isBlocked(m.target, this.blockClass, this.blockSelector, false) || value === m.oldValue) {
            return;
          }
          let item = this.attributeMap.get(m.target);
          if (target.tagName === "IFRAME" && attributeName === "src" && !this.keepIframeSrcFn(value)) {
            if (!target.contentDocument) {
              attributeName = "rr_src";
            } else {
              return;
            }
          }
          if (!item) {
            item = {
              node: m.target,
              attributes: {},
              styleDiff: {},
              _unchangedStyles: {}
            };
            this.attributes.push(item);
            this.attributeMap.set(m.target, item);
          }
          if (attributeName === "type" && target.tagName === "INPUT" && (m.oldValue || "").toLowerCase() === "password") {
            target.setAttribute("data-rr-is-password", "true");
          }
          if (!ignoreAttribute(target.tagName, attributeName)) {
            const tagName = m.target.tagName;
            if (tagName === "INPUT") {
              const node = m.target;
              if (node.type === "password") {
                item.attributes["value"] = "*".repeat(node.value.length);
                break;
              }
            }
            item.attributes[attributeName] = transformAttribute(
              this.doc,
              toLowerCase(target.tagName),
              toLowerCase(attributeName),
              value
            );
            if (attributeName === "style") {
              if (!this.unattachedDoc) {
                try {
                  this.unattachedDoc = document.implementation.createHTMLDocument();
                } catch (e2) {
                  this.unattachedDoc = this.doc;
                }
              }
              const old = this.unattachedDoc.createElement("span");
              if (m.oldValue) {
                old.setAttribute("style", m.oldValue);
              }
              for (const pname of Array.from(target.style)) {
                const newValue = target.style.getPropertyValue(pname);
                const newPriority = target.style.getPropertyPriority(pname);
                if (newValue !== old.style.getPropertyValue(pname) || newPriority !== old.style.getPropertyPriority(pname)) {
                  if (newPriority === "") {
                    item.styleDiff[pname] = newValue;
                  } else {
                    item.styleDiff[pname] = [newValue, newPriority];
                  }
                } else {
                  item._unchangedStyles[pname] = [newValue, newPriority];
                }
              }
              for (const pname of Array.from(old.style)) {
                if (target.style.getPropertyValue(pname) === "") {
                  item.styleDiff[pname] = false;
                }
              }
            } else if (attributeName === "open" && target.tagName === "DIALOG") {
              if (target.matches("dialog:modal")) {
                item.attributes["rr_open_mode"] = "modal";
              } else {
                item.attributes["rr_open_mode"] = "non-modal";
              }
            }
          }
          break;
        }
        case "childList": {
          if (isBlocked(m.target, this.blockClass, this.blockSelector, true))
            return;
          if (m.target.tagName === "TEXTAREA") {
            this.genTextAreaValueMutation(m.target);
            return;
          }
          m.addedNodes.forEach((n2) => this.genAdds(n2, m.target));
          m.removedNodes.forEach((n2) => {
            const nodeId = this.mirror.getId(n2);
            const parentId = isShadowRoot(m.target) ? this.mirror.getId(index.host(m.target)) : this.mirror.getId(m.target);
            if (isBlocked(m.target, this.blockClass, this.blockSelector, false) || isIgnored(n2, this.mirror, this.slimDOMOptions) || !isSerialized(n2, this.mirror)) {
              return;
            }
            if (this.addedSet.has(n2)) {
              deepDelete(this.addedSet, n2);
              this.droppedSet.add(n2);
            } else if (this.addedSet.has(m.target) && nodeId === -1)
              ;
            else if (isAncestorRemoved(m.target, this.mirror))
              ;
            else if (this.movedSet.has(n2) && this.movedMap[moveKey(nodeId, parentId)]) {
              deepDelete(this.movedSet, n2);
            } else {
              this.removes.push({
                parentId,
                id: nodeId,
                isShadow: isShadowRoot(m.target) && isNativeShadowDom(m.target) ? true : void 0
              });
            }
            this.mapRemoves.push(n2);
          });
          break;
        }
      }
    });
    __publicField(this, "genAdds", (n2, target) => {
      if (this.processedNodeManager.inOtherBuffer(n2, this))
        return;
      if (this.addedSet.has(n2) || this.movedSet.has(n2))
        return;
      if (this.mirror.hasNode(n2)) {
        if (isIgnored(n2, this.mirror, this.slimDOMOptions)) {
          return;
        }
        this.movedSet.add(n2);
        let targetId = null;
        if (target && this.mirror.hasNode(target)) {
          targetId = this.mirror.getId(target);
        }
        if (targetId && targetId !== -1) {
          this.movedMap[moveKey(this.mirror.getId(n2), targetId)] = true;
        }
      } else {
        this.addedSet.add(n2);
        this.droppedSet.delete(n2);
      }
      if (!isBlocked(n2, this.blockClass, this.blockSelector, false)) {
        index.childNodes(n2).forEach((childN) => this.genAdds(childN));
        if (hasShadowRoot(n2)) {
          index.childNodes(index.shadowRoot(n2)).forEach((childN) => {
            this.processedNodeManager.add(childN, this);
            this.genAdds(childN, n2);
          });
        }
      }
    });
  }
  init(options) {
    [
      "mutationCb",
      "blockClass",
      "blockSelector",
      "maskTextClass",
      "maskTextSelector",
      "inlineStylesheet",
      "maskInputOptions",
      "maskTextFn",
      "maskInputFn",
      "keepIframeSrcFn",
      "recordCanvas",
      "inlineImages",
      "privacySetting",
      "slimDOMOptions",
      "dataURLOptions",
      "doc",
      "mirror",
      "iframeManager",
      "stylesheetManager",
      "shadowDomManager",
      "canvasManager",
      "processedNodeManager"
    ].forEach((key) => {
      this[key] = options[key];
    });
  }
  freeze() {
    this.frozen = true;
    this.canvasManager.freeze();
  }
  unfreeze() {
    this.frozen = false;
    this.canvasManager.unfreeze();
    this.emit();
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    this.locked = true;
    this.canvasManager.lock();
  }
  unlock() {
    this.locked = false;
    this.canvasManager.unlock();
    this.emit();
  }
  reset() {
    this.shadowDomManager.reset();
    this.canvasManager.reset();
  }
};
function deepDelete(addsSet, n2) {
  addsSet.delete(n2);
  index.childNodes(n2).forEach((childN) => deepDelete(addsSet, childN));
}
function isParentRemoved(removes, n2, mirror2) {
  if (removes.length === 0)
    return false;
  return _isParentRemoved(removes, n2, mirror2);
}
function _isParentRemoved(removes, n2, mirror2) {
  let node = index.parentNode(n2);
  while (node) {
    const parentId = mirror2.getId(node);
    if (removes.some((r2) => r2.id === parentId)) {
      return true;
    }
    node = index.parentNode(node);
  }
  return false;
}
function isAncestorInSet(set, n2) {
  if (set.size === 0)
    return false;
  return _isAncestorInSet(set, n2);
}
function _isAncestorInSet(set, n2) {
  const parent = index.parentNode(n2);
  if (!parent) {
    return false;
  }
  if (set.has(parent)) {
    return true;
  }
  return _isAncestorInSet(set, parent);
}
var errorHandler;
function registerErrorHandler(handler) {
  errorHandler = handler;
}
function unregisterErrorHandler() {
  errorHandler = void 0;
}
var callbackWrapper = (cb) => {
  if (!errorHandler) {
    return cb;
  }
  const rrwebWrapped = (...rest) => {
    try {
      return cb(...rest);
    } catch (error) {
      if (errorHandler && errorHandler(error) === true) {
        return;
      }
      throw error;
    }
  };
  return rrwebWrapped;
};
var mutationBuffers = [];
function getEventTarget(event) {
  try {
    if ("composedPath" in event) {
      const path = event.composedPath();
      if (path.length) {
        return path[0];
      }
    } else if ("path" in event && event.path.length) {
      return event.path[0];
    }
  } catch {
  }
  return event && event.target;
}
function initMutationObserver(options, rootEl) {
  const mutationBuffer = new MutationBuffer();
  mutationBuffers.push(mutationBuffer);
  mutationBuffer.init(options);
  const observer = new (mutationObserverCtor())(
    callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer))
  );
  observer.observe(rootEl, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true
  });
  return observer;
}
function initMoveObserver({
  mousemoveCb,
  sampling,
  doc,
  mirror: mirror2
}) {
  if (sampling.mousemove === false) {
    return () => {
    };
  }
  const threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
  const callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
  let positions = [];
  let timeBaseline;
  const wrappedCb = throttle(
    callbackWrapper(
      (source) => {
        const totalOffset = Date.now() - timeBaseline;
        mousemoveCb(
          positions.map((p) => {
            p.timeOffset -= totalOffset;
            return p;
          }),
          source
        );
        positions = [];
        timeBaseline = null;
      }
    ),
    callbackThreshold
  );
  const updatePosition = callbackWrapper(
    throttle(
      callbackWrapper((evt) => {
        const target = getEventTarget(evt);
        const { clientX, clientY } = legacy_isTouchEvent(evt) ? evt.changedTouches[0] : evt;
        if (!timeBaseline) {
          timeBaseline = nowTimestamp();
        }
        positions.push({
          x: clientX,
          y: clientY,
          id: mirror2.getId(target),
          timeOffset: nowTimestamp() - timeBaseline
        });
        wrappedCb(
          typeof DragEvent !== "undefined" && evt instanceof DragEvent ? IncrementalSource.Drag : evt instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove
        );
      }),
      threshold,
      {
        trailing: false
      }
    )
  );
  const handlers = [
    on("mousemove", updatePosition, doc),
    on("touchmove", updatePosition, doc),
    on("drag", updatePosition, doc)
  ];
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function initMouseInteractionObserver({
  mouseInteractionCb,
  doc,
  mirror: mirror2,
  blockClass,
  blockSelector,
  sampling
}) {
  if (sampling.mouseInteraction === false) {
    return () => {
    };
  }
  const disableMap = sampling.mouseInteraction === true || sampling.mouseInteraction === void 0 ? {} : sampling.mouseInteraction;
  const handlers = [];
  let currentPointerType = null;
  const getHandler = (eventKey) => {
    return (event) => {
      const target = getEventTarget(event);
      if (isBlocked(target, blockClass, blockSelector, true) || // We ignore canvas elements for rage click detection because we cannot infer what inside the canvas is getting interacted with.
      isCanvasNode(target)) {
        return;
      }
      let pointerType = null;
      let thisEventKey = eventKey;
      if ("pointerType" in event) {
        switch (event.pointerType) {
          case "mouse":
            pointerType = PointerTypes.Mouse;
            break;
          case "touch":
            pointerType = PointerTypes.Touch;
            break;
          case "pen":
            pointerType = PointerTypes.Pen;
            break;
        }
        if (pointerType === PointerTypes.Touch) {
          if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) {
            thisEventKey = "TouchStart";
          } else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) {
            thisEventKey = "TouchEnd";
          }
        } else if (pointerType === PointerTypes.Pen)
          ;
      } else if (legacy_isTouchEvent(event)) {
        pointerType = PointerTypes.Touch;
      }
      if (pointerType !== null) {
        currentPointerType = pointerType;
        if (thisEventKey.startsWith("Touch") && pointerType === PointerTypes.Touch || thisEventKey.startsWith("Mouse") && pointerType === PointerTypes.Mouse) {
          pointerType = null;
        }
      } else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
        pointerType = currentPointerType;
        currentPointerType = null;
      }
      const e2 = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
      if (!e2) {
        return;
      }
      const id = mirror2.getId(target);
      const { clientX, clientY } = e2;
      callbackWrapper(mouseInteractionCb)({
        type: MouseInteractions[thisEventKey],
        id,
        x: clientX,
        y: clientY,
        ...pointerType !== null && { pointerType }
      });
    };
  };
  Object.keys(MouseInteractions).filter(
    (key) => Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false
  ).forEach((eventKey) => {
    let eventName = toLowerCase(eventKey);
    const handler = getHandler(eventKey);
    if (window.PointerEvent) {
      switch (MouseInteractions[eventKey]) {
        case MouseInteractions.MouseDown:
        case MouseInteractions.MouseUp:
          eventName = eventName.replace(
            "mouse",
            "pointer"
          );
          break;
        case MouseInteractions.TouchStart:
        case MouseInteractions.TouchEnd:
          return;
      }
    }
    handlers.push(on(eventName, handler, doc));
  });
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function initScrollObserver({
  scrollCb,
  doc,
  mirror: mirror2,
  blockClass,
  blockSelector,
  sampling
}) {
  const updatePosition = callbackWrapper(
    throttle(
      callbackWrapper((evt) => {
        const target = getEventTarget(evt);
        if (!target || isBlocked(target, blockClass, blockSelector, true)) {
          return;
        }
        const id = mirror2.getId(target);
        if (target === doc && doc.defaultView) {
          const scrollLeftTop = getWindowScroll(doc.defaultView);
          scrollCb({
            id,
            x: scrollLeftTop.left,
            y: scrollLeftTop.top
          });
        } else {
          scrollCb({
            id,
            x: target.scrollLeft,
            y: target.scrollTop
          });
        }
      }),
      sampling.scroll || 100
    )
  );
  return on("scroll", updatePosition, doc);
}
function initViewportResizeObserver({ viewportResizeCb }, { win }) {
  let lastH = -1;
  let lastW = -1;
  const updateDimension = callbackWrapper(
    throttle(
      callbackWrapper(() => {
        const height = getWindowHeight();
        const width = getWindowWidth();
        if (lastH !== height || lastW !== width) {
          viewportResizeCb({
            width: Number(width),
            height: Number(height)
          });
          lastH = height;
          lastW = width;
        }
      }),
      200
    )
  );
  return on("resize", updateDimension, win);
}
var INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];
var lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver({
  inputCb,
  doc,
  mirror: mirror2,
  blockClass,
  blockSelector,
  ignoreClass,
  ignoreSelector,
  maskInputOptions,
  maskInputFn,
  sampling,
  userTriggeredOnInput
}) {
  function eventHandler(event) {
    let target = getEventTarget(event);
    const userTriggered = event.isTrusted;
    const tagName = target && target.tagName;
    if (target && tagName === "OPTION") {
      target = index.parentElement(target);
    }
    if (!target || !tagName || INPUT_TAGS.indexOf(tagName) < 0 || isBlocked(target, blockClass, blockSelector, true)) {
      return;
    }
    if (target.classList.contains(ignoreClass) || ignoreSelector && target.matches(ignoreSelector)) {
      return;
    }
    let text = target.value;
    let isChecked = false;
    const type = getInputType(target) || "";
    const overwriteRecord = target.getAttribute("data-hl-record");
    if (type === "radio" || type === "checkbox") {
      isChecked = target.checked;
    } else if (maskedInputType({
      maskInputOptions,
      type,
      tagName,
      overwriteRecord
    })) {
      text = maskInputValue({
        element: target,
        maskInputOptions,
        tagName,
        type,
        value: text,
        overwriteRecord,
        maskInputFn
      });
    }
    cbWithDedup(
      target,
      userTriggeredOnInput ? { text, isChecked, userTriggered } : { text, isChecked }
    );
    const name = target.name;
    if (type === "radio" && name && isChecked) {
      doc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el) => {
        if (el !== target) {
          const text2 = el.value;
          cbWithDedup(
            el,
            userTriggeredOnInput ? { text: text2, isChecked: !isChecked, userTriggered: false } : { text: text2, isChecked: !isChecked }
          );
        }
      });
    }
  }
  function cbWithDedup(target, v2) {
    const lastInputValue = lastInputValueMap.get(target);
    if (!lastInputValue || lastInputValue.text !== v2.text || lastInputValue.isChecked !== v2.isChecked) {
      lastInputValueMap.set(target, v2);
      const id = mirror2.getId(target);
      callbackWrapper(inputCb)({
        ...v2,
        id
      });
    }
  }
  const events = sampling.input === "last" ? ["change"] : ["input", "change"];
  const handlers = events.map(
    (eventName) => on(eventName, callbackWrapper(eventHandler), doc)
  );
  const currentWindow = doc.defaultView;
  if (!currentWindow) {
    return () => {
      handlers.forEach((h) => h());
    };
  }
  const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(
    currentWindow.HTMLInputElement.prototype,
    "value"
  );
  const hookProperties = [
    [currentWindow.HTMLInputElement.prototype, "value"],
    [currentWindow.HTMLInputElement.prototype, "checked"],
    [currentWindow.HTMLSelectElement.prototype, "value"],
    [currentWindow.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [currentWindow.HTMLSelectElement.prototype, "selectedIndex"],
    [currentWindow.HTMLOptionElement.prototype, "selected"]
  ];
  if (propertyDescriptor && propertyDescriptor.set) {
    handlers.push(
      ...hookProperties.map(
        (p) => hookSetter(
          p[0],
          p[1],
          {
            set() {
              callbackWrapper(eventHandler)({
                target: this,
                isTrusted: false
                // userTriggered to false as this could well be programmatic
              });
            }
          },
          false,
          currentWindow
        )
      )
    );
  }
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function getNestedCSSRulePositions(rule) {
  const positions = [];
  function recurse(childRule, pos) {
    if (hasNestedCSSRule("CSSGroupingRule") && childRule.parentRule instanceof CSSGroupingRule || hasNestedCSSRule("CSSMediaRule") && childRule.parentRule instanceof CSSMediaRule || hasNestedCSSRule("CSSSupportsRule") && childRule.parentRule instanceof CSSSupportsRule || hasNestedCSSRule("CSSConditionRule") && childRule.parentRule instanceof CSSConditionRule) {
      const rules2 = Array.from(
        childRule.parentRule.cssRules
      );
      const index2 = rules2.indexOf(childRule);
      pos.unshift(index2);
    } else if (childRule.parentStyleSheet) {
      const rules2 = Array.from(childRule.parentStyleSheet.cssRules);
      const index2 = rules2.indexOf(childRule);
      pos.unshift(index2);
    }
    return pos;
  }
  return recurse(rule, positions);
}
function getIdAndStyleId(sheet, mirror2, styleMirror) {
  let id, styleId;
  if (!sheet)
    return {};
  if (sheet.ownerNode)
    id = mirror2.getId(sheet.ownerNode);
  else
    styleId = styleMirror.getId(sheet);
  return {
    styleId,
    id
  };
}
function initStyleSheetObserver({ styleSheetRuleCb, mirror: mirror2, stylesheetManager }, { win }) {
  if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) {
    return () => {
    };
  }
  const insertRule = win.CSSStyleSheet.prototype.insertRule;
  win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, {
    apply: callbackWrapper(
      (target, thisArg, argumentsList) => {
        const [rule, index2] = argumentsList;
        const { id, styleId } = getIdAndStyleId(
          thisArg,
          mirror2,
          stylesheetManager.styleMirror
        );
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            adds: [{ rule, index: index2 }]
          });
        }
        return target.apply(thisArg, argumentsList);
      }
    )
  });
  win.CSSStyleSheet.prototype.addRule = function(selector, styleBlock, index2 = this.cssRules.length) {
    const rule = `${selector} { ${styleBlock} }`;
    return win.CSSStyleSheet.prototype.insertRule.apply(this, [rule, index2]);
  };
  const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
  win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
    apply: callbackWrapper(
      (target, thisArg, argumentsList) => {
        const [index2] = argumentsList;
        const { id, styleId } = getIdAndStyleId(
          thisArg,
          mirror2,
          stylesheetManager.styleMirror
        );
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            removes: [{ index: index2 }]
          });
        }
        return target.apply(thisArg, argumentsList);
      }
    )
  });
  win.CSSStyleSheet.prototype.removeRule = function(index2) {
    return win.CSSStyleSheet.prototype.deleteRule.apply(this, [index2]);
  };
  let replace;
  if (win.CSSStyleSheet.prototype.replace) {
    replace = win.CSSStyleSheet.prototype.replace;
    win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
      apply: callbackWrapper(
        (target, thisArg, argumentsList) => {
          const [text] = argumentsList;
          const { id, styleId } = getIdAndStyleId(
            thisArg,
            mirror2,
            stylesheetManager.styleMirror
          );
          if (id && id !== -1 || styleId && styleId !== -1) {
            styleSheetRuleCb({
              id,
              styleId,
              replace: text
            });
          }
          return target.apply(thisArg, argumentsList);
        }
      )
    });
  }
  let replaceSync;
  if (win.CSSStyleSheet.prototype.replaceSync) {
    replaceSync = win.CSSStyleSheet.prototype.replaceSync;
    win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
      apply: callbackWrapper(
        (target, thisArg, argumentsList) => {
          const [text] = argumentsList;
          const { id, styleId } = getIdAndStyleId(
            thisArg,
            mirror2,
            stylesheetManager.styleMirror
          );
          if (id && id !== -1 || styleId && styleId !== -1) {
            styleSheetRuleCb({
              id,
              styleId,
              replaceSync: text
            });
          }
          return target.apply(thisArg, argumentsList);
        }
      )
    });
  }
  const supportedNestedCSSRuleTypes = {};
  if (canMonkeyPatchNestedCSSRule("CSSGroupingRule")) {
    supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
  } else {
    if (canMonkeyPatchNestedCSSRule("CSSMediaRule")) {
      supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
    }
    if (canMonkeyPatchNestedCSSRule("CSSConditionRule")) {
      supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
    }
    if (canMonkeyPatchNestedCSSRule("CSSSupportsRule")) {
      supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
    }
  }
  const unmodifiedFunctions = {};
  Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
    unmodifiedFunctions[typeKey] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: type.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: type.prototype.deleteRule
    };
    type.prototype.insertRule = new Proxy(
      unmodifiedFunctions[typeKey].insertRule,
      {
        apply: callbackWrapper(
          (target, thisArg, argumentsList) => {
            const [rule, index2] = argumentsList;
            const { id, styleId } = getIdAndStyleId(
              thisArg.parentStyleSheet,
              mirror2,
              stylesheetManager.styleMirror
            );
            if (id && id !== -1 || styleId && styleId !== -1) {
              styleSheetRuleCb({
                id,
                styleId,
                adds: [
                  {
                    rule,
                    index: [
                      ...getNestedCSSRulePositions(thisArg),
                      index2 || 0
                      // defaults to 0
                    ]
                  }
                ]
              });
            }
            return target.apply(thisArg, argumentsList);
          }
        )
      }
    );
    type.prototype.deleteRule = new Proxy(
      unmodifiedFunctions[typeKey].deleteRule,
      {
        apply: callbackWrapper(
          (target, thisArg, argumentsList) => {
            const [index2] = argumentsList;
            const { id, styleId } = getIdAndStyleId(
              thisArg.parentStyleSheet,
              mirror2,
              stylesheetManager.styleMirror
            );
            if (id && id !== -1 || styleId && styleId !== -1) {
              styleSheetRuleCb({
                id,
                styleId,
                removes: [
                  { index: [...getNestedCSSRulePositions(thisArg), index2] }
                ]
              });
            }
            return target.apply(thisArg, argumentsList);
          }
        )
      }
    );
  });
  return callbackWrapper(() => {
    win.CSSStyleSheet.prototype.insertRule = insertRule;
    win.CSSStyleSheet.prototype.deleteRule = deleteRule;
    replace && (win.CSSStyleSheet.prototype.replace = replace);
    replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
    Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
      type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
      type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
    });
  });
}
function initAdoptedStyleSheetObserver({
  mirror: mirror2,
  stylesheetManager
}, host2) {
  var _a2, _b, _c;
  let hostId = null;
  if (host2.nodeName === "#document")
    hostId = mirror2.getId(host2);
  else
    hostId = mirror2.getId(index.host(host2));
  const patchTarget = host2.nodeName === "#document" ? (_a2 = host2.defaultView) == null ? void 0 : _a2.Document : (_c = (_b = host2.ownerDocument) == null ? void 0 : _b.defaultView) == null ? void 0 : _c.ShadowRoot;
  const originalPropertyDescriptor = (patchTarget == null ? void 0 : patchTarget.prototype) ? Object.getOwnPropertyDescriptor(
    patchTarget == null ? void 0 : patchTarget.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor)
    return () => {
    };
  Object.defineProperty(host2, "adoptedStyleSheets", {
    configurable: originalPropertyDescriptor.configurable,
    enumerable: originalPropertyDescriptor.enumerable,
    get() {
      var _a3;
      return (_a3 = originalPropertyDescriptor.get) == null ? void 0 : _a3.call(this);
    },
    set(sheets) {
      var _a3;
      const result = (_a3 = originalPropertyDescriptor.set) == null ? void 0 : _a3.call(this, sheets);
      if (hostId !== null && hostId !== -1) {
        try {
          stylesheetManager.adoptStyleSheets(sheets, hostId);
        } catch (e2) {
        }
      }
      return result;
    }
  });
  return callbackWrapper(() => {
    Object.defineProperty(host2, "adoptedStyleSheets", {
      configurable: originalPropertyDescriptor.configurable,
      enumerable: originalPropertyDescriptor.enumerable,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      get: originalPropertyDescriptor.get,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      set: originalPropertyDescriptor.set
    });
  });
}
function initStyleDeclarationObserver({
  styleDeclarationCb,
  mirror: mirror2,
  ignoreCSSAttributes,
  stylesheetManager
}, { win }) {
  const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
  win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
    apply: callbackWrapper(
      (target, thisArg, argumentsList) => {
        var _a2;
        const [property, value, priority] = argumentsList;
        if (ignoreCSSAttributes.has(property)) {
          return setProperty.apply(thisArg, [property, value, priority]);
        }
        const { id, styleId } = getIdAndStyleId(
          (_a2 = thisArg.parentRule) == null ? void 0 : _a2.parentStyleSheet,
          mirror2,
          stylesheetManager.styleMirror
        );
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleDeclarationCb({
            id,
            styleId,
            set: {
              property,
              value,
              priority
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            index: getNestedCSSRulePositions(thisArg.parentRule)
          });
        }
        return target.apply(thisArg, argumentsList);
      }
    )
  });
  const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
  win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
    apply: callbackWrapper(
      (target, thisArg, argumentsList) => {
        var _a2;
        const [property] = argumentsList;
        if (ignoreCSSAttributes.has(property)) {
          return removeProperty.apply(thisArg, [property]);
        }
        const { id, styleId } = getIdAndStyleId(
          (_a2 = thisArg.parentRule) == null ? void 0 : _a2.parentStyleSheet,
          mirror2,
          stylesheetManager.styleMirror
        );
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleDeclarationCb({
            id,
            styleId,
            remove: {
              property
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            index: getNestedCSSRulePositions(thisArg.parentRule)
          });
        }
        return target.apply(thisArg, argumentsList);
      }
    )
  });
  return callbackWrapper(() => {
    win.CSSStyleDeclaration.prototype.setProperty = setProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
  });
}
function initMediaInteractionObserver({
  mediaInteractionCb,
  blockClass,
  blockSelector,
  mirror: mirror2,
  sampling,
  doc
}) {
  const handler = callbackWrapper(
    (type) => throttle(
      callbackWrapper((event) => {
        const target = getEventTarget(event);
        if (!target || isBlocked(target, blockClass, blockSelector, true)) {
          return;
        }
        const { currentTime, volume, muted, playbackRate, loop } = target;
        mediaInteractionCb({
          type,
          id: mirror2.getId(target),
          currentTime,
          volume,
          muted,
          playbackRate,
          loop
        });
      }),
      sampling.media || 500
    )
  );
  const handlers = [
    on("play", handler(MediaInteractions.Play), doc),
    on("pause", handler(MediaInteractions.Pause), doc),
    on("seeked", handler(MediaInteractions.Seeked), doc),
    on("volumechange", handler(MediaInteractions.VolumeChange), doc),
    on("ratechange", handler(MediaInteractions.RateChange), doc)
  ];
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function initFontObserver({ fontCb, doc }) {
  const win = doc.defaultView;
  if (!win) {
    return () => {
    };
  }
  const handlers = [];
  const fontMap = /* @__PURE__ */ new WeakMap();
  const originalFontFace = win.FontFace;
  win.FontFace = function FontFace2(family, source, descriptors) {
    const fontFace = new originalFontFace(family, source, descriptors);
    fontMap.set(fontFace, {
      family,
      buffer: typeof source !== "string",
      descriptors,
      fontSource: typeof source === "string" ? source : JSON.stringify(Array.from(new Uint8Array(source)))
    });
    return fontFace;
  };
  const restoreHandler = patch(
    doc.fonts,
    "add",
    function(original) {
      return function(fontFace) {
        setTimeout(
          callbackWrapper(() => {
            const p = fontMap.get(fontFace);
            if (p) {
              fontCb(p);
              fontMap.delete(fontFace);
            }
          }),
          0
        );
        return original.apply(this, [fontFace]);
      };
    }
  );
  handlers.push(() => {
    win.FontFace = originalFontFace;
  });
  handlers.push(restoreHandler);
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function initSelectionObserver(param) {
  const { doc, mirror: mirror2, blockClass, blockSelector, selectionCb } = param;
  let collapsed = true;
  const updateSelection = callbackWrapper(() => {
    const selection = doc.getSelection();
    if (!selection || collapsed && (selection == null ? void 0 : selection.isCollapsed))
      return;
    collapsed = selection.isCollapsed || false;
    const ranges = [];
    const count = selection.rangeCount || 0;
    for (let i2 = 0; i2 < count; i2++) {
      const range = selection.getRangeAt(i2);
      const { startContainer, startOffset, endContainer, endOffset } = range;
      const blocked = isBlocked(startContainer, blockClass, blockSelector, true) || isBlocked(endContainer, blockClass, blockSelector, true);
      if (blocked)
        continue;
      ranges.push({
        start: mirror2.getId(startContainer),
        startOffset,
        end: mirror2.getId(endContainer),
        endOffset
      });
    }
    selectionCb({ ranges });
  });
  updateSelection();
  return on("selectionchange", updateSelection);
}
function initCustomElementObserver({
  doc,
  customElementCb
}) {
  const win = doc.defaultView;
  if (!win || !win.customElements)
    return () => {
    };
  const restoreHandler = patch(
    win.customElements,
    "define",
    function(original) {
      return function(name, constructor, options) {
        try {
          customElementCb({
            define: {
              name
            }
          });
        } catch (e2) {
          console.warn(`Custom element callback failed for ${name}`);
        }
        return original.apply(this, [name, constructor, options]);
      };
    }
  );
  return restoreHandler;
}
function mergeHooks(o2, hooks) {
  const {
    mutationCb,
    mousemoveCb,
    mouseInteractionCb,
    scrollCb,
    viewportResizeCb,
    inputCb,
    mediaInteractionCb,
    styleSheetRuleCb,
    styleDeclarationCb,
    canvasMutationCb,
    fontCb,
    selectionCb,
    customElementCb
  } = o2;
  o2.mutationCb = (...p) => {
    if (hooks.mutation) {
      hooks.mutation(...p);
    }
    mutationCb(...p);
  };
  o2.mousemoveCb = (...p) => {
    if (hooks.mousemove) {
      hooks.mousemove(...p);
    }
    mousemoveCb(...p);
  };
  o2.mouseInteractionCb = (...p) => {
    if (hooks.mouseInteraction) {
      hooks.mouseInteraction(...p);
    }
    mouseInteractionCb(...p);
  };
  o2.scrollCb = (...p) => {
    if (hooks.scroll) {
      hooks.scroll(...p);
    }
    scrollCb(...p);
  };
  o2.viewportResizeCb = (...p) => {
    if (hooks.viewportResize) {
      hooks.viewportResize(...p);
    }
    viewportResizeCb(...p);
  };
  o2.inputCb = (...p) => {
    if (hooks.input) {
      hooks.input(...p);
    }
    inputCb(...p);
  };
  o2.mediaInteractionCb = (...p) => {
    if (hooks.mediaInteaction) {
      hooks.mediaInteaction(...p);
    }
    mediaInteractionCb(...p);
  };
  o2.styleSheetRuleCb = (...p) => {
    if (hooks.styleSheetRule) {
      hooks.styleSheetRule(...p);
    }
    styleSheetRuleCb(...p);
  };
  o2.styleDeclarationCb = (...p) => {
    if (hooks.styleDeclaration) {
      hooks.styleDeclaration(...p);
    }
    styleDeclarationCb(...p);
  };
  o2.canvasMutationCb = (...p) => {
    if (hooks.canvasMutation) {
      hooks.canvasMutation(...p);
    }
    canvasMutationCb(...p);
  };
  o2.fontCb = (...p) => {
    if (hooks.font) {
      hooks.font(...p);
    }
    fontCb(...p);
  };
  o2.selectionCb = (...p) => {
    if (hooks.selection) {
      hooks.selection(...p);
    }
    selectionCb(...p);
  };
  o2.customElementCb = (...c2) => {
    if (hooks.customElement) {
      hooks.customElement(...c2);
    }
    customElementCb(...c2);
  };
}
function initObservers(o2, hooks = {}) {
  const currentWindow = o2.doc.defaultView;
  if (!currentWindow) {
    return () => {
    };
  }
  mergeHooks(o2, hooks);
  let mutationObserver;
  if (o2.recordDOM) {
    mutationObserver = initMutationObserver(o2, o2.doc);
  }
  const mousemoveHandler = initMoveObserver(o2);
  const mouseInteractionHandler = initMouseInteractionObserver(o2);
  const scrollHandler = initScrollObserver(o2);
  const viewportResizeHandler = initViewportResizeObserver(o2, {
    win: currentWindow
  });
  const inputHandler = initInputObserver(o2);
  const mediaInteractionHandler = initMediaInteractionObserver(o2);
  let styleSheetObserver = () => {
  };
  let adoptedStyleSheetObserver = () => {
  };
  let styleDeclarationObserver = () => {
  };
  let fontObserver = () => {
  };
  if (o2.recordDOM) {
    styleSheetObserver = initStyleSheetObserver(o2, { win: currentWindow });
    adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o2, o2.doc);
    styleDeclarationObserver = initStyleDeclarationObserver(o2, {
      win: currentWindow
    });
    if (o2.collectFonts) {
      fontObserver = initFontObserver(o2);
    }
  }
  const selectionObserver = initSelectionObserver(o2);
  const customElementObserver = initCustomElementObserver(o2);
  const pluginHandlers = [];
  for (const plugin of o2.plugins) {
    pluginHandlers.push(
      plugin.observer(plugin.callback, currentWindow, plugin.options)
    );
  }
  return callbackWrapper(() => {
    mutationBuffers.forEach((b) => b.reset());
    mutationObserver == null ? void 0 : mutationObserver.disconnect();
    mousemoveHandler();
    mouseInteractionHandler();
    scrollHandler();
    viewportResizeHandler();
    inputHandler();
    mediaInteractionHandler();
    styleSheetObserver();
    adoptedStyleSheetObserver();
    styleDeclarationObserver();
    fontObserver();
    selectionObserver();
    customElementObserver();
    pluginHandlers.forEach((h) => h());
  });
}
function hasNestedCSSRule(prop) {
  return typeof window[prop] !== "undefined";
}
function canMonkeyPatchNestedCSSRule(prop) {
  return Boolean(
    typeof window[prop] !== "undefined" && // Note: Generally, this check _shouldn't_ be necessary
    // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
    window[prop].prototype && "insertRule" in window[prop].prototype && "deleteRule" in window[prop].prototype
  );
}
var CrossOriginIframeMirror = class {
  constructor(generateIdFn) {
    __publicField(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap());
    __publicField(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap());
    this.generateIdFn = generateIdFn;
  }
  getId(iframe, remoteId, idToRemoteMap, remoteToIdMap) {
    const idToRemoteIdMap = idToRemoteMap || this.getIdToRemoteIdMap(iframe);
    const remoteIdToIdMap = remoteToIdMap || this.getRemoteIdToIdMap(iframe);
    let id = idToRemoteIdMap.get(remoteId);
    if (!id) {
      id = this.generateIdFn();
      idToRemoteIdMap.set(remoteId, id);
      remoteIdToIdMap.set(id, remoteId);
    }
    return id;
  }
  getIds(iframe, remoteId) {
    const idToRemoteIdMap = this.getIdToRemoteIdMap(iframe);
    const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
    return remoteId.map(
      (id) => this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap)
    );
  }
  getRemoteId(iframe, id, map) {
    const remoteIdToIdMap = map || this.getRemoteIdToIdMap(iframe);
    if (typeof id !== "number")
      return id;
    const remoteId = remoteIdToIdMap.get(id);
    if (!remoteId)
      return -1;
    return remoteId;
  }
  getRemoteIds(iframe, ids) {
    const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
    return ids.map((id) => this.getRemoteId(iframe, id, remoteIdToIdMap));
  }
  reset(iframe) {
    if (!iframe) {
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
      this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
      return;
    }
    this.iframeIdToRemoteIdMap.delete(iframe);
    this.iframeRemoteIdToIdMap.delete(iframe);
  }
  getIdToRemoteIdMap(iframe) {
    let idToRemoteIdMap = this.iframeIdToRemoteIdMap.get(iframe);
    if (!idToRemoteIdMap) {
      idToRemoteIdMap = /* @__PURE__ */ new Map();
      this.iframeIdToRemoteIdMap.set(iframe, idToRemoteIdMap);
    }
    return idToRemoteIdMap;
  }
  getRemoteIdToIdMap(iframe) {
    let remoteIdToIdMap = this.iframeRemoteIdToIdMap.get(iframe);
    if (!remoteIdToIdMap) {
      remoteIdToIdMap = /* @__PURE__ */ new Map();
      this.iframeRemoteIdToIdMap.set(iframe, remoteIdToIdMap);
    }
    return remoteIdToIdMap;
  }
};
var IframeManager = class {
  constructor(options) {
    __publicField(this, "iframes", /* @__PURE__ */ new WeakMap());
    __publicField(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap());
    __publicField(this, "crossOriginIframeMirror", new CrossOriginIframeMirror(genId));
    __publicField(this, "crossOriginIframeStyleMirror");
    __publicField(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap());
    __publicField(this, "mirror");
    __publicField(this, "mutationCb");
    __publicField(this, "wrappedEmit");
    __publicField(this, "loadListener");
    __publicField(this, "stylesheetManager");
    __publicField(this, "recordCrossOriginIframes");
    this.mutationCb = options.mutationCb;
    this.wrappedEmit = options.wrappedEmit;
    this.stylesheetManager = options.stylesheetManager;
    this.recordCrossOriginIframes = options.recordCrossOriginIframes;
    this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(
      this.stylesheetManager.styleMirror.generateId.bind(
        this.stylesheetManager.styleMirror
      )
    );
    this.mirror = options.mirror;
    if (this.recordCrossOriginIframes) {
      window.addEventListener("message", this.handleMessage.bind(this));
    }
  }
  addIframe(iframeEl) {
    this.iframes.set(iframeEl, true);
    if (iframeEl.contentWindow)
      this.crossOriginIframeMap.set(iframeEl.contentWindow, iframeEl);
  }
  addLoadListener(cb) {
    this.loadListener = cb;
  }
  attachIframe(iframeEl, childSn) {
    var _a2, _b;
    this.mutationCb({
      adds: [
        {
          parentId: this.mirror.getId(iframeEl),
          nextId: null,
          node: childSn
        }
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: true
    });
    if (this.recordCrossOriginIframes)
      (_a2 = iframeEl.contentWindow) == null ? void 0 : _a2.addEventListener(
        "message",
        this.handleMessage.bind(this)
      );
    (_b = this.loadListener) == null ? void 0 : _b.call(this, iframeEl);
    if (iframeEl.contentDocument && iframeEl.contentDocument.adoptedStyleSheets && iframeEl.contentDocument.adoptedStyleSheets.length > 0)
      this.stylesheetManager.adoptStyleSheets(
        iframeEl.contentDocument.adoptedStyleSheets,
        this.mirror.getId(iframeEl.contentDocument)
      );
  }
  handleMessage(message) {
    const crossOriginMessageEvent = message;
    if (crossOriginMessageEvent.data.type !== "rrweb" || // To filter out the rrweb messages which are forwarded by some sites.
    crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin)
      return;
    const iframeSourceWindow = message.source;
    if (!iframeSourceWindow)
      return;
    const iframeEl = this.crossOriginIframeMap.get(iframeSourceWindow);
    if (!iframeEl)
      return;
    const transformedEvent = this.transformCrossOriginEvent(
      iframeEl,
      crossOriginMessageEvent.data.event
    );
    if (transformedEvent)
      this.wrappedEmit(
        transformedEvent,
        crossOriginMessageEvent.data.isCheckout
      );
  }
  transformCrossOriginEvent(iframeEl, e2) {
    var _a2;
    switch (e2.type) {
      case EventType.FullSnapshot: {
        this.crossOriginIframeMirror.reset(iframeEl);
        this.crossOriginIframeStyleMirror.reset(iframeEl);
        this.replaceIdOnNode(e2.data.node, iframeEl);
        const rootId = e2.data.node.id;
        this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
        this.patchRootIdOnNode(e2.data.node, rootId);
        return {
          timestamp: e2.timestamp,
          type: EventType.IncrementalSnapshot,
          data: {
            source: IncrementalSource.Mutation,
            adds: [
              {
                parentId: this.mirror.getId(iframeEl),
                nextId: null,
                node: e2.data.node
              }
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: true
          }
        };
      }
      case EventType.Meta:
      case EventType.Load:
      case EventType.DomContentLoaded: {
        return false;
      }
      case EventType.Plugin: {
        return e2;
      }
      case EventType.Custom: {
        this.replaceIds(
          e2.data.payload,
          iframeEl,
          ["id", "parentId", "previousId", "nextId"]
        );
        return e2;
      }
      case EventType.IncrementalSnapshot: {
        switch (e2.data.source) {
          case IncrementalSource.Mutation: {
            e2.data.adds.forEach((n2) => {
              this.replaceIds(n2, iframeEl, [
                "parentId",
                "nextId",
                "previousId"
              ]);
              this.replaceIdOnNode(n2.node, iframeEl);
              const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
              rootId && this.patchRootIdOnNode(n2.node, rootId);
            });
            e2.data.removes.forEach((n2) => {
              this.replaceIds(n2, iframeEl, ["parentId", "id"]);
            });
            e2.data.attributes.forEach((n2) => {
              this.replaceIds(n2, iframeEl, ["id"]);
            });
            e2.data.texts.forEach((n2) => {
              this.replaceIds(n2, iframeEl, ["id"]);
            });
            return e2;
          }
          case IncrementalSource.Drag:
          case IncrementalSource.TouchMove:
          case IncrementalSource.MouseMove: {
            e2.data.positions.forEach((p) => {
              this.replaceIds(p, iframeEl, ["id"]);
            });
            return e2;
          }
          case IncrementalSource.ViewportResize: {
            return false;
          }
          case IncrementalSource.MediaInteraction:
          case IncrementalSource.MouseInteraction:
          case IncrementalSource.Scroll:
          case IncrementalSource.CanvasMutation:
          case IncrementalSource.Input: {
            this.replaceIds(e2.data, iframeEl, ["id"]);
            return e2;
          }
          case IncrementalSource.StyleSheetRule:
          case IncrementalSource.StyleDeclaration: {
            this.replaceIds(e2.data, iframeEl, ["id"]);
            this.replaceStyleIds(e2.data, iframeEl, ["styleId"]);
            return e2;
          }
          case IncrementalSource.Font: {
            return e2;
          }
          case IncrementalSource.Selection: {
            e2.data.ranges.forEach((range) => {
              this.replaceIds(range, iframeEl, ["start", "end"]);
            });
            return e2;
          }
          case IncrementalSource.AdoptedStyleSheet: {
            this.replaceIds(e2.data, iframeEl, ["id"]);
            this.replaceStyleIds(e2.data, iframeEl, ["styleIds"]);
            (_a2 = e2.data.styles) == null ? void 0 : _a2.forEach((style) => {
              this.replaceStyleIds(style, iframeEl, ["styleId"]);
            });
            return e2;
          }
        }
      }
    }
    return false;
  }
  replace(iframeMirror, obj, iframeEl, keys) {
    for (const key of keys) {
      if (!Array.isArray(obj[key]) && typeof obj[key] !== "number")
        continue;
      if (Array.isArray(obj[key])) {
        obj[key] = iframeMirror.getIds(
          iframeEl,
          obj[key]
        );
      } else {
        obj[key] = iframeMirror.getId(iframeEl, obj[key]);
      }
    }
    return obj;
  }
  replaceIds(obj, iframeEl, keys) {
    return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys);
  }
  replaceStyleIds(obj, iframeEl, keys) {
    return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys);
  }
  replaceIdOnNode(node, iframeEl) {
    this.replaceIds(node, iframeEl, ["id", "rootId"]);
    if ("childNodes" in node) {
      node.childNodes.forEach((child) => {
        this.replaceIdOnNode(child, iframeEl);
      });
    }
  }
  patchRootIdOnNode(node, rootId) {
    if (node.type !== NodeType$2.Document && !node.rootId)
      node.rootId = rootId;
    if ("childNodes" in node) {
      node.childNodes.forEach((child) => {
        this.patchRootIdOnNode(child, rootId);
      });
    }
  }
};
var ShadowDomManager = class {
  constructor(options) {
    __publicField(this, "shadowDoms", /* @__PURE__ */ new WeakSet());
    __publicField(this, "mutationCb");
    __publicField(this, "scrollCb");
    __publicField(this, "bypassOptions");
    __publicField(this, "mirror");
    __publicField(this, "restoreHandlers", []);
    this.mutationCb = options.mutationCb;
    this.scrollCb = options.scrollCb;
    this.bypassOptions = options.bypassOptions;
    this.mirror = options.mirror;
    this.init();
  }
  init() {
    this.reset();
    this.patchAttachShadow(Element, document);
  }
  addShadowRoot(shadowRoot2, doc) {
    if (!isNativeShadowDom(shadowRoot2))
      return;
    if (this.shadowDoms.has(shadowRoot2))
      return;
    this.shadowDoms.add(shadowRoot2);
    const observer = initMutationObserver(
      {
        ...this.bypassOptions,
        doc,
        mutationCb: this.mutationCb,
        mirror: this.mirror,
        shadowDomManager: this
      },
      shadowRoot2
    );
    this.restoreHandlers.push(() => observer.disconnect());
    this.restoreHandlers.push(
      initScrollObserver({
        ...this.bypassOptions,
        scrollCb: this.scrollCb,
        // https://gist.github.com/praveenpuglia/0832da687ed5a5d7a0907046c9ef1813
        // scroll is not allowed to pass the boundary, so we need to listen the shadow document
        doc: shadowRoot2,
        mirror: this.mirror
      })
    );
    setTimeout(() => {
      if (shadowRoot2.adoptedStyleSheets && shadowRoot2.adoptedStyleSheets.length > 0)
        this.bypassOptions.stylesheetManager.adoptStyleSheets(
          shadowRoot2.adoptedStyleSheets,
          this.mirror.getId(index.host(shadowRoot2))
        );
      this.restoreHandlers.push(
        initAdoptedStyleSheetObserver(
          {
            mirror: this.mirror,
            stylesheetManager: this.bypassOptions.stylesheetManager
          },
          shadowRoot2
        )
      );
    }, 0);
  }
  /**
   * Monkey patch 'attachShadow' of an IFrameElement to observe newly added shadow doms.
   */
  observeAttachShadow(iframeElement) {
    if (!iframeElement.contentWindow || !iframeElement.contentDocument)
      return;
    this.patchAttachShadow(
      iframeElement.contentWindow.Element,
      iframeElement.contentDocument
    );
  }
  /**
   * Patch 'attachShadow' to observe newly added shadow doms.
   */
  patchAttachShadow(element, doc) {
    const manager = this;
    this.restoreHandlers.push(
      patch(
        element.prototype,
        "attachShadow",
        function(original) {
          return function(option) {
            const sRoot = original.call(this, option);
            const shadowRootEl = index.shadowRoot(this);
            if (shadowRootEl && inDom(this))
              manager.addShadowRoot(shadowRootEl, doc);
            return sRoot;
          };
        }
      )
    );
  }
  reset() {
    this.restoreHandlers.forEach((handler) => {
      try {
        handler();
      } catch (e2) {
      }
    });
    this.restoreHandlers = [];
    this.shadowDoms = /* @__PURE__ */ new WeakSet();
  }
};
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (i$1 = 0; i$1 < chars.length; i$1++) {
  lookup[chars.charCodeAt(i$1)] = i$1;
}
var i$1;
var encode = function(arraybuffer) {
  var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
  for (i2 = 0; i2 < len; i2 += 3) {
    base64 += chars[bytes[i2] >> 2];
    base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
    base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
    base64 += chars[bytes[i2 + 2] & 63];
  }
  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }
  return base64;
};
var decode = function(base64) {
  var bufferLength = base64.length * 0.75, len = base64.length, i2, p = 0, encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i2 = 0; i2 < len; i2 += 4) {
    encoded1 = lookup[base64.charCodeAt(i2)];
    encoded2 = lookup[base64.charCodeAt(i2 + 1)];
    encoded3 = lookup[base64.charCodeAt(i2 + 2)];
    encoded4 = lookup[base64.charCodeAt(i2 + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};
var canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor$1(ctx, ctor) {
  let contextMap = canvasVarMap.get(ctx);
  if (!contextMap) {
    contextMap = /* @__PURE__ */ new Map();
    canvasVarMap.set(ctx, contextMap);
  }
  if (!contextMap.has(ctor)) {
    contextMap.set(ctor, []);
  }
  return contextMap.get(ctor);
}
var saveWebGLVar = (value, win, ctx) => {
  if (!value || !(isInstanceOfWebGLObject(value, win) || typeof value === "object"))
    return;
  const name = value.constructor.name;
  const list = variableListFor$1(ctx, name);
  let index2 = list.indexOf(value);
  if (index2 === -1) {
    index2 = list.length;
    list.push(value);
  }
  return index2;
};
function serializeArg(value, win, ctx) {
  if (value instanceof Array) {
    return value.map((arg) => serializeArg(arg, win, ctx));
  } else if (value === null) {
    return value;
  } else if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Uint8Array || value instanceof Uint16Array || value instanceof Int16Array || value instanceof Int8Array || value instanceof Uint8ClampedArray) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [Object.values(value)]
    };
  } else if (
    // SharedArrayBuffer disabled on most browsers due to spectre.
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/SharedArrayBuffer
    // value instanceof SharedArrayBuffer ||
    value instanceof ArrayBuffer
  ) {
    const name = value.constructor.name;
    const base64 = encode(value);
    return {
      rr_type: name,
      base64
    };
  } else if (value instanceof DataView) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [
        serializeArg(value.buffer, win, ctx),
        value.byteOffset,
        value.byteLength
      ]
    };
  } else if (value instanceof HTMLImageElement) {
    const name = value.constructor.name;
    const { src } = value;
    return {
      rr_type: name,
      src
    };
  } else if (value instanceof HTMLCanvasElement) {
    const name = "HTMLImageElement";
    const src = value.toDataURL();
    return {
      rr_type: name,
      src
    };
  } else if (value instanceof ImageData) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [serializeArg(value.data, win, ctx), value.width, value.height]
    };
  } else if (isInstanceOfWebGLObject(value, win) || typeof value === "object") {
    const name = value.constructor.name;
    const index2 = saveWebGLVar(value, win, ctx);
    return {
      rr_type: name,
      index: index2
    };
  }
  return value;
}
var serializeArgs = (args, win, ctx) => {
  return args.map((arg) => serializeArg(arg, win, ctx));
};
var isInstanceOfWebGLObject = (value, win) => {
  const webGLConstructorNames = [
    "WebGLActiveInfo",
    "WebGLBuffer",
    "WebGLFramebuffer",
    "WebGLProgram",
    "WebGLRenderbuffer",
    "WebGLShader",
    "WebGLShaderPrecisionFormat",
    "WebGLTexture",
    "WebGLUniformLocation",
    "WebGLVertexArrayObject",
    // In old Chrome versions, value won't be an instanceof WebGLVertexArrayObject.
    "WebGLVertexArrayObjectOES"
  ];
  const supportedWebGLConstructorNames = webGLConstructorNames.filter(
    (name) => typeof win[name] === "function"
  );
  return Boolean(
    supportedWebGLConstructorNames.find(
      (name) => value instanceof win[name]
    )
  );
};
function initCanvas2DMutationObserver(cb, win, blockClass, blockSelector) {
  const handlers = [];
  const props2D = Object.getOwnPropertyNames(
    win.CanvasRenderingContext2D.prototype
  );
  for (const prop of props2D) {
    try {
      if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch(
        win.CanvasRenderingContext2D.prototype,
        prop,
        function(original) {
          return function(...args) {
            if (!isBlocked(this.canvas, blockClass, blockSelector, true)) {
              setTimeout(() => {
                const recordArgs = serializeArgs(args, win, this);
                cb(this.canvas, {
                  type: CanvasContext["2D"],
                  property: prop,
                  args: recordArgs
                });
              }, 0);
            }
            return original.apply(this, args);
          };
        }
      );
      handlers.push(restoreHandler);
    } catch {
      const hookHandler = hookSetter(
        win.CanvasRenderingContext2D.prototype,
        prop,
        {
          set(v2) {
            cb(this.canvas, {
              type: CanvasContext["2D"],
              property: prop,
              args: [v2],
              setter: true
            });
          }
        }
      );
      handlers.push(hookHandler);
    }
  }
  return () => {
    handlers.forEach((h) => h());
  };
}
function getNormalizedContextName(contextType) {
  return contextType === "experimental-webgl" ? "webgl" : contextType;
}
function initCanvasContextObserver(win, blockClass, blockSelector, setPreserveDrawingBufferToTrue) {
  const handlers = [];
  try {
    const restoreGetContext = patch(
      win.HTMLCanvasElement.prototype,
      "getContext",
      function(original) {
        return function(contextType, ...args) {
          if (!isBlocked(this, blockClass, blockSelector, true)) {
            const ctxName = getNormalizedContextName(contextType);
            if (!("__context" in this))
              this.__context = ctxName;
            if (setPreserveDrawingBufferToTrue && ["webgl", "webgl2"].includes(ctxName)) {
              if (args[0] && typeof args[0] === "object") {
                const contextAttributes = args[0];
                if (!contextAttributes.preserveDrawingBuffer) {
                  contextAttributes.preserveDrawingBuffer = true;
                }
              } else {
                args.splice(0, 1, {
                  preserveDrawingBuffer: true
                });
              }
            }
          }
          return original.apply(this, [contextType, ...args]);
        };
      }
    );
    handlers.push(restoreGetContext);
  } catch {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    handlers.forEach((h) => h());
  };
}
function patchGLPrototype(prototype, type, cb, blockClass, blockSelector, win) {
  const handlers = [];
  const props = Object.getOwnPropertyNames(prototype);
  for (const prop of props) {
    if (
      //prop.startsWith('get') ||  // e.g. getProgramParameter, but too risky
      [
        "isContextLost",
        "canvas",
        "drawingBufferWidth",
        "drawingBufferHeight"
      ].includes(prop)
    ) {
      continue;
    }
    try {
      if (typeof prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch(
        prototype,
        prop,
        function(original) {
          return function(...args) {
            const result = original.apply(this, args);
            saveWebGLVar(result, win, this);
            if ("tagName" in this.canvas && !isBlocked(
              this.canvas,
              blockClass,
              blockSelector,
              true
            )) {
              const recordArgs = serializeArgs(args, win, this);
              const mutation = {
                type,
                property: prop,
                args: recordArgs
              };
              cb(this.canvas, mutation);
            }
            return result;
          };
        }
      );
      handlers.push(restoreHandler);
    } catch {
      const hookHandler = hookSetter(prototype, prop, {
        set(v2) {
          cb(this.canvas, {
            type,
            property: prop,
            args: [v2],
            setter: true
          });
        }
      });
      handlers.push(hookHandler);
    }
  }
  return handlers;
}
function initCanvasWebGLMutationObserver(cb, win, blockClass, blockSelector) {
  const handlers = [];
  handlers.push(
    ...patchGLPrototype(
      win.WebGLRenderingContext.prototype,
      CanvasContext.WebGL,
      cb,
      blockClass,
      blockSelector,
      win
    )
  );
  if (typeof win.WebGL2RenderingContext !== "undefined") {
    handlers.push(
      ...patchGLPrototype(
        win.WebGL2RenderingContext.prototype,
        CanvasContext.WebGL2,
        cb,
        blockClass,
        blockSelector,
        win
      )
    );
  }
  return () => {
    handlers.forEach((h) => h());
  };
}
var encodedJs = "KGZ1bmN0aW9uKCkgewogICJ1c2Ugc3RyaWN0IjsKICB2YXIgY2hhcnMgPSAiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyI7CiAgdmFyIGxvb2t1cCA9IHR5cGVvZiBVaW50OEFycmF5ID09PSAidW5kZWZpbmVkIiA/IFtdIDogbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSsrKSB7CiAgICBsb29rdXBbY2hhcnMuY2hhckNvZGVBdChpKV0gPSBpOwogIH0KICB2YXIgZW5jb2RlID0gZnVuY3Rpb24oYXJyYXlidWZmZXIpIHsKICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKSwgaTIsIGxlbiA9IGJ5dGVzLmxlbmd0aCwgYmFzZTY0ID0gIiI7CiAgICBmb3IgKGkyID0gMDsgaTIgPCBsZW47IGkyICs9IDMpIHsKICAgICAgYmFzZTY0ICs9IGNoYXJzW2J5dGVzW2kyXSA+PiAyXTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMl0gJiAzKSA8PCA0IHwgYnl0ZXNbaTIgKyAxXSA+PiA0XTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMiArIDFdICYgMTUpIDw8IDIgfCBieXRlc1tpMiArIDJdID4+IDZdOwogICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaTIgKyAyXSAmIDYzXTsKICAgIH0KICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgIj0iOwogICAgfSBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgIj09IjsKICAgIH0KICAgIHJldHVybiBiYXNlNjQ7CiAgfTsKICBjb25zdCBsYXN0QmxvYk1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICBhc3luYyBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEJsb2JGb3Iod2lkdGgsIGhlaWdodCwgZGF0YVVSTE9wdGlvbnMpIHsKICAgIGNvbnN0IGlkID0gYCR7d2lkdGh9LSR7aGVpZ2h0fWA7CiAgICBpZiAoIk9mZnNjcmVlbkNhbnZhcyIgaW4gZ2xvYmFsVGhpcykgewogICAgICBpZiAodHJhbnNwYXJlbnRCbG9iTWFwLmhhcyhpZCkpIHJldHVybiB0cmFuc3BhcmVudEJsb2JNYXAuZ2V0KGlkKTsKICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsKICAgICAgb2Zmc2NyZWVuLmdldENvbnRleHQoIjJkIik7CiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBvZmZzY3JlZW4uY29udmVydFRvQmxvYihkYXRhVVJMT3B0aW9ucyk7CiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpOwogICAgICBjb25zdCBiYXNlNjQgPSBlbmNvZGUoYXJyYXlCdWZmZXIpOwogICAgICB0cmFuc3BhcmVudEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOwogICAgICByZXR1cm4gYmFzZTY0OwogICAgfSBlbHNlIHsKICAgICAgcmV0dXJuICIiOwogICAgfQogIH0KICBjb25zdCB3b3JrZXIgPSBzZWxmOwogIGxldCBsb2dEZWJ1ZyA9IGZhbHNlOwogIGNvbnN0IGRlYnVnID0gKC4uLmFyZ3MpID0+IHsKICAgIGlmIChsb2dEZWJ1ZykgewogICAgICBjb25zb2xlLmRlYnVnKC4uLmFyZ3MpOwogICAgfQogIH07CiAgd29ya2VyLm9ubWVzc2FnZSA9IGFzeW5jIGZ1bmN0aW9uKGUpIHsKICAgIGxvZ0RlYnVnID0gISFlLmRhdGEubG9nRGVidWc7CiAgICBpZiAoIk9mZnNjcmVlbkNhbnZhcyIgaW4gZ2xvYmFsVGhpcykgewogICAgICBjb25zdCB7IGlkLCBiaXRtYXAsIHdpZHRoLCBoZWlnaHQsIGR4LCBkeSwgZHcsIGRoLCBkYXRhVVJMT3B0aW9ucyB9ID0gZS5kYXRhOwogICAgICBjb25zdCB0cmFuc3BhcmVudEJhc2U2NCA9IGdldFRyYW5zcGFyZW50QmxvYkZvcigKICAgICAgICB3aWR0aCwKICAgICAgICBoZWlnaHQsCiAgICAgICAgZGF0YVVSTE9wdGlvbnMKICAgICAgKTsKICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsKICAgICAgY29uc3QgY3R4ID0gb2Zmc2NyZWVuLmdldENvbnRleHQoIjJkIik7CiAgICAgIGN0eC5kcmF3SW1hZ2UoYml0bWFwLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTsKICAgICAgYml0bWFwLmNsb3NlKCk7CiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBvZmZzY3JlZW4uY29udmVydFRvQmxvYihkYXRhVVJMT3B0aW9ucyk7CiAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7CiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpOwogICAgICBjb25zdCBiYXNlNjQgPSBlbmNvZGUoYXJyYXlCdWZmZXIpOwogICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgYXdhaXQgdHJhbnNwYXJlbnRCYXNlNjQgPT09IGJhc2U2NCkgewogICAgICAgIGRlYnVnKCJbaGlnaGxpZ2h0LXdvcmtlcl0gY2FudmFzIGJpdG1hcCBpcyB0cmFuc3BhcmVudCIsIHsKICAgICAgICAgIGlkLAogICAgICAgICAgYmFzZTY0CiAgICAgICAgfSk7CiAgICAgICAgbGFzdEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOwogICAgICAgIHJldHVybiB3b3JrZXIucG9zdE1lc3NhZ2UoeyBpZCwgc3RhdHVzOiAidHJhbnNwYXJlbnQiIH0pOwogICAgICB9CiAgICAgIGlmIChsYXN0QmxvYk1hcC5nZXQoaWQpID09PSBiYXNlNjQpIHsKICAgICAgICBkZWJ1ZygiW2hpZ2hsaWdodC13b3JrZXJdIGNhbnZhcyBiaXRtYXAgaXMgdW5jaGFuZ2VkIiwgewogICAgICAgICAgaWQsCiAgICAgICAgICBiYXNlNjQKICAgICAgICB9KTsKICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQsIHN0YXR1czogInVuY2hhbmdlZCIgfSk7CiAgICAgIH0KICAgICAgY29uc3QgbXNnID0gewogICAgICAgIGlkLAogICAgICAgIHR5cGUsCiAgICAgICAgYmFzZTY0LAogICAgICAgIHdpZHRoLAogICAgICAgIGhlaWdodCwKICAgICAgICBkeCwKICAgICAgICBkeSwKICAgICAgICBkdywKICAgICAgICBkaAogICAgICB9OwogICAgICBkZWJ1ZygiW2hpZ2hsaWdodC13b3JrZXJdIGNhbnZhcyBiaXRtYXAgcHJvY2Vzc2VkIiwgbXNnKTsKICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKG1zZyk7CiAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsKICAgIH0gZWxzZSB7CiAgICAgIGRlYnVnKCJbaGlnaGxpZ2h0LXdvcmtlcl0gbm8gb2Zmc2NyZWVuY2FudmFzIHN1cHBvcnQiLCB7CiAgICAgICAgaWQ6IGUuZGF0YS5pZAogICAgICB9KTsKICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkOiBlLmRhdGEuaWQsIHN0YXR1czogInVuc3VwcG9ydGVkIiB9KTsKICAgIH0KICB9Owp9KSgpOwovLyMgc291cmNlTWFwcGluZ1VSTD1pbWFnZS1iaXRtYXAtZGF0YS11cmwtd29ya2VyLUJpWEpSZjQ3LmpzLm1hcAo=";
var decodeBase64 = (base64) => Uint8Array.from(atob(base64), (c2) => c2.charCodeAt(0));
var blob = typeof window !== "undefined" && window.Blob && new Blob([decodeBase64(encodedJs)], { type: "text/javascript;charset=utf-8" });
function WorkerWrapper(options) {
  let objURL;
  try {
    objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
    if (!objURL)
      throw "";
    const worker = new Worker(objURL, {
      name: options == null ? void 0 : options.name
    });
    worker.addEventListener("error", () => {
      (window.URL || window.webkitURL).revokeObjectURL(objURL);
    });
    return worker;
  } catch (e2) {
    return new Worker(
      "data:text/javascript;base64," + encodedJs,
      {
        name: options == null ? void 0 : options.name
      }
    );
  } finally {
    objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
  }
}
var CanvasManager = class {
  constructor(options) {
    __publicField(this, "pendingCanvasMutations", /* @__PURE__ */ new Map());
    __publicField(this, "rafStamps", { latestId: 0, invokeId: null });
    __publicField(this, "mirror");
    __publicField(this, "logger");
    __publicField(this, "worker");
    __publicField(this, "snapshotInProgressMap", /* @__PURE__ */ new Map());
    __publicField(this, "lastSnapshotTime", /* @__PURE__ */ new Map());
    __publicField(this, "options");
    __publicField(this, "mutationCb");
    __publicField(this, "resetObservers");
    __publicField(this, "frozen", false);
    __publicField(this, "locked", false);
    __publicField(this, "processMutation", (target, mutation) => {
      const newFrame = this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId;
      if (newFrame || !this.rafStamps.invokeId)
        this.rafStamps.invokeId = this.rafStamps.latestId;
      if (!this.pendingCanvasMutations.has(target)) {
        this.pendingCanvasMutations.set(target, []);
      }
      this.pendingCanvasMutations.get(target).push(mutation);
    });
    const {
      sampling,
      win,
      blockClass,
      blockSelector,
      recordCanvas,
      recordVideos,
      initialSnapshotDelay,
      dataURLOptions
    } = options;
    this.mutationCb = options.mutationCb;
    this.mirror = options.mirror;
    this.logger = options.logger;
    this.worker = new WorkerWrapper();
    this.worker.onmessage = (e2) => {
      const { id } = e2.data;
      this.snapshotInProgressMap.set(id, false);
      if (!("base64" in e2.data)) {
        this.debug(null, "canvas worker received empty message", {
          data: e2.data,
          status: e2.data.status
        });
        return;
      }
      const { base64, type, dx, dy, dw, dh } = e2.data;
      const mutation = {
        id,
        type: CanvasContext["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [dx, dy, dw, dh]
          },
          {
            property: "drawImage",
            // draws (semi-transparent) image
            args: [
              {
                rr_type: "ImageBitmap",
                args: [
                  {
                    rr_type: "Blob",
                    data: [{ rr_type: "ArrayBuffer", base64 }],
                    type
                  }
                ]
              },
              dx,
              dy,
              dw,
              dh
            ]
          }
        ]
      };
      this.debug(null, "canvas worker recording mutation", mutation);
      this.mutationCb(mutation);
    };
    this.options = options;
    if (recordCanvas && sampling === "all") {
      this.debug(null, "initializing canvas mutation observer", { sampling });
      this.initCanvasMutationObserver(win, blockClass, blockSelector);
    } else if (recordCanvas && typeof sampling === "number") {
      this.debug(null, "initializing canvas fps observer", { sampling });
      this.initCanvasFPSObserver(
        recordVideos,
        sampling,
        win,
        blockClass,
        blockSelector,
        {
          initialSnapshotDelay,
          dataURLOptions
        },
        options.resizeFactor,
        options.maxSnapshotDimension
      );
    }
  }
  reset() {
    this.pendingCanvasMutations.clear();
    this.resetObservers && this.resetObservers();
  }
  freeze() {
    this.frozen = true;
  }
  unfreeze() {
    this.frozen = false;
  }
  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
  debug(element, ...args) {
    if (!this.logger)
      return;
    const id = this.mirror.getId(element);
    let prefix = "[highlight-canvas-manager]";
    if (element) {
      prefix = `[highlight-canvas] [id:${id}]`;
      if (element.tagName.toLowerCase() === "canvas") {
        prefix += ` [ctx:${element.__context}]`;
      }
    }
    this.logger.debug(prefix, element, ...args);
  }
  async snapshot(canvas) {
    var _a2;
    const id = this.mirror.getId(canvas);
    if (this.snapshotInProgressMap.get(id)) {
      this.debug(canvas, "snapshotting already in progress for", id);
      return;
    }
    const timeBetweenSnapshots = 1e3 / (typeof this.options.samplingManual === "number" ? this.options.samplingManual : 1);
    const lastSnapshotTime = this.lastSnapshotTime.get(id);
    if (lastSnapshotTime && (/* @__PURE__ */ new Date()).getTime() - lastSnapshotTime < timeBetweenSnapshots) {
      return;
    }
    this.debug(canvas, "starting snapshotting");
    if (canvas.width === 0 || canvas.height === 0) {
      this.debug(canvas, "not yet ready", {
        width: canvas.width,
        height: canvas.height
      });
      return;
    }
    this.lastSnapshotTime.set(id, (/* @__PURE__ */ new Date()).getTime());
    this.snapshotInProgressMap.set(id, true);
    try {
      if (this.options.clearWebGLBuffer !== false && ["webgl", "webgl2"].includes(canvas.__context)) {
        const context = canvas.getContext(canvas.__context);
        if (((_a2 = context == null ? void 0 : context.getContextAttributes()) == null ? void 0 : _a2.preserveDrawingBuffer) === false) {
          context.clear(context.COLOR_BUFFER_BIT);
          this.debug(canvas, "cleared webgl canvas to load it into memory", {
            attributes: context == null ? void 0 : context.getContextAttributes()
          });
        }
      }
      if (canvas.width === 0 || canvas.height === 0) {
        this.debug(canvas, "not yet ready", {
          width: canvas.width,
          height: canvas.height
        });
        return;
      }
      let scale = this.options.resizeFactor || 1;
      if (this.options.maxSnapshotDimension) {
        const maxDim = Math.max(canvas.width, canvas.height);
        scale = Math.min(scale, this.options.maxSnapshotDimension / maxDim);
      }
      const width = canvas.width * scale;
      const height = canvas.height * scale;
      const bitmap = await createImageBitmap(canvas, {
        resizeWidth: width,
        resizeHeight: height
      });
      this.debug(canvas, "created image bitmap", {
        width: bitmap.width,
        height: bitmap.height
      });
      this.worker.postMessage(
        {
          id,
          bitmap,
          width,
          height,
          dx: 0,
          dy: 0,
          dw: canvas.width,
          dh: canvas.height,
          dataURLOptions: this.options.dataURLOptions,
          logDebug: !!this.logger
        },
        [bitmap]
      );
      this.debug(canvas, "sent message");
    } catch (e2) {
      this.debug(canvas, "failed to snapshot", e2);
    } finally {
      this.snapshotInProgressMap.set(id, false);
    }
  }
  initCanvasFPSObserver(recordVideos, fps, win, blockClass, blockSelector, options, resizeFactor, maxSnapshotDimension) {
    const canvasContextReset = initCanvasContextObserver(
      win,
      blockClass,
      blockSelector,
      true
    );
    const timeBetweenSnapshots = 1e3 / fps;
    let lastSnapshotTime = 0;
    let rafId;
    const elementFoundTime = /* @__PURE__ */ new Map();
    const getCanvas = (timestamp) => {
      const matchedCanvas = [];
      win.document.querySelectorAll("canvas").forEach((canvas) => {
        if (!isBlocked(canvas, blockClass, blockSelector, true)) {
          this.debug(canvas, "discovered canvas");
          matchedCanvas.push(canvas);
          const id = this.mirror.getId(canvas);
          if (!elementFoundTime.has(id)) {
            elementFoundTime.set(id, timestamp);
          }
        }
      });
      return matchedCanvas;
    };
    const getVideos = (timestamp) => {
      const matchedVideos = [];
      if (recordVideos) {
        win.document.querySelectorAll("video").forEach((video) => {
          if (video.src !== "" && video.src.indexOf("blob:") === -1)
            return;
          if (!isBlocked(video, blockClass, blockSelector, true)) {
            matchedVideos.push(video);
            const id = this.mirror.getId(video);
            if (!elementFoundTime.has(id)) {
              elementFoundTime.set(id, timestamp);
            }
          }
        });
      }
      return matchedVideos;
    };
    const takeSnapshots = async (timestamp) => {
      if (lastSnapshotTime && timestamp - lastSnapshotTime < timeBetweenSnapshots) {
        rafId = requestAnimationFrame(takeSnapshots);
        return;
      }
      lastSnapshotTime = timestamp;
      const filterElementStartTime = (canvas) => {
        const id = this.mirror.getId(canvas);
        const foundTime = elementFoundTime.get(id);
        const hadLoadingTime = !options.initialSnapshotDelay || timestamp - foundTime > options.initialSnapshotDelay;
        this.debug(canvas, {
          delay: options.initialSnapshotDelay,
          delta: timestamp - foundTime,
          hadLoadingTime
        });
        return hadLoadingTime;
      };
      const promises = [];
      promises.push(
        ...getCanvas(timestamp).filter(filterElementStartTime).map((canvas) => this.snapshot(canvas))
      );
      promises.push(
        ...getVideos(timestamp).filter(filterElementStartTime).map(async (video) => {
          this.debug(video, "starting video snapshotting");
          const id = this.mirror.getId(video);
          if (this.snapshotInProgressMap.get(id)) {
            this.debug(
              video,
              "video snapshotting already in progress for",
              id
            );
            return;
          }
          this.snapshotInProgressMap.set(id, true);
          try {
            const { width: boxWidth, height: boxHeight } = video.getBoundingClientRect();
            const { actualWidth, actualHeight } = {
              actualWidth: video.videoWidth,
              actualHeight: video.videoHeight
            };
            const maxDim = Math.max(actualWidth, actualHeight);
            if (video.width === 0 || video.height === 0 || actualWidth === 0 || actualHeight === 0 || boxWidth === 0 || boxHeight === 0) {
              this.debug(video, "not yet ready", {
                width: video.width,
                height: video.height
              });
              return;
            }
            let scale = resizeFactor || 1;
            if (maxSnapshotDimension) {
              scale = Math.min(scale, maxSnapshotDimension / maxDim);
            }
            const width = actualWidth * scale;
            const height = actualHeight * scale;
            const bitmap = await createImageBitmap(video, {
              resizeWidth: width,
              resizeHeight: height
            });
            const outputScale = Math.max(boxWidth, boxHeight) / maxDim;
            const outputWidth = actualWidth * outputScale;
            const outputHeight = actualHeight * outputScale;
            const offsetX = (boxWidth - outputWidth) / 2;
            const offsetY = (boxHeight - outputHeight) / 2;
            this.debug(video, "created image bitmap", {
              actualWidth,
              actualHeight,
              boxWidth,
              boxHeight,
              outputWidth,
              outputHeight,
              resizeWidth: width,
              resizeHeight: height,
              scale,
              outputScale,
              offsetX,
              offsetY
            });
            this.worker.postMessage(
              {
                id,
                bitmap,
                width,
                height,
                dx: offsetX,
                dy: offsetY,
                dw: outputWidth,
                dh: outputHeight,
                dataURLOptions: options.dataURLOptions,
                logDebug: !!this.logger
              },
              [bitmap]
            );
            this.debug(video, "send message");
          } catch (e2) {
            this.debug(video, "failed to snapshot", e2);
          } finally {
            this.snapshotInProgressMap.set(id, false);
          }
        })
      );
      await Promise.all(promises).catch(console.error);
      rafId = requestAnimationFrame(takeSnapshots);
    };
    rafId = requestAnimationFrame(takeSnapshots);
    this.resetObservers = () => {
      canvasContextReset();
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }
  initCanvasMutationObserver(win, blockClass, blockSelector) {
    this.startRAFTimestamping();
    this.startPendingCanvasMutationFlusher();
    const canvasContextReset = initCanvasContextObserver(
      win,
      blockClass,
      blockSelector,
      false
    );
    const canvas2DReset = initCanvas2DMutationObserver(
      this.processMutation.bind(this),
      win,
      blockClass,
      blockSelector
    );
    const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(
      this.processMutation.bind(this),
      win,
      blockClass,
      blockSelector
    );
    this.resetObservers = () => {
      canvasContextReset();
      canvas2DReset();
      canvasWebGL1and2Reset();
    };
  }
  startPendingCanvasMutationFlusher() {
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const setLatestRAFTimestamp = (timestamp) => {
      this.rafStamps.latestId = timestamp;
      requestAnimationFrame(setLatestRAFTimestamp);
    };
    requestAnimationFrame(setLatestRAFTimestamp);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach(
      (_values, canvas) => {
        const id = this.mirror.getId(canvas);
        this.flushPendingCanvasMutationFor(canvas, id);
      }
    );
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(canvas, id) {
    if (this.frozen || this.locked) {
      return;
    }
    const valuesWithType = this.pendingCanvasMutations.get(canvas);
    if (!valuesWithType || id === -1)
      return;
    const values = valuesWithType.map((value) => {
      const { type: type2, ...rest } = value;
      return rest;
    });
    const { type } = valuesWithType[0];
    this.mutationCb({ id, type, commands: values });
    this.pendingCanvasMutations.delete(canvas);
  }
};
var StylesheetManager = class {
  constructor(options) {
    __publicField(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet());
    __publicField(this, "mutationCb");
    __publicField(this, "adoptedStyleSheetCb");
    __publicField(this, "styleMirror", new StyleSheetMirror());
    this.mutationCb = options.mutationCb;
    this.adoptedStyleSheetCb = options.adoptedStyleSheetCb;
  }
  attachLinkElement(linkEl, childSn) {
    if ("_cssText" in childSn.attributes)
      this.mutationCb({
        adds: [],
        removes: [],
        texts: [],
        attributes: [
          {
            id: childSn.id,
            attributes: childSn.attributes
          }
        ]
      });
    this.trackLinkElement(linkEl);
  }
  trackLinkElement(linkEl) {
    if (this.trackedLinkElements.has(linkEl))
      return;
    this.trackedLinkElements.add(linkEl);
    this.trackStylesheetInLinkElement(linkEl);
  }
  adoptStyleSheets(sheets, hostId) {
    if (sheets.length === 0)
      return;
    const adoptedStyleSheetData = {
      id: hostId,
      styleIds: []
    };
    const styles = [];
    for (const sheet of sheets) {
      let styleId;
      if (!this.styleMirror.has(sheet)) {
        styleId = this.styleMirror.add(sheet);
        styles.push({
          styleId,
          rules: Array.from(sheet.rules || CSSRule, (r2, index2) => ({
            rule: stringifyRule(r2, sheet.href),
            index: index2
          }))
        });
      } else
        styleId = this.styleMirror.getId(sheet);
      adoptedStyleSheetData.styleIds.push(styleId);
    }
    if (styles.length > 0)
      adoptedStyleSheetData.styles = styles;
    this.adoptedStyleSheetCb(adoptedStyleSheetData);
  }
  reset() {
    this.styleMirror.reset();
    this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
  }
  // TODO: take snapshot on stylesheet reload by applying event listener
  trackStylesheetInLinkElement(_linkEl) {
  }
};
var ProcessedNodeManager = class {
  constructor() {
    __publicField(this, "nodeMap", /* @__PURE__ */ new WeakMap());
    __publicField(this, "active", false);
  }
  inOtherBuffer(node, thisBuffer) {
    const buffers = this.nodeMap.get(node);
    return buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer);
  }
  add(node, buffer) {
    if (!this.active) {
      this.active = true;
      requestAnimationFrame(() => {
        this.nodeMap = /* @__PURE__ */ new WeakMap();
        this.active = false;
      });
    }
    this.nodeMap.set(node, (this.nodeMap.get(node) || /* @__PURE__ */ new Set()).add(buffer));
  }
  destroy() {
  }
};
var wrappedEmit;
var takeFullSnapshot$1;
var canvasManager;
var recording = false;
try {
  if (Array.from([1], (x) => x * 2)[0] !== 2) {
    const cleanFrame = document.createElement("iframe");
    document.body.appendChild(cleanFrame);
    Array.from = ((_a = cleanFrame.contentWindow) == null ? void 0 : _a.Array.from) || Array.from;
    document.body.removeChild(cleanFrame);
  }
} catch (err) {
  console.debug("Unable to override Array.from", err);
}
var mirror = createMirror$2();
function record(options = {}) {
  var _a2, _b, _c, _d, _e, _f, _g, _h;
  const {
    emit,
    checkoutEveryNms,
    checkoutEveryNth,
    blockClass = "highlight-block",
    blockSelector = null,
    ignoreClass = "highlight-ignore",
    ignoreSelector = null,
    maskTextClass = "highlight-mask",
    maskTextSelector = null,
    inlineStylesheet = true,
    maskAllInputs,
    maskInputOptions: _maskInputOptions,
    slimDOMOptions: _slimDOMOptions,
    maskInputFn,
    maskTextFn = obfuscateText,
    hooks,
    packFn,
    sampling = {},
    mousemoveWait,
    recordDOM = true,
    recordCanvas = false,
    recordCrossOriginIframes = false,
    recordAfter = options.recordAfter === "DOMContentLoaded" ? options.recordAfter : "load",
    userTriggeredOnInput = false,
    collectFonts = false,
    inlineImages = false,
    plugins,
    keepIframeSrcFn = () => false,
    privacySetting = "default",
    ignoreCSSAttributes = /* @__PURE__ */ new Set([]),
    errorHandler: errorHandler2,
    logger
  } = options;
  const dataURLOptions = {
    ...options.dataURLOptions,
    ...(_b = (_a2 = options.sampling) == null ? void 0 : _a2.canvas) == null ? void 0 : _b.dataURLOptions
  };
  registerErrorHandler(errorHandler2);
  const inEmittingFrame = recordCrossOriginIframes ? window.parent === window : true;
  let passEmitsToParent = false;
  if (!inEmittingFrame) {
    try {
      if (window.parent.document) {
        passEmitsToParent = false;
      }
    } catch (e2) {
      passEmitsToParent = true;
    }
  }
  if (inEmittingFrame && !emit) {
    throw new Error("emit function is required");
  }
  if (!inEmittingFrame && !passEmitsToParent) {
    return () => {
    };
  }
  if (mousemoveWait !== void 0 && sampling.mousemove === void 0) {
    sampling.mousemove = mousemoveWait;
  }
  mirror.reset();
  const maskInputOptions = maskAllInputs === true ? {
    color: true,
    date: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
    textarea: true,
    select: true,
    password: true
  } : _maskInputOptions !== void 0 ? _maskInputOptions : { password: true };
  const slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === "all" ? {
    script: true,
    comment: true,
    headFavicon: true,
    headWhitespace: true,
    headMetaSocial: true,
    headMetaRobots: true,
    headMetaHttpEquiv: true,
    headMetaVerification: true,
    // the following are off for slimDOMOptions === true,
    // as they destroy some (hidden) info:
    headMetaAuthorship: _slimDOMOptions === "all",
    headMetaDescKeywords: _slimDOMOptions === "all",
    headTitleMutations: _slimDOMOptions === "all"
  } : _slimDOMOptions ? _slimDOMOptions : {};
  polyfill$1();
  let lastFullSnapshotEvent;
  let incrementalSnapshotCount = 0;
  const eventProcessor = (e2) => {
    for (const plugin of plugins || []) {
      if (plugin.eventProcessor) {
        e2 = plugin.eventProcessor(e2);
      }
    }
    if (packFn && // Disable packing events which will be emitted to parent frames.
    !passEmitsToParent) {
      e2 = packFn(e2);
    }
    return e2;
  };
  wrappedEmit = (r2, isCheckout) => {
    var _a3;
    const e2 = r2;
    e2.timestamp = nowTimestamp();
    if (((_a3 = mutationBuffers[0]) == null ? void 0 : _a3.isFrozen()) && e2.type !== EventType.FullSnapshot && !(e2.type === EventType.IncrementalSnapshot && e2.data.source === IncrementalSource.Mutation)) {
      mutationBuffers.forEach((buf) => buf.unfreeze());
    }
    if (inEmittingFrame) {
      emit == null ? void 0 : emit(eventProcessor(e2), isCheckout);
    } else if (passEmitsToParent) {
      const message = {
        type: "rrweb",
        event: eventProcessor(e2),
        origin: window.location.origin,
        isCheckout
      };
      window.parent.postMessage(message, "*");
    }
    if (e2.type === EventType.FullSnapshot) {
      lastFullSnapshotEvent = e2;
      incrementalSnapshotCount = 0;
    } else if (e2.type === EventType.IncrementalSnapshot) {
      if (e2.data.source === IncrementalSource.Mutation && e2.data.isAttachIframe) {
        return;
      }
      incrementalSnapshotCount++;
      const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
      const exceedTime = checkoutEveryNms && e2.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
      if (exceedCount || exceedTime) {
        takeFullSnapshot$1(true);
      }
    }
  };
  const wrappedMutationEmit = (m) => {
    wrappedEmit({
      type: EventType.IncrementalSnapshot,
      data: {
        source: IncrementalSource.Mutation,
        ...m
      }
    });
  };
  const wrappedScrollEmit = (p) => wrappedEmit({
    type: EventType.IncrementalSnapshot,
    data: {
      source: IncrementalSource.Scroll,
      ...p
    }
  });
  const wrappedCanvasMutationEmit = (p) => wrappedEmit({
    type: EventType.IncrementalSnapshot,
    data: {
      source: IncrementalSource.CanvasMutation,
      ...p
    }
  });
  const wrappedAdoptedStyleSheetEmit = (a2) => wrappedEmit({
    type: EventType.IncrementalSnapshot,
    data: {
      source: IncrementalSource.AdoptedStyleSheet,
      ...a2
    }
  });
  const stylesheetManager = new StylesheetManager({
    mutationCb: wrappedMutationEmit,
    adoptedStyleSheetCb: wrappedAdoptedStyleSheetEmit
  });
  const iframeManager = new IframeManager({
    mirror,
    mutationCb: wrappedMutationEmit,
    stylesheetManager,
    recordCrossOriginIframes,
    wrappedEmit
  });
  for (const plugin of plugins || []) {
    if (plugin.getMirror)
      plugin.getMirror({
        nodeMirror: mirror,
        crossOriginIframeMirror: iframeManager.crossOriginIframeMirror,
        crossOriginIframeStyleMirror: iframeManager.crossOriginIframeStyleMirror
      });
  }
  const processedNodeManager = new ProcessedNodeManager();
  canvasManager = new CanvasManager({
    recordCanvas,
    recordVideos: inlineImages,
    mutationCb: wrappedCanvasMutationEmit,
    win: window,
    blockClass,
    blockSelector,
    mirror,
    sampling: (_c = sampling == null ? void 0 : sampling.canvas) == null ? void 0 : _c.fps,
    samplingManual: (_d = sampling == null ? void 0 : sampling.canvas) == null ? void 0 : _d.fpsManual,
    clearWebGLBuffer: (_e = sampling == null ? void 0 : sampling.canvas) == null ? void 0 : _e.clearWebGLBuffer,
    initialSnapshotDelay: (_f = sampling == null ? void 0 : sampling.canvas) == null ? void 0 : _f.initialSnapshotDelay,
    dataURLOptions,
    resizeFactor: (_g = sampling == null ? void 0 : sampling.canvas) == null ? void 0 : _g.resizeFactor,
    maxSnapshotDimension: (_h = sampling == null ? void 0 : sampling.canvas) == null ? void 0 : _h.maxSnapshotDimension,
    logger
  });
  const shadowDomManager = new ShadowDomManager({
    mutationCb: wrappedMutationEmit,
    scrollCb: wrappedScrollEmit,
    bypassOptions: {
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      inlineStylesheet,
      maskInputOptions,
      dataURLOptions,
      maskTextFn,
      maskInputFn,
      recordCanvas,
      inlineImages,
      privacySetting,
      sampling,
      slimDOMOptions,
      iframeManager,
      stylesheetManager,
      canvasManager,
      keepIframeSrcFn,
      processedNodeManager
    },
    mirror
  });
  takeFullSnapshot$1 = (isCheckout = false) => {
    if (!recordDOM) {
      return;
    }
    wrappedEmit(
      {
        type: EventType.Meta,
        data: {
          href: window.location.href,
          width: getWindowWidth(),
          height: getWindowHeight()
        }
      },
      isCheckout
    );
    stylesheetManager.reset();
    shadowDomManager.init();
    mutationBuffers.forEach((buf) => buf.lock());
    const node = snapshot(document, {
      mirror,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      inlineStylesheet,
      maskAllInputs: maskInputOptions,
      maskTextFn,
      maskInputFn,
      slimDOM: slimDOMOptions,
      dataURLOptions,
      recordCanvas,
      inlineImages,
      privacySetting,
      onSerialize: (n2) => {
        if (isSerializedIframe(n2, mirror)) {
          iframeManager.addIframe(n2);
        }
        if (isSerializedStylesheet(n2, mirror)) {
          stylesheetManager.trackLinkElement(n2);
        }
        if (hasShadowRoot(n2)) {
          shadowDomManager.addShadowRoot(index.shadowRoot(n2), document);
        }
      },
      onIframeLoad: (iframe, childSn) => {
        iframeManager.attachIframe(iframe, childSn);
        shadowDomManager.observeAttachShadow(iframe);
      },
      onStylesheetLoad: (linkEl, childSn) => {
        stylesheetManager.attachLinkElement(linkEl, childSn);
      },
      keepIframeSrcFn
    });
    if (!node) {
      return console.warn("Failed to snapshot the document");
    }
    wrappedEmit(
      {
        type: EventType.FullSnapshot,
        data: {
          node,
          initialOffset: getWindowScroll(window)
        }
      },
      isCheckout
    );
    mutationBuffers.forEach((buf) => buf.unlock());
    if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0)
      stylesheetManager.adoptStyleSheets(
        document.adoptedStyleSheets,
        mirror.getId(document)
      );
  };
  try {
    const handlers = [];
    const observe = (doc) => {
      var _a3;
      return callbackWrapper(initObservers)(
        {
          mutationCb: wrappedMutationEmit,
          mousemoveCb: (positions, source) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source,
              positions
            }
          }),
          mouseInteractionCb: (d) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.MouseInteraction,
              ...d
            }
          }),
          scrollCb: wrappedScrollEmit,
          viewportResizeCb: (d) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.ViewportResize,
              ...d
            }
          }),
          inputCb: (v2) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.Input,
              ...v2
            }
          }),
          mediaInteractionCb: (p) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.MediaInteraction,
              ...p
            }
          }),
          styleSheetRuleCb: (r2) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.StyleSheetRule,
              ...r2
            }
          }),
          styleDeclarationCb: (r2) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.StyleDeclaration,
              ...r2
            }
          }),
          canvasMutationCb: wrappedCanvasMutationEmit,
          fontCb: (p) => wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.Font,
              ...p
            }
          }),
          selectionCb: (p) => {
            wrappedEmit({
              type: EventType.IncrementalSnapshot,
              data: {
                source: IncrementalSource.Selection,
                ...p
              }
            });
          },
          customElementCb: (c2) => {
            wrappedEmit({
              type: EventType.IncrementalSnapshot,
              data: {
                source: IncrementalSource.CustomElement,
                ...c2
              }
            });
          },
          blockClass,
          ignoreClass,
          ignoreSelector,
          maskTextClass,
          maskTextSelector,
          maskInputOptions,
          inlineStylesheet,
          sampling,
          recordDOM,
          recordCanvas,
          inlineImages,
          userTriggeredOnInput,
          collectFonts,
          doc,
          maskInputFn,
          maskTextFn,
          keepIframeSrcFn,
          blockSelector,
          slimDOMOptions,
          dataURLOptions,
          mirror,
          iframeManager,
          stylesheetManager,
          shadowDomManager,
          processedNodeManager,
          canvasManager,
          ignoreCSSAttributes,
          privacySetting,
          plugins: ((_a3 = plugins == null ? void 0 : plugins.filter((p) => p.observer)) == null ? void 0 : _a3.map((p) => ({
            observer: p.observer,
            options: p.options,
            callback: (payload) => wrappedEmit({
              type: EventType.Plugin,
              data: {
                plugin: p.name,
                payload
              }
            })
          }))) || []
        },
        hooks
      );
    };
    iframeManager.addLoadListener((iframeEl) => {
      try {
        handlers.push(observe(iframeEl.contentDocument));
      } catch (error) {
        console.warn(error);
      }
    });
    const init = () => {
      takeFullSnapshot$1();
      handlers.push(observe(document));
      recording = true;
    };
    if (document.readyState === "interactive" || document.readyState === "complete") {
      init();
    } else {
      handlers.push(
        on("DOMContentLoaded", () => {
          wrappedEmit({
            type: EventType.DomContentLoaded,
            data: {}
          });
          if (recordAfter === "DOMContentLoaded")
            init();
        })
      );
      handlers.push(
        on(
          "load",
          () => {
            wrappedEmit({
              type: EventType.Load,
              data: {}
            });
            if (recordAfter === "load")
              init();
          },
          window
        )
      );
    }
    return () => {
      handlers.forEach((h) => h());
      processedNodeManager.destroy();
      recording = false;
      unregisterErrorHandler();
    };
  } catch (error) {
    console.warn(error);
  }
}
record.addCustomEvent = (tag, payload) => {
  if (!recording) {
    return;
  }
  wrappedEmit({
    type: EventType.Custom,
    data: {
      tag,
      payload
    }
  });
};
record.freezePage = () => {
  mutationBuffers.forEach((buf) => buf.freeze());
};
record.takeFullSnapshot = (isCheckout) => {
  if (!recording) {
    throw new Error("please take full snapshot after start recording");
  }
  takeFullSnapshot$1(isCheckout);
};
record.snapshotCanvas = async (element) => {
  if (!canvasManager) {
    throw new Error("canvas manager is not initialized");
  }
  await canvasManager.snapshot(element);
};
record.mirror = mirror;
function mitt$1(n2) {
  return { all: n2 = n2 || /* @__PURE__ */ new Map(), on: function(t2, e2) {
    var i2 = n2.get(t2);
    i2 ? i2.push(e2) : n2.set(t2, [e2]);
  }, off: function(t2, e2) {
    var i2 = n2.get(t2);
    i2 && (e2 ? i2.splice(i2.indexOf(e2) >>> 0, 1) : n2.set(t2, []));
  }, emit: function(t2, e2) {
    var i2 = n2.get(t2);
    i2 && i2.slice().map(function(n3) {
      n3(e2);
    }), (i2 = n2.get("*")) && i2.slice().map(function(n3) {
      n3(t2, e2);
    });
  } };
}
var mittProxy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: mitt$1
}, Symbol.toStringTag, { value: "Module" }));
function polyfill(w = window, d = document) {
  if ("scrollBehavior" in d.documentElement.style && w.__forceSmoothScrollPolyfill__ !== true) {
    return;
  }
  const Element2 = w.HTMLElement || w.Element;
  const SCROLL_TIME = 468;
  const original = {
    scroll: w.scroll || w.scrollTo,
    scrollBy: w.scrollBy,
    elementScroll: Element2.prototype.scroll || scrollElement,
    scrollIntoView: Element2.prototype.scrollIntoView
  };
  const now = w.performance && w.performance.now ? w.performance.now.bind(w.performance) : Date.now;
  function isMicrosoftBrowser(userAgent) {
    const userAgentPatterns = ["MSIE ", "Trident/", "Edge/"];
    return new RegExp(userAgentPatterns.join("|")).test(userAgent);
  }
  const ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;
  function scrollElement(x, y) {
    this.scrollLeft = x;
    this.scrollTop = y;
  }
  function ease(k) {
    return 0.5 * (1 - Math.cos(Math.PI * k));
  }
  function shouldBailOut(firstArg) {
    if (firstArg === null || typeof firstArg !== "object" || firstArg.behavior === void 0 || firstArg.behavior === "auto" || firstArg.behavior === "instant") {
      return true;
    }
    if (typeof firstArg === "object" && firstArg.behavior === "smooth") {
      return false;
    }
    throw new TypeError(
      "behavior member of ScrollOptions " + firstArg.behavior + " is not a valid value for enumeration ScrollBehavior."
    );
  }
  function hasScrollableSpace(el, axis) {
    if (axis === "Y") {
      return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
    }
    if (axis === "X") {
      return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
    }
  }
  function canOverflow(el, axis) {
    const overflowValue = w.getComputedStyle(el, null)["overflow" + axis];
    return overflowValue === "auto" || overflowValue === "scroll";
  }
  function isScrollable(el) {
    const isScrollableY = hasScrollableSpace(el, "Y") && canOverflow(el, "Y");
    const isScrollableX = hasScrollableSpace(el, "X") && canOverflow(el, "X");
    return isScrollableY || isScrollableX;
  }
  function findScrollableParent(el) {
    while (el !== d.body && isScrollable(el) === false) {
      el = el.parentNode || el.host;
    }
    return el;
  }
  function step(context) {
    const time = now();
    let value;
    let currentX;
    let currentY;
    let elapsed = (time - context.startTime) / SCROLL_TIME;
    elapsed = elapsed > 1 ? 1 : elapsed;
    value = ease(elapsed);
    currentX = context.startX + (context.x - context.startX) * value;
    currentY = context.startY + (context.y - context.startY) * value;
    context.method.call(context.scrollable, currentX, currentY);
    if (currentX !== context.x || currentY !== context.y) {
      w.requestAnimationFrame(step.bind(w, context));
    }
  }
  function smoothScroll(el, x, y) {
    let scrollable;
    let startX;
    let startY;
    let method;
    const startTime = now();
    if (el === d.body) {
      scrollable = w;
      startX = w.scrollX || w.pageXOffset;
      startY = w.scrollY || w.pageYOffset;
      method = original.scroll;
    } else {
      scrollable = el;
      startX = el.scrollLeft;
      startY = el.scrollTop;
      method = scrollElement;
    }
    step({
      scrollable,
      method,
      startTime,
      startX,
      startY,
      x,
      y
    });
  }
  w.scroll = w.scrollTo = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      original.scroll.call(
        w,
        arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : w.scrollX || w.pageXOffset,
        // use top prop, second argument if present or fallback to scrollY
        arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : w.scrollY || w.pageYOffset
      );
      return;
    }
    smoothScroll.call(
      w,
      d.body,
      arguments[0].left !== void 0 ? ~~arguments[0].left : w.scrollX || w.pageXOffset,
      arguments[0].top !== void 0 ? ~~arguments[0].top : w.scrollY || w.pageYOffset
    );
  };
  w.scrollBy = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0])) {
      original.scrollBy.call(
        w,
        arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : 0,
        arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : 0
      );
      return;
    }
    smoothScroll.call(
      w,
      d.body,
      ~~arguments[0].left + (w.scrollX || w.pageXOffset),
      ~~arguments[0].top + (w.scrollY || w.pageYOffset)
    );
  };
  Element2.prototype.scroll = Element2.prototype.scrollTo = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      if (typeof arguments[0] === "number" && arguments[1] === void 0) {
        throw new SyntaxError("Value could not be converted");
      }
      original.elementScroll.call(
        this,
        // use left prop, first number argument or fallback to scrollLeft
        arguments[0].left !== void 0 ? ~~arguments[0].left : typeof arguments[0] !== "object" ? ~~arguments[0] : this.scrollLeft,
        // use top prop, second argument or fallback to scrollTop
        arguments[0].top !== void 0 ? ~~arguments[0].top : arguments[1] !== void 0 ? ~~arguments[1] : this.scrollTop
      );
      return;
    }
    const left = arguments[0].left;
    const top = arguments[0].top;
    smoothScroll.call(
      this,
      this,
      typeof left === "undefined" ? this.scrollLeft : ~~left,
      typeof top === "undefined" ? this.scrollTop : ~~top
    );
  };
  Element2.prototype.scrollBy = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      original.elementScroll.call(
        this,
        arguments[0].left !== void 0 ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft,
        arguments[0].top !== void 0 ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop
      );
      return;
    }
    this.scroll({
      left: ~~arguments[0].left + this.scrollLeft,
      top: ~~arguments[0].top + this.scrollTop,
      behavior: arguments[0].behavior
    });
  };
  Element2.prototype.scrollIntoView = function() {
    if (shouldBailOut(arguments[0]) === true) {
      original.scrollIntoView.call(
        this,
        arguments[0] === void 0 ? true : arguments[0]
      );
      return;
    }
    const scrollableParent = findScrollableParent(this);
    const parentRects = scrollableParent.getBoundingClientRect();
    const clientRects = this.getBoundingClientRect();
    if (scrollableParent !== d.body) {
      smoothScroll.call(
        this,
        scrollableParent,
        scrollableParent.scrollLeft + clientRects.left - parentRects.left,
        scrollableParent.scrollTop + clientRects.top - parentRects.top
      );
      if (w.getComputedStyle(scrollableParent).position !== "fixed") {
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: "smooth"
        });
      }
    } else {
      w.scrollBy({
        left: clientRects.left,
        top: clientRects.top,
        behavior: "smooth"
      });
    }
  };
}
var Timer = class {
  constructor(actions = [], config) {
    __publicField(this, "timeOffset", 0);
    __publicField(this, "speed");
    __publicField(this, "actions");
    __publicField(this, "raf", null);
    __publicField(this, "lastTimestamp");
    this.actions = actions;
    this.speed = config.speed;
  }
  /**
   * Add an action, possibly after the timer starts.
   */
  addAction(action) {
    const rafWasActive = this.raf === true;
    if (!this.actions.length || this.actions[this.actions.length - 1].delay <= action.delay) {
      this.actions.push(action);
    } else {
      const index2 = this.findActionIndex(action);
      this.actions.splice(index2, 0, action);
    }
    if (rafWasActive) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    }
  }
  /* Begin Highlight Code */
  /**
   * Add all actions before the timer starts
   */
  addActions(actions) {
    this.actions = this.actions.concat(actions);
  }
  replaceActions(actions) {
    this.actions.length = 0;
    this.actions.splice(0, 0, ...actions);
  }
  /* End Highlight Code */
  start() {
    this.timeOffset = 0;
    this.lastTimestamp = performance.now();
    this.raf = requestAnimationFrame(this.rafCheck.bind(this));
  }
  rafCheck() {
    const time = performance.now();
    this.timeOffset += (time - this.lastTimestamp) * this.speed;
    this.lastTimestamp = time;
    while (this.actions.length) {
      const action = this.actions[0];
      if (this.timeOffset >= action.delay) {
        this.actions.shift();
        action.doAction();
      } else {
        break;
      }
    }
    if (this.actions.length > 0) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    } else {
      this.raf = true;
    }
  }
  clear() {
    if (this.raf) {
      if (this.raf !== true) {
        cancelAnimationFrame(this.raf);
      }
      this.raf = null;
    }
    this.actions.length = 0;
  }
  setSpeed(speed) {
    this.speed = speed;
  }
  isActive() {
    return this.raf !== null;
  }
  findActionIndex(action) {
    let start = 0;
    let end = this.actions.length - 1;
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (this.actions[mid].delay < action.delay) {
        start = mid + 1;
      } else if (this.actions[mid].delay > action.delay) {
        end = mid - 1;
      } else {
        return mid + 1;
      }
    }
    return start;
  }
};
function addDelay(event, baselineTime) {
  if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions && event.data.positions.length) {
    const firstOffset = event.data.positions[0].timeOffset;
    const firstTimestamp = event.timestamp + firstOffset;
    event.delay = firstTimestamp - baselineTime;
    return firstTimestamp - baselineTime;
  }
  event.delay = event.timestamp - baselineTime;
  return event.delay;
}
function t(t2, n2) {
  var e2 = "function" == typeof Symbol && t2[Symbol.iterator];
  if (!e2)
    return t2;
  var r2, o2, i2 = e2.call(t2), a2 = [];
  try {
    for (; (void 0 === n2 || n2-- > 0) && !(r2 = i2.next()).done; )
      a2.push(r2.value);
  } catch (t3) {
    o2 = { error: t3 };
  } finally {
    try {
      r2 && !r2.done && (e2 = i2.return) && e2.call(i2);
    } finally {
      if (o2)
        throw o2.error;
    }
  }
  return a2;
}
var n;
!function(t2) {
  t2[t2.NotStarted = 0] = "NotStarted", t2[t2.Running = 1] = "Running", t2[t2.Stopped = 2] = "Stopped";
}(n || (n = {}));
var e = { type: "xstate.init" };
function r(t2) {
  return void 0 === t2 ? [] : [].concat(t2);
}
function o(t2) {
  return { type: "xstate.assign", assignment: t2 };
}
function i(t2, n2) {
  return "string" == typeof (t2 = "string" == typeof t2 && n2 && n2[t2] ? n2[t2] : t2) ? { type: t2 } : "function" == typeof t2 ? { type: t2.name, exec: t2 } : t2;
}
function a(t2) {
  return function(n2) {
    return t2 === n2;
  };
}
function u(t2) {
  return "string" == typeof t2 ? { type: t2 } : t2;
}
function c(t2, n2) {
  return { value: t2, context: n2, actions: [], changed: false, matches: a(t2) };
}
function f(t2, n2, e2) {
  var r2 = n2, o2 = false;
  return [t2.filter(function(t3) {
    if ("xstate.assign" === t3.type) {
      o2 = true;
      var n3 = Object.assign({}, r2);
      return "function" == typeof t3.assignment ? n3 = t3.assignment(r2, e2) : Object.keys(t3.assignment).forEach(function(o3) {
        n3[o3] = "function" == typeof t3.assignment[o3] ? t3.assignment[o3](r2, e2) : t3.assignment[o3];
      }), r2 = n3, false;
    }
    return true;
  }), r2, o2];
}
function s(n2, o2) {
  void 0 === o2 && (o2 = {});
  var s2 = t(f(r(n2.states[n2.initial].entry).map(function(t2) {
    return i(t2, o2.actions);
  }), n2.context, e), 2), l2 = s2[0], v2 = s2[1], y = { config: n2, _options: o2, initialState: { value: n2.initial, actions: l2, context: v2, matches: a(n2.initial) }, transition: function(e2, o3) {
    var s3, l3, v3 = "string" == typeof e2 ? { value: e2, context: n2.context } : e2, p = v3.value, g = v3.context, d = u(o3), x = n2.states[p];
    if (x.on) {
      var m = r(x.on[d.type]);
      try {
        for (var h = function(t2) {
          var n3 = "function" == typeof Symbol && Symbol.iterator, e3 = n3 && t2[n3], r2 = 0;
          if (e3)
            return e3.call(t2);
          if (t2 && "number" == typeof t2.length)
            return { next: function() {
              return t2 && r2 >= t2.length && (t2 = void 0), { value: t2 && t2[r2++], done: !t2 };
            } };
          throw new TypeError(n3 ? "Object is not iterable." : "Symbol.iterator is not defined.");
        }(m), b = h.next(); !b.done; b = h.next()) {
          var S = b.value;
          if (void 0 === S)
            return c(p, g);
          var w = "string" == typeof S ? { target: S } : S, j = w.target, E = w.actions, R = void 0 === E ? [] : E, N = w.cond, O = void 0 === j;
          if ((void 0 === N ? function() {
            return true;
          } : N)(g, d)) {
            var _ = n2.states[null != j ? j : p], k = t(f((O ? r(R) : [].concat(x.exit, R, _.entry).filter(function(t2) {
              return t2;
            })).map(function(t2) {
              return i(t2, y._options.actions);
            }), g, d), 3), T = k[0], q = k[1], z = k[2], A = null != j ? j : p;
            return { value: A, context: q, actions: T, changed: j !== p || T.length > 0 || z, matches: a(A) };
          }
        }
      } catch (t2) {
        s3 = { error: t2 };
      } finally {
        try {
          b && !b.done && (l3 = h.return) && l3.call(h);
        } finally {
          if (s3)
            throw s3.error;
        }
      }
    }
    return c(p, g);
  } };
  return y;
}
var l = function(t2, n2) {
  return t2.actions.forEach(function(e2) {
    var r2 = e2.exec;
    return r2 && r2(t2.context, n2);
  });
};
function v(t2) {
  var r2 = t2.initialState, o2 = n.NotStarted, i2 = /* @__PURE__ */ new Set(), c2 = { _machine: t2, send: function(e2) {
    o2 === n.Running && (r2 = t2.transition(r2, e2), l(r2, u(e2)), i2.forEach(function(t3) {
      return t3(r2);
    }));
  }, subscribe: function(t3) {
    return i2.add(t3), t3(r2), { unsubscribe: function() {
      return i2.delete(t3);
    } };
  }, start: function(i3) {
    if (i3) {
      var u2 = "object" == typeof i3 ? i3 : { context: t2.config.context, value: i3 };
      r2 = { value: u2.value, actions: [], context: u2.context, matches: a(u2.value) };
    }
    return o2 = n.Running, l(r2, e), c2;
  }, stop: function() {
    return o2 = n.Stopped, i2.clear(), c2;
  }, get state() {
    return r2;
  }, get status() {
    return o2;
  } };
  return c2;
}
function discardPriorSnapshots(events, baselineTime) {
  for (let idx = events.length - 1; idx >= 0; idx--) {
    const event = events[idx];
    if (event.type === EventType.Meta) {
      if (event.timestamp <= baselineTime) {
        return events.slice(idx);
      }
    }
  }
  return events;
}
function createPlayerService(context, { getCastFn, applyEventsSynchronously, emitter }) {
  const playerMachine = s(
    {
      id: "player",
      context,
      initial: "paused",
      states: {
        playing: {
          on: {
            PAUSE: {
              target: "paused",
              actions: ["pause"]
            },
            CAST_EVENT: {
              target: "playing",
              actions: "castEvent"
            },
            END: {
              target: "paused",
              actions: ["resetLastPlayedEvent", "pause"]
            },
            ADD_EVENT: {
              target: "playing",
              actions: ["addEvent"]
            },
            REPLACE_EVENTS: {
              target: "playing",
              actions: ["replaceEvents"]
            }
          }
        },
        paused: {
          on: {
            PLAY: {
              target: "playing",
              actions: ["recordTimeOffset", "play"]
            },
            CAST_EVENT: {
              target: "paused",
              actions: "castEvent"
            },
            TO_LIVE: {
              target: "live",
              actions: ["startLive"]
            },
            ADD_EVENT: {
              target: "paused",
              actions: ["addEvent"]
            },
            REPLACE_EVENTS: {
              target: "paused",
              actions: ["replaceEvents"]
            }
          }
        },
        live: {
          on: {
            ADD_EVENT: {
              target: "live",
              actions: ["addEvent"]
            },
            CAST_EVENT: {
              target: "live",
              actions: ["castEvent"]
            }
          }
        }
      }
    },
    {
      actions: {
        castEvent: o({
          lastPlayedEvent: (ctx, event) => {
            if (event.type === "CAST_EVENT") {
              return event.payload.event;
            }
            return ctx.lastPlayedEvent;
          }
        }),
        recordTimeOffset: o((ctx, event) => {
          let timeOffset = ctx.timeOffset;
          if ("payload" in event && "timeOffset" in event.payload) {
            timeOffset = event.payload.timeOffset;
          }
          return {
            ...ctx,
            timeOffset,
            baselineTime: ctx.events[0].timestamp + timeOffset
          };
        }),
        play(ctx) {
          var _a2;
          const { timer, events, baselineTime, lastPlayedEvent } = ctx;
          timer.clear();
          for (const event of events) {
            addDelay(event, baselineTime);
          }
          const neededEvents = discardPriorSnapshots(events, baselineTime);
          let lastPlayedTimestamp = lastPlayedEvent == null ? void 0 : lastPlayedEvent.timestamp;
          if ((lastPlayedEvent == null ? void 0 : lastPlayedEvent.type) === EventType.IncrementalSnapshot && lastPlayedEvent.data.source === IncrementalSource.MouseMove) {
            lastPlayedTimestamp = lastPlayedEvent.timestamp + ((_a2 = lastPlayedEvent.data.positions[0]) == null ? void 0 : _a2.timeOffset);
          }
          if (baselineTime < (lastPlayedTimestamp || 0)) {
            emitter.emit(ReplayerEvents.PlayBack);
          }
          const syncEvents = new Array();
          for (const event of neededEvents) {
            if (lastPlayedTimestamp && lastPlayedTimestamp < baselineTime && (event.timestamp <= lastPlayedTimestamp || event === lastPlayedEvent)) {
              continue;
            }
            if (event.timestamp < baselineTime) {
              syncEvents.push(event);
            } else {
              const castFn = getCastFn(event, false);
              timer.addAction({
                doAction: () => {
                  castFn();
                },
                delay: event.delay
              });
            }
          }
          applyEventsSynchronously(syncEvents);
          emitter.emit(ReplayerEvents.Flush);
          timer.start();
        },
        pause(ctx) {
          ctx.timer.clear();
        },
        resetLastPlayedEvent: o((ctx) => {
          return {
            ...ctx,
            lastPlayedEvent: null
          };
        }),
        startLive: o({
          baselineTime: (ctx, event) => {
            ctx.timer.start();
            if (event.type === "TO_LIVE" && event.payload.baselineTime) {
              return event.payload.baselineTime;
            }
            return Date.now();
          }
        }),
        /* Highlight Code Start */
        replaceEvents: o((ctx, machineEvent) => {
          const { events: curEvents, timer, baselineTime } = ctx;
          if (machineEvent.type === "REPLACE_EVENTS") {
            const { events: newEvents } = machineEvent.payload;
            curEvents.length = 0;
            const actions = [];
            for (const event of newEvents) {
              addDelay(event, baselineTime);
              curEvents.push(event);
              if (event.timestamp >= timer.timeOffset + baselineTime) {
                const castFn = getCastFn(event, false);
                actions.push({
                  doAction: () => {
                    castFn();
                  },
                  delay: event.delay
                });
              }
            }
            if (timer.isActive()) {
              timer.replaceActions(actions);
            }
          }
          return { ...ctx, events: curEvents };
        }),
        /* Highlight Code End */
        addEvent: o((ctx, machineEvent) => {
          const { baselineTime, timer, events } = ctx;
          if (machineEvent.type === "ADD_EVENT") {
            const { event } = machineEvent.payload;
            addDelay(event, baselineTime);
            let end = events.length - 1;
            if (!events[end] || events[end].timestamp <= event.timestamp) {
              events.push(event);
            } else {
              let insertionIndex = -1;
              let start = 0;
              while (start <= end) {
                const mid = Math.floor((start + end) / 2);
                if (events[mid].timestamp <= event.timestamp) {
                  start = mid + 1;
                } else {
                  end = mid - 1;
                }
              }
              if (insertionIndex === -1) {
                insertionIndex = start;
              }
              events.splice(insertionIndex, 0, event);
            }
            const isSync = event.timestamp < baselineTime;
            const castFn = getCastFn(event, isSync);
            if (isSync) {
              castFn();
            } else if (timer.isActive()) {
              timer.addAction({
                doAction: () => {
                  castFn();
                },
                delay: event.delay
              });
            }
          }
          return { ...ctx, events };
        })
      }
    }
  );
  return v(playerMachine);
}
function createSpeedService(context) {
  const speedMachine = s(
    {
      id: "speed",
      context,
      initial: "normal",
      states: {
        normal: {
          on: {
            FAST_FORWARD: {
              target: "skipping",
              actions: ["recordSpeed", "setSpeed"]
            },
            SET_SPEED: {
              target: "normal",
              actions: ["setSpeed"]
            }
          }
        },
        skipping: {
          on: {
            BACK_TO_NORMAL: {
              target: "normal",
              actions: ["restoreSpeed"]
            },
            SET_SPEED: {
              target: "normal",
              actions: ["setSpeed"]
            }
          }
        }
      }
    },
    {
      actions: {
        setSpeed: (ctx, event) => {
          if ("payload" in event) {
            ctx.timer.setSpeed(event.payload.speed);
          }
        },
        recordSpeed: o({
          normalSpeed: (ctx) => ctx.timer.speed
        }),
        restoreSpeed: (ctx) => {
          ctx.timer.setSpeed(ctx.normalSpeed);
        }
      }
    }
  );
  return v(speedMachine);
}
var rules = (blockClass) => [
  "noscript { display: none !important; }",
  `.${blockClass} { background: currentColor; border-radius: 5px; }`,
  `.${blockClass}:hover::after {content: 'Redacted'; color: white; background: black; text-align: center; width: 100%; display: block;}`
];
var webGLVarMap = /* @__PURE__ */ new Map();
function variableListFor(ctx, ctor) {
  let contextMap = webGLVarMap.get(ctx);
  if (!contextMap) {
    contextMap = /* @__PURE__ */ new Map();
    webGLVarMap.set(ctx, contextMap);
  }
  if (!contextMap.has(ctor)) {
    contextMap.set(ctor, []);
  }
  return contextMap.get(ctor);
}
function deserializeArg(imageMap, ctx, preload) {
  return async (arg) => {
    if (arg && typeof arg === "object" && "rr_type" in arg) {
      if (preload)
        preload.isUnchanged = false;
      if (arg.rr_type === "ImageBitmap" && "args" in arg) {
        const args = await deserializeArg(imageMap, ctx, preload)(arg.args);
        return await createImageBitmap.apply(null, args);
      } else if ("index" in arg) {
        if (preload || ctx === null)
          return arg;
        const { rr_type: name, index: index2 } = arg;
        return variableListFor(ctx, name)[index2];
      } else if ("args" in arg) {
        const { rr_type: name, args } = arg;
        const ctor = window[name];
        return new ctor(
          ...await Promise.all(
            args.map(deserializeArg(imageMap, ctx, preload))
          )
        );
      } else if ("base64" in arg) {
        return decode(arg.base64);
      } else if ("src" in arg) {
        const image = imageMap.get(arg.src);
        if (image) {
          return image;
        } else {
          const image2 = new Image();
          image2.src = arg.src;
          imageMap.set(arg.src, image2);
          return image2;
        }
      } else if ("data" in arg && arg.rr_type === "Blob") {
        const blobContents = await Promise.all(
          arg.data.map(deserializeArg(imageMap, ctx, preload))
        );
        const blob2 = new Blob(blobContents, {
          type: arg.type
        });
        return blob2;
      }
    } else if (Array.isArray(arg)) {
      const result = await Promise.all(
        arg.map(deserializeArg(imageMap, ctx, preload))
      );
      return result;
    }
    return arg;
  };
}
function getContext(target, type) {
  try {
    if (type === CanvasContext.WebGL) {
      return target.getContext("webgl") || target.getContext("experimental-webgl");
    }
    return target.getContext("webgl2");
  } catch (e2) {
    return null;
  }
}
var WebGLVariableConstructorsNames = [
  "WebGLActiveInfo",
  "WebGLBuffer",
  "WebGLFramebuffer",
  "WebGLProgram",
  "WebGLRenderbuffer",
  "WebGLShader",
  "WebGLShaderPrecisionFormat",
  "WebGLTexture",
  "WebGLUniformLocation",
  "WebGLVertexArrayObject"
];
function saveToWebGLVarMap(ctx, result) {
  if (!(result == null ? void 0 : result.constructor))
    return;
  const { name } = result.constructor;
  if (!WebGLVariableConstructorsNames.includes(name))
    return;
  const variables = variableListFor(ctx, name);
  if (!variables.includes(result))
    variables.push(result);
}
async function webglMutation({
  mutation,
  target,
  type,
  imageMap,
  errorHandler: errorHandler2
}) {
  try {
    const ctx = getContext(target, type);
    if (!ctx)
      return;
    if (mutation.setter) {
      ctx[mutation.property] = mutation.args[0];
      return;
    }
    const original = ctx[mutation.property];
    const args = await Promise.all(
      mutation.args.map(deserializeArg(imageMap, ctx))
    );
    const result = original.apply(ctx, args);
    saveToWebGLVarMap(ctx, result);
    const debugMode = false;
    if (debugMode)
      ;
  } catch (error) {
    errorHandler2(mutation, error);
  }
}
async function canvasMutation$1({
  event,
  mutations,
  target,
  imageMap,
  errorHandler: errorHandler2
}) {
  const ctx = target.getContext("2d");
  if (!ctx) {
    errorHandler2(mutations[0], new Error("Canvas context is null"));
    return;
  }
  const mutationArgsPromises = mutations.map(
    async (mutation) => {
      return Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
    }
  );
  const args = await Promise.all(mutationArgsPromises);
  args.forEach((args2, index2) => {
    const mutation = mutations[index2];
    try {
      if (mutation.setter) {
        ctx[mutation.property] = mutation.args[0];
        return;
      }
      const original = ctx[mutation.property];
      if (mutation.property === "drawImage" && typeof mutation.args[0] === "string") {
        imageMap.get(event);
        original.apply(ctx, mutation.args);
      } else {
        original.apply(ctx, args2);
      }
    } catch (error) {
      errorHandler2(mutation, error);
    }
    return;
  });
}
async function canvasMutation({
  event,
  mutation,
  target,
  imageMap,
  canvasEventMap,
  errorHandler: errorHandler2
}) {
  try {
    const precomputedMutation = canvasEventMap.get(event) || mutation;
    const commands = "commands" in precomputedMutation ? precomputedMutation.commands : [precomputedMutation];
    if ([CanvasContext.WebGL, CanvasContext.WebGL2].includes(mutation.type)) {
      for (let i2 = 0; i2 < commands.length; i2++) {
        const command = commands[i2];
        await webglMutation({
          mutation: command,
          type: mutation.type,
          target,
          imageMap,
          errorHandler: errorHandler2
        });
      }
      return;
    }
    await canvasMutation$1({
      event,
      mutations: commands,
      target,
      imageMap,
      errorHandler: errorHandler2
    });
  } catch (error) {
    errorHandler2(mutation, error);
  }
}
var MediaManager = class {
  constructor(options) {
    __publicField(this, "mediaMap", /* @__PURE__ */ new Map());
    __publicField(this, "warn");
    __publicField(this, "service");
    __publicField(this, "speedService");
    __publicField(this, "emitter");
    __publicField(this, "getCurrentTime");
    __publicField(this, "metadataCallbackMap", /* @__PURE__ */ new Map());
    this.warn = options.warn;
    this.service = options.service;
    this.speedService = options.speedService;
    this.emitter = options.emitter;
    this.getCurrentTime = options.getCurrentTime;
    this.emitter.on(ReplayerEvents.Start, this.start.bind(this));
    this.emitter.on(ReplayerEvents.SkipStart, this.start.bind(this));
    this.emitter.on(ReplayerEvents.Pause, this.pause.bind(this));
    this.emitter.on(ReplayerEvents.Finish, this.pause.bind(this));
    this.speedService.subscribe(() => {
      this.syncAllMediaElements();
    });
  }
  syncAllMediaElements(options = { pause: false }) {
    this.mediaMap.forEach((_mediaState, target) => {
      this.syncTargetWithState(target);
      if (options.pause) {
        target.pause();
      }
    });
  }
  start() {
    this.syncAllMediaElements();
  }
  pause() {
    this.syncAllMediaElements({ pause: true });
  }
  seekTo({
    time,
    target,
    mediaState
  }) {
    if (mediaState.isPlaying) {
      const differenceBetweenCurrentTimeAndMediaMutationTimestamp = time - mediaState.lastInteractionTimeOffset;
      const mediaPlaybackOffset = differenceBetweenCurrentTimeAndMediaMutationTimestamp / 1e3 * mediaState.playbackRate;
      const duration = "duration" in target && target.duration;
      if (Number.isNaN(duration)) {
        this.waitForMetadata(target);
        return;
      }
      let seekToTime = mediaState.currentTimeAtLastInteraction + mediaPlaybackOffset;
      if (target.loop && // RRMediaElement doesn't have a duration property
      duration !== false) {
        seekToTime = seekToTime % duration;
      }
      target.currentTime = seekToTime;
    } else {
      target.pause();
      target.currentTime = mediaState.currentTimeAtLastInteraction;
    }
  }
  waitForMetadata(target) {
    if (this.metadataCallbackMap.has(target))
      return;
    if (!("addEventListener" in target))
      return;
    const onLoadedMetadata = () => {
      this.metadataCallbackMap.delete(target);
      const mediaState = this.mediaMap.get(target);
      if (!mediaState)
        return;
      this.seekTo({
        time: this.getCurrentTime(),
        target,
        mediaState
      });
    };
    this.metadataCallbackMap.set(target, onLoadedMetadata);
    target.addEventListener("loadedmetadata", onLoadedMetadata, {
      once: true
    });
  }
  getMediaStateFromMutation({
    target,
    timeOffset,
    mutation
  }) {
    const lastState = this.mediaMap.get(target);
    const { type, playbackRate, currentTime, muted, volume, loop } = mutation;
    const isPlaying = type === MediaInteractions.Play || type !== MediaInteractions.Pause && ((lastState == null ? void 0 : lastState.isPlaying) || target.getAttribute("autoplay") !== null);
    const mediaState = {
      isPlaying,
      currentTimeAtLastInteraction: currentTime ?? (lastState == null ? void 0 : lastState.currentTimeAtLastInteraction) ?? 0,
      lastInteractionTimeOffset: timeOffset,
      playbackRate: playbackRate ?? (lastState == null ? void 0 : lastState.playbackRate) ?? 1,
      volume: volume ?? (lastState == null ? void 0 : lastState.volume) ?? 1,
      muted: muted ?? (lastState == null ? void 0 : lastState.muted) ?? target.getAttribute("muted") === null,
      loop: loop ?? (lastState == null ? void 0 : lastState.loop) ?? target.getAttribute("loop") === null
    };
    return mediaState;
  }
  syncTargetWithState(target) {
    const mediaState = this.mediaMap.get(target);
    if (!mediaState)
      return;
    const { muted, loop, volume, isPlaying } = mediaState;
    const playerIsPaused = this.service.state.matches("paused");
    const playbackRate = mediaState.playbackRate * this.speedService.state.context.timer.speed;
    try {
      this.seekTo({
        time: this.getCurrentTime(),
        target,
        mediaState
      });
      if (target.volume !== volume) {
        target.volume = volume;
      }
      target.muted = muted;
      target.loop = loop;
      if (target.playbackRate !== playbackRate) {
        target.playbackRate = playbackRate;
      }
      if (isPlaying && !playerIsPaused) {
        void target.play();
      } else {
        target.pause();
      }
    } catch (error) {
      this.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
        `Failed to replay media interactions: ${error.message || error}`
      );
    }
  }
  addMediaElements(node, timeOffset, mirror2) {
    if (!["AUDIO", "VIDEO"].includes(node.nodeName))
      return;
    const target = node;
    const serializedNode = mirror2.getMeta(target);
    if (!serializedNode || !("attributes" in serializedNode))
      return;
    const playerIsPaused = this.service.state.matches("paused");
    const mediaAttributes = serializedNode.attributes;
    let isPlaying = false;
    if (mediaAttributes.rr_mediaState) {
      isPlaying = mediaAttributes.rr_mediaState === "played";
    } else {
      isPlaying = target.getAttribute("autoplay") !== null;
    }
    if (isPlaying && playerIsPaused)
      target.pause();
    let playbackRate = 1;
    if (typeof mediaAttributes.rr_mediaPlaybackRate === "number") {
      playbackRate = mediaAttributes.rr_mediaPlaybackRate;
    }
    let muted = false;
    if (typeof mediaAttributes.rr_mediaMuted === "boolean") {
      muted = mediaAttributes.rr_mediaMuted;
    } else {
      muted = target.getAttribute("muted") !== null;
    }
    let loop = false;
    if (typeof mediaAttributes.rr_mediaLoop === "boolean") {
      loop = mediaAttributes.rr_mediaLoop;
    } else {
      loop = target.getAttribute("loop") !== null;
    }
    let volume = 1;
    if (typeof mediaAttributes.rr_mediaVolume === "number") {
      volume = mediaAttributes.rr_mediaVolume;
    }
    let currentTimeAtLastInteraction = 0;
    if (typeof mediaAttributes.rr_mediaCurrentTime === "number") {
      currentTimeAtLastInteraction = mediaAttributes.rr_mediaCurrentTime;
    }
    this.mediaMap.set(target, {
      isPlaying,
      currentTimeAtLastInteraction,
      lastInteractionTimeOffset: timeOffset,
      playbackRate,
      volume,
      muted,
      loop
    });
    this.syncTargetWithState(target);
  }
  mediaMutation({
    target,
    timeOffset,
    mutation
  }) {
    this.mediaMap.set(
      target,
      this.getMediaStateFromMutation({
        target,
        timeOffset,
        mutation
      })
    );
    this.syncTargetWithState(target);
  }
  isSupportedMediaElement(node) {
    return ["AUDIO", "VIDEO"].includes(node.nodeName);
  }
  reset() {
    this.mediaMap.clear();
  }
};
function applyDialogToTopLevel(node, attributeMutation) {
  if (node.nodeName !== "DIALOG" || node instanceof BaseRRNode)
    return;
  const dialog = node;
  const oldIsOpen = dialog.open;
  const oldIsModalState = oldIsOpen && dialog.matches("dialog:modal");
  const rrOpenMode = dialog.getAttribute("rr_open_mode");
  const newIsOpen = typeof (attributeMutation == null ? void 0 : attributeMutation.attributes.open) === "string" || typeof dialog.getAttribute("open") === "string";
  const newIsModalState = rrOpenMode === "modal";
  const newIsNonModalState = rrOpenMode === "non-modal";
  const modalStateChanged = oldIsModalState && newIsNonModalState || !oldIsModalState && newIsModalState;
  if (oldIsOpen && !modalStateChanged)
    return;
  if (!dialog.isConnected) {
    console.warn("dialog is not attached to the dom", dialog);
    return;
  }
  if (oldIsOpen)
    dialog.close();
  if (!newIsOpen)
    return;
  if (newIsModalState)
    dialog.showModal();
  else
    dialog.show();
}
function removeDialogFromTopLevel(node, attributeMutation) {
  if (node.nodeName !== "DIALOG" || node instanceof BaseRRNode)
    return;
  const dialog = node;
  if (!dialog.isConnected) {
    console.warn("dialog is not attached to the dom", dialog);
    return;
  }
  if (attributeMutation.attributes.open === null) {
    dialog.removeAttribute("open");
    dialog.removeAttribute("rr_open_mode");
  }
}
var SKIP_TIME_INTERVAL = 5 * 1e3;
var SKIP_TIME_MIN = 1 * 1e3;
var SKIP_DURATION_LIMIT = 60 * 60 * 1e3;
var mitt = mitt$1 || mittProxy;
var REPLAY_CONSOLE_PREFIX = "[replayer]";
var defaultMouseTailConfig = {
  duration: 500,
  lineCap: "round",
  lineWidth: 3,
  strokeStyle: "red"
};
function indicatesTouchDevice(e2) {
  return e2.type == EventType.IncrementalSnapshot && (e2.data.source == IncrementalSource.TouchMove || e2.data.source == IncrementalSource.MouseInteraction && e2.data.type == MouseInteractions.TouchStart);
}
var Replayer = class {
  constructor(events, config) {
    __publicField(this, "wrapper");
    __publicField(this, "iframe");
    __publicField(this, "service");
    __publicField(this, "speedService");
    __publicField(this, "config");
    __publicField(this, "usingVirtualDom", false);
    __publicField(this, "virtualDom", new RRDocument());
    __publicField(this, "mouse");
    __publicField(this, "mouseTail", null);
    __publicField(this, "tailPositions", []);
    __publicField(this, "emitter", mitt());
    __publicField(this, "nextUserInteractionEvent");
    __publicField(this, "activityIntervals", []);
    __publicField(this, "inactiveEndTimestamp");
    __publicField(this, "legacy_missingNodeRetryMap", {});
    __publicField(this, "cache", createCache());
    __publicField(this, "imageMap", /* @__PURE__ */ new Map());
    __publicField(this, "canvasEventMap", /* @__PURE__ */ new Map());
    __publicField(this, "mirror", createMirror$2());
    __publicField(this, "styleMirror", new StyleSheetMirror());
    __publicField(this, "mediaManager");
    __publicField(this, "firstFullSnapshot", null);
    __publicField(this, "newDocumentQueue", []);
    __publicField(this, "mousePos", null);
    __publicField(this, "touchActive", null);
    __publicField(this, "lastMouseDownEvent", null);
    __publicField(this, "lastHoveredRootNode");
    __publicField(this, "lastSelectionData", null);
    __publicField(this, "constructedStyleMutations", []);
    __publicField(this, "adoptedStyleSheets", []);
    __publicField(this, "handleResize", (dimension) => {
      this.iframe.style.display = "inherit";
      for (const el of [this.mouseTail, this.iframe]) {
        if (!el) {
          continue;
        }
        el.setAttribute("width", String(dimension.width));
        el.setAttribute("height", String(dimension.height));
      }
    });
    __publicField(this, "applyEventsSynchronously", (events2) => {
      for (const event of events2) {
        switch (event.type) {
          case EventType.DomContentLoaded:
          case EventType.Load:
          case EventType.Custom:
            continue;
          case EventType.FullSnapshot:
          case EventType.Meta:
          case EventType.Plugin:
          case EventType.IncrementalSnapshot:
            break;
        }
        const castFn = this.getCastFn(event, true);
        castFn();
      }
    });
    __publicField(this, "getCastFn", (event, isSync = false) => {
      let castFn;
      switch (event.type) {
        case EventType.DomContentLoaded:
        case EventType.Load:
          break;
        case EventType.Custom:
          castFn = () => {
            this.emitter.emit(ReplayerEvents.CustomEvent, event);
          };
          break;
        case EventType.Meta:
          castFn = () => this.emitter.emit(ReplayerEvents.Resize, {
            width: event.data.width,
            height: event.data.height
          });
          break;
        case EventType.FullSnapshot:
          castFn = () => {
            var _a2;
            if (this.firstFullSnapshot) {
              if (this.firstFullSnapshot === event) {
                this.firstFullSnapshot = true;
                return;
              }
            } else {
              this.firstFullSnapshot = true;
            }
            this.mediaManager.reset();
            this.styleMirror.reset();
            this.rebuildFullSnapshot(event, isSync);
            (_a2 = this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo(event.data.initialOffset);
          };
          break;
        case EventType.IncrementalSnapshot:
          castFn = () => {
            this.applyIncremental(event, isSync);
            if (isSync) {
              return;
            }
            this.handleInactivity(event.timestamp);
            if (event === this.nextUserInteractionEvent) {
              this.nextUserInteractionEvent = null;
              this.backToNormal();
            }
            if (this.config.skipInactive && !this.nextUserInteractionEvent) {
              for (const _event of this.service.state.context.events) {
                if (_event.timestamp <= event.timestamp) {
                  continue;
                }
                if (this.isUserInteraction(_event)) {
                  if (
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    _event.delay - event.delay > this.config.inactivePeriodThreshold * this.speedService.state.context.timer.speed
                  ) {
                    this.nextUserInteractionEvent = _event;
                  }
                  break;
                }
              }
              if (this.nextUserInteractionEvent) {
                const skipTime = (
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  this.nextUserInteractionEvent.delay - event.delay
                );
                const payload = {
                  speed: Math.min(
                    Math.round(skipTime / SKIP_TIME_INTERVAL),
                    this.config.maxSpeed
                  )
                };
                this.speedService.send({ type: "FAST_FORWARD", payload });
                this.emitter.emit(ReplayerEvents.SkipStart, payload);
              }
            }
          };
          break;
      }
      const wrappedCastFn = () => {
        if (castFn) {
          castFn();
        }
        for (const plugin of this.config.plugins || []) {
          if (plugin.handler)
            plugin.handler(event, isSync, { replayer: this });
        }
        this.service.send({ type: "CAST_EVENT", payload: { event } });
        const last_index = this.service.state.context.events.length - 1;
        if (!this.config.liveMode && event === this.service.state.context.events[last_index]) {
          const finish = () => {
            if (last_index < this.service.state.context.events.length - 1) {
              return;
            }
            this.backToNormal();
            this.service.send("END");
            this.emitter.emit(ReplayerEvents.Finish);
          };
          let finish_buffer = 50;
          if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions.length) {
            finish_buffer += Math.max(0, -event.data.positions[0].timeOffset);
          }
          setTimeout(finish, finish_buffer);
        }
        this.emitter.emit(ReplayerEvents.EventCast, event);
      };
      return wrappedCastFn;
    });
    if (!(config == null ? void 0 : config.liveMode) && events.length < 2) {
      throw new Error("Replayer need at least 2 events.");
    }
    const defaultConfig = {
      speed: 1,
      maxSpeed: 360,
      root: document.body,
      loadTimeout: 0,
      skipInactive: false,
      inactivePeriodThreshold: 10 * 1e3,
      showWarning: true,
      showDebug: false,
      blockClass: "highlight-block",
      liveMode: false,
      insertStyleRules: [],
      triggerFocus: true,
      UNSAFE_replayCanvas: false,
      pauseAnimation: true,
      mouseTail: defaultMouseTailConfig,
      useVirtualDom: true,
      // Virtual-dom optimization is enabled by default.
      logger: console,
      inactiveThreshold: 0.02,
      inactiveSkipTime: SKIP_TIME_INTERVAL
    };
    this.config = Object.assign({}, defaultConfig, config);
    this.handleResize = this.handleResize.bind(this);
    this.getCastFn = this.getCastFn.bind(this);
    this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this);
    this.emitter.on(ReplayerEvents.Resize, this.handleResize);
    this.setupDom();
    for (const plugin of this.config.plugins || []) {
      if (plugin.getMirror)
        plugin.getMirror({ nodeMirror: this.mirror });
    }
    this.emitter.on(ReplayerEvents.Flush, () => {
      if (this.usingVirtualDom) {
        const replayerHandler = {
          mirror: this.mirror,
          applyCanvas: (canvasEvent, canvasMutationData, target) => {
            void canvasMutation({
              event: canvasEvent,
              mutation: canvasMutationData,
              target,
              imageMap: this.imageMap,
              canvasEventMap: this.canvasEventMap,
              errorHandler: this.warnCanvasMutationFailed.bind(this)
            });
          },
          applyInput: this.applyInput.bind(this),
          applyScroll: this.applyScroll.bind(this),
          applyStyleSheetMutation: (data, styleSheet) => {
            if (data.source === IncrementalSource.StyleSheetRule)
              this.applyStyleSheetRule(data, styleSheet);
            else if (data.source === IncrementalSource.StyleDeclaration)
              this.applyStyleDeclaration(data, styleSheet);
          },
          afterAppend: (node, id) => {
            for (const plugin of this.config.plugins || []) {
              if (plugin.onBuild)
                plugin.onBuild(node, { id, replayer: this });
            }
          }
        };
        if (this.iframe.contentDocument)
          try {
            diff(
              this.iframe.contentDocument,
              this.virtualDom,
              replayerHandler,
              this.virtualDom.mirror
            );
          } catch (e2) {
            console.warn(e2);
          }
        this.virtualDom.destroyTree();
        this.usingVirtualDom = false;
        if (Object.keys(this.legacy_missingNodeRetryMap).length) {
          for (const key in this.legacy_missingNodeRetryMap) {
            try {
              const value = this.legacy_missingNodeRetryMap[key];
              const realNode = createOrGetNode(
                value.node,
                this.mirror,
                this.virtualDom.mirror
              );
              diff(
                realNode,
                value.node,
                replayerHandler,
                this.virtualDom.mirror
              );
              value.node = realNode;
            } catch (error) {
              this.warn(error);
            }
          }
        }
        this.constructedStyleMutations.forEach((data) => {
          this.applyStyleSheetMutation(data);
        });
        this.constructedStyleMutations = [];
        this.adoptedStyleSheets.forEach((data) => {
          this.applyAdoptedStyleSheet(data);
        });
        this.adoptedStyleSheets = [];
      }
      if (this.mousePos) {
        this.moveAndHover(
          this.mousePos.x,
          this.mousePos.y,
          this.mousePos.id,
          true,
          this.mousePos.debugData
        );
        this.mousePos = null;
      }
      if (this.touchActive === true) {
        this.mouse.classList.add("touch-active");
      } else if (this.touchActive === false) {
        this.mouse.classList.remove("touch-active");
      }
      this.touchActive = null;
      if (this.lastMouseDownEvent) {
        const [target, event] = this.lastMouseDownEvent;
        target.dispatchEvent(event);
      }
      this.lastMouseDownEvent = null;
      if (this.lastSelectionData) {
        this.applySelection(this.lastSelectionData);
        this.lastSelectionData = null;
      }
    });
    this.emitter.on(ReplayerEvents.PlayBack, () => {
      this.firstFullSnapshot = null;
      this.mirror.reset();
      this.styleMirror.reset();
      this.mediaManager.reset();
    });
    const timer = new Timer([], {
      speed: this.config.speed
    });
    this.service = createPlayerService(
      {
        events: events.map((e2) => {
          if (config && config.unpackFn) {
            return config.unpackFn(e2);
          }
          return e2;
        }).sort((a1, a2) => a1.timestamp - a2.timestamp),
        timer,
        timeOffset: 0,
        baselineTime: 0,
        lastPlayedEvent: null
      },
      {
        getCastFn: this.getCastFn,
        applyEventsSynchronously: this.applyEventsSynchronously,
        emitter: this.emitter
      }
    );
    this.service.start();
    this.service.subscribe((state) => {
      this.emitter.emit(ReplayerEvents.StateChange, {
        player: state
      });
    });
    this.speedService = createSpeedService({
      normalSpeed: -1,
      timer
    });
    this.speedService.start();
    this.speedService.subscribe((state) => {
      this.emitter.emit(ReplayerEvents.StateChange, {
        speed: state
      });
    });
    this.mediaManager = new MediaManager({
      warn: this.warn.bind(this),
      service: this.service,
      speedService: this.speedService,
      emitter: this.emitter,
      getCurrentTime: this.getCurrentTime.bind(this)
    });
    const firstMeta = this.service.state.context.events.find(
      (e2) => e2.type === EventType.Meta
    );
    const firstFullsnapshot = this.service.state.context.events.find(
      (e2) => e2.type === EventType.FullSnapshot
    );
    if (firstMeta) {
      const { width, height } = firstMeta.data;
      setTimeout(() => {
        this.emitter.emit(ReplayerEvents.Resize, {
          width,
          height
        });
      }, 0);
    }
    if (firstFullsnapshot) {
      setTimeout(() => {
        var _a2;
        if (this.firstFullSnapshot) {
          return;
        }
        this.firstFullSnapshot = firstFullsnapshot;
        this.rebuildFullSnapshot(
          firstFullsnapshot
        );
        (_a2 = this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo(
          firstFullsnapshot.data.initialOffset
        );
      }, 1);
    }
    if (this.service.state.context.events.find(indicatesTouchDevice)) {
      this.mouse.classList.add("touch-device");
    }
  }
  get timer() {
    return this.service.state.context.timer;
  }
  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }
  off(event, handler) {
    this.emitter.off(event, handler);
    return this;
  }
  setConfig(config) {
    Object.keys(config).forEach((key) => {
      config[key];
      this.config[key] = config[key];
    });
    if (!this.config.skipInactive) {
      this.backToNormal();
    }
    if (typeof config.speed !== "undefined") {
      this.speedService.send({
        type: "SET_SPEED",
        payload: {
          speed: config.speed
        }
      });
    }
    if (typeof config.mouseTail !== "undefined") {
      if (config.mouseTail === false) {
        if (this.mouseTail) {
          this.mouseTail.style.display = "none";
        }
      } else {
        if (!this.mouseTail) {
          this.mouseTail = document.createElement("canvas");
          this.mouseTail.width = Number.parseFloat(this.iframe.width);
          this.mouseTail.height = Number.parseFloat(this.iframe.height);
          this.mouseTail.classList.add("replayer-mouse-tail");
          this.wrapper.insertBefore(this.mouseTail, this.iframe);
        }
        this.mouseTail.style.display = "inherit";
      }
    }
  }
  /* Start Highlight Code */
  getActivityIntervals() {
    if (this.activityIntervals.length == 0) {
      const allIntervals = [];
      const metadata = this.getMetaData();
      const userInteractionEvents = [
        { timestamp: metadata.startTime },
        ...this.service.state.context.events.filter(
          (ev) => this.isUserInteraction(ev)
        ),
        { timestamp: metadata.endTime }
      ];
      for (let i2 = 1; i2 < userInteractionEvents.length; i2++) {
        const currentInterval2 = userInteractionEvents[i2 - 1];
        const _event = userInteractionEvents[i2];
        if (_event.timestamp - currentInterval2.timestamp > this.config.inactivePeriodThreshold) {
          allIntervals.push({
            startTime: currentInterval2.timestamp,
            endTime: _event.timestamp,
            duration: _event.timestamp - currentInterval2.timestamp,
            active: false
          });
        } else {
          allIntervals.push({
            startTime: currentInterval2.timestamp,
            endTime: _event.timestamp,
            duration: _event.timestamp - currentInterval2.timestamp,
            active: true
          });
        }
      }
      const mergedIntervals = [];
      let currentInterval = allIntervals[0];
      for (let i2 = 1; i2 < allIntervals.length; i2++) {
        if (allIntervals[i2].active != allIntervals[i2 - 1].active) {
          mergedIntervals.push({
            startTime: currentInterval.startTime,
            endTime: allIntervals[i2 - 1].endTime,
            duration: allIntervals[i2 - 1].endTime - currentInterval.startTime,
            active: allIntervals[i2 - 1].active
          });
          currentInterval = allIntervals[i2];
        }
      }
      if (currentInterval && allIntervals.length > 0) {
        mergedIntervals.push({
          startTime: currentInterval.startTime,
          endTime: allIntervals[allIntervals.length - 1].endTime,
          duration: allIntervals[allIntervals.length - 1].endTime - currentInterval.startTime,
          active: allIntervals[allIntervals.length - 1].active
        });
      }
      currentInterval = mergedIntervals[0];
      for (let i2 = 1; i2 < mergedIntervals.length; i2++) {
        if (!mergedIntervals[i2].active && mergedIntervals[i2].duration > this.config.inactiveThreshold * metadata.totalTime || !mergedIntervals[i2 - 1].active && mergedIntervals[i2 - 1].duration > this.config.inactiveThreshold * metadata.totalTime) {
          this.activityIntervals.push({
            startTime: currentInterval.startTime,
            endTime: mergedIntervals[i2 - 1].endTime,
            duration: mergedIntervals[i2 - 1].endTime - currentInterval.startTime,
            active: mergedIntervals[i2 - 1].active
          });
          currentInterval = mergedIntervals[i2];
        }
      }
      if (currentInterval && mergedIntervals.length > 0) {
        this.activityIntervals.push({
          startTime: currentInterval.startTime,
          endTime: mergedIntervals[mergedIntervals.length - 1].endTime,
          duration: mergedIntervals[mergedIntervals.length - 1].endTime - currentInterval.startTime,
          active: mergedIntervals[mergedIntervals.length - 1].active
        });
      }
    }
    return this.activityIntervals;
  }
  /* End Highlight Code */
  getMetaData() {
    const firstEvent = this.service.state.context.events[0];
    const lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
    return {
      startTime: firstEvent.timestamp,
      endTime: lastEvent.timestamp,
      totalTime: lastEvent.timestamp - firstEvent.timestamp
    };
  }
  /**
   * Get the actual time offset the player is at now compared to the first event.
   */
  getCurrentTime() {
    return this.timer.timeOffset + this.getTimeOffset();
  }
  /**
   * Get the time offset the player is at now compared to the first event, but without regard for the timer.
   */
  getTimeOffset() {
    const { baselineTime, events } = this.service.state.context;
    return baselineTime - events[0].timestamp;
  }
  getMirror() {
    return this.mirror;
  }
  /**
   * This API was designed to be used as play at any time offset.
   * Since we minimized the data collected from recorder, we do not
   * have the ability of undo an event.
   * So the implementation of play at any time offset will always iterate
   * all of the events, cast event before the offset synchronously
   * and cast event after the offset asynchronously with timer.
   * @param timeOffset - number
   */
  play(timeOffset = 0) {
    var _a2, _b;
    if (this.service.state.matches("paused")) {
      this.service.send({ type: "PLAY", payload: { timeOffset } });
    } else {
      this.service.send({ type: "PAUSE" });
      this.service.send({ type: "PLAY", payload: { timeOffset } });
    }
    (_b = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.getElementsByTagName("html")[0]) == null ? void 0 : _b.classList.remove("rrweb-paused");
    this.emitter.emit(ReplayerEvents.Start);
  }
  pause(timeOffset) {
    var _a2, _b;
    if (timeOffset === void 0 && this.service.state.matches("playing")) {
      this.service.send({ type: "PAUSE" });
    }
    if (typeof timeOffset === "number") {
      this.play(timeOffset);
      this.service.send({ type: "PAUSE" });
    }
    (_b = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.getElementsByTagName("html")[0]) == null ? void 0 : _b.classList.add("rrweb-paused");
    this.emitter.emit(ReplayerEvents.Pause);
  }
  resume(timeOffset = 0) {
    this.warn(
      `The 'resume' was deprecated in 1.0. Please use 'play' method which has the same interface.`
    );
    this.play(timeOffset);
    this.emitter.emit(ReplayerEvents.Resume);
  }
  /**
   * Totally destroy this replayer and please be careful that this operation is irreversible.
   * Memory occupation can be released by removing all references to this replayer.
   */
  destroy() {
    this.pause();
    this.mirror.reset();
    this.styleMirror.reset();
    this.mediaManager.reset();
    this.config.root.removeChild(this.wrapper);
    this.emitter.emit(ReplayerEvents.Destroy);
  }
  startLive(baselineTime) {
    this.service.send({ type: "TO_LIVE", payload: { baselineTime } });
  }
  addEvent(rawEvent) {
    const event = this.config.unpackFn ? this.config.unpackFn(rawEvent) : rawEvent;
    if (indicatesTouchDevice(event)) {
      this.mouse.classList.add("touch-device");
    }
    void Promise.resolve().then(
      () => this.service.send({ type: "ADD_EVENT", payload: { event } })
    );
  }
  replaceEvents(events) {
    for (const event of events) {
      if (indicatesTouchDevice(event)) {
        this.mouse.classList.add("touch-device");
        break;
      }
    }
    this.service.send({ type: "REPLACE_EVENTS", payload: { events } });
  }
  enableInteract() {
    this.iframe.setAttribute("scrolling", "auto");
    this.iframe.style.pointerEvents = "auto";
  }
  disableInteract() {
    this.iframe.setAttribute("scrolling", "no");
    this.iframe.style.pointerEvents = "none";
  }
  /**
   * Empties the replayer's cache and reclaims memory.
   * The replayer will use this cache to speed up the playback.
   */
  resetCache() {
    this.cache = createCache();
  }
  setupDom() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("replayer-wrapper");
    this.config.root.appendChild(this.wrapper);
    this.mouse = document.createElement("div");
    this.mouse.classList.add("replayer-mouse");
    this.wrapper.appendChild(this.mouse);
    if (this.config.mouseTail !== false) {
      this.mouseTail = document.createElement("canvas");
      this.mouseTail.classList.add("replayer-mouse-tail");
      this.mouseTail.style.display = "inherit";
      this.wrapper.appendChild(this.mouseTail);
    }
    this.iframe = document.createElement("iframe");
    const attributes = ["allow-same-origin"];
    if (this.config.UNSAFE_replayCanvas) {
      attributes.push("allow-scripts");
    }
    this.iframe.style.display = "none";
    this.iframe.setAttribute("sandbox", attributes.join(" "));
    this.disableInteract();
    this.wrapper.appendChild(this.iframe);
    if (this.iframe.contentWindow && this.iframe.contentDocument) {
      polyfill(
        this.iframe.contentWindow,
        this.iframe.contentDocument
      );
      polyfill$1(this.iframe.contentWindow);
    }
  }
  /* Start of Highlight Code */
  handleInactivity(timestamp, resetNext) {
    if (timestamp === this.inactiveEndTimestamp || resetNext) {
      this.inactiveEndTimestamp = null;
      this.backToNormal();
    }
    if (this.config.skipInactive && !this.inactiveEndTimestamp) {
      for (const interval of this.getActivityIntervals()) {
        if (timestamp >= interval.startTime && timestamp < interval.endTime && !interval.active) {
          this.inactiveEndTimestamp = interval.endTime;
          break;
        }
      }
      if (this.inactiveEndTimestamp) {
        const skipTime = this.inactiveEndTimestamp - timestamp;
        const payload = {
          speed: skipTime / SKIP_DURATION_LIMIT * this.config.inactiveSkipTime < SKIP_TIME_MIN ? skipTime / SKIP_TIME_MIN : Math.round(
            Math.max(skipTime, SKIP_DURATION_LIMIT) / this.config.inactiveSkipTime
          )
        };
        this.speedService.send({ type: "FAST_FORWARD", payload });
        this.emitter.emit(ReplayerEvents.SkipStart, payload);
      }
    }
  }
  /* End of Highlight Code */
  rebuildFullSnapshot(event, isSync = false) {
    if (!this.iframe.contentDocument) {
      return this.warn("Looks like your replayer has been destroyed.");
    }
    if (Object.keys(this.legacy_missingNodeRetryMap).length) {
      this.warn(
        "Found unresolved missing node map",
        this.legacy_missingNodeRetryMap
      );
    }
    this.legacy_missingNodeRetryMap = {};
    const collectedIframes = [];
    const collectedDialogs = /* @__PURE__ */ new Set();
    const afterAppend = (builtNode, id) => {
      if (builtNode.nodeName === "DIALOG")
        collectedDialogs.add(builtNode);
      this.collectIframeAndAttachDocument(collectedIframes, builtNode);
      if (this.mediaManager.isSupportedMediaElement(builtNode)) {
        const { events } = this.service.state.context;
        this.mediaManager.addMediaElements(
          builtNode,
          event.timestamp - events[0].timestamp,
          this.mirror
        );
      }
      for (const plugin of this.config.plugins || []) {
        if (plugin.onBuild)
          plugin.onBuild(builtNode, {
            id,
            replayer: this
          });
      }
    };
    if (this.usingVirtualDom) {
      this.virtualDom.destroyTree();
      this.usingVirtualDom = false;
    }
    this.mirror.reset();
    rebuild(event.data.node, {
      doc: this.iframe.contentDocument,
      afterAppend,
      cache: this.cache,
      mirror: this.mirror
    });
    afterAppend(this.iframe.contentDocument, event.data.node.id);
    for (const { mutationInQueue, builtNode } of collectedIframes) {
      this.attachDocumentToIframe(mutationInQueue, builtNode);
      this.newDocumentQueue = this.newDocumentQueue.filter(
        (m) => m !== mutationInQueue
      );
    }
    const { documentElement, head } = this.iframe.contentDocument;
    this.insertStyleRules(documentElement, head);
    collectedDialogs.forEach((d) => applyDialogToTopLevel(d));
    if (!this.service.state.matches("playing")) {
      this.iframe.contentDocument.getElementsByTagName("html")[0].classList.add("rrweb-paused");
    }
    this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded, event);
    if (!isSync) {
      this.waitForStylesheetLoad();
    }
    if (this.config.UNSAFE_replayCanvas) {
      void this.preloadAllImages();
    }
  }
  insertStyleRules(documentElement, head) {
    var _a2;
    const injectStylesRules = rules(
      this.config.blockClass
    ).concat(this.config.insertStyleRules);
    if (this.config.pauseAnimation) {
      injectStylesRules.push(
        "html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }"
      );
    }
    if (this.usingVirtualDom) {
      const styleEl = this.virtualDom.createElement("style");
      this.virtualDom.mirror.add(
        styleEl,
        getDefaultSN(styleEl, this.virtualDom.unserializedId)
      );
      documentElement.insertBefore(styleEl, head);
      styleEl.rules.push({
        source: IncrementalSource.StyleSheetRule,
        adds: injectStylesRules.map((cssText, index2) => ({
          rule: cssText,
          index: index2
        }))
      });
    } else {
      const styleEl = document.createElement("style");
      documentElement.insertBefore(
        styleEl,
        head
      );
      for (let idx = 0; idx < injectStylesRules.length; idx++) {
        (_a2 = styleEl.sheet) == null ? void 0 : _a2.insertRule(injectStylesRules[idx], idx);
      }
    }
  }
  attachDocumentToIframe(mutation, iframeEl) {
    const mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
    const collectedIframes = [];
    const collectedDialogs = /* @__PURE__ */ new Set();
    const afterAppend = (builtNode, id) => {
      if (builtNode.nodeName === "DIALOG")
        collectedDialogs.add(builtNode);
      this.collectIframeAndAttachDocument(collectedIframes, builtNode);
      const sn = mirror2.getMeta(builtNode);
      if ((sn == null ? void 0 : sn.type) === NodeType$2.Element && (sn == null ? void 0 : sn.tagName.toUpperCase()) === "HTML") {
        const { documentElement, head } = iframeEl.contentDocument;
        this.insertStyleRules(
          documentElement,
          head
        );
      }
      if (this.usingVirtualDom)
        return;
      for (const plugin of this.config.plugins || []) {
        if (plugin.onBuild)
          plugin.onBuild(builtNode, {
            id,
            replayer: this
          });
      }
    };
    buildNodeWithSN(mutation.node, {
      doc: iframeEl.contentDocument,
      mirror: mirror2,
      hackCss: true,
      skipChild: false,
      afterAppend,
      cache: this.cache
    });
    afterAppend(iframeEl.contentDocument, mutation.node.id);
    for (const { mutationInQueue, builtNode } of collectedIframes) {
      this.attachDocumentToIframe(mutationInQueue, builtNode);
      this.newDocumentQueue = this.newDocumentQueue.filter(
        (m) => m !== mutationInQueue
      );
    }
    collectedDialogs.forEach((d) => applyDialogToTopLevel(d));
  }
  collectIframeAndAttachDocument(collected, builtNode) {
    if (isSerializedIframe(builtNode, this.mirror)) {
      const mutationInQueue = this.newDocumentQueue.find(
        (m) => m.parentId === this.mirror.getId(builtNode)
      );
      if (mutationInQueue) {
        collected.push({
          mutationInQueue,
          builtNode
        });
      }
    }
  }
  /**
   * pause when loading style sheet, resume when loaded all timeout exceed
   */
  waitForStylesheetLoad() {
    var _a2;
    const head = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.head;
    if (head) {
      const unloadSheets = /* @__PURE__ */ new Set();
      let timer;
      let beforeLoadState = this.service.state;
      const stateHandler = () => {
        beforeLoadState = this.service.state;
      };
      this.emitter.on(ReplayerEvents.Start, stateHandler);
      this.emitter.on(ReplayerEvents.Pause, stateHandler);
      const unsubscribe = () => {
        this.emitter.off(ReplayerEvents.Start, stateHandler);
        this.emitter.off(ReplayerEvents.Pause, stateHandler);
      };
      head.querySelectorAll('link[rel="stylesheet"]').forEach((css) => {
        if (!css.sheet) {
          unloadSheets.add(css);
          css.addEventListener("load", () => {
            unloadSheets.delete(css);
            if (unloadSheets.size === 0 && timer !== -1) {
              if (beforeLoadState.matches("playing")) {
                this.play(this.getCurrentTime());
              }
              this.emitter.emit(ReplayerEvents.LoadStylesheetEnd);
              if (timer) {
                clearTimeout(timer);
              }
              unsubscribe();
            }
          });
        }
      });
      if (unloadSheets.size > 0) {
        this.service.send({ type: "PAUSE" });
        this.emitter.emit(ReplayerEvents.LoadStylesheetStart);
        timer = setTimeout(() => {
          if (beforeLoadState.matches("playing")) {
            this.play(this.getCurrentTime());
          }
          timer = -1;
          unsubscribe();
        }, this.config.loadTimeout);
      }
    }
  }
  /**
   * pause when there are some canvas drawImage args need to be loaded
   */
  async preloadAllImages() {
    const promises = [];
    for (const event of this.service.state.context.events) {
      if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.CanvasMutation) {
        promises.push(
          this.deserializeAndPreloadCanvasEvents(event.data, event)
        );
        const commands = "commands" in event.data ? event.data.commands : [event.data];
        commands.forEach((c2) => {
          this.preloadImages(c2, event);
        });
      }
    }
    return Promise.all(promises);
  }
  preloadImages(data, event) {
    if (data.property === "drawImage" && typeof data.args[0] === "string" && !this.imageMap.has(event)) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const imgd = ctx == null ? void 0 : ctx.createImageData(canvas.width, canvas.height);
      ctx == null ? void 0 : ctx.putImageData(imgd, 0, 0);
    }
  }
  async deserializeAndPreloadCanvasEvents(data, event) {
    if (!this.canvasEventMap.has(event)) {
      const status = {
        isUnchanged: true
      };
      if ("commands" in data) {
        const commands = await Promise.all(
          data.commands.map(async (c2) => {
            const args = await Promise.all(
              c2.args.map(deserializeArg(this.imageMap, null, status))
            );
            return { ...c2, args };
          })
        );
        if (status.isUnchanged === false)
          this.canvasEventMap.set(event, { ...data, commands });
      } else {
        const args = await Promise.all(
          data.args.map(deserializeArg(this.imageMap, null, status))
        );
        if (status.isUnchanged === false)
          this.canvasEventMap.set(event, { ...data, args });
      }
    }
  }
  applyIncremental(e2, isSync) {
    var _a2, _b, _c;
    const { data: d } = e2;
    switch (d.source) {
      case IncrementalSource.Mutation: {
        try {
          this.applyMutation(d, isSync);
        } catch (error) {
          this.warn(`Exception in mutation ${error.message || error}`, d);
        }
        break;
      }
      case IncrementalSource.Drag:
      case IncrementalSource.TouchMove:
      case IncrementalSource.MouseMove:
        if (isSync) {
          const lastPosition = d.positions[d.positions.length - 1];
          this.mousePos = {
            x: lastPosition.x,
            y: lastPosition.y,
            id: lastPosition.id,
            debugData: d
          };
        } else {
          d.positions.forEach((p) => {
            const action = {
              doAction: () => {
                this.moveAndHover(p.x, p.y, p.id, isSync, d);
              },
              delay: p.timeOffset + e2.timestamp - this.service.state.context.baselineTime
            };
            this.timer.addAction(action);
          });
          this.timer.addAction({
            doAction() {
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            delay: e2.delay - ((_a2 = d.positions[0]) == null ? void 0 : _a2.timeOffset)
          });
        }
        break;
      case IncrementalSource.MouseInteraction: {
        if (d.id === -1) {
          break;
        }
        const event = new Event(toLowerCase(MouseInteractions[d.type]));
        const target = this.mirror.getNode(d.id);
        if (!target) {
          return this.debugNodeNotFound(d, d.id);
        }
        this.emitter.emit(ReplayerEvents.MouseInteraction, {
          type: d.type,
          target
        });
        const { triggerFocus } = this.config;
        switch (d.type) {
          case MouseInteractions.Blur:
            if ("blur" in target) {
              target.blur();
            }
            break;
          case MouseInteractions.Focus:
            if (triggerFocus && target.focus) {
              target.focus({
                preventScroll: true
              });
            }
            break;
          case MouseInteractions.Click:
          case MouseInteractions.TouchStart:
          case MouseInteractions.TouchEnd:
          case MouseInteractions.MouseDown:
          case MouseInteractions.MouseUp:
            if (isSync) {
              if (d.type === MouseInteractions.TouchStart) {
                this.touchActive = true;
              } else if (d.type === MouseInteractions.TouchEnd) {
                this.touchActive = false;
              }
              if (d.type === MouseInteractions.MouseDown) {
                this.lastMouseDownEvent = [target, event];
              } else if (d.type === MouseInteractions.MouseUp) {
                this.lastMouseDownEvent = null;
              }
              this.mousePos = {
                x: d.x || 0,
                y: d.y || 0,
                id: d.id,
                debugData: d
              };
            } else {
              if (d.type === MouseInteractions.TouchStart) {
                this.tailPositions.length = 0;
              }
              this.moveAndHover(d.x || 0, d.y || 0, d.id, isSync, d);
              if (d.type === MouseInteractions.Click) {
                this.mouse.classList.remove("active");
                void this.mouse.offsetWidth;
                this.mouse.classList.add("active");
              } else if (d.type === MouseInteractions.TouchStart) {
                void this.mouse.offsetWidth;
                this.mouse.classList.add("touch-active");
              } else if (d.type === MouseInteractions.TouchEnd) {
                this.mouse.classList.remove("touch-active");
              } else {
                target.dispatchEvent(event);
              }
            }
            break;
          case MouseInteractions.TouchCancel:
            if (isSync) {
              this.touchActive = false;
            } else {
              this.mouse.classList.remove("touch-active");
            }
            break;
          default:
            target.dispatchEvent(event);
        }
        break;
      }
      case IncrementalSource.Scroll: {
        if (d.id === -1) {
          break;
        }
        if (this.usingVirtualDom) {
          const target = this.virtualDom.mirror.getNode(d.id);
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          target.scrollData = d;
          break;
        }
        this.applyScroll(d, isSync);
        break;
      }
      case IncrementalSource.ViewportResize:
        this.emitter.emit(ReplayerEvents.Resize, {
          width: d.width,
          height: d.height
        });
        break;
      case IncrementalSource.Input: {
        if (d.id === -1) {
          break;
        }
        if (this.usingVirtualDom) {
          const target = this.virtualDom.mirror.getNode(d.id);
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          target.inputData = d;
          break;
        }
        this.applyInput(d);
        break;
      }
      case IncrementalSource.MediaInteraction: {
        const target = this.usingVirtualDom ? this.virtualDom.mirror.getNode(d.id) : this.mirror.getNode(d.id);
        if (!target) {
          return this.debugNodeNotFound(d, d.id);
        }
        const mediaEl = target;
        const { events } = this.service.state.context;
        this.mediaManager.mediaMutation({
          target: mediaEl,
          timeOffset: e2.timestamp - events[0].timestamp,
          mutation: d
        });
        break;
      }
      case IncrementalSource.StyleSheetRule:
      case IncrementalSource.StyleDeclaration: {
        if (this.usingVirtualDom) {
          if (d.styleId)
            this.constructedStyleMutations.push(d);
          else if (d.id)
            (_b = this.virtualDom.mirror.getNode(d.id)) == null ? void 0 : _b.rules.push(d);
        } else
          this.applyStyleSheetMutation(d);
        break;
      }
      case IncrementalSource.CanvasMutation: {
        if (!this.config.UNSAFE_replayCanvas) {
          return;
        }
        if (this.usingVirtualDom) {
          const target = this.virtualDom.mirror.getNode(
            d.id
          );
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          target.canvasMutations.push({
            event: e2,
            mutation: d
          });
        } else {
          const target = this.mirror.getNode(d.id);
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          void canvasMutation({
            event: e2,
            mutation: d,
            target,
            imageMap: this.imageMap,
            canvasEventMap: this.canvasEventMap,
            errorHandler: this.warnCanvasMutationFailed.bind(this)
          });
        }
        break;
      }
      case IncrementalSource.Font: {
        try {
          const fontFace = new FontFace(
            d.family,
            d.buffer ? new Uint8Array(JSON.parse(d.fontSource)) : d.fontSource,
            d.descriptors
          );
          (_c = this.iframe.contentDocument) == null ? void 0 : _c.fonts.add(fontFace);
        } catch (error) {
          this.warn(error);
        }
        break;
      }
      case IncrementalSource.Selection: {
        if (isSync) {
          this.lastSelectionData = d;
          break;
        }
        this.applySelection(d);
        break;
      }
      case IncrementalSource.AdoptedStyleSheet: {
        if (this.usingVirtualDom)
          this.adoptedStyleSheets.push(d);
        else
          this.applyAdoptedStyleSheet(d);
        break;
      }
    }
  }
  /**
   * Apply the mutation to the virtual dom or the real dom.
   * @param d - The mutation data.
   * @param isSync - Whether the mutation should be applied synchronously (while fast-forwarding).
   */
  applyMutation(d, isSync) {
    if (this.config.useVirtualDom && !this.usingVirtualDom && isSync) {
      this.usingVirtualDom = true;
      buildFromDom(this.iframe.contentDocument, this.mirror, this.virtualDom);
      if (Object.keys(this.legacy_missingNodeRetryMap).length) {
        for (const key in this.legacy_missingNodeRetryMap) {
          try {
            const value = this.legacy_missingNodeRetryMap[key];
            const virtualNode = buildFromNode(
              value.node,
              this.virtualDom,
              this.mirror
            );
            if (virtualNode)
              value.node = virtualNode;
          } catch (error) {
            this.warn(error);
          }
        }
      }
    }
    const mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
    d.removes = d.removes.filter((mutation) => {
      if (!mirror2.getNode(mutation.id)) {
        this.warnNodeNotFound(d, mutation.id);
        return false;
      }
      return true;
    });
    d.removes.forEach((mutation) => {
      var _a2;
      const target = mirror2.getNode(mutation.id);
      if (!target) {
        return;
      }
      let parent = mirror2.getNode(
        mutation.parentId
      );
      if (!parent) {
        return this.warnNodeNotFound(d, mutation.parentId);
      }
      if (mutation.isShadow && hasShadowRoot(parent)) {
        parent = parent.shadowRoot;
      }
      mirror2.removeNodeFromMap(target);
      if (parent)
        try {
          parent.removeChild(target);
          if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_a2 = parent.rules) == null ? void 0 : _a2.length) > 0)
            parent.rules = [];
        } catch (error) {
          if (error instanceof DOMException) {
            this.warn(
              "parent could not remove child in mutation",
              parent,
              target,
              d
            );
          } else {
            throw error;
          }
        }
    });
    const legacy_missingNodeMap = {
      ...this.legacy_missingNodeRetryMap
    };
    const queue = [];
    const nextNotInDOM = (mutation) => {
      let next = null;
      if (mutation.nextId) {
        next = mirror2.getNode(mutation.nextId);
      }
      if (mutation.nextId !== null && mutation.nextId !== void 0 && mutation.nextId !== -1 && !next) {
        return true;
      }
      return false;
    };
    const appendNode = (mutation) => {
      var _a2, _b;
      if (!this.iframe.contentDocument) {
        return this.warn("Looks like your replayer has been destroyed.");
      }
      let parent = mirror2.getNode(
        mutation.parentId
      );
      if (!parent) {
        if (mutation.node.type === NodeType$2.Document) {
          return this.newDocumentQueue.push(mutation);
        }
        return queue.push(mutation);
      }
      if (mutation.node.isShadow) {
        if (!hasShadowRoot(parent)) {
          parent.attachShadow({ mode: "open" });
          parent = parent.shadowRoot;
        } else
          parent = parent.shadowRoot;
      }
      let previous = null;
      let next = null;
      if (mutation.previousId) {
        previous = mirror2.getNode(mutation.previousId);
      }
      if (mutation.nextId) {
        next = mirror2.getNode(mutation.nextId);
      }
      if (nextNotInDOM(mutation)) {
        return queue.push(mutation);
      }
      if (mutation.node.rootId && !mirror2.getNode(mutation.node.rootId)) {
        return;
      }
      const targetDoc = mutation.node.rootId ? mirror2.getNode(mutation.node.rootId) : this.usingVirtualDom ? this.virtualDom : this.iframe.contentDocument;
      if (isSerializedIframe(parent, mirror2)) {
        this.attachDocumentToIframe(
          mutation,
          parent
        );
        return;
      }
      const afterAppend = (node, id) => {
        if (this.usingVirtualDom)
          return;
        applyDialogToTopLevel(node);
        for (const plugin of this.config.plugins || []) {
          if (plugin.onBuild)
            plugin.onBuild(node, { id, replayer: this });
        }
      };
      const target = buildNodeWithSN(mutation.node, {
        doc: targetDoc,
        // can be Document or RRDocument
        mirror: mirror2,
        // can be this.mirror or virtualDom.mirror
        skipChild: true,
        hackCss: true,
        cache: this.cache,
        /**
         * caveat: `afterAppend` only gets called on child nodes of target
         * we have to call it again below when this target was added to the DOM
         */
        afterAppend
      });
      if (mutation.previousId === -1 || mutation.nextId === -1) {
        legacy_missingNodeMap[mutation.node.id] = {
          node: target,
          mutation
        };
        return;
      }
      const parentSn = mirror2.getMeta(parent);
      if (parentSn && parentSn.type === NodeType$2.Element && mutation.node.type === NodeType$2.Text) {
        const prospectiveSiblings = Array.isArray(parent.childNodes) ? parent.childNodes : Array.from(parent.childNodes);
        if (parentSn.tagName === "textarea") {
          for (const c2 of prospectiveSiblings) {
            if (c2.nodeType === parent.TEXT_NODE) {
              parent.removeChild(c2);
            }
          }
        } else if (parentSn.tagName === "style" && prospectiveSiblings.length === 1) {
          for (const cssText of prospectiveSiblings) {
            if (cssText.nodeType === parent.TEXT_NODE && !mirror2.hasNode(cssText)) {
              target.textContent = cssText.textContent;
              parent.removeChild(cssText);
            }
          }
        }
      } else if ((parentSn == null ? void 0 : parentSn.type) === NodeType$2.Document) {
        const parentDoc = parent;
        if (mutation.node.type === NodeType$2.DocumentType && ((_a2 = parentDoc.childNodes[0]) == null ? void 0 : _a2.nodeType) === Node.DOCUMENT_TYPE_NODE)
          parentDoc.removeChild(parentDoc.childNodes[0]);
        if (target.nodeName === "HTML" && parentDoc.documentElement)
          parentDoc.removeChild(
            parentDoc.documentElement
          );
      }
      if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
        parent.insertBefore(
          target,
          previous.nextSibling
        );
      } else if (next && next.parentNode) {
        parent.contains(next) ? parent.insertBefore(target, next) : parent.insertBefore(target, null);
      } else {
        parent.appendChild(target);
      }
      afterAppend(target, mutation.node.id);
      if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_b = parent.rules) == null ? void 0 : _b.length) > 0)
        parent.rules = [];
      if (isSerializedIframe(target, this.mirror)) {
        const targetId = this.mirror.getId(target);
        const mutationInQueue = this.newDocumentQueue.find(
          (m) => m.parentId === targetId
        );
        if (mutationInQueue) {
          this.attachDocumentToIframe(
            mutationInQueue,
            target
          );
          this.newDocumentQueue = this.newDocumentQueue.filter(
            (m) => m !== mutationInQueue
          );
        }
      }
      if (mutation.previousId || mutation.nextId) {
        this.legacy_resolveMissingNode(
          legacy_missingNodeMap,
          parent,
          target,
          mutation
        );
      }
    };
    d.adds.forEach((mutation) => {
      appendNode(mutation);
    });
    const startTime = Date.now();
    while (queue.length) {
      const resolveTrees = queueToResolveTrees(queue);
      queue.length = 0;
      if (Date.now() - startTime > 500) {
        this.warn(
          "Timeout in the loop, please check the resolve tree data:",
          resolveTrees
        );
        break;
      }
      for (const tree of resolveTrees) {
        const parent = mirror2.getNode(tree.value.parentId);
        if (!parent) {
          this.debug(
            "Drop resolve tree since there is no parent for the root node.",
            tree
          );
        } else {
          iterateResolveTree(tree, (mutation) => {
            appendNode(mutation);
          });
        }
      }
    }
    if (Object.keys(legacy_missingNodeMap).length) {
      Object.assign(this.legacy_missingNodeRetryMap, legacy_missingNodeMap);
    }
    uniqueTextMutations(d.texts).forEach((mutation) => {
      var _a2;
      const target = mirror2.getNode(mutation.id);
      if (!target) {
        if (d.removes.find((r2) => r2.id === mutation.id)) {
          return;
        }
        return this.warnNodeNotFound(d, mutation.id);
      }
      target.textContent = mutation.value;
      if (this.usingVirtualDom) {
        const parent = target.parentNode;
        if (((_a2 = parent == null ? void 0 : parent.rules) == null ? void 0 : _a2.length) > 0)
          parent.rules = [];
      }
    });
    d.attributes.forEach((mutation) => {
      var _a2;
      const target = mirror2.getNode(mutation.id);
      if (!target) {
        if (d.removes.find((r2) => r2.id === mutation.id)) {
          return;
        }
        return this.warnNodeNotFound(d, mutation.id);
      }
      for (const attributeName in mutation.attributes) {
        if (typeof attributeName === "string") {
          const value = mutation.attributes[attributeName];
          if (value === null) {
            target.removeAttribute(attributeName);
            if (attributeName === "open")
              removeDialogFromTopLevel(target, mutation);
          } else if (typeof value === "string") {
            try {
              if (attributeName === "_cssText" && (target.nodeName === "LINK" || target.nodeName === "STYLE")) {
                try {
                  const newSn = mirror2.getMeta(
                    target
                  );
                  Object.assign(
                    newSn.attributes,
                    mutation.attributes
                  );
                  const newNode = buildNodeWithSN(newSn, {
                    doc: target.ownerDocument,
                    // can be Document or RRDocument
                    mirror: mirror2,
                    skipChild: true,
                    hackCss: true,
                    cache: this.cache
                  });
                  const siblingNode = target.nextSibling;
                  const parentNode2 = target.parentNode;
                  if (newNode && parentNode2) {
                    parentNode2.removeChild(target);
                    parentNode2.insertBefore(
                      newNode,
                      siblingNode
                    );
                    mirror2.replace(mutation.id, newNode);
                    break;
                  }
                } catch (e2) {
                }
              }
              if (attributeName === "value" && target.nodeName === "TEXTAREA") {
                const textarea = target;
                textarea.childNodes.forEach(
                  (c2) => textarea.removeChild(c2)
                );
                const tn = (_a2 = target.ownerDocument) == null ? void 0 : _a2.createTextNode(value);
                if (tn) {
                  textarea.appendChild(tn);
                }
              } else {
                target.setAttribute(
                  attributeName,
                  value
                );
              }
              if (attributeName === "rr_open_mode" && target.nodeName === "DIALOG") {
                applyDialogToTopLevel(target, mutation);
              }
            } catch (error) {
              this.warn(
                "An error occurred may due to the checkout feature.",
                error
              );
            }
          } else if (attributeName === "style") {
            const styleValues = value;
            const targetEl = target;
            for (const s2 in styleValues) {
              if (styleValues[s2] === false) {
                targetEl.style.removeProperty(s2);
              } else if (styleValues[s2] instanceof Array) {
                const svp = styleValues[s2];
                targetEl.style.setProperty(s2, svp[0], svp[1]);
              } else {
                const svs = styleValues[s2];
                targetEl.style.setProperty(s2, svs);
              }
            }
          }
        }
      }
    });
  }
  /**
   * Apply the scroll data on real elements.
   * If the replayer is in sync mode, smooth scroll behavior should be disabled.
   * @param d - the scroll data
   * @param isSync - whether the replayer is in sync mode(fast-forward)
   */
  applyScroll(d, isSync) {
    var _a2, _b;
    const target = this.mirror.getNode(d.id);
    if (!target) {
      return this.debugNodeNotFound(d, d.id);
    }
    const sn = this.mirror.getMeta(target);
    if (target === this.iframe.contentDocument) {
      (_a2 = this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo({
        top: d.y,
        left: d.x,
        behavior: isSync ? "auto" : "smooth"
      });
    } else if ((sn == null ? void 0 : sn.type) === NodeType$2.Document) {
      (_b = target.defaultView) == null ? void 0 : _b.scrollTo({
        top: d.y,
        left: d.x,
        behavior: isSync ? "auto" : "smooth"
      });
    } else {
      try {
        target.scrollTo({
          top: d.y,
          left: d.x,
          behavior: isSync ? "auto" : "smooth"
        });
      } catch (error) {
      }
    }
  }
  applyInput(d) {
    const target = this.mirror.getNode(d.id);
    if (!target) {
      return this.debugNodeNotFound(d, d.id);
    }
    try {
      target.checked = d.isChecked;
      target.value = d.text;
    } catch (error) {
    }
  }
  applySelection(d) {
    try {
      const selectionSet = /* @__PURE__ */ new Set();
      const ranges = d.ranges.map(({ start, startOffset, end, endOffset }) => {
        const startContainer = this.mirror.getNode(start);
        const endContainer = this.mirror.getNode(end);
        if (!startContainer || !endContainer)
          return;
        const result = new Range();
        result.setStart(startContainer, startOffset);
        result.setEnd(endContainer, endOffset);
        const doc = startContainer.ownerDocument;
        const selection = doc == null ? void 0 : doc.getSelection();
        selection && selectionSet.add(selection);
        return {
          range: result,
          selection
        };
      });
      selectionSet.forEach((s2) => s2.removeAllRanges());
      ranges.forEach((r2) => {
        var _a2;
        return r2 && ((_a2 = r2.selection) == null ? void 0 : _a2.addRange(r2.range));
      });
    } catch (error) {
    }
  }
  applyStyleSheetMutation(data) {
    var _a2;
    let styleSheet = null;
    if (data.styleId)
      styleSheet = this.styleMirror.getStyle(data.styleId);
    else if (data.id)
      styleSheet = ((_a2 = this.mirror.getNode(data.id)) == null ? void 0 : _a2.sheet) || null;
    if (!styleSheet)
      return;
    if (data.source === IncrementalSource.StyleSheetRule)
      this.applyStyleSheetRule(data, styleSheet);
    else if (data.source === IncrementalSource.StyleDeclaration)
      this.applyStyleDeclaration(data, styleSheet);
  }
  applyStyleSheetRule(data, styleSheet) {
    var _a2, _b, _c, _d;
    (_a2 = data.adds) == null ? void 0 : _a2.forEach(({ rule, index: nestedIndex }) => {
      try {
        if (Array.isArray(nestedIndex)) {
          const { positions, index: index2 } = getPositionsAndIndex(nestedIndex);
          const nestedRule = getNestedRule(styleSheet.cssRules, positions);
          nestedRule.insertRule(rule, index2);
        } else {
          const index2 = nestedIndex === void 0 ? void 0 : Math.min(nestedIndex, styleSheet.cssRules.length);
          styleSheet == null ? void 0 : styleSheet.insertRule(rule, index2);
        }
      } catch (e2) {
      }
    });
    (_b = data.removes) == null ? void 0 : _b.forEach(({ index: nestedIndex }) => {
      try {
        if (Array.isArray(nestedIndex)) {
          const { positions, index: index2 } = getPositionsAndIndex(nestedIndex);
          const nestedRule = getNestedRule(styleSheet.cssRules, positions);
          nestedRule.deleteRule(index2 || 0);
        } else {
          styleSheet == null ? void 0 : styleSheet.deleteRule(nestedIndex);
        }
      } catch (e2) {
      }
    });
    if (data.replace)
      try {
        void ((_c = styleSheet.replace) == null ? void 0 : _c.call(styleSheet, data.replace));
      } catch (e2) {
      }
    if (data.replaceSync)
      try {
        (_d = styleSheet.replaceSync) == null ? void 0 : _d.call(styleSheet, data.replaceSync);
      } catch (e2) {
      }
  }
  applyStyleDeclaration(data, styleSheet) {
    if (data.set) {
      const rule = getNestedRule(
        styleSheet.rules,
        data.index
      );
      rule.style.setProperty(
        data.set.property,
        data.set.value,
        data.set.priority
      );
    }
    if (data.remove) {
      const rule = getNestedRule(
        styleSheet.rules,
        data.index
      );
      rule.style.removeProperty(data.remove.property);
    }
  }
  applyAdoptedStyleSheet(data) {
    var _a2;
    const targetHost = this.mirror.getNode(data.id);
    if (!targetHost)
      return;
    (_a2 = data.styles) == null ? void 0 : _a2.forEach((style) => {
      var _a3;
      let newStyleSheet = null;
      let hostWindow = null;
      if (hasShadowRoot(targetHost))
        hostWindow = ((_a3 = targetHost.ownerDocument) == null ? void 0 : _a3.defaultView) || null;
      else if (targetHost.nodeName === "#document")
        hostWindow = targetHost.defaultView;
      if (!hostWindow)
        return;
      try {
        newStyleSheet = new hostWindow.CSSStyleSheet();
        this.styleMirror.add(newStyleSheet, style.styleId);
        this.applyStyleSheetRule(
          {
            source: IncrementalSource.StyleSheetRule,
            adds: style.rules
          },
          newStyleSheet
        );
      } catch (e2) {
      }
    });
    const MAX_RETRY_TIME = 10;
    let count = 0;
    const adoptStyleSheets = (targetHost2, styleIds) => {
      const stylesToAdopt = styleIds.map((styleId) => this.styleMirror.getStyle(styleId)).filter((style) => style !== null);
      if (hasShadowRoot(targetHost2))
        targetHost2.shadowRoot.adoptedStyleSheets = stylesToAdopt;
      else if (targetHost2.nodeName === "#document")
        targetHost2.adoptedStyleSheets = stylesToAdopt;
      if (stylesToAdopt.length !== styleIds.length && count < MAX_RETRY_TIME) {
        setTimeout(
          () => adoptStyleSheets(targetHost2, styleIds),
          0 + 100 * count
        );
        count++;
      }
    };
    adoptStyleSheets(targetHost, data.styleIds);
  }
  legacy_resolveMissingNode(map, parent, target, targetMutation) {
    const { previousId, nextId } = targetMutation;
    const previousInMap = previousId && map[previousId];
    const nextInMap = nextId && map[nextId];
    if (previousInMap) {
      const { node, mutation } = previousInMap;
      parent.insertBefore(node, target);
      delete map[mutation.node.id];
      delete this.legacy_missingNodeRetryMap[mutation.node.id];
      if (mutation.previousId || mutation.nextId) {
        this.legacy_resolveMissingNode(map, parent, node, mutation);
      }
    }
    if (nextInMap) {
      const { node, mutation } = nextInMap;
      parent.insertBefore(
        node,
        target.nextSibling
      );
      delete map[mutation.node.id];
      delete this.legacy_missingNodeRetryMap[mutation.node.id];
      if (mutation.previousId || mutation.nextId) {
        this.legacy_resolveMissingNode(map, parent, node, mutation);
      }
    }
  }
  moveAndHover(x, y, id, isSync, debugData) {
    const target = this.mirror.getNode(id);
    if (!target) {
      return this.debugNodeNotFound(debugData, id);
    }
    const base = getBaseDimension(target, this.iframe);
    const _x = x * base.absoluteScale + base.x;
    const _y = y * base.absoluteScale + base.y;
    this.mouse.style.left = `${_x}px`;
    this.mouse.style.top = `${_y}px`;
    if (!isSync) {
      this.drawMouseTail({ x: _x, y: _y });
    }
    this.hoverElements(target);
  }
  drawMouseTail(position) {
    if (!this.mouseTail) {
      return;
    }
    const { lineCap, lineWidth, strokeStyle, duration } = this.config.mouseTail === true ? defaultMouseTailConfig : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail);
    const draw = () => {
      if (!this.mouseTail) {
        return;
      }
      const ctx = this.mouseTail.getContext("2d");
      if (!ctx || !this.tailPositions.length) {
        return;
      }
      ctx.clearRect(0, 0, this.mouseTail.width, this.mouseTail.height);
      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.lineCap = lineCap;
      ctx.strokeStyle = strokeStyle;
      ctx.moveTo(this.tailPositions[0].x, this.tailPositions[0].y);
      this.tailPositions.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    };
    this.tailPositions.push(position);
    draw();
    setTimeout(() => {
      this.tailPositions = this.tailPositions.filter((p) => p !== position);
      draw();
    }, duration / this.speedService.state.context.timer.speed);
  }
  hoverElements(el) {
    var _a2;
    (_a2 = this.lastHoveredRootNode || this.iframe.contentDocument) == null ? void 0 : _a2.querySelectorAll(".\\:hover").forEach((hoveredEl) => {
      hoveredEl.classList.remove(":hover");
    });
    this.lastHoveredRootNode = el.getRootNode();
    let currentEl = el;
    while (currentEl) {
      if (currentEl.classList) {
        currentEl.classList.add(":hover");
      }
      currentEl = currentEl.parentElement;
    }
  }
  isUserInteraction(event) {
    if (event.type !== EventType.IncrementalSnapshot) {
      return false;
    }
    return event.data.source > IncrementalSource.Mutation && event.data.source <= IncrementalSource.Input;
  }
  backToNormal() {
    this.nextUserInteractionEvent = null;
    if (this.speedService.state.matches("normal")) {
      return;
    }
    this.speedService.send({ type: "BACK_TO_NORMAL" });
    this.emitter.emit(ReplayerEvents.SkipEnd, {
      speed: this.speedService.state.context.normalSpeed
    });
  }
  warnNodeNotFound(d, id) {
    this.warn(`Node with id '${id}' not found. `, d);
  }
  warnCanvasMutationFailed(d, error) {
    this.warn(`Has error on canvas update`, error, "canvas mutation:", d);
  }
  debugNodeNotFound(d, id) {
    this.debug(`Node with id '${id}' not found. `, d);
  }
  warn(...args) {
    if (!this.config.showWarning) {
      return;
    }
    this.config.logger.warn(REPLAY_CONSOLE_PREFIX, ...args);
  }
  debug(...args) {
    if (!this.config.showDebug) {
      return;
    }
    this.config.logger.log(REPLAY_CONSOLE_PREFIX, ...args);
  }
};
var { addCustomEvent } = record;
var { freezePage } = record;
var { takeFullSnapshot } = record;
export {
  EventType,
  IncrementalSource,
  MouseInteractions,
  Replayer,
  ReplayerEvents,
  addCustomEvent,
  canvasMutation,
  freezePage,
  _mirror as mirror,
  record,
  takeFullSnapshot,
  utils
};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
