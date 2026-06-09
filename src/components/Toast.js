"use client";

import { useEffect }
from "react";

export default function Toast({

  show,

  message,

  type = "success",

  onClose,

}) {

  useEffect(() => {

    if (show) {

      const timer =
        setTimeout(() => {

          onClose();

        }, 6000);

      return () =>
        clearTimeout(timer);

    }

  }, [show, onClose]);

  if (!show) {

    return null;

  }

  return (

    <div className={`toast ${type}`}>

      {/* ICON */}

      <div className="toast-icon">

        {type === "success"
          ? "✔"
          : "✖"}

      </div>

      {/* MESSAGE */}

      <div className="toast-content">

        <p>

          {message}

        </p>

        {/* PROGRESS */}

        <div className="toast-progress">

          <span />

        </div>

      </div>

    </div>

  );

}