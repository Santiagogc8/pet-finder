import { API_BASE_URL } from "../state";

class ResetPasswordPage extends HTMLElement{
    shadow: ShadowRoot;
    urlId: string = "";

    constructor(){
        super();
        this.shadow = this.attachShadow({ "mode": "open" });
    }

    connectedCallback(){
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");

        if(id){
            this.urlId = id;
        }

        this.render();
    }

    async sendResetRequest(email: string){
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email})
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

    async resetPassword(token: string, newPassword: string){
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset?id=${token}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({newPassword})
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

    render(){
        const section = document.createElement('section');

        if(this.urlId){
            section.innerHTML = `
                <h4>Reestablece tu contraseña</h4>
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
                const success = await this.resetPassword(this.urlId, passwordInput.value);

                if (success) {
                    alert("Contraseña actualizada correctamente 🔐");
                    history.pushState({}, "", "/login");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                } else {
                    alert("Error al resetear la contraseña.");
                }
            });
        } else{
            section.innerHTML = `
                <h4>Ingresa tu email</h4>
                <form id="email-form">
                    <div class="form__inputs">
                        <label for="password">Tu email</label>
                        <input id="email" type="email" autocomplete="off" required>
                    </div>
                    
                    <button type="submit">Guardar</button>
                </form>
            `

            const form = section.querySelector("#email-form");
            const emailInput = section.querySelector("#email") as HTMLInputElement;

            form?.addEventListener("submit", async (e) => {
                e.preventDefault();

                // Enviar al Backend
                const success = await this.sendResetRequest(emailInput.value);

                if (success) {
                    alert("Hemos enviado un correo para que reestablezcas la contraseña");
                } else {
                    alert("Error al enviar el correo");
                }
            });
        }

        const style = document.createElement("style");

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

customElements.define('reset-password', ResetPasswordPage);