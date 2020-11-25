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
import {SelectionState} from "../State";

export function Textarea(document, element, state) {
    const self = (function (document, element, state) {
        const presenter = new TextareaPresenter(state);
        return new Elementary.Component.Component(presenter, document, 'textarea', element);
    }(document, element, state || new TextareaState()));
    const parent = {
        initialize: self.initialize,
        destroy: self.destroy,
    };

    let eventChange = null;
    let eventKeyUp = null;

    let eventSelectionChange = null;

    const changeSelection = function () {
        const start = self.selectionStart;
        const end = self.selectionEnd;

        const direction = self.selectionDirection;

        self.presenter.changeSelection(start, end, direction);
    };

    this.initialize = function () {
        parent.initialize();

        self.addEventListener('change', eventChange = function (event) {
            changeSelection();

            self.presenter.changeValue(self.value);
        });
        self.addEventListener('keyup', eventKeyUp = function (event) {
            changeSelection();

            self.presenter.changeValue(self.value);
        });

        document.addEventListener('selectionchange', eventSelectionChange = function (event) {
            if (document.activeElement === self) {
                changeSelection();
            }
        });

        return this;
    };

    this.setValue = function (value) {
        self.value = value;

        return this;
    };

    this.setSelection = function (start, end, direction) {
        self.selectionStart = start;
        self.selectionEnd = end;

        self.selectionDirection = direction;

        return this;
    };

    this.destroy = function () {
        parent.destroy();

        self.removeEventListener('change', eventChange);
        eventChange = null;
        self.removeEventListener('keyup', eventKeyUp);
        eventKeyUp = null;

        document.removeEventListener('selectionchange', eventSelectionChange);
        eventSelectionChange = null;

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function TextareaPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    const parent = {
        initialize: self.initialize,
        destroy: self.destroy,
    };

    this.update = function (state, id) {
        self.component.setValue(state.getValue());

        if (state.hasSelection()) {
            const selection = state.getSelection();

            const start = selection.getStart();
            const end = selection.getEnd();

            const direction = selection.getDirection();

            self.component.setSelection(start, end, direction);
        }
    };

    this.initialize = function (component) {
        this.initializeState();

        parent.initialize(component);

        return this;
    };

    this.initializeState = function () {
        if (!self.state.hasSelection()) {
            const selection = new SelectionState();

            self.state.setSelection(selection);
        }

        return this;
    };

    this.changeValue = function (value) {
        if (self.state.getValue() !== value) {
            self.state.setValue(value);
            self.state.notify();
        }

        return this;
    };

    this.changeSelection = function (start, end, direction) {
        if (self.state.hasSelection()) {
            const selection = self.state.getSelection();

            selection.setStart(start);
            selection.setEnd(end);

            selection.setDirection(direction);
            selection.notify();
        }

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function TextareaState() {
    const self = new Elementary.Component.ComponentState();

    this.value = '';

    this.getValue = function () {
        return this.value;
    };
    this.setValue = function (value) {
        this.value = value;

        return this;
    };

    this.selection = null;

    this.getSelection = function () {
        return this.selection;
    };
    this.setSelection = function (selection) {
        this.selection = selection;

        return this;
    };
    this.hasSelection = function () {
        return !!this.selection;
    };

    return Elementary.Base.Merge(this, self);
}
