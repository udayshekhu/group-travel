import { useState } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";

interface Split {
  name: string;
  amount: number;
  paid: number;
}

interface ExpenseCardProps {
  title: string;
  totalAmount: number;
  paidBy: string;
  splits: Split[];
  date?: string;
  onPayment: (payer: string, amount: number) => void;
}

export function ExpenseCard({
  title,
  totalAmount,
  paidBy,
  splits,
  date,
  onPayment,
}: ExpenseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const handlePayClick = () => {
    if (splits.length > 0) {
      // Default to first person who still owes money
      const firstOwer = splits.find((s) => s.amount - s.paid > 0);
      setSelectedPayer(firstOwer ? firstOwer.name : splits[0].name);
    }
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0 && selectedPayer) {
      onPayment(selectedPayer, amount);
      setPaymentAmount("");
      setShowPaymentModal(false);
    } else {
      alert("Please enter a valid payment amount");
    }
  };

  const selectedSplit = splits.find((s) => s.name === selectedPayer);
  const maxPayment = selectedSplit
    ? selectedSplit.amount - selectedSplit.paid
    : 0;

  // Calculate how much the payer is owed
  const totalOwed = splits.reduce(
    (sum, split) => sum + (split.amount - split.paid),
    0,
  );

  // Calculate total paid and remaining
  const totalPaid = splits.reduce((sum, split) => sum + split.paid, 0);
  const totalRemaining = totalAmount - totalPaid;
  const paidPercentage = (totalPaid / totalAmount) * 100;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Paid by{" "}
              <span className="font-semibold text-purple-600">{paidBy}</span>
            </p>
            {date && <p className="text-xs text-gray-500 mt-1">{date}</p>}
          </div>
          <span className="text-xl font-bold text-gray-500">
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        {!isExpanded && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Payment Progress
              </span>
              <span className="text-sm font-bold text-gray-600">
                ${totalPaid.toFixed(2)} / ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-red-600 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-green-600 h-full transition-all"
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 mb-4">
            {/* Show people who owe */}
            {splits.map((split, index) => {
              const owedAmount = split.amount - split.paid;
              const progressPercentage = (split.paid / split.amount) * 100;

              return (
                <div key={index}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{split.name}</span>
                    <div className="text-right">
                      {owedAmount > 0 && (
                        <span className="ml-2 text-lg font-bold text-red-600">
                          Owes ${owedAmount.toFixed(2)}
                        </span>
                      )}
                      {owedAmount === 0 && (
                        <span className="ml-2 text-sm font-bold text-green-600">
                          ✓ Settled
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-0 text-right">
                    <span className="text-sm text-gray-500">
                      Paid: ${split.paid.toFixed(2)} / $
                      {split.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
                    <div
                      className="bg-green-600 h-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                    {owedAmount > 0 && (
                      <div
                        className="bg-red-600 h-full transition-all"
                        style={{
                          width: `${(owedAmount / split.amount) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handlePayClick}
            className="bg-purple-600 text-white px-4 py-2 rounded-full text-md hover:bg-purple-700 transition font-semibold shadow-sm"
          >
            Settle Up
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-gray-900 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Who is paying?
              </label>
              <select
                value={selectedPayer}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {splits.map((split, index) => (
                  <option key={index} value={split.name}>
                    {split.name}{" "}
                    {split.amount - split.paid > 0
                      ? `(owes $${(split.amount - split.paid).toFixed(2)})`
                      : "(settled)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Amount</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={maxPayment}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              {maxPayment > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Max: ${maxPayment.toFixed(2)}
                  <button
                    onClick={() => setPaymentAmount(maxPayment.toFixed(2))}
                    className="ml-2 text-purple-600 font-semibold hover:underline"
                  >
                    Use max
                  </button>
                </p>
              )}
            </div>

            <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-200">
              <p className="text-sm text-purple-900">
                <span className="font-bold">{selectedPayer}</span> will pay{" "}
                <span className="font-bold">${paymentAmount || "0.00"}</span> to{" "}
                <span className="font-bold">{paidBy}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePayment}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-semibold border-2 border-gray-900"
              >
                Record Payment
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount("");
                }}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition font-semibold border-2 border-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
