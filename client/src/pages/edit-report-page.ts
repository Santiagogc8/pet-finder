import { state } from "../state";
import { getLocationFromCoords } from "../lib/location";
import mapboxgl from "mapbox-gl";

class EditReportPage extends HTMLElement {
	shadow: ShadowRoot;
	petName: string = "";
    lng: number = 0;
    lat: number = 0;
    petImgUrl: string = "https://res.cloudinary.com/drvtfag9j/image/upload/v1765399440/image_7_zeo02z.png";
    location: string = "Ubicacion desconocida"

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	async connectedCallback() {
		const currentState = state.getState();

		if (currentState.token) {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			const id = urlParams.get("id") as string;

			if(id){
                await this.getPetInfo(parseInt(id), currentState.token);
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
            const response = await fetch(`http://localhost:3000/pets/${id}`, {
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

    initMap() {
		const initialLng = this.lng || -74.09;
		const initialLat = this.lat || 4.65;

		// Buscamos el contenedor del mapa en nuestro Shadow DOM
		const mapContainer = this.shadow.getElementById("map");

		mapboxgl.accessToken =
			"pk.eyJ1Ijoic2FudGlhZ29ndXptYW44IiwiYSI6ImNtaHY0NnoxODA2czAybHB1dzl5dDN2aTEifQ.-kyc4EgAzGHoYDtRirsqdQ";

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
                <button id="find__btn">Reportar como encontrado</button>
                <button id="delete__report">Eliminar reporte</button>
            </form>
        `;

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