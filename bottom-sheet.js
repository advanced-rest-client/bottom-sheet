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
import { PolymerElement } from '../../@polymer/polymer/polymer-element.js';

import '../../@polymer/polymer/lib/elements/dom-if.js';
import { IronA11yAnnouncer } from '../../@polymer/iron-a11y-announcer/iron-a11y-announcer.js';
import { mixinBehaviors } from '../../@polymer/polymer/lib/legacy/class.js';
import { IronOverlayBehaviorImpl, IronOverlayBehavior } from '../../@polymer/iron-overlay-behavior/iron-overlay-behavior.js';
import '../../@polymer/paper-styles/paper-styles.js';
import { html } from '../../@polymer/polymer/lib/utils/html-tag.js';
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
 * `--bottom-sheet-max-height` | Max heigth of the element | ``
 * `--bottom-sheet-label-color` | Color of the label | `rgba(0, 0, 0, 0.54)`
 * `--bottom-sheet-box-shadow` | Box shaddow property of the element | `0 2px 5px 0 rgba(0, 0, 0, 0.26)`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof UiElements
 * @appliesMixin Polymer.IronOverlayBehavior
 */
class BottomSheet extends mixinBehaviors([IronOverlayBehavior], PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      position: fixed;
      background-color: var(--bottom-sheet-background-color, #fff);
      color: var(--bottom-sheet-color, #323232);
      min-height: 48px;
      min-width: 288px;
      bottom: 0px;
      left: 0px;
      box-sizing: border-box;
      box-shadow: var(--bottom-sheet-box-shadow, 0 2px 5px 0 rgba(0, 0, 0, 0.26));
      border-radius: 2px;
      margin: 0 12px;
      font-size: 14px;
      cursor: default;
      -webkit-transition: -webkit-transform 0.3s, opacity 0.3s;
      transition: transform 0.3s, opacity 0.3s;
      opacity: 0;
      -webkit-transform: translateY(100px);
      transform: translateY(100px);
      max-width: var(--bottom-sheet-max-width);
      max-height: var(--bottom-sheet-max-height);
      @apply --arc-font-common-base;
    }

    :host(.fit-bottom) {
      width: 100%;
      min-width: 0;
      border-radius: 0;
      margin: 0;
    }

    :host(.center-bottom) {
      left: initial;
    }

    :host(.bottom-sheet-open) {
      opacity: 1;
      -webkit-transform: translateY(0px);
      transform: translateY(0px);
    }

    label {
      @apply --arc-font-caption;
      height: 48px;
      color: var(--bottom-sheet-label-color, rgba(0, 0, 0, 0.54));
      display: block;
      font-size: 15px;
      @apply --layout-horizontal;
      @apply --layout-center;
      padding-left: 16px;
    }

    [hidden] {
      display: none !important;
    }

    .scrollable {
      padding: 24px;
      max-height: 100vh;
      @apply --layout-scroll;
      @apply --bottom-sheet-scrollable;
    }

    :host([no-padding]) .scrollable {
      padding: 0;
    }
    </style>
    <template is="dom-if" if="[[label]]">
      <label>[[label]]</label>
    </template>
    <div id="scrollable" class="scrollable">
      <slot></slot>
    </div>
`;
  }

  static get is() {
    return 'bottom-sheet';
  }
  static get properties() {
    return {
      /**
       * The element to fit `this` into.
       * Overridden from `Polymer.IronFitBehavior`.
       */
      fitInto: {
        type: Object,
        value: window,
        observer: '_onFitIntoChanged'
      },

      /**
       * The label of the bottom sheet.
       */
      label: {
        type: String,
        value: ''
      },

      sizingTarget: {
        type: Object
      },
      // If set the padding won't be added to the scrollable element.
      noPadding: {
        type: Boolean,
        reflectToAttribute: true
      },
      /**
       * True if the overlay is currently displayed.
       */
      opened:
          {observer: '_openedChanged', type: Boolean, value: false, notify: true}
    };
  }

  /**
   * Returns the scrolling element.
   */
  get scrollTarget() {
    return this.$.scrollable;
  }

  constructor() {
    super();
    this.__onTransitionEnd = this.__onTransitionEnd.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    IronA11yAnnouncer.requestAvailability();
    this.addEventListener('transitionend', this.__onTransitionEnd);
    if (!this.sizingTarget) {
      this.sizingTarget = this.$.scrollable;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('transitionend', this.__onTransitionEnd);
  }

  _openedChanged() {
    if (this.opened) {
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
    IronOverlayBehaviorImpl._openedChanged.apply(this, arguments);
  }

  /**
   * Overridden from `IronOverlayBehavior`.
   */
  _renderOpened() {
    this.classList.add('bottom-sheet-open');
  }
  /**
   * Overridden from `IronOverlayBehavior`.
   */
  _renderClosed() {
    this.classList.remove('bottom-sheet-open');
  }
  /**
   * @private
   * @param {Element} fitInto
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
window.customElements.define(BottomSheet.is, BottomSheet);
