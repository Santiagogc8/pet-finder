class HomePage extends HTMLElement{
    shadow: ShadowRoot;
    constructor(){
        super();
        this.shadow = this.attachShadow({mode: "open"});
    }

    connectedCallback() {
		this.render(); // Y hacemos el render
	}

    render(){
        const section = document.createElement('section');

        section.innerHTML = `
            <img src="https://res.cloudinary.com/drvtfag9j/image/upload/v1764301870/undraw_login_re_4vu2_1_podrdu.png" alt="login-img">

            <div class="email__data">
                <h3>Ingresar</h3>
                <p>Ingresa tu email para continuar</p>

                <form>
                    <div>
                        <label for="email" for="email">Email</label>
                        <input id="email" placeholder="someone@example.com">
                    </div>

                    <button>Siguiente</button>
                </form>

                <p>Aun no tienes cuenta?</p>
                <a>Registrate</a>
            </div>
        `

        const style = document.createElement('style');

        style.innerHTML = `
            section{
                font-family: "Poppins", sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('home-page', HomePage);