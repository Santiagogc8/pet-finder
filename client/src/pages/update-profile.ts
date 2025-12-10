import { state } from "../state";

class updateProfile extends HTMLElement {
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        const currentState = state.getState();

        this.render();
    }

    async sendNewProfileData(data: object){

    }

    render(){
        const currentState = state.getState();

        const section = document.createElement('section');
        section.innerHTML = `
            <h4>Datos personales</h4>
            <form>
                <div>
                    <div class="form__inputs">
                        <label for="name">Nombre</label>
                        <input id="name" name="name" type="text">
                    </div>
                    <div class="form__inputs">
                        <label for="location">Ubicacion</label>
                        <input id="location" name="location" type="text">
                    </div>
                    </div>
                <button type="submit">Guardar</button>
            </form>
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
                width: 300px;
                text-align: center;
            }

            form{
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 100%;
            }

            .form__inputs{
                display: flex;
                flex-direction: column;
                margin-bottom: 25px;
            }

            .form__inputs label{
                text-transform: uppercase;
            }

            .form__inputs input{
                padding: 16px 8px;
                width: 100%;
                box-sizing: border-box;
                border: none;
                border-radius: 4px;
                font-size: 15px;
                font-family: "Poppins", sans-serif;
            }

            form button{
                margin-top: 2vh;
                padding: 16px 8px;
                width: 100%;
                background-color: #5A8FEC;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
                font-weight: 600;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('update-profile', updateProfile);