
import api from '../api/api';

export const uploadKyc = async (imageFile?: File | null, videoFile?: File | null) => {
    const formData = new FormData();
    let endpoint = "";

    if (imageFile) {
        formData.append("image", imageFile);
        endpoint = "/users/upload-image";
    } else if (videoFile) {
        formData.append("video", videoFile);
        endpoint = "/users/upload-video";
    } else {
        throw new Error("No file provided");
    }

    console.log("Uploading to", endpoint);
    const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};
