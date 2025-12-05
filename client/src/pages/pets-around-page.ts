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

    openModal(petInfo: any){
        const backdrop = this.shadow.querySelector('.modal-backdrop');
        const title = this.shadow.querySelector('h4');

        const form = this.shadow.querySelector('form');
        // 👇 Guardamos el ID "escondido" en el formulario
        form?.setAttribute('data-pet-id', petInfo.objectID);
        
        title!.innerText = `Reportar info de ${petInfo.name}`; // Limpia y asigna
        backdrop?.classList.remove('hidden');
    }

    async sendReport(name: string, phone: string, message: string, petId: number){
        const response = await fetch('http://localhost:3000/report', {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
            body: JSON.stringify({
                name,
                phone,
                message,
                petId
            })
        })

        const data = await response.json();

        return data;
    }

    render(){
        this.shadow.innerHTML = ''

        const section = document.createElement('section');

        section.innerHTML = `
            <h3>Mascotas perdidas cerca</h3>
            <div class="modal-backdrop hidden">
                <div class="pet-card__report">
                    <a class="modal__close">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="#fff"></path></g></svg>
                    </a>
                    <h4>Reportar info de </h4>
                    <form>
                        <div class="form__inputs">
                            <label for="name">Tu Nombre</label>
                            <input type="text" id="name" autocomplete="off" required>
                        </div>
                        <div class="form__inputs">
                            <label for="phone">Telefono</label>
                            <input type="tel" id="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" autocomplete="off" required autocomplete="off">
                        </div>
                        <div class="form__inputs">
                            <label for="where-see">¿Donde lo viste?</label>
                            <textarea id="where-see"></textarea>
                        </div>
                        <button>Enviar informacion</button>
                    </form>
                </div>
            </div>
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
                    <button id="report-btn">Reportar </button>
                </div>
            `

            const reportBtn = card.querySelector('#report-btn');

            reportBtn?.addEventListener('click', () => {
                this.openModal(pet);
            })

            petCardsContainer.appendChild(card);
        });

        const backdropModal = section.querySelector('.modal-backdrop');
        const closeModalBtn = section.querySelector('.modal__close');

        closeModalBtn?.addEventListener('click', () => {
            backdropModal?.classList.add('hidden');
        });

        const form = section.querySelector('form');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = form.querySelector('#name') as HTMLInputElement;
            const phoneInput = form.querySelector('#phone') as HTMLInputElement;
            const messageTextArea = form.querySelector('#where-see') as HTMLTextAreaElement;
            const petId = form.getAttribute('data-pet-id') as string;

            const reportCreated = await this.sendReport(nameInput.value, phoneInput.value, messageTextArea.value, parseInt(petId));

            if (reportCreated.createdAt) { // ✅ Éxito
                // 1. Buscamos el contenedor del contenido del modal
                const reportContainer = section.querySelector('.pet-card__report');
                
                // 2. Reemplazamos todo el formulario por el mensaje de éxito
                if (reportContainer) {
                    reportContainer.innerHTML = `
                        <h4>¡Reporte enviado! 🚀</h4>
                        <p>Gracias por ayudar a encontrar a esta mascota.</p>
                    `;
                }

                // 3. Cerramos automáticamente después de 3 segundos
                setTimeout(() => {
                    const backdrop = section.querySelector('.modal-backdrop');
                    backdrop?.classList.add('hidden');
                    location.reload();
                }, 3000);

            } else { // ❌ Error
                alert("Hubo un error: " + (reportCreated.error || "Intenta de nuevo"));
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

            .modal-backdrop {
                position: fixed; /* Fijo en la pantalla */
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, 0); /* Fondo oscuro semitransparente */
                backdrop-filter: blur(3px); /* 👈 ¡AQUÍ ESTÁ LA MAGIA DEL BLUR! */
                z-index: 1000; /* Encima de todo */
                
                /* Para centrar el modal automáticamente */
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .pet-card__report{
                position: absolute;
                background-color: #26302E;
                color: white;
                padding: 20px;
                border-radius: 10px;
                width: 80%;
                max-width: 500px;
            }

            .modal__close{
                display: flex;
                width: 100%;
                justify-content: flex-end;
            }

            .modal__close svg{
                width: 30px;
            }

            .modal__close:hover{
                cursor: pointer;
            }

            .pet-card__report h4{
                font-size: 36px;
                margin: 20px 0;
                text-align: center;
            }

            .pet-card__report form{
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            .form__inputs{
                display: flex;
                flex-direction: column;
            }

            .form__inputs label{
                text-transform: uppercase;
            }

            .form__inputs input{
                background-color: #4A5553;
                color: white;
                border: none;
                border-radius: 4px;
                font-family: "Poppins", sans-serif;
                padding: 10px;
                font-size: 1rem;
            }

            .form__inputs textarea{
                background-color: #4A5553;
                color: white;
                border: none;
                border-radius: 4px;
                font-family: "Poppins", sans-serif;
                padding: 10px;
                font-size: 1rem;
                resize: none;
                min-height: 130px;
                max-height: 200px;
                field-sizing: content;
            }

            .form__inputs input, textarea{
                outline: none;
            }

            .pet-card__report form button{
                padding: 14px;
                box-sizing: border-box;
                border: none;
                border-radius: 4px;
                background-color: #00A884;
                color: white;
                font-size: 1rem;
                font-weight: 500;
                font-family: "Poppins", sans-serif;
            }

            .pet-card__report form button:hover{
                cursor: pointer;
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

            #report-btn{
                grid-column: 2;
                grid-row: span 2;
                justify-self: center;
                background-color: #EB6372;
                padding: 10px 15px;
                text-decoration: none;
                color: white;
                border-radius: 4px;
                border: none;
                font-family: "Poppins", sans-serif;
            }

            #report-btn::after{
                content: url(https://res.cloudinary.com/drvtfag9j/image/upload/v1764823825/Siren_zqqihd.png);
                display: inline-block; /* Para poder aplicar el vertical-align */
                vertical-align: middle;
            }

            #report-btn:hover{
                cursor: pointer;
            }

            .hidden{
                display: none;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('pets-around-page', PetsAroundPage)