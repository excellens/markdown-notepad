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

export function Transaction() {
    const self = {};

    this.commit = function (snapshot, state) {
        throw 'ERR_TRANSACTION_COMMIT';
    };

    this.rollback = function (snapshot, state) {
        throw 'ERR_TRANSACTION_ROLLBACK';
    };

    return Elementary.Base.Merge(this, self);
}

export function TextareaTransaction() {
    const self = new Transaction();

    this.commit = function (snapshot, state) {
        state.setValue(snapshot.getValue());

        if (state.hasSelection()) {
            this.commitSelection(snapshot, state.getSelection());
        }

        state.notify();

        return this;
    };

    this.commitSelection = function (snapshot, state) {
        state.setStart(
            snapshot.start
        );
        state.setEnd(
            snapshot.end
        );

        state.notify();

        return this;
    };

    this.rollback = function (snapshot, state) {
        const value = state.getValue();

        if (state.hasSelection()) {
            this.rollbackSelection(snapshot, state.getSelection());
        } else {
            snapshot.start /**/ = value.length;
            snapshot.end /****/ = value.length;
        }

        snapshot.before /*****/ = value.substring(
            undefined,
            snapshot.start
        );
        snapshot.inside /*****/ = value.substring(
            snapshot.start,
            snapshot.end
        );
        snapshot.after /******/ = value.substring(
            snapshot.end,
            undefined
        );

        return this;
    };

    this.rollbackSelection = function (snapshot, state) {
        snapshot.start /**/ = state.getStart();
        snapshot.end /****/ = state.getEnd();

        return this;
    };

    return Elementary.Base.Merge(this, self);
}
