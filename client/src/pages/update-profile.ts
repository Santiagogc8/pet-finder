import { state, API_BASE_URL } from "../state";
import { getLocationFromQuery, getLocationFromCoords } from "../lib/location";

class UpdateProfile extends HTMLElement {
    shadow: ShadowRoot;
    lat: number = 0;
    lng: number = 0;
    location: string = "no establecida";
    username: string = "username";

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    async connectedCallback(){
        const currentState = state.getState();

        if(currentState.token){
            if(currentState.me.name && currentState.me.lng && currentState.me.lat){
                this.location = await this.getLocationByCoords(currentState.me.lng, currentState.me.lat)
                this.username = currentState.me.name;
                this.render();
            } else {
                history.pushState({}, "", "/me");
			    window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
            }
        } else {
            history.pushState({}, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
        }
    }

    async searchLocationQuery(query: string) {
        try{
            return await getLocationFromQuery(query);
        } catch(error){
            console.log(`Hubo un error ${error}`);
        }
    }

    async sendNewProfileData(data: any, token: string){
        try {
            const response = await fetch(`${API_BASE_URL}/me`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const resData = await response.json();

            if(response.ok){
                return true;
            } else {
                console.error(resData.error);
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async getLocationByCoords(lng: number, lat: number){
        try{
            return await getLocationFromCoords(lng, lat);
        } catch(error){
            console.log(`Hubo un error ${error}`);
        }
    }

    render(){
        const section = document.createElement('section');
        section.innerHTML = `
            <h4>Datos personales</h4>
            <form>
                <div>
                    <div class="form__inputs">
                        <label for="name">Nombre</label>
                        <input 
                            id="name" 
                            name="name" 
                            type="text" 
                            autocomplete="off"
                            value="${this.username}"
                            required>
                    </div>
                    <div class="form__inputs">
                        <label for="location">Ubicacion</label>
                        <input 
                            id="location" 
                            name="location" 
                            type="text" 
                            autocomplete="off"
                            value="${this.location}"
                            required>
                        <ul class="search-results hidden"></ul>
                    </div>
                    </div>
                <button id="submit-btn" type="submit">Guardar</button>
            </form>
        `

        const locationInput = section.querySelector("#location") as HTMLInputElement;
        const searchResultsUl = section.querySelector(".search-results");
        let timeoutId: any; // Variable para guardar el timer
        const submitBtn = section.querySelector("#submit-btn");

        locationInput?.addEventListener('input', (e) => {
            const query = (e.target as HTMLInputElement).value;

            // 1. Si ya había un conteo pendiente, lo cancelamos
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // 2. Iniciamos un nuevo conteo
            timeoutId = setTimeout(async () => {
                if(query.trim() === ""){
                    searchResultsUl?.classList.add('hidden');
                    return;
                } else {
                    // Aquí llamaremos a la API
                    const results = await this.searchLocationQuery(query.trim());
                    searchResultsUl!.innerHTML = "";
                    searchResultsUl?.classList.remove('hidden');

                    results.forEach((result: any) => {
                        const newLi = document.createElement('li');
                        newLi.innerText = result.place_name;

                        newLi.addEventListener("click", () => {
                            console.log(result);
                            locationInput.value = result.place_name;
                            searchResultsUl?.classList.add('hidden');

                            this.lng = result.geometry.coordinates[0];
                            this.lat = result.geometry.coordinates[1];
                        });
                        searchResultsUl?.appendChild(newLi)
                    });
                }
            }, 700); // Esperamos 700ms
        });

        submitBtn?.addEventListener("click", async (e) => {
            e.preventDefault();
            
            const currentState = state.getState();
            const nameInput = section.querySelector("#name") as HTMLInputElement;

            const newData = {
                name: nameInput.value,
                lat: this.lat,
                lng: this.lng
            };

            const success = await this.sendNewProfileData(newData, currentState.token);

            if(success){
                alert("Datos guardados correctamente ✅");
                window.location.reload();
            } else {
                alert("Error al guardar los datos ❌");
            }
        })

        const style = document.createElement('style');
        style.innerHTML = `
            section{
                font-family: "Poppins", sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 90%;
                min-height: 80vh;
                margin: 0 auto;
                max-width: 400px;
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

            .form__inputs input:focus{
                outline: none;
                box-shadow: 0 2px 2px #00000040;
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

            .search-results{
                display: block;
                background-color: white;
                margin: 0;
                list-style-type: none;
                padding: 0;
            }

            .search-results li{
                padding: .6rem;
                border-top: 0.2px solid black;
            }

            .search-results li:hover{
                background-color: #ededed;
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

customElements.define('update-profile', UpdateProfile);