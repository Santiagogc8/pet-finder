import { state } from "../state";

class EditReportPage extends HTMLElement {
	shadow: ShadowRoot;
	petName: string = "";
    lng: number = 0;
    lat: number = 0;
    petImgUrl: string = "";

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
            this.lat = data.lat;
            this.lng = data.lng;
            this.petImgUrl = data.imageUrl;

            this.render();

            return;
        } catch(error){
            console.error(error);
            return alert("No pudimos cargar la información de la mascota.");
        }
	}

	render() {
		const section = document.createElement("section");
		section.innerHTML = `
            <h4>Editar reporte de mascota</h4>
        `;

		const style = document.createElement("style");
		style.innerHTML = `
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
        `;

		this.shadow.appendChild(section);
		this.shadow.appendChild(style);
	}
}

customElements.define("edit-report", EditReportPage);