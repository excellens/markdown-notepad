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

export function Preview(document, element, state) {
    const self = (function (document, element, state) {
        const presenter = new PreviewPresenter(state);
        return new Elementary.Component.Component(presenter, document, 'div', element);
    }(document, element, state || new PreviewState()));
    const parent = {
        initialize: self.initialize,
        destroy: self.destroy,
    };

    this.setValue = function (value) {
        self.innerHTML = value;

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function PreviewPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    const parent = {
        initialize: self.initialize,
        destroy: self.destroy,
    };

    this.update = function (state, id) {
        self.component.setValue(state.getValue());
    };

    return Elementary.Base.Merge(this, self);
}

export function PreviewState() {
    const self = new Elementary.Component.ComponentState();

    this.value = '';

    this.getValue = function () {
        return this.value;
    };
    this.setValue = function (value) {
        this.value = value;
        return this;
    };

    return Elementary.Base.Merge(this, self);
}
