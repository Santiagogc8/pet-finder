class HomePage extends HTMLElement{
    shadow: ShadowRoot;
    constructor(){
        super();
        this.shadow = this.attachShadow({mode: "open"});
        this.render();
    }

    render(){
        this.shadow.innerHTML = `
            <h1>🏠 Home</h1>
        `
    }
}

customElements.define('home-page', HomePage);