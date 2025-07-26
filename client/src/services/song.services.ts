import axios from "axios";
interface apiResponse<K> {
  status: number;
  message: string;
  data: K;
}
export interface Song {
  _id: string;
  title: string;
  fileUrl?: string; // full URL to audio file
  duration: number;
}

const fetchAllSongs = async (
  limit: number = 10,
  page: number = 1
): Promise<Song[]> => {
  try {
    const response = await axios.get<apiResponse<Song[]>>("/api/v1/song", {
      params: {
        limit,
        page,
      },
    });
    if (response.data.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch songs");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

const uploadSongs = async (): Promise<void> => {};

export { fetchAllSongs, uploadSongs };
