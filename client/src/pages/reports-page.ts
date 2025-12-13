import { state, API_BASE_URL } from "../state";
import { getLocationFromCoords } from "../lib/location";

class ReportPage extends HTMLElement {
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        const currentState = state.getState();

        if(currentState.token){
            state.suscribe(()=> {
                this.render();
            });
            this.getReports(currentState.token);
        } else {
            history.pushState({}, "", "/");
			window.dispatchEvent(new PopStateEvent("popstate")); // Le decimos a la ventana que la ruta cambio
        }
    }

    async getReports(token: string){
        const currentState = state.getState();

        state.setState({
            reportsFetching: {
                ...currentState.reportsFetching, // Copiamos lo que había (para no borrar pets o error)
                isLoading: true,
                error: null
            }
        });

        try{
            const response = await fetch(`${API_BASE_URL}/my-pets`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${token}`
                }
            });
            const data = await response.json();

            const reportsWithLocation = await Promise.all(
                data.map(async (report: any) => {
                    const textLocation = await getLocationFromCoords(report.lng, report.lat);

                    return {
                        ...report, // Copia name, imgUrl, _geoloc, id, etc. automáticamente
                        textLocation // Agrega la propiedad nueva
                    }
                })
            )

            return state.setState({
                reportsFetching: {
                    reports: reportsWithLocation,
                    isLoading: false
                }
            });
        } catch(error){
            // 3. ¡Ups! Avisamos del error
            state.setState({ 
                petsFetching: {
                    error: "No pudimos conectar con el servidor", 
                    isLoading: false 
                }
            });
        }
    }

    render(){
        this.shadow.innerHTML = '';

        const section = document.createElement('section');
        section.innerHTML = `
            <h4>Mascotas reportadas</h4>
        `;

        const reportsCardContainer = document.createElement('div');
        reportsCardContainer.classList.add('reports-card__container');

        section.appendChild(reportsCardContainer);
        const currentState = state.getState();
        const { reports, isLoading, error } = currentState.reportsFetching;

        if (isLoading) {
            section.innerHTML = `<h3>Cargando tus reportes... 🐶⏳</h3>`;
            
            const style = document.createElement('style');

            style.innerHTML = `
                section{
                    font-family: "Poppins", sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 90%;
                    margin: 0 auto;
                }

                section h3{
                    font-size: 24px;
                    text-align: center;
                }
            `

            this.shadow.appendChild(section);
            this.shadow.appendChild(style);
            return; // Detenemos aquí para no pintar nada más
        }

        if(error){
            section.querySelector('h3')!.innerText = `${error}`;
        } else if (reports.length === 0) {
            // Caso vacío
            section.innerHTML = `
                <h3>No has hecho ningun reporte 🤷‍♂️</h3>
                <a href="/new-report">Haz un reporte</a>
            `
        } else {
            reports.map((report: any) => {
                const card = document.createElement('div');
                card.classList.add('report-card');

                card.innerHTML = `
                    <img src="https://voca-land.sgp1.cdn.digitaloceanspaces.com/43844/1654148724932/a782407639e0a9fa0e1509391a3feb39414681de6795983c8e0d7c13670aa6f6.jpg">
                    <div class="report-card__info">
                        <h3>${report.name}</h3>
                        <p>${report.textLocation}</p>
                        <a href="/edit-report?id=${report.id}" id="edit-btn">Editar </a>
                    </div>
                `

                const reportBtn = card.querySelector('#edit-btn');

                reportsCardContainer.appendChild(card);
            });
        }

        const style = document.createElement('style');
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

            .reports-card__container{
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2rem;
                flex-wrap: wrap;
                margin-bottom: 50px;
            }

            .report-card{
                background-color: #26302E;
                color: white;
                border-radius: 10px;
                padding: 8px;
                width: 100%;
                box-sizing: border-box;
                max-width: 350px;
            }

            .report-card img{
                width: 100%;
                height: 136px;
                object-fit: cover;
                border-radius: 3px;
            }

            .report-card__info{
                display: grid;
                align-items: center;
                grid-template-columns: 60% 40%;
                grid-template-rows: 50% 50%;
            }

            .report-card__info *{
                margin: 0;
            }

            .report-card__info h3{
                font-size: 36px;
                margin-left: 8px;
                text-transform: capitalize;
            }

            .report-card__info p{
                grid-colum: 1;
                grid-row: 2;
                margin-left: 8px;
            }

            #edit-btn{
                grid-column: 2;
                grid-row: span 2;
                justify-self: center;
                background-color: #5A8FEC;
                padding: 10px 15px;
                text-decoration: none;
                color: white;
                border-radius: 4px;
                border: none;
                font-family: "Poppins", sans-serif;
            }

            #edit-btn::after{
                content: url(https://res.cloudinary.com/drvtfag9j/image/upload/v1765490705/Mode_edit_dcor8p.png);
                display: inline-block;
                height: 20px;
                vertical-align: bottom;
            }

            #edit-btn:hover{
                cursor: pointer;
            }
        `

        this.shadow.appendChild(section);
        this.shadow.appendChild(style);
    }
}

customElements.define('report-page', ReportPage);