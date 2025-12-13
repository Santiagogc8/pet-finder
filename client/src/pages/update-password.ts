import { state, API_BASE_URL } from "../state";

class UpdatePassword extends HTMLElement {
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        const currentState = state.getState();

        if(currentState.token){
            this.render();
        } else {
            history.pushState({}, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
        }
    }

    async updatePassword(newPassword: string, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/me/auth`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`
                },
                body: JSON.stringify({password: newPassword})
            });

            const data = await response.json();

            if(response.ok){
                return true;
            } else{
                console.error(data.error);
                return false;
            }
        } catch(error){
            console.error(error);
            return false;
        }
    }

    render(){
        const currentState = state.getState();

        const section = document.createElement('section');
        section.innerHTML = `
            <h4>Contraseña</h4>
            <form id="password-form">
                <div class="form__inputs">
                    <label for="password">Nueva contraseña</label>
                    <input id="password" type="password" autocomplete="off" required>
                </div>
                <div class="form__inputs">
                    <label for="confirm-password">Repetir contraseña</label>
                    <input id="confirm-password" type="password" autocomplete="off" required>
                </div>
                <div id="error-message" class="error hidden">Las contraseñas no coinciden</div>
                
                <button type="submit">Guardar</button>
            </form>
        `

        const form = section.querySelector("#password-form");
        const passwordInput = section.querySelector("#password") as HTMLInputElement;
        const confirmInput = section.querySelector("#confirm-password") as HTMLInputElement;
        const errorMsg = section.querySelector("#error-message");

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorMsg?.classList.add("hidden");

            // Validacion de contraseñas iguales
            if (passwordInput.value !== confirmInput.value) {
                errorMsg?.classList.remove("hidden");
                return;
            }

            // Enviar al Backend
            const success = await this.updatePassword(passwordInput.value, currentState.token);

            if (success) {
                alert("Contraseña actualizada correctamente 🔐");
                history.pushState({}, "", "/me");
                window.dispatchEvent(new PopStateEvent("popstate"));
            } else {
                alert("Error al actualizar la contraseña.");
            }
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
                max-width: 400px;
            }

            section h4{ 
                font-size: 36px; 
                margin: 50px 0; 
                text-align: center;
            }

            form{ 
                width: 100%; 
                display: flex; 
                flex-direction: 
                column; 
                gap: 20px; 
            }
            
            .form__inputs{
                display: flex; 
                flex-direction: column; 
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
            
            button{ 
                padding: 16px; 
                background-color: #5A8FEC; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                font-weight: bold; 
                cursor: pointer; 
            }
            
            .error{
                color: red; 
                font-size: 12px; 
                text-align: center; 
            }
            
            .hidden{
                display: none; 
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('update-password', UpdatePassword);