/*! @excellens/markdown-notepad 1.0.0 https://github.com/excellens/markdown-notepad#readme @license MIT */
var MarkdownNotepad = function(exports, Elementary, MarkdownNotepadPack) {
  "use strict";
  /**
     * @param {ParentNode} node
     * @param {string} selector
     */  function FindOne(node, selector) {
    let element = node.querySelector(selector);
    if (null === element) {
      throw "ERR_FIND_ONE";
    }
    return element;
  }
  /**
     * @param {ParentNode} node
     * @param {string} selector
     */  function FindAll(node, selector) {
    let elementList = node.querySelectorAll(selector);
    if (false === !!elementList.length) {
      throw "ERR_FIND_ALL";
    }
    return elementList;
  }
  var Base =  Object.freeze({
    __proto__: null,
    FindOne: FindOne,
    FindAll: FindAll
  });
  function SelectionState() {
    const self = new Elementary.Component.ComponentState;
    this.start = 0;
    this.getStart = function() {
      return this.start;
    };
    this.setStart = function(start) {
      this.start = start;
      return this;
    };
    this.end = 0;
    this.getEnd = function() {
      return this.end;
    };
    this.setEnd = function(end) {
      this.end = end;
      return this;
    };
    this.direction = "none";
    this.getDirection = function() {
      return this.direction;
    };
    this.setDirection = function(direction) {
      this.direction = direction;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  var State =  Object.freeze({
    __proto__: null,
    SelectionState: SelectionState
  });
  function Textarea(document, element, state) {
    const self = function(document, element, state) {
      const presenter = new TextareaPresenter(state);
      return new Elementary.Component.Component(presenter, document, "textarea", element);
    }(document, element, state || new TextareaState);
    const parent = {
      initialize: self.initialize,
      destroy: self.destroy
    };
    let eventChange = null;
    let eventKeyUp = null;
    let eventSelectionChange = null;
    const changeSelection = function() {
      const start = self.selectionStart;
      const end = self.selectionEnd;
      const direction = self.selectionDirection;
      self.presenter.changeSelection(start, end, direction);
    };
    this.initialize = function() {
      parent.initialize();
      self.addEventListener("change", eventChange = function(event) {
        changeSelection();
        self.presenter.changeValue(self.value);
      });
      self.addEventListener("keyup", eventKeyUp = function(event) {
        changeSelection();
        self.presenter.changeValue(self.value);
      });
      document.addEventListener("selectionchange", eventSelectionChange = function(event) {
        if (document.activeElement === self) {
          changeSelection();
        }
      });
      return this;
    };
    this.setValue = function(value) {
      self.value = value;
      return this;
    };
    this.setSelection = function(start, end, direction) {
      self.selectionStart = start;
      self.selectionEnd = end;
      self.selectionDirection = direction;
      return this;
    };
    this.destroy = function() {
      parent.destroy();
      self.removeEventListener("change", eventChange);
      eventChange = null;
      self.removeEventListener("keyup", eventKeyUp);
      eventKeyUp = null;
      document.removeEventListener("selectionchange", eventSelectionChange);
      eventSelectionChange = null;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function TextareaPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    const parent = {
      initialize: self.initialize,
      destroy: self.destroy
    };
    this.update = function(state, id) {
      self.component.setValue(state.getValue());
      if (state.hasSelection()) {
        const selection = state.getSelection();
        const start = selection.getStart();
        const end = selection.getEnd();
        const direction = selection.getDirection();
        self.component.setSelection(start, end, direction);
      }
    };
    this.initialize = function(component) {
      this.initializeState();
      parent.initialize(component);
      return this;
    };
    this.initializeState = function() {
      if (!self.state.hasSelection()) {
        const selection = new SelectionState;
        self.state.setSelection(selection);
      }
      return this;
    };
    this.changeValue = function(value) {
      if (self.state.getValue() !== value) {
        self.state.setValue(value);
        self.state.notify();
      }
      return this;
    };
    this.changeSelection = function(start, end, direction) {
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
  function TextareaState() {
    const self = new Elementary.Component.ComponentState;
    this.value = "";
    this.getValue = function() {
      return this.value;
    };
    this.setValue = function(value) {
      this.value = value;
      return this;
    };
    this.selection = null;
    this.getSelection = function() {
      return this.selection;
    };
    this.setSelection = function(selection) {
      this.selection = selection;
      return this;
    };
    this.hasSelection = function() {
      return !!this.selection;
    };
    return Elementary.Base.Merge(this, self);
  }
  function Tab(document, element, state) {
    const self = function(document, element, state) {
      const presenter = new TabPresenter(state);
      return new Elementary.Component.Component(presenter, document, "div", element);
    }(document, element, state || new TabState);
    const parent = {
      initialize: self.initialize,
      destroy: self.destroy
    };
    let eventClick = null;
    this.initialize = function() {
      parent.initialize();
      self.addEventListener("click", eventClick = function(event) {
        self.presenter.changeActive(true);
      });
      return this;
    };
    this.setActive = function(active) {
      self.classList.toggle("active", active);
      return this;
    };
    this.destroy = function() {
      parent.destroy();
      self.removeEventListener("click", eventClick);
      eventClick = null;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function TabPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    this.update = function(state, id) {
      self.component.setActive(state.isActive());
      if (state.hasPane()) {
        let paneState = state.getPane();
        paneState.setActive(state.isActive());
        paneState.notify();
      }
    };
    this.changeActive = function(active) {
      self.state.setActive(active);
      self.state.notify();
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function TabState() {
    const self = new Elementary.Component.ComponentState;
    this.name = "tab";
    this.getName = function() {
      return this.name;
    };
    this.setName = function(name) {
      this.name = name;
      return this;
    };
    this.active = false;
    this.isActive = function() {
      return this.active;
    };
    this.setActive = function(active) {
      this.active = active;
      return this;
    };
    this.pane = null;
    this.getPane = function() {
      return this.pane;
    };
    this.setPane = function(pane) {
      this.pane = pane;
      return this;
    };
    this.hasPane = function() {
      return !!this.pane;
    };
    return Elementary.Base.Merge(this, self);
  }
  var Component =  Object.freeze({
    __proto__: null,
    Textarea: Textarea,
    TextareaPresenter: TextareaPresenter,
    TextareaState: TextareaState,
    Tab: Tab,
    TabPresenter: TabPresenter,
    TabState: TabState
  });
  function Theme(document, id) {
    const self = {};
    this.id = id;
    this.template = null;
    this.initialize = function(control) {
      this.initializeTemplate();
      control.innerHTML = this.template;
      const id = this.id;
      control.classList.add(`theme-${id}`);
      return this;
    };
    this.initializeTemplate = function() {
      const id = this.id;
      const templateElement = FindOne(document, `script[type="theme/markdown-notepad"]#${id}`);
      this.template = templateElement.innerHTML;
      return this;
    };
    this.destroy = function() {
      this.template = null;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  var Theme$1 =  Object.freeze({
    __proto__: null,
    Theme: Theme
  });
  function TabPane(document, element, state) {
    const self = function(document, element, state) {
      const presenter = new TabPanePresenter(state);
      return new Elementary.Component.Component(presenter, document, "div", element);
    }(document, element, state || new TabPaneState);
    this.setActive = function(active) {
      self.classList.toggle("active", active);
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function TabPanePresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    this.update = function(state, id) {
      self.component.setActive(state.isActive());
    };
    return Elementary.Base.Merge(this, self);
  }
  function TabPaneState() {
    const self = new Elementary.Component.ComponentState;
    this.name = "tab-pane";
    this.getName = function() {
      return this.name;
    };
    this.setName = function(name) {
      this.name = name;
      return this;
    };
    this.active = false;
    this.isActive = function() {
      return this.active;
    };
    this.setActive = function(active) {
      this.active = active;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function Button(document, element, state) {
    const self = function(document, element, state) {
      const presenter = new ButtonPresenter(state);
      return new Elementary.Component.Component(presenter, document, "button", element);
    }(document, element, state || new ButtonState);
    const parent = {
      initialize: self.initialize,
      destroy: self.destroy
    };
    let eventMouseDown = null;
    let eventMouseUp = null;
    this.initialize = function() {
      parent.initialize();
      self.addEventListener("mousedown", eventMouseDown = function(event) {
        self.presenter.changeClick(true);
      });
      self.addEventListener("mouseup", eventMouseUp = function(event) {
        self.presenter.changeClick(false);
      });
      return this;
    };
    this.setActive = function(active) {
      self.classList.toggle("active", active);
      return this;
    };
    this.destroy = function() {
      parent.destroy();
      self.removeEventListener("mousedown", eventMouseDown);
      eventMouseDown = null;
      self.removeEventListener("mouseup", eventMouseUp);
      eventMouseUp = null;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function ButtonPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    this.update = function(state, id) {
      self.component.setActive(state.isActive());
    };
    this.changeClick = function(click) {
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function ButtonState() {
    const self = new Elementary.Component.ComponentState;
    this.name = "button";
    this.getName = function() {
      return this.name;
    };
    this.setName = function(name) {
      this.name = name;
      return this;
    };
    this.active = false;
    this.isActive = function() {
      return this.active;
    };
    this.setActive = function(active) {
      this.active = active;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function Preview(document, element, state) {
    const self = function(document, element, state) {
      const presenter = new PreviewPresenter(state);
      return new Elementary.Component.Component(presenter, document, "div", element);
    }(document, element, state || new PreviewState);
    this.setValue = function(value) {
      self.innerHTML = value;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function PreviewPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    this.update = function(state, id) {
      self.component.setValue(state.getValue());
    };
    return Elementary.Base.Merge(this, self);
  }
  function PreviewState() {
    const self = new Elementary.Component.ComponentState;
    this.value = "";
    this.getValue = function() {
      return this.value;
    };
    this.setValue = function(value) {
      this.value = value;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function Engine() {
    const self = {};
    this.process = function(value) {
      throw "ERR_ENGINE_PROCESS";
    };
    return Elementary.Base.Merge(this, self);
  }
  function EngineMd() {
    const self = new Engine;
    this.md = new MarkdownNotepadPack.Instance;
    this.process = function(value) {
      return this.md.render(value);
    };
    return Elementary.Base.Merge(this, self);
  }
  var Engine$1 =  Object.freeze({
    __proto__: null,
    Engine: Engine,
    EngineMd: EngineMd
  });
  function Transaction() {
    const self = {};
    this.commit = function(snapshot, state) {
      throw "ERR_TRANSACTION_COMMIT";
    };
    this.rollback = function(snapshot, state) {
      throw "ERR_TRANSACTION_ROLLBACK";
    };
    return Elementary.Base.Merge(this, self);
  }
  function TextareaTransaction() {
    const self = new Transaction;
    this.commit = function(snapshot, state) {
      state.setValue(snapshot.getValue());
      if (state.hasSelection()) {
        this.commitSelection(snapshot, state.getSelection());
      }
      state.notify();
      return this;
    };
    this.commitSelection = function(snapshot, state) {
      state.setStart(snapshot.start);
      state.setEnd(snapshot.end);
      state.notify();
      return this;
    };
    this.rollback = function(snapshot, state) {
      const value = state.getValue();
      if (state.hasSelection()) {
        this.rollbackSelection(snapshot, state.getSelection());
      } else {
        snapshot.start  = value.length;
        snapshot.end /****/ = value.length;
      }
      snapshot.before /*****/ = value.substring(undefined, snapshot.start);
      snapshot.inside /*****/ = value.substring(snapshot.start, snapshot.end);
      snapshot.after /******/ = value.substring(snapshot.end, undefined);
      return this;
    };
    this.rollbackSelection = function(snapshot, state) {
      snapshot.start  = state.getStart();
      snapshot.end /****/ = state.getEnd();
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  var Transaction$1 =  Object.freeze({
    __proto__: null,
    Transaction: Transaction,
    TextareaTransaction: TextareaTransaction
  });
  function Snapshot() {
    const self = {};
    this.state = null;
    this.initialize = function() {
      if (false === !!this.state) {
        throw "ERR_SNAPSHOT_INITIALIZE";
      }
      this.rollback();
      return this;
    };
    this.attach = function(state) {
      this.state = state;
      return this;
    };
    this.detach = function() {
      this.state = null;
      return this;
    };
    this.rollback = function() {
      throw "ERR_SNAPSHOT_ROLLBACK";
    };
    this.commit = function() {
      throw "ERR_SNAPSHOT_COMMIT";
    };
    this.destroy = function() {
      if (true === !!this.state) {
        throw "ERR_SNAPSHOT_DESTROY";
      }
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function TextSnapshot(transaction) {
    const self = new Snapshot;
    const parent = {
      initialize: self.initialize,
      destroy: self.destroy
    };
    // Handle state only in transaction.
        this.transaction = transaction;
    this.start /******/ = 0;
    this.end /********/ = 0;
    this.before /*****/ = null;
    this.inside /*****/ = null;
    this.after /******/ = null;
    this.getValue = function() {
      return this.before + this.inside + this.after;
    };
    this.initialize = function(state) {
      self.attach(state);
      return parent.initialize();
    };
    this.commit = function() {
      this.transaction.commit(this, self.state);
      return this;
    };
    this.rollback = function() {
      this.transaction.rollback(this, self.state);
      return this;
    };
    this.destroy = function() {
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
  var Snapshot$1 =  Object.freeze({
    __proto__: null,
    Snapshot: Snapshot,
    TextSnapshot: TextSnapshot,
    Transaction: Transaction$1
  });
  function Action(handle) {
    const self = {};
    if (true === !!handle) {
      this.handle = handle;
    } else {
      this.handle = function(state) {
        throw "ERR_ACTION_HANDLE";
      };
    }
    return Elementary.Base.Merge(this, self);
  }
  Action.registry = new Elementary.Collection.CollectionMap;
  function ActionTab(name) {
    const self = new Action(null);
    this.name = name;
    this.handle = function(state) {
      if (state.tab.has(this.name)) {
        const tab = state.tab.get(this.name);
        tab.setActive(true);
        tab.notify();
      }
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function ActionTabWrite() {
    const self = new ActionTab("write");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("tab-write", new ActionTabWrite);
  function ActionTabPreview() {
    const self = new ActionTab("preview");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("tab-preview", new ActionTabPreview);
  function ActionHistory() {
    const self = new Action(null);
    this.handle = function(state) {
      this.change(state.history);
      return this.update(state.history, state);
    };
    this.change = function(history) {
      throw "ERR_ACTION_HISTORY_CHANGE";
    };
    this.update = function(history, state) {
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
  function ActionHistoryForward() {
    const self = new ActionHistory;
    this.change = function(history) {
      history.moveForward();
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("history-forward", new ActionHistoryForward);
  function ActionHistoryBackward() {
    const self = new ActionHistory;
    this.change = function(history) {
      history.moveBackward();
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("history-backward", new ActionHistoryBackward);
  function ActionText() {
    const self = new Action(null);
    const text = new TextSnapshot(new TextareaTransaction);
    this.handle = function(state) {
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
    this.check = function(state, text) {
      throw "ERR_ACTION_TEXT_CHECK";
    };
    this.insert = function(state, text) {
      throw "ERR_ACTION_TEXT_INSERT";
    };
    this.delete = function(state, text) {
      throw "ERR_ACTION_TEXT_DELETE";
    };
    return Elementary.Base.Merge(this, self);
  }
  function ActionTextWrap(prefix, suffix) {
    const self = new ActionText;
    this.prefix = prefix;
    this.suffix = suffix;
    this.check = function(state, text) {
      return text.before.endsWith(self.prefix) && text.after.startsWith(self.suffix);
    };
    this.insert = function(state, text) {
      text.before = text.before + this.prefix;
      text.after = this.suffix + text.after;
      text.start = text.start + this.prefix.length;
      text.end = text.end + this.prefix.length;
      return this;
    };
    this.delete = function(state, text) {
      text.before = text.before.substring(undefined, text.before.length - this.prefix.length);
      text.after = text.after.substring(undefined, text.after.length - this.suffix.length);
      text.start = text.start - this.prefix.length;
      text.end = text.end - this.prefix.length;
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function ActionTextPrefix(prefix) {
    const self = new ActionTextWrap(prefix, "");
    return Elementary.Base.Merge(this, self);
  }
  function ActionTextPrefixLine(prefix) {
    const self = new ActionTextPrefix(prefix);
    const parent = {
      insert: self.insert,
      delete: self.delete
    };
    this.insert = function(state, text) {
      const line = "\n";
      if (0 < text.before.length && !text.before.endsWith(line)) {
        text.before = text.before + line;
        text.start = text.start + line.length;
        text.end = text.end + line.length;
      }
      return parent.insert(state, text);
    };
    return Elementary.Base.Merge(this, self);
  }
  function ActionTextHeadline() {
    const self = new ActionTextPrefix("### ");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-headline", new ActionTextHeadline);
  function ActionTextBold() {
    const self = new ActionTextWrap("**", "**");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-bold", new ActionTextBold);
  function ActionTextItalic() {
    const self = new ActionTextWrap("_", "_");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-italic", new ActionTextItalic);
  function ActionTextQuote() {
    const self = new ActionTextPrefixLine("> ");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-quote", new ActionTextQuote);
  function ActionTextCode() {
    const self = new ActionTextWrap("`", "`");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-code", new ActionTextCode);
  function ActionTextLink() {
    const self = new ActionTextWrap("[", "]");
    const parent = {
      insert: self.insert,
      delete: self.delete
    };
    this.check = function(state, text) {
      return false;
    };
    this.insert = function(state, text) {
      const line = "(url)";
      text.after = line + text.after;
      if (0 < text.inside.length) {
        text.start = text.end + self.suffix.length + "(".length;
        text.end = text.end + self.suffix.length + "(".length + "url".length;
      }
      return parent.insert(state, text);
    };
    this.delete = function(state, text) {
      return parent.delete(state, text);
    };
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-link", new ActionTextLink);
  function ActionTextUl() {
    const self = new ActionTextPrefixLine("- ");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-ul", new ActionTextUl);
  function ActionTextOl() {
    const self = new ActionTextPrefixLine("1. ");
    return Elementary.Base.Merge(this, self);
  }
  Action.registry.add("text-ol", new ActionTextOl);
  var Action$1 =  Object.freeze({
    __proto__: null,
    Action: Action,
    ActionTab: ActionTab,
    ActionTabWrite: ActionTabWrite,
    ActionTabPreview: ActionTabPreview,
    ActionHistory: ActionHistory,
    ActionHistoryForward: ActionHistoryForward,
    ActionHistoryBackward: ActionHistoryBackward,
    ActionText: ActionText,
    ActionTextWrap: ActionTextWrap,
    ActionTextPrefix: ActionTextPrefix,
    ActionTextPrefixLine: ActionTextPrefixLine,
    ActionTextHeadline: ActionTextHeadline,
    ActionTextBold: ActionTextBold,
    ActionTextItalic: ActionTextItalic,
    ActionTextQuote: ActionTextQuote,
    ActionTextCode: ActionTextCode,
    ActionTextLink: ActionTextLink,
    ActionTextUl: ActionTextUl,
    ActionTextOl: ActionTextOl,
    Snapshot: Snapshot$1
  });
  function History() {
    const self = new Elementary.Collection.Collection;
    const parent = {
      add: self.add
    };
    this.index = 0;
    this.getIndex = function() {
      return this.index;
    };
    this.setIndex = function(index) {
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
    this.modifyIndex = function(by) {
      this.setIndex(this.getIndex() + by);
      return this;
    };
    this.moveForward = function() {
      return this.modifyIndex(+1);
    };
    this.moveBackward = function() {
      return this.modifyIndex(-1);
    };
    this.getCurrent = function() {
      return self.get(this.getIndex());
    };
    this.hasCurrent = function() {
      return self.has(this.getIndex());
    };
    this.add = function(index, value) {
      // Remove the loose end of the list if we are behind.
      while (this.getIndex() < self.size() - 1) {
        self.pop();
      }
      return parent.add(index, value);
    };
    return Elementary.Base.Merge(this, self);
  }
  var Collection =  Object.freeze({
    __proto__: null,
    History: History
  });
  function Configuration() {
    const self = {};
    this.theme = "default";
    this.getTheme = function() {
      return this.theme;
    };
    this.setTheme = function(theme) {
      this.theme = theme;
      return this;
    };
    this.tab = new Elementary.Collection.Collection;
    this.button = new Elementary.Collection.CollectionMap;
    this.key = new Elementary.Collection.CollectionMap;
    return Elementary.Base.Merge(this, self);
  }
  var Configuration$1 =  Object.freeze({
    __proto__: null,
    Configuration: Configuration
  });
  function MarkdownNotepad(document, element, state) {
    const self = function(document, element, state) {
      const presenter = new MarkdownNotepadPresenter(state);
      return new Elementary.Component.Component(presenter, document, "div", element);
    }(document, element, state || new MarkdownNotepadState);
    const parent = {
      initialize: self.initialize,
      destroy: self.destroy
    };
    this.theme = null;
    this.tab = new Elementary.Collection.CollectionMap;
    this.tabPane = new Elementary.Collection.CollectionMap;
    let eventKeyDown = null;
    let eventKeyUp = null;
    let eventContextMenu = null;
    this.textarea = null;
    this.preview = null;
    let eventMouseDown = new Elementary.Collection.CollectionMap;
    let eventMouseUp = new Elementary.Collection.CollectionMap;
    this.button = new Elementary.Collection.CollectionMap;
    this.getConfigurationDefault = function() {
      const configuration = new Configuration;
      // Tab configuration.
            configuration.tab.add("write");
      configuration.tab.add("preview");
      // Button configuration.
            configuration.button.add("text-headline", "text-headline");
      configuration.button.add("text-bold", "text-bold");
      configuration.button.add("text-italic", "text-italic");
      configuration.button.add("text-quote", "text-quote");
      configuration.button.add("text-code", "text-code");
      configuration.button.add("text-link", "text-link");
      configuration.button.add("text-ul", "text-ul");
      configuration.button.add("text-ol", "text-ol");
      configuration.button.add("history-forward", "history-forward");
      configuration.button.add("history-backward", "history-backward");
      // Key configuration.
            configuration.key.add("ctrl+shift+z", "history-forward");
      configuration.key.add("ctrl+z", "history-backward");
      return configuration;
    };
    this.initialize = function(configuration) {
      if (false === !!configuration) {
        configuration = this.getConfigurationDefault();
      }
      // Set the component information.
            self.setAttribute("data-component", "markdown-notepad");
      // Set the style.
            self.classList.add("markdown-notepad");
      this.theme = new Theme(document, configuration.getTheme());
      // Only use the theme if no element is given.
            if (false === !!element) {
        this.theme.initialize(this);
      }
      self.presenter.setConfiguration(configuration);
      parent.initialize();
      return this;
    };
    this.initializeTab = function(state) {
      let name = state.getName();
      let tab = new Tab(document, FindOne(self, `div[data-component="markdown-notepad.tab.${name}"]`), state);
      tab.initialize();
      // Set the style.
            tab.classList.add("tab", name);
      self.tab.add(name, tab);
      this.initializeTabPane(state.getPane());
      return this;
    };
    this.initializeTabPane = function(state) {
      let name = state.getName();
      let tabPane = new TabPane(document, FindOne(self, `div[data-component="markdown-notepad.tab-pane.${name}"]`), state);
      tabPane.initialize();
      // Set the style.
            tabPane.classList.add("tab-pane", name);
      self.tabPane.add(name, tabPane);
      return this;
    };
    this.initializeTextarea = function(state) {
      let textarea = new Textarea(document, FindOne(self, 'textarea[data-component="markdown-notepad.textarea"]'), state);
      textarea.initialize();
      // Set the style.
            textarea.classList.add("markdown-textarea");
      textarea.addEventListener("keydown", eventKeyDown = function(event) {
        // Only continue, when ctrl or alt are down.
        if (event.ctrlKey || event.altKey) {
          // Create an action identifier in the format 'ctrl+alt+shift+key'.
          const action = [ event.ctrlKey ? "ctrl" : "", event.altKey ? "alt" : "", event.shiftKey ? "shift" : "", 
          // Grab the current key in lower case.
          event.key.toLowerCase() ].filter((function(value, index, array) {
            // Filter any empty value and join them with a '+' sign.
            return 0 !== value.length;
          })).join("+");
          try {
            // Try to trigger the action, if it exists.
            self.presenter.triggerAction(action, true);
            event.preventDefault();
          } catch (error) {
            if ("ERR_ACTION" === error) ; else {
              throw error;
            }
          }
        }
      });
      // textarea.addEventListener('keyup', eventKeyUp = function (event) {
      //     self.focusTextarea();
      // });
            textarea.addEventListener("contextmenu", eventContextMenu = function(event) {
        event.preventDefault();
      });
      this.textarea = textarea;
      return this;
    };
    this.initializePreview = function(state) {
      const preview = new Preview(document, FindOne(self, 'div[data-component="markdown-notepad.preview"]'), state);
      preview.initialize();
      // Set the style.
            preview.classList.add("markdown-preview");
      this.preview = preview;
      return this;
    };
    this.initializeButton = function(state) {
      let name = state.getName();
      const button = new Button(document, FindOne(self, `button[data-component="markdown-notepad.button.${name}"]`), state);
      button.initialize();
      // Set the style.
            button.classList.add("button", name);
      // Set click callback.
            const onMouseDown = function(event) {
        self.presenter.triggerAction(name, true);
      };
      eventMouseDown.add(name, onMouseDown);
      button.addEventListener("mousedown", onMouseDown);
      const onMouseUp = function(event) {
        self.focusTextarea();
      };
      eventMouseUp.add(name, onMouseUp);
      button.addEventListener("mouseup", onMouseUp);
      self.button.add(name, button);
      return this;
    };
    this.focusTextarea = function() {
      if (null !== this.textarea) {
        this.textarea.focus();
      }
      return this;
    };
    this.destroy = function() {
      parent.destroy();
      this.theme.destroy();
      this.theme = null;
      this.tab.each((function(value, key) {
        value.destroy();
      }));
      this.tab.clear();
      this.tabPane.each((function(value, key) {
        value.destroy();
      }));
      this.tabPane.clear();
      this.textarea.removeEventListener("keydown", eventKeyDown);
      eventKeyDown = null;
      this.textarea.removeEventListener("keyup", eventKeyUp);
      eventKeyUp = null;
      this.textarea.removeEventListener("contextmenu", eventContextMenu);
      eventContextMenu = null;
      this.textarea.destroy();
      this.textarea = null;
      this.preview.destroy();
      this.preview = null;
      this.button.each((function(value, key) {
        value.destroy();
        const onMouseDown = eventMouseDown.get(key);
        value.removeEventListener("mousedown", onMouseDown);
        const onMouseUp = eventMouseUp.get(key);
        value.removeEventListener("mouseup", onMouseUp);
      }));
      this.button.clear();
      eventMouseDown.clear();
      eventMouseUp.clear();
      return this;
    };
    return Elementary.Base.Merge(this, self);
  }
  function MarkdownNotepadPresenter(state) {
    const self = new Elementary.Component.ComponentPresenter(state);
    const parent = {
      initialize: self.initialize,
      destroy: self.destroy
    };
    this.update = function(state, id) {};
    this.engine = null;
    let timeoutReference = null;
    let callback = null;
    let callbackMirror = null;
    let callbackHistory = null;
    this.action = new Elementary.Collection.CollectionMap;
    this.configuration = null;
    this.getConfiguration = function() {
      return this.configuration;
    };
    this.setConfiguration = function(configuration) {
      this.configuration = configuration;
      return this;
    };
    this.hasConfiguration = function() {
      return !!this.configuration;
    };
    this.fresh = false;
    this.initialize = function(component) {
      this.engine = new EngineMd;
      callback = new Elementary.Observe.Callback("TabChange", (function(state, id) {
        if (state.isActive()) {
          self.state.tab.each((function(value, index) {
            if (state.getName() === value.getName()) {
              return;
            }
            value.setActive(false);
            value.notify();
          }));
        }
      }));
      callbackMirror = new Elementary.Observe.Callback("Mirror", (function(state, id) {
        if (self.state.hasPreview()) {
          let previewValue = state.getValue();
          previewValue = self.engine.process(previewValue);
          let preview = self.state.getPreview();
          preview.setValue(previewValue);
          preview.notify();
        }
      }));
      callbackHistory = new Elementary.Observe.Callback("History", (function(state, id) {
        const makeHistory = function(state) {
          // TODO: Timeout offset.
          if (true === !!timeoutReference) {
            clearTimeout(timeoutReference);
          }
          timeoutReference = setTimeout((function() {
            const snapshot = new TextSnapshot(new TextareaTransaction);
            snapshot.attach(state.getTextarea());
            snapshot.rollback();
            state.history.add(snapshot);
            state.history.moveForward();
            snapshot.detach();
          }), 1e3);
        };
        if (self.state.history.hasCurrent()) {
          const current = self.state.history.getCurrent();
          if (state.getValue() !== current.getValue()) {
            makeHistory(self.state);
          }
        } else {
          makeHistory(self.state);
        }
      }));
      parent.initialize(component);
      this.initializeState();
      return this;
    };
    this.initializeState = function() {
      this.fresh = self.state.isFresh();
      self.state.setFresh(false);
      const configuration = this.getConfiguration();
      configuration.tab.each((function(value, index) {
        // Convert index 0 to false to true.
        const active = false === !!index;
        self.initializeTab(value, active);
      }));
      configuration.button.each((function(value, key) {
        self.initializeButton(key, value);
      }));
      configuration.key.each((function(value, key) {
        self.initializeAction(key, value, true);
      }));
      this.initializeTextarea();
      this.initializePreview();
    };
    this.initializeTab = function(name, active) {
      const tabName = `tab-${name}`;
      let tab;
      if (self.state.tab.has(tabName)) {
        tab = self.state.tab.get(tabName);
      } else {
        const tabPane = function(name, active) {
          const tabPaneName = `tab-pane-${name}`;
          const tabPane = new TabPaneState;
          tabPane.setName(tabPaneName);
          tabPane.setActive(active);
          return tabPane;
        }(name, active);
        tab = new TabState;
        tab.setName(tabName);
        tab.setActive(active);
        tab.setPane(tabPane);
        self.state.tab.add(tabName, tab);
        tab.attachCallback(callback);
      }
      self.component.initializeTab(tab);
      return this;
    };
    this.initializeTextarea = function() {
      let textarea;
      if (self.state.hasTextarea()) {
        textarea = self.state.getTextarea();
      } else {
        textarea = new TextareaState;
        textarea.setValue("");
        // This is set in the textarea presenter.
                textarea.setSelection(null);
        textarea.attachCallback(callbackMirror);
        textarea.attachCallback(callbackHistory);
        self.state.setTextarea(textarea);
      }
      self.component.initializeTextarea(textarea);
      return this;
    };
    this.initializePreview = function() {
      let preview;
      if (self.state.hasPreview()) {
        preview = self.state.getPreview();
      } else {
        preview = new PreviewState;
        preview.setValue("");
        self.state.setPreview(preview);
      }
      self.component.initializePreview(preview);
      return this;
    };
    this.initializeButton = function(name, actionName) {
      const buttonName = `button-${name}`;
      let button;
      if (self.state.button.has(buttonName)) {
        button = self.state.button.get(buttonName);
      } else {
        button = new ButtonState;
        button.setName(buttonName);
        self.state.button.add(buttonName, button);
      }
      this.initializeAction(buttonName, actionName, true);
      self.component.initializeButton(button);
      return this;
    };
    this.initializeAction = function(name, actionName, strict) {
      // Special case, where strict is not set, but it should be true.
      if ("undefined" === typeof strict) {
        strict = true;
      }
      if (Action.registry.has(actionName)) {
        const action = Action.registry.get(actionName);
        this.action.add(name, action);
      } else {
        if (strict) {
          throw "ERR_ACTION";
        }
      }
      return this;
    };
    this.triggerAction = function(name, strict) {
      // Special case, where strict is not set, but it should be true.
      if ("undefined" === typeof strict) {
        strict = true;
      }
      if (this.action.has(name)) {
        const action = this.action.get(name);
        action.handle(self.state);
      } else {
        if (strict) {
          throw "ERR_ACTION";
        }
      }
      return this;
    };
    this.destroy = function() {
      parent.destroy();
      if (this.fresh) {
        self.state.tab.each((function(value, index) {
          value.detachCallback(callback);
        }));
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
  function MarkdownNotepadState() {
    const self = new Elementary.Component.ComponentState;
    this.fresh = true;
    this.isFresh = function() {
      return this.fresh;
    };
    this.setFresh = function(fresh) {
      this.fresh = fresh;
      return this;
    };
    this.tab = new Elementary.Collection.CollectionMap;
    this.textarea = null;
    this.getTextarea = function() {
      return this.textarea;
    };
    this.setTextarea = function(textarea) {
      this.textarea = textarea;
      return this;
    };
    this.hasTextarea = function() {
      return !!this.textarea;
    };
    this.preview = null;
    this.getPreview = function() {
      return this.preview;
    };
    this.setPreview = function(preview) {
      this.preview = preview;
      return this;
    };
    this.hasPreview = function() {
      return !!this.preview;
    };
    this.button = new Elementary.Collection.CollectionMap;
    this.history = new History;
    return Elementary.Base.Merge(this, self);
  }
  var MarkdownNotepad$1 =  Object.freeze({
    __proto__: null,
    MarkdownNotepad: MarkdownNotepad,
    MarkdownNotepadPresenter: MarkdownNotepadPresenter,
    MarkdownNotepadState: MarkdownNotepadState
  });
  var Control =  Object.freeze({
    __proto__: null,
    MarkdownNotepad: MarkdownNotepad$1
  });
  var Service =  Object.freeze({
    __proto__: null,
    Action: Action$1,
    Engine: Engine$1,
    Collection: Collection
  });
  var version = "1.0.0";
  const metadata = {
    version: version
  };
  exports.Base = Base;
  exports.Component = Component;
  exports.Configuration = Configuration$1;
  exports.Control = Control;
  exports.Service = Service;
  exports.State = State;
  exports.Theme = Theme$1;
  exports.metadata = metadata;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  return exports;
}({}, Elementary, MarkdownNotepadPack);
//# sourceMappingURL=markdown-notepad.js.map
