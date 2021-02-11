;(function(API) {
    'use strict';

    API.constraintText = function(text, x, y, options) {
        options = options || {};
        options.align = options.align || 'left';
        options.indent = options.indent || 0;
        options.maxWidth = options.maxWidth || 0;
        options.maxHeight = options.maxHeight || 0;
        options.lineBreakFactor = options.lineBreakFactor || 0;
        if(typeof options.lineBreakCharacte === 'undefined') options.lineBreakCharacter = '-';
        if(typeof options.lineHeightFactor === 'undefined') options.lineHeightFactor = 1.15;

        let saveColor;
        if(options.color) {
            saveColor = this.getTextColor();
            this.setTextColor(options.color);
        }

        if(options.maxWidth > 0 && options.indent >= options.maxWidth) {
            console.error('Option indent (' + options.indent + ') is greather or equals to maxWidth (' + options.maxWidth + ') for text "' + text + '".');
            options.indent = 0;
        }

        if(options.maxWidth < 0 || options.maxHeight < 0) {
            console.error('MaxWidth or MaxHeight is lower than 0 for text "' + text + '".');
        }

        const letterHeight = this.getTextDimensions('A').h;
        const lineHeight = letterHeight*options.lineHeightFactor;
        const maxLines = (options.maxHeight > 0? Math.floor(options.maxHeight/lineHeight) : -1);

        const words = text.split(' ');
        const spaceWidth = this.getTextWidth(' ');

        let lineNumber = 0;
        let constraintWidth = 0;
        let maxWordWidth = 0;
        while(words.length && (maxLines <= -1 || lineNumber < maxLines)) {
            let indent = (lineNumber? 0 : options.indent);
            let lineWidth = options.maxWidth - indent;

            let lineWordsWidth = 0;
            let lineWords = [];
            let breakLine = false;
            while(words.length && !breakLine) {
                let word = words[0];
                const wordWidth = this.getTextWidth(word);
                const spacesWidth = (lineWords.length >= 1? lineWords.length*spaceWidth : 0);

                if((lineWordsWidth + spacesWidth + wordWidth) <= lineWidth) {
                    lineWords.push(word);
                    words.shift();
                    lineWordsWidth += wordWidth;
                }
                else if(lineWordsWidth <= lineWidth*.7 && (lineWords.length === 0 || words.length > 1)) {
                    let breakedWord = '';
                    let breakedWordWidth = 0;
                    while((lineWordsWidth + spacesWidth + breakedWordWidth) <= lineWidth || (!lineWords.length && breakedWord === '')) {
                        breakedWord += word.charAt(0);
                        breakedWordWidth = this.getTextWidth(breakedWord + options.lineBreakCharacter);
                        words[0] = word = word.substring(1);
                    }

                    if(word.length > 1) {
                        lineWords.push(breakedWord + options.lineBreakCharacter);
                        lineWordsWidth += breakedWordWidth;
                        breakLine = true;
                    }
                    else { 
                        lineWords.push(breakedWord + word);
                        lineWordsWidth += this.getTextWidth(breakedWord + word);
                        words.shift();
                    }
                }
                else {
                    breakLine = true;
                }
            }

            if(constraintWidth < lineWordsWidth) {
                constraintWidth = lineWordsWidth;
            }
            
            if(!options.noDisplay) {

                const spacesWidth = (lineWords.length > 1? (lineWords.length-1)*spaceWidth : 0);

                let lineX = x + indent;
                let lineY = y + lineNumber*lineHeight;
                if(options.align === 'center') {
                    lineX += (lineWidth-lineWordsWidth-spacesWidth)/2;
                }
                else if(options.align === 'right') {
                    lineX += lineWidth-lineWordsWidth-spacesWidth;
                }

                const spaceBetween = (options.align === 'justify' && breakLine? (lineWidth-lineWordsWidth)/(lineWords.length - 1) : spaceWidth);
                lineWords.every((word) => {
                    this.text(word, lineX, lineY, {lineHeightFactor: options.lineHeightFactor, baseline: 'top'});
                    lineX += this.getTextWidth(word) + spaceBetween;

                    return true;
                });
                
            }
            
            lineNumber++;
        }

        if(saveColor) this.setTextColor(saveColor);

        return {
            height: lineNumber*lineHeight,
            bottom: y + lineNumber*lineHeight,
            remainingText: words.length? words.join(' ') : null,
            lines: lineNumber,
            width: constraintWidth,
            right: y + constraintWidth,
            maxWordWidth
        }
    };
    if(API.registerContextableFunction) API.registerContextableFunction('constraintText', [, 1]);

    API.constraintTable = function(rows, x, y, options) {
        options = options || {};
        if(!options.padding) options.padding = 0.5;
        if(!options.color) options.color = NORMAL_COLOR;
        if(!options.tintColor) options.tintColor = TINT_COLOR;

        this.setDrawColor(options.color);
        if(!options.noDisplay) this.line(x, y, x+options.maxWidth, y);

        const numberOfColumns = Math.max.apply(null, rows.map(val => val.length));
        
        const contentWidth = [];
        const maxWordWidth = [];
        for(let rowId = 0; rowId < rows.length; rowId++) {
            const row = rows[rowId];
            for(let columnId = 0; columnId < row.length; columnId++) {
                const columnData = row[columnId];
                const text = typeof columnData === 'string'? columnData : columnData.text;

                const textReturn = this.constraintText(text, 0, 0, { noDisplay: true });
                if(!contentWidth[columnId]) {
                    contentWidth[columnId] = 0;
                    maxWordWidth[columnId] = 0;
                }

                if(contentWidth[columnId] < textReturn.width) {
                    contentWidth[columnId] = textReturn.width;
                }

                if(maxWordWidth[columnId] < textReturn.maxWordWidth) {
                    maxWordWidth[columnId] = textReturn.maxWordWidth;
                }
            }
        }

        let widthObj = contentWidth;
        let widthSum = widthObj.reduce((a, b) => a + b, 0);
        if(widthSum > options.maxWidth) {
            widthObj = maxWordWidth;
            widthSum = widthObj.reduce((a, b) => a + b, 0);
        }
        const margin = (options.maxWidth-widthSum)/numberOfColumns;
        let columnsWidth = widthObj.map((a, b) => {
            return a + margin;
        });

        let currentY = y;
        for(let rowId = 0; rowId < rows.length; rowId++) {
            const row = rows[rowId];
            currentY += options.padding;

            let returnMaxHeight = 0;
            for(let columnId = 0, textLeft = x + options.padding; columnId < row.length; textLeft += columnsWidth[columnId], columnId++) {
                const columnData = row[columnId];
                const text = typeof columnData === 'string'? columnData : columnData.text;
                const color = typeof columnData === 'string' || columnData.type !== 'title'? options.color : options.tintColor;

                const textWidth = columnsWidth[columnId] - 2*options.padding;

                const textReturn = this.constraintText(text, textLeft, currentY, {
                    maxWidth: textWidth,
                    align: options.align,
                    color,
                    noDisplay: options.noDisplay
                });

                if(textReturn.height > returnMaxHeight) {
                    returnMaxHeight = textReturn.height;
                }
            }
            currentY += returnMaxHeight;

            currentY += options.padding;
            if(!options.noDisplay) this.line(x, currentY, x+options.maxWidth, currentY);
        }

        const height = currentY-y;

        if(!options.noDisplay) {
            for(let i = 0, left = x; i <= numberOfColumns; left += columnsWidth[i], i++) {
                this.line(left, y, left, y+height);
            }
        }

        return {
            height: height,
            bottom: y+height,
            tooBig: options.maxHeight && height > options.maxHeight
        };
    }
    if(API.registerContextableFunction) API.registerContextableFunction('constraintTable', [, 1]);

})(jspdf.jsPDF.API);
