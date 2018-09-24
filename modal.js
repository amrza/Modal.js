/**
 * amrza.Modal - A minimal modal box.
 * Copyright (c) 2018 Amirreza Ghaderi. All rights reserved.
 * Use of this source code is governed by (BSD License) which
 * can be found in the `LICENSE` file.
 * https://github.com/amrza/Modal.js
 * 
 * WARNING:
 * THE FOLLOWING CODE IS WRITTEN BY SOMEONE WHO IS NOT A JS NINJA!
 * IT MAY CONTAIN NON-IDIOMATIC JS.
 *
 * VIEWER DISCRETION IS ADVISED!
 */
(function() {

'use strict';

var log = console.log;

/**
 * Update values in firstObj, with the new values provided by secondObj.
 * 
 * @param {Object} firstObj
 * @param {Object} secondObj
 * @returns {boolean} true if everything goes fine.
 */
function updateObject(firstObj, secondObj) {
  for (var key in firstObj) {
    if (secondObj.hasOwnProperty(key)) {
      firstObj[key] = secondObj[key];
    }
  }
  return true;
}

function div(classlist) {
  var d = document.createElement("div");
  d.className = classlist;
  return d;
}

function button(label) {
  var b = document.createElement("button");
  b.innerText = label;
  return b;
}

// class Modal
var Modal = (function () {

  /** @constructor
   * @param {object} options
   */
  function Modal(options) {

    /** @private */
    this._options = {
      y:       0,
      x:       0,
      width:   400,
      height:  250,
      rtl:     false,

      title:   "Title",
      text:    "no message here...",

      ok:      function(e, self) { self.close() },
      yes:     false,
      no:      false,
      cancel:  false,
    };
    
    // Update default _options with user's options.
    updateObject(this._options, options);

    // Create modal layers.
    this.modal   = div("amrza-modal");  // the dark background.
    this.box     = div("amrza-modal-box");
    this.title   = div("amrza-modal-box-title");
    this.content = div("amrza-modal-box-content");
    this.buttons = div("amrza-modal-box-buttons-layer");

    // set title and content.
    this.content.innerHTML = this._options.text;
    this.titleNode = document.createTextNode(this._options.title);
    this.title.appendChild(this.titleNode);
    
    // By default, the box only cares about the width; the height will be measured
    // based on the content. however you must set the height if you want to use .html().
    this.box.style.width = this._options.width + "px";
    if (document.body.clientWidth < this._options.width) {
      this.box.style.width = (document.body.clientWidth - 20) + "px";
    }

    // If you set y or x, it means you want absolute positioning.
    if (this._options.y > 0 || this._options.x > 0) {
      this.box.style
        = "margin: 0;"
        + "position: absolute;"
        + "top:"  + this._options.y + "px;"
        + "left:" + this._options.x + "px;"
        ;
    }

    // Set up the modal box.
    this.box.appendChild(this.title);
    this.box.appendChild(this.content);
    this.box.appendChild(this.buttons);
    this.modal.appendChild(this.box);

    // if you want buttons to show up in modal box, define a callback function for them.
    if (typeof this._options.ok === "function") {
      this.ok = this._createButton("Ok");
      this.buttons.appendChild(this.ok);
    }

    if (typeof this._options.yes === "function") {
      this.yes = this._createButton("yes");
      this.buttons.appendChild(this.yes);
    }

    if (typeof this._options.no === "function") {
      this.no = this._createButton("No");
      this.buttons.appendChild(this.no);
    }

    if (typeof this._options.cancel === "function") {
      this.cancel = this._createButton("Cancel");
      this.buttons.appendChild(this.cancel);
    }

    // Config modal for RTL (if requested).
    if (this._options.rtl === true) {
      this.box.className += " amrza-modal-rtl";
      this.buttons.className += " amrza-modal-ltr";
    }

    // Modal status (flags)
    this._isShowing = false;
    this._isClosed = false;

    // Arbitrary arguments! in case you want to inject some values to modal box.
    this.args = {};
  }
  
  /** @private
   * Creates modal buttons.
   * 
   * @param {string} label text for label.
   * @returns {HTMLButtonElement} created button.
   */
  Modal.prototype._createButton = function(label) {
    var self = this;
    var b = button(label);

    b.className = "amrza-modal-box-button amrza-modal-box-button-" + label.toLowerCase();

    b.addEventListener('click', function(e) {
      self._options[label.toLowerCase()](e, self);
    });

    return b;
  }

 /** @public
  * Ignore the default behaviour of modal box, and make it act as a container
  * with fixed width and height; so you can bring your own html
  * elements. (eg, showing an image, slider, video player,...).
  * 
  * if you use this, then you must bring your own buttons. (eg. create a button
  * to close the box by calling .close())
  * 
  * @param {string} tagsType 
  * @param {string | HTMLElement} tags
  * @param {boolean} fullReplace if true, it will replace everything inside the modal box.
  */
  Modal.prototype.html = function(tagsType, tags, fullReplace) {
    if (fullReplace) {
      this.box.style.padding = 0;
      this.box.style.height = this._options.height + "px";
      this.box.innerHTML = "";
    } else {
      this.content.innerHTML = "";
    }

    if (tagsType == 'String') {
      if (fullReplace) {
        this.box.innerHTML = tags;
        return this;
      }
      this.content.innerHTML = tags;
    }

    if (tagsType == 'Node') {
      if (fullReplace) {
        this.box.appendChild(tags);
        return this;
      }
      this.content.appendChild(tags);
    }

    return this;
  };

  /** @public
   * Shows the modal box. you can also pass an optional function to be fired
   * when this method called.
   * 
   * @param {function} func function(self) {...}
   */
  Modal.prototype.show = function(func) {
    // Dont do anything If box is on screen right now.
    if (this._isShowing === true) {
      return this;
    }

    if (typeof func === "function") {
      func(this);
    }

    document.body.appendChild(this.modal);
    this._isShowing = true;
    this._isClosed = false;
    return this;
  };

  /** @public
   * Close modal box by removing it from <body>. you can also pass an optional
   * function to be fired when this method called.
   * 
   * @param {function} func function(self) {...}
   */
  Modal.prototype.close = function(func) {
    // Dont do anything if box is already closed.
    if (this._isClosed  === true) {
      return this;
    }

    if (typeof func === "function") {
      func(this);
    }

    this.modal.parentNode.removeChild(this.modal)
    this._isClosed = true;
    this._isShowing = false;
    return this;
  };
  
  return Modal;
}());


var exports = {
  Modal: Modal
};

var isBrowser = typeof window !== "undefined";
var __amrza__ = isBrowser && typeof window.amrza === "object";

if (__amrza__) {
  window.amrza.Modal = Modal;
} else {
  window.amrza = { 'Modal': Modal };
}

})();
