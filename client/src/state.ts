// Creamos nuestro estado
const state = {
	data: {
		// Guardamos la data del estado en data
		auth: "" as string,
		me: {
			id: 1,
			name: "santiago",
			email: "guzmansantiago833@gmail.com",
			lat: 3.14,
			lng: 3.14,
			createdAt: "2025-12-05T04:10:45.847Z",
			updatedAt: "2025-12-05T04:10:45.847Z"
		} as any,
		petsFetching: {
            pets: [] as any,
            isLoading: null,
            error: null
        },
		token: null as any,
		coords: {
			lat: 4.65,
			lng: -74.09
		}
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

export { state };