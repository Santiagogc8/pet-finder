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
		token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzY0OTA3ODQ2fQ.FBd8kLDp8THfPLScGHPpliNqS8TYlhQmSFBW2wbOGRs" as any,
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