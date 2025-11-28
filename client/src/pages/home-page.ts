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
                    <div class="form__inputs">
                        <label for="email" for="email">Email</label>
                        <input id="email" placeholder="someone@example.com">
                    </div>

                    <button>Siguiente</button>
                </form>

                <p>¿Aun no tienes cuenta? <a href="#">Registrate</a></p>
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

            section img{
                margin: 50px 0;
            }

            .email__data{
                text-align: center;
                width: 90%;
                max-width: 400px;
                box-sizing: border-box;
            }

            .email__data h3{
                font-size: clamp(36px, 3vw, 80px);
                margin: 0;
            }

            .email__data > p:first-of-type{
                margin: 30px 0;
            }

            .email__data form{
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            form > div{
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

            .form__inputs input:hover{
                outline: none;
                box-shadow: 0 2px 2px #00000040;
            }

            form button{
                padding: 16px 8px;
                width: 100%;
                background-color: #5A8FEC;
                color: white;
                border: none;
                border-radius: 4px;
            }

            .email__data a{
                text-decoration: none;
                color: #5A8FEC;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('home-page', HomePage);