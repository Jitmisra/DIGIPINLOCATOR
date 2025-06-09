import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type RequestData = {
  digipin: string;
};

type ResponseData = {
  latitude?: number;
  longitude?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { digipin } = req.body as RequestData;

    // Validate input
    if (!digipin || typeof digipin !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid DIGIPIN. DIGIPIN must be a string.' 
      });
    }

    // Basic format validation (assuming 10-character alphanumeric)
    if (!/^[A-Za-z0-9]{10}$/.test(digipin.trim())) {
      return res.status(400).json({ 
        error: 'Invalid DIGIPIN format. It should be a 10-character alphanumeric code.' 
      });
    }

    // Call the backend API
    const response = await axios.post(`${process.env.BACKEND_URL}/api/decode`, {
      digipin: digipin.trim()
    });

    return res.status(200).json({ 
      latitude: response.data.latitude,
      longitude: response.data.longitude
    });
  } catch (error) {
    console.error('Error decoding DIGIPIN:', error);
    return res.status(500).json({ 
      error: 'Failed to decode DIGIPIN. Please ensure it is correct and try again.'
    });
  }
}
