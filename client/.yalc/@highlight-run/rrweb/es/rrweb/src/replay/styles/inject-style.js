var rules = function (blockClass) { return [
    "iframe, ." + blockClass + " { background: #ccc }",
    'noscript { display: none !important; }',
]; };

export default rules;
