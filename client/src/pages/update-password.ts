import { state } from "../state";

class updatePassword extends HTMLElement {
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        const currentState = state.getState();

        if(currentState.token){
            state.suscribe(() => { // Le pasamos una arrow function que ejecuta a render. De esta manera la toma, la guárdala, y  la ejecútala cuando el estado cambie
                this.render();
            });
        } else {
            history.pushState({}, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
        }
    }

    render(){
        const currentState = state.getState();

        const section = document.createElement('section');
        section.innerHTML = `
        `

        const style = document.createElement('style');
        style.innerHTML = `
            section{
                font-family: "Poppins", sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 90%;
                min-height: 80vh;
                margin: 0 auto;
            }

            section h4{
                font-size: 36px;
                margin: 50px 0;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('update-password', updatePassword);