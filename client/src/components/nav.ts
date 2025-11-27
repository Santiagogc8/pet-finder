export class NavBar extends HTMLElement {
	shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.render(); // Y hacemos el render
	}

	render() {
		const nav = document.createElement("nav");

		nav.innerHTML = `
            <a href="/" class="logo">
                <img src="https://res.cloudinary.com/drvtfag9j/image/upload/v1764215253/image_8_uv2crp.png">
            </a>

            <div class="burger-menu">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#fffclip0_429_11066)"> <path d="M3 6.00092H21M3 12.0009H21M3 18.0009H21" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_429_11066"> <rect width="24" height="24" fill="white" transform="translate(0 0.000915527)"></rect> </clipPath> </defs> </g></svg>
            </div>

            <div class="menu">
                <div>
                    <a>Mis datos</a>
                    <a>Mis mascotas reportadas</a>
                    <a>Reportar mascotas</a>
                </div>

                <p>User email</p>
                <a>Cerrar sesion</a>
            </div>
        `;

		const burgerMenu = nav.querySelector(".burger-menu");

		burgerMenu?.addEventListener("click", () => {

        });

		const style = document.createElement("style");

		style.innerHTML = `
            nav{
                background-color: #26302E;
                padding: 8px 16px;
                border-radius: 0 0 10px 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: 'Poppins', sans-serif;
            }

            .logo{
                width: 40px;
            }

            .burger-menu{
                width: 24px;
            }

            .burger-menu:hover{
                cursor: pointer;
            }

            .menu{
                position: fixed;
                background-color: #26302E;
                right: 0;
                top: 0;
                bottom: 0;
                max-width: 375px;
                color: #fff;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 20;
            }

            .menu::before{
                content: '';
                position: fixed;
                inset: 0;
                z-index: -1;
                background-color: rgba(0, 0, 0, 0.5);
            }
        `;

		this.shadow.appendChild(nav);
		this.shadow.appendChild(style);
	}
}

customElements.define("nav-bar", NavBar);