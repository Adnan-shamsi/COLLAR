import CRDT from "./crdt";
import RemoteCursor from "./remoteCursor";

class Editor {
  constructor(mde) {
    this.controller = null;
    this.codemirror = mde;
    this.remoteCursors = {};
    this.customTabBehavior();
  }

  customTabBehavior() {
    this.codemirror.setOption("extraKeys", {
      Tab: function (codemirror) {
        codemirror.replaceSelection("\t");
      },
    });
  }

  bindChangeEvent() {
    this.codemirror.on("change", (_, changeObj) => {
      console.log(changeObj);
      if (changeObj.origin === "setValue") { changeObj.origin = 'paste' };
      if (changeObj.origin === "insertText") { changeObj.origin = 'paste' };
      if (changeObj.origin === "deleteText") { changeObj.origin = 'cut' };


      console.log('local-changes', changeObj);

      switch (changeObj.origin) {
        case "redo":
        case "undo":
          this.processUndoRedo(changeObj);
          break;
        case "*compose":
        case "+input":
        //          this.processInsert(changeObj);    // uncomment this line for palindromes!
        case "paste":
          this.processInsert(changeObj);
          break;
        case "+delete":
        case "cut":
          this.processDelete(changeObj);
          break;
        default:
          throw new Error("Unknown operation attempted in editor.");
      }
      console.log('crdt structure', this.controller.crdt.struct);
    });

    this.codemirror.on("beforeChange", function (_, change) {
      const operations = ["redo", "undo"];
      if (operations.includes(change.origin)) change.cancel();
    });
  }

  processInsert(changeObj) {
    this.processDelete(changeObj);
    const chars = this.extractChars(changeObj.text);
    const startPos = changeObj.from;

    this.updateRemoteCursorsInsert(chars, changeObj.to);
    this.controller.localInsert(chars, startPos);
  }

  isEmpty(textArr) {
    return textArr.length === 1 && textArr[0].length === 0;
  }

  processDelete(changeObj) {
    if (this.isEmpty(changeObj.removed)) return;
    const startPos = changeObj.from;
    const endPos = changeObj.to;
    const chars = this.extractChars(changeObj.removed);

    this.updateRemoteCursorsDelete(chars, changeObj.to, changeObj.from);
    this.controller.localDelete(startPos, endPos);
  }

  processUndoRedo(changeObj) {
    if (changeObj.removed[0].length > 0) {
      this.processDelete(changeObj);
    } else {
      this.processInsert(changeObj);
    }
  }

  extractChars(text) {
    if (text[0] === "" && text[1] === "" && text.length === 2) {
      return "\n";
    } else {
      return text.join("\n");
    }
  }

  replaceText(text) {
    const cursor = this.codemirror.getCursor();
    this.codemirror.setValue(text);
    this.codemirror.setCursor(cursor);
  }

  insertText(value, positions, siteId) {
    const localCursor = this.codemirror.getCursor();
    const delta = this.generateDeltaFromChars(value);

    this.codemirror.replaceRange(
      value,
      positions.from,
      positions.to,
      "insertText"
    );
    this.updateRemoteCursorsInsert(positions.to, siteId);
    this.updateRemoteCursor(positions.to, siteId, "insert", value);

    if (localCursor.line > positions.to.line) {
      localCursor.line += delta.line;
    } else if (
      localCursor.line === positions.to.line &&
      localCursor.ch > positions.to.ch
    ) {
      if (delta.line > 0) {
        localCursor.line += delta.line;
        localCursor.ch -= positions.to.ch;
      }

      localCursor.ch += delta.ch;
    }

    this.codemirror.setCursor(localCursor);
  }

  removeCursor(siteId) {
    const remoteCursor = this.remoteCursors[siteId];

    if (remoteCursor) {
      remoteCursor.detach();

      delete this.remoteCursors[siteId];
    }
  }

  updateRemoteCursorsInsert(chars, position, siteId) {
    const positionDelta = this.generateDeltaFromChars(chars);

    for (const cursorSiteId in this.remoteCursors) {
      if (cursorSiteId === siteId) continue;
      const remoteCursor = this.remoteCursors[cursorSiteId];
      const newPosition = Object.assign({}, remoteCursor.lastPosition);

      if (newPosition.line > position.line) {
        newPosition.line += positionDelta.line;
      } else if (
        newPosition.line === position.line &&
        newPosition.ch > position.ch
      ) {
        if (positionDelta.line > 0) {
          newPosition.line += positionDelta.line;
          newPosition.ch -= position.ch;
        }

        newPosition.ch += positionDelta.ch;
      }

      remoteCursor.set(newPosition);
    }
  }

  updateRemoteCursorsDelete(chars, to, from, siteId) {
    const positionDelta = this.generateDeltaFromChars(chars);

    for (const cursorSiteId in this.remoteCursors) {
      if (cursorSiteId === siteId) continue;
      const remoteCursor = this.remoteCursors[cursorSiteId];
      const newPosition = Object.assign({}, remoteCursor.lastPosition);

      if (newPosition.line > to.line) {
        newPosition.line -= positionDelta.line;
      } else if (newPosition.line === to.line && newPosition.ch > to.ch) {
        if (positionDelta.line > 0) {
          newPosition.line -= positionDelta.line;
          newPosition.ch += from.ch;
        }

        newPosition.ch -= positionDelta.ch;
      }

      remoteCursor.set(newPosition);
    }
  }

  updateRemoteCursor(position, siteId, opType, value) {
    const remoteCursor = this.remoteCursors[siteId];
    const clonedPosition = Object.assign({}, position);

    if (opType === "insert") {
      if (value === "\n") {
        clonedPosition.line++;
        clonedPosition.ch = 0;
      } else {
        clonedPosition.ch++;
      }
    } else {
      clonedPosition.ch--;
    }
    return;
    if (remoteCursor) {
      remoteCursor.set(clonedPosition);
    } else {
      this.remoteCursors[siteId] = new RemoteCursor(
        this.codemirror,
        siteId,
        clonedPosition,
        this.controller.username,
      );
    }
  }

  deleteText(value, positions, siteId) {
    const localCursor = this.codemirror.getCursor();
    const delta = this.generateDeltaFromChars(value);

    this.codemirror.replaceRange(
      "",
      positions.from,
      positions.to,
      "deleteText"
    );
    this.updateRemoteCursorsDelete(positions.to, siteId);
    this.updateRemoteCursor(positions.to, siteId, "delete");

    if (localCursor.line > positions.to.line) {
      localCursor.line -= delta.line;
    } else if (
      localCursor.line === positions.to.line &&
      localCursor.ch > positions.to.ch
    ) {
      if (delta.line > 0) {
        localCursor.line -= delta.line;
        localCursor.ch += positions.from.ch;
      }

      localCursor.ch -= delta.ch;
    }

    this.codemirror.setCursor(localCursor);
  }

  findLinearIdx(lineIdx, chIdx) {
    const linesOfText = this.controller.crdt.text.split("\n");

    let index = 0;
    for (let i = 0; i < lineIdx; i++) {
      index += linesOfText[i].length + 1;
    }

    return index + chIdx;
  }

  generateDeltaFromChars(chars) {
    const delta = { line: 0, ch: 0 };
    let counter = 0;

    while (counter < chars.length) {
      if (chars[counter] === "\n") {
        delta.line++;
        delta.ch = 0;
      } else {
        delta.ch++;
      }

      counter++;
    }

    return delta;
  }
}

export default Editor;
