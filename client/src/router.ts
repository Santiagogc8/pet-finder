import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';

// Pages
import './pages/home-page';

// Components
import './components/nav'

@customElement('my-root') // Definimos el elemento my-root donde el router pintara todo
// Exportamos la clase MyElement que hereda de LitElement
export class MyElement extends LitElement { 
    
    // 1. El router se instancia conectado al 'this' (el componente host)
    private _routes = new Router(this, [
        {path: '/', render: () => html`<home-page></home-page>`}
    ]);

    // Y renderiza
    render() {
        // Un html con una navbar definida, el main content y un footer
        return html`
            <header>
                <nav>
                    <a href="/">Home</a> |
                    <a href="/projects">Projects</a> |
                    <a href="/about">About</a>
                </nav>
            </header>

            <main>
                ${this._routes.outlet()}
            </main>

            <footer>
                <p>Mi pie de página</p>
            </footer>
        `;
    }
}