/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from 'lit-element';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import { installRouter } from 'pwa-helpers/router.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import {
  navigate,
  updateOffline,
  updateDrawerState
} from '../actions/app.js';

// These are the elements needed by this element.

import './login-view.js';

class BilaraApp extends connect(store)(LitElement) {
  render() {
    
    const translationUrl = this._page.subpath.length ? '/translation' + this._page.subpath.join('/') : null;


    // Anything that's related to rendering should be done in here.
    return html`
    <style>
     :host {
    --bilara-primary-color: #dc322f;
    --bilara-secondary-color: #6c71c4;
    --bilara-primary-background-color: #fdf6e3;
    --bilara-secondary-background-color: #eee8d5;
    --bilara-primary-text-color: #657b83;
    --bilara-emphasized-text-color: #586e75;
    --bilara-secondary-text-color: #93a1a1;
    --bilara-yellow: #b58900;
    --bilara-orange: #cb4b16;
    --bilara-red: #dc322f;
    --bilara-magenta: #d33682;
    --bilara-violet: #6c71c4;
    --bilara-blue: #268bd2;
    --bilara-cyan: #2aa198;
    --bilara-green: #859900;
    --bilara-black: #002b36;
    color: var(--bilara-primary-text-color)
}

header {
    position: fixed;
    width: 100%;
    background-color: var(--bilara-black);
    color: var(--bilara-secondary-text-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

header div {
    margin: 4px 16px
}

[main-title] {
    font-weight: 900;
    font-size: 1rem;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 2px 8px;
    color: var(--bilara-secondary-color);
}

[main-title]:hover{
	background-color: var(--bilara-secondary-color);
    color: var(--bilara-secondary-background-color);
}

a {
    text-decoration: none;
}
/* Workaround for IE11 displaying <main> as inline */
main {
    display: block;
}

.main-content {
    padding-top: 64px;
    min-height: 100vh;
    background-color: var(--bilara-primary-background-color);
}

.page {
    display: none;
}

.page[active] {
    display: block;
}

footer {
    padding: 24px;
    background-color: var(--bilara-black);
    color: var(--bilara-secondary-text-color);
    text-align: center;
}



.disabled {
    opacity: 0.7;
}

.app-log {
    color: var(--bilara-secondary-color);
    font-weight: 600;
    font-size: 0.8rem;
    padding: 2px 8px;
    margin: 0 4px;
    border: 1px solid var(--bilara-secondary-text-color);
    border-radius: 8px;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: .05em
}
.app-log:hover {
    background-color: var(--bilara-secondary-color);
    color: var(--bilara-secondary-background-color);
}
.user-name {
    display: inline-block;
    font-size: 0.8rem;
    font-style: italic;
    padding: 4px 8px;
    margin: 0 4px
}
.user-name::before {
    content: "user: "
}
.user-name::after {
    content: "!"
}
    </style>

    <!-- Header -->
    <header class="app-header">
    <div class="app-header-left">
       <a href="/browse"><h1 main-title>${this.appTitle}</h1></a>
       </div>
       <div class="app-header-right">
        ${
          this._username ? html`<span class="user-name">${this._username}</span> <a href="/logout" target="_top" class="app-log">Logout</a>` : html`<a href="/login"  target="_top" class="app-log">Login</a>` 
        }
        </div>
    </header>


      
        
      <!-- Main content -->
      <main role="main" class="main-content">
        ${ this._userMustRevalidate ? '' : html`
          ${
            this._username ? html`
              <browse-view class="page" ?active="${this._page.view === 'browse'}"></browse-view>
              <translation-view class="page" ?active="${this._page.view === 'translation'}"></translation-view>
              <my-view404 class="page" ?active="${this._page.view === 'view404'}"></my-view404>`
            : html`<login-view></login-view>`
          }
      `}
      </main>

    <footer>
      <p>Computer Aided Translation for SuttaCentral</p>
    </footer>`
  }

  static get properties() {
    return {
      appTitle: { type: String },
      _page: { type: Object },
      _drawerOpened: { type: Boolean },
      _offline: { type: Boolean },
      _username: { type: String },
      _avatarUrl: { type: String },
      _userMustRevalidate: { type: Boolean }
    }
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    setPassiveTouchGestures(true);
  }

  firstUpdated() {
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 460px)`,
        () => store.dispatch(updateDrawerState(false)));
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      const pageTitle = this.appTitle + ' - ' + this._page;
      updateMetadata({
        title: pageTitle,
        description: pageTitle
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  _menuButtonClicked() {
    store.dispatch(updateDrawerState(true));
  }

  _drawerOpenedChanged(e) {
    store.dispatch(updateDrawerState(e.target.opened));
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._drawerOpened = state.app.drawerOpened;
    this._username = state.app.user.username;
    this._avatarUrl = state.app.user.avatarUrl;
    this._userMustRevalidate = state.app.user.revalidate;
  }
}

window.customElements.define('bilara-app', BilaraApp);
