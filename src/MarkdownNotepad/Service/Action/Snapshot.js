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

export function Snapshot() {
    const self = {};

    this.state = null;

    this.initialize = function () {
        if (false === !!this.state) {
            throw 'ERR_SNAPSHOT_INITIALIZE';
        }

        this.rollback();

        return this;
    };

    this.attach = function (state) {
        this.state = state;

        return this;
    };
    this.detach = function () {
        this.state = null;

        return this;
    };

    this.rollback = function () {
        throw 'ERR_SNAPSHOT_ROLLBACK';
    };

    this.commit = function () {
        throw 'ERR_SNAPSHOT_COMMIT';
    };

    this.destroy = function () {
        if (true === !!this.state) {
            throw 'ERR_SNAPSHOT_DESTROY';
        }

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function TextSnapshot(transaction) {
    const self = new Snapshot();
    const parent = {
        initialize: self.initialize,
        destroy: self.destroy,
    };

    // Handle state only in transaction.
    this.transaction = transaction;

    this.start /******/ = 0;
    this.end /********/ = 0;

    this.before /*****/ = null;
    this.inside /*****/ = null;
    this.after /******/ = null;

    this.getValue = function () {
        return this.before + this.inside + this.after;
    };

    this.initialize = function (state) {
        self.attach(state);

        return parent.initialize();
    };

    this.commit = function () {
        this.transaction.commit(this, self.state);

        return this;
    };

    this.rollback = function () {
        this.transaction.rollback(this, self.state);

        return this;
    };

    this.destroy = function () {
        self.detach();

        this.start /******/ = 0;
        this.end /********/ = 0;

        this.before /*****/ = null;
        this.inside /*****/ = null;
        this.after /******/ = null;

        return parent.destroy();
    };

    return Elementary.Base.Merge(this, self);
}

export * as Transaction from './Snapshot/Transaction'
