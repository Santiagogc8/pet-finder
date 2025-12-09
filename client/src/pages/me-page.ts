import { state } from "../state";

class MePage extends HTMLElement {
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
            this.getUserInfo(currentState.token);
        } else {
            history.pushState({}, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
        }
    }

    async getUserInfo(token: string){
        const response = await fetch('http://localhost:3000/me', {
            method: 'GET',
            headers: {
				"Content-Type": "application/json",
                "Authorization": `bearer ${token}`
			},
        });

        const data = await response.json();

        return state.setState({me: data})
    }

    render(){
        const currentState = state.getState();

        const section = document.createElement('section');
        section.innerHTML = `
            <h4>Mis datos</h4>
            <div class="buttons-container">
                <a href="/update-profile">Modificar datos personales</a>
                <a href="/update-password">Modificar contraseña</a>
            </div>
            <div class="my-data">
                <p>${currentState.me.email || 'user'}</p>
                <a id="my-data-a" href="#">Cerrar sesion</a>
            </div>
        `

        const myDataAnchor = section.querySelector("#my-data-a");

        myDataAnchor?.addEventListener("click", (e) => {
            const userConfirm = confirm('Estas seguro que quieres cerrar sesion?');

            if(userConfirm){
                state.setState({ });
                localStorage.removeItem("petFinderState");
                location.reload();
            }
        })

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