/*
 * MIT License
 * Copyright (c) 2020 Excellens
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// DEPRECATED: DO NOT USE THIS.
//
// export function TextareaSnapshot() {
//     const self = new Snapshot();
//
//     this.value = '';
//
//     this.selectionStart = 0;
//     this.selectionEnd = 0;
//
//     this.getValue = function () {
//         return this.value;
//     };
//     this.setValue = function (value) {
//         this.value = value;
//
//         return this;
//     };
//
//     this.find = function (pattern) {
//         const value = this.getValue();
//
//         return value.search(pattern);
//     };
//
//     this.getSelectionStart = function () {
//         return this.selectionStart;
//     };
//     this.setSelectionStart = function (selectionStart) {
//         this.selectionStart = selectionStart;
//         return this;
//     };
//
//     this.getSelectionEnd = function () {
//         return this.selectionEnd;
//     };
//     this.setSelectionEnd = function (selectionEnd) {
//         this.selectionEnd = selectionEnd;
//         return this;
//     };
//
//     this.isSelectionStart = function () {
//         return 0 === this.getSelectionStart();
//     };
//     this.isSelectionEnd = function () {
//         return 0 === this.getSelectionEnd();
//     };
//
//     this.isSelectionEqual = function () {
//         return this.getSelectionStart()
//             === this.getSelectionEnd();
//     };
//
//     this.getContent = function () {
//         const value = this.getValue();
//
//         return value.split('\n');
//     };
//     this.setContent = function (content) {
//         const value = content.join('\n');
//
//         return this.setValue(value);
//     };
//
//     this.getContentLine = function (index) {
//         const content = this.getContent();
//
//         if (content.length > index) {
//             return content[index];
//         }
//
//         return null;
//     };
//     this.setContentLine = function (index, contentLine) {
//         const content = this.getContent();
//
//         if (content.length > index) {
//             content[index] = contentLine;
//
//             return this.setContent(content);
//         }
//
//         return this;
//     };
//
//     this.addContentLine = function (contentLine) {
//         const content = this.getContent();
//         content[content.length] = contentLine;
//
//         return this.setContent(content, contentLine);
//     };
//
//     this.getContentLineNumberSelectionStart = function () {
//         const index = this.getSelectionStart();
//         const value = this.getValue();
//
//         const content = value.substring(0, index)
//             .split('\n');
//
//         return content.length - 1;
//     };
//     this.getContentLineNumberSelectionEnd = function () {
//         const index = this.getSelectionEnd();
//         const value = this.getValue();
//
//         const content = value.substring(0, index)
//             .split('\n');
//
//         return content.length - 1;
//     };
//     this.isContentLineSelectionEqual = function () {
//         return this.getContentLineNumberSelectionStart()
//             === this.getContentLineNumberSelectionEnd();
//     };
//
//     this.getContentLineSelectionStart = function () {
//         const index = this.getContentLineNumberSelectionStart();
//
//         return this.getContentLine(index);
//     };
//     this.getContentLineSelectionEnd = function () {
//         const index = this.getContentLineNumberSelectionEnd();
//
//         return this.getContentLine(index);
//     };
//
//     this.getValueInline = function () {
//         const index = this.getContentLineNumberSelectionStart();
//
//         return this.getContentLine(index);
//     };
//     this.setValueInline = function (value) {
//         const index = this.getContentLineNumberSelectionStart();
//
//         return this.setContentLine(index, value);
//     };
//
//     this.findInline = function (pattern) {
//         const value = this.getValueInline();
//
//         return value.search(pattern);
//     };
//
//     this.getSelectionStartInline = function () {
//         const content = this.getContent();
//         const numberLimit = this.getContentLineNumberSelectionStart();
//
//         return this.getSelectionStart() - content.reduce(function (count, contentLine, number) {
//             if (number < numberLimit) {
//                 count += contentLine.length;
//             }
//
//             return count;
//         }, 0);
//     };
//     this.setSelectionStartInline = function (selectionStart) {
//         const content = this.getContent();
//         const numberLimit = this.getContentLineNumberSelectionStart();
//
//         return this.setSelectionStart(selectionStart + content.reduce(function (count, contentLine, number) {
//             if (number < numberLimit) {
//                 count += contentLine.length;
//             }
//
//             return count;
//         }, 0));
//     };
//
//     this.getSelectionEndInline = function () {
//         const content = this.getContent();
//         const numberLimit = this.getContentLineNumberSelectionEnd();
//
//         return this.getSelectionEnd() - content.reduce(function (count, contentLine, number) {
//             if (number < numberLimit) {
//                 count += contentLine.length;
//             }
//
//             return count;
//         }, 0);
//     };
//     this.setSelectionEndInline = function (selectionEnd) {
//         const content = this.getContent();
//         const numberLimit = this.getContentLineNumberSelectionEnd();
//
//         return this.setSelectionEnd(selectionEnd + content.reduce(function (count, contentLine, number) {
//             if (number < numberLimit) {
//                 count += contentLine.length;
//             }
//
//             return count;
//         }, 0));
//     };
//
//     this.isSelectionStartInline = function () {
//         return 0 === this.getSelectionStartInline();
//     };
//     this.isSelectionEndInline = function () {
//         return 0 === this.getSelectionEndInline();
//     };
//
//     this.isSelectionEqualInline = function () {
//         return this.getSelectionStartInline()
//             === this.getSelectionEndInline();
//     };
//
//     this.commit = function () {
//         self.state.setValue(this.value);
//
//         if (self.state.hasSelection()) {
//             const selection = self.state.getSelection();
//
//             selection.setStart(this.selectionStart);
//             selection.setEnd(this.selectionEnd);
//
//             // Only notify the selection.
//             selection.notify();
//         }
//
//         self.state.notify();
//
//         return this;
//     };
//
//     this.rollback = function () {
//         this.value = self.state.getValue();
//
//         if (self.state.hasSelection()) {
//             const selection = self.state.getSelection();
//
//             this.selectionStart = selection.getStart();
//             this.selectionEnd = selection.getEnd();
//         }
//
//         return this;
//     };
//
//     return Elementary.Base.Merge(this, self);
// }
