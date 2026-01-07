import { createContext, useContext, useState } from 'react';

// context.tsx
const RoomContext = createContext(null);

export const useRoomNameContext = () => {
  const ctx = useContext(RoomContext);
  if (!ctx)
    throw new Error('useRoomNameContext must be used within RoomNameProvider');
  return ctx;
};

export const RoomNameProvider = ({ children }) => {
  const [nameOfTheRoom, setNameOfTheRoom] = useState(null);
  const clearRoomName = () => setNameOfTheRoom(null);

  return (
    <RoomContext.Provider
      value={{ nameOfTheRoom, setNameOfTheRoom, clearRoomName }}
    >
      {children}
    </RoomContext.Provider>
  );
};
