import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Map as MapIcon,
} from 'lucide-react';

const HYDERABAD_AREAS = [
  { name: 'KPHB Colony', pincode: '500072' },
  { name: 'Hitec City', pincode: '500081' },
  { name: 'Madhapur', pincode: '500081' },
  { name: 'Gachibowli', pincode: '500032' },
  { name: 'Kondapur', pincode: '500084' },
  { name: 'Jubilee Hills', pincode: '500033' },
  { name: 'Banjara Hills', pincode: '500034' },
];

const GoogleLocationPicker = ({
  address,
  city,
  pincode,
  onLocationSelect,
  className = '',
}) => {
  const [locating, setLocating] = useState(false);
  const [geoCoords, setGeoCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [showMap, setShowMap] = useState(true);

  // Handle GPS Auto-detect via Browser Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported on your browser.');
      return;
    }

    setLocating(true);
    setLocationStatus('Getting GPS satellite location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGeoCoords({ lat, lng });

        try {
          // Reverse geocoding to get human-readable street, area, city, and pincode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );
          const data = await res.json();

          if (data && data.address) {
            const addr = data.address;
            const streetParts = [
              addr.house_number,
              addr.building,
              addr.road,
              addr.suburb || addr.neighbourhood || addr.residential,
            ].filter(Boolean);

            const detectedStreet = streetParts.length > 0 ? streetParts.join(', ') : data.display_name.split(',').slice(0, 3).join(',');
            const detectedCity = addr.city || addr.town || addr.county || addr.state_district || 'Hyderabad';
            const detectedPincode = addr.postcode || '500081';

            onLocationSelect({
              address: detectedStreet,
              city: detectedCity,
              pincode: detectedPincode,
              lat,
              lng,
            });

            setLocationStatus(`GPS Location Found: ${detectedStreet}`);
          } else {
            // Fallback with coordinates
            onLocationSelect({
              address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              city: city || 'Hyderabad',
              pincode: pincode || '500081',
              lat,
              lng,
            });
            setLocationStatus('GPS Coordinates detected successfully');
          }
        } catch (err) {
          // Fallback if reverse geocode fails
          onLocationSelect({
            address: `GPS Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            city: city || 'Hyderabad',
            pincode: pincode || '500081',
            lat,
            lng,
          });
          setLocationStatus('GPS location acquired');
        } finally {
          setLocating(false);
          setShowMap(true);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocationStatus('Location access was denied. Please allow location permissions in your phone browser settings.');
        } else {
          setLocationStatus('Unable to determine location. Please select an area below or type your address.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const handleQuickArea = (area) => {
    onLocationSelect({
      address: address ? `${address.split(',')[0]}, ${area.name}` : `${area.name}`,
      city: 'Hyderabad',
      pincode: area.pincode,
      lat: null,
      lng: null,
    });
    setLocationStatus(`Set to ${area.name}`);
    setShowMap(true);
  };

  // Construct Google Maps embed query
  const mapQuery = geoCoords
    ? `${geoCoords.lat},${geoCoords.lng}`
    : encodeURIComponent(`${address || 'KPHB Colony'}, ${city || 'Hyderabad'}, ${pincode || '500072'}`);

  const googleMapsExternalUrl = geoCoords
    ? `https://www.google.com/maps/search/?api=1&query=${geoCoords.lat},${geoCoords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address || 'Hyderabad'}, ${city || 'Hyderabad'}`)}`;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* GPS Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-2xl border border-orange-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Navigation size={16} className={locating ? 'animate-spin' : ''} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <span>Google Maps & GPS Location</span>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded-md font-semibold">
                Live
              </span>
            </h4>
            <p className="text-[10px] text-slate-500">
              Pin exact home delivery location for fast delivery
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          {locating ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation size={13} />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Status Notice */}
      {locationStatus && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            {locationStatus.includes('Found') || locationStatus.includes('Set') || locationStatus.includes('acquired') ? (
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={13} className="text-amber-600 shrink-0" />
            )}
            <span className="truncate">{locationStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-orange-600 font-bold text-[10px] hover:underline shrink-0"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      )}

      {/* Quick Area Pills for Fast Selection */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Popular Delivery Hubs (Hyderabad)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {HYDERABAD_AREAS.map((area) => (
            <button
              key={area.name}
              type="button"
              onClick={() => handleQuickArea(area)}
              className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-semibold transition-all active:scale-95 shadow-xs"
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Google Maps Preview */}
      {showMap && (
        <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 relative group">
          <div className="h-44 sm:h-48 w-full">
            <iframe
              title="Google Location Delivery Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>

          {/* Overlay Map Badge & Google Maps Link */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-100 text-[10px] font-bold text-slate-800 flex items-center gap-1.5 pointer-events-auto">
              <MapPin size={12} className="text-orange-600 fill-orange-600" />
              <span>{geoCoords ? 'GPS Pinpoint Verified' : address || 'Hyderabad'}</span>
            </div>

            <a
              href={googleMapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-xl shadow-md border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all pointer-events-auto hover:text-orange-600"
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleLocationPicker;
