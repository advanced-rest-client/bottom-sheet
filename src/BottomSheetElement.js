/**
@license
Copyright 2018 The Advanced REST Client authors
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { ArcOverlayMixin } from '@advanced-rest-client/arc-overlay-mixin';
import { IronA11yAnnouncer } from '@polymer/iron-a11y-announcer';
import sheetStyles from './styles.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

// Keeps track of the toast currently opened.
let currentSheet;
/**
 * Material design: [Bottom sheets](https://material.google.com/components/bottom-sheets.html#)
 *
 * # `<bottom-sheet>`
 *
 * Bottom sheets slide up from the bottom of the screen to reveal more content.
 *
 * ### Example
 *
 * ```html
 * <bottom-sheet>
 *    <paper-icon-item>
 *      <iron-icon src="inbox.png" item-icon></iron-icon>
 *      Inbox
 *    </paper-icon-item>
 *    <paper-icon-item>
 *      <iron-icon src="keep.png" item-icon></iron-icon>
 *      Keep
 *    </paper-icon-item>
 *    <paper-icon-item>
 *      <iron-icon src="hangouts.png" item-icon></iron-icon>
 *      Hangouts
 *    </paper-icon-item>
 *  </bottom-sheet>
 * ```
 *
 * ### Positioning
 *
 * Use the `fit-bottom` class to position the bar at the bottom of the app and with full width;
 *
 * Use `center-bottom` class to display the bar at the bottom centered on a page.
 *
 * ### Styling
 *
 * `<bottom-sheet>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--bottom-sheet-background-color` | The bottom-sheet background-color | `#fff`
 * `--bottom-sheet-color` | The bottom-sheet color | `#323232`
 * `--bottom-sheet-max-width` | Max width of the element | ``
 * `--bottom-sheet-max-height` | Max height of the element | ``
 * `--bottom-sheet-label-color` | Color of the label | `rgba(0, 0, 0, 0.54)`
 * `--bottom-sheet-box-shadow` | Box shadow property of the element | `0 2px 5px 0 rgba(0, 0, 0, 0.26)`
 *
 */
export class BottomSheetElement extends ArcOverlayMixin(LitElement) {
  static get styles() {
    return sheetStyles;
  }

  render() {
    const { label } = this;
    return html`
    ${label ? html`<label>${label}</label>` : ''}
    <div class="scrollable">
      <slot></slot>
    </div>`;
  }

  static get properties() {
    return {
      /**
       * The label of the bottom sheet.
       * @attribute
       */
      label: { type: String },
      /**
       * Removes padding from the element styles
       * @attribute
       */
      noPadding: { type: Boolean, reflect: true }
    };
  }

  get fitInto() {
    return this._fitInto;
  }

  set fitInto(value) {
    const old = this._fitInto;
    if (old === value) {
      return;
    }
    this._fitInto = value;
    this._onFitIntoChanged(value);
  }

  /**
   * Returns the scrolling element.
   * @return {HTMLElement}
   */
  get scrollTarget() {
    return this.shadowRoot.querySelector('.scrollable');
  }

  constructor() {
    super();
    this.__onTransitionEnd = this.__onTransitionEnd.bind(this);

    this.fitInto = window;
    this.opened = false;
    this.label = undefined;
  }

  connectedCallback() {
    /* istanbul ignore else  */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    // @ts-ignore
    IronA11yAnnouncer.requestAvailability();
    this.addEventListener('transitionend', this.__onTransitionEnd);
  }

  disconnectedCallback() {
    /* istanbul ignore else  */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('transitionend', this.__onTransitionEnd);
  }

  firstUpdated() {
    this.sizingTarget = this.scrollTarget;
  }

  _openedChanged(opened) {
    if (opened) {
      if (currentSheet && currentSheet !== this) {
        currentSheet.close();
      }
      currentSheet = this;
      this.dispatchEvent(new CustomEvent('iron-announce', {
        bubbles: true,
        composed: true,
        detail: {
          text: 'Menu opened'
        }
      }));
    } else if (currentSheet === this) {
      currentSheet = null;
    }
    super._openedChanged(opened);
  }

  /**
   * Overridden from `ArcOverlayMixin`.
   */
  _renderOpened() {
    const node = this;
    node.classList.add('bottom-sheet-open');
  }

  /**
   * Overridden from `ArcOverlayMixin`.
   */
  _renderClosed() {
    const node = this;
    node.classList.remove('bottom-sheet-open');
  }

  /**
   * @private
   * @param {HTMLElement} fitInto
   */
  _onFitIntoChanged(fitInto) {
    this.positionTarget = fitInto;
  }

  __onTransitionEnd(e) {
    // there are different transitions that are happening when opening and
    // closing the toast. The last one so far is for `opacity`.
    // This marks the end of the transition, so we check for this to determine if this
    // is the correct event.
    if (e && e.target === this && e.propertyName === 'opacity') {
      if (this.opened) {
        this._finishRenderOpened();
      } else {
        this._finishRenderClosed();
      }
    }
  }
  /**
   * Fired when `bottom-sheet` is opened.
   *
   * @event 'iron-announce'
   * @param {{text: string}} detail Contains text that will be announced.
   */
}
