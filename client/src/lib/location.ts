async function getPositionFromDirection(city: string, address: string) {
	const fullAddress = city + " " + address;
	const addressEncoded = encodeURIComponent(fullAddress);

	const response = await fetch(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${addressEncoded}.json?access_token=pk.eyJ1Ijoic2FudGlhZ29ndXptYW44IiwiYSI6ImNtaHY0NnoxODA2czAybHB1dzl5dDN2aTEifQ.-kyc4EgAzGHoYDtRirsqdQ`
	);

	const data = await response.json();
	const geometry = data.features[0].geometry;

	return {
		lng: geometry.coordinates[0],
		lat: geometry.coordinates[1],
	};
}

async function getLocationFromCoords(lng: number, lat: number) {
	const response = await fetch(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1Ijoic2FudGlhZ29ndXptYW44IiwiYSI6ImNtaHY0NnoxODA2czAybHB1dzl5dDN2aTEifQ.-kyc4EgAzGHoYDtRirsqdQ`
	);

	const data = await response.json();
	const tiposAceptados = ['neighborhood', 'locality', 'place'];

	// 2. Buscamos en el array de features
	const miLugar = data.features.find((feature: any) => {
		// ¿El place_type de este feature está incluido en mi lista de aceptados?
		const filter = feature.place_type.some((type: any) => tiposAceptados.includes(type));
		return filter; 
	});

	return miLugar ? miLugar.place_name : "Ubicación desconocida";
}

async function getLocationFromQuery(query: string) {
	const response = await fetch(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=pk.eyJ1Ijoic2FudGlhZ29ndXptYW44IiwiYSI6ImNtaHY0NnoxODA2czAybHB1dzl5dDN2aTEifQ.-kyc4EgAzGHoYDtRirsqdQ&limit=10`
	);

	const data = await response.json();
	return data.features;
}

function getPosition() {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
			},
			(error) => {
				reject(error); // Si sale mal (o el usuario dice NO)
			}
		);
	});
}

export { getPositionFromDirection, getPosition, getLocationFromCoords, getLocationFromQuery };