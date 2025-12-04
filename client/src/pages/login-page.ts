// Pagina de LogIn
class LogInPage extends HTMLElement {
	shadow: ShadowRoot;
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" }); // Inicializamos el shadow
	}

	connectedCallback() {
		this.render(); // Renderizamos el componente
	}

	async logInUser(email: string, password: string) {
		const res = await fetch("http://localhost:3000/" + "auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

        const data = await res.json();

        return data;
	}

	render() {
		const section = document.createElement("section");

		section.innerHTML = `
            <div class="heading__container">
                <h3>Iniciar Sesión</h3>
                <p>Ingresa los siguientes datos para iniciar sesión</p>
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
                <p class="login__message hidden">Contraseña incorrecta</p>
                <a href="#">Olvidé mi contraseña</a>
                <button>Acceder</button>
            </form>
        `;

        const form = section.querySelector('form');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('#email') as HTMLInputElement;
            const passwordInput = form.querySelector('#password') as HTMLInputElement;

            const response = await this.logInUser(emailInput.value, passwordInput.value);
            const token = response.token;

            if(response.error){
                alert('Ha ocurrido un error inesperado. Revisa la consola para mas detalles')
            }
            
            if(token.error){
                form.querySelector('.login__message')?.classList.remove('hidden')
            } else{
                console.log('Hola, bienvenido')
                console.log(token)
            }
        })

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
                gap: 7rem;
            }

            .heading__container{
                max-width: 270px;
                text-align: center;
            }

            .heading__container h3{
                font-size: 36px;
                margin: 50px 0 20px 0;
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

            .login__message{
                color: red;
                font-weight: 600;
                margin: 0;
                text-align: center;
            }

            .hidden{
                display: none;
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

customElements.define("login-page", LogInPage);