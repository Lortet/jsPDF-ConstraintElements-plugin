# jsPDF-ConstraintElements-plugin (WIP)
Plugin to display elements with dimensions constraints.
	
## Usage
You need to include jsPDF before context.
```html
<script src="./script/jspdf.min.js"></script>
<script src="./script/jspdf.plugin.contraintElements.min.js"></script>
```

## Optionaly work with

[jsPDF-Context-plugin](https://github.com/Lortet/jsPDF-Context-plugin) : Methods are automatically added to contexts if they are present.

	
## Methods

* [contraintText](#contrainttext-text-string-x-number-y-number-options-object--object)
* [constraintTable](#constrainttable-rows-array--x-number-y-number-options-object--object)
---

### contraintText (text: string, x: number, y: number, options: object) → object
Draw a text with options.
| Name | Type | Description |
| --------------- | --------------- | --------------- |
| text | string | Text to draw |
| x | number | The left offset from page (or context if used) |
| y | number | The top offset from page (or context if used) |
| options | object | { align, indent, maxWidth, maxHeight, lineHeightFactor, lineBreakFactor, lineBreakCharacter, noDisplay } |
| *→result* | object | { height, bottom, remainingText, lines, width, right, maxWordWidth } |

---

### constraintTable (rows: array, , x: number, y: number, options: object) → object
Draw a text with options.
| Name | Type | Description |
| --------------- | --------------- | --------------- |
| rows | array | Table array |
| x | number | The left offset from page (or context if used) |
| y | number | The top offset from page (or context if used) |
| options | object | { padding, color, tintColor, noDisplay } |
| *→result* | object | { height, bottom, tooBig } |
