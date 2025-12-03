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

export { getPositionFromDirection, getPosition };