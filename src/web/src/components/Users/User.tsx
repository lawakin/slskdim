import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
} from '../ui/item';
import { Camera, Check, Circle, X } from 'lucide-react';

const ImagePlaceholder = () => (
  <div className="users-picture-placeholder ui small image">
    <Camera className="h-8 w-8" />
  </div>
);

const Presence = ({ presence }: { readonly presence: string }) => {
  const colors: Record<string, string> = {
    Away: 'text-yellow-500',
    Online: 'text-green-500',
  };

  return (
    <Circle
      className={`h-3 w-3 fill-current ${colors[presence] ?? 'text-gray-400'}`}
    />
  );
};

const FreeUploadSlot = ({
  hasFreeUploadSlot,
}: {
  readonly hasFreeUploadSlot: boolean;
}) =>
  hasFreeUploadSlot ? (
    <Check className="h-4 w-4 text-green-500" />
  ) : (
    <X className="h-4 w-4 text-red-500" />
  );

const User = ({
  address,
  description,
  hasPicture,
  picture,
  port,
  presence,
  queueLength,
  uploadSlots,
  username,
}) => (
  <Item>
    {hasPicture ? (
      <ItemMedia variant="image">
        <img
          alt="TODO: CHANGE ME"
          src={`data:image;base64,${picture}`}
        />
      </ItemMedia>
    ) : (
      <ImagePlaceholder />
    )}

    <ItemContent>
      <ItemHeader>
        <Presence presence={presence} />
        {username}
      </ItemHeader>
      <p>
        Free Upload Slot: <FreeUploadSlot hasFreeUploadSlot />, Total Upload
        Slots: {uploadSlots}, Queue Length: {queueLength}, IP Address: {address}
        , Port: {port}
      </p>
      <ItemDescription>{description || 'No user info.'}</ItemDescription>
    </ItemContent>
  </Item>
);

export default User;
