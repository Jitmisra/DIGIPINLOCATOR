import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type RequestData = {
  latitude: number;
  longitude: number;
};

type ResponseData = {
  digipin: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ digipin: '', error: 'Method not allowed' });
  }

  try {
    const { latitude, longitude } = req.body as RequestData;

    // Validate input
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ 
        digipin: '', 
        error: 'Invalid coordinates. Latitude and longitude must be numbers.' 
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        digipin: '', 
        error: 'Invalid latitude. Must be between -90 and 90.' 
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        digipin: '', 
        error: 'Invalid longitude. Must be between -180 and 180.' 
      });
    }

    // Call the backend API
    const response = await axios.post(`${process.env.BACKEND_URL}/api/encode`, {
      latitude,
      longitude
    });

    return res.status(200).json({ digipin: response.data.digipin });
  } catch (error) {
    console.error('Error encoding coordinates:', error);
    return res.status(500).json({ 
      digipin: '', 
      error: 'Failed to encode coordinates. Please try again later.'
    });
  }
}
