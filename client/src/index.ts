import "./router";
import { state } from "./state";

// Creamos una funcion que se ejecuta al iniciar la aplicacion
(()=>{
    // Recupera el estado del localStorage
    const currentLocalStorage = localStorage.getItem("state");

    // Si encontro un estado
    if (currentLocalStorage) {
        state.setState(JSON.parse(currentLocalStorage)); // Lo setea en el estado volatil
    }

    return; // Y termina la funcion
})()

// Regla global: "Siempre que el estado cambie..."
state.suscribe(() => {
    // Obtiene el estado actual
	const currentState = state.getState();

    //Verifica que la propiedad token no este vacia
	if (currentState.token) {
		localStorage.setItem( // Y setea el token en el localStorage
			"state",
			JSON.stringify({ token: currentState.token })
		);
		return;
	}
});