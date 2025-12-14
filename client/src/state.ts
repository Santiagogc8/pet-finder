const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Creamos nuestro estado
const state = {
	data: {
		// Guardamos la data del estado en data
		auth: "" as string,
		me: { } as any,
		petsFetching: {
            pets: [] as any,
            isLoading: null,
            error: null
        },
		reportsFetching: {
			reports: [] as any,
			isLoading: null,
			error: null
		},
		token: null as any,
		coords: null as any
	},
	listeners: [] as any[], // Guarda el array de callbacks (listeners)
	getState() {
		// Devuelve el estado actual
		return this.data;
	},
	setState(newState: any) {
		// Crea un nuevo estado
		this.data = {
			// Guarda en la data
			...this.data, // La data actual
			...newState, // Y agrega la nueva data
		};

		// Por cada callback del array de listeners
		for (const callback of this.listeners) {
			callback(this.data); // Ejecuta el callback con la data
		}
	},
	suscribe(callback: (arg: any) => any) {
		// Creamos nuestro metodo suscribe
		this.listeners.push(callback); // Pushea en listeners el callback recibido

		return () => {
			// Y retorna una funcion
			// Que filtra los listeners para que guarde solo los que son diferentes al callback recibido (unsuscribe)
			this.listeners = this.listeners.filter(
				(listener) => listener !== callback
			);
		};
	}
};

export { state, API_BASE_URL };