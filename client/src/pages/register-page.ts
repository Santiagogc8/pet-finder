import { state } from "../state";
import { getPositionFromDirection } from "../lib/location";
import { getPosition } from "../lib/location";

// Pagina de SignUp
class RegisterPage extends HTMLElement {
	shadow: ShadowRoot;
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" }); // Inicializamos el shadow
	}

	connectedCallback() {
		this.render(); // Renderizamos el componente
	}

	async signUpUser(name: string, email: string, password: string, lat: number, lng: number) {
		const res = await fetch("http://localhost:3000/" + "auth/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				email,
				password,
				lat,
				lng,
			}),
		});

		const data = await res.json();

		return data;
	}

	render() {
		const section = document.createElement("section");

		section.innerHTML = `
            <div class="heading__container">
                <h3>Registrarse</h3>
                <p>Ingresa los siguientes datos para realizar el registro</p>
            </div>

            <form>
                <div class="form__inputs">
                    <label for="email">Email</label>
                    <input type="email" id="email" placeholder="someone@example.com" required>
                </div>
                <div class="form__inputs">
                    <label for="password">Password</label>
                    <input type="password" id="password" required autocomplete="off">
                </div>
                <div class="form__inputs">
                    <label for="confirm-password">Confirmar Password</label>
                    <input type="password" id="confirm-password" required autocomplete="off">
                </div>
                <div id="location-fallback" class="form__inputs hidden">
                    <button>Agregar mi ubicacion manualmente</button>
                    <div class="location hidden">
                        <label for="city">Ciudad</label>
                        <input type="text" id="city" autocomplete="off">
                        <label for="address">Direccion</label>
                        <input type="text" id="address" autocomplete="off">
                    </div>
                </div>
                <button id="submit" type="submit">Acceder</button>
            </form>
        `;

		const form = section.querySelector("form");
		const submitButton = form?.querySelector("#submit") as HTMLButtonElement;
		const emailInput = form?.querySelector("#email") as HTMLInputElement;
		const passwordInput = form?.querySelector("#password") as HTMLInputElement;
		const confirmPass = form?.querySelector("#confirm-password") as HTMLInputElement;
        const cityInput = section.querySelector("#city") as HTMLInputElement;
        const addressInput = section.querySelector("#address") as HTMLInputElement;

        // Y para los contenedores visuales, seamos más específicos o directos:
        const locationDiv = section.querySelector("#location-fallback");
        const locationDivBtn = locationDiv?.querySelector("button");
        const locationInputContainer = section.querySelector(".location");

		submitButton?.setAttribute("disabled", "");
		submitButton!.style.opacity = "0.5";

		confirmPass?.addEventListener("input", (e) => {
			if (confirmPass.value === passwordInput.value) {
				submitButton?.removeAttribute("disabled");
				submitButton!.style.opacity = "1";
			} else {
				submitButton?.setAttribute("disabled", "");
				submitButton!.style.opacity = "0.5";
			}
		});

		locationDivBtn?.addEventListener("click", () => {
			locationDivBtn.style.display = "none";
			locationInputContainer?.classList.remove("hidden");
			cityInput?.setAttribute("required", "");
			addressInput?.setAttribute("required", "");
		});

		form?.addEventListener("submit", async (e) => {
			e.preventDefault();

            let lat, lng;

			try {
                // 1. ¿El usuario escribió algo manualmente?
                if (cityInput.value && addressInput.value) {
                    const position = await getPositionFromDirection(cityInput.value, addressInput.value);

                    if(position.lng && position.lat){
                        lng = position.lng;
                        lat = position.lat;
                    } else {
                        alert("No pudimos encontrar esa dirección. Intenta ser más específico.");
                        return; // 🛑 Detenemos aquí para que no intente registrarse
                    }

                } else {
                    // 2. Si no, intentamos GPS
                    const coords = await getPosition() as any;
                    lat = coords.lat;
                    lng = coords.lng;
                }

				const name = emailInput.value.split("@")[0];
                state.setState({coords: { lat, lng }})
				const response = await this.signUpUser(name, emailInput.value, passwordInput.value, lat, lng);

				if (response.error) {
					alert(
						"Ha ocurrido un error inesperado. Revisa la consola para mas detalles"
					);
					return;
				}

				// Si llegamos aquí, significa que NO hubo error y tenemos token
				if (response.token) {
					// 1. Guardamos el token en el state
					state.setState({ token: response.token });

					console.log("Token guardado. Redirigiendo...");

					// 2. Redirigimos al usuario (por ahora al home, luego al mapa)
					history.pushState({}, "", "/home");
					window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
				}
			} catch (error: any) {
				console.log(error);
				if (error.code) {
                    console.log(error.code)
                    locationDiv?.classList.remove('hidden');
				}
				return;
			}
		});

		const style = document.createElement("style");

		style.innerHTML = `
            *{
                margin: 0;    
            }

            section{
                width: 100%;
                font-family: "Poppins", sans-serif;
                max-width: 400px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
            }

            .heading__container{
                max-width: 270px;
                text-align: center;
            }

            .heading__container h3{
                font-size: 36px;
                margin: 30px 0 20px 0;
            }

            form{
                display: flex;
                flex-direction: column;
                width: 90%;
                gap: 25px;
            }

            .form__inputs{
                display: flex;
                flex-direction: column;
                align-items: flex-start;
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

            .register__message{
                color: red;
                font-weight: 600;
                margin: 0;
                text-align: center;
            }

            .hidden{
                display: none;
            }

            form button{
                margin-top: 1vh;
                padding: 16px 8px;
                width: 100%;
                background-color: #5A8FEC;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
            }

            form button:hover{
                cursor: pointer;
            }

            form a{
                text-decoration: none;
                color: #5A8FEC;
                text-align: center;
            }
        `;

		this.shadow.appendChild(section);
		this.shadow.appendChild(style);
	}
}

customElements.define("register-page", RegisterPage);