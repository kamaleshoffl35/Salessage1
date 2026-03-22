import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ReusableTable from "../components/ReusableTable";
import AddButton from "../components/AddButton";

import {
  fetchPaymentSettings,
  savePaymentSettings,
} from "../redux/paymentSettingsSlice";

const PaymentSettings = () => {
  const dispatch = useDispatch();
const { settings } = useSelector((state) => state.paymentsettings);

  const [form, setForm] = useState({
    qr_code: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch: "",
    upi_id: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [qrPreview, setQrPreview] = useState("");

  useEffect(() => {
    dispatch(fetchPaymentSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setForm({
        qr_code: settings.qr_code || "",
        bank_name: settings.bank_name || "",
        account_number: settings.account_number || "",
        ifsc_code: settings.ifsc_code || "",
        branch: settings.branch || "",
        upi_id: settings.upi_id || "",
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("bank_name", form.bank_name);
    formData.append("account_number", form.account_number);
    formData.append("ifsc_code", form.ifsc_code);
    formData.append("branch", form.branch);
    formData.append("upi_id", form.upi_id);

    if (form.qr_code instanceof File) {
      formData.append("qr_code", form.qr_code);
    }

    dispatch(savePaymentSettings(formData));

    setShowForm(false);
    setEditingId(null);

    dispatch(fetchPaymentSettings());
  };

  const columns = [
    {
      key: "bank_name",
      header: "Bank Name",
      headerStyle: { width: "150px" },
    },
    {
      key: "account_number",
      header: "Account Number",
      headerStyle: { width: "180px" },
    },
    {
      key: "ifsc_code",
      header: "IFSC Code",
      headerStyle: { width: "120px" },
    },
    {
      key: "branch",
      header: "Branch",
      headerStyle: { width: "150px" },
    },
    {
      key: "upi_id",
      header: "UPI ID",
      headerStyle: { width: "180px" },
    },
    {
      key: "qr_code",
      header: "QR Code",
      render: (row) => (
        <img
          src={row.qr_code}
          alt="QR"
          style={{ width: "60px", height: "60px" }}
        />
      ),
    },
  ];

 const paymentList = settings || [];

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Payment Settings</b>
      </h2>

      <div className="row mb-4">
        <div className="col-12">
          <AddButton
            text="Add Payment Details"
            onClick={() => setShowForm(true)}
          />
        </div>
      </div>

      {showForm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header text-white">
                <h5 className="modal-title">
                  {editingId ? "Edit Payment Details" : "Add Payment Details"}
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label">Bank Name</label>

                    <input
                      type="text"
                      className="form-control bg-light"
                      name="bank_name"
                      value={form.bank_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Account Number</label>

                    <input
                      type="text"
                      className="form-control bg-light"
                      name="account_number"
                      value={form.account_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">IFSC Code</label>

                    <input
                      type="text"
                      className="form-control bg-light"
                      name="ifsc_code"
                      value={form.ifsc_code}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Branch</label>

                    <input
                      type="text"
                      className="form-control bg-light"
                      name="branch"
                      value={form.branch}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">UPI ID</label>

                    <input
                      type="text"
                      className="form-control bg-light"
                      name="upi_id"
                      value={form.upi_id}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Upload QR Code</label>

                    <input
                      type="file"
                      accept="image/*"
                      className="form-control bg-light"
                      onChange={(e) => {
                        const file = e.target.files[0];

                        setForm((prev) => ({
                          ...prev,
                          qr_code: file,
                        }));

                        if (file) {
                          setQrPreview(URL.createObjectURL(file));
                        }
                      }}
                    />

                    {qrPreview && (
                      <div className="mt-2">
                        <img
                          src={qrPreview}
                          alt="QR Preview"
                          style={{ width: "120px", borderRadius: "5px" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn add text-white px-4">
                      {editingId ? "Update Payment" : "Save Payment"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary px-4"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReusableTable
        data={paymentList}
        columns={columns}
        searchable={false}
        emptyMessage="No payment details found."
      />
    </div>
  );
};

export default PaymentSettings;