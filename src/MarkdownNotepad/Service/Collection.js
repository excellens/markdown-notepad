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

import * as Elementary from '@excellens/elementary'

export function History() {
    const self = new Elementary.Collection.Collection();
    const parent = {
        add: self.add,
    };

    this.index = 0;

    this.getIndex = function () {
        return this.index;
    };
    this.setIndex = function (index) {
        if (0 > index) {
            index = 0;
        }

        const size = self.size();
        if (index >= size) {
            index = size - 1;
        }

        this.index = index;

        return this;
    };

    this.modifyIndex = function (by) {
        this.setIndex(
            this.getIndex() + by
        );

        return this;
    };

    this.moveForward = function () {
        return this.modifyIndex(+1);
    };
    this.moveBackward = function () {
        return this.modifyIndex(-1);
    };

    this.getCurrent = function () {
        return self.get(
            this.getIndex()
        );
    };
    this.hasCurrent = function () {
        return self.has(
            this.getIndex()
        );
    };

    this.add = function (index, value) {
        // Remove the loose end of the list if we are behind.
        while (this.getIndex() < self.size() - 1) {
            self.pop();
        }

        return parent.add(index, value);
    };

    return Elementary.Base.Merge(this, self);
}
