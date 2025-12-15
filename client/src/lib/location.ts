const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2FudGlhZ29ndXptYW44IiwiYSI6ImNtaHY0NnoxODA2czAybHB1dzl5dDN2aTEifQ.-kyc4EgAzGHoYDtRirsqdQ";

async function getPositionFromDirection(city: string, address: string) {
	const fullAddress = city + " " + address;
	const addressEncoded = encodeURIComponent(fullAddress);

	const response = await fetch(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${addressEncoded}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
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
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
	);

	const data = await response.json();
	
	const neighborhood = data.features.find((f: any) => f.place_type.includes('neighborhood'));
    const locality = data.features.find((f: any) => f.place_type.includes('locality') || f.place_type.includes('place'));
    const region = data.features.find((f: any) => f.place_type.includes('region'));
    const country = data.features.find((f: any) => f.place_type.includes('country'));

    // Construimos la cadena según lo que encontramos
    if (neighborhood && locality) {
        // Opción A: Barrio, Ciudad
        return `${neighborhood.text}, ${locality.text}`;
    } else if (locality && region) {
        // Opción B: Ciudad, Estado/Provincia (si no hay barrio)
        return `${locality.text}, ${region.text}`;
    } else if (locality && country) {
         // Opción C: Ciudad, País
        return `${locality.text}, ${country.text}`;
    } else {
        // Fallback: Lo mejor que tengamos o desconocido
        return locality ? locality.text : "Ubicación desconocida";
    }
}

async function getLocationFromQuery(query: string) {
	const response = await fetch(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=10`
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