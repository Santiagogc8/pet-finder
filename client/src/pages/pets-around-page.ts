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
            this.render();
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

    }
}

customElements.define('pets-around-page', PetsAroundPage)