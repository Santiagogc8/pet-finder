import "./router";
import { state } from "./state";

// Creamos una funcion que se ejecuta al iniciar la aplicacion
(()=>{
    // Recupera el estado del localStorage
    const currentLocalStorage = localStorage.getItem("petFinderState");

    // Si encontro un estado
    if (currentLocalStorage) {
        const localStorageParsed = JSON.parse(currentLocalStorage);
        const dateNowAndSaved = Date.now() -localStorageParsed.savedAt;
        if(dateNowAndSaved > 21600000){
            state.setState({
                token: localStorageParsed.token,
                coords: null 
            }); // Pero aqui eliminando la propiedad savedAt y coords, la de token si la podemos dejar
        } else {
            state.setState(localStorageParsed); // Lo setea en el estado volatil
        }
    }

    return; // Y termina la funcion
})()

// Regla global: "Siempre que el estado cambie..."
state.suscribe(() => {
    // Obtiene el estado actual
	const currentState = state.getState();

    //Verifica que la propiedad token no este vacia
	if (currentState.token || currentState.coords) {
		const payload = {
            token: currentState.token,
            coords: currentState.coords,
            savedAt: Date.now()
        };
        localStorage.setItem("petFinderState", JSON.stringify(payload));
		return;
	}
});