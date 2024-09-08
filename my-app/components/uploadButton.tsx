import { useRef } from 'react';

interface UploadButtonProps {
  onUpload: (file: File) => void;
}

export default function UploadButton({ onUpload }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="bg-orangeCustom text-white px-4 py-2 rounded-md"
      >
        Upload Image
      </button>
    </div>
  );
}
