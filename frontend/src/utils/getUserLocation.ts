import { fetchUserLocationAddress } from "../services/apis/userApis";

export const getUserLocation = async (): Promise<{
  location: {
    type: "Point";
    coordinates: [number, number];
    address: string;
  };
}> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetchUserLocationAddress(latitude, longitude);
          const address = response.data;
          resolve({
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
              address: address
            },
          });
        } catch (err) {
          reject(err);
        }
      },
      (error) => reject(error)
    );
  });
};
