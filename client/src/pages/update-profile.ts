import { state } from "../state";
import { getLocationFromQuery } from "../lib/location";

class UpdateProfile extends HTMLElement {
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        const currentState = state.getState();

        this.render();
    }

    async searchLocation(query: string) {
        try{
            return getLocationFromQuery(query);
        } catch(error){
            console.log(`Hubo un error ${error}`);
        }
    }

    async sendNewProfileData(data: object){

    }

    render(){
        const section = document.createElement('section');
        section.innerHTML = `
            <h4>Datos personales</h4>
            <form>
                <div>
                    <div class="form__inputs">
                        <label for="name">Nombre</label>
                        <input id="name" name="name" type="text" autocomplete="off">
                    </div>
                    <div class="form__inputs">
                        <label for="location">Ubicacion</label>
                        <input id="location" name="location" type="text" autocomplete="off">
                        <ul class="search-results hidden">
                        </ul>
                    </div>
                    </div>
                <button type="submit">Guardar</button>
            </form>
        `

        const locationInput = section.querySelector("#location");
        const searchResultsUl = section.querySelector(".search-results");
        let timeoutId: any; // Variable para guardar el timer

        locationInput?.addEventListener('input', (e) => {
            const query = (e.target as HTMLInputElement).value;

            // 1. Si ya había un conteo pendiente, lo cancelamos
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // 2. Iniciamos un nuevo conteo
            timeoutId = setTimeout(async () => {
                if(query.trim() === ""){
                    console.log('nada mi bien')
                    searchResultsUl?.classList.add('hidden');
                    return
                } else {
                    // Aquí llamaremos a la API
                    const results = await this.searchLocation(query.trim());
                    searchResultsUl!.innerHTML = "";
                    searchResultsUl?.classList.remove('hidden');

                    results.forEach((result: any) => {
                        const newLi = document.createElement('li');
                        newLi.innerText = result.place_name;
                        searchResultsUl?.appendChild(newLi)
                    });
                }
            }, 700); // Esperamos 700ms
        });

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

            .hidden{
                display: none;
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
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('update-profile', UpdateProfile);