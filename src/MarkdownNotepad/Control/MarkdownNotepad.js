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
import {Theme} from "../Theme";
import {FindOne} from "../Base";
import {Tab, TabState} from "../Component/Tab";
import {TabPane, TabPaneState} from "../Component/TabPane";
import {Button, ButtonState} from "../Component/Button";
import {Textarea, TextareaState} from "../Component/Textarea";
import {Preview, PreviewState} from "../Component/Preview";
import {EngineMd} from "../Service/Engine";
import {TextSnapshot} from "../Service/Action/Snapshot";
import {Action} from "../Service/Action";
import {History} from "../Service/Collection";
import {TextareaTransaction} from "../Service/Action/Snapshot/Transaction";
import {Configuration} from "../Configuration";

export function MarkdownNotepad(document, element, state) {
    const self = (function (document, element, state) {
        const presenter = new MarkdownNotepadPresenter(state);
        return new Elementary.Component.Component(presenter, document, 'div', element);
    }(document, element, state || new MarkdownNotepadState()));
    const parent = {
        initialize: self.initialize,
        destroy: self.destroy,
    };

    this.theme = null;

    this.tab = new Elementary.Collection.CollectionMap();
    this.tabPane = new Elementary.Collection.CollectionMap();

    let eventKeyDown = null;
    let eventKeyUp = null;
    let eventContextMenu = null;

    this.textarea = null;
    this.preview = null;

    let eventMouseDown = new Elementary.Collection.CollectionMap();
    let eventMouseUp = new Elementary.Collection.CollectionMap();

    this.button = new Elementary.Collection.CollectionMap();

    this.getConfigurationDefault = function () {
        const configuration = new Configuration();

        // Tab configuration.
        configuration.tab.add('write');
        configuration.tab.add('preview');

        // Button configuration.
        configuration.button.add('text-headline', 'text-headline');
        configuration.button.add('text-bold', 'text-bold');
        configuration.button.add('text-italic', 'text-italic');
        configuration.button.add('text-quote', 'text-quote');
        configuration.button.add('text-code', 'text-code');
        configuration.button.add('text-link', 'text-link');
        configuration.button.add('text-ul', 'text-ul');
        configuration.button.add('text-ol', 'text-ol');
        configuration.button.add('history-forward', 'history-forward');
        configuration.button.add('history-backward', 'history-backward');

        // Key configuration.
        configuration.key.add('ctrl+shift+z', 'history-forward');
        configuration.key.add('ctrl+z', 'history-backward');

        return configuration;
    };

    this.initialize = function (configuration) {
        if (false === !!configuration) {
            configuration = this.getConfigurationDefault();
        }

        // Set the component information.
        self.setAttribute('data-component', 'markdown-notepad');
        // Set the style.
        self.classList.add('markdown-notepad');

        this.theme = new Theme(document, configuration.getTheme());
        // Only use the theme if no element is given.
        if (false === !!element) {
            this.theme.initialize(this);
        }

        self.presenter.setConfiguration(configuration);

        parent.initialize();

        return this;
    };

    this.initializeTab = function (state) {
        let name = state.getName();

        let tab = new Tab(document, FindOne(self, `div[data-component="markdown-notepad.tab.${name}"]`), state);
        tab.initialize();
        // Set the style.
        tab.classList.add('tab', name);

        self.tab.add(name, tab);

        this.initializeTabPane(state.getPane());

        return this;
    };

    this.initializeTabPane = function (state) {
        let name = state.getName();

        let tabPane = new TabPane(document, FindOne(self, `div[data-component="markdown-notepad.tab-pane.${name}"]`), state);
        tabPane.initialize();
        // Set the style.
        tabPane.classList.add('tab-pane', name);

        self.tabPane.add(name, tabPane);

        return this;
    };

    this.initializeTextarea = function (state) {
        let textarea = new Textarea(document, FindOne(self, 'textarea[data-component="markdown-notepad.textarea"]'), state);
        textarea.initialize();
        // Set the style.
        textarea.classList.add('markdown-textarea');

        textarea.addEventListener('keydown', eventKeyDown = function (event) {
            // Only continue, when ctrl or alt are down.
            if (event.ctrlKey || event.altKey) {
                // Create an action identifier in the format 'ctrl+alt+shift+key'.
                const action = [
                    event.ctrlKey
                        ? 'ctrl'
                        : '',
                    event.altKey
                        ? 'alt'
                        : '',
                    event.shiftKey
                        ? 'shift'
                        : '',
                    // Grab the current key in lower case.
                    (event.key).toLowerCase(),
                ].filter(function (value, index, array) {
                    // Filter any empty value and join them with a '+' sign.
                    return 0 !== value.length;
                }).join('+');

                try {
                    // Try to trigger the action, if it exists.
                    self.presenter.triggerAction(action, true);

                    event.preventDefault();
                } catch (error) {
                    if ('ERR_ACTION' === error) {
                        // No-op, since no action was found.
                    } else {
                        throw error;
                    }
                }
            }
        });
        // textarea.addEventListener('keyup', eventKeyUp = function (event) {
        //     self.focusTextarea();
        // });
        textarea.addEventListener('contextmenu', eventContextMenu = function (event) {
            event.preventDefault();
        });

        this.textarea = textarea;

        return this;
    };

    this.initializePreview = function (state) {
        const preview = new Preview(document, FindOne(self, 'div[data-component="markdown-notepad.preview"]'), state);
        preview.initialize();
        // Set the style.
        preview.classList.add('markdown-preview');

        this.preview = preview;

        return this;
    };

    this.initializeButton = function (state) {
        let name = state.getName();

        const button = new Button(document, FindOne(self, `button[data-component="markdown-notepad.button.${name}"]`), state);
        button.initialize();
        // Set the style.
        button.classList.add('button', name);

        // Set click callback.
        const onMouseDown = function (event) {
            self.presenter.triggerAction(name, true);
        };
        eventMouseDown.add(name, onMouseDown);
        button.addEventListener('mousedown', onMouseDown);

        const onMouseUp = function (event) {
            self.focusTextarea();
        };
        eventMouseUp.add(name, onMouseUp);
        button.addEventListener('mouseup', onMouseUp);

        self.button.add(name, button);

        return this;
    };

    this.focusTextarea = function () {
        if (null !== this.textarea) {
            this.textarea.focus();
        }

        return this;
    };

    this.destroy = function () {
        parent.destroy();

        this.theme.destroy();
        this.theme = null;

        this.tab.each(function (value, key) {
            value.destroy();
        });
        this.tab.clear();

        this.tabPane.each(function (value, key) {
            value.destroy();
        });
        this.tabPane.clear();

        this.textarea.removeEventListener('keydown', eventKeyDown);
        eventKeyDown = null;
        this.textarea.removeEventListener('keyup', eventKeyUp);
        eventKeyUp = null;
        this.textarea.removeEventListener('contextmenu', eventContextMenu);
        eventContextMenu = null;

        this.textarea.destroy();
        this.textarea = null;
        this.preview.destroy();
        this.preview = null;

        this.button.each(function (value, key) {
            value.destroy();

            const onMouseDown = eventMouseDown.get(key);
            value.removeEventListener('mousedown', onMouseDown);

            const onMouseUp = eventMouseUp.get(key);
            value.removeEventListener('mouseup', onMouseUp);
        });
        this.button.clear();

        eventMouseDown.clear();
        eventMouseUp.clear();

        return this;
    };

    return Elementary.Base.Merge(this, self);
}

export function MarkdownNotepadPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    const parent = {
        initialize: self.initialize,
        destroy: self.destroy,
    };

    this.update = function (state, id) {
    };

    this.engine = null;

    let timeoutReference = null;

    let callback = null;
    let callbackMirror = null;
    let callbackHistory = null;

    this.action = new Elementary.Collection.CollectionMap();

    this.configuration = null;

    this.getConfiguration = function () {
        return this.configuration;
    };
    this.setConfiguration = function (configuration) {
        this.configuration = configuration;
        return this;
    };
    this.hasConfiguration = function () {
        return !!this.configuration;
    };

    this.fresh = false;

    this.initialize = function (component) {
        this.engine = new EngineMd();

        callback = new Elementary.Observe.Callback('TabChange', function (state, id) {
            if (state.isActive()) {
                self.state.tab.each(function (value, index) {
                    if (state.getName() === value.getName()) {
                        return;
                    }

                    value.setActive(false);
                    value.notify();
                });
            }
        });

        callbackMirror = new Elementary.Observe.Callback('Mirror', function (state, id) {
            if (self.state.hasPreview()) {
                let previewValue = state.getValue();
                previewValue = self.engine.process(previewValue);

                let preview = self.state.getPreview();

                preview.setValue(previewValue);
                preview.notify();
            }
        });

        callbackHistory = new Elementary.Observe.Callback('History', function (state, id) {
            const makeHistory = function (state) {
                // TODO: Timeout offset.
                if (true === !!timeoutReference) {
                    clearTimeout(timeoutReference);
                }

                timeoutReference = setTimeout(function () {
                    const snapshot = new TextSnapshot(
                        new TextareaTransaction()
                    );
                    snapshot.attach(state.getTextarea());
                    snapshot.rollback();

                    state.history.add(snapshot);
                    state.history.moveForward();

                    snapshot.detach();
                }, 1000);
            };

            if (self.state.history.hasCurrent()) {
                const current = self.state.history.getCurrent();

                if (state.getValue() !== current.getValue()) {
                    makeHistory(self.state);
                }
            } else {
                makeHistory(self.state);
            }
        });

        parent.initialize(component);

        this.initializeState();

        return this;
    };

    this.initializeState = function () {
        this.fresh = self.state.isFresh();
        self.state.setFresh(false);

        const configuration = this.getConfiguration();
        configuration.tab.each(function (value, index) {
            // Convert index 0 to false to true.
            const active = false === !!index;

            self.initializeTab(value, active);
        });
        configuration.button.each(function (value, key) {
            self.initializeButton(key, value);
        });
        configuration.key.each(function (value, key) {
            self.initializeAction(key, value, true);
        });

        this.initializeTextarea();
        this.initializePreview();
    };

    this.initializeTab = function (name, active) {
        const tabName = `tab-${name}`;
        let tab;

        if (self.state.tab.has(tabName)) {
            tab = self.state.tab.get(tabName);
        } else {
            const tabPane = (function (name, active) {
                const tabPaneName = `tab-pane-${name}`;
                const tabPane = new TabPaneState();
                tabPane.setName(tabPaneName);
                tabPane.setActive(active);
                return tabPane;
            }(name, active));

            tab = new TabState();
            tab.setName(tabName);
            tab.setActive(active);
            tab.setPane(tabPane);

            self.state.tab.add(tabName, tab);

            tab.attachCallback(callback);
        }

        self.component.initializeTab(tab);

        return this;
    };

    this.initializeTextarea = function () {
        let textarea;

        if (self.state.hasTextarea()) {
            textarea = self.state.getTextarea();
        } else {
            textarea = new TextareaState();
            textarea.setValue('');
            // This is set in the textarea presenter.
            textarea.setSelection(null);

            textarea.attachCallback(callbackMirror);
            textarea.attachCallback(callbackHistory);

            self.state.setTextarea(textarea);
        }

        self.component.initializeTextarea(textarea);

        return this;
    };

    this.initializePreview = function () {
        let preview;

        if (self.state.hasPreview()) {
            preview = self.state.getPreview();
        } else {
            preview = new PreviewState();
            preview.setValue('');

            self.state.setPreview(preview);
        }

        self.component.initializePreview(preview);

        return this;
    };

    this.initializeButton = function (name, actionName) {
        const buttonName = `button-${name}`;
        let button;

        if (self.state.button.has(buttonName)) {
            button = self.state.button.get(buttonName);
        } else {
            button = new ButtonState();
            button.setName(buttonName);

            self.state.button.add(buttonName, button);
        }

        this.initializeAction(buttonName, actionName, true);

        self.component.initializeButton(button);

        return this;
    };

    this.initializeAction = function (name, actionName, strict) {
        // Special case, where strict is not set, but it should be true.
        if ('undefined' === typeof strict) {
            strict = true;
        }

        if (Action.registry.has(actionName)) {
            const action = Action.registry.get(actionName);

            this.action.add(name, action);
        } else {
            if (strict) {
                throw 'ERR_ACTION';
            }
        }

        return this;
    };

    this.triggerAction = function (name, strict) {
        // Special case, where strict is not set, but it should be true.
        if ('undefined' === typeof strict) {
            strict = true;
        }

        if (this.action.has(name)) {
            const action = this.action.get(name);

            action.handle(self.state);
        } else {
            if (strict) {
                throw 'ERR_ACTION';
            }
        }

        return this;
    };

    this.destroy = function () {
        parent.destroy();

        if (this.fresh) {
            self.state.tab.each(function (value, index) {
                value.detachCallback(callback);
            });
            self.state.tab.clear();
        }

        timeoutReference = null;

        callback = null;

        if (this.fresh) {
            if (self.state.hasTextarea()) {
                let textarea = self.state.getTextarea();
                textarea.detachCallback(callbackMirror);
                textarea.detachCallback(callbackHistory);

                self.state.setTextarea(null);
            }
        }

        callbackMirror = null;
        callbackHistory = null;

        if (this.fresh) {
            if (self.state.hasPreview()) {
                self.state.setPreview(null);
            }
        }

        this.action.clear();

        if (this.fresh) {
            //self.state.button.each(function (value, index) {
            //});
            self.state.button.clear();
        }

        this.engine = null;

        this.configuration = null;

        this.fresh = false;
    };

    return Elementary.Base.Merge(this, self);
}

export function MarkdownNotepadState() {
    const self = new Elementary.Component.ComponentState();

    this.fresh = true;

    this.isFresh = function () {
        return this.fresh;
    };
    this.setFresh = function (fresh) {
        this.fresh = fresh;
        return this;
    };

    this.tab = new Elementary.Collection.CollectionMap();

    this.textarea = null;

    this.getTextarea = function () {
        return this.textarea;
    };
    this.setTextarea = function (textarea) {
        this.textarea = textarea;
        return this;
    };
    this.hasTextarea = function () {
        return !!this.textarea;
    };

    this.preview = null;

    this.getPreview = function () {
        return this.preview;
    };
    this.setPreview = function (preview) {
        this.preview = preview;
        return this;
    };
    this.hasPreview = function () {
        return !!this.preview;
    };

    this.button = new Elementary.Collection.CollectionMap();

    this.history = new History();

    return Elementary.Base.Merge(this, self);
}
