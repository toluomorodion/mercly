const fs = require('fs');
const path = require('path');

const colorFile = path.join(__dirname, 'color-tokens.json');
const designFile = path.join(__dirname, 'typography-tokens.json');
const outputFile = path.join(__dirname, 'tokens.css');

const colorData = JSON.parse(fs.readFileSync(colorFile, 'utf8'));
const designData = JSON.parse(fs.readFileSync(designFile, 'utf8'));

// Helper to resolve token references like "{color.palette.primary.100}"
function resolveColor(ref, rootData) {
    if (typeof ref === 'string' && ref.startsWith('{') && ref.endsWith('}')) {
        const pathParts = ref.slice(1, -1).split('.');
        let current = rootData;
        for (const part of pathParts) {
            if (current[part] !== undefined) {
                current = current[part];
            } else {
                return ref; // Unresolved path
            }
        }
        // Recursively resolve if the resolved value is another reference
        return resolveColor(current, rootData);
    }
    return ref;
}

// Convert camelCase or spaces into kebab-case
function toKebabCase(str) {
    return str
        .replace(/\s+/g, '-')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase();
}

let cssVariables = [];
let darkCssVariables = [];

// 1. Process Color Tokens (Only Roles)
const lightRoles = colorData.color.role.light;
const darkRoles = colorData.color.role.dark;

// Add Light Colors
for (const [key, value] of Object.entries(lightRoles)) {
    const cssVarName = `--color-${toKebabCase(key)}`;
    const resolvedValue = resolveColor(value, colorData);
    cssVariables.push(`  ${cssVarName}: ${resolvedValue};`);
}

// Add Dark Colors
for (const [key, value] of Object.entries(darkRoles)) {
    const cssVarName = `--color-${toKebabCase(key)}`;
    const resolvedValue = resolveColor(value, colorData);
    darkCssVariables.push(`  ${cssVarName}: ${resolvedValue};`);
}

// 2. Process Typography Tokens
if (designData.typography) {
    const typography = designData.typography;
    for (const [category, styles] of Object.entries(typography)) {
        for (const [styleName, props] of Object.entries(styles)) {
            const baseVar = `--typography-${toKebabCase(category)}-${toKebabCase(styleName)}`;
            
            for (const [propName, propData] of Object.entries(props)) {
                // If it's a composite token we might need to handle deeply nested structure, 
                // but based on design-tokens.tokens.json, it's flat properties like fontSize.
                const propVarName = `${baseVar}-${toKebabCase(propName)}`;
                let value = propData.value;
                
                // Add px if it's a dimension and a pure number
                if (propData.type === 'dimension' && typeof value === 'number') {
                    // It can be unitless in Figma but often exported as pure numbers. 
                    // To stay safe standard CSS units should be used
                    value = `${value}px`;
                }
                
                cssVariables.push(`  ${propVarName}: ${value};`);
            }
        }
    }
}

// Assemble final CSS
const cssContent = `/* Auto-generated Design Tokens */

:root {
${cssVariables.join('\n')}
}

[data-theme="dark"] {
${darkCssVariables.join('\n')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkCssVariables.join('\n')}
  }
}
`;

fs.writeFileSync(outputFile, cssContent, 'utf8');
console.log(`Successfully generated CSS variables to ${outputFile}`);
