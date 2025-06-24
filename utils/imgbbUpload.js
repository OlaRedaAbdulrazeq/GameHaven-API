import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

export const uploadToImgbb = async (buffer) => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('Missing IMGBB_API_KEY in environment variables');
  }
  const base64 = buffer.toString('base64');

  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', base64);

  try {
    const response = await axios.post(
      'https://api.imgbb.com/1/upload',
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return response.data.data.url;
  } catch (error) {
    console.error('Image upload failed:', error.message);
    throw new Error('Image upload failed');
  }
};
