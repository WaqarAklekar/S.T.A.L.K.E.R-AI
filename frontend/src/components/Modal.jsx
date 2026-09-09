import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  title,
  eyebrow = "S.T.A.L.K.E.R. AI",
  children,
  onClose,
  fullscreen = false,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div
        className={`modal ${
          fullscreen
            ? "modal-investigation"
            : ""
        }`}
      >
        <header className="modal-header">
          <div>
            <div className="eyebrow">
              {eyebrow}
            </div>

            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}