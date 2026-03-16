import { useState } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

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
  onPayment: (payer: string, amount: number) => void;
  isSettled?: boolean;
}

export function ExpenseCard({
  title,
  totalAmount,
  paidBy,
  splits,
  onPayment,
  isSettled = false,
}: ExpenseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] =
    useState(false);
  const [selectedPayer, setSelectedPayer] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const currentUser = "Jordan"; // Logged in user

  const handlePayClick = () => {
    if (splits.length > 0) {
      // Default to first person who still owes money
      const firstOwer = splits.find(
        (s) => s.amount - s.paid > 0,
      );
      setSelectedPayer(
        firstOwer ? firstOwer.name : splits[0].name,
      );
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

  const selectedSplit = splits.find(
    (s) => s.name === selectedPayer,
  );
  const maxPayment = selectedSplit
    ? selectedSplit.amount - selectedSplit.paid
    : 0;

  // Calculate totals using splits
  const totalOwed = splits.reduce(
    (sum, split) => sum + (split.amount - split.paid),
    0,
  );
  const totalPaid = splits.reduce(
    (sum, split) => sum + split.paid,
    0,
  );
  const totalOwedAmount = splits.reduce(
    (sum, split) => sum + split.amount,
    0,
  );

  return (
    <>
      <div
        className={`bg-white border rounded-2xl p-6 mb-4 shadow-sm ${isSettled ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}
      >
        <div
          className={`flex justify-between items-start mb-4 ${isExpanded ? "pb-3 border-b border-gray-100" : ""}`}
        >
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {title}
              {isSettled && (
                <span className="text-green-600 text-base">
                  ✓ Paid
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Paid by{" "}
              <span className="font-semibold text-purple-600">
                {paidBy}
                {paidBy === currentUser ? " (me)" : ""}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xl text-gray-500">
              ${totalPaid.toFixed(2)} /{" "}
              <span className="font-bold">
                ${totalAmount.toFixed(2)}
              </span>
            </span>
            {/* Overall Progress Bar */}
            <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden flex">
              <div
                className="bg-green-600 h-full transition-all"
                style={{
                  width: `${totalOwedAmount > 0 ? (totalPaid / totalOwedAmount) * 100 : 0}%`,
                }}
              />
              {totalOwed > 0 && (
                <div
                  className="bg-red-600 h-full transition-all"
                  style={{
                    width: `${totalOwedAmount > 0 ? (totalOwed / totalOwedAmount) * 100 : 0}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 mb-4">
            {/* Show people who owe */}
            {splits.map((split, index) => {
              const owedAmount = split.amount - split.paid;
              const progressPercentage =
                (split.paid / split.amount) * 100;
              const isPayer = split.name === paidBy;

              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-lg font-semibold ${isPayer ? "text-purple-600" : ""}`}
                    >
                      {split.name}
                      {split.name === currentUser
                        ? " (me)"
                        : ""}
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        Paid: ${split.paid.toFixed(2)} / $
                        {split.amount.toFixed(2)}
                      </span>
                      {owedAmount > 0 && (
                        <span className="ml-2 text-lg font-bold text-red-600">
                          Owes ${owedAmount.toFixed(2)}
                        </span>
                      )}
                      {owedAmount === 0 && (
                        <span className="ml-2 text-sm font-bold text-green-600">
                          ✓ Paid
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
                    <div
                      className="bg-green-600 h-full transition-all"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
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
                  {/* Add dividing line after payer */}
                  {isPayer && index < splits.length - 1 && (
                    <div className="border-t border-gray-200 mt-3"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          {!isSettled && (
            <button
              onClick={handlePayClick}
              className="bg-purple-600 text-white px-8 py-2.5 rounded-full text-lg hover:bg-purple-700 transition font-semibold shadow-sm"
            >
              Pay Up
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 hover:bg-gray-100 rounded-full transition ${isSettled ? "ml-auto" : ""}`}
          >
            {isExpanded ? (
              <ChevronUp size={24} />
            ) : (
              <ChevronDown size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-gray-900 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">
                Record Payment
              </h3>
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
              <CustomSelect
                value={selectedPayer}
                onValueChange={setSelectedPayer}
                options={splits.map((split) => {
                  const owedAmount = split.amount - split.paid;
                  const isSettled = owedAmount <= 0;
                  const nameWithMe =
                    split.name === currentUser
                      ? `${split.name} (me)`
                      : split.name;
                  return {
                    value: split.name,
                    label: isSettled
                      ? `${nameWithMe} (Paid)`
                      : `${nameWithMe} (owes $${owedAmount.toFixed(2)})`,
                    disabled: isSettled,
                  };
                })}
                placeholder="Select who is paying"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(e.target.value)
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                max={maxPayment}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {maxPayment > 0 && (
                <div className="flex justify-start gap-2 mt-2">
                  <button
                    onClick={() =>
                      setPaymentAmount(
                        (maxPayment * 0.2).toFixed(2),
                      )
                    }
                    className="text-xs text-purple-600 font-semibold hover:underline"
                  >
                    20%
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() =>
                      setPaymentAmount(
                        (maxPayment * 0.5).toFixed(2),
                      )
                    }
                    className="text-xs text-purple-600 font-semibold hover:underline"
                  >
                    50%
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() =>
                      setPaymentAmount(maxPayment.toFixed(2))
                    }
                    className="text-xs text-purple-600 font-semibold hover:underline"
                  >
                    Max (${maxPayment.toFixed(2)})
                  </button>
                </div>
              )}
            </div>

            <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-200">
              <p className="text-sm text-purple-900">
                <span className="font-bold">
                  {selectedPayer}
                </span>{" "}
                will pay{" "}
                <span className="font-bold">
                  ${paymentAmount || "0.00"}
                </span>{" "}
                to <span className="font-bold">{paidBy}</span>
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