import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';

// Pages
import './pages/entry-page';
import './pages/login-page';
import './pages/register-page';
import './pages/home-page';
import './pages/pets-around-page';
import './pages/me-page';
import './pages/update-profile';
import './pages/update-password';

// Components
import './components/nav'

@customElement('my-root') // Definimos el elemento my-root donde el router pintara todo
// Exportamos la clase MyElement que hereda de LitElement
export class MyElement extends LitElement { 
    
    // 1. El router se instancia conectado al 'this' (el componente host)
    private _routes = new Router(this, [
        {path: '/', render: () => html`<entry-page></entry-page>`},
        {path: '/login', render: () => html`<login-page></login-page>`},
        {path: '/register', render: () => html`<register-page></register-page>`},
        {path: '/home', render: () => html`<home-page></home-page>`},
        { path: '/pets-around', render: () => html`<pets-around-page></pets-around-page>`},
        { path: '/me', render: () => html`<me-page></me-page>`},
        { path: '/update-profile', render: () => html`<update-profile></update-profile>`},
        { path: '/update-password', render: () => html`<update-password></update-password>`},
    ]);

    // Y renderiza
    render() {
        // Un html con una navbar definida, el main content y un footer
        return html`
            <nav-bar></nav-bar>

            <main>
                ${this._routes.outlet()}
            </main>
        `;
    }
}