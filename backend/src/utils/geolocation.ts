import axios from "axios";
import { HttpError } from "./http.error";

export const fetchAddressFromCoordinates = async (
  lng: number,
  lat: number
): Promise<string> => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat,
          lon: lng,
          format: "json",
        },
        headers: {
          "User-Agent": "YourAppName/1.0 (your@email.com)",
        },
      }
    );

    if (!response.data?.display_name) {
      throw new HttpError(404, "No address found.");
    }

    return response.data.display_name;
  } catch (error) {
    console.error("Error calling OpenStreetMap:", error);
    throw new HttpError(404, "Unable to fetch address from coordinates.");
  }
};
