import React from "react";
const HistoryModal = ({ open, onClose, data }) => {
  if (!open) return null;
  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div
            className="modal-header  text-white"
            style={{ backgroundColor: "#182235" }}
          >
            <h5 className="modal-title">Created Details</h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              <b>Created By:</b> {data?.createdBy || "Unknown"}
            </p>
            <p>
              <b>Date:</b>{" "}
              {data?.createdAt
                ? new Date(data.createdAt).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <b>Time:</b>{" "}
              {data?.createdAt
                ? new Date(data.createdAt).toLocaleTimeString()
                : "-"}
            </p>

            <hr />
            <p>
              <b>Updated By:</b> {data?.updatedBy || "-"}
            </p>
            <p>
              <b>Updated Date:</b>{" "}
              {data?.updatedAt
                ? new Date(data.updatedAt).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <b>Updated Time:</b>{" "}
              {data?.updatedAt
                ? new Date(data.updatedAt).toLocaleTimeString()
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
