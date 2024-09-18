import { toast } from "react-toastify";

export const showSuccessToast = (message: string) => {
  toast.success(
    <div className="flex items-center">{message}</div>,
    {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    }
  );
};

export const showErrorToast = (message: string) => {
  toast.error(
    <div className="flex items-center">{message}</div>,
    {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    }
  );
};
