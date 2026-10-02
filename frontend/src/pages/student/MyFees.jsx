/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IndianRupee, CheckCircle2, Clock, AlertCircle, CreditCard, Wallet, Receipt } from "lucide-react";
import { getMyFees, recordPayment, getMyPayments } from "../../api/fees.api";

export default function MyFees() {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({ amount: 0, method: "upi" });
  const [receipt, setReceipt] = useState(null);

  const load = () => {
    getMyFees().then(setData).catch(console.error);
    getMyPayments().then(setPayments).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const onPay = async () => {
    try {
      const res = await recordPayment({
        student_fee_id: payTarget._id,
        amount: Number(payForm.amount),
        method: payForm.method,
        transaction_id: `TXN-${Date.now()}`,
      });
      toast.success("Payment successful");
      setPayTarget(null);
      setReceipt(res);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  if (!data) return <div>Loading...</div>;

  const { fees, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={Wallet}
          label="Total Fees"
          value={`₹${summary.total.toLocaleString()}`}
          color="bg-blue-500"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Paid"
          value={`₹${summary.paid.toLocaleString()}`}
          color="bg-green-500"
        />
        <SummaryCard
          icon={Clock}
          label="Pending"
          value={`₹${summary.pending.toLocaleString()}`}
          color={summary.pending > 0 ? "bg-red-500" : "bg-emerald-500"}
        />
      </div>

      {/* Overall status */}
      {summary.total === 0 ? (
        <div className="rounded-xl p-4 border bg-slate-50 border-slate-200 text-slate-700 flex items-center gap-3">
          <AlertCircle size={20} />
          <div className="text-sm">
            No fees have been assigned to you yet. Please contact the accounts department.
          </div>
        </div>
      ) : (
        <div
          className={`rounded-xl p-4 border flex items-center gap-3 ${
            summary.status === "paid"
              ? "bg-green-50 border-green-200 text-green-800"
              : summary.status === "partial"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {summary.status === "paid" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <div className="text-sm">
            {summary.status === "paid"
              ? "All fees paid. Thank you!"
              : summary.status === "partial"
              ? `You have paid ₹${summary.paid.toLocaleString()} of ₹${summary.total.toLocaleString()}. Please clear the remaining amount.`
              : "You have pending fees. Please pay before the due date to avoid penalties."}
          </div>
        </div>
      )}

      {/* Fee Items */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b font-semibold">Fee Details</div>
        <ul className="divide-y">
          {fees.map((f) => {
            const balance = f.amount - f.paid_amount;
            return (
              <li key={f._id} className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium text-slate-800">
                    {f.fee_structure_id?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Due {f.due_date} • Sem {f.semester} • {f.academic_year}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Amount: </span>
                  <b>₹{f.amount.toLocaleString()}</b>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Paid: </span>
                  <b className="text-green-600">₹{f.paid_amount.toLocaleString()}</b>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Balance: </span>
                  <b className={balance > 0 ? "text-red-600" : "text-green-600"}>
                    ₹{balance.toLocaleString()}
                  </b>
                </div>
                <div>
                  {balance > 0 ? (
                    <button
                      onClick={() => {
                        setPayTarget(f);
                        setPayForm({ amount: balance, method: "upi" });
                      }}
                      className="bg-primary text-white text-sm px-4 py-2 rounded-md flex items-center gap-2"
                    >
                      <CreditCard size={14} /> Pay Now
                    </button>
                  ) : (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle2 size={14} /> Paid
                    </span>
                  )}
                </div>
              </li>
            );
          })}
          {fees.length === 0 && (
            <li className="p-6 text-center text-slate-500 text-sm">
              No fees assigned yet.
            </li>
          )}
        </ul>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b font-semibold flex items-center gap-2">
          <Receipt size={18} className="text-slate-500" />
          Payment History
        </div>
        {payments.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            No payments yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
              <tr>
                <th className="p-3">Receipt</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3 font-mono text-xs">{p.receipt_number}</td>
                  <td className="p-3">{new Date(p.paid_at).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">₹{p.amount.toLocaleString()}</td>
                  <td className="p-3 uppercase text-xs">{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pay Modal */}
      {payTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Pay Fee</h3>
            <div className="bg-slate-50 p-3 rounded-md text-sm">
              <div className="font-medium">{payTarget.fee_structure_id?.name}</div>
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
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { id: "upi", label: "UPI", emoji: "📱" },
                  { id: "card", label: "Card", emoji: "💳" },
                  { id: "netbanking", label: "Net Banking", emoji: "🏦" },
                  { id: "online", label: "Online", emoji: "🌐" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayForm({ ...payForm, method: m.id })}
                    className={`px-3 py-2 border rounded-md text-sm flex items-center gap-2 ${
                      payForm.method === m.id
                        ? "border-primary bg-blue-50 text-primary"
                        : ""
                    }`}
                  >
                    <span>{m.emoji}</span> {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-amber-50 border border-amber-200 p-2 rounded">
              Demo mode — no real money will be charged.
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPayTarget(null)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onPay}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Pay ₹{Number(payForm.amount).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt */}
      {receipt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center">
            <CheckCircle2 size={48} className="text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold mt-3">Payment Successful</h3>
            <div className="text-sm text-slate-500 mt-1">
              Receipt: <b className="font-mono">{receipt.receipt_number}</b>
            </div>
            <div className="text-2xl font-bold mt-3">
              ₹{receipt.amount.toLocaleString()}
            </div>
            <button
              onClick={() => setReceipt(null)}
              className="w-full mt-5 bg-primary text-white py-2 rounded-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}