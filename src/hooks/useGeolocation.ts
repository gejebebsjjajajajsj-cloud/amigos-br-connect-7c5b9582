import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  region: string;
  country: string;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = (): LocationData => {
  const [location, setLocation] = useState<LocationData>({
    city: '',
    region: '',
    country: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Using ipapi.co which works with HTTPS
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.city) {
          setLocation({
            city: data.city,
            region: data.region || '',
            country: data.country_name || 'Brasil',
            loading: false,
            error: null,
          });
        } else {
          // Fallback to browser geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                try {
                  const { latitude, longitude } = position.coords;
                  const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                  );
                  const geoData = await geoResponse.json();
                  setLocation({
                    city: geoData.address?.city || geoData.address?.town || geoData.address?.municipality || 'Sua cidade',
                    region: geoData.address?.state || '',
                    country: geoData.address?.country || 'Brasil',
                    loading: false,
                    error: null,
                  });
                } catch {
                  setLocation(prev => ({
                    ...prev,
                    city: 'Sua cidade',
                    loading: false,
                  }));
                }
              },
              () => {
                setLocation(prev => ({
                  ...prev,
                  city: 'Sua cidade',
                  loading: false,
                }));
              }
            );
          } else {
            setLocation(prev => ({
              ...prev,
              city: 'Sua cidade',
              loading: false,
            }));
          }
        }
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          city: 'Sua cidade',
          loading: false,
          error: null,
        }));
      }
    };

    fetchLocation();
  }, []);

  return location;
};
