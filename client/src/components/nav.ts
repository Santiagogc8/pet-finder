export class NavBar extends HTMLElement {
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        this.render(); // Y hacemos el render
    }

    render(){
        
    }
}

customElements.define('nav-bar', NavBar)