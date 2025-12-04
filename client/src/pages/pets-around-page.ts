import { state } from "../state";
import { getLocationFromCoords } from "../lib/location";

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

        const petsWithLocation = await Promise.all(
            data.pets.map(async (pet: any) => {
                const textLocation = await getLocationFromCoords(pet._geoloc.lng, pet._geoloc.lat);

                return {
                    ...pet, // Copia name, imgUrl, _geoloc, id, etc. automáticamente
                    textLocation // Agrega la propiedad nueva
                }
            })
        )

        return state.setState({pets: petsWithLocation});
    }

    render(){
        this.shadow.innerHTML = ''

        const section = document.createElement('section');

        section.innerHTML = `
            <h3>Mascotas perdidas cerca</h3>
        `

        const petCardsContainer = document.createElement('div');
        petCardsContainer.classList.add('pets-card__container');

        section.appendChild(petCardsContainer)
        const pets = state.getState().pets;

        pets.map((pet: any) => {
            const card = document.createElement('div');
            card.classList.add('pet-card');

            card.innerHTML = `
                <img src="https://voca-land.sgp1.cdn.digitaloceanspaces.com/43844/1654148724932/a782407639e0a9fa0e1509391a3feb39414681de6795983c8e0d7c13670aa6f6.jpg">
                <div class="pet-card__info">
                    <h3>${pet.name}</h3>
                    <p>${pet.textLocation}</p>
                    <a href="#">Reportar </a>
                </div>
            `

            petCardsContainer.appendChild(card);
        });

        const style = document.createElement('style');

        style.innerHTML = `
            section{
                font-family: "Poppins", sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 90%;
                margin: 0 auto;
            }

            section h3{
                font-size: 24px;
            }

            .pets-card__container{
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2rem;
                flex-wrap: wrap;
            }

            .pet-card{
                background-color: #26302E;
                color: white;
                border-radius: 10px;
                padding: 8px;
                width: 100%;
                box-sizing: border-box;
                max-width: 350px;
                max-height: 234px;
            }

            .pet-card img{
                width: 100%;
                height: 136px;
                object-fit: cover;
                border-radius: 3px;
            }

            .pet-card__info{
                display: grid;
                align-items: center;
                grid-template-columns: 60% 40%;
                grid-template-rows: 50% 50%;
            }

            .pet-card__info *{
                margin: 0;
            }

            .pet-card__info h3{
                font-size: 36px;
                margin-left: 8px;
            }

            .pet-card__info p{
                grid-colum: 1;
                grid-row: 2;
                margin-left: 8px;
            }

            .pet-card__info a{
                grid-colum: 2;
                grid-row: span 2;
                justify-self: center;
                background-color: #EB6372;
                padding: 10px 15px;
                text-decoration: none;
                color: white;
                border-radius: 4px;
            }

            .pet-card__info a::after{
                content: url(https://res.cloudinary.com/drvtfag9j/image/upload/v1764823825/Siren_zqqihd.png);
                display: inline-block; /* Para poder aplicar el vertical-align */
                vertical-align: middle;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('pets-around-page', PetsAroundPage)