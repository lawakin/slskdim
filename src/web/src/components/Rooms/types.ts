export type RoomMessage = {
  message: string;
  self: boolean;
  timestamp: string;
  username: string;
};

export type RoomUser = {
  countryCode: string | null;
  self: boolean;
  status: string;
  username: string;
};
