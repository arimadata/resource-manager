import { MdClose } from "react-icons/md";
import { useEffect, useRef } from "react";
import "./Modal.scss";

const Modal = ({
  children,
  isOpen,
  closeModal,
  heading,
  dialogWidth = "25%",
  closeButton = true,
}) => {
  const modalRef = useRef(null);

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={modalRef}
      className={`fm-modal dialog`}
      style={{ width: dialogWidth }}
      onKeyDown={handleKeyDown}
    >
      <div className="fm-modal-header">
        <span className="fm-modal-heading">{heading}</span>
        {closeButton && (
          <MdClose
            size={18}
            onClick={() => closeModal()}
            className="close-icon"
            title="Close"
          />
        )}
      </div>
      {children}
    </dialog>
  );
};

export default Modal;
