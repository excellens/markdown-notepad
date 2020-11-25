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
import {TextSnapshot} from "./Action/Snapshot";
import {TextareaTransaction} from "./Action/Snapshot/Transaction";

export function Action(handle) {
    const self = {};

    if (true === !!handle) {
        this.handle = handle;
    } else {
        this.handle = function (state) {
            throw 'ERR_ACTION_HANDLE';
        };
    }

    return Elementary.Base.Merge(this, self);
}

Action.registry = new Elementary.Collection.CollectionMap();

export function ActionTab(name) {
    const self = new Action(null);

    this.name = name;

    this.handle = function (state) {
        if (state.tab.has(this.name)) {
            const tab = state.tab.get(this.name);
            tab.setActive(true);
            tab.notify();
        }

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function ActionTabWrite() {
    const self = new ActionTab('write');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('tab-write', new ActionTabWrite());

export function ActionTabPreview() {
    const self = new ActionTab('preview');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('tab-preview', new ActionTabPreview());

export function ActionHistory() {
    const self = new Action(null);

    this.handle = function (state) {
        this.change(state.history);
        return this.update(state.history, state);
    };

    this.change = function (history) {
        throw 'ERR_ACTION_HISTORY_CHANGE';
    };

    this.update = function (history, state) {
        if (history.hasCurrent() && state.hasTextarea()) {
            const current = history.getCurrent();

            // The transaction has to support the textarea state.
            current.attach(state.getTextarea());
            current.commit();
            current.detach();
        }

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function ActionHistoryForward() {
    const self = new ActionHistory();

    this.change = function (history) {
        history.moveForward();

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('history-forward', new ActionHistoryForward());

export function ActionHistoryBackward() {
    const self = new ActionHistory();

    this.change = function (history) {
        history.moveBackward();

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('history-backward', new ActionHistoryBackward());

export function ActionText() {
    const self = new Action(null);

    const text = new TextSnapshot(
        new TextareaTransaction()
    );

    this.handle = function (state) {
        if (state.hasTextarea()) {
            text.initialize(state.getTextarea());

            if (!this.check(state, text)) {
                this.insert(state, text);
            } else {
                this.delete(state, text);
            }
            text.commit();

            text.destroy();
        }

        return this;
    };

    this.check = function (state, text) {
        throw 'ERR_ACTION_TEXT_CHECK';
    };

    this.insert = function (state, text) {
        throw 'ERR_ACTION_TEXT_INSERT';
    };
    this.delete = function (state, text) {
        throw 'ERR_ACTION_TEXT_DELETE';
    };

    return Elementary.Base.Merge(this, self);
}

export function ActionTextWrap(prefix, suffix) {
    const self = new ActionText();
    const parent = {
        insert: self.insert,
        delete: self.delete,
    };

    this.prefix = prefix;
    this.suffix = suffix;

    this.check = function (state, text) {
        return text.before.endsWith(self.prefix)
            && text.after.startsWith(self.suffix);
    };

    this.insert = function (state, text) {
        text.before = text.before + this.prefix;
        text.after = this.suffix + text.after;

        text.start = text.start + this.prefix.length;
        text.end = text.end + this.prefix.length;

        return this;
    };

    this.delete = function (state, text) {
        text.before = text.before.substring(undefined, text.before.length - this.prefix.length);
        text.after = text.after.substring(undefined, text.after.length - this.suffix.length);

        text.start = text.start - this.prefix.length;
        text.end = text.end - this.prefix.length;

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function ActionTextPrefix(prefix) {
    const self = new ActionTextWrap(prefix, '');

    return Elementary.Base.Merge(this, self);
}

export function ActionTextPrefixLine(prefix) {
    const self = new ActionTextPrefix(prefix);
    const parent = {
        insert: self.insert,
        delete: self.delete,
    };

    this.insert = function (state, text) {
        const line = '\n';

        if (0 < text.before.length && !text.before.endsWith(line)) {
            text.before = text.before + line;

            text.start = text.start + line.length;
            text.end = text.end + line.length;
        }

        return parent.insert(state, text);
    };

    return Elementary.Base.Merge(this, self);
}

export function ActionTextHeadline() {
    const self = new ActionTextPrefix('### ');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('text-headline', new ActionTextHeadline());

export function ActionTextBold() {
    const self = new ActionTextWrap('**', '**');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('text-bold', new ActionTextBold());

export function ActionTextItalic() {
    const self = new ActionTextWrap('_', '_');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('text-italic', new ActionTextItalic());

export function ActionTextQuote() {
    const self = new ActionTextPrefixLine('> ');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('text-quote', new ActionTextQuote());

export function ActionTextCode() {
    const self = new ActionTextWrap('`', '`');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('text-code', new ActionTextCode());

export function ActionTextLink() {
    const self = new ActionTextWrap('[', ']');
    const parent = {
        insert: self.insert,
        delete: self.delete,
    };

    this.check = function (state, text) {
        return false;
    };

    this.insert = function (state, text) {
        const line = '(url)';

        text.after = line + text.after;

        if (0 < text.inside.length) {
            text.start = text.end + self.suffix.length + '('.length;
            text.end = text.end + self.suffix.length + '('.length + 'url'.length;
        }

        return parent.insert(state, text);
    };

    this.delete = function (state, text) {
        return parent.delete(state, text);
    };

    return Elementary.Base.Merge(this, self);
}
Action.registry.add('text-link', new ActionTextLink());

export function ActionTextUl() {
    const self = new ActionTextPrefixLine('- ');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('text-ul', new ActionTextUl());

export function ActionTextOl() {
    const self = new ActionTextPrefixLine('1. ');

    return Elementary.Base.Merge(this, self);
}

Action.registry.add('text-ol', new ActionTextOl());

export * as Snapshot from './Action/Snapshot'
