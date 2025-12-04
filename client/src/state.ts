// Creamos nuestro estado
const state = {
	data: {
		// Guardamos la data del estado en data
		auth: "" as string,
		me: "" as string,
		pets: [
			{
            "name": "Rocky",
            "lost": true,
            "lat": 4.655,
            "lng": -74.095,
            "imgUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "_geoloc": {
                "lat": 4.655,
                "lng": -74.095
            },
            "objectID": "rocky_manual_test",
            "_highlightResult": {
                "name": {
                    "value": "Rocky",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "lat": {
                    "value": "4.655",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "lng": {
                    "value": "-74.095",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "imgUrl": {
                    "value": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "_geoloc": {
                    "lat": {
                        "value": "4.655",
                        "matchLevel": "none",
                        "matchedWords": []
                    },
                    "lng": {
                        "value": "-74.095",
                        "matchLevel": "none",
                        "matchedWords": []
                    }
                }
            }
        },
        {
            "name": "Luna",
            "lost": true,
            "lat": 4.71,
            "lng": -74.07,
            "imgUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "_geoloc": {
                "lat": 4.71,
                "lng": -74.07
            },
            "objectID": "luna_manual_test",
            "_highlightResult": {
                "name": {
                    "value": "Luna",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "lat": {
                    "value": "4.71",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "lng": {
                    "value": "-74.07",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "imgUrl": {
                    "value": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                "_geoloc": {
                    "lat": {
                        "value": "4.71",
                        "matchLevel": "none",
                        "matchedWords": []
                    },
                    "lng": {
                        "value": "-74.07",
                        "matchLevel": "none",
                        "matchedWords": []
                    }
                }
            }
        }
		] as any,
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
