import { Program, Node, Identifier } from "acorn";

export function evaluate(expression: string, context: Record<string, any>) {
    const fn = new Function(...Object.keys(context), `return ${expression}`);
    return fn(...Object.values(context));
}

// Whitelist of allowed global objects and their methods
const SAFE_GLOBALS = {
    Math: [
        'abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor',
        'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'
    ],
    Number: ['isFinite', 'isInteger', 'isNaN', 'parseFloat', 'parseInt'],
    String: ['fromCharCode', 'fromCodePoint'],
    Array: ['isArray'],
    Date: ['now', 'parse', 'UTC', 'toISOString', 'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString', 'toString', 'valueOf'],
    JSON: ['parse', 'stringify']
};

// Potentially dangerous patterns to check for
const DANGEROUS_PATTERNS = [
    'eval',
    'Function',
    'setTimeout',
    'setInterval',
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'Worker',
    'import',
    'require',
    'process',
    'window',
    'document',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'navigator',
    'location',
    'history',
    'crypto',
    'atob',
    'btoa'
];

export function extractMaliciousCode(AST: Program): Identifier[] {
    const dangerousNodes: Identifier[] = [];

    const traverse = (node: any) => {
        // Check for dangerous identifiers
        if (node.type === 'Identifier' && DANGEROUS_PATTERNS.includes(node.name)) {
            dangerousNodes.push(node);
            return;
        }

        // Check for member expressions (e.g., Math.random)
        if (node.type === 'MemberExpression') {
            const objectName = node.object.name;
            const propertyName = node.property.name;

            // If accessing a global object
            if (objectName in SAFE_GLOBALS) {
                // Check if the method is in the whitelist
                if (!SAFE_GLOBALS[objectName].includes(propertyName)) {
                    dangerousNodes.push(node);
                }
            } else if (!DANGEROUS_PATTERNS.includes(objectName)) {
                // If accessing a non-whitelisted global object
                dangerousNodes.push(node);
            }
        }

        // Check for function calls
        if (node.type === 'CallExpression') {
            const callee = node.callee;

            // Check direct function calls
            if (callee.type === 'Identifier' && DANGEROUS_PATTERNS.includes(callee.name)) {
                dangerousNodes.push(node);
                return;
            }

            // Check method calls
            if (callee.type === 'MemberExpression') {
                const objectName = callee.object.name;
                const propertyName = callee.property.name;

                if (objectName in SAFE_GLOBALS) {
                    if (!SAFE_GLOBALS[objectName].includes(propertyName)) {
                        dangerousNodes.push(node);
                    }
                } else if (!DANGEROUS_PATTERNS.includes(objectName)) {
                    dangerousNodes.push(node);
                }
            }
        }

        // Recursively traverse all child nodes
        for (const key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach(traverse);
                } else {
                    traverse(node[key]);
                }
            }
        }
    };

    traverse(AST);
    return dangerousNodes;
}
