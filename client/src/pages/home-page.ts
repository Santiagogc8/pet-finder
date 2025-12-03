import { state } from "../state";

class HomePage extends HTMLElement{
    shadow: ShadowRoot;
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" }); // Inicializamos el shadow
	}

	connectedCallback() {
        const currentState = state.getState()
        if(currentState.coords){
            history.pushState({}, '', '/pets-around');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            this.render(); // Renderizamos el componente
        }
	}

	render() {
        const section = document.createElement('section');

        section.innerHTML = `
            <img src="https://res.cloudinary.com/drvtfag9j/image/upload/v1764734790/undraw_beach_day_cser_1_ffmiyc.png" alt="women with a pet">
            <div class="home__info">
                <h3>Pet Finder App</h3>
                <p>Encuentra y reporta mascotas perdidas cerca de tu ubicación</p>
                <button>Dar mi ubicación actual</button>
                <a href="#">¿Cómo funciona Pet Finder?</a>
            </div>
        `

        const style = document.createElement('style');

        style.innerHTML = `
            section{
                font-family: "Poppins", sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
            }

            section img{
                margin: 50px 0;
            }

            .home__info{
                text-align: center;
                width: 90%;
                max-width: 270px;
                box-sizing: border-box;
            }

            .home__info h3{
                font-size: clamp(36px, 3vw, 80px);
                margin: 0;
                color: #EB6372;
            }

            .home__info p{
                font-size: 18px;
            }

            .home__info button{
                padding: 16px 8px;
                width: 100%;
                background-color: #5A8FEC;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
                margin-bottom: 25px;
            }

            .home__info button:hover{
                cursor: pointer;
            }

            .home__info a{
                padding: 16px 8px;
                width: 100%;
                background-color: #00A884;
                color: white;
                border-radius: 4px;
                font-size: 1rem;
                display: block;
                box-sizing: border-box;
                text-decoration: none;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('home-page', HomePage)