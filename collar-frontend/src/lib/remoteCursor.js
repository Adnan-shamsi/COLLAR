import CSS_COLORS from './cssColors';
import { generateItemFromHash } from './hashAlgo';
import { ANIMALS } from './cursorNames';

export default class RemoteCursor {
  constructor(codemirror, siteId, position, username) {
    this.codemirror = codemirror;

    const color = 'red';
    const name = username;

    this.createCursor(color);
    this.createFlag(color, name);

    this.cursor.appendChild(this.flag);
    this.set(position);
  }

  createCursor(color) {
    const textHeight = this.codemirror.defaultTextHeight();

    this.cursor = document.createElement('div');
    this.cursor.classList.add('remote-cursor');
    this.cursor.style.backgroundColor = color;
    this.cursor.style.height = textHeight + 'px';
  }

  createFlag(color, name) {
    const cursorName = document.createTextNode(name);
    this.flag = document.createElement('span');
    this.flag.classList.add('flag');
    this.flag.style.backgroundColor = color;
    this.flag.appendChild(cursorName)
  }

  set(position) {
    this.detach();
    const coords = this.codemirror.cursorCoords(position, 'local');
    this.cursor.style.left = (coords.left >= 0 ? coords.left : 0) + 'px';
    this.codemirror.getDoc().setBookmark(position, { widget: this.cursor });
    this.lastPosition = position;
    
    // Add a zero width-space so line wrapping works (on firefox?)
    this.cursor.parentElement.appendChild(document.createTextNode("\u200b"));
  }

  detach() {
    // Used when updating cursor position.
    // If cursor exists on the DOM, remove it.  
    // DO NOT remove cursor's parent. It contains the zero width-space.
    if (this.cursor.parentElement)
      this.cursor.remove();
  }
}
