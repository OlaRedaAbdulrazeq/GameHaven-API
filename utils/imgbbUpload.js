import axios from 'axios';

export const uploadToImgbb = async (buffer) => {
  const base64 = buffer.toString('base64');
  const apiKey = process.env.IMGBB_API_KEY;

  const response = await axios.post('https://api.imgbb.com/1/upload', null, {
    params: {
      key: apiKey,
      image: base64,
    },
  });

  return response.data.data.url;
};
