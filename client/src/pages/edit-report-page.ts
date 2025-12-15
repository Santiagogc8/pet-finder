import { state, API_BASE_URL } from "../state";
import { getLocationFromCoords } from "../lib/location";
import mapboxgl from "mapbox-gl";

class EditReportPage extends HTMLElement {
	shadow: ShadowRoot;
	petName: string = "";
    lng: number = 0;
    lat: number = 0;
    petImgUrl: string = "https://res.cloudinary.com/drvtfag9j/image/upload/v1765399440/image_7_zeo02z.png";
    location: string = "Ubicacion desconocida";
    petId: number = 0;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	async connectedCallback() {
		const currentState = state.getState();

		if (currentState.token) {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			this.petId = parseInt(urlParams.get("id") as string);

			if(this.petId){
                await this.getPetInfo(this.petId, currentState.token);
            } else {
                history.pushState({}, "", "/my-reports");
			    window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
            }
		} else {
			history.pushState({}, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
		}
	}

	async getPetInfo(id: number, token: string) {
		try{
            const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `bearer ${token}`,
                },
            });

            const data = await response.json();

            this.petName = data.name;
            this.location = await getLocationFromCoords(data.lng, data.lat);
            this.lng = data.lng;
            this.lat = data.lat;
            this.petImgUrl = data.imageUrl;

            this.render();

            return;
        } catch(error){
            console.error(error);
            return alert("No pudimos cargar la información de la mascota.");
        }
	}

    async sendNewDataReport(petId: number, token: string, newData: any){
        try{
            const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`
                }, 
                body: JSON.stringify(newData)
            })

            const data = await response.json();

            if(response.ok) { // Verificamos si el status es 200-299
                return true; 
            } else {
                console.error(data.error);
                return false; 
            }
        } catch(error){
            console.error(error);
            return false;
        }
    }

    async deletePet(petId: number, token: string){
        try{
            const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`
                }
            });

            const data = await response.json();

            if(response.ok) { // Verificamos si el status es 200-299
                return true; 
            } else {
                console.error(data.error);
                return false; 
            }
        } catch(error){
            console.error(error);
            return false;
        }
    }

    initMap() {
		const initialLng = this.lng || -74.09;
		const initialLat = this.lat || 4.65;

		// Buscamos el contenedor del mapa en nuestro Shadow DOM
		const mapContainer = this.shadow.getElementById("map");

		mapboxgl.accessToken = "pk.eyJ1Ijoic2FudGlhZ29ndXptYW44IiwiYSI6ImNtaHY0NnoxODA2czAybHB1dzl5dDN2aTEifQ.-kyc4EgAzGHoYDtRirsqdQ"

		// Inicializamos el mapa
		const map = new mapboxgl.Map({
			container: mapContainer as HTMLElement, // Referencia al div
			style: "mapbox://styles/mapbox/streets-v11",
			center: [initialLng, initialLat], // Coordenadas iniciales (ej. Bogotá)
			zoom: 13,
		});

		// Agregamos el control de navegación (zoom, rotar)
		map.addControl(new mapboxgl.NavigationControl());

		// Variable para el marcador actual
		let currentMarker: mapboxgl.Marker | null = null;

        if (this.lng && this.lat) {
            currentMarker = new mapboxgl.Marker()
                .setLngLat([initialLng, initialLat])
                .addTo(map);
        }

		// Escuchamos el evento 'click' en el mapa
		map.on("click", async (e) => {
			const { lng, lat } = e.lngLat;

			// Guardamos las coordenadas en las propiedades de la clase
			this.lat = lat;
			this.lng = lng;

			// Si ya hay un marcador, lo borramos para poner el nuevo
			if (currentMarker) {
				currentMarker.remove();
			}

			// Ponemos el nuevo marcador visual
			currentMarker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

			const petLocationInput = this.shadow.querySelector(
				"#pet-location"
			) as HTMLInputElement;

			petLocationInput.value = await getLocationFromCoords(lng, lat);
		});
	}

	render() {
        const currentState = state.getState()

		const section = document.createElement("section");
		section.innerHTML = `
            <h4>Editar reporte de mascota</h4>
            <form id="pet-report">
                <div class="form__inputs">
                    <label for="pet-name">Nombre</label>
                    <input 
                        id="pet-name" 
                        name="pet-name" 
                        type="text"
                        autocomplete="off"
                        value="${this.petName}"
                        required>
                </div>
                <div class="form__inputs">
                    <div class="pet-picture-container">
                        <img class="picture-preview" src="${this.petImgUrl}">
                        <button id="add-pet-picture" type="button">Agregar foto</button>
                        
                        <input 
                            id="pet-image" 
                            name="pet-image" 
                            type="file" 
                            accept="image/*" 
                            style="display: none;" 
                        >
                    </div>
                </div>
                <div class="form__inputs">
                    <div id="map" class="map-container"></div>
                    <p class="caption">Busca un punto de referencia para reportar la mascota. Por ejemplo, la ubicación donde lo viste por última vez.</p>

                    <label for="pet-location">Ubicación</label>
                    <input 
                        id="pet-location" 
                        name="pet-location" 
                        type="text"
                        autocomplete="off"
                        value="${this.location}"
                        required>
                </div>
                <button type="submit" id="form__submit">Guardar</button>
                <button id="find__btn" type="button">Reportar como encontrado</button>
                <button id="delete__report" type="button">Eliminar reporte</button>
            </form>
        `;

        const addPetPictureBtn = section.querySelector("#add-pet-picture");
		const fileInput = section.querySelector("#pet-image") as HTMLInputElement;
		const preview = section.querySelector(".picture-preview") as HTMLImageElement;

		// Al hacer clic en el cuadro gris, activamos el input oculto
		addPetPictureBtn?.addEventListener("click", () => {
			fileInput.click();
		});

		// Cuando el usuario elige un archivo...
		fileInput.addEventListener("change", () => {
			const file = fileInput.files?.[0];
			if (file) {
				const reader = new FileReader();

				reader.onload = (e) => {
					const result = e.target?.result as string;
					// Mostramos la preview y ocultamos el texto
					preview.src = result;
				};

				reader.readAsDataURL(file);
			}
		});

        const form = section.querySelector('#pet-report');
        const findBtn = section.querySelector('#find__btn');
        const deleteBtn = section.querySelector('#delete__report');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

			const petNameInput = section.querySelector("#pet-name") as HTMLInputElement;
            
            // Creamos el objeto base solo con lo que SIEMPRE cambia o es obligatorio
            const petReportData: any = {
                name: petNameInput.value,
                lat: this.lat,
                lng: this.lng,
            };

            // Solo agregamos la imagen si el usuario seleccionó un archivo nuevo
            if (fileInput.files && fileInput.files.length > 0) {
                petReportData.imgUrl = preview.src; 
            }

            const success = await this.sendNewDataReport(this.petId, currentState.token, petReportData);
            
            if (success) {
                alert("¡Datos actualizados correctamente!");
                // Redirigimos
                history.pushState({}, "", "/my-reports");
                window.dispatchEvent(new PopStateEvent("popstate"));
            } else {
                alert("Error al actualizar. Verifica los datos.");
            }
        });

        findBtn?.addEventListener("click", async (e) => {
            const success = await this.sendNewDataReport(this.petId, currentState.token, { lost: false });

            if (success) {
                alert("¡Qué buena noticia! Mascota marcada como encontrada.");
                history.pushState({}, "", "/my-reports");
                window.dispatchEvent(new PopStateEvent("popstate"));
            } else {
                alert("Error al actualizar el estado.");
            }
        });

        deleteBtn?.addEventListener("click", async (e) => {
            const userConfirm = confirm("¿Estás seguro de eliminar el reporte? Esta acción no se puede revertir");

            if(userConfirm){
                const success = await this.deletePet(this.petId, currentState.token);

                if (success) {
                    alert("El reporte se ha eliminado correctamente");
                    history.pushState({}, "", "/my-reports");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                } else {
                    alert("Ha ocurrido un error al eliminar.");
                }
            }
        });

		const style = document.createElement("style");
		style.innerHTML = `
            @import url('https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css');

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
                text-align: center;
            }

            form{
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 100%;
                margin: 20px 0 80px 0;
                max-width: 600px;
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
                font-family: "Poppins", sans-serif;
            }

            form button:hover{
                cursor: pointer;
            }

            .picture-preview{
                width: 100%;
            }

            .map-container {
                height: 300px;
                width: 100%;
                margin-top: 10px;
                border-radius: 10px;
            }

            .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-compass {
                display: none !important;
            }

            .mapboxgl-ctrl-zoom-in, .mapboxgl-ctrl-zoom-out{
                margin: 10px 0;
            }

            .form__inputs .caption{
                text-align: center;
            }

            #find__btn{
                background-color: #00A884;
            } 

            #delete__report{
                background-color: #EB6372;
            }

            .hidden{
                display: none;
            }
        `;

		this.shadow.appendChild(section);
		this.shadow.appendChild(style);
        this.initMap();
	}
}

customElements.define("edit-report", EditReportPage);