// src/utils/locationTracker.ts
import socket from '../socket';
import { store } from '../redux/store';
import { stopTracking } from '../redux/slices/locationSlice';

let watchId: number | null = null;

export const startLiveLocation = (userId: string) => {
  if (!navigator.geolocation || watchId !== null) return;

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit('userLocationUpdate', { userId, latitude, longitude });
    },
    (err) => console.error('Tracking error:', err),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );

  console.log('Live location tracking started');
};

export const stopLiveLocation = () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    console.log('Live location tracking stopped');
    store.dispatch(stopTracking());
  }
};
