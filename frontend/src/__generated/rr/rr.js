var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../rrweb/packages/rrweb/es/rrweb/ext/tslib/tslib.es6.js
function __rest(s2, e2) {
  var t2 = {};
  for (var p in s2)
    if (Object.prototype.hasOwnProperty.call(s2, p) && e2.indexOf(p) < 0)
      t2[p] = s2[p];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p = Object.getOwnPropertySymbols(s2); i2 < p.length; i2++) {
      if (e2.indexOf(p[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p[i2]))
        t2[p[i2]] = s2[p[i2]];
    }
  return t2;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb-snapshot/es/rrweb-snapshot.js
var NodeType;
(function(NodeType3) {
  NodeType3[NodeType3["Document"] = 0] = "Document";
  NodeType3[NodeType3["DocumentType"] = 1] = "DocumentType";
  NodeType3[NodeType3["Element"] = 2] = "Element";
  NodeType3[NodeType3["Text"] = 3] = "Text";
  NodeType3[NodeType3["CDATA"] = 4] = "CDATA";
  NodeType3[NodeType3["Comment"] = 5] = "Comment";
})(NodeType || (NodeType = {}));
function isElement(n2) {
  return n2.nodeType === n2.ELEMENT_NODE;
}
function isShadowRoot(n2) {
  var host = n2 === null || n2 === void 0 ? void 0 : n2.host;
  return Boolean((host === null || host === void 0 ? void 0 : host.shadowRoot) === n2);
}
function isNativeShadowDom(shadowRoot) {
  return Object.prototype.toString.call(shadowRoot) === "[object ShadowRoot]";
}
function fixBrowserCompatibilityIssuesInCSS(cssText) {
  if (cssText.includes(" background-clip: text;") && !cssText.includes(" -webkit-background-clip: text;")) {
    cssText = cssText.replace(" background-clip: text;", " -webkit-background-clip: text; background-clip: text;");
  }
  return cssText;
}
function getCssRulesString(s2) {
  try {
    var rules2 = s2.rules || s2.cssRules;
    return rules2 ? fixBrowserCompatibilityIssuesInCSS(Array.from(rules2).map(getCssRuleString).join("")) : null;
  } catch (error) {
    return null;
  }
}
function getCssRuleString(rule) {
  var cssStringified = rule.cssText;
  if (isCSSImportRule(rule)) {
    try {
      cssStringified = getCssRulesString(rule.styleSheet) || cssStringified;
    } catch (_a2) {
    }
  }
  return cssStringified;
}
function isCSSImportRule(rule) {
  return "styleSheet" in rule;
}
var Mirror = function() {
  function Mirror3() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  Mirror3.prototype.getId = function(n2) {
    var _a2;
    if (!n2)
      return -1;
    var id = (_a2 = this.getMeta(n2)) === null || _a2 === void 0 ? void 0 : _a2.id;
    return id !== null && id !== void 0 ? id : -1;
  };
  Mirror3.prototype.getNode = function(id) {
    return this.idNodeMap.get(id) || null;
  };
  Mirror3.prototype.getIds = function() {
    return Array.from(this.idNodeMap.keys());
  };
  Mirror3.prototype.getMeta = function(n2) {
    return this.nodeMetaMap.get(n2) || null;
  };
  Mirror3.prototype.removeNodeFromMap = function(n2) {
    var _this = this;
    var id = this.getId(n2);
    this.idNodeMap["delete"](id);
    if (n2.childNodes) {
      n2.childNodes.forEach(function(childNode) {
        return _this.removeNodeFromMap(childNode);
      });
    }
  };
  Mirror3.prototype.has = function(id) {
    return this.idNodeMap.has(id);
  };
  Mirror3.prototype.hasNode = function(node) {
    return this.nodeMetaMap.has(node);
  };
  Mirror3.prototype.add = function(n2, meta) {
    var id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  };
  Mirror3.prototype.replace = function(id, n2) {
    var oldNode = this.getNode(id);
    if (oldNode) {
      var meta = this.nodeMetaMap.get(oldNode);
      if (meta)
        this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  };
  Mirror3.prototype.reset = function() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  };
  return Mirror3;
}();
function createMirror() {
  return new Mirror();
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(canvas) {
  var ctx = canvas.getContext("2d");
  if (!ctx)
    return true;
  var chunkSize = 50;
  for (var x = 0; x < canvas.width; x += chunkSize) {
    for (var y = 0; y < canvas.height; y += chunkSize) {
      var getImageData = ctx.getImageData;
      var originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
      var pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x, y, Math.min(chunkSize, canvas.width - x), Math.min(chunkSize, canvas.height - y)).data.buffer);
      if (pixelBuffer.some(function(pixel) {
        return pixel !== 0;
      }))
        return false;
    }
  }
  return true;
}
function isNodeMetaEqual(a2, b) {
  if (!a2 || !b || a2.type !== b.type)
    return false;
  if (a2.type === NodeType.Document)
    return a2.compatMode === b.compatMode;
  else if (a2.type === NodeType.DocumentType)
    return a2.name === b.name && a2.publicId === b.publicId && a2.systemId === b.systemId;
  else if (a2.type === NodeType.Comment || a2.type === NodeType.Text || a2.type === NodeType.CDATA)
    return a2.textContent === b.textContent;
  else if (a2.type === NodeType.Element)
    return a2.tagName === b.tagName && JSON.stringify(a2.attributes) === JSON.stringify(b.attributes) && a2.isSVG === b.isSVG && a2.needBlock === b.needBlock;
  return false;
}
function getInputType(element) {
  var type = element.type;
  return element.hasAttribute("data-rr-is-password") ? "password" : type ? type.toLowerCase() : null;
}
function obfuscateText(text) {
  text = text.replace(/[^ -~]+/g, "");
  text = (text === null || text === void 0 ? void 0 : text.split(" ").map(function(word) {
    return Math.random().toString(20).substr(2, word.length);
  }).join(" ")) || "";
  return text;
}
function isElementSrcBlocked(tagName) {
  return tagName === "img" || tagName === "video" || tagName === "audio" || tagName === "source";
}
var EMAIL_REGEX = new RegExp("[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*");
var LONG_NUMBER_REGEX = new RegExp("[0-9]{9,16}");
var SSN_REGEX = new RegExp("[0-9]{3}-?[0-9]{2}-?[0-9]{4}");
var PHONE_NUMBER_REGEX = new RegExp("[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}");
var CREDIT_CARD_REGEX = new RegExp("[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}");
var ADDRESS_REGEX = new RegExp("[0-9]{1,5}.?[0-9]{0,3}s[a-zA-Z]{2,30}s[a-zA-Z]{2,15}");
var IP_REGEX = new RegExp("(?:[0-9]{1,3}.){3}[0-9]{1,3}");
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
  return DEFAULT_OBFUSCATE_REGEXES.some(function(regex) {
    return regex.test(text);
  });
}
var maskedInputType = function(_a2) {
  var maskInputOptions = _a2.maskInputOptions, tagName = _a2.tagName, type = _a2.type, overwriteRecord = _a2.overwriteRecord;
  var actualType = type && type.toLowerCase();
  return overwriteRecord !== "true" && (!!maskInputOptions[tagName.toLowerCase()] || !!(actualType && maskInputOptions[actualType]));
};
function maskInputValue(_a2) {
  var maskInputOptions = _a2.maskInputOptions, tagName = _a2.tagName, type = _a2.type, value = _a2.value, overwriteRecord = _a2.overwriteRecord, maskInputFn = _a2.maskInputFn;
  var text = value || "";
  if (maskedInputType({
    maskInputOptions,
    tagName,
    type,
    overwriteRecord
  })) {
    if (maskInputFn) {
      text = maskInputFn(text);
    } else {
      text = "*".repeat(text.length);
    }
  }
  return text;
}
var _id = 1;
var tagNameRegex = new RegExp("[^a-z0-9-_:]");
var IGNORED_NODE = -2;
function genId() {
  return _id++;
}
function getValidTagName(element) {
  if (element instanceof HTMLFormElement) {
    return "form";
  }
  var processedTagName = element.tagName.toLowerCase().trim();
  if (tagNameRegex.test(processedTagName)) {
    return "div";
  }
  return processedTagName;
}
function stringifyStyleSheet(sheet) {
  return sheet.cssRules ? Array.from(sheet.cssRules).map(function(rule) {
    return rule.cssText || "";
  }).join("") : "";
}
function extractOrigin(url) {
  var origin = "";
  if (url.indexOf("//") > -1) {
    origin = url.split("/").slice(0, 3).join("/");
  } else {
    origin = url.split("/")[0];
  }
  origin = origin.split("?")[0];
  return origin;
}
var canvasService;
var canvasCtx;
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
var URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
var URL_WWW_MATCH = /^www\..*/i;
var DATA_URI = /^(data:)([^,]*),(.*)/i;
function absoluteToStylesheet(cssText, href) {
  return (cssText || "").replace(URL_IN_CSS_REF, function(origin, quote1, path1, quote2, path2, path3) {
    var filePath = path1 || path2 || path3;
    var maybeQuote = quote1 || quote2 || "";
    if (!filePath) {
      return origin;
    }
    if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) {
      return "url(".concat(maybeQuote).concat(filePath).concat(maybeQuote, ")");
    }
    if (DATA_URI.test(filePath)) {
      return "url(".concat(maybeQuote).concat(filePath).concat(maybeQuote, ")");
    }
    if (filePath[0] === "/") {
      return "url(".concat(maybeQuote).concat(extractOrigin(href) + filePath).concat(maybeQuote, ")");
    }
    var stack = href.split("/");
    var parts = filePath.split("/");
    stack.pop();
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
      var part = parts_1[_i];
      if (part === ".") {
        continue;
      } else if (part === "..") {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return "url(".concat(maybeQuote).concat(stack.join("/")).concat(maybeQuote, ")");
  });
}
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
  if (attributeValue.trim() === "") {
    return attributeValue;
  }
  var pos = 0;
  function collectCharacters(regEx) {
    var chars2;
    var match = regEx.exec(attributeValue.substring(pos));
    if (match) {
      chars2 = match[0];
      pos += chars2.length;
      return chars2;
    }
    return "";
  }
  var output = [];
  while (true) {
    collectCharacters(SRCSET_COMMAS_OR_SPACES);
    if (pos >= attributeValue.length) {
      break;
    }
    var url = collectCharacters(SRCSET_NOT_SPACES);
    if (url.slice(-1) === ",") {
      url = absoluteToDoc(doc, url.substring(0, url.length - 1));
      output.push(url);
    } else {
      var descriptorsStr = "";
      url = absoluteToDoc(doc, url);
      var inParens = false;
      while (true) {
        var c2 = attributeValue.charAt(pos);
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
function absoluteToDoc(doc, attributeValue) {
  if (!attributeValue || attributeValue.trim() === "") {
    return attributeValue;
  }
  var a2 = doc.createElement("a");
  a2.href = attributeValue;
  return a2.href;
}
function isSVGElement(el) {
  return Boolean(el.tagName === "svg" || el.ownerSVGElement);
}
function getHref() {
  var a2 = document.createElement("a");
  a2.href = "";
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
    return absoluteToStylesheet(value, getHref());
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
      for (var eIndex = element.classList.length; eIndex--; ) {
        var className = element.classList[eIndex];
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
    return classMatchesRegex(node.parentNode, regex, checkAncestors);
  }
  for (var eIndex = node.classList.length; eIndex--; ) {
    var className = node.classList[eIndex];
    if (regex.test(className)) {
      return true;
    }
  }
  if (!checkAncestors)
    return false;
  return classMatchesRegex(node.parentNode, regex, checkAncestors);
}
function needMaskingText(node, maskTextClass, maskTextSelector) {
  try {
    var el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
    if (el === null)
      return false;
    if (typeof maskTextClass === "string") {
      if (el.classList.contains(maskTextClass))
        return true;
      if (el.closest(".".concat(maskTextClass)))
        return true;
    } else {
      if (classMatchesRegex(el, maskTextClass, true))
        return true;
    }
    if (maskTextSelector) {
      if (el.matches(maskTextSelector))
        return true;
      if (el.closest(maskTextSelector))
        return true;
    }
  } catch (e2) {
  }
  return false;
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
  var win = iframeEl.contentWindow;
  if (!win) {
    return;
  }
  var fired = false;
  var readyState;
  try {
    readyState = win.document.readyState;
  } catch (error) {
    return;
  }
  if (readyState !== "complete") {
    var timer_1 = setTimeout(function() {
      if (!fired) {
        listener();
        fired = true;
      }
    }, iframeLoadTimeout);
    iframeEl.addEventListener("load", function() {
      clearTimeout(timer_1);
      fired = true;
      listener();
    });
    return;
  }
  var blankUrl = "about:blank";
  if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
    setTimeout(listener, 0);
    return iframeEl.addEventListener("load", listener);
  }
  iframeEl.addEventListener("load", listener);
}
function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
  var fired = false;
  var styleSheetLoaded;
  try {
    styleSheetLoaded = link.sheet;
  } catch (error) {
    return;
  }
  if (styleSheetLoaded)
    return;
  var timer = setTimeout(function() {
    if (!fired) {
      listener();
      fired = true;
    }
  }, styleSheetLoadTimeout);
  link.addEventListener("load", function() {
    clearTimeout(timer);
    fired = true;
    listener();
  });
}
function serializeNode(n2, options) {
  var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, inlineStylesheet = options.inlineStylesheet, _a2 = options.maskInputOptions, maskInputOptions = _a2 === void 0 ? {} : _a2, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, _b2 = options.dataURLOptions, dataURLOptions = _b2 === void 0 ? {} : _b2, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c, privacySetting = options.privacySetting;
  var rootId = getRootId(doc, mirror2);
  switch (n2.nodeType) {
    case n2.DOCUMENT_NODE:
      if (n2.compatMode !== "CSS1Compat") {
        return {
          type: NodeType.Document,
          childNodes: [],
          compatMode: n2.compatMode
        };
      } else {
        return {
          type: NodeType.Document,
          childNodes: []
        };
      }
    case n2.DOCUMENT_TYPE_NODE:
      return {
        type: NodeType.DocumentType,
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
        maskTextClass,
        maskTextSelector,
        maskTextFn,
        privacySetting,
        rootId
      });
    case n2.CDATA_SECTION_NODE:
      return {
        type: NodeType.CDATA,
        textContent: "",
        rootId
      };
    case n2.COMMENT_NODE:
      return {
        type: NodeType.Comment,
        textContent: n2.textContent || "",
        rootId
      };
    default:
      return false;
  }
}
function getRootId(doc, mirror2) {
  if (!mirror2.hasNode(doc))
    return void 0;
  var docId = mirror2.getId(doc);
  return docId === 1 ? void 0 : docId;
}
function serializeTextNode(n2, options) {
  var _a2, _b2;
  var maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, maskTextFn = options.maskTextFn, privacySetting = options.privacySetting, rootId = options.rootId;
  var parentTagName = n2.parentNode && n2.parentNode.tagName;
  var textContent = n2.textContent;
  var isStyle = parentTagName === "STYLE" ? true : void 0;
  var isScript = parentTagName === "SCRIPT" ? true : void 0;
  var textContentHandled = false;
  if (isStyle && textContent) {
    try {
      if (n2.nextSibling || n2.previousSibling) {
      } else if ((_a2 = n2.parentNode.sheet) === null || _a2 === void 0 ? void 0 : _a2.cssRules) {
        textContent = stringifyStyleSheet(n2.parentNode.sheet);
      }
    } catch (err) {
      console.warn("Cannot get CSS styles from text's parentNode. Error: ".concat(err), n2);
    }
    textContent = absoluteToStylesheet(textContent, getHref());
    textContentHandled = true;
  }
  if (isScript) {
    textContent = "SCRIPT_PLACEHOLDER";
    textContentHandled = true;
  } else if (parentTagName === "NOSCRIPT") {
    textContent = "";
    textContentHandled = true;
  }
  if (!isStyle && !isScript && textContent && needMaskingText(n2, maskTextClass, maskTextSelector)) {
    textContent = maskTextFn ? maskTextFn(textContent) : textContent.replace(/[\S]/g, "*");
  }
  var enableStrictPrivacy = privacySetting === "strict";
  var highlightOverwriteRecord = (_b2 = n2.parentElement) === null || _b2 === void 0 ? void 0 : _b2.getAttribute("data-hl-record");
  var obfuscateDefaultPrivacy = privacySetting === "default" && shouldObfuscateTextByDefault(textContent);
  if ((enableStrictPrivacy || obfuscateDefaultPrivacy) && !highlightOverwriteRecord && !textContentHandled && parentTagName) {
    var IGNORE_TAG_NAMES = /* @__PURE__ */ new Set([
      "HEAD",
      "TITLE",
      "STYLE",
      "SCRIPT",
      "HTML",
      "BODY",
      "NOSCRIPT"
    ]);
    if (!IGNORE_TAG_NAMES.has(parentTagName) && textContent) {
      textContent = obfuscateText(textContent);
    }
  }
  return {
    type: NodeType.Text,
    textContent: textContent || "",
    isStyle,
    rootId
  };
}
function serializeElementNode(n2, options) {
  var doc = options.doc, blockClass = options.blockClass, blockSelector = options.blockSelector, inlineStylesheet = options.inlineStylesheet, _a2 = options.maskInputOptions, maskInputOptions = _a2 === void 0 ? {} : _a2, maskInputFn = options.maskInputFn, maskTextClass = options.maskTextClass, _b2 = options.dataURLOptions, dataURLOptions = _b2 === void 0 ? {} : _b2, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c, privacySetting = options.privacySetting, rootId = options.rootId;
  var needBlock = _isBlockedElement(n2, blockClass, blockSelector);
  var needMask = _isBlockedElement(n2, maskTextClass, null);
  var enableStrictPrivacy = privacySetting === "strict";
  var tagName = getValidTagName(n2);
  var attributes = {};
  var len = n2.attributes.length;
  for (var i2 = 0; i2 < len; i2++) {
    var attr = n2.attributes[i2];
    if (!ignoreAttribute(tagName, attr.name, attr.value)) {
      attributes[attr.name] = transformAttribute(doc, tagName, attr.name, attr.value);
    }
  }
  if (tagName === "link" && inlineStylesheet) {
    var stylesheet = Array.from(doc.styleSheets).find(function(s2) {
      return s2.href === n2.href;
    });
    var cssText = null;
    if (stylesheet) {
      cssText = getCssRulesString(stylesheet);
    }
    if (cssText) {
      delete attributes.rel;
      delete attributes.href;
      attributes._cssText = absoluteToStylesheet(cssText, stylesheet.href);
    }
  }
  if (tagName === "style" && n2.sheet && !(n2.innerText || n2.textContent || "").trim().length) {
    var cssText = getCssRulesString(n2.sheet);
    if (cssText) {
      attributes._cssText = absoluteToStylesheet(cssText, getHref());
    }
  }
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    var value = n2.value;
    var checked = n2.checked;
    if (attributes.type !== "radio" && attributes.type !== "checkbox" && attributes.type !== "submit" && attributes.type !== "button" && value) {
      var type = getInputType(n2);
      attributes.value = maskInputValue({
        type,
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
  if (tagName === "canvas" && recordCanvas) {
    if (n2.__context === "2d") {
      if (!is2DCanvasBlank(n2)) {
        attributes.rr_dataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      }
    } else if (!("__context" in n2)) {
      var canvasDataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      var blankCanvas = document.createElement("canvas");
      blankCanvas.width = n2.width;
      blankCanvas.height = n2.height;
      var blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
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
    var image_1 = n2;
    var oldValue_1 = image_1.crossOrigin;
    image_1.crossOrigin = "anonymous";
    var recordInlineImage_1 = function() {
      image_1.removeEventListener("load", recordInlineImage_1);
      try {
        canvasService.width = image_1.naturalWidth;
        canvasService.height = image_1.naturalHeight;
        canvasCtx.drawImage(image_1, 0, 0);
        attributes.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      } catch (err) {
        console.warn("Cannot inline img src=".concat(image_1.currentSrc, "! Error: ").concat(err));
      }
      oldValue_1 ? attributes.crossOrigin = oldValue_1 : image_1.removeAttribute("crossorigin");
    };
    if (image_1.complete && image_1.naturalWidth !== 0)
      recordInlineImage_1();
    else
      image_1.addEventListener("load", recordInlineImage_1);
  }
  if (tagName === "audio" || tagName === "video") {
    attributes.rr_mediaState = n2.paused ? "paused" : "played";
    attributes.rr_mediaCurrentTime = n2.currentTime;
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
    var _d = n2.getBoundingClientRect(), width = _d.width, height = _d.height;
    attributes = {
      "class": attributes["class"],
      rr_width: "".concat(width, "px"),
      rr_height: "".concat(height, "px")
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
  if (inlineImages && tagName === "video") {
    var video = n2;
    if (video.src === "" || video.src.indexOf("blob:") !== -1) {
      var _e = n2.getBoundingClientRect(), width = _e.width, height = _e.height;
      attributes = {
        rr_width: "".concat(width, "px"),
        rr_height: "".concat(height, "px"),
        rr_inlined_video: true
      };
      tagName = "canvas";
    }
  }
  return {
    type: NodeType.Element,
    tagName,
    attributes,
    childNodes: [],
    isSVG: isSVGElement(n2) || void 0,
    needBlock,
    needMask,
    rootId
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
  if (slimDOMOptions.comment && sn.type === NodeType.Comment) {
    return true;
  } else if (sn.type === NodeType.Element) {
    if (slimDOMOptions.script && (sn.tagName === "script" || sn.tagName === "link" && (sn.attributes.rel === "preload" || sn.attributes.rel === "modulepreload") && sn.attributes.as === "script" || sn.tagName === "link" && sn.attributes.rel === "prefetch" && typeof sn.attributes.href === "string" && sn.attributes.href.endsWith(".js"))) {
      return true;
    } else if (slimDOMOptions.headFavicon && (sn.tagName === "link" && sn.attributes.rel === "shortcut icon" || sn.tagName === "meta" && (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(sn.attributes.name) === "application-name" || lowerIfExists(sn.attributes.rel) === "icon" || lowerIfExists(sn.attributes.rel) === "apple-touch-icon" || lowerIfExists(sn.attributes.rel) === "shortcut icon"))) {
      return true;
    } else if (sn.tagName === "meta") {
      if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
        return true;
      } else if (slimDOMOptions.headMetaSocial && (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) || lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) || lowerIfExists(sn.attributes.name) === "pinterest")) {
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
  var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, _a2 = options.skipChild, skipChild = _a2 === void 0 ? false : _a2, _b2 = options.inlineStylesheet, inlineStylesheet = _b2 === void 0 ? true : _b2, _c = options.maskInputOptions, maskInputOptions = _c === void 0 ? {} : _c, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, slimDOMOptions = options.slimDOMOptions, _d = options.dataURLOptions, dataURLOptions = _d === void 0 ? {} : _d, _e = options.inlineImages, inlineImages = _e === void 0 ? false : _e, _f = options.recordCanvas, recordCanvas = _f === void 0 ? false : _f, onSerialize = options.onSerialize, onIframeLoad = options.onIframeLoad, _g = options.iframeLoadTimeout, iframeLoadTimeout = _g === void 0 ? 5e3 : _g, onStylesheetLoad = options.onStylesheetLoad, _h = options.stylesheetLoadTimeout, stylesheetLoadTimeout = _h === void 0 ? 5e3 : _h, _j = options.keepIframeSrcFn, keepIframeSrcFn = _j === void 0 ? function() {
    return false;
  } : _j, _k = options.newlyAddedElement, newlyAddedElement = _k === void 0 ? false : _k, privacySetting = options.privacySetting;
  var _l = options.preserveWhiteSpace, preserveWhiteSpace = _l === void 0 ? true : _l;
  var _serializedNode = serializeNode(n2, {
    doc,
    mirror: mirror2,
    blockClass,
    blockSelector,
    maskTextClass,
    maskTextSelector,
    inlineStylesheet,
    maskInputOptions,
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
  var id;
  if (mirror2.hasNode(n2)) {
    id = mirror2.getId(n2);
  } else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType.Text && !_serializedNode.isStyle && !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length) {
    id = IGNORED_NODE;
  } else {
    id = genId();
  }
  var serializedNode = Object.assign(_serializedNode, { id });
  mirror2.add(n2, serializedNode);
  if (id === IGNORED_NODE) {
    return null;
  }
  if (onSerialize) {
    onSerialize(n2);
  }
  var recordChild = !skipChild;
  var overwrittenPrivacySetting = privacySetting;
  var strictPrivacy = privacySetting === "strict";
  if (serializedNode.type === NodeType.Element) {
    recordChild = recordChild && !serializedNode.needBlock;
    strictPrivacy || (strictPrivacy = !!serializedNode.needBlock || !!serializedNode.needMask);
    overwrittenPrivacySetting = strictPrivacy ? "strict" : overwrittenPrivacySetting;
    if (strictPrivacy && isElementSrcBlocked(serializedNode.tagName)) {
      var clone = n2.cloneNode();
      clone.src = "";
      mirror2.add(clone, serializedNode);
    }
    delete serializedNode.needBlock;
    delete serializedNode.needMask;
    var shadowRoot = n2.shadowRoot;
    if (shadowRoot && isNativeShadowDom(shadowRoot))
      serializedNode.isShadowHost = true;
  }
  if ((serializedNode.type === NodeType.Document || serializedNode.type === NodeType.Element) && recordChild) {
    if (slimDOMOptions.headWhitespace && serializedNode.type === NodeType.Element && serializedNode.tagName === "head") {
      preserveWhiteSpace = false;
    }
    var bypassOptions = {
      doc,
      mirror: mirror2,
      blockClass,
      blockSelector,
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
    for (var _i = 0, _m = Array.from(n2.childNodes); _i < _m.length; _i++) {
      var childN = _m[_i];
      var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
      if (serializedChildNode) {
        serializedNode.childNodes.push(serializedChildNode);
      }
    }
    if (isElement(n2) && n2.shadowRoot) {
      for (var _o = 0, _p = Array.from(n2.shadowRoot.childNodes); _o < _p.length; _o++) {
        var childN = _p[_o];
        var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
        if (serializedChildNode) {
          isNativeShadowDom(n2.shadowRoot) && (serializedChildNode.isShadow = true);
          serializedNode.childNodes.push(serializedChildNode);
        }
      }
    }
  }
  if (n2.parentNode && isShadowRoot(n2.parentNode) && isNativeShadowDom(n2.parentNode)) {
    serializedNode.isShadow = true;
  }
  if (serializedNode.type === NodeType.Element && serializedNode.tagName === "iframe") {
    onceIframeLoaded(n2, function() {
      var iframeDoc = n2.contentDocument;
      if (iframeDoc && onIframeLoad) {
        var serializedIframeNode = serializeNodeWithId(iframeDoc, {
          doc: iframeDoc,
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
          privacySetting
        });
        if (serializedIframeNode) {
          onIframeLoad(n2, serializedIframeNode);
        }
      }
    }, iframeLoadTimeout);
  }
  if (serializedNode.type === NodeType.Element && serializedNode.tagName === "link" && serializedNode.attributes.rel === "stylesheet") {
    onceStylesheetLoaded(n2, function() {
      if (onStylesheetLoad) {
        var serializedLinkNode = serializeNodeWithId(n2, {
          doc,
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
          privacySetting
        });
        if (serializedLinkNode) {
          onStylesheetLoad(n2, serializedLinkNode);
        }
      }
    }, stylesheetLoadTimeout);
  }
  return serializedNode;
}
function snapshot(n2, options) {
  var _a2 = options || {}, _b2 = _a2.mirror, mirror2 = _b2 === void 0 ? new Mirror() : _b2, _c = _a2.blockClass, blockClass = _c === void 0 ? "highlight-block" : _c, _d = _a2.blockSelector, blockSelector = _d === void 0 ? null : _d, _e = _a2.maskTextClass, maskTextClass = _e === void 0 ? "highlight-mask" : _e, _f = _a2.maskTextSelector, maskTextSelector = _f === void 0 ? null : _f, _g = _a2.inlineStylesheet, inlineStylesheet = _g === void 0 ? true : _g, _h = _a2.inlineImages, inlineImages = _h === void 0 ? false : _h, _j = _a2.recordCanvas, recordCanvas = _j === void 0 ? false : _j, _k = _a2.maskAllInputs, maskAllInputs = _k === void 0 ? false : _k, maskTextFn = _a2.maskTextFn, maskInputFn = _a2.maskInputFn, _l = _a2.slimDOM, slimDOM = _l === void 0 ? false : _l, dataURLOptions = _a2.dataURLOptions, preserveWhiteSpace = _a2.preserveWhiteSpace, onSerialize = _a2.onSerialize, onIframeLoad = _a2.onIframeLoad, iframeLoadTimeout = _a2.iframeLoadTimeout, onStylesheetLoad = _a2.onStylesheetLoad, stylesheetLoadTimeout = _a2.stylesheetLoadTimeout, _m = _a2.keepIframeSrcFn, keepIframeSrcFn = _m === void 0 ? function() {
    return false;
  } : _m, _o = _a2.privacySetting, privacySetting = _o === void 0 ? "default" : _o;
  var maskInputOptions = maskAllInputs === true ? {
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
  var slimDOMOptions = slimDOM || slimDOM === "all" ? {
    script: true,
    comment: true,
    headFavicon: true,
    headWhitespace: true,
    headMetaDescKeywords: slimDOM === "all",
    headMetaSocial: true,
    headMetaRobots: true,
    headMetaHttpEquiv: true,
    headMetaAuthorship: true,
    headMetaVerification: true
  } : !slimDOM ? {} : slimDOM;
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
function parse(css, options) {
  if (options === void 0) {
    options = {};
  }
  var lineno = 1;
  var column = 1;
  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) {
      lineno += lines.length;
    }
    var i2 = str.lastIndexOf("\n");
    column = i2 === -1 ? column + str.length : str.length - i2;
  }
  function position() {
    var start = { line: lineno, column };
    return function(node) {
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }
  var Position = /* @__PURE__ */ function() {
    function Position2(start) {
      this.start = start;
      this.end = { line: lineno, column };
      this.source = options.source;
    }
    return Position2;
  }();
  Position.prototype.content = css;
  var errorsList = [];
  function error(msg) {
    var err = new Error("".concat(options.source || "", ":").concat(lineno, ":").concat(column, ": ").concat(msg));
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
    var rulesList = rules2();
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
    var node;
    var rules3 = [];
    whitespace();
    comments(rules3);
    while (css.length && css.charAt(0) !== "}" && (node = atrule() || rule())) {
      if (node !== false) {
        rules3.push(node);
        comments(rules3);
      }
    }
    return rules3;
  }
  function match(re) {
    var m = re.exec(css);
    if (!m) {
      return;
    }
    var str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }
  function whitespace() {
    match(/^\s*/);
  }
  function comments(rules3) {
    if (rules3 === void 0) {
      rules3 = [];
    }
    var c2;
    while (c2 = comment()) {
      if (c2 !== false) {
        rules3.push(c2);
      }
      c2 = comment();
    }
    return rules3;
  }
  function comment() {
    var pos = position();
    if ("/" !== css.charAt(0) || "*" !== css.charAt(1)) {
      return;
    }
    var i2 = 2;
    while ("" !== css.charAt(i2) && ("*" !== css.charAt(i2) || "/" !== css.charAt(i2 + 1))) {
      ++i2;
    }
    i2 += 2;
    if ("" === css.charAt(i2 - 1)) {
      return error("End of comment missing");
    }
    var str = css.slice(2, i2 - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i2);
    column += 2;
    return pos({
      type: "comment",
      comment: str
    });
  }
  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) {
      return;
    }
    return trim(m[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m2) {
      return m2.replace(/,/g, "\u200C");
    }).split(/\s*(?![^(]*\)),\s*/).map(function(s2) {
      return s2.replace(/\u200C/g, ",");
    });
  }
  function declaration() {
    var pos = position();
    var propMatch = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!propMatch) {
      return;
    }
    var prop = trim(propMatch[0]);
    if (!match(/^:\s*/)) {
      return error("property missing ':'");
    }
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
    var ret = pos({
      type: "declaration",
      property: prop.replace(commentre, ""),
      value: val ? trim(val[0]).replace(commentre, "") : ""
    });
    match(/^[;\s]*/);
    return ret;
  }
  function declarations() {
    var decls = [];
    if (!open()) {
      return error("missing '{'");
    }
    comments(decls);
    var decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
      decl = declaration();
    }
    if (!close()) {
      return error("missing '}'");
    }
    return decls;
  }
  function keyframe() {
    var m;
    var vals = [];
    var pos = position();
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
    var pos = position();
    var m = match(/^@([-\w]+)?keyframes\s*/);
    if (!m) {
      return;
    }
    var vendor = m[1];
    m = match(/^([-\w]+)\s*/);
    if (!m) {
      return error("@keyframes missing name");
    }
    var name = m[1];
    if (!open()) {
      return error("@keyframes missing '{'");
    }
    var frame;
    var frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }
    if (!close()) {
      return error("@keyframes missing '}'");
    }
    return pos({
      type: "keyframes",
      name,
      vendor,
      keyframes: frames
    });
  }
  function atsupports() {
    var pos = position();
    var m = match(/^@supports *([^{]+)/);
    if (!m) {
      return;
    }
    var supports = trim(m[1]);
    if (!open()) {
      return error("@supports missing '{'");
    }
    var style = comments().concat(rules2());
    if (!close()) {
      return error("@supports missing '}'");
    }
    return pos({
      type: "supports",
      supports,
      rules: style
    });
  }
  function athost() {
    var pos = position();
    var m = match(/^@host\s*/);
    if (!m) {
      return;
    }
    if (!open()) {
      return error("@host missing '{'");
    }
    var style = comments().concat(rules2());
    if (!close()) {
      return error("@host missing '}'");
    }
    return pos({
      type: "host",
      rules: style
    });
  }
  function atmedia() {
    var pos = position();
    var m = match(/^@media *([^{]+)/);
    if (!m) {
      return;
    }
    var media = trim(m[1]);
    if (!open()) {
      return error("@media missing '{'");
    }
    var style = comments().concat(rules2());
    if (!close()) {
      return error("@media missing '}'");
    }
    return pos({
      type: "media",
      media,
      rules: style
    });
  }
  function atcustommedia() {
    var pos = position();
    var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
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
    var pos = position();
    var m = match(/^@page */);
    if (!m) {
      return;
    }
    var sel = selector() || [];
    if (!open()) {
      return error("@page missing '{'");
    }
    var decls = comments();
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }
    if (!close()) {
      return error("@page missing '}'");
    }
    return pos({
      type: "page",
      selectors: sel,
      declarations: decls
    });
  }
  function atdocument() {
    var pos = position();
    var m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) {
      return;
    }
    var vendor = trim(m[1]);
    var doc = trim(m[2]);
    if (!open()) {
      return error("@document missing '{'");
    }
    var style = comments().concat(rules2());
    if (!close()) {
      return error("@document missing '}'");
    }
    return pos({
      type: "document",
      document: doc,
      vendor,
      rules: style
    });
  }
  function atfontface() {
    var pos = position();
    var m = match(/^@font-face\s*/);
    if (!m) {
      return;
    }
    if (!open()) {
      return error("@font-face missing '{'");
    }
    var decls = comments();
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }
    if (!close()) {
      return error("@font-face missing '}'");
    }
    return pos({
      type: "font-face",
      declarations: decls
    });
  }
  var atimport = _compileAtrule("import");
  var atcharset = _compileAtrule("charset");
  var atnamespace = _compileAtrule("namespace");
  function _compileAtrule(name) {
    var re = new RegExp("^@" + name + "\\s*([^;]+);");
    return function() {
      var pos = position();
      var m = match(re);
      if (!m) {
        return;
      }
      var ret = { type: name };
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
    var pos = position();
    var sel = selector();
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
  var isNode = obj && typeof obj.type === "string";
  var childParent = isNode ? obj : parent;
  for (var _i = 0, _a2 = Object.keys(obj); _i < _a2.length; _i++) {
    var k = _a2[_i];
    var value = obj[k];
    if (Array.isArray(value)) {
      value.forEach(function(v2) {
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
  var tagName = tagMap[n2.tagName] ? tagMap[n2.tagName] : n2.tagName;
  if (tagName === "link" && n2.attributes._cssText) {
    tagName = "style";
  }
  return tagName;
}
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var HOVER_SELECTOR = /([^\\]):hover/;
var HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, "g");
function addHoverClass(cssText, cache) {
  var _a2;
  if (!((_a2 = window === null || window === void 0 ? void 0 : window.HIG_CONFIGURATION) === null || _a2 === void 0 ? void 0 : _a2.enableOnHoverClass)) {
    return cssText;
  }
  var cachedStyle = cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.get(cssText);
  if (cachedStyle)
    return cachedStyle;
  var ast = parse(cssText, {
    silent: true
  });
  if (!ast.stylesheet) {
    return cssText;
  }
  var selectors = [];
  ast.stylesheet.rules.forEach(function(rule) {
    if ("selectors" in rule) {
      (rule.selectors || []).forEach(function(selector) {
        if (HOVER_SELECTOR.test(selector)) {
          selectors.push(selector);
        }
      });
    }
  });
  if (selectors.length === 0) {
    return cssText;
  }
  var selectorMatcher = new RegExp(selectors.filter(function(selector, index) {
    return selectors.indexOf(selector) === index;
  }).sort(function(a2, b) {
    return b.length - a2.length;
  }).map(function(selector) {
    return escapeRegExp(selector);
  }).join("|"), "g");
  var result = cssText.replace(selectorMatcher, function(selector) {
    var newSelector = selector.replace(HOVER_SELECTOR_GLOBAL, "$1.\\:hover");
    return "".concat(selector, ", ").concat(newSelector);
  });
  cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.set(cssText, result);
  return result;
}
function createCache() {
  var stylesWithHoverClass = /* @__PURE__ */ new Map();
  return {
    stylesWithHoverClass
  };
}
function buildNode(n2, options) {
  var doc = options.doc, hackCss = options.hackCss, cache = options.cache;
  switch (n2.type) {
    case NodeType.Document:
      return doc.implementation.createDocument(null, "", null);
    case NodeType.DocumentType:
      return doc.implementation.createDocumentType(n2.name || "html", n2.publicId, n2.systemId);
    case NodeType.Element: {
      var tagName = getTagName(n2);
      var node_1;
      if (n2.isSVG) {
        node_1 = doc.createElementNS("http://www.w3.org/2000/svg", tagName);
      } else {
        node_1 = doc.createElement(tagName);
      }
      var specialAttributes = {};
      var _loop_1 = function(name_12) {
        if (!Object.prototype.hasOwnProperty.call(n2.attributes, name_12)) {
          return "continue";
        }
        var value = n2.attributes[name_12];
        if (tagName === "option" && name_12 === "selected" && value === false) {
          return "continue";
        }
        if (value === null) {
          return "continue";
        }
        if (value === true)
          value = "";
        if (name_12.startsWith("rr_")) {
          specialAttributes[name_12] = value;
          return "continue";
        }
        var isTextarea = tagName === "textarea" && name_12 === "value";
        var isRemoteOrDynamicCss = tagName === "style" && name_12 === "_cssText";
        if (isRemoteOrDynamicCss && hackCss && typeof value === "string") {
          value = addHoverClass(value, cache);
          if (typeof value === "string") {
            var regex = /url\("https:\/\/\S*(.eot|.woff2|.ttf|.woff)\S*"\)/gm;
            var m = void 0;
            var fontUrls_1 = [];
            var PROXY_URL_1 = "https://replay-cors-proxy.highlightrun.workers.dev";
            while ((m = regex.exec(value)) !== null) {
              if (m.index === regex.lastIndex) {
                regex.lastIndex++;
              }
              m.forEach(function(match, groupIndex) {
                if (groupIndex === 0) {
                  var url = match.slice(5, match.length - 2);
                  fontUrls_1.push({
                    originalUrl: url,
                    proxyUrl: url.replace(url, "".concat(PROXY_URL_1, "?url=").concat(url))
                  });
                }
              });
            }
            fontUrls_1.forEach(function(urlPair) {
              value = value.replace(urlPair.originalUrl, urlPair.proxyUrl);
            });
          }
        }
        if ((isTextarea || isRemoteOrDynamicCss) && typeof value === "string") {
          var child = doc.createTextNode(value);
          for (var _i = 0, _a2 = Array.from(node_1.childNodes); _i < _a2.length; _i++) {
            var c2 = _a2[_i];
            if (c2.nodeType === node_1.TEXT_NODE) {
              node_1.removeChild(c2);
            }
          }
          node_1.appendChild(child);
          return "continue";
        }
        try {
          if (n2.isSVG && name_12 === "xlink:href") {
            node_1.setAttributeNS("http://www.w3.org/1999/xlink", name_12, value.toString());
          } else if (name_12 === "onload" || name_12 === "onclick" || name_12.substring(0, 7) === "onmouse") {
            node_1.setAttribute("_" + name_12, value.toString());
          } else if (tagName === "meta" && n2.attributes["http-equiv"] === "Content-Security-Policy" && name_12 === "content") {
            node_1.setAttribute("csp-content", value.toString());
            return "continue";
          } else if (tagName === "link" && (n2.attributes.rel === "preload" || n2.attributes.rel === "modulepreload") && n2.attributes.as === "script") {
          } else if (tagName === "link" && n2.attributes.rel === "prefetch" && typeof n2.attributes.href === "string" && n2.attributes.href.endsWith(".js")) {
          } else if (tagName === "img" && n2.attributes.srcset && n2.attributes.rr_dataURL) {
            node_1.setAttribute("rrweb-original-srcset", n2.attributes.srcset);
          } else {
            node_1.setAttribute(name_12, value.toString());
          }
        } catch (error) {
        }
      };
      for (var name_1 in n2.attributes) {
        _loop_1(name_1);
      }
      var _loop_2 = function(name_22) {
        var value = specialAttributes[name_22];
        if (tagName === "canvas" && name_22 === "rr_dataURL") {
          var image_1 = document.createElement("img");
          image_1.onload = function() {
            var ctx = node_1.getContext("2d");
            if (ctx) {
              ctx.drawImage(image_1, 0, 0, image_1.width, image_1.height);
            }
          };
          image_1.src = value.toString();
          if (node_1.RRNodeType)
            node_1.rr_dataURL = value.toString();
        } else if (tagName === "img" && name_22 === "rr_dataURL") {
          var image = node_1;
          if (!image.currentSrc.startsWith("data:")) {
            image.setAttribute("rrweb-original-src", n2.attributes.src);
            image.src = value.toString();
          }
        }
        if (name_22 === "rr_width") {
          node_1.style.width = value.toString();
        } else if (name_22 === "rr_height") {
          node_1.style.height = value.toString();
        } else if (name_22 === "rr_mediaCurrentTime" && typeof value === "number") {
          node_1.currentTime = value;
        } else if (name_22 === "rr_mediaState") {
          switch (value) {
            case "played":
              node_1.play()["catch"](function(e2) {
                return console.warn("media playback error", e2);
              });
              break;
            case "paused":
              node_1.pause();
              break;
          }
        }
      };
      for (var name_2 in specialAttributes) {
        _loop_2(name_2);
      }
      if (n2.isShadowHost) {
        if (!node_1.shadowRoot) {
          node_1.attachShadow({ mode: "open" });
        } else {
          while (node_1.shadowRoot.firstChild) {
            node_1.shadowRoot.removeChild(node_1.shadowRoot.firstChild);
          }
        }
      }
      return node_1;
    }
    case NodeType.Text:
      return doc.createTextNode(n2.isStyle && hackCss ? addHoverClass(n2.textContent, cache) : n2.textContent);
    case NodeType.CDATA:
      return doc.createCDATASection(n2.textContent);
    case NodeType.Comment:
      return doc.createComment(n2.textContent);
    default:
      return null;
  }
}
function buildNodeWithSN(n2, options) {
  var doc = options.doc, mirror2 = options.mirror, _a2 = options.skipChild, skipChild = _a2 === void 0 ? false : _a2, _b2 = options.hackCss, hackCss = _b2 === void 0 ? true : _b2, afterAppend = options.afterAppend, cache = options.cache;
  if (mirror2.has(n2.id)) {
    var nodeInMirror = mirror2.getNode(n2.id);
    var meta = mirror2.getMeta(nodeInMirror);
    if (isNodeMetaEqual(meta, n2))
      return mirror2.getNode(n2.id);
  }
  var node = buildNode(n2, { doc, hackCss, cache });
  if (!node) {
    return null;
  }
  if (n2.rootId && mirror2.getNode(n2.rootId) !== doc) {
    mirror2.replace(n2.rootId, doc);
  }
  if (n2.type === NodeType.Document) {
    doc.close();
    doc.open();
    if (n2.compatMode === "BackCompat" && n2.childNodes && n2.childNodes[0].type !== NodeType.DocumentType) {
      if (n2.childNodes[0].type === NodeType.Element && "xmlns" in n2.childNodes[0].attributes && n2.childNodes[0].attributes.xmlns === "http://www.w3.org/1999/xhtml") {
        doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">');
      } else {
        doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">');
      }
    }
    node = doc;
  }
  mirror2.add(node, n2);
  if ((n2.type === NodeType.Document || n2.type === NodeType.Element) && !skipChild) {
    var _loop_3 = function(childN2) {
      var childNode = buildNodeWithSN(childN2, {
        doc,
        mirror: mirror2,
        skipChild: false,
        hackCss,
        afterAppend,
        cache
      });
      if (!childNode) {
        console.warn("Failed to rebuild", childN2);
        return "continue";
      }
      if (childN2.isShadow && isElement(node) && node.shadowRoot) {
        node.shadowRoot.appendChild(childNode);
      } else if (n2.type === NodeType.Document && childN2.type == NodeType.Element) {
        var htmlElement = childNode;
        var body_1 = null;
        htmlElement.childNodes.forEach(function(child) {
          if (child.nodeName === "BODY")
            body_1 = child;
        });
        if (body_1) {
          htmlElement.removeChild(body_1);
          node.appendChild(childNode);
          htmlElement.appendChild(body_1);
        } else {
          node.appendChild(childNode);
        }
      } else {
        node.appendChild(childNode);
      }
      if (afterAppend) {
        afterAppend(childNode, childN2.id);
      }
    };
    for (var _i = 0, _c = n2.childNodes; _i < _c.length; _i++) {
      var childN = _c[_i];
      _loop_3(childN);
    }
  }
  return node;
}
function visit(mirror2, onVisit) {
  function walk(node) {
    onVisit(node);
  }
  for (var _i = 0, _a2 = mirror2.getIds(); _i < _a2.length; _i++) {
    var id = _a2[_i];
    if (mirror2.has(id)) {
      walk(mirror2.getNode(id));
    }
  }
}
function handleScroll(node, mirror2) {
  var n2 = mirror2.getMeta(node);
  if ((n2 === null || n2 === void 0 ? void 0 : n2.type) !== NodeType.Element) {
    return;
  }
  var el = node;
  for (var name_3 in n2.attributes) {
    if (!(Object.prototype.hasOwnProperty.call(n2.attributes, name_3) && name_3.startsWith("rr_"))) {
      continue;
    }
    var value = n2.attributes[name_3];
    if (name_3 === "rr_scrollLeft") {
      el.scrollLeft = value;
    }
    if (name_3 === "rr_scrollTop") {
      el.scrollTop = value;
    }
  }
}
function rebuild(n2, options) {
  var doc = options.doc, onVisit = options.onVisit, _a2 = options.hackCss, hackCss = _a2 === void 0 ? true : _a2, afterAppend = options.afterAppend, cache = options.cache, _b2 = options.mirror, mirror2 = _b2 === void 0 ? new Mirror() : _b2;
  var node = buildNodeWithSN(n2, {
    doc,
    mirror: mirror2,
    skipChild: false,
    hackCss,
    afterAppend,
    cache
  });
  visit(mirror2, function(visitedNode) {
    if (onVisit) {
      onVisit(visitedNode);
    }
    handleScroll(visitedNode, mirror2);
  });
  return node;
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/utils.js
var utils_exports = {};
__export(utils_exports, {
  StyleSheetMirror: () => StyleSheetMirror,
  _mirror: () => _mirror,
  getBaseDimension: () => getBaseDimension,
  getNestedRule: () => getNestedRule,
  getPositionsAndIndex: () => getPositionsAndIndex,
  getRootShadowHost: () => getRootShadowHost,
  getShadowHost: () => getShadowHost,
  getWindowHeight: () => getWindowHeight,
  getWindowScroll: () => getWindowScroll,
  getWindowWidth: () => getWindowWidth,
  hasShadowRoot: () => hasShadowRoot,
  hookSetter: () => hookSetter,
  inDom: () => inDom,
  isAncestorRemoved: () => isAncestorRemoved,
  isBlocked: () => isBlocked,
  isCanvasNode: () => isCanvasNode,
  isIgnored: () => isIgnored,
  isSerialized: () => isSerialized,
  isSerializedIframe: () => isSerializedIframe,
  isSerializedStylesheet: () => isSerializedStylesheet,
  isTouchEvent: () => isTouchEvent,
  iterateResolveTree: () => iterateResolveTree,
  on: () => on,
  patch: () => patch,
  polyfill: () => polyfill,
  queueToResolveTrees: () => queueToResolveTrees,
  shadowHostInDom: () => shadowHostInDom,
  throttle: () => throttle,
  uniqueTextMutations: () => uniqueTextMutations
});
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
  win.Object.defineProperty(target, key, isRevoked ? d : {
    set(value) {
      setTimeout(() => {
        d.set.call(this, value);
      }, 0);
      if (original && original.set) {
        original.set.call(this, value);
      }
    }
  });
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
  } catch (_a2) {
    return () => {
    };
  }
}
function getWindowScroll(win) {
  var _a2, _b2, _c, _d, _e, _f;
  const doc = win.document;
  return {
    left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollLeft) || ((_b2 = (_a2 = doc === null || doc === void 0 ? void 0 : doc.body) === null || _a2 === void 0 ? void 0 : _a2.parentElement) === null || _b2 === void 0 ? void 0 : _b2.scrollLeft) || ((_c = doc === null || doc === void 0 ? void 0 : doc.body) === null || _c === void 0 ? void 0 : _c.scrollLeft) || 0,
    top: doc.scrollingElement ? doc.scrollingElement.scrollTop : win.pageYOffset !== void 0 ? win.pageYOffset : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollTop) || ((_e = (_d = doc === null || doc === void 0 ? void 0 : doc.body) === null || _d === void 0 ? void 0 : _d.parentElement) === null || _e === void 0 ? void 0 : _e.scrollTop) || ((_f = doc === null || doc === void 0 ? void 0 : doc.body) === null || _f === void 0 ? void 0 : _f.scrollTop) || 0
  };
}
function getWindowHeight() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function getWindowWidth() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
var isCanvasNode = (node) => {
  try {
    if (node instanceof HTMLElement) {
      return node.tagName === "CANVAS";
    }
  } catch (_a2) {
    return false;
  }
  return false;
};
function isBlocked(node, blockClass, blockSelector, checkAncestors) {
  if (!node) {
    return false;
  }
  const el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
  if (!el)
    return false;
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
function isIgnored(n2, mirror2) {
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
  if (target.parentNode && target.parentNode.nodeType === target.DOCUMENT_NODE) {
    return false;
  }
  if (!target.parentNode) {
    return true;
  }
  return isAncestorRemoved(target.parentNode, mirror2);
}
function isTouchEvent(event) {
  return Boolean(event.changedTouches);
}
function polyfill(win = window) {
  if ("NodeList" in win && !win.NodeList.prototype.forEach) {
    win.NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
    win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
  }
  if (!Node.prototype.contains) {
    Node.prototype.contains = (...args) => {
      let node = args[0];
      if (!(0 in args)) {
        throw new TypeError("1 argument is required");
      }
      do {
        if (this === node) {
          return true;
        }
      } while (node = node && node.parentNode);
      return false;
    };
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
        nextInTree.parent.children.splice(idx, 0, putIntoMap(mutation, nextInTree.parent));
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
  return Boolean(n2.nodeName === "LINK" && n2.nodeType === n2.ELEMENT_NODE && n2.getAttribute && n2.getAttribute("rel") === "stylesheet" && mirror2.getMeta(n2));
}
function getBaseDimension(node, rootIframe) {
  var _a2, _b2;
  const frameElement = (_b2 = (_a2 = node.ownerDocument) === null || _a2 === void 0 ? void 0 : _a2.defaultView) === null || _b2 === void 0 ? void 0 : _b2.frameElement;
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
  return Boolean(n2 === null || n2 === void 0 ? void 0 : n2.shadowRoot);
}
function getNestedRule(rules2, position) {
  const rule = rules2[position[0]];
  if (position.length === 1) {
    return rule;
  } else {
    return getNestedRule(rule.cssRules[position[1]].cssRules, position.slice(2));
  }
}
function getPositionsAndIndex(nestedIndex) {
  const positions = [...nestedIndex];
  const index = positions.pop();
  return { positions, index };
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
    this.id = 1;
    this.styleIDMap = /* @__PURE__ */ new WeakMap();
    this.idStyleMap = /* @__PURE__ */ new Map();
  }
  getId(stylesheet) {
    var _a2;
    return (_a2 = this.styleIDMap.get(stylesheet)) !== null && _a2 !== void 0 ? _a2 : -1;
  }
  has(stylesheet) {
    return this.styleIDMap.has(stylesheet);
  }
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
  var _a2, _b2;
  let shadowHost = null;
  if (((_b2 = (_a2 = n2.getRootNode) === null || _a2 === void 0 ? void 0 : _a2.call(n2)) === null || _b2 === void 0 ? void 0 : _b2.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && n2.getRootNode().host)
    shadowHost = n2.getRootNode().host;
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
  return doc.contains(shadowHost);
}
function inDom(n2) {
  const doc = n2.ownerDocument;
  if (!doc)
    return false;
  return doc.contains(n2) || shadowHostInDom(n2);
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/types/dist/rrweb-types.js
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
var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
  CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
  CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
  CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
  return CanvasContext2;
})(CanvasContext || {});
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/mutation.js
function isNodeInLinkedList(n2) {
  return "__ln" in n2;
}
var DoubleLinkedList = class {
  constructor() {
    this.length = 0;
    this.head = null;
  }
  get(position) {
    if (position >= this.length) {
      throw new Error("Position outside of list range");
    }
    let current = this.head;
    for (let index = 0; index < position; index++) {
      current = (current === null || current === void 0 ? void 0 : current.next) || null;
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
      }
    } else {
      current.previous.next = current.next;
      if (current.next) {
        current.next.previous = current.previous;
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
    this.frozen = false;
    this.locked = false;
    this.texts = [];
    this.attributes = [];
    this.removes = [];
    this.mapRemoves = [];
    this.movedMap = {};
    this.addedSet = /* @__PURE__ */ new Set();
    this.movedSet = /* @__PURE__ */ new Set();
    this.droppedSet = /* @__PURE__ */ new Set();
    this.processMutations = (mutations) => {
      mutations.forEach(this.processMutation);
      this.emit();
    };
    this.emit = () => {
      if (this.frozen || this.locked) {
        return;
      }
      const adds = [];
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
        if (!n2.parentNode || !inDom(n2)) {
          return;
        }
        const parentId = isShadowRoot(n2.parentNode) ? this.mirror.getId(getShadowHost(n2)) : this.mirror.getId(n2.parentNode);
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
              this.stylesheetManager.trackLinkElement(currentN);
            }
            if (hasShadowRoot(n2)) {
              this.shadowDomManager.addShadowRoot(n2.shadowRoot, this.doc);
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
        }
      };
      while (this.mapRemoves.length) {
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      }
      for (const n2 of this.movedSet) {
        if (isParentRemoved(this.removes, n2, this.mirror) && !this.movedSet.has(n2.parentNode)) {
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
          const parentId = this.mirror.getId(candidate.value.parentNode);
          const nextId = getNextId(candidate.value);
          if (parentId !== -1 && nextId !== -1) {
            node = candidate;
          }
        }
        if (!node) {
          for (let index = addList.length - 1; index >= 0; index--) {
            const _node = addList.get(index);
            if (_node) {
              const parentId = this.mirror.getId(_node.value.parentNode);
              const nextId = getNextId(_node.value);
              if (nextId === -1)
                continue;
              else if (parentId !== -1) {
                node = _node;
                break;
              } else {
                const unhandledNode = _node.value;
                if (unhandledNode.parentNode && unhandledNode.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const shadowHost = unhandledNode.parentNode.host;
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
          var _a2, _b2;
          let value = text.value;
          const enableStrictPrivacy = this.privacySetting === "strict";
          const obfuscateDefaultPrivacy = this.privacySetting === "default" && shouldObfuscateTextByDefault(value);
          const highlightOverwriteRecord = (_b2 = (_a2 = text.node) === null || _a2 === void 0 ? void 0 : _a2.parentElement) === null || _b2 === void 0 ? void 0 : _b2.getAttribute("data-hl-record");
          if ((enableStrictPrivacy || obfuscateDefaultPrivacy) && highlightOverwriteRecord && value) {
            value = obfuscateText(value);
          }
          return {
            id: this.mirror.getId(text.node),
            value
          };
        }).filter((text) => this.mirror.has(text.id)),
        attributes: this.attributes.map((attribute) => ({
          id: this.mirror.getId(attribute.node),
          attributes: attribute.attributes
        })).filter((attribute) => this.mirror.has(attribute.id)),
        removes: this.removes,
        adds
      };
      if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) {
        return;
      }
      this.texts = [];
      this.attributes = [];
      this.removes = [];
      this.addedSet = /* @__PURE__ */ new Set();
      this.movedSet = /* @__PURE__ */ new Set();
      this.droppedSet = /* @__PURE__ */ new Set();
      this.movedMap = {};
      this.mutationCb(payload);
    };
    this.processMutation = (m) => {
      if (isIgnored(m.target, this.mirror)) {
        return;
      }
      switch (m.type) {
        case "characterData": {
          const value = m.target.textContent;
          if (!isBlocked(m.target, this.blockClass, this.blockSelector, false) && value !== m.oldValue) {
            this.texts.push({
              value: needMaskingText(m.target, this.maskTextClass, this.maskTextSelector) && value ? this.maskTextFn ? this.maskTextFn(value) : value.replace(/[\S]/g, "*") : value,
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
          let item = this.attributes.find((a2) => a2.node === m.target);
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
              attributes: {}
            };
            this.attributes.push(item);
          }
          if (attributeName === "type" && target.tagName === "INPUT" && (m.oldValue || "").toLowerCase() === "password") {
            target.setAttribute("data-rr-is-password", "true");
          }
          if (attributeName === "style") {
            const old = this.doc.createElement("span");
            if (m.oldValue) {
              old.setAttribute("style", m.oldValue);
            }
            if (item.attributes.style === void 0 || item.attributes.style === null) {
              item.attributes.style = {};
            }
            const styleObj = item.attributes.style;
            for (const pname of Array.from(target.style)) {
              const newValue = target.style.getPropertyValue(pname);
              const newPriority = target.style.getPropertyPriority(pname);
              if (newValue !== old.style.getPropertyValue(pname) || newPriority !== old.style.getPropertyPriority(pname)) {
                if (newPriority === "") {
                  styleObj[pname] = newValue;
                } else {
                  styleObj[pname] = [newValue, newPriority];
                }
              }
            }
            for (const pname of Array.from(old.style)) {
              if (target.style.getPropertyValue(pname) === "") {
                styleObj[pname] = false;
              }
            }
          } else if (!ignoreAttribute(target.tagName, attributeName)) {
            const tagName = m.target.tagName;
            if (tagName === "INPUT") {
              const node = m.target;
              if (node.type === "password") {
                item.attributes["value"] = "*".repeat(node.value.length);
                break;
              }
            }
            item.attributes[attributeName] = transformAttribute(this.doc, target.tagName, attributeName, value);
          }
          break;
        }
        case "childList": {
          if (isBlocked(m.target, this.blockClass, this.blockSelector, true))
            return;
          m.addedNodes.forEach((n2) => this.genAdds(n2, m.target));
          m.removedNodes.forEach((n2) => {
            const nodeId = this.mirror.getId(n2);
            const parentId = isShadowRoot(m.target) ? this.mirror.getId(m.target.host) : this.mirror.getId(m.target);
            if (isBlocked(m.target, this.blockClass, this.blockSelector, false) || isIgnored(n2, this.mirror) || !isSerialized(n2, this.mirror)) {
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
    };
    this.genAdds = (n2, target) => {
      if (this.processedNodeManager.inOtherBuffer(n2, this))
        return;
      if (this.mirror.hasNode(n2)) {
        if (isIgnored(n2, this.mirror)) {
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
        n2.childNodes.forEach((childN) => this.genAdds(childN));
        if (hasShadowRoot(n2)) {
          n2.shadowRoot.childNodes.forEach((childN) => {
            this.processedNodeManager.add(childN, this);
            this.genAdds(childN, n2);
          });
        }
      }
    };
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
  n2.childNodes.forEach((childN) => deepDelete(addsSet, childN));
}
function isParentRemoved(removes, n2, mirror2) {
  if (removes.length === 0)
    return false;
  return _isParentRemoved(removes, n2, mirror2);
}
function _isParentRemoved(removes, n2, mirror2) {
  const { parentNode } = n2;
  if (!parentNode) {
    return false;
  }
  const parentId = mirror2.getId(parentNode);
  if (removes.some((r2) => r2.id === parentId)) {
    return true;
  }
  return _isParentRemoved(removes, parentNode, mirror2);
}
function isAncestorInSet(set, n2) {
  if (set.size === 0)
    return false;
  return _isAncestorInSet(set, n2);
}
function _isAncestorInSet(set, n2) {
  const { parentNode } = n2;
  if (!parentNode) {
    return false;
  }
  if (set.has(parentNode)) {
    return true;
  }
  return _isAncestorInSet(set, parentNode);
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/error-handler.js
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/observer.js
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
    return event.target;
  } catch (_a2) {
    return event.target;
  }
}
function initMutationObserver(options, rootEl) {
  var _a2, _b2;
  const mutationBuffer = new MutationBuffer();
  mutationBuffers.push(mutationBuffer);
  mutationBuffer.init(options);
  let mutationObserverCtor = window.MutationObserver || window.__rrMutationObserver;
  const angularZoneSymbol = (_b2 = (_a2 = window === null || window === void 0 ? void 0 : window.Zone) === null || _a2 === void 0 ? void 0 : _a2.__symbol__) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, "MutationObserver");
  if (angularZoneSymbol && window[angularZoneSymbol]) {
    mutationObserverCtor = window[angularZoneSymbol];
  }
  const observer = new mutationObserverCtor(callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer)));
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
function initMoveObserver({ mousemoveCb, sampling, doc, mirror: mirror2 }) {
  if (sampling.mousemove === false) {
    return () => {
    };
  }
  const threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
  const callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
  let positions = [];
  let timeBaseline;
  const wrappedCb = throttle(callbackWrapper((source) => {
    const totalOffset = Date.now() - timeBaseline;
    mousemoveCb(positions.map((p) => {
      p.timeOffset -= totalOffset;
      return p;
    }), source);
    positions = [];
    timeBaseline = null;
  }), callbackThreshold);
  const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
    const target = getEventTarget(evt);
    const { clientX, clientY } = isTouchEvent(evt) ? evt.changedTouches[0] : evt;
    if (!timeBaseline) {
      timeBaseline = Date.now();
    }
    positions.push({
      x: clientX,
      y: clientY,
      id: mirror2.getId(target),
      timeOffset: Date.now() - timeBaseline
    });
    wrappedCb(typeof DragEvent !== "undefined" && evt instanceof DragEvent ? IncrementalSource.Drag : evt instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
  }), threshold, {
    trailing: false
  }));
  const handlers = [
    on("mousemove", updatePosition, doc),
    on("touchmove", updatePosition, doc),
    on("drag", updatePosition, doc)
  ];
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function initMouseInteractionObserver({ mouseInteractionCb, doc, mirror: mirror2, blockClass, blockSelector, sampling }) {
  if (sampling.mouseInteraction === false) {
    return () => {
    };
  }
  const disableMap = sampling.mouseInteraction === true || sampling.mouseInteraction === void 0 ? {} : sampling.mouseInteraction;
  const handlers = [];
  const getHandler = (eventKey) => {
    return (event) => {
      const target = getEventTarget(event);
      if (isBlocked(target, blockClass, blockSelector, true) || isCanvasNode(target)) {
        return;
      }
      const e2 = isTouchEvent(event) ? event.changedTouches[0] : event;
      if (!e2) {
        return;
      }
      const id = mirror2.getId(target);
      const { clientX, clientY } = e2;
      callbackWrapper(mouseInteractionCb)({
        type: MouseInteractions[eventKey],
        id,
        x: clientX,
        y: clientY
      });
    };
  };
  Object.keys(MouseInteractions).filter((key) => Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false).forEach((eventKey) => {
    const eventName = eventKey.toLowerCase();
    const handler = getHandler(eventKey);
    handlers.push(on(eventName, handler, doc));
  });
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function initScrollObserver({ scrollCb, doc, mirror: mirror2, blockClass, blockSelector, sampling }) {
  const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
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
  }), sampling.scroll || 100));
  return on("scroll", updatePosition, doc);
}
function initViewportResizeObserver({ viewportResizeCb }) {
  let lastH = -1;
  let lastW = -1;
  const updateDimension = callbackWrapper(throttle(callbackWrapper(() => {
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
  }), 200));
  return on("resize", updateDimension, window);
}
function wrapEventWithUserTriggeredFlag(v2, enable) {
  const value = Object.assign({}, v2);
  if (!enable)
    delete value.userTriggered;
  return value;
}
var INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];
var lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver({ inputCb, doc, mirror: mirror2, blockClass, blockSelector, ignoreClass, maskInputOptions, maskInputFn, sampling, userTriggeredOnInput }) {
  function eventHandler(event) {
    let target = getEventTarget(event);
    const userTriggered = event.isTrusted;
    const tagName = target && target.tagName;
    if (target && tagName === "OPTION") {
      target = target.parentElement;
    }
    if (!target || !tagName || INPUT_TAGS.indexOf(tagName) < 0 || isBlocked(target, blockClass, blockSelector, true)) {
      return;
    }
    if (target.classList.contains(ignoreClass)) {
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
        maskInputOptions,
        tagName,
        type,
        value: text,
        overwriteRecord,
        maskInputFn
      });
    }
    cbWithDedup(target, callbackWrapper(wrapEventWithUserTriggeredFlag)({ text, isChecked, userTriggered }, userTriggeredOnInput));
    const name = target.name;
    if (type === "radio" && name && isChecked) {
      doc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el) => {
        if (el !== target) {
          cbWithDedup(el, callbackWrapper(wrapEventWithUserTriggeredFlag)({
            text: el.value,
            isChecked: !isChecked,
            userTriggered: false
          }, userTriggeredOnInput));
        }
      });
    }
  }
  function cbWithDedup(target, v2) {
    const lastInputValue = lastInputValueMap.get(target);
    if (!lastInputValue || lastInputValue.text !== v2.text || lastInputValue.isChecked !== v2.isChecked) {
      lastInputValueMap.set(target, v2);
      const id = mirror2.getId(target);
      callbackWrapper(inputCb)(Object.assign(Object.assign({}, v2), { id }));
    }
  }
  const events = sampling.input === "last" ? ["change"] : ["input", "change"];
  const handlers = events.map((eventName) => on(eventName, callbackWrapper(eventHandler), doc));
  const currentWindow = doc.defaultView;
  if (!currentWindow) {
    return () => {
      handlers.forEach((h) => h());
    };
  }
  const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(currentWindow.HTMLInputElement.prototype, "value");
  const hookProperties = [
    [currentWindow.HTMLInputElement.prototype, "value"],
    [currentWindow.HTMLInputElement.prototype, "checked"],
    [currentWindow.HTMLSelectElement.prototype, "value"],
    [currentWindow.HTMLTextAreaElement.prototype, "value"],
    [currentWindow.HTMLSelectElement.prototype, "selectedIndex"],
    [currentWindow.HTMLOptionElement.prototype, "selected"]
  ];
  if (propertyDescriptor && propertyDescriptor.set) {
    handlers.push(...hookProperties.map((p) => hookSetter(p[0], p[1], {
      set() {
        callbackWrapper(eventHandler)({
          target: this,
          isTrusted: false
        });
      }
    }, false, currentWindow)));
  }
  return callbackWrapper(() => {
    handlers.forEach((h) => h());
  });
}
function getNestedCSSRulePositions(rule) {
  const positions = [];
  function recurse(childRule, pos) {
    if (hasNestedCSSRule("CSSGroupingRule") && childRule.parentRule instanceof CSSGroupingRule || hasNestedCSSRule("CSSMediaRule") && childRule.parentRule instanceof CSSMediaRule || hasNestedCSSRule("CSSSupportsRule") && childRule.parentRule instanceof CSSSupportsRule || hasNestedCSSRule("CSSConditionRule") && childRule.parentRule instanceof CSSConditionRule) {
      const rules2 = Array.from(childRule.parentRule.cssRules);
      const index = rules2.indexOf(childRule);
      pos.unshift(index);
    } else if (childRule.parentStyleSheet) {
      const rules2 = Array.from(childRule.parentStyleSheet.cssRules);
      const index = rules2.indexOf(childRule);
      pos.unshift(index);
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
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      const [rule, index] = argumentsList;
      const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleSheetRuleCb({
          id,
          styleId,
          adds: [{ rule, index }]
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
  win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      const [index] = argumentsList;
      const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleSheetRuleCb({
          id,
          styleId,
          removes: [{ index }]
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  let replace;
  if (win.CSSStyleSheet.prototype.replace) {
    replace = win.CSSStyleSheet.prototype.replace;
    win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [text] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            replace: text
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
  }
  let replaceSync;
  if (win.CSSStyleSheet.prototype.replaceSync) {
    replaceSync = win.CSSStyleSheet.prototype.replaceSync;
    win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [text] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            replaceSync: text
          });
        }
        return target.apply(thisArg, argumentsList);
      })
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
      insertRule: type.prototype.insertRule,
      deleteRule: type.prototype.deleteRule
    };
    type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [rule, index] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            adds: [
              {
                rule,
                index: [
                  ...getNestedCSSRulePositions(thisArg),
                  index || 0
                ]
              }
            ]
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
    type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [index] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            removes: [
              { index: [...getNestedCSSRulePositions(thisArg), index] }
            ]
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
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
function initAdoptedStyleSheetObserver({ mirror: mirror2, stylesheetManager }, host) {
  var _a2, _b2, _c;
  let hostId = null;
  if (host.nodeName === "#document")
    hostId = mirror2.getId(host);
  else
    hostId = mirror2.getId(host.host);
  const patchTarget = host.nodeName === "#document" ? (_a2 = host.defaultView) === null || _a2 === void 0 ? void 0 : _a2.Document : (_c = (_b2 = host.ownerDocument) === null || _b2 === void 0 ? void 0 : _b2.defaultView) === null || _c === void 0 ? void 0 : _c.ShadowRoot;
  const originalPropertyDescriptor = Object.getOwnPropertyDescriptor(patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype, "adoptedStyleSheets");
  if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor)
    return () => {
    };
  Object.defineProperty(host, "adoptedStyleSheets", {
    configurable: originalPropertyDescriptor.configurable,
    enumerable: originalPropertyDescriptor.enumerable,
    get() {
      var _a3;
      return (_a3 = originalPropertyDescriptor.get) === null || _a3 === void 0 ? void 0 : _a3.call(this);
    },
    set(sheets) {
      var _a3;
      const result = (_a3 = originalPropertyDescriptor.set) === null || _a3 === void 0 ? void 0 : _a3.call(this, sheets);
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
    Object.defineProperty(host, "adoptedStyleSheets", {
      configurable: originalPropertyDescriptor.configurable,
      enumerable: originalPropertyDescriptor.enumerable,
      get: originalPropertyDescriptor.get,
      set: originalPropertyDescriptor.set
    });
  });
}
function initStyleDeclarationObserver({ styleDeclarationCb, mirror: mirror2, ignoreCSSAttributes, stylesheetManager }, { win }) {
  const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
  win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      var _a2;
      const [property, value, priority] = argumentsList;
      if (ignoreCSSAttributes.has(property)) {
        return setProperty.apply(thisArg, [property, value, priority]);
      }
      const { id, styleId } = getIdAndStyleId((_a2 = thisArg.parentRule) === null || _a2 === void 0 ? void 0 : _a2.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleDeclarationCb({
          id,
          styleId,
          set: {
            property,
            value,
            priority
          },
          index: getNestedCSSRulePositions(thisArg.parentRule)
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
  win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
    apply: callbackWrapper((target, thisArg, argumentsList) => {
      var _a2;
      const [property] = argumentsList;
      if (ignoreCSSAttributes.has(property)) {
        return removeProperty.apply(thisArg, [property]);
      }
      const { id, styleId } = getIdAndStyleId((_a2 = thisArg.parentRule) === null || _a2 === void 0 ? void 0 : _a2.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
      if (id && id !== -1 || styleId && styleId !== -1) {
        styleDeclarationCb({
          id,
          styleId,
          remove: {
            property
          },
          index: getNestedCSSRulePositions(thisArg.parentRule)
        });
      }
      return target.apply(thisArg, argumentsList);
    })
  });
  return callbackWrapper(() => {
    win.CSSStyleDeclaration.prototype.setProperty = setProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
  });
}
function initMediaInteractionObserver({ mediaInteractionCb, blockClass, blockSelector, mirror: mirror2, sampling }) {
  const handler = callbackWrapper((type) => throttle(callbackWrapper((event) => {
    const target = getEventTarget(event);
    if (!target || isBlocked(target, blockClass, blockSelector, true)) {
      return;
    }
    const { currentTime, volume, muted, playbackRate } = target;
    mediaInteractionCb({
      type,
      id: mirror2.getId(target),
      currentTime,
      volume,
      muted,
      playbackRate
    });
  }), sampling.media || 500));
  const handlers = [
    on("play", handler(0)),
    on("pause", handler(1)),
    on("seeked", handler(2)),
    on("volumechange", handler(3)),
    on("ratechange", handler(4))
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
  const restoreHandler = patch(doc.fonts, "add", function(original) {
    return function(fontFace) {
      setTimeout(callbackWrapper(() => {
        const p = fontMap.get(fontFace);
        if (p) {
          fontCb(p);
          fontMap.delete(fontFace);
        }
      }), 0);
      return original.apply(this, [fontFace]);
    };
  });
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
    if (!selection || collapsed && (selection === null || selection === void 0 ? void 0 : selection.isCollapsed))
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
function mergeHooks(o2, hooks) {
  const { mutationCb, mousemoveCb, mouseInteractionCb, scrollCb, viewportResizeCb, inputCb, mediaInteractionCb, styleSheetRuleCb, styleDeclarationCb, canvasMutationCb, fontCb, selectionCb } = o2;
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
}
function initObservers(o2, hooks = {}) {
  const currentWindow = o2.doc.defaultView;
  if (!currentWindow) {
    return () => {
    };
  }
  mergeHooks(o2, hooks);
  const mutationObserver = initMutationObserver(o2, o2.doc);
  const mousemoveHandler = initMoveObserver(o2);
  const mouseInteractionHandler = initMouseInteractionObserver(o2);
  const scrollHandler = initScrollObserver(o2);
  const viewportResizeHandler = initViewportResizeObserver(o2);
  const inputHandler = initInputObserver(o2);
  const mediaInteractionHandler = initMediaInteractionObserver(o2);
  const styleSheetObserver = initStyleSheetObserver(o2, { win: currentWindow });
  const adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o2, o2.doc);
  const styleDeclarationObserver = initStyleDeclarationObserver(o2, {
    win: currentWindow
  });
  const fontObserver = o2.collectFonts ? initFontObserver(o2) : () => {
  };
  const selectionObserver = initSelectionObserver(o2);
  const pluginHandlers = [];
  for (const plugin of o2.plugins) {
    pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
  }
  return callbackWrapper(() => {
    mutationBuffers.forEach((b) => b.reset());
    mutationObserver.disconnect();
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
    pluginHandlers.forEach((h) => h());
  });
}
function hasNestedCSSRule(prop) {
  return typeof window[prop] !== "undefined";
}
function canMonkeyPatchNestedCSSRule(prop) {
  return Boolean(typeof window[prop] !== "undefined" && window[prop].prototype && "insertRule" in window[prop].prototype && "deleteRule" in window[prop].prototype);
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/cross-origin-iframe-mirror.js
var CrossOriginIframeMirror = class {
  constructor(generateIdFn) {
    this.generateIdFn = generateIdFn;
    this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
    this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
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
    return remoteId.map((id) => this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap));
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/iframe-manager.js
var IframeManager = class {
  constructor(options) {
    this.iframes = /* @__PURE__ */ new WeakMap();
    this.crossOriginIframeMap = /* @__PURE__ */ new WeakMap();
    this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
    this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap();
    this.mutationCb = options.mutationCb;
    this.wrappedEmit = options.wrappedEmit;
    this.stylesheetManager = options.stylesheetManager;
    this.recordCrossOriginIframes = options.recordCrossOriginIframes;
    this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror));
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
    var _a2;
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
    (_a2 = this.loadListener) === null || _a2 === void 0 ? void 0 : _a2.call(this, iframeEl);
    if (iframeEl.contentDocument && iframeEl.contentDocument.adoptedStyleSheets && iframeEl.contentDocument.adoptedStyleSheets.length > 0)
      this.stylesheetManager.adoptStyleSheets(iframeEl.contentDocument.adoptedStyleSheets, this.mirror.getId(iframeEl.contentDocument));
  }
  handleMessage(message) {
    const crossOriginMessageEvent = message;
    if (crossOriginMessageEvent.data.type !== "rrweb" || crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin)
      return;
    const iframeSourceWindow = message.source;
    if (!iframeSourceWindow)
      return;
    const iframeEl = this.crossOriginIframeMap.get(iframeSourceWindow);
    if (!iframeEl)
      return;
    const transformedEvent = this.transformCrossOriginEvent(iframeEl, crossOriginMessageEvent.data.event);
    if (transformedEvent)
      this.wrappedEmit(transformedEvent, crossOriginMessageEvent.data.isCheckout);
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
        this.replaceIds(e2.data.payload, iframeEl, ["id", "parentId", "previousId", "nextId"]);
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
            (_a2 = e2.data.styles) === null || _a2 === void 0 ? void 0 : _a2.forEach((style) => {
              this.replaceStyleIds(style, iframeEl, ["styleId"]);
            });
            return e2;
          }
        }
      }
    }
  }
  replace(iframeMirror, obj, iframeEl, keys) {
    for (const key of keys) {
      if (!Array.isArray(obj[key]) && typeof obj[key] !== "number")
        continue;
      if (Array.isArray(obj[key])) {
        obj[key] = iframeMirror.getIds(iframeEl, obj[key]);
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
    if (node.type !== NodeType.Document && !node.rootId)
      node.rootId = rootId;
    if ("childNodes" in node) {
      node.childNodes.forEach((child) => {
        this.patchRootIdOnNode(child, rootId);
      });
    }
  }
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/shadow-dom-manager.js
var ShadowDomManager = class {
  constructor(options) {
    this.shadowDoms = /* @__PURE__ */ new WeakSet();
    this.restoreHandlers = [];
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
  addShadowRoot(shadowRoot, doc) {
    if (!isNativeShadowDom(shadowRoot))
      return;
    if (this.shadowDoms.has(shadowRoot))
      return;
    this.shadowDoms.add(shadowRoot);
    const observer = initMutationObserver(Object.assign(Object.assign({}, this.bypassOptions), { doc, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), shadowRoot);
    this.restoreHandlers.push(() => observer.disconnect());
    this.restoreHandlers.push(initScrollObserver(Object.assign(Object.assign({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: shadowRoot, mirror: this.mirror })));
    setTimeout(() => {
      if (shadowRoot.adoptedStyleSheets && shadowRoot.adoptedStyleSheets.length > 0)
        this.bypassOptions.stylesheetManager.adoptStyleSheets(shadowRoot.adoptedStyleSheets, this.mirror.getId(shadowRoot.host));
      this.restoreHandlers.push(initAdoptedStyleSheetObserver({
        mirror: this.mirror,
        stylesheetManager: this.bypassOptions.stylesheetManager
      }, shadowRoot));
    }, 0);
  }
  observeAttachShadow(iframeElement) {
    if (!iframeElement.contentWindow || !iframeElement.contentDocument)
      return;
    this.patchAttachShadow(iframeElement.contentWindow.Element, iframeElement.contentDocument);
  }
  patchAttachShadow(element, doc) {
    const manager = this;
    this.restoreHandlers.push(patch(element.prototype, "attachShadow", function(original) {
      return function(option) {
        const shadowRoot = original.call(this, option);
        if (this.shadowRoot && inDom(this))
          manager.addShadowRoot(this.shadowRoot, doc);
        return shadowRoot;
      };
    }));
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

// ../rrweb/packages/rrweb/es/rrweb/ext/base64-arraybuffer/dist/base64-arraybuffer.es5.js
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (i2 = 0; i2 < chars.length; i2++) {
  lookup[chars.charCodeAt(i2)] = i2;
}
var i2;
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/observers/canvas/serialize-args.js
var canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor(ctx, ctor) {
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
  const list = variableListFor(ctx, name);
  let index = list.indexOf(value);
  if (index === -1) {
    index = list.length;
    list.push(value);
  }
  return index;
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
  } else if (value instanceof ArrayBuffer) {
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
    const index = saveWebGLVar(value, win, ctx);
    return {
      rr_type: name,
      index
    };
  }
  return value;
}
var serializeArgs = (args, win, ctx) => {
  return [...args].map((arg) => serializeArg(arg, win, ctx));
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
    "WebGLVertexArrayObjectOES"
  ];
  const supportedWebGLConstructorNames = webGLConstructorNames.filter((name) => typeof win[name] === "function");
  return Boolean(supportedWebGLConstructorNames.find((name) => value instanceof win[name]));
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/observers/canvas/2d.js
function initCanvas2DMutationObserver(cb, win, blockClass, blockSelector) {
  const handlers = [];
  const props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
  for (const prop of props2D) {
    try {
      if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function(original) {
        return function(...args) {
          if (!isBlocked(this.canvas, blockClass, blockSelector, true)) {
            setTimeout(() => {
              const recordArgs = serializeArgs([...args], win, this);
              cb(this.canvas, {
                type: CanvasContext["2D"],
                property: prop,
                args: recordArgs
              });
            }, 0);
          }
          return original.apply(this, args);
        };
      });
      handlers.push(restoreHandler);
    } catch (_a2) {
      const hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
        set(v2) {
          cb(this.canvas, {
            type: CanvasContext["2D"],
            property: prop,
            args: [v2],
            setter: true
          });
        }
      });
      handlers.push(hookHandler);
    }
  }
  return () => {
    handlers.forEach((h) => h());
  };
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/observers/canvas/canvas.js
function initCanvasContextObserver(win, blockClass, blockSelector) {
  const handlers = [];
  try {
    const restoreGetContext = patch(win.HTMLCanvasElement.prototype, "getContext", function(original) {
      return function(contextType, ...args) {
        const ctx = original.apply(this, [contextType, ...args]);
        if (ctx) {
          if (!isBlocked(this, blockClass, blockSelector, true)) {
            if (!this.__context)
              this.__context = contextType;
          }
        }
        return ctx;
      };
    });
    handlers.push(restoreGetContext);
  } catch (_a2) {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    handlers.forEach((h) => h());
  };
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/observers/canvas/webgl.js
function patchGLPrototype(prototype, type, cb, blockClass, blockSelector, mirror2, win) {
  const handlers = [];
  const props = Object.getOwnPropertyNames(prototype);
  for (const prop of props) {
    if ([
      "isContextLost",
      "canvas",
      "drawingBufferWidth",
      "drawingBufferHeight"
    ].includes(prop)) {
      continue;
    }
    try {
      if (typeof prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch(prototype, prop, function(original) {
        return function(...args) {
          const result = original.apply(this, args);
          saveWebGLVar(result, win, this);
          if (!isBlocked(this.canvas, blockClass, blockSelector, true)) {
            const recordArgs = serializeArgs([...args], win, this);
            const mutation = {
              type,
              property: prop,
              args: recordArgs
            };
            cb(this.canvas, mutation);
          }
          return result;
        };
      });
      handlers.push(restoreHandler);
    } catch (_a2) {
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
function initCanvasWebGLMutationObserver(cb, win, blockClass, blockSelector, mirror2) {
  const handlers = [];
  handlers.push(...patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass, blockSelector, mirror2, win));
  if (typeof win.WebGL2RenderingContext !== "undefined") {
    handlers.push(...patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass, blockSelector, mirror2, win));
  }
  return () => {
    handlers.forEach((h) => h());
  };
}

// ../rrweb/packages/rrweb/es/rrweb/_virtual/_rollup-plugin-web-worker-loader__helper__browser__createBase64WorkerFactory.js
function decodeBase64(base64, enableUnicode) {
  var binaryString = atob(base64);
  if (enableUnicode) {
    var binaryView = new Uint8Array(binaryString.length);
    for (var i2 = 0, n2 = binaryString.length; i2 < n2; ++i2) {
      binaryView[i2] = binaryString.charCodeAt(i2);
    }
    return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
  }
  return binaryString;
}
function createURL(base64, sourcemapArg, enableUnicodeArg) {
  var sourcemap = sourcemapArg === void 0 ? null : sourcemapArg;
  var enableUnicode = enableUnicodeArg === void 0 ? false : enableUnicodeArg;
  var source = decodeBase64(base64, enableUnicode);
  var start = source.indexOf("\n", 10) + 1;
  var body = source.substring(start) + (sourcemap ? "//# sourceMappingURL=" + sourcemap : "");
  var blob = new Blob([body], { type: "application/javascript" });
  return URL.createObjectURL(blob);
}
function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
  var url;
  return function WorkerFactory2(options) {
    url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
    return new Worker(url, options);
  };
}

// ../rrweb/packages/rrweb/es/rrweb/_virtual/image-bitmap-data-url-worker.js
var WorkerFactory = createBase64WorkerFactory("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioNCiAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4NCg0KICAgIFBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueQ0KICAgIHB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC4NCg0KICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAiQVMgSVMiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIDQogICAgUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZDQogICAgQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULA0KICAgIElORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTQ0KICAgIExPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SDQogICAgT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUg0KICAgIFBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuDQogICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi8NCg0KICAgIGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHsNCiAgICAgICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9DQogICAgICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgew0KICAgICAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfQ0KICAgICAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbInRocm93Il0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfQ0KICAgICAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH0NCiAgICAgICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTsNCiAgICAgICAgfSk7DQogICAgfQoKICAgIC8qCiAgICAgKiBiYXNlNjQtYXJyYXlidWZmZXIgMS4wLjEgPGh0dHBzOi8vZ2l0aHViLmNvbS9uaWtsYXN2aC9iYXNlNjQtYXJyYXlidWZmZXI+CiAgICAgKiBDb3B5cmlnaHQgKGMpIDIwMjEgTmlrbGFzIHZvbiBIZXJ0emVuIDxodHRwczovL2hlcnR6ZW4uY29tPgogICAgICogUmVsZWFzZWQgdW5kZXIgTUlUIExpY2Vuc2UKICAgICAqLwogICAgdmFyIGNoYXJzID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nOwogICAgLy8gVXNlIGEgbG9va3VwIHRhYmxlIHRvIGZpbmQgdGhlIGluZGV4LgogICAgdmFyIGxvb2t1cCA9IHR5cGVvZiBVaW50OEFycmF5ID09PSAndW5kZWZpbmVkJyA/IFtdIDogbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpKyspIHsKICAgICAgICBsb29rdXBbY2hhcnMuY2hhckNvZGVBdChpKV0gPSBpOwogICAgfQogICAgdmFyIGVuY29kZSA9IGZ1bmN0aW9uIChhcnJheWJ1ZmZlcikgewogICAgICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKSwgaSwgbGVuID0gYnl0ZXMubGVuZ3RoLCBiYXNlNjQgPSAnJzsKICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDMpIHsKICAgICAgICAgICAgYmFzZTY0ICs9IGNoYXJzW2J5dGVzW2ldID4+IDJdOwogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbKChieXRlc1tpXSAmIDMpIDw8IDQpIHwgKGJ5dGVzW2kgKyAxXSA+PiA0KV07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1soKGJ5dGVzW2kgKyAxXSAmIDE1KSA8PCAyKSB8IChieXRlc1tpICsgMl0gPj4gNildOwogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaSArIDJdICYgNjNdOwogICAgICAgIH0KICAgICAgICBpZiAobGVuICUgMyA9PT0gMikgewogICAgICAgICAgICBiYXNlNjQgPSBiYXNlNjQuc3Vic3RyaW5nKDAsIGJhc2U2NC5sZW5ndGggLSAxKSArICc9JzsKICAgICAgICB9CiAgICAgICAgZWxzZSBpZiAobGVuICUgMyA9PT0gMSkgewogICAgICAgICAgICBiYXNlNjQgPSBiYXNlNjQuc3Vic3RyaW5nKDAsIGJhc2U2NC5sZW5ndGggLSAyKSArICc9PSc7CiAgICAgICAgfQogICAgICAgIHJldHVybiBiYXNlNjQ7CiAgICB9OwoKICAgIGNvbnN0IGxhc3RCbG9iTWFwID0gbmV3IE1hcCgpOw0KICAgIGNvbnN0IHRyYW5zcGFyZW50QmxvYk1hcCA9IG5ldyBNYXAoKTsNCiAgICBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEJsb2JGb3Iod2lkdGgsIGhlaWdodCwgZGF0YVVSTE9wdGlvbnMpIHsNCiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsNCiAgICAgICAgICAgIGNvbnN0IGlkID0gYCR7d2lkdGh9LSR7aGVpZ2h0fWA7DQogICAgICAgICAgICBpZiAoJ09mZnNjcmVlbkNhbnZhcycgaW4gZ2xvYmFsVGhpcykgew0KICAgICAgICAgICAgICAgIGlmICh0cmFuc3BhcmVudEJsb2JNYXAuaGFzKGlkKSkNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zcGFyZW50QmxvYk1hcC5nZXQoaWQpOw0KICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNjcmVlbiA9IG5ldyBPZmZzY3JlZW5DYW52YXMod2lkdGgsIGhlaWdodCk7DQogICAgICAgICAgICAgICAgb2Zmc2NyZWVuLmdldENvbnRleHQoJzJkJyk7DQogICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IHlpZWxkIG9mZnNjcmVlbi5jb252ZXJ0VG9CbG9iKGRhdGFVUkxPcHRpb25zKTsNCiAgICAgICAgICAgICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IHlpZWxkIGJsb2IuYXJyYXlCdWZmZXIoKTsNCiAgICAgICAgICAgICAgICBjb25zdCBiYXNlNjQgPSBlbmNvZGUoYXJyYXlCdWZmZXIpOw0KICAgICAgICAgICAgICAgIHRyYW5zcGFyZW50QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7DQogICAgICAgICAgICAgICAgcmV0dXJuIGJhc2U2NDsNCiAgICAgICAgICAgIH0NCiAgICAgICAgICAgIGVsc2Ugew0KICAgICAgICAgICAgICAgIHJldHVybiAnJzsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfSk7DQogICAgfQ0KICAgIGNvbnN0IHdvcmtlciA9IHNlbGY7DQogICAgbGV0IGxvZ0RlYnVnID0gZmFsc2U7DQogICAgY29uc3QgZGVidWcgPSAoLi4uYXJncykgPT4gew0KICAgICAgICBpZiAobG9nRGVidWcpIHsNCiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoLi4uYXJncyk7DQogICAgICAgIH0NCiAgICB9Ow0KICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkgew0KICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgew0KICAgICAgICAgICAgbG9nRGVidWcgPSAhIWUuZGF0YS5sb2dEZWJ1ZzsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgYml0bWFwLCB3aWR0aCwgaGVpZ2h0LCBkeCwgZHksIGR3LCBkaCwgZGF0YVVSTE9wdGlvbnMgfSA9IGUuZGF0YTsNCiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc3BhcmVudEJhc2U2NCA9IGdldFRyYW5zcGFyZW50QmxvYkZvcih3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucyk7DQogICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsNCiAgICAgICAgICAgICAgICBjb25zdCBjdHggPSBvZmZzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTsNCiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGJpdG1hcCwgMCwgMCwgd2lkdGgsIGhlaWdodCk7DQogICAgICAgICAgICAgICAgYml0bWFwLmNsb3NlKCk7DQogICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IHlpZWxkIG9mZnNjcmVlbi5jb252ZXJ0VG9CbG9iKGRhdGFVUkxPcHRpb25zKTsNCiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gYmxvYi50eXBlOw0KICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0geWllbGQgYmxvYi5hcnJheUJ1ZmZlcigpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7DQogICAgICAgICAgICAgICAgaWYgKCFsYXN0QmxvYk1hcC5oYXMoaWQpICYmICh5aWVsZCB0cmFuc3BhcmVudEJhc2U2NCkgPT09IGJhc2U2NCkgew0KICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnW2hpZ2hsaWdodC13b3JrZXJdIGNhbnZhcyBiaXRtYXAgaXMgdHJhbnNwYXJlbnQnLCB7DQogICAgICAgICAgICAgICAgICAgICAgICBpZCwNCiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2U2NCwNCiAgICAgICAgICAgICAgICAgICAgfSk7DQogICAgICAgICAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkLCBzdGF0dXM6ICd0cmFuc3BhcmVudCcgfSk7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgIGlmIChsYXN0QmxvYk1hcC5nZXQoaWQpID09PSBiYXNlNjQpIHsNCiAgICAgICAgICAgICAgICAgICAgZGVidWcoJ1toaWdobGlnaHQtd29ya2VyXSBjYW52YXMgYml0bWFwIGlzIHVuY2hhbmdlZCcsIHsNCiAgICAgICAgICAgICAgICAgICAgICAgIGlkLA0KICAgICAgICAgICAgICAgICAgICAgICAgYmFzZTY0LA0KICAgICAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkLCBzdGF0dXM6ICd1bmNoYW5nZWQnIH0pOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICBkZWJ1ZygnW2hpZ2hsaWdodC13b3JrZXJdIGNhbnZhcyBiaXRtYXAgcHJvY2Vzc2VkJywgew0KICAgICAgICAgICAgICAgICAgICBpZCwNCiAgICAgICAgICAgICAgICAgICAgYmFzZTY0LA0KICAgICAgICAgICAgICAgIH0pOw0KICAgICAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSh7DQogICAgICAgICAgICAgICAgICAgIGlkLA0KICAgICAgICAgICAgICAgICAgICB0eXBlLA0KICAgICAgICAgICAgICAgICAgICBiYXNlNjQsDQogICAgICAgICAgICAgICAgICAgIHdpZHRoLA0KICAgICAgICAgICAgICAgICAgICBoZWlnaHQsDQogICAgICAgICAgICAgICAgICAgIGR4LA0KICAgICAgICAgICAgICAgICAgICBkeSwNCiAgICAgICAgICAgICAgICAgICAgZHcsDQogICAgICAgICAgICAgICAgICAgIGRoLA0KICAgICAgICAgICAgICAgIH0pOw0KICAgICAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgICAgIGVsc2Ugew0KICAgICAgICAgICAgICAgIGRlYnVnKCdbaGlnaGxpZ2h0LXdvcmtlcl0gbm8gb2Zmc2NyZWVuY2FudmFzIHN1cHBvcnQnLCB7DQogICAgICAgICAgICAgICAgICAgIGlkOiBlLmRhdGEuaWQsDQogICAgICAgICAgICAgICAgfSk7DQogICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkOiBlLmRhdGEuaWQsIHN0YXR1czogJ3Vuc3VwcG9ydGVkJyB9KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfSk7DQogICAgfTsKCn0pKCk7Cgo=", null, false);

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/observers/canvas/canvas-manager.js
var CanvasManager = class {
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
  constructor(options) {
    this.pendingCanvasMutations = /* @__PURE__ */ new Map();
    this.rafStamps = { latestId: 0, invokeId: null };
    this.snapshotInProgressMap = /* @__PURE__ */ new Map();
    this.lastSnapshotTime = /* @__PURE__ */ new Map();
    this.frozen = false;
    this.locked = false;
    this.processMutation = (target, mutation) => {
      const newFrame = this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId;
      if (newFrame || !this.rafStamps.invokeId)
        this.rafStamps.invokeId = this.rafStamps.latestId;
      if (!this.pendingCanvasMutations.has(target)) {
        this.pendingCanvasMutations.set(target, []);
      }
      this.pendingCanvasMutations.get(target).push(mutation);
    };
    this.snapshot = (element) => __awaiter(this, void 0, void 0, function* () {
      var _a2;
      const id = this.mirror.getId(element);
      if (this.snapshotInProgressMap.get(id)) {
        this.debug(element, "snapshotting already in progress for", id);
        return;
      }
      const timeBetweenSnapshots = 1e3 / (typeof this.options.samplingManual === "number" ? this.options.samplingManual : 1);
      const lastSnapshotTime = this.lastSnapshotTime.get(id);
      if (lastSnapshotTime && (/* @__PURE__ */ new Date()).getTime() - lastSnapshotTime < timeBetweenSnapshots) {
        return;
      }
      this.debug(element, "starting snapshotting");
      this.lastSnapshotTime.set(id, (/* @__PURE__ */ new Date()).getTime());
      this.snapshotInProgressMap.set(id, true);
      try {
        if (this.options.samplingManual === void 0 && this.options.clearWebGLBuffer !== false && ["webgl", "webgl2"].includes(element.__context)) {
          const context = element.getContext(element.__context);
          if (((_a2 = context === null || context === void 0 ? void 0 : context.getContextAttributes()) === null || _a2 === void 0 ? void 0 : _a2.preserveDrawingBuffer) === false) {
            context === null || context === void 0 ? void 0 : context.clear(context === null || context === void 0 ? void 0 : context.COLOR_BUFFER_BIT);
            this.debug(element, "cleared webgl canvas to load it into memory", {
              attributes: context === null || context === void 0 ? void 0 : context.getContextAttributes()
            });
          }
        }
        if (element.width === 0 || element.height === 0) {
          this.debug(element, "not yet ready", {
            width: element.width,
            height: element.height
          });
          return;
        }
        let scale = this.options.resizeFactor || 1;
        if (this.options.maxSnapshotDimension) {
          const maxDim = Math.max(element.width, element.height);
          scale = Math.min(scale, this.options.maxSnapshotDimension / maxDim);
        }
        const width = element.width * scale;
        const height = element.height * scale;
        const bitmap = yield createImageBitmap(element, {
          resizeWidth: width,
          resizeHeight: height
        });
        this.debug(element, "created image bitmap", {
          width: bitmap.width,
          height: bitmap.height
        });
        this.worker.postMessage({
          id,
          bitmap,
          width,
          height,
          dx: 0,
          dy: 0,
          dw: element.width,
          dh: element.height,
          dataURLOptions: this.options.dataURLOptions,
          logDebug: !!this.logger
        }, [bitmap]);
        this.debug(element, "sent message");
      } catch (e2) {
        this.debug(element, "failed to snapshot", e2);
      } finally {
        this.snapshotInProgressMap.set(id, false);
      }
    });
    const { sampling, win, blockClass, blockSelector, recordCanvas, recordVideos, initialSnapshotDelay, dataURLOptions } = options;
    this.mutationCb = options.mutationCb;
    this.mirror = options.mirror;
    this.logger = options.logger;
    this.worker = new WorkerFactory();
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
      this.mutationCb({
        id,
        type: CanvasContext["2D"],
        commands: [
          {
            property: "clearRect",
            args: [dx, dy, dw, dh]
          },
          {
            property: "drawImage",
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
      });
    };
    this.options = options;
    if (recordCanvas && sampling === "all") {
      this.debug(null, "initializing canvas mutation observer", { sampling });
      this.initCanvasMutationObserver(win, blockClass, blockSelector);
    } else if (recordCanvas && typeof sampling === "number") {
      this.debug(null, "initializing canvas fps observer", { sampling });
      this.initCanvasFPSObserver(recordVideos, sampling, win, blockClass, blockSelector, {
        initialSnapshotDelay,
        dataURLOptions
      }, options.resizeFactor, options.maxSnapshotDimension);
    }
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
  initCanvasFPSObserver(recordVideos, fps, win, blockClass, blockSelector, options, resizeFactor, maxSnapshotDimension) {
    const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector);
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
    const takeSnapshots = (timestamp) => __awaiter(this, void 0, void 0, function* () {
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
      promises.push(...getCanvas(timestamp).filter(filterElementStartTime).map(this.snapshot));
      promises.push(...getVideos(timestamp).filter(filterElementStartTime).map((video) => __awaiter(this, void 0, void 0, function* () {
        this.debug(video, "starting video snapshotting");
        const id = this.mirror.getId(video);
        if (this.snapshotInProgressMap.get(id)) {
          this.debug(video, "video snapshotting already in progress for", id);
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
          let scale = resizeFactor || 1;
          if (maxSnapshotDimension) {
            scale = Math.min(scale, maxSnapshotDimension / maxDim);
          }
          const width = actualWidth * scale;
          const height = actualHeight * scale;
          const bitmap = yield createImageBitmap(video, {
            resizeWidth: width,
            resizeHeight: height
          });
          let outputScale = Math.max(boxWidth, boxHeight) / maxDim;
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
          this.worker.postMessage({
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
          }, [bitmap]);
          this.debug(video, "send message");
        } catch (e2) {
          this.debug(video, "failed to snapshot", e2);
        } finally {
          this.snapshotInProgressMap.set(id, false);
        }
      })));
      yield Promise.all(promises).catch(console.error);
      rafId = requestAnimationFrame(takeSnapshots);
    });
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
    const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector);
    const canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector);
    const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector, this.mirror);
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
    this.pendingCanvasMutations.forEach((values, canvas) => {
      const id = this.mirror.getId(canvas);
      this.flushPendingCanvasMutationFor(canvas, id);
    });
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
      const rest = __rest(value, ["type"]);
      return rest;
    });
    const { type } = valuesWithType[0];
    this.mutationCb({ id, type, commands: values });
    this.pendingCanvasMutations.delete(canvas);
  }
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/stylesheet-manager.js
var StylesheetManager = class {
  constructor(options) {
    this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
    this.styleMirror = new StyleSheetMirror();
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
        const rules2 = Array.from(sheet.rules || CSSRule);
        styles.push({
          styleId,
          rules: rules2.map((r2, index) => {
            return {
              rule: getCssRuleString(r2),
              index
            };
          })
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
  trackStylesheetInLinkElement(linkEl) {
  }
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/processed-node-manager.js
var ProcessedNodeManager = class {
  constructor() {
    this.nodeMap = /* @__PURE__ */ new WeakMap();
    this.loop = true;
    this.periodicallyClear();
  }
  periodicallyClear() {
    requestAnimationFrame(() => {
      this.clear();
      if (this.loop)
        this.periodicallyClear();
    });
  }
  inOtherBuffer(node, thisBuffer) {
    const buffers = this.nodeMap.get(node);
    return buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer);
  }
  add(node, buffer) {
    this.nodeMap.set(node, (this.nodeMap.get(node) || /* @__PURE__ */ new Set()).add(buffer));
  }
  clear() {
    this.nodeMap = /* @__PURE__ */ new WeakMap();
  }
  destroy() {
    this.loop = false;
  }
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/record/index.js
function wrapEvent(e2) {
  return Object.assign(Object.assign({}, e2), { timestamp: Date.now() });
}
var wrappedEmit;
var takeFullSnapshot;
var canvasManager;
var recording = false;
var mirror = createMirror();
function record(options = {}) {
  var _a2, _b2, _c, _d, _e, _f, _g, _h;
  const { emit, checkoutEveryNms, checkoutEveryNth, blockClass = "highlight-block", blockSelector = null, ignoreClass = "highlight-ignore", maskTextClass = "highlight-mask", maskTextSelector = null, inlineStylesheet = true, maskAllInputs, maskInputOptions: _maskInputOptions, slimDOMOptions: _slimDOMOptions, maskInputFn, maskTextFn = obfuscateText, hooks, packFn, sampling = {}, mousemoveWait, recordCanvas = false, recordCrossOriginIframes = false, recordAfter = options.recordAfter === "DOMContentLoaded" ? options.recordAfter : "load", userTriggeredOnInput = false, collectFonts = false, inlineImages = false, plugins, keepIframeSrcFn = () => false, privacySetting = "default", ignoreCSSAttributes = /* @__PURE__ */ new Set([]), errorHandler: errorHandler2, logger } = options;
  const dataURLOptions = Object.assign(Object.assign({}, options.dataURLOptions), (_b2 = (_a2 = options.sampling) === null || _a2 === void 0 ? void 0 : _a2.canvas) === null || _b2 === void 0 ? void 0 : _b2.dataURLOptions);
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
    headMetaAuthorship: _slimDOMOptions === "all",
    headMetaDescKeywords: _slimDOMOptions === "all"
  } : _slimDOMOptions ? _slimDOMOptions : {};
  polyfill();
  let lastFullSnapshotEvent;
  let incrementalSnapshotCount = 0;
  const eventProcessor = (e2) => {
    for (const plugin of plugins || []) {
      if (plugin.eventProcessor) {
        e2 = plugin.eventProcessor(e2);
      }
    }
    if (packFn && !passEmitsToParent) {
      e2 = packFn(e2);
    }
    return e2;
  };
  wrappedEmit = (e2, isCheckout) => {
    var _a3;
    if (((_a3 = mutationBuffers[0]) === null || _a3 === void 0 ? void 0 : _a3.isFrozen()) && e2.type !== EventType.FullSnapshot && !(e2.type === EventType.IncrementalSnapshot && e2.data.source === IncrementalSource.Mutation)) {
      mutationBuffers.forEach((buf) => buf.unfreeze());
    }
    if (inEmittingFrame) {
      emit === null || emit === void 0 ? void 0 : emit(eventProcessor(e2), isCheckout);
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
        takeFullSnapshot(true);
      }
    }
  };
  const wrappedMutationEmit = (m) => {
    wrappedEmit(wrapEvent({
      type: EventType.IncrementalSnapshot,
      data: Object.assign({ source: IncrementalSource.Mutation }, m)
    }));
  };
  const wrappedScrollEmit = (p) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.Scroll }, p)
  }));
  const wrappedCanvasMutationEmit = (p) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.CanvasMutation }, p)
  }));
  const wrappedAdoptedStyleSheetEmit = (a2) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.AdoptedStyleSheet }, a2)
  }));
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
    sampling: (_c = sampling === null || sampling === void 0 ? void 0 : sampling.canvas) === null || _c === void 0 ? void 0 : _c.fps,
    samplingManual: (_d = sampling === null || sampling === void 0 ? void 0 : sampling.canvas) === null || _d === void 0 ? void 0 : _d.fpsManual,
    clearWebGLBuffer: (_e = sampling === null || sampling === void 0 ? void 0 : sampling.canvas) === null || _e === void 0 ? void 0 : _e.clearWebGLBuffer,
    initialSnapshotDelay: (_f = sampling === null || sampling === void 0 ? void 0 : sampling.canvas) === null || _f === void 0 ? void 0 : _f.initialSnapshotDelay,
    dataURLOptions,
    resizeFactor: (_g = sampling === null || sampling === void 0 ? void 0 : sampling.canvas) === null || _g === void 0 ? void 0 : _g.resizeFactor,
    maxSnapshotDimension: (_h = sampling === null || sampling === void 0 ? void 0 : sampling.canvas) === null || _h === void 0 ? void 0 : _h.maxSnapshotDimension,
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
  takeFullSnapshot = (isCheckout = false) => {
    wrappedEmit(wrapEvent({
      type: EventType.Meta,
      data: {
        href: window.location.href,
        width: getWindowWidth(),
        height: getWindowHeight()
      }
    }), isCheckout);
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
          shadowDomManager.addShadowRoot(n2.shadowRoot, document);
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
    wrappedEmit(wrapEvent({
      type: EventType.FullSnapshot,
      data: {
        node,
        initialOffset: getWindowScroll(window)
      }
    }), isCheckout);
    mutationBuffers.forEach((buf) => buf.unlock());
    if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0)
      stylesheetManager.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
  };
  try {
    const handlers = [];
    const observe = (doc) => {
      var _a3;
      return callbackWrapper(initObservers)({
        mutationCb: wrappedMutationEmit,
        mousemoveCb: (positions, source) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: {
            source,
            positions
          }
        })),
        mouseInteractionCb: (d) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MouseInteraction }, d)
        })),
        scrollCb: wrappedScrollEmit,
        viewportResizeCb: (d) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.ViewportResize }, d)
        })),
        inputCb: (v2) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Input }, v2)
        })),
        mediaInteractionCb: (p) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MediaInteraction }, p)
        })),
        styleSheetRuleCb: (r2) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleSheetRule }, r2)
        })),
        styleDeclarationCb: (r2) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleDeclaration }, r2)
        })),
        canvasMutationCb: wrappedCanvasMutationEmit,
        fontCb: (p) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Font }, p)
        })),
        selectionCb: (p) => {
          wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.Selection }, p)
          }));
        },
        blockClass,
        ignoreClass,
        maskTextClass,
        maskTextSelector,
        maskInputOptions,
        inlineStylesheet,
        sampling,
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
        plugins: ((_a3 = plugins === null || plugins === void 0 ? void 0 : plugins.filter((p) => p.observer)) === null || _a3 === void 0 ? void 0 : _a3.map((p) => ({
          observer: p.observer,
          options: p.options,
          callback: (payload) => wrappedEmit(wrapEvent({
            type: EventType.Plugin,
            data: {
              plugin: p.name,
              payload
            }
          }))
        }))) || []
      }, hooks);
    };
    iframeManager.addLoadListener((iframeEl) => {
      try {
        handlers.push(observe(iframeEl.contentDocument));
      } catch (error) {
        console.warn(error);
      }
    });
    const init = () => {
      takeFullSnapshot();
      handlers.push(observe(document));
      recording = true;
    };
    if (document.readyState === "interactive" || document.readyState === "complete") {
      init();
    } else {
      handlers.push(on("DOMContentLoaded", () => {
        wrappedEmit(wrapEvent({
          type: EventType.DomContentLoaded,
          data: {}
        }));
        if (recordAfter === "DOMContentLoaded")
          init();
      }));
      handlers.push(on("load", () => {
        wrappedEmit(wrapEvent({
          type: EventType.Load,
          data: {}
        }));
        if (recordAfter === "load")
          init();
      }, window));
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
  wrappedEmit(wrapEvent({
    type: EventType.Custom,
    data: {
      tag,
      payload
    }
  }));
};
record.freezePage = () => {
  mutationBuffers.forEach((buf) => buf.freeze());
};
record.takeFullSnapshot = (isCheckout) => {
  if (!recording) {
    throw new Error("please take full snapshot after start recording");
  }
  takeFullSnapshot(isCheckout);
};
record.snapshotCanvas = (element) => __awaiter(void 0, void 0, void 0, function* () {
  if (!canvasManager) {
    throw new Error("canvas manager is not initialized");
  }
  yield canvasManager.snapshot(element);
});
record.mirror = mirror;

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrdom/es/rrdom.js
var NodeType$1;
(function(NodeType3) {
  NodeType3[NodeType3["Document"] = 0] = "Document";
  NodeType3[NodeType3["DocumentType"] = 1] = "DocumentType";
  NodeType3[NodeType3["Element"] = 2] = "Element";
  NodeType3[NodeType3["Text"] = 3] = "Text";
  NodeType3[NodeType3["CDATA"] = 4] = "CDATA";
  NodeType3[NodeType3["Comment"] = 5] = "Comment";
})(NodeType$1 || (NodeType$1 = {}));
var Mirror$1 = function() {
  function Mirror3() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  Mirror3.prototype.getId = function(n2) {
    var _a2;
    if (!n2)
      return -1;
    var id = (_a2 = this.getMeta(n2)) === null || _a2 === void 0 ? void 0 : _a2.id;
    return id !== null && id !== void 0 ? id : -1;
  };
  Mirror3.prototype.getNode = function(id) {
    return this.idNodeMap.get(id) || null;
  };
  Mirror3.prototype.getIds = function() {
    return Array.from(this.idNodeMap.keys());
  };
  Mirror3.prototype.getMeta = function(n2) {
    return this.nodeMetaMap.get(n2) || null;
  };
  Mirror3.prototype.removeNodeFromMap = function(n2) {
    var _this = this;
    var id = this.getId(n2);
    this.idNodeMap["delete"](id);
    if (n2.childNodes) {
      n2.childNodes.forEach(function(childNode) {
        return _this.removeNodeFromMap(childNode);
      });
    }
  };
  Mirror3.prototype.has = function(id) {
    return this.idNodeMap.has(id);
  };
  Mirror3.prototype.hasNode = function(node) {
    return this.nodeMetaMap.has(node);
  };
  Mirror3.prototype.add = function(n2, meta) {
    var id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  };
  Mirror3.prototype.replace = function(id, n2) {
    var oldNode = this.getNode(id);
    if (oldNode) {
      var meta = this.nodeMetaMap.get(oldNode);
      if (meta)
        this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  };
  Mirror3.prototype.reset = function() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  };
  return Mirror3;
}();
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
  constructor(..._args) {
    this.parentElement = null;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
    this.ELEMENT_NODE = NodeType2.ELEMENT_NODE;
    this.TEXT_NODE = NodeType2.TEXT_NODE;
  }
  get childNodes() {
    const childNodes = [];
    let childIterator = this.firstChild;
    while (childIterator) {
      childNodes.push(childIterator);
      childIterator = childIterator.nextSibling;
    }
    return childNodes;
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
  appendChild(_newChild) {
    throw new Error(`RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.`);
  }
  insertBefore(_newChild, _refChild) {
    throw new Error(`RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.`);
  }
  removeChild(_node) {
    throw new Error(`RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.`);
  }
  toString() {
    return "RRNode";
  }
};
function BaseRRDocumentImpl(RRNodeClass) {
  return class BaseRRDocument extends RRNodeClass {
    constructor(...args) {
      super(args);
      this.nodeType = NodeType2.DOCUMENT_NODE;
      this.nodeName = "#document";
      this.compatMode = "CSS1Compat";
      this.RRNodeType = NodeType$1.Document;
      this.textContent = null;
      this.ownerDocument = this;
    }
    get documentElement() {
      return this.childNodes.find((node) => node.RRNodeType === NodeType$1.Element && node.tagName === "HTML") || null;
    }
    get body() {
      var _a2;
      return ((_a2 = this.documentElement) === null || _a2 === void 0 ? void 0 : _a2.childNodes.find((node) => node.RRNodeType === NodeType$1.Element && node.tagName === "BODY")) || null;
    }
    get head() {
      var _a2;
      return ((_a2 = this.documentElement) === null || _a2 === void 0 ? void 0 : _a2.childNodes.find((node) => node.RRNodeType === NodeType$1.Element && node.tagName === "HEAD")) || null;
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
          throw new Error(`RRDomException: Failed to execute 'appendChild' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`);
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
          throw new Error(`RRDomException: Failed to execute 'insertBefore' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`);
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
      return new BaseRRDocument();
    }
    createDocumentType(qualifiedName, publicId, systemId) {
      const doctype = new (BaseRRDocumentTypeImpl(BaseRRNode))(qualifiedName, publicId, systemId);
      doctype.ownerDocument = this;
      return doctype;
    }
    createElement(tagName) {
      const element = new (BaseRRElementImpl(BaseRRNode))(tagName);
      element.ownerDocument = this;
      return element;
    }
    createElementNS(_namespaceURI, qualifiedName) {
      return this.createElement(qualifiedName);
    }
    createTextNode(data) {
      const text = new (BaseRRTextImpl(BaseRRNode))(data);
      text.ownerDocument = this;
      return text;
    }
    createComment(data) {
      const comment = new (BaseRRCommentImpl(BaseRRNode))(data);
      comment.ownerDocument = this;
      return comment;
    }
    createCDATASection(data) {
      const CDATASection = new (BaseRRCDATASectionImpl(BaseRRNode))(data);
      CDATASection.ownerDocument = this;
      return CDATASection;
    }
    toString() {
      return "RRDocument";
    }
  };
}
function BaseRRDocumentTypeImpl(RRNodeClass) {
  return class BaseRRDocumentType extends RRNodeClass {
    constructor(qualifiedName, publicId, systemId) {
      super();
      this.nodeType = NodeType2.DOCUMENT_TYPE_NODE;
      this.RRNodeType = NodeType$1.DocumentType;
      this.name = qualifiedName;
      this.publicId = publicId;
      this.systemId = systemId;
      this.nodeName = qualifiedName;
      this.textContent = null;
    }
    toString() {
      return "RRDocumentType";
    }
  };
}
function BaseRRElementImpl(RRNodeClass) {
  return class BaseRRElement extends RRNodeClass {
    constructor(tagName) {
      super();
      this.nodeType = NodeType2.ELEMENT_NODE;
      this.RRNodeType = NodeType$1.Element;
      this.attributes = {};
      this.shadowRoot = null;
      this.tagName = tagName.toUpperCase();
      this.nodeName = tagName.toUpperCase();
    }
    get textContent() {
      let result = "";
      this.childNodes.forEach((node) => result += node.textContent);
      return result;
    }
    set textContent(textContent) {
      this.firstChild = null;
      this.lastChild = null;
      this.appendChild(this.ownerDocument.createTextNode(textContent));
    }
    get classList() {
      return new ClassList(this.attributes.class, (newClassName) => {
        this.attributes.class = newClassName;
      });
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
      return this.attributes[name] || null;
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
    attachShadow(_init) {
      const shadowRoot = this.ownerDocument.createElement("SHADOWROOT");
      this.shadowRoot = shadowRoot;
      return shadowRoot;
    }
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
}
function BaseRRMediaElementImpl(RRElementClass) {
  return class BaseRRMediaElement extends RRElementClass {
    attachShadow(_init) {
      throw new Error(`RRDomException: Failed to execute 'attachShadow' on 'RRElement': This RRElement does not support attachShadow`);
    }
    play() {
      this.paused = false;
    }
    pause() {
      this.paused = true;
    }
  };
}
function BaseRRTextImpl(RRNodeClass) {
  return class BaseRRText extends RRNodeClass {
    constructor(data) {
      super();
      this.nodeType = NodeType2.TEXT_NODE;
      this.nodeName = "#text";
      this.RRNodeType = NodeType$1.Text;
      this.data = data;
    }
    get textContent() {
      return this.data;
    }
    set textContent(textContent) {
      this.data = textContent;
    }
    toString() {
      return `RRText text=${JSON.stringify(this.data)}`;
    }
  };
}
function BaseRRCommentImpl(RRNodeClass) {
  return class BaseRRComment extends RRNodeClass {
    constructor(data) {
      super();
      this.nodeType = NodeType2.COMMENT_NODE;
      this.nodeName = "#comment";
      this.RRNodeType = NodeType$1.Comment;
      this.data = data;
    }
    get textContent() {
      return this.data;
    }
    set textContent(textContent) {
      this.data = textContent;
    }
    toString() {
      return `RRComment text=${JSON.stringify(this.data)}`;
    }
  };
}
function BaseRRCDATASectionImpl(RRNodeClass) {
  return class BaseRRCDATASection extends RRNodeClass {
    constructor(data) {
      super();
      this.nodeName = "#cdata-section";
      this.nodeType = NodeType2.CDATA_SECTION_NODE;
      this.RRNodeType = NodeType$1.CDATA;
      this.data = data;
    }
    get textContent() {
      return this.data;
    }
    set textContent(textContent) {
      this.data = textContent;
    }
    toString() {
      return `RRCDATASection data=${JSON.stringify(this.data)}`;
    }
  };
}
var ClassList = class {
  constructor(classText, onChange) {
    this.classes = [];
    this.add = (...classNames) => {
      for (const item of classNames) {
        const className = String(item);
        if (this.classes.indexOf(className) >= 0)
          continue;
        this.classes.push(className);
      }
      this.onChange && this.onChange(this.classes.join(" "));
    };
    this.remove = (...classNames) => {
      this.classes = this.classes.filter((item) => classNames.indexOf(item) === -1);
      this.onChange && this.onChange(this.classes.join(" "));
    };
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
    throw new Error("Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode.");
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
    throw new Error("Failed to execute 'removeChild' on 'RRNode': The RRNode to be removed is not a child of this RRNode.");
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
var NodeType2;
(function(NodeType3) {
  NodeType3[NodeType3["PLACEHOLDER"] = 0] = "PLACEHOLDER";
  NodeType3[NodeType3["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
  NodeType3[NodeType3["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
  NodeType3[NodeType3["TEXT_NODE"] = 3] = "TEXT_NODE";
  NodeType3[NodeType3["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
  NodeType3[NodeType3["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
  NodeType3[NodeType3["ENTITY_NODE"] = 6] = "ENTITY_NODE";
  NodeType3[NodeType3["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
  NodeType3[NodeType3["COMMENT_NODE"] = 8] = "COMMENT_NODE";
  NodeType3[NodeType3["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
  NodeType3[NodeType3["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
  NodeType3[NodeType3["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
})(NodeType2 || (NodeType2 = {}));
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
  oldTree = diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror);
  const oldChildren = oldTree.childNodes;
  const newChildren = newTree.childNodes;
  if (oldChildren.length > 0 || newChildren.length > 0) {
    diffChildren(Array.from(oldChildren), newChildren, oldTree, replayer, rrnodeMirror);
  }
  diffAfterUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror);
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
    const calibratedOldTree = createOrGetNode(newTree, replayer.mirror, rrnodeMirror);
    (_a2 = oldTree.parentNode) === null || _a2 === void 0 ? void 0 : _a2.replaceChild(calibratedOldTree, oldTree);
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
          createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.add(oldTree);
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
          diff(oldContentDocument, newTree.contentDocument, replayer, rrnodeMirror);
          break;
        }
      }
      if (newRRElement.shadowRoot) {
        if (!oldElement.shadowRoot)
          oldElement.attachShadow({ mode: "open" });
        const oldChildren = oldElement.shadowRoot.childNodes;
        const newChildren = newRRElement.shadowRoot.childNodes;
        if (oldChildren.length > 0 || newChildren.length > 0)
          diffChildren(Array.from(oldChildren), newChildren, oldElement.shadowRoot, replayer, rrnodeMirror);
      }
      break;
    }
  }
  return oldTree;
}
function diffAfterUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror) {
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
      diffProps(oldElement, newRRElement, rrnodeMirror);
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
          rrCanvasElement.canvasMutations.forEach((canvasMutation3) => replayer.applyCanvas(canvasMutation3.event, canvasMutation3.mutation, oldTree));
          break;
        }
        case "STYLE": {
          const styleSheet = oldElement.sheet;
          styleSheet && newTree.rules.forEach((data) => replayer.applyStyleSheetMutation(data, styleSheet));
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
  if (createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.has(oldTree)) {
    createdNodeSet.delete(oldTree);
    (_a2 = replayer.afterAppend) === null || _a2 === void 0 ? void 0 : _a2.call(replayer, oldTree, replayer.mirror.getId(oldTree));
  }
}
function diffProps(oldTree, newTree, rrnodeMirror) {
  const oldAttributes = oldTree.attributes;
  const newAttributes = newTree.attributes;
  for (const name in newAttributes) {
    const newValue = newAttributes[name];
    const sn = rrnodeMirror.getMeta(newTree);
    if ((sn === null || sn === void 0 ? void 0 : sn.isSVG) && NAMESPACES[name])
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
    } else
      oldTree.setAttribute(name, newValue);
  }
  for (const { name } of Array.from(oldAttributes))
    if (!(name in newAttributes))
      oldTree.removeAttribute(name);
  newTree.scrollLeft && (oldTree.scrollLeft = newTree.scrollLeft);
  newTree.scrollTop && (oldTree.scrollTop = newTree.scrollTop);
}
function diffChildren(oldChildren, newChildren, parentNode, replayer, rrnodeMirror) {
  let oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, newStartIndex = 0, newEndIndex = newChildren.length - 1;
  let oldStartNode = oldChildren[oldStartIndex], oldEndNode = oldChildren[oldEndIndex], newStartNode = newChildren[newStartIndex], newEndNode = newChildren[newEndIndex];
  let oldIdToIndex = void 0, indexInOld = void 0;
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode === void 0) {
      oldStartNode = oldChildren[++oldStartIndex];
    } else if (oldEndNode === void 0) {
      oldEndNode = oldChildren[--oldEndIndex];
    } else if (nodeMatching(oldStartNode, newStartNode, replayer.mirror, rrnodeMirror)) {
      diff(oldStartNode, newStartNode, replayer, rrnodeMirror);
      oldStartNode = oldChildren[++oldStartIndex];
      newStartNode = newChildren[++newStartIndex];
    } else if (nodeMatching(oldEndNode, newEndNode, replayer.mirror, rrnodeMirror)) {
      diff(oldEndNode, newEndNode, replayer, rrnodeMirror);
      oldEndNode = oldChildren[--oldEndIndex];
      newEndNode = newChildren[--newEndIndex];
    } else if (nodeMatching(oldStartNode, newEndNode, replayer.mirror, rrnodeMirror)) {
      try {
        parentNode.insertBefore(oldStartNode, oldEndNode.nextSibling);
      } catch (e2) {
        console.warn(e2);
      }
      diff(oldStartNode, newEndNode, replayer, rrnodeMirror);
      oldStartNode = oldChildren[++oldStartIndex];
      newEndNode = newChildren[--newEndIndex];
    } else if (nodeMatching(oldEndNode, newStartNode, replayer.mirror, rrnodeMirror)) {
      try {
        parentNode.insertBefore(oldEndNode, oldStartNode);
      } catch (e2) {
        console.warn(e2);
      }
      diff(oldEndNode, newStartNode, replayer, rrnodeMirror);
      oldEndNode = oldChildren[--oldEndIndex];
      newStartNode = newChildren[++newStartIndex];
    } else {
      if (!oldIdToIndex) {
        oldIdToIndex = {};
        for (let i2 = oldStartIndex; i2 <= oldEndIndex; i2++) {
          const oldChild = oldChildren[i2];
          if (oldChild && replayer.mirror.hasNode(oldChild))
            oldIdToIndex[replayer.mirror.getId(oldChild)] = i2;
        }
      }
      indexInOld = oldIdToIndex[rrnodeMirror.getId(newStartNode)];
      const nodeToMove = oldChildren[indexInOld];
      if (indexInOld !== void 0 && nodeToMove && nodeMatching(nodeToMove, newStartNode, replayer.mirror, rrnodeMirror)) {
        try {
          parentNode.insertBefore(nodeToMove, oldStartNode);
        } catch (e2) {
          console.warn(e2);
        }
        diff(nodeToMove, newStartNode, replayer, rrnodeMirror);
        oldChildren[indexInOld] = void 0;
      } else {
        const newNode = createOrGetNode(newStartNode, replayer.mirror, rrnodeMirror);
        if (parentNode.nodeName === "#document" && oldStartNode && (newNode.nodeType === newNode.DOCUMENT_TYPE_NODE && oldStartNode.nodeType === oldStartNode.DOCUMENT_TYPE_NODE || newNode.nodeType === newNode.ELEMENT_NODE && oldStartNode.nodeType === oldStartNode.ELEMENT_NODE)) {
          parentNode.removeChild(oldStartNode);
          replayer.mirror.removeNodeFromMap(oldStartNode);
          oldStartNode = oldChildren[++oldStartIndex];
        }
        try {
          parentNode.insertBefore(newNode, oldStartNode || null);
          diff(newNode, newStartNode, replayer, rrnodeMirror);
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
      referenceNode = replayer.mirror.getNode(rrnodeMirror.getId(referenceRRNode));
    for (; newStartIndex <= newEndIndex; ++newStartIndex) {
      const newNode = createOrGetNode(newChildren[newStartIndex], replayer.mirror, rrnodeMirror);
      try {
        parentNode.insertBefore(newNode, referenceNode);
        diff(newNode, newChildren[newStartIndex], replayer, rrnodeMirror);
      } catch (e2) {
        console.warn(e2);
      }
    }
  } else if (newStartIndex > newEndIndex) {
    for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
      const node = oldChildren[oldStartIndex];
      if (!node || node.parentNode !== parentNode)
        continue;
      try {
        parentNode.removeChild(node);
        replayer.mirror.removeNodeFromMap(node);
      } catch (e2) {
        console.warn(e2);
      }
    }
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
      node = document.implementation.createDocumentType(rrNode.name, rrNode.publicId, rrNode.systemId);
      break;
    case NodeType$1.Element: {
      let tagName = rrNode.tagName.toLowerCase();
      tagName = SVGTagMap[tagName] || tagName;
      if (sn && "isSVG" in sn && (sn === null || sn === void 0 ? void 0 : sn.isSVG)) {
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
    domMirror.add(node, Object.assign({}, sn));
  try {
    createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.add(node);
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
var RRDocument = class _RRDocument extends BaseRRDocumentImpl(BaseRRNode) {
  get unserializedId() {
    return this._unserializedId--;
  }
  constructor(mirror2) {
    super();
    this.UNSERIALIZED_STARTING_ID = -2;
    this._unserializedId = this.UNSERIALIZED_STARTING_ID;
    this.mirror = createMirror2();
    this.scrollData = null;
    if (mirror2) {
      this.mirror = mirror2;
    }
  }
  createDocument(_namespace, _qualifiedName, _doctype) {
    return new _RRDocument();
  }
  createDocumentType(qualifiedName, publicId, systemId) {
    const documentTypeNode = new RRDocumentType(qualifiedName, publicId, systemId);
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
var RRDocumentType = BaseRRDocumentTypeImpl(BaseRRNode);
var RRElement = class extends BaseRRElementImpl(BaseRRNode) {
  constructor() {
    super(...arguments);
    this.inputData = null;
    this.scrollData = null;
  }
};
var RRMediaElement = class extends BaseRRMediaElementImpl(RRElement) {
};
var RRCanvasElement = class extends RRElement {
  constructor() {
    super(...arguments);
    this.rr_dataURL = null;
    this.canvasMutations = [];
  }
  getContext() {
    return null;
  }
};
var RRStyleElement = class extends RRElement {
  constructor() {
    super(...arguments);
    this.rules = [];
  }
};
var RRIFrameElement = class extends RRElement {
  constructor(upperTagName, mirror2) {
    super(upperTagName);
    this.contentDocument = new RRDocument();
    this.contentDocument.mirror = mirror2;
  }
};
var RRText = BaseRRTextImpl(BaseRRNode);
var RRComment = BaseRRCommentImpl(BaseRRNode);
var RRCDATASection = BaseRRCDATASectionImpl(BaseRRNode);
function getValidTagName2(element) {
  if (element instanceof HTMLFormElement) {
    return "FORM";
  }
  return element.tagName.toUpperCase();
}
function buildFromNode(node, rrdom, domMirror, parentRRNode) {
  let rrNode;
  switch (node.nodeType) {
    case NodeType2.DOCUMENT_NODE:
      if (parentRRNode && parentRRNode.nodeName === "IFRAME")
        rrNode = parentRRNode.contentDocument;
      else {
        rrNode = rrdom;
        rrNode.compatMode = node.compatMode;
      }
      break;
    case NodeType2.DOCUMENT_TYPE_NODE: {
      const documentType = node;
      rrNode = rrdom.createDocumentType(documentType.name, documentType.publicId, documentType.systemId);
      break;
    }
    case NodeType2.ELEMENT_NODE: {
      const elementNode = node;
      const tagName = getValidTagName2(elementNode);
      rrNode = rrdom.createElement(tagName);
      const rrElement = rrNode;
      for (const { name, value } of Array.from(elementNode.attributes)) {
        rrElement.attributes[name] = value;
      }
      elementNode.scrollLeft && (rrElement.scrollLeft = elementNode.scrollLeft);
      elementNode.scrollTop && (rrElement.scrollTop = elementNode.scrollTop);
      break;
    }
    case NodeType2.TEXT_NODE:
      rrNode = rrdom.createTextNode(node.textContent || "");
      break;
    case NodeType2.CDATA_SECTION_NODE:
      rrNode = rrdom.createCDATASection(node.data);
      break;
    case NodeType2.COMMENT_NODE:
      rrNode = rrdom.createComment(node.textContent || "");
      break;
    case NodeType2.DOCUMENT_FRAGMENT_NODE:
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
    rrdom.mirror.add(rrNode, Object.assign({}, sn));
  }
  return rrNode;
}
function buildFromDom(dom, domMirror = createMirror$1(), rrdom = new RRDocument()) {
  function walk(node, parentRRNode) {
    const rrNode = buildFromNode(node, rrdom, domMirror, parentRRNode);
    if (rrNode === null)
      return;
    if ((parentRRNode === null || parentRRNode === void 0 ? void 0 : parentRRNode.nodeName) !== "IFRAME" && node.nodeType !== NodeType2.DOCUMENT_FRAGMENT_NODE) {
      parentRRNode === null || parentRRNode === void 0 ? void 0 : parentRRNode.appendChild(rrNode);
      rrNode.parentNode = parentRRNode;
      rrNode.parentElement = parentRRNode;
    }
    if (node.nodeName === "IFRAME") {
      const iframeDoc = node.contentDocument;
      iframeDoc && walk(iframeDoc, rrNode);
    } else if (node.nodeType === NodeType2.DOCUMENT_NODE || node.nodeType === NodeType2.ELEMENT_NODE || node.nodeType === NodeType2.DOCUMENT_FRAGMENT_NODE) {
      if (node.nodeType === NodeType2.ELEMENT_NODE && node.shadowRoot)
        walk(node.shadowRoot, rrNode);
      node.childNodes.forEach((childNode) => walk(childNode, rrNode));
    }
  }
  walk(dom, null);
  return rrdom;
}
function createMirror2() {
  return new Mirror2();
}
var Mirror2 = class {
  constructor() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  getId(n2) {
    var _a2;
    if (!n2)
      return -1;
    const id = (_a2 = this.getMeta(n2)) === null || _a2 === void 0 ? void 0 : _a2.id;
    return id !== null && id !== void 0 ? id : -1;
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/index.js
var { addCustomEvent } = record;
var { freezePage } = record;

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/ext/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var u32 = Uint32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b[i2] = start += 1 << eb[i2 - 1];
  }
  var r2 = new u32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j = b[i2]; j < b[i2 + 1]; ++j) {
      r2[j] = j - b[i2] << 5 | i2;
    }
  }
  return [b, r2];
};
var _a = freb(fleb, 2);
var fl = _a[0];
var revfl = _a[1];
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b[0];
var revfd = _b[1];
var rev = new u16(32768);
for (i2 = 0; i2 < 32768; ++i2) {
  x = (i2 & 43690) >>> 1 | (i2 & 21845) << 1;
  x = (x & 52428) >>> 2 | (x & 13107) << 2;
  x = (x & 61680) >>> 4 | (x & 3855) << 4;
  rev[i2] = ((x & 65280) >>> 8 | (x & 255) << 8) >>> 1;
}
var x;
var i2;
var hMap = function(cd, mb, r2) {
  var s2 = cd.length;
  var i2 = 0;
  var l2 = new u16(mb);
  for (; i2 < s2; ++i2)
    ++l2[cd[i2] - 1];
  var le = new u16(mb);
  for (i2 = 0; i2 < mb; ++i2) {
    le[i2] = le[i2 - 1] + l2[i2 - 1] << 1;
  }
  var co;
  if (r2) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s2; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v2 = le[cd[i2] - 1]++ << r_1;
        for (var m = v2 | (1 << r_1) - 1; v2 <= m; ++v2) {
          co[rev[v2] >>> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s2);
    for (i2 = 0; i2 < s2; ++i2)
      co[i2] = rev[le[cd[i2] - 1]++] >>> 15 - cd[i2];
  }
  return co;
};
var flt = new u8(288);
for (i2 = 0; i2 < 144; ++i2)
  flt[i2] = 8;
var i2;
for (i2 = 144; i2 < 256; ++i2)
  flt[i2] = 9;
var i2;
for (i2 = 256; i2 < 280; ++i2)
  flt[i2] = 7;
var i2;
for (i2 = 280; i2 < 288; ++i2)
  flt[i2] = 8;
var i2;
var fdt = new u8(32);
for (i2 = 0; i2 < 32; ++i2)
  fdt[i2] = 5;
var i2;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a2) {
  var m = a2[0];
  for (var i2 = 1; i2 < a2.length; ++i2) {
    if (a2[i2] > m)
      m = a2[i2];
  }
  return m;
};
var bits = function(d, p, m) {
  var o2 = p / 8 >> 0;
  return (d[o2] | d[o2 + 1] << 8) >>> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o2 = p / 8 >> 0;
  return (d[o2] | d[o2 + 1] << 8 | d[o2 + 2] << 16) >>> (p & 7);
};
var shft = function(p) {
  return (p / 8 >> 0) + (p & 7 && 1);
};
var slc = function(v2, s2, e2) {
  if (s2 == null || s2 < 0)
    s2 = 0;
  if (e2 == null || e2 > v2.length)
    e2 = v2.length;
  var n2 = new (v2 instanceof u16 ? u16 : v2 instanceof u32 ? u32 : u8)(e2 - s2);
  n2.set(v2.subarray(s2, e2));
  return n2;
};
var inflt = function(dat, buf, st) {
  var sl = dat.length;
  var noBuf = !buf || st;
  var noSt = !st || st.i;
  if (!st)
    st = {};
  if (!buf)
    buf = new u8(sl * 3);
  var cbuf = function(l3) {
    var bl = buf.length;
    if (l3 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l3));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      st.f = final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s2 = shft(pos) + 4, l2 = dat[s2 - 4] | dat[s2 - 3] << 8, t2 = s2 + l2;
        if (t2 > sl) {
          if (noSt)
            throw "unexpected EOF";
          break;
        }
        if (noBuf)
          cbuf(bt + l2);
        buf.set(dat.subarray(s2, t2), bt);
        st.b = bt += l2, st.p = pos = t2 * 8;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        if (!noSt && pos + tl * (clb + 7) > tbts)
          break;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl; ) {
          var r2 = clm[bits(dat, pos, clbmsk)];
          pos += r2 & 15;
          var s2 = r2 >>> 4;
          if (s2 < 16) {
            ldt[i2++] = s2;
          } else {
            var c2 = 0, n2 = 0;
            if (s2 == 16)
              n2 = 3 + bits(dat, pos, 3), pos += 2, c2 = ldt[i2 - 1];
            else if (s2 == 17)
              n2 = 3 + bits(dat, pos, 7), pos += 3;
            else if (s2 == 18)
              n2 = 11 + bits(dat, pos, 127), pos += 7;
            while (n2--)
              ldt[i2++] = c2;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        throw "invalid block type";
      if (pos > tbts)
        throw "unexpected EOF";
    }
    if (noBuf)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var mxa = lbt + dbt + 18;
    while (noSt || pos + mxa < tbts) {
      var c2 = lm[bits16(dat, pos) & lms], sym = c2 >>> 4;
      pos += c2 & 15;
      if (pos > tbts)
        throw "unexpected EOF";
      if (!c2)
        throw "invalid length/literal";
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b = fleb[i2];
          add = bits(dat, pos, (1 << b) - 1) + fl[i2];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
        if (!d)
          throw "invalid distance";
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts)
          throw "unexpected EOF";
        if (noBuf)
          cbuf(bt + 131072);
        var end = bt + add;
        for (; bt < end; bt += 4) {
          buf[bt] = buf[bt - dt];
          buf[bt + 1] = buf[bt + 1 - dt];
          buf[bt + 2] = buf[bt + 2 - dt];
          buf[bt + 3] = buf[bt + 3 - dt];
        }
        bt = end;
      }
    }
    st.l = lm, st.p = pos, st.b = bt;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt == buf.length ? buf : slc(buf, 0, bt);
};
var wbits = function(d, p, v2) {
  v2 <<= p & 7;
  var o2 = p / 8 >> 0;
  d[o2] |= v2;
  d[o2 + 1] |= v2 >>> 8;
};
var wbits16 = function(d, p, v2) {
  v2 <<= p & 7;
  var o2 = p / 8 >> 0;
  d[o2] |= v2;
  d[o2 + 1] |= v2 >>> 8;
  d[o2 + 2] |= v2 >>> 16;
};
var hTree = function(d, mb) {
  var t2 = [];
  for (var i2 = 0; i2 < d.length; ++i2) {
    if (d[i2])
      t2.push({ s: i2, f: d[i2] });
  }
  var s2 = t2.length;
  var t22 = t2.slice();
  if (!s2)
    return [new u8(0), 0];
  if (s2 == 1) {
    var v2 = new u8(t2[0].s + 1);
    v2[t2[0].s] = 1;
    return [v2, 1];
  }
  t2.sort(function(a2, b) {
    return a2.f - b.f;
  });
  t2.push({ s: -1, f: 25001 });
  var l2 = t2[0], r2 = t2[1], i0 = 0, i1 = 1, i22 = 2;
  t2[0] = { s: -1, f: l2.f + r2.f, l: l2, r: r2 };
  while (i1 != s2 - 1) {
    l2 = t2[t2[i0].f < t2[i22].f ? i0++ : i22++];
    r2 = t2[i0 != i1 && t2[i0].f < t2[i22].f ? i0++ : i22++];
    t2[i1++] = { s: -1, f: l2.f + r2.f, l: l2, r: r2 };
  }
  var maxSym = t22[0].s;
  for (var i2 = 1; i2 < s2; ++i2) {
    if (t22[i2].s > maxSym)
      maxSym = t22[i2].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t2[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i2 = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t22.sort(function(a2, b) {
      return tr[b.s] - tr[a2.s] || a2.f - b.f;
    });
    for (; i2 < s2; ++i2) {
      var i2_1 = t22[i2].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>>= lft;
    while (dt > 0) {
      var i2_2 = t22[i2].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i2;
    }
    for (; i2 >= 0 && dt; --i2) {
      var i2_3 = t22[i2].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return [new u8(tr), mbt];
};
var ln = function(n2, l2, d) {
  return n2.s == -1 ? Math.max(ln(n2.l, l2, d + 1), ln(n2.r, l2, d + 1)) : l2[n2.s] = d;
};
var lc = function(c2) {
  var s2 = c2.length;
  while (s2 && !c2[--s2])
    ;
  var cl = new u16(++s2);
  var cli = 0, cln = c2[0], cls = 1;
  var w = function(v2) {
    cl[cli++] = v2;
  };
  for (var i2 = 1; i2 <= s2; ++i2) {
    if (c2[i2] == cln && i2 != s2)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c2[i2];
    }
  }
  return [cl.subarray(0, cli), s2];
};
var clen = function(cf, cl) {
  var l2 = 0;
  for (var i2 = 0; i2 < cl.length; ++i2)
    l2 += cf[i2] * cl[i2];
  return l2;
};
var wfblk = function(out, pos, dat) {
  var s2 = dat.length;
  var o2 = shft(pos + 2);
  out[o2] = s2 & 255;
  out[o2 + 1] = s2 >>> 8;
  out[o2 + 2] = out[o2] ^ 255;
  out[o2 + 3] = out[o2 + 1] ^ 255;
  for (var i2 = 0; i2 < s2; ++i2)
    out[o2 + i2 + 4] = dat[i2];
  return (o2 + 4 + s2) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2[0], mlb = _a2[1];
  var _b2 = hTree(df, 15), ddt = _b2[0], mdb = _b2[1];
  var _c = lc(dlt), lclt = _c[0], nlc = _c[1];
  var _d = lc(ddt), lcdt = _d[0], ndc = _d[1];
  var lcfreq = new u16(19);
  for (var i2 = 0; i2 < lclt.length; ++i2)
    lcfreq[lclt[i2] & 31]++;
  for (var i2 = 0; i2 < lcdt.length; ++i2)
    lcfreq[lcdt[i2] & 31]++;
  var _e = hTree(lcfreq, 7), lct = _e[0], mlcb = _e[1];
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + (2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18]);
  if (flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i2 = 0; i2 < nlcc; ++i2)
      wbits(out, p + 3 * i2, lct[clim[i2]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i2 = 0; i2 < clct.length; ++i2) {
        var len = clct[i2] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i2] >>> 5 & 127), p += clct[i2] >>> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i2 = 0; i2 < li; ++i2) {
    if (syms[i2] > 255) {
      var len = syms[i2] >>> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, syms[i2] >>> 23 & 31), p += fleb[len];
      var dst = syms[i2] & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, syms[i2] >>> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[syms[i2]]), p += ll[syms[i2]];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new u32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, lst) {
  var s2 = dat.length;
  var o2 = new u8(pre + s2 + 5 * (1 + Math.floor(s2 / 7e3)) + post);
  var w = o2.subarray(pre, o2.length - post);
  var pos = 0;
  if (!lvl || s2 < 8) {
    for (var i2 = 0; i2 <= s2; i2 += 65535) {
      var e2 = i2 + 65535;
      if (e2 < s2) {
        pos = wfblk(w, pos, dat.subarray(i2, e2));
      } else {
        w[i2] = lst;
        pos = wfblk(w, pos, dat.subarray(i2, s2));
      }
    }
  } else {
    var opt = deo[lvl - 1];
    var n2 = opt >>> 13, c2 = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = new u16(32768), head = new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i3) {
      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
    };
    var syms = new u32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i2 = 0, li = 0, wi = 0, bs = 0;
    for (; i2 < s2; ++i2) {
      var hv = hsh(i2);
      var imod = i2 & 32767;
      var pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i2) {
        var rem = s2 - i2;
        if ((lc_1 > 7e3 || li > 24576) && rem > 423) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
          li = lc_1 = eb = 0, bs = i2;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l2 = 2, d = 0, ch_1 = c2, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i2 - dif)) {
          var maxn = Math.min(n2, rem) - 1;
          var maxd = Math.min(32767, i2);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i2 + l2] == dat[i2 + l2 - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                ;
              if (nl > l2) {
                l2 = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i2 - dif + j + 32768 & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti + 32768 & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod + 32768 & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l2] << 18 | revfd[d];
          var lin = revfl[l2] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i2 + l2;
          ++lc_1;
        } else {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
      }
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
    if (!lst)
      pos = wfblk(w, pos, et);
  }
  return slc(o2, 0, pre + shft(pos) + post);
};
var adler = function() {
  var a2 = 1, b = 0;
  return {
    p: function(d) {
      var n2 = a2, m = b;
      var l2 = d.length;
      for (var i2 = 0; i2 != l2; ) {
        var e2 = Math.min(i2 + 5552, l2);
        for (; i2 < e2; ++i2)
          n2 += d[i2], m += n2;
        n2 %= 65521, m %= 65521;
      }
      a2 = n2, b = m;
    },
    d: function() {
      return (a2 >>> 8 << 16 | (b & 255) << 8 | b >>> 8) + ((a2 & 255) << 23) * 2;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 12 + opt.mem, pre, post, !st);
};
var wbytes = function(d, b, v2) {
  for (; v2; ++b)
    d[b] = v2, v2 >>>= 8;
};
var zlh = function(c2, o2) {
  var lv = o2.level, fl2 = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
  c2[0] = 120, c2[1] = fl2 << 6 | (fl2 ? 32 - 2 * fl2 : 1);
};
var zlv = function(d) {
  if ((d[0] & 15) != 8 || d[0] >>> 4 > 7 || (d[0] << 8 | d[1]) % 31)
    throw "invalid zlib data";
  if (d[1] & 32)
    throw "invalid zlib data: preset dictionaries not supported";
};
function zlibSync(data, opts) {
  if (opts === void 0) {
    opts = {};
  }
  var a2 = adler();
  a2.p(data);
  var d = dopt(data, opts, 2, 4);
  return zlh(d, opts), wbytes(d, d.length - 4, a2.d()), d;
}
function unzlibSync(data, out) {
  return inflt((zlv(data), data.subarray(2, -4)), out);
}
function strToU8(str, latin1) {
  var l2 = str.length;
  if (!latin1 && typeof TextEncoder != "undefined")
    return new TextEncoder().encode(str);
  var ar = new u8(str.length + (str.length >>> 1));
  var ai = 0;
  var w = function(v2) {
    ar[ai++] = v2;
  };
  for (var i2 = 0; i2 < l2; ++i2) {
    if (ai + 5 > ar.length) {
      var n2 = new u8(ai + 8 + (l2 - i2 << 1));
      n2.set(ar);
      ar = n2;
    }
    var c2 = str.charCodeAt(i2);
    if (c2 < 128 || latin1)
      w(c2);
    else if (c2 < 2048)
      w(192 | c2 >>> 6), w(128 | c2 & 63);
    else if (c2 > 55295 && c2 < 57344)
      c2 = 65536 + (c2 & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c2 >>> 18), w(128 | c2 >>> 12 & 63), w(128 | c2 >>> 6 & 63), w(128 | c2 & 63);
    else
      w(224 | c2 >>> 12), w(128 | c2 >>> 6 & 63), w(128 | c2 & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  var r2 = "";
  if (!latin1 && typeof TextDecoder != "undefined")
    return new TextDecoder().decode(dat);
  for (var i2 = 0; i2 < dat.length; ) {
    var c2 = dat[i2++];
    if (c2 < 128 || latin1)
      r2 += String.fromCharCode(c2);
    else if (c2 < 224)
      r2 += String.fromCharCode((c2 & 31) << 6 | dat[i2++] & 63);
    else if (c2 < 240)
      r2 += String.fromCharCode((c2 & 15) << 12 | (dat[i2++] & 63) << 6 | dat[i2++] & 63);
    else
      c2 = ((c2 & 15) << 18 | (dat[i2++] & 63) << 12 | (dat[i2++] & 63) << 6 | dat[i2++] & 63) - 65536, r2 += String.fromCharCode(55296 | c2 >> 10, 56320 | c2 & 1023);
  }
  return r2;
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/packer/base.js
var MARK = "v1";

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/packer/pack.js
var pack = (event) => {
  const _e = Object.assign(Object.assign({}, event), { v: MARK });
  return strFromU8(zlibSync(strToU8(JSON.stringify(_e))), true);
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/packer/unpack.js
var unpack = (raw) => {
  if (typeof raw !== "string") {
    return raw;
  }
  try {
    const e2 = JSON.parse(raw);
    if (e2.timestamp) {
      return e2;
    }
  } catch (error) {
  }
  try {
    const e2 = JSON.parse(strFromU8(unzlibSync(strToU8(raw, true))));
    if (e2.v === MARK) {
      return e2;
    }
    throw new Error(`These events were packed with packer ${e2.v} which is incompatible with current packer ${MARK}.`);
  } catch (error) {
    console.error(error);
    throw new Error("Unknown data format.");
  }
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/plugins/console/record/error-stack-parser.js
var StackFrame = class {
  constructor(obj) {
    this.fileName = obj.fileName || "";
    this.functionName = obj.functionName || "";
    this.lineNumber = obj.lineNumber;
    this.columnNumber = obj.columnNumber;
  }
  toString() {
    const lineNumber = this.lineNumber || "";
    const columnNumber = this.columnNumber || "";
    if (this.functionName)
      return `${this.functionName} (${this.fileName}:${lineNumber}:${columnNumber})`;
    return `${this.fileName}:${lineNumber}:${columnNumber}`;
  }
};
var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
var ErrorStackParser = {
  parse: function(error) {
    if (!error) {
      return [];
    }
    if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
      return this.parseOpera(error);
    } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
      return this.parseV8OrIE(error);
    } else if (error.stack) {
      return this.parseFFOrSafari(error);
    } else {
      throw new Error("Cannot parse given Error object");
    }
  },
  extractLocation: function(urlLike) {
    if (urlLike.indexOf(":") === -1) {
      return [urlLike];
    }
    const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
    const parts = regExp.exec(urlLike.replace(/[()]/g, ""));
    if (!parts)
      throw new Error(`Cannot parse given url: ${urlLike}`);
    return [parts[1], parts[2] || void 0, parts[3] || void 0];
  },
  parseV8OrIE: function(error) {
    const filtered = error.stack.split("\n").filter(function(line) {
      return !!line.match(CHROME_IE_STACK_REGEXP);
    }, this);
    return filtered.map(function(line) {
      if (line.indexOf("(eval ") > -1) {
        line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, "");
      }
      let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(");
      const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
      sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
      const tokens = sanitizedLine.split(/\s+/).slice(1);
      const locationParts = this.extractLocation(location ? location[1] : tokens.pop());
      const functionName = tokens.join(" ") || void 0;
      const fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
      return new StackFrame({
        functionName,
        fileName,
        lineNumber: locationParts[1],
        columnNumber: locationParts[2]
      });
    }, this);
  },
  parseFFOrSafari: function(error) {
    const filtered = error.stack.split("\n").filter(function(line) {
      return !line.match(SAFARI_NATIVE_CODE_REGEXP);
    }, this);
    return filtered.map(function(line) {
      if (line.indexOf(" > eval") > -1) {
        line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
      }
      if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
        return new StackFrame({
          functionName: line
        });
      } else {
        const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
        const matches = line.match(functionNameRegex);
        const functionName = matches && matches[1] ? matches[1] : void 0;
        const locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
        return new StackFrame({
          functionName,
          fileName: locationParts[0],
          lineNumber: locationParts[1],
          columnNumber: locationParts[2]
        });
      }
    }, this);
  },
  parseOpera: function(e2) {
    if (!e2.stacktrace || e2.message.indexOf("\n") > -1 && e2.message.split("\n").length > e2.stacktrace.split("\n").length) {
      return this.parseOpera9(e2);
    } else if (!e2.stack) {
      return this.parseOpera10(e2);
    } else {
      return this.parseOpera11(e2);
    }
  },
  parseOpera9: function(e2) {
    const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
    const lines = e2.message.split("\n");
    const result = [];
    for (let i2 = 2, len = lines.length; i2 < len; i2 += 2) {
      const match = lineRE.exec(lines[i2]);
      if (match) {
        result.push(new StackFrame({
          fileName: match[2],
          lineNumber: parseFloat(match[1])
        }));
      }
    }
    return result;
  },
  parseOpera10: function(e2) {
    const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
    const lines = e2.stacktrace.split("\n");
    const result = [];
    for (let i2 = 0, len = lines.length; i2 < len; i2 += 2) {
      const match = lineRE.exec(lines[i2]);
      if (match) {
        result.push(new StackFrame({
          functionName: match[3] || void 0,
          fileName: match[2],
          lineNumber: parseFloat(match[1])
        }));
      }
    }
    return result;
  },
  parseOpera11: function(error) {
    const filtered = error.stack.split("\n").filter(function(line) {
      return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
    }, this);
    return filtered.map(function(line) {
      const tokens = line.split("@");
      const locationParts = this.extractLocation(tokens.pop());
      const functionCall = tokens.shift() || "";
      const functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
      return new StackFrame({
        functionName,
        fileName: locationParts[0],
        lineNumber: locationParts[1],
        columnNumber: locationParts[2]
      });
    }, this);
  }
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/plugins/console/record/stringify.js
function pathToSelector(node) {
  if (!node || !node.outerHTML) {
    return "";
  }
  let path = "";
  while (node.parentElement) {
    let name = node.localName;
    if (!name) {
      break;
    }
    name = name.toLowerCase();
    const parent = node.parentElement;
    const domSiblings = [];
    if (parent.children && parent.children.length > 0) {
      for (let i2 = 0; i2 < parent.children.length; i2++) {
        const sibling = parent.children[i2];
        if (sibling.localName && sibling.localName.toLowerCase) {
          if (sibling.localName.toLowerCase() === name) {
            domSiblings.push(sibling);
          }
        }
      }
    }
    if (domSiblings.length > 1) {
      name += `:eq(${domSiblings.indexOf(node)})`;
    }
    path = name + (path ? ">" + path : "");
    node = parent;
  }
  return path;
}
function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
function isObjTooDeep(obj, limit) {
  if (limit === 0) {
    return true;
  }
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (isObject(obj[key]) && isObjTooDeep(obj[key], limit - 1)) {
      return true;
    }
  }
  return false;
}
function stringify(obj, stringifyOptions) {
  const options = {
    numOfKeysLimit: 50,
    depthOfLimit: 4
  };
  Object.assign(options, stringifyOptions);
  const stack = [];
  const keys = [];
  return JSON.stringify(obj, function(key, value) {
    if (stack.length > 0) {
      const thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(value)) {
        if (stack[0] === value) {
          value = "[Circular ~]";
        } else {
          value = "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
        }
      }
    } else {
      stack.push(value);
    }
    if (value === null)
      return value;
    if (value === void 0)
      return "undefined";
    if (shouldIgnore(value)) {
      return toString(value);
    }
    if (value instanceof Event) {
      const eventResult = {};
      for (const eventKey in value) {
        const eventValue = value[eventKey];
        if (Array.isArray(eventValue)) {
          eventResult[eventKey] = pathToSelector(eventValue.length ? eventValue[0] : null);
        } else {
          eventResult[eventKey] = eventValue;
        }
      }
      return eventResult;
    } else if (value instanceof Node) {
      if (value instanceof HTMLElement) {
        return value ? value.outerHTML : "";
      }
      return value.nodeName;
    } else if (value instanceof Error) {
      return value.stack ? value.stack + "\nEnd of stack for Error object" : value.name + ": " + value.message;
    }
    return value;
  });
  function shouldIgnore(_obj) {
    if (isObject(_obj) && Object.keys(_obj).length > options.numOfKeysLimit) {
      return true;
    }
    if (typeof _obj === "function") {
      return true;
    }
    if (isObject(_obj) && isObjTooDeep(_obj, options.depthOfLimit)) {
      return true;
    }
    return false;
  }
  function toString(_obj) {
    let str = _obj.toString();
    if (options.stringLengthLimit && str.length > options.stringLengthLimit) {
      str = `${str.slice(0, options.stringLengthLimit)}...`;
    }
    return str;
  }
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/plugins/console/record/index.js
var defaultLogOptions = {
  level: [
    "assert",
    "clear",
    "count",
    "countReset",
    "debug",
    "dir",
    "dirxml",
    "error",
    "group",
    "groupCollapsed",
    "groupEnd",
    "info",
    "log",
    "table",
    "time",
    "timeEnd",
    "timeLog",
    "trace",
    "warn"
  ],
  lengthThreshold: 1e3,
  logger: "console"
};
function initLogObserver(cb, win, options) {
  const logOptions = options ? Object.assign({}, defaultLogOptions, options) : defaultLogOptions;
  const loggerType = logOptions.logger;
  if (!loggerType) {
    return () => {
    };
  }
  let logger;
  if (typeof loggerType === "string") {
    logger = win[loggerType];
  } else {
    logger = loggerType;
  }
  let logCount = 0;
  let inStack = false;
  const cancelHandlers = [];
  if (logOptions.level.includes("error")) {
    const errorHandler2 = (event) => {
      const message = event.message, error = event.error;
      const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
      const payload = [stringify(message, logOptions.stringifyOptions)];
      cb({
        level: "error",
        trace,
        payload
      });
    };
    win.addEventListener("error", errorHandler2);
    cancelHandlers.push(() => {
      win.removeEventListener("error", errorHandler2);
    });
    const unhandledrejectionHandler = (event) => {
      let error;
      let payload;
      if (event.reason instanceof Error) {
        error = event.reason;
        payload = [
          stringify(`Uncaught (in promise) ${error.name}: ${error.message}`, logOptions.stringifyOptions)
        ];
      } else {
        error = new Error();
        payload = [
          stringify("Uncaught (in promise)", logOptions.stringifyOptions),
          stringify(event.reason, logOptions.stringifyOptions)
        ];
      }
      const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
      cb({
        level: "error",
        trace,
        payload
      });
    };
    win.addEventListener("unhandledrejection", unhandledrejectionHandler);
    cancelHandlers.push(() => {
      win.removeEventListener("unhandledrejection", unhandledrejectionHandler);
    });
  }
  for (const levelType of logOptions.level) {
    cancelHandlers.push(replace(logger, levelType));
  }
  return () => {
    cancelHandlers.forEach((h) => h());
  };
  function replace(_logger, level) {
    if (!_logger[level]) {
      return () => {
      };
    }
    return patch(_logger, level, (original) => {
      return (...args) => {
        original.apply(this, args);
        if (inStack) {
          return;
        }
        inStack = true;
        try {
          const trace = ErrorStackParser.parse(new Error()).map((stackFrame) => stackFrame.toString()).splice(1);
          const payload = args.map((s2) => stringify(s2, logOptions.stringifyOptions));
          logCount++;
          if (logCount < logOptions.lengthThreshold) {
            cb({
              level,
              trace,
              payload
            });
          } else if (logCount === logOptions.lengthThreshold) {
            cb({
              level: "warn",
              trace: [],
              payload: [
                stringify("The number of log records reached the threshold.")
              ]
            });
          }
        } catch (error) {
          original("rrweb logger error:", error, ...args);
        } finally {
          inStack = false;
        }
      };
    });
  }
}
var PLUGIN_NAME = "rrweb/console@1";
var getRecordConsolePlugin = (options) => ({
  name: PLUGIN_NAME,
  observer: initLogObserver,
  options
});

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/plugins/console/replay/index.js
var ORIGINAL_ATTRIBUTE_NAME2 = "__rrweb_original__";
var defaultLogConfig = {
  level: [
    "assert",
    "clear",
    "count",
    "countReset",
    "debug",
    "dir",
    "dirxml",
    "error",
    "group",
    "groupCollapsed",
    "groupEnd",
    "info",
    "log",
    "table",
    "time",
    "timeEnd",
    "timeLog",
    "trace",
    "warn"
  ],
  replayLogger: void 0
};
var LogReplayPlugin = class {
  constructor(config) {
    this.config = Object.assign(defaultLogConfig, config);
  }
  getConsoleLogger() {
    const replayLogger = {};
    for (const level of this.config.level) {
      if (level === "trace") {
        replayLogger[level] = (data) => {
          const logger = console.log[ORIGINAL_ATTRIBUTE_NAME2] ? console.log[ORIGINAL_ATTRIBUTE_NAME2] : console.log;
          logger(...data.payload.map((s2) => JSON.parse(s2)), this.formatMessage(data));
        };
      } else {
        replayLogger[level] = (data) => {
          const logger = console[level][ORIGINAL_ATTRIBUTE_NAME2] ? console[level][ORIGINAL_ATTRIBUTE_NAME2] : console[level];
          logger(...data.payload.map((s2) => JSON.parse(s2)), this.formatMessage(data));
        };
      }
    }
    return replayLogger;
  }
  formatMessage(data) {
    if (data.trace.length === 0) {
      return "";
    }
    const stackPrefix = "\n	at ";
    let result = stackPrefix;
    result += data.trace.join(stackPrefix);
    return result;
  }
};
var getReplayConsolePlugin = (options) => {
  const replayLogger = (options === null || options === void 0 ? void 0 : options.replayLogger) || new LogReplayPlugin(options).getConsoleLogger();
  return {
    handler(event, _isSync, context) {
      let logData = null;
      if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.Log) {
        logData = event.data;
      } else if (event.type === EventType.Plugin && event.data.plugin === PLUGIN_NAME) {
        logData = event.data.payload;
      }
      if (logData) {
        try {
          if (typeof replayLogger[logData.level] === "function") {
            replayLogger[logData.level](logData);
          }
        } catch (error) {
          if (context.replayer.config.showWarning) {
            console.warn(error);
          }
        }
      }
    }
  };
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/plugins/sequential-id/record/index.js
var defaultOptions = {
  key: "_sid"
};
var PLUGIN_NAME2 = "rrweb/sequential-id@1";
var getRecordSequentialIdPlugin = (options) => {
  const _options = options ? Object.assign({}, defaultOptions, options) : defaultOptions;
  let id = 0;
  return {
    name: PLUGIN_NAME2,
    eventProcessor(event) {
      Object.assign(event, {
        [_options.key]: ++id
      });
      return event;
    },
    options: _options
  };
};

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/plugins/sequential-id/replay/index.js
var defaultOptions2 = {
  key: "_sid",
  warnOnMissingId: true
};
var getReplaySequentialIdPlugin = (options) => {
  const { key, warnOnMissingId } = options ? Object.assign({}, defaultOptions2, options) : defaultOptions2;
  let currentId = 1;
  return {
    handler(event) {
      if (key in event) {
        const id = event[key];
        if (id !== currentId) {
          console.error(`[sequential-id-plugin]: expect to get an id with value "${currentId}", but got "${id}"`);
        } else {
          currentId++;
        }
      } else if (warnOnMissingId) {
        console.warn(`[sequential-id-plugin]: failed to get id in key: "${key}"`);
      }
    }
  };
};

// ../rrweb/packages/rrweb/es/rrweb/ext/mitt/dist/mitt.mjs.js
var mitt_mjs_exports = {};
__export(mitt_mjs_exports, {
  default: () => mitt
});
function mitt(n2) {
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/smoothscroll.js
function polyfill2(w = window, d = document) {
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
    throw new TypeError("behavior member of ScrollOptions " + firstArg.behavior + " is not a valid value for enumeration ScrollBehavior.");
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
      original.scroll.call(w, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : w.scrollX || w.pageXOffset, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : w.scrollY || w.pageYOffset);
      return;
    }
    smoothScroll.call(w, d.body, arguments[0].left !== void 0 ? ~~arguments[0].left : w.scrollX || w.pageXOffset, arguments[0].top !== void 0 ? ~~arguments[0].top : w.scrollY || w.pageYOffset);
  };
  w.scrollBy = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0])) {
      original.scrollBy.call(w, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : 0, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : 0);
      return;
    }
    smoothScroll.call(w, d.body, ~~arguments[0].left + (w.scrollX || w.pageXOffset), ~~arguments[0].top + (w.scrollY || w.pageYOffset));
  };
  Element2.prototype.scroll = Element2.prototype.scrollTo = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      if (typeof arguments[0] === "number" && arguments[1] === void 0) {
        throw new SyntaxError("Value could not be converted");
      }
      original.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left : typeof arguments[0] !== "object" ? ~~arguments[0] : this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top : arguments[1] !== void 0 ? ~~arguments[1] : this.scrollTop);
      return;
    }
    const left = arguments[0].left;
    const top = arguments[0].top;
    smoothScroll.call(this, this, typeof left === "undefined" ? this.scrollLeft : ~~left, typeof top === "undefined" ? this.scrollTop : ~~top);
  };
  Element2.prototype.scrollBy = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      original.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);
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
      original.scrollIntoView.call(this, arguments[0] === void 0 ? true : arguments[0]);
      return;
    }
    const scrollableParent = findScrollableParent(this);
    const parentRects = scrollableParent.getBoundingClientRect();
    const clientRects = this.getBoundingClientRect();
    if (scrollableParent !== d.body) {
      smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top);
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/timer.js
var Timer = class {
  constructor(actions = [], config) {
    this.timeOffset = 0;
    this.raf = null;
    this.actions = actions;
    this.speed = config.speed;
  }
  addAction(action) {
    const rafWasActive = this.raf === true;
    if (!this.actions.length || this.actions[this.actions.length - 1].delay <= action.delay) {
      this.actions.push(action);
    } else {
      const index = this.findActionIndex(action);
      this.actions.splice(index, 0, action);
    }
    if (rafWasActive) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    }
  }
  addActions(actions) {
    this.actions = this.actions.concat(actions);
  }
  replaceActions(actions) {
    this.actions.length = 0;
    this.actions.splice(0, 0, ...actions);
  }
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

// ../rrweb/packages/rrweb/es/rrweb/ext/@xstate/fsm/es/index.js
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

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/machine.js
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
  const playerMachine = s({
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
  }, {
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
        return Object.assign(Object.assign({}, ctx), { timeOffset, baselineTime: ctx.events[0].timestamp + timeOffset });
      }),
      play(ctx) {
        var _a2;
        const { timer, events, baselineTime, lastPlayedEvent } = ctx;
        timer.clear();
        for (const event of events) {
          addDelay(event, baselineTime);
        }
        const neededEvents = discardPriorSnapshots(events, baselineTime);
        let lastPlayedTimestamp = lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.timestamp;
        if ((lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.type) === EventType.IncrementalSnapshot && lastPlayedEvent.data.source === IncrementalSource.MouseMove) {
          lastPlayedTimestamp = lastPlayedEvent.timestamp + ((_a2 = lastPlayedEvent.data.positions[0]) === null || _a2 === void 0 ? void 0 : _a2.timeOffset);
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
        return Object.assign(Object.assign({}, ctx), { lastPlayedEvent: null });
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
        return Object.assign(Object.assign({}, ctx), { events: curEvents });
      }),
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
        return Object.assign(Object.assign({}, ctx), { events });
      })
    }
  });
  return v(playerMachine);
}
function createSpeedService(context) {
  const speedMachine = s({
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
  }, {
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
  });
  return v(speedMachine);
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/styles/inject-style.js
var rules = (blockClass) => [
  "noscript { display: none !important; }",
  `.${blockClass} { background: currentColor; border-radius: 5px; }`,
  `.${blockClass}:hover::after {content: 'Redacted'; color: white; background: black; text-align: center; width: 100%; display: block;}`
];

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/canvas/deserialize-args.js
var webGLVarMap = /* @__PURE__ */ new Map();
function variableListFor2(ctx, ctor) {
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
  return (arg) => __awaiter(this, void 0, void 0, function* () {
    if (arg && typeof arg === "object" && "rr_type" in arg) {
      if (preload)
        preload.isUnchanged = false;
      if (arg.rr_type === "ImageBitmap" && "args" in arg) {
        const args = yield deserializeArg(imageMap, ctx, preload)(arg.args);
        return yield createImageBitmap.apply(null, args);
      } else if ("index" in arg) {
        if (preload || ctx === null)
          return arg;
        const { rr_type: name, index } = arg;
        return variableListFor2(ctx, name)[index];
      } else if ("args" in arg) {
        const { rr_type: name, args } = arg;
        const ctor = window[name];
        return new ctor(...yield Promise.all(args.map(deserializeArg(imageMap, ctx, preload))));
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
        const blobContents = yield Promise.all(arg.data.map(deserializeArg(imageMap, ctx, preload)));
        const blob = new Blob(blobContents, {
          type: arg.type
        });
        return blob;
      }
    } else if (Array.isArray(arg)) {
      const result = yield Promise.all(arg.map(deserializeArg(imageMap, ctx, preload)));
      return result;
    }
    return arg;
  });
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/canvas/webgl.js
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
  if (!(result === null || result === void 0 ? void 0 : result.constructor))
    return;
  const { name } = result.constructor;
  if (!WebGLVariableConstructorsNames.includes(name))
    return;
  const variables = variableListFor2(ctx, name);
  if (!variables.includes(result))
    variables.push(result);
}
function webglMutation({ mutation, target, type, imageMap, errorHandler: errorHandler2 }) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const ctx = getContext(target, type);
      if (!ctx)
        return;
      if (mutation.setter) {
        ctx[mutation.property] = mutation.args[0];
        return;
      }
      const original = ctx[mutation.property];
      const args = yield Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
      const result = original.apply(ctx, args);
      saveToWebGLVarMap(ctx, result);
      const debugMode = false;
      if (debugMode)
        ;
    } catch (error) {
      errorHandler2(mutation, error);
    }
  });
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/canvas/2d.js
function canvasMutation({ event, mutation, target, imageMap, errorHandler: errorHandler2 }) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const ctx = target.getContext("2d");
      if (mutation.setter) {
        ctx[mutation.property] = mutation.args[0];
        return;
      }
      const original = ctx[mutation.property];
      if (mutation.property === "drawImage" && typeof mutation.args[0] === "string") {
        imageMap.get(event);
        original.apply(ctx, mutation.args);
      } else {
        const args = yield Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
        original.apply(ctx, args);
      }
    } catch (error) {
      errorHandler2(mutation, error);
    }
  });
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/canvas/index.js
function canvasMutation2({ event, mutation, target, imageMap, canvasEventMap, errorHandler: errorHandler2 }) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const precomputedMutation = canvasEventMap.get(event) || mutation;
      const commands = "commands" in precomputedMutation ? precomputedMutation.commands : [precomputedMutation];
      if ([CanvasContext.WebGL, CanvasContext.WebGL2].includes(mutation.type)) {
        for (let i2 = 0; i2 < commands.length; i2++) {
          const command = commands[i2];
          yield webglMutation({
            mutation: command,
            type: mutation.type,
            target,
            imageMap,
            errorHandler: errorHandler2
          });
        }
        return;
      }
      for (let i2 = 0; i2 < commands.length; i2++) {
        const command = commands[i2];
        yield canvasMutation({
          event,
          mutation: command,
          target,
          imageMap,
          errorHandler: errorHandler2
        });
      }
    } catch (error) {
      errorHandler2(mutation, error);
    }
  });
}

// ../rrweb/packages/rrweb/es/rrweb/rrweb/packages/rrweb/src/replay/index.js
var SKIP_TIME_THRESHOLD = 10 * 1e3;
var SKIP_TIME_INTERVAL = 5 * 1e3;
var SKIP_TIME_MIN = 1 * 1e3;
var SKIP_DURATION_LIMIT = 60 * 60 * 1e3;
var mitt2 = mitt || mitt_mjs_exports;
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
  get timer() {
    return this.service.state.context.timer;
  }
  constructor(events, config) {
    this.usingVirtualDom = false;
    this.virtualDom = new RRDocument();
    this.mouseTail = null;
    this.tailPositions = [];
    this.emitter = mitt2();
    this.activityIntervals = [];
    this.legacy_missingNodeRetryMap = {};
    this.cache = createCache();
    this.imageMap = /* @__PURE__ */ new Map();
    this.canvasEventMap = /* @__PURE__ */ new Map();
    this.mirror = createMirror();
    this.styleMirror = new StyleSheetMirror();
    this.firstFullSnapshot = null;
    this.newDocumentQueue = [];
    this.mousePos = null;
    this.touchActive = null;
    this.lastMouseDownEvent = null;
    this.lastSelectionData = null;
    this.constructedStyleMutations = [];
    this.adoptedStyleSheets = [];
    this.handleResize = (dimension) => {
      this.iframe.style.display = "inherit";
      for (const el of [this.mouseTail, this.iframe]) {
        if (!el) {
          continue;
        }
        el.setAttribute("width", String(dimension.width));
        el.setAttribute("height", String(dimension.height));
      }
    };
    this.applyEventsSynchronously = (events2) => {
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
    };
    this.getCastFn = (event, isSync = false) => {
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
            this.rebuildFullSnapshot(event, isSync);
            (_a2 = this.iframe.contentWindow) === null || _a2 === void 0 ? void 0 : _a2.scrollTo(event.data.initialOffset);
            this.styleMirror.reset();
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
                  if (_event.delay - event.delay > SKIP_TIME_THRESHOLD * this.speedService.state.context.timer.speed) {
                    this.nextUserInteractionEvent = _event;
                  }
                  break;
                }
              }
              if (this.nextUserInteractionEvent) {
                const skipTime = this.nextUserInteractionEvent.delay - event.delay;
                const payload = {
                  speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), this.config.maxSpeed)
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
    };
    if (!(config === null || config === void 0 ? void 0 : config.liveMode) && events.length < 2) {
      throw new Error("Replayer need at least 2 events.");
    }
    const defaultConfig = {
      speed: 1,
      maxSpeed: 360,
      root: document.body,
      loadTimeout: 0,
      skipInactive: false,
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
            void canvasMutation2({
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
            diff(this.iframe.contentDocument, this.virtualDom, replayerHandler, this.virtualDom.mirror);
          } catch (e2) {
            console.warn(e2);
          }
        this.virtualDom.destroyTree();
        this.usingVirtualDom = false;
        if (Object.keys(this.legacy_missingNodeRetryMap).length) {
          for (const key in this.legacy_missingNodeRetryMap) {
            try {
              const value = this.legacy_missingNodeRetryMap[key];
              const realNode = createOrGetNode(value.node, this.mirror, this.virtualDom.mirror);
              diff(realNode, value.node, replayerHandler, this.virtualDom.mirror);
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
        this.moveAndHover(this.mousePos.x, this.mousePos.y, this.mousePos.id, true, this.mousePos.debugData);
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
    });
    const timer = new Timer([], {
      speed: this.config.speed
    });
    this.service = createPlayerService({
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
    }, {
      getCastFn: this.getCastFn,
      applyEventsSynchronously: this.applyEventsSynchronously,
      emitter: this.emitter
    });
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
    const firstMeta = this.service.state.context.events.find((e2) => e2.type === EventType.Meta);
    const firstFullsnapshot = this.service.state.context.events.find((e2) => e2.type === EventType.FullSnapshot);
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
        this.rebuildFullSnapshot(firstFullsnapshot);
        (_a2 = this.iframe.contentWindow) === null || _a2 === void 0 ? void 0 : _a2.scrollTo(firstFullsnapshot.data.initialOffset);
      }, 1);
    }
    if (this.service.state.context.events.find(indicatesTouchDevice)) {
      this.mouse.classList.add("touch-device");
    }
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
  getActivityIntervals() {
    if (this.activityIntervals.length == 0) {
      const allIntervals = [];
      const metadata = this.getMetaData();
      const userInteractionEvents = [
        { timestamp: metadata.startTime },
        ...this.service.state.context.events.filter((ev) => this.isUserInteraction(ev)),
        { timestamp: metadata.endTime }
      ];
      for (let i2 = 1; i2 < userInteractionEvents.length; i2++) {
        const currentInterval2 = userInteractionEvents[i2 - 1];
        const _event = userInteractionEvents[i2];
        if (_event.timestamp - currentInterval2.timestamp > SKIP_TIME_THRESHOLD) {
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
  getMetaData() {
    const firstEvent = this.service.state.context.events[0];
    const lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
    return {
      startTime: firstEvent.timestamp,
      endTime: lastEvent.timestamp,
      totalTime: lastEvent.timestamp - firstEvent.timestamp
    };
  }
  getCurrentTime() {
    return this.timer.timeOffset + this.getTimeOffset();
  }
  getTimeOffset() {
    const { baselineTime, events } = this.service.state.context;
    return baselineTime - events[0].timestamp;
  }
  getMirror() {
    return this.mirror;
  }
  play(timeOffset = 0) {
    var _a2, _b2;
    if (this.service.state.matches("paused")) {
      this.service.send({ type: "PLAY", payload: { timeOffset } });
    } else {
      this.service.send({ type: "PAUSE" });
      this.service.send({ type: "PLAY", payload: { timeOffset } });
    }
    (_b2 = (_a2 = this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.getElementsByTagName("html")[0]) === null || _b2 === void 0 ? void 0 : _b2.classList.remove("rrweb-paused");
    this.emitter.emit(ReplayerEvents.Start);
  }
  pause(timeOffset) {
    var _a2, _b2;
    if (timeOffset === void 0 && this.service.state.matches("playing")) {
      this.service.send({ type: "PAUSE" });
    }
    if (typeof timeOffset === "number") {
      this.play(timeOffset);
      this.service.send({ type: "PAUSE" });
    }
    (_b2 = (_a2 = this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.getElementsByTagName("html")[0]) === null || _b2 === void 0 ? void 0 : _b2.classList.add("rrweb-paused");
    this.emitter.emit(ReplayerEvents.Pause);
  }
  resume(timeOffset = 0) {
    this.warn(`The 'resume' was deprecated in 1.0. Please use 'play' method which has the same interface.`);
    this.play(timeOffset);
    this.emitter.emit(ReplayerEvents.Resume);
  }
  destroy() {
    this.pause();
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
    void Promise.resolve().then(() => this.service.send({ type: "ADD_EVENT", payload: { event } }));
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
      polyfill2(this.iframe.contentWindow, this.iframe.contentDocument);
      polyfill(this.iframe.contentWindow);
    }
  }
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
          speed: skipTime / SKIP_DURATION_LIMIT * this.config.inactiveSkipTime < SKIP_TIME_MIN ? skipTime / SKIP_TIME_MIN : Math.round(Math.max(skipTime, SKIP_DURATION_LIMIT) / this.config.inactiveSkipTime)
        };
        this.speedService.send({ type: "FAST_FORWARD", payload });
        this.emitter.emit(ReplayerEvents.SkipStart, payload);
      }
    }
  }
  rebuildFullSnapshot(event, isSync = false) {
    if (!this.iframe.contentDocument) {
      return this.warn("Looks like your replayer has been destroyed.");
    }
    if (Object.keys(this.legacy_missingNodeRetryMap).length) {
      this.warn("Found unresolved missing node map", this.legacy_missingNodeRetryMap);
    }
    this.legacy_missingNodeRetryMap = {};
    const collected = [];
    const afterAppend = (builtNode, id) => {
      this.collectIframeAndAttachDocument(collected, builtNode);
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
    for (const { mutationInQueue, builtNode } of collected) {
      this.attachDocumentToIframe(mutationInQueue, builtNode);
      this.newDocumentQueue = this.newDocumentQueue.filter((m) => m !== mutationInQueue);
    }
    const { documentElement, head } = this.iframe.contentDocument;
    this.insertStyleRules(documentElement, head);
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
    const injectStylesRules = rules(this.config.blockClass).concat(this.config.insertStyleRules);
    if (this.config.pauseAnimation) {
      injectStylesRules.push("html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }");
    }
    if (this.usingVirtualDom) {
      const styleEl = this.virtualDom.createElement("style");
      this.virtualDom.mirror.add(styleEl, getDefaultSN(styleEl, this.virtualDom.unserializedId));
      documentElement.insertBefore(styleEl, head);
      styleEl.rules.push({
        source: IncrementalSource.StyleSheetRule,
        adds: injectStylesRules.map((cssText, index) => ({
          rule: cssText,
          index
        }))
      });
    } else {
      const styleEl = document.createElement("style");
      documentElement.insertBefore(styleEl, head);
      for (let idx = 0; idx < injectStylesRules.length; idx++) {
        (_a2 = styleEl.sheet) === null || _a2 === void 0 ? void 0 : _a2.insertRule(injectStylesRules[idx], idx);
      }
    }
  }
  attachDocumentToIframe(mutation, iframeEl) {
    const mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
    const collected = [];
    const afterAppend = (builtNode, id) => {
      this.collectIframeAndAttachDocument(collected, builtNode);
      const sn = mirror2.getMeta(builtNode);
      if ((sn === null || sn === void 0 ? void 0 : sn.type) === NodeType.Element && (sn === null || sn === void 0 ? void 0 : sn.tagName.toUpperCase()) === "HTML") {
        const { documentElement, head } = iframeEl.contentDocument;
        this.insertStyleRules(documentElement, head);
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
    for (const { mutationInQueue, builtNode } of collected) {
      this.attachDocumentToIframe(mutationInQueue, builtNode);
      this.newDocumentQueue = this.newDocumentQueue.filter((m) => m !== mutationInQueue);
    }
  }
  collectIframeAndAttachDocument(collected, builtNode) {
    if (isSerializedIframe(builtNode, this.mirror)) {
      const mutationInQueue = this.newDocumentQueue.find((m) => m.parentId === this.mirror.getId(builtNode));
      if (mutationInQueue) {
        collected.push({
          mutationInQueue,
          builtNode
        });
      }
    }
  }
  waitForStylesheetLoad() {
    var _a2;
    const head = (_a2 = this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.head;
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
  preloadAllImages() {
    return __awaiter(this, void 0, void 0, function* () {
      this.service.state;
      const stateHandler = () => {
        this.service.state;
      };
      this.emitter.on(ReplayerEvents.Start, stateHandler);
      this.emitter.on(ReplayerEvents.Pause, stateHandler);
      const promises = [];
      for (const event of this.service.state.context.events) {
        if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.CanvasMutation) {
          promises.push(this.deserializeAndPreloadCanvasEvents(event.data, event));
          const commands = "commands" in event.data ? event.data.commands : [event.data];
          commands.forEach((c2) => {
            this.preloadImages(c2, event);
          });
        }
      }
      return Promise.all(promises);
    });
  }
  preloadImages(data, event) {
    if (data.property === "drawImage" && typeof data.args[0] === "string" && !this.imageMap.has(event)) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const imgd = ctx === null || ctx === void 0 ? void 0 : ctx.createImageData(canvas.width, canvas.height);
      imgd === null || imgd === void 0 ? void 0 : imgd.data;
      JSON.parse(data.args[0]);
      ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imgd, 0, 0);
    }
  }
  deserializeAndPreloadCanvasEvents(data, event) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.canvasEventMap.has(event)) {
        const status = {
          isUnchanged: true
        };
        if ("commands" in data) {
          const commands = yield Promise.all(data.commands.map((c2) => __awaiter(this, void 0, void 0, function* () {
            const args = yield Promise.all(c2.args.map(deserializeArg(this.imageMap, null, status)));
            return Object.assign(Object.assign({}, c2), { args });
          })));
          if (status.isUnchanged === false)
            this.canvasEventMap.set(event, Object.assign(Object.assign({}, data), { commands }));
        } else {
          const args = yield Promise.all(data.args.map(deserializeArg(this.imageMap, null, status)));
          if (status.isUnchanged === false)
            this.canvasEventMap.set(event, Object.assign(Object.assign({}, data), { args }));
        }
      }
    });
  }
  applyIncremental(e2, isSync) {
    var _a2, _b2, _c;
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
            delay: e2.delay - ((_a2 = d.positions[0]) === null || _a2 === void 0 ? void 0 : _a2.timeOffset)
          });
        }
        break;
      case IncrementalSource.MouseInteraction: {
        if (d.id === -1) {
          break;
        }
        const event = new Event(MouseInteractions[d.type].toLowerCase());
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
                x: d.x,
                y: d.y,
                id: d.id,
                debugData: d
              };
            } else {
              if (d.type === MouseInteractions.TouchStart) {
                this.tailPositions.length = 0;
              }
              this.moveAndHover(d.x, d.y, d.id, isSync, d);
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
        try {
          if (d.currentTime !== void 0) {
            mediaEl.currentTime = d.currentTime;
          }
          if (d.volume !== void 0) {
            mediaEl.volume = d.volume;
          }
          if (d.muted !== void 0) {
            mediaEl.muted = d.muted;
          }
          if (d.type === 1) {
            mediaEl.pause();
          }
          if (d.type === 0) {
            void mediaEl.play();
          }
          if (d.type === 4) {
            mediaEl.playbackRate = d.playbackRate;
          }
        } catch (error) {
          this.warn(`Failed to replay media interactions: ${error.message || error}`);
        }
        break;
      }
      case IncrementalSource.StyleSheetRule:
      case IncrementalSource.StyleDeclaration: {
        if (this.usingVirtualDom) {
          if (d.styleId)
            this.constructedStyleMutations.push(d);
          else if (d.id)
            (_b2 = this.virtualDom.mirror.getNode(d.id)) === null || _b2 === void 0 ? void 0 : _b2.rules.push(d);
        } else
          this.applyStyleSheetMutation(d);
        break;
      }
      case IncrementalSource.CanvasMutation: {
        if (!this.config.UNSAFE_replayCanvas) {
          return;
        }
        if (this.usingVirtualDom) {
          const target = this.virtualDom.mirror.getNode(d.id);
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
          void canvasMutation2({
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
          const fontFace = new FontFace(d.family, d.buffer ? new Uint8Array(JSON.parse(d.fontSource)) : d.fontSource, d.descriptors);
          (_c = this.iframe.contentDocument) === null || _c === void 0 ? void 0 : _c.fonts.add(fontFace);
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
  applyMutation(d, isSync) {
    if (this.config.useVirtualDom && !this.usingVirtualDom && isSync) {
      this.usingVirtualDom = true;
      buildFromDom(this.iframe.contentDocument, this.mirror, this.virtualDom);
      if (Object.keys(this.legacy_missingNodeRetryMap).length) {
        for (const key in this.legacy_missingNodeRetryMap) {
          try {
            const value = this.legacy_missingNodeRetryMap[key];
            const virtualNode = buildFromNode(value.node, this.virtualDom, this.mirror);
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
      let parent = mirror2.getNode(mutation.parentId);
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
          if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_a2 = parent.rules) === null || _a2 === void 0 ? void 0 : _a2.length) > 0)
            parent.rules = [];
        } catch (error) {
          if (error instanceof DOMException) {
            this.warn("parent could not remove child in mutation", parent, target, d);
          } else {
            throw error;
          }
        }
    });
    const legacy_missingNodeMap = Object.assign({}, this.legacy_missingNodeRetryMap);
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
      var _a2, _b2;
      if (!this.iframe.contentDocument) {
        return this.warn("Looks like your replayer has been destroyed.");
      }
      let parent = mirror2.getNode(mutation.parentId);
      if (!parent) {
        if (mutation.node.type === NodeType.Document) {
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
        this.attachDocumentToIframe(mutation, parent);
        return;
      }
      const afterAppend = (node, id) => {
        if (this.usingVirtualDom)
          return;
        for (const plugin of this.config.plugins || []) {
          if (plugin.onBuild)
            plugin.onBuild(node, { id, replayer: this });
        }
      };
      const target = buildNodeWithSN(mutation.node, {
        doc: targetDoc,
        mirror: mirror2,
        skipChild: true,
        hackCss: true,
        cache: this.cache,
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
      if (parentSn && parentSn.type === NodeType.Element && parentSn.tagName === "textarea" && mutation.node.type === NodeType.Text) {
        const childNodeArray = Array.isArray(parent.childNodes) ? parent.childNodes : Array.from(parent.childNodes);
        for (const c2 of childNodeArray) {
          if (c2.nodeType === parent.TEXT_NODE) {
            parent.removeChild(c2);
          }
        }
      } else if ((parentSn === null || parentSn === void 0 ? void 0 : parentSn.type) === NodeType.Document) {
        const parentDoc = parent;
        if (mutation.node.type === NodeType.DocumentType && ((_a2 = parentDoc.childNodes[0]) === null || _a2 === void 0 ? void 0 : _a2.nodeType) === Node.DOCUMENT_TYPE_NODE)
          parentDoc.removeChild(parentDoc.childNodes[0]);
        if (target.nodeName === "HTML" && parentDoc.documentElement)
          parentDoc.removeChild(parentDoc.documentElement);
      }
      if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
        parent.insertBefore(target, previous.nextSibling);
      } else if (next && next.parentNode) {
        parent.contains(next) ? parent.insertBefore(target, next) : parent.insertBefore(target, null);
      } else {
        parent.appendChild(target);
      }
      afterAppend(target, mutation.node.id);
      if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_b2 = parent.rules) === null || _b2 === void 0 ? void 0 : _b2.length) > 0)
        parent.rules = [];
      if (isSerializedIframe(target, this.mirror)) {
        const targetId = this.mirror.getId(target);
        const mutationInQueue = this.newDocumentQueue.find((m) => m.parentId === targetId);
        if (mutationInQueue) {
          this.attachDocumentToIframe(mutationInQueue, target);
          this.newDocumentQueue = this.newDocumentQueue.filter((m) => m !== mutationInQueue);
        }
      }
      if (mutation.previousId || mutation.nextId) {
        this.legacy_resolveMissingNode(legacy_missingNodeMap, parent, target, mutation);
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
        this.warn("Timeout in the loop, please check the resolve tree data:", resolveTrees);
        break;
      }
      for (const tree of resolveTrees) {
        const parent = mirror2.getNode(tree.value.parentId);
        if (!parent) {
          this.debug("Drop resolve tree since there is no parent for the root node.", tree);
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
        if (((_a2 = parent === null || parent === void 0 ? void 0 : parent.rules) === null || _a2 === void 0 ? void 0 : _a2.length) > 0)
          parent.rules = [];
      }
    });
    d.attributes.forEach((mutation) => {
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
          } else if (typeof value === "string") {
            try {
              if (attributeName === "_cssText" && (target.nodeName === "LINK" || target.nodeName === "STYLE")) {
                try {
                  const newSn = mirror2.getMeta(target);
                  Object.assign(newSn.attributes, mutation.attributes);
                  const newNode = buildNodeWithSN(newSn, {
                    doc: target.ownerDocument,
                    mirror: mirror2,
                    skipChild: true,
                    hackCss: true,
                    cache: this.cache
                  });
                  const siblingNode = target.nextSibling;
                  const parentNode = target.parentNode;
                  if (newNode && parentNode) {
                    parentNode.removeChild(target);
                    parentNode.insertBefore(newNode, siblingNode);
                    mirror2.replace(mutation.id, newNode);
                    break;
                  }
                } catch (e2) {
                }
              }
              target.setAttribute(attributeName, value);
            } catch (error) {
              this.warn("An error occurred may due to the checkout feature.", error);
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
  applyScroll(d, isSync) {
    var _a2, _b2;
    const target = this.mirror.getNode(d.id);
    if (!target) {
      return this.debugNodeNotFound(d, d.id);
    }
    const sn = this.mirror.getMeta(target);
    if (target === this.iframe.contentDocument) {
      (_a2 = this.iframe.contentWindow) === null || _a2 === void 0 ? void 0 : _a2.scrollTo({
        top: d.y,
        left: d.x,
        behavior: isSync ? "auto" : "smooth"
      });
    } else if ((sn === null || sn === void 0 ? void 0 : sn.type) === NodeType.Document) {
      (_b2 = target.defaultView) === null || _b2 === void 0 ? void 0 : _b2.scrollTo({
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
        const selection = doc === null || doc === void 0 ? void 0 : doc.getSelection();
        selection && selectionSet.add(selection);
        return {
          range: result,
          selection
        };
      });
      selectionSet.forEach((s2) => s2.removeAllRanges());
      ranges.forEach((r2) => {
        var _a2;
        return r2 && ((_a2 = r2.selection) === null || _a2 === void 0 ? void 0 : _a2.addRange(r2.range));
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
      styleSheet = ((_a2 = this.mirror.getNode(data.id)) === null || _a2 === void 0 ? void 0 : _a2.sheet) || null;
    if (!styleSheet)
      return;
    if (data.source === IncrementalSource.StyleSheetRule)
      this.applyStyleSheetRule(data, styleSheet);
    else if (data.source === IncrementalSource.StyleDeclaration)
      this.applyStyleDeclaration(data, styleSheet);
  }
  applyStyleSheetRule(data, styleSheet) {
    var _a2, _b2, _c, _d;
    (_a2 = data.adds) === null || _a2 === void 0 ? void 0 : _a2.forEach(({ rule, index: nestedIndex }) => {
      try {
        if (Array.isArray(nestedIndex)) {
          const { positions, index } = getPositionsAndIndex(nestedIndex);
          const nestedRule = getNestedRule(styleSheet.cssRules, positions);
          nestedRule.insertRule(rule, index);
        } else {
          const index = nestedIndex === void 0 ? void 0 : Math.min(nestedIndex, styleSheet.cssRules.length);
          styleSheet === null || styleSheet === void 0 ? void 0 : styleSheet.insertRule(rule, index);
        }
      } catch (e2) {
      }
    });
    (_b2 = data.removes) === null || _b2 === void 0 ? void 0 : _b2.forEach(({ index: nestedIndex }) => {
      try {
        if (Array.isArray(nestedIndex)) {
          const { positions, index } = getPositionsAndIndex(nestedIndex);
          const nestedRule = getNestedRule(styleSheet.cssRules, positions);
          nestedRule.deleteRule(index || 0);
        } else {
          styleSheet === null || styleSheet === void 0 ? void 0 : styleSheet.deleteRule(nestedIndex);
        }
      } catch (e2) {
      }
    });
    if (data.replace)
      try {
        void ((_c = styleSheet.replace) === null || _c === void 0 ? void 0 : _c.call(styleSheet, data.replace));
      } catch (e2) {
      }
    if (data.replaceSync)
      try {
        (_d = styleSheet.replaceSync) === null || _d === void 0 ? void 0 : _d.call(styleSheet, data.replaceSync);
      } catch (e2) {
      }
  }
  applyStyleDeclaration(data, styleSheet) {
    if (data.set) {
      const rule = getNestedRule(styleSheet.rules, data.index);
      rule.style.setProperty(data.set.property, data.set.value, data.set.priority);
    }
    if (data.remove) {
      const rule = getNestedRule(styleSheet.rules, data.index);
      rule.style.removeProperty(data.remove.property);
    }
  }
  applyAdoptedStyleSheet(data) {
    var _a2;
    const targetHost = this.mirror.getNode(data.id);
    if (!targetHost)
      return;
    (_a2 = data.styles) === null || _a2 === void 0 ? void 0 : _a2.forEach((style) => {
      var _a3;
      let newStyleSheet = null;
      let hostWindow = null;
      if (hasShadowRoot(targetHost))
        hostWindow = ((_a3 = targetHost.ownerDocument) === null || _a3 === void 0 ? void 0 : _a3.defaultView) || null;
      else if (targetHost.nodeName === "#document")
        hostWindow = targetHost.defaultView;
      if (!hostWindow)
        return;
      try {
        newStyleSheet = new hostWindow.CSSStyleSheet();
        this.styleMirror.add(newStyleSheet, style.styleId);
        this.applyStyleSheetRule({
          source: IncrementalSource.StyleSheetRule,
          adds: style.rules
        }, newStyleSheet);
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
        setTimeout(() => adoptStyleSheets(targetHost2, styleIds), 0 + 100 * count);
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
      parent.insertBefore(node, target.nextSibling);
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
    (_a2 = this.lastHoveredRootNode || this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.querySelectorAll(".\\:hover").forEach((hoveredEl) => {
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
export {
  EventType,
  IncrementalSource,
  MouseInteractions,
  PLUGIN_NAME,
  Replayer,
  ReplayerEvents,
  addCustomEvent,
  freezePage,
  getRecordConsolePlugin,
  getRecordSequentialIdPlugin,
  getReplayConsolePlugin,
  getReplaySequentialIdPlugin,
  _mirror as mirror,
  pack,
  record,
  unpack,
  utils_exports as utils
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
