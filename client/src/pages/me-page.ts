import { state } from "../state";

class MePage extends HTMLElement {
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        this.render();
    }

    async getUserInfo(){

    }

    render(){
        const currentState = state.getState()

        const section = document.createElement('section');
        section.innerHTML = `
            <h4>Mis datos</h4>
            <div class="buttons-container">
                <a href="#">Modificar datos personales</a>
                <a href="#">Modificar contraseña</a>
            </div>
            <div class="my-data">
                <p>${currentState.me.email || 'user'}</p>
                <a href="#">Cerrar sesion</a>
            </div>
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

            .buttons-container{
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 25px;
            }

            .buttons-container a{
                padding: 14px 30px;
                background-color: #5A8FEC;
                box-sizing: border-box;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                width: 100%;
                text-align: center;
                font-weight: 600;
            }

            .my-data{
                text-align: center;
                text-transform: uppercase;
            }

            .my-data a{
                color: #3B97D3;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('me-page', MePage);