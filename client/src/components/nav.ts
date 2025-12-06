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
		const header = document.createElement("header");

		header.innerHTML = `
            <a href="/" class="logo">
                <img src="https://res.cloudinary.com/drvtfag9j/image/upload/v1764215253/image_8_uv2crp.png">
            </a>

            <div class="burger-menu">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#fffclip0_429_11066)"> <path d="M3 6.00092H21M3 12.0009H21M3 18.0009H21" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_429_11066"> <rect width="24" height="24" fill="white" transform="translate(0 0.000915527)"></rect> </clipPath> </defs> </g></svg>
            </div>

            <div class="menu hidden">
                <a class="menu__close">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="#fff"></path></g></svg>
                </a>

                <div class="menu__links-container">
                    <a href="/me">Mis datos</a>
                    <a>Mis mascotas reportadas</a>
                    <a>Reportar mascotas</a>
                </div>

                <p>User email</p>
                <a>Cerrar sesion</a>
            </div>
        `;

		const burgerMenu = header.querySelector(".burger-menu");
        const menu = header.querySelector('.menu');
        const closeMenu = header.querySelector('.menu__close')

		burgerMenu?.addEventListener("click", () => {
            menu?.classList.remove('hidden');
        });

        menu?.addEventListener("click", (e) => {
            // Si el objetivo del clic es el contenedor .menu y no sus hijos...
            if (e.target === menu) { 
                menu.classList.add('hidden');
            }
        });

        closeMenu?.addEventListener("click", () => {
            menu?.classList.add('hidden')
        })

		const style = document.createElement("style");

		style.innerHTML = `
            header{
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
                width: 100%;
                max-width: 375px;
                color: #fff;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 20;
                padding: 25px;
                box-sizing: border-box;
                transition: transform 0.3s ease;
            }

            .menu.hidden {
                transform: translateX(100%);
            }

            .menu::before{
                content: '';
                position: fixed;
                inset: 0;
                z-index: -1;
                background-color: rgba(0, 0, 0, 0.5);
                width: 100%;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }

            .menu a:hover{
                cursor: pointer;
            }

            .menu__close{
                display: flex;
                width: 100%;
                justify-content: flex-end;
            }

            .menu__close svg{
                width: 30px;
            }

            .menu__links-container{
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 100%;
                gap: 80px;
                font-weight: 700;
            }

            .menu__links-container a{
                color: white;
                text-decoration: none;
            }

            .menu:not(.hidden)::before {
                opacity: 1;
                pointer-events: all;
                left: -100vw;
                width: 200vw;
            }
        `;

		this.shadow.appendChild(header);
		this.shadow.appendChild(style);
	}
}

customElements.define("nav-bar", NavBar);