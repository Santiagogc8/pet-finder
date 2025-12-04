import { state } from "../state";

class PetsAroundPage extends HTMLElement {
    shadow: ShadowRoot;
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" }); // Inicializamos el shadow
    }

    connectedCallback(){
        const currentState = state.getState();

        if(currentState.coords){
            const lat = currentState.coords.lat;
            const lng = currentState.coords.lng;

            this.getPets(lat, lng);
            state.suscribe(() => { // Le pasamos una arrow function que ejecuta a render. De esta manera la toma, la guárdala, y  la ejecútala cuando el estado cambie
                this.render()
            });
        } else {
            history.pushState({}, '', '/home');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }

    async getPets(lat: number, lng: number){
        const response = await fetch(`http://localhost:3000/pets/around?lat=${lat}&lng=${lng}`);

        const data = await response.json();

        return state.setState(data);
    }

    render(){
        this.shadow.innerHTML = ''

        const section = document.createElement('section');
        const pets = state.getState().pets;

        pets.map((pet: any) => {
            const card = document.createElement('div');
            card.classList.add('pet-card');

            card.innerHTML = `
                <img src="${pet.imgUrl}">
                <div class="pet-card__info">
                    <h3>${pet.name}</h3>
                    <p>UBICACION</p>
                    <a href="#">Reportar</a>
                </div>
            `

            section.appendChild(card);
        });

        const style = document.createElement('style');

        style.innerHTML = `
        
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('pets-around-page', PetsAroundPage)