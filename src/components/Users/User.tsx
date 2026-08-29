import { Card } from '../ui/card';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
} from '../ui/item';
import { Camera, Check, Circle, X } from 'lucide-react';

const ImagePlaceholder = () => (
  <div className="text-center pt-2.5 opacity-[0.125]">
    <Camera className="h-8 w-8" />
  </div>
);

const Presence = ({ presence }: { readonly presence: string }) => {
  const colors: Record<string, string> = {
    Away: 'text-yellow-500',
    Online: 'text-good',
  };

  return (
    <Circle
      className={`h-3 w-3 fill-current ${colors[presence] ?? 'text-gray-400'} self-center`}
    />
  );
};

const FreeUploadSlot = ({
  hasFreeUploadSlot,
}: {
  readonly hasFreeUploadSlot: boolean;
}) =>
  hasFreeUploadSlot ? (
    <Check className="h-4 w-4 text-good" />
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
  <Card>
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
          <div className='flex gap-1 text-center'>
            <Presence presence={presence} />
            <p>{username}</p>
          </div>
        </ItemHeader>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1 whitespace-nowrap">
            Free Upload Slot: <FreeUploadSlot hasFreeUploadSlot />
          </span>
          <span className="whitespace-nowrap">Total Upload Slots: {uploadSlots}</span>
          <span className="whitespace-nowrap">Queue Length: {queueLength}</span>
          <span className="whitespace-nowrap">IP Address: {address}</span>
          <span className="whitespace-nowrap">Port: {port}</span>
        </div>
      </ItemContent>
    </Item>

    <p className="whitespace-pre-wrap break-words px-3.5">
      {description || 'No user info.'}
    </p>
  </Card>
);

export default User;
