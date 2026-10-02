
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IndianRupee, Receipt, Search, TrendingUp, Clock, Wallet } from "lucide-react";
import { listPayments, getSummary, recordPayment, listStudentFees } from "../../api/fees.api";

const METHODS = ["cash", "card", "upi", "netbanking", "cheque", "online"];

export default function FeePayments() {
  const [tab, setTab] = useState("payments");
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [feeRows, setFeeRows] = useState([]);
  const [search, setSearch] = useState("");
  const [showPay, setShowPay] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({ amount: 0, method: "cash", reference_number: "", notes: "" });
  const [receipt, setReceipt] = useState(null);

  const load = () => {
    listPayments().then(setPayments).catch(console.error);
    getSummary().then(setSummary).catch(console.error);
    listStudentFees({}).then(setFeeRows).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const openPay = (sf) => {
    setPayTarget(sf);
    setPayForm({
      amount: sf.amount - sf.paid_amount,
      method: "cash",
      reference_number: "",
      notes: "",
    });
    setShowPay(true);
  };

  const onRecord = async () => {
    try {
      const res = await recordPayment({
        student_fee_id: payTarget._id,
        amount: Number(payForm.amount),
        method: payForm.method,
        reference_number: payForm.reference_number || null,
        notes: payForm.notes,
      });
      toast.success("Payment recorded");
      setShowPay(false);
      setReceipt(res);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const filteredFees = feeRows.filter((f) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      f.student_id?.name?.toLowerCase().includes(s) ||
      f.student_id?.student_id?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Wallet}
            label="Total Collected"
            value={`₹${summary.total_collected.toLocaleString()}`}
            color="bg-green-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Due"
            value={`₹${summary.total_due.toLocaleString()}`}
            color="bg-blue-500"
          />
          <StatCard
            icon={IndianRupee}
            label="Total Paid"
            value={`₹${summary.total_paid.toLocaleString()}`}
            color="bg-emerald-500"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={`₹${summary.pending.toLocaleString()}`}
            color="bg-amber-500"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: "payments", label: "Payments" },
          { id: "pending", label: "Student Fees" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === t.id ? "bg-white shadow" : "text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "payments" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Receipt</th>
                <th className="p-3">Student</th>
                <th className="p-3">Fee</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-mono text-xs">{p.receipt_number}</td>
                  <td className="p-3">
                    <div>{p.student_id?.name}</div>
                    <div className="text-xs text-slate-500">{p.student_id?.student_id}</div>
                  </td>
                  <td className="p-3 text-xs">{p.student_fee_id?.fee_structure_id?.name}</td>
                  <td className="p-3 font-medium">₹{p.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="uppercase text-xs bg-slate-100 px-2 py-0.5 rounded">
                      {p.method}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    {new Date(p.paid_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setReceipt(p)}
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-slate-500">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pending" && (
        <div className="space-y-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-9 pr-3 py-2 border rounded-md w-full"
            />
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((f) => {
                  const balance = f.amount - f.paid_amount;
                  return (
                    <tr key={f._id} className="border-t hover:bg-slate-50">
                      <td className="p-3">
                        <div>{f.student_id?.name}</div>
                        <div className="text-xs text-slate-500">{f.student_id?.student_id}</div>
                      </td>
                      <td className="p-3 text-xs">{f.fee_structure_id?.name}</td>
                      <td className="p-3">₹{f.amount.toLocaleString()}</td>
                      <td className="p-3">₹{f.paid_amount.toLocaleString()}</td>
                      <td className="p-3 font-medium text-amber-600">
                        ₹{balance.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="p-3 text-right">
                        {balance > 0 && (
                          <button
                            onClick={() => openPay(f)}
                            className="bg-primary text-white text-xs px-3 py-1.5 rounded-md"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPay && payTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Record Payment</h3>
            <div className="text-sm bg-slate-50 p-3 rounded-md">
              <div><b>{payTarget.student_id?.name}</b> — {payTarget.student_id?.student_id}</div>
              <div className="text-xs text-slate-500 mt-1">
                Fee: {payTarget.fee_structure_id?.name}
              </div>
              <div className="text-xs text-slate-500">
                Balance: ₹{(payTarget.amount - payTarget.paid_amount).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Amount (₹)</label>
              <input
                type="number"
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Payment Method</label>
              <select
                value={payForm.method}
                onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {payForm.method !== "cash" && (
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Reference / Transaction ID
                </label>
                <input
                  value={payForm.reference_number}
                  onChange={(e) => setPayForm({ ...payForm, reference_number: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-600">Notes</label>
              <input
                value={payForm.notes}
                onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPay(false)} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button onClick={onRecord} className="px-4 py-2 bg-primary text-white rounded-md">
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    paid: "bg-green-100 text-green-700",
    partial: "bg-amber-100 text-amber-700",
    pending: "bg-slate-100 text-slate-700",
    overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${map[status] || ""}`}>
      {status}
    </span>
  );
}

function ReceiptModal({ payment, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Receipt size={20} className="text-primary" />
          <h3 className="font-semibold">Payment Receipt</h3>
        </div>

        <div className="space-y-2 text-sm border-t border-b py-4">
          <Row label="Receipt No" value={payment.receipt_number} mono />
          <Row label="Student" value={payment.student_id?.name} />
          <Row label="Student ID" value={payment.student_id?.student_id} />
          <Row label="Fee" value={payment.student_fee_id?.fee_structure_id?.name} />
          <Row label="Amount" value={`₹${payment.amount.toLocaleString()}`} bold />
          <Row label="Method" value={payment.method.toUpperCase()} />
          {payment.reference_number && (
            <Row label="Reference" value={payment.reference_number} />
          )}
          <Row
            label="Date"
            value={new Date(payment.paid_at).toLocaleString()}
          />
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-primary text-white py-2 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}