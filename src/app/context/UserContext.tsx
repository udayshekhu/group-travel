import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  currentUser: string;
  setCurrentUser: (user: string) => void;
  availableUsers: string[];
  addUser: (user: string) => void;
  removeUser: (user: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<string>('Jordan');
  const [availableUsers, setAvailableUsers] = useState<string[]>(['Jordan', 'Sam', 'Alex', 'Taylor']);

  useEffect(() => {
    // Load available users from localStorage
    const storedUsers = localStorage.getItem('availableUsers');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      setAvailableUsers(users);
      
      // Load current user
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser && users.includes(storedUser)) {
        setCurrentUserState(storedUser);
      } else {
        // Default to first user
        setCurrentUserState(users[0]);
        localStorage.setItem('currentUser', users[0]);
      }
    } else {
      // Initialize with default users
      localStorage.setItem('availableUsers', JSON.stringify(['Jordan', 'Sam', 'Alex', 'Taylor']));
      localStorage.setItem('currentUser', 'Jordan');
    }
  }, []);

  const setCurrentUser = (user: string) => {
    setCurrentUserState(user);
    localStorage.setItem('currentUser', user);
  };

  const addUser = (user: string) => {
    const updatedUsers = [...availableUsers, user];
    setAvailableUsers(updatedUsers);
    localStorage.setItem('availableUsers', JSON.stringify(updatedUsers));
    
    // Also update the trip members if there's a current trip
    const storedTrips = localStorage.getItem('trips');
    const currentTripId = localStorage.getItem('currentTripId');
    if (storedTrips && currentTripId) {
      const trips = JSON.parse(storedTrips);
      const updatedTrips = trips.map((trip: any) => {
        if (trip.id === currentTripId && !trip.members.includes(user)) {
          return { ...trip, members: [...trip.members, user] };
        }
        return trip;
      });
      localStorage.setItem('trips', JSON.stringify(updatedTrips));
    }
  };

  const removeUser = (user: string) => {
    // Don't remove if it's the only user
    if (availableUsers.length <= 1) return;
    
    // Don't remove the current user
    if (user === currentUser) return;
    
    const updatedUsers = availableUsers.filter(u => u !== user);
    setAvailableUsers(updatedUsers);
    localStorage.setItem('availableUsers', JSON.stringify(updatedUsers));
    
    // Also update the trip members if there's a current trip
    const storedTrips = localStorage.getItem('trips');
    const currentTripId = localStorage.getItem('currentTripId');
    if (storedTrips && currentTripId) {
      const trips = JSON.parse(storedTrips);
      const updatedTrips = trips.map((trip: any) => {
        if (trip.id === currentTripId) {
          return { ...trip, members: trip.members.filter((m: string) => m !== user) };
        }
        return trip;
      });
      localStorage.setItem('trips', JSON.stringify(updatedTrips));
    }
    
    // Remove user from place likes
    const storedLikes = localStorage.getItem('placeLikes');
    if (storedLikes) {
      const placeLikes = JSON.parse(storedLikes);
      const updatedLikes: Record<number, string[]> = {};
      
      Object.keys(placeLikes).forEach(placeId => {
        const likes = placeLikes[parseInt(placeId)] as string[];
        updatedLikes[parseInt(placeId)] = likes.filter(id => id !== user);
      });
      
      localStorage.setItem('placeLikes', JSON.stringify(updatedLikes));
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, availableUsers, addUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}