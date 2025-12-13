import { state, API_BASE_URL } from "../state";
import { getLocationFromCoords } from "../lib/location";
import mapboxgl from "mapbox-gl";

class CreateReportPage extends HTMLElement {
	shadow: ShadowRoot;
	lat: number = 0;
	lng: number = 0;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		const currentState = state.getState();

		if (currentState.token) {
			this.render();
		} else {
			history.pushState({}, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
		}
	}

	initMap() {
		const currentState = state.getState() as any;

		let currentLng;
		let currentLat;

		currentLng = currentState.coords?.lng ? currentState.coords.lng : -74.09;
		currentLat = currentState.coords?.lat ? currentState.coords.lat : 4.65;

		// Buscamos el contenedor del mapa en nuestro Shadow DOM
		const mapContainer = this.shadow.getElementById("map");

		mapboxgl.accessToken = process.env.MAPBOX_TOKEN
		// Inicializamos el mapa
		const map = new mapboxgl.Map({
			container: mapContainer as HTMLElement, // Referencia al div
			style: "mapbox://styles/mapbox/streets-v11",
			center: [currentLng, currentLat], // Coordenadas iniciales (ej. Bogotá)
			zoom: 13,
		});

		// Agregamos el control de navegación (zoom, rotar)
		map.addControl(new mapboxgl.NavigationControl());

		// Variable para el marcador actual
		let currentMarker: mapboxgl.Marker | null = null;

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

	async sendReportData(data: any) {
		const currentState = state.getState();
		const { name, lat, lng, imgUrl, lost } = data;

		try {
			const res = await fetch(`${API_BASE_URL}/pets`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${currentState.token}`, // Importante: Token
				},
				body: JSON.stringify({
					name,
					lat,
					lng,
					imgUrl,
					lost,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				alert("¡Mascota reportada con éxito!");
				// Redirigimos a la página de mascotas cercanas o al perfil
				history.pushState({}, "", "/pets-around");
				window.dispatchEvent(new PopStateEvent("popstate"));
			} else {
				console.error("Error del servidor:", data);
				alert(`Error al guardar: ${data.error || "Intenta nuevamente"}`);
			}
		} catch (error) {
			console.error(error);
			alert("Hubo un error de conexión.");
		}
	}

	render() {
		const section = document.createElement("section");
		section.innerHTML = `
            <div class="pet-heading">
                <h4>Reportar mascota</h4>
                <p>Ingresa la siguiente información para realizar el reporte de la mascota</p>
            </div>
            <form id="pet-report">
                <div class="form__inputs">
                    <label for="pet-name">Nombre</label>
                    <input 
                        id="pet-name" 
                        name="pet-name" 
                        type="text"
                        autocomplete="off"
                        required>
                </div>
                <div class="form__inputs">
                    <div class="pet-picture-container">
                        <img class="picture-preview" src="https://res.cloudinary.com/drvtfag9j/image/upload/v1765399440/image_7_zeo02z.png">
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
                        required>
                </div>
                <button type="submit" id="form__submit">Reportar mascota</button>
                <button id="form__cancel">Cancelar</button>
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

		const form = section.querySelector("#pet-report");

		form?.addEventListener("submit", async (e) => {
			e.preventDefault();

			if (this.lat === 0 || this.lng === 0)
				return alert(
					"Debes seleccionar un lugar en el mapa antes de hacer el envio del reporte"
				);

			if (!fileInput.files?.[0]) {
				alert("Por favor, agrega una foto de la mascota.");
				return;
			}

			const petNameInput = section.querySelector(
				"#pet-name"
			) as HTMLInputElement;

			const petReportData = {
				name: petNameInput.value,
				lat: this.lat,
				lng: this.lng,
				imgUrl: preview.src, // Enviamos la imagen en base64
				lost: true, // Por defecto es true porque estamos reportando pérdida
			};

			return await this.sendReportData(petReportData)
		});

		const cancelBtn = section.querySelector("#form__cancel")

		cancelBtn?.addEventListener("click", () => {
			history.pushState({}, "", "/home");
			window.dispatchEvent(new PopStateEvent("popstate"));
		})

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

            .pet-heading {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .pet-heading h4{
                font-size: 36px;
                margin: 50px 0 20px 0;
                max-width: 300px;
            }

            .pet-heading p{
                margin: 0;
            }

            form{
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 100%;
                margin: 90px 0;
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

            #form__submit{
                background-color: #00A884;
            } 

            #form__cancel{
                background-color: #4A5553;
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

customElements.define("create-report", CreateReportPage);