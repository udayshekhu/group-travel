import { useState, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { ExpenseCard } from "../components/ExpenseCard";
import { Plus, X, ArrowRight, Zap } from "lucide-react";
import { CustomSelect } from "../components/CustomSelect";
import { Checkbox } from "../components/ui/checkbox";

interface Split {
  name: string;
  amount: number;
  paid: number;
}

interface Expense {
  id: string;
  title: string;
  totalAmount: number;
  paidBy: string;
  splits: Split[];
  date: string;
}

const defaultExpenses: Expense[] = [
  {
    id: "1",
    title: "Hotel",
    totalAmount: 1200,
    paidBy: "Jordan",
    splits: [
      { name: "Sam", amount: 400, paid: 0 },
      { name: "Alex", amount: 400, paid: 0 },
      { name: "Taylor", amount: 400, paid: 0 },
    ],
    date: "March 1, 2026",
  },
  {
    id: "2",
    title: "Flights",
    totalAmount: 2400,
    paidBy: "Alex",
    splits: [
      { name: "Jordan", amount: 800, paid: 0 },
      { name: "Sam", amount: 800, paid: 0 },
      { name: "Taylor", amount: 800, paid: 0 },
    ],
    date: "February 28, 2026",
  },
  {
    id: "3",
    title: "Activities",
    totalAmount: 800,
    paidBy: "Sam",
    splits: [
      { name: "Jordan", amount: 800 / 3, paid: 0 },
      { name: "Alex", amount: 800 / 3, paid: 0 },
      { name: "Taylor", amount: 800 / 3, paid: 0 },
    ],
    date: "March 2, 2026",
  },
];

export default function Financials() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [currentTrip, setCurrentTrip] = useState({
    members: ["Jordan", "Sam", "Alex", "Taylor"],
  });

  // Form state
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [customSplits, setCustomSplits] = useState<{ [key: string]: string }>(
    {},
  );
  const [customSplitMode, setCustomSplitMode] = useState<"dollar" | "percent">("dollar");
  const [includedMembers, setIncludedMembers] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [splitErrors, setSplitErrors] = useState<{ [key: string]: string }>({});
  const [shakeRemaining, setShakeRemaining] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [shakeFields, setShakeFields] = useState<{ [key: string]: boolean }>({});

  // Quick Pay state
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [quickPayFrom, setQuickPayFrom] = useState("");
  const [quickPayTo, setQuickPayTo] = useState("");
  const [quickPayAmount, setQuickPayAmount] = useState("");

  useEffect(() => {
    const storedExpenses = localStorage.getItem("tripExpenses");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      setExpenses(defaultExpenses);
      localStorage.setItem("tripExpenses", JSON.stringify(defaultExpenses));
    }

    // Get current trip members
    const storedTrips = localStorage.getItem("trips");
    const storedCurrentTripId = localStorage.getItem("currentTripId");
    if (storedTrips && storedCurrentTripId) {
      const trips = JSON.parse(storedTrips);
      const trip = trips.find((t: any) => t.id === storedCurrentTripId);
      if (trip) {
        setCurrentTrip({ members: trip.members });
        setPaidBy(trip.members[0]);
        setQuickPayFrom(trip.members[0]);
        setQuickPayTo(trip.members[1] || trip.members[0]);
        // Initialize all members as included by default
        const initialIncluded: { [key: string]: boolean } = {};
        trip.members.forEach((member: string) => {
          initialIncluded[member] = true;
        });
        setIncludedMembers(initialIncluded);
      }
    } else {
      setPaidBy(currentTrip.members[0]);
      setQuickPayFrom(currentTrip.members[0]);
      setQuickPayTo(currentTrip.members[1] || currentTrip.members[0]);
      // Initialize all members as included by default
      const initialIncluded: { [key: string]: boolean } = {};
      currentTrip.members.forEach((member: string) => {
        initialIncluded[member] = true;
      });
      setIncludedMembers(initialIncluded);
    }
  }, []);

  const addExpense = () => {
    // Validate required fields
    const errors: { [key: string]: boolean } = {};
    const shakes: { [key: string]: boolean } = {};
    
    if (!expenseTitle.trim()) {
      errors.title = true;
      shakes.title = true;
    }
    
    if (!expenseAmount || parseFloat(expenseAmount || "0") <= 0) {
      errors.amount = true;
      shakes.amount = true;
    }
    
    // If there are errors, show red and shake the fields
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShakeFields(shakes);
      // Clear shake animation after it completes
      setTimeout(() => setShakeFields({}), 600);
      return;
    }
    
    // Check for split errors
    if (Object.keys(splitErrors).length > 0) {
      return;
    }
    
    // Check remaining for custom split - validate using autofilled totals
    if (splitType === "custom") {
      // Allow small rounding errors (0.01 for dollars, 0.1 for percent)
      const tolerance = customSplitMode === "percent" ? 0.1 : 0.01;
      
      if (Math.abs(remainingWithAutofill) > tolerance) {
        // Shake the remaining indicator
        setShakeRemaining(true);
        setTimeout(() => setShakeRemaining(false), 600);
        return;
      }
    }

    const total = parseFloat(expenseAmount);
    let splits: Split[] = [];

    if (splitType === "equal") {
      // Split among ALL members (including the payer), but only track what others owe
      const perPerson = total / currentTrip.members.length;
      const splitMembers = currentTrip.members.filter((m) => m !== paidBy);
      splits = splitMembers.map((member) => ({
        name: member,
        amount: perPerson,
        paid: 0,
      }));
    } else {
      // Custom splits - only include checked members
      const allMemberSplits: { [key: string]: number } = {};
      
      // First, calculate auto-split for members without custom values
      const includedMembersList = currentTrip.members.filter(m => includedMembers[m]);
      const membersWithValues = includedMembersList.filter(m => customSplits[m] && parseFloat(customSplits[m]) > 0);
      const membersWithoutValues = includedMembersList.filter(m => !customSplits[m] || parseFloat(customSplits[m]) === 0);
      
      // Calculate what's already allocated
      const allocatedTotal = membersWithValues.reduce(
        (sum, member) => sum + parseFloat(customSplits[member] || "0"),
        0
      );
      
      // Calculate auto-split for remaining members
      const remainingToSplit = customSplitMode === "percent" 
        ? 100 - allocatedTotal 
        : total - allocatedTotal;
      
      const autoSplitValue = membersWithoutValues.length > 0 
        ? remainingToSplit / membersWithoutValues.length 
        : 0;
      
      currentTrip.members.forEach((member) => {
        // Only calculate splits for included members
        if (includedMembers[member]) {
          const hasCustomValue = customSplits[member] && parseFloat(customSplits[member]) > 0;
          const inputValue = hasCustomValue ? customSplits[member] : autoSplitValue.toString();
          
          if (customSplitMode === "percent") {
            // Convert percentage to dollar amount
            const percent = parseFloat(inputValue);
            allMemberSplits[member] = (percent / 100) * total;
          } else {
            allMemberSplits[member] = parseFloat(inputValue);
          }
        }
      });

      // Calculate what the payer paid for themselves
      const payerShare = allMemberSplits[paidBy] || 0;
      
      // Only track what others owe (excluding the payer)
      splits = currentTrip.members
        .filter((m) => m !== paidBy && includedMembers[m])
        .map((member) => ({
          name: member,
          amount: allMemberSplits[member],
          paid: 0,
        }));

      // Validation is handled by button disabled state
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      title: expenseTitle,
      totalAmount: total,
      paidBy,
      splits,
      date:
        expenseDate ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem("tripExpenses", JSON.stringify(updatedExpenses));

    // Reset form
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseDate("");
    setSplitType("equal");
    setCustomSplits({});
    setCustomSplitMode("dollar");
    // Reset all members to included
    const resetIncluded: { [key: string]: boolean } = {};
    currentTrip.members.forEach((member: string) => {
      resetIncluded[member] = true;
    });
    setIncludedMembers(resetIncluded);
    setSplitErrors({});
    setShowAddExpense(false);
  };

  const updateCustomSplit = (member: string, value: string) => {
    // Update the value first
    setCustomSplits((prev) => ({
      ...prev,
      [member]: value,
    }));

    // Validate the input
    if (value === "" || value === "0") {
      // Clear any error for this member
      setSplitErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[member];
        return newErrors;
      });
      return;
    }

    const numValue = parseFloat(value);
    const totalExpense = parseFloat(expenseAmount || "0");

    if (customSplitMode === "percent") {
      // Don't allow percentages over 100%
      if (numValue > 100) {
        setSplitErrors((prev) => ({
          ...prev,
          [member]: "Cannot exceed 100%",
        }));
        return;
      }
    } else {
      // Don't allow dollar amounts over the total expense
      if (numValue > totalExpense) {
        setSplitErrors((prev) => ({
          ...prev,
          [member]: `Cannot exceed $${totalExpense.toFixed(2)}`,
        }));
        return;
      }
    }

    // Clear error if validation passed
    setSplitErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[member];
      return newErrors;
    });
  };

  const toggleMemberInclusion = (member: string) => {
    setIncludedMembers((prev) => ({
      ...prev,
      [member]: !prev[member],
    }));
  };

  const handlePayment = (expenseId: string, payer: string, amount: number) => {
    const updatedExpenses = expenses.map((expense) => {
      if (expense.id === expenseId) {
        return {
          ...expense,
          splits: expense.splits.map((split) =>
            split.name === payer
              ? { ...split, paid: Math.min(split.paid + amount, split.amount) }
              : split,
          ),
        };
      }
      return expense;
    });
    setExpenses(updatedExpenses);
    localStorage.setItem("tripExpenses", JSON.stringify(updatedExpenses));
  };

  // Calculate total owed from one person to another across all expenses
  const calculateTotalOwed = (from: string, to: string) => {
    let total = 0;
    const debts: { expenseId: string; title: string; amount: number }[] = [];
    
    expenses.forEach((expense) => {
      if (expense.paidBy === to) {
        const split = expense.splits.find((s) => s.name === from);
        if (split) {
          const owed = split.amount - split.paid;
          if (owed > 0) {
            total += owed;
            debts.push({
              expenseId: expense.id,
              title: expense.title,
              amount: owed,
            });
          }
        }
      }
    });
    
    return { total, debts };
  };

  const handleQuickPay = () => {
    const amount = parseFloat(quickPayAmount);
    
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const { total, debts } = calculateTotalOwed(quickPayFrom, quickPayTo);
    
    if (total === 0) {
      alert(`${quickPayFrom} doesn't owe anything to ${quickPayTo}`);
      return;
    }

    if (amount > total) {
      alert(`Payment amount ($${amount.toFixed(2)}) exceeds total owed ($${total.toFixed(2)})`);
      return;
    }

    // Sort debts from smallest to largest and pay them off in order
    const sortedDebts = [...debts].sort((a, b) => a.amount - b.amount);
    const updatedExpenses = [...expenses];
    let remainingAmount = amount;

    sortedDebts.forEach((debt) => {
      if (remainingAmount <= 0) return;

      // Pay as much as possible for this debt
      const paymentForThisDebt = Math.min(remainingAmount, debt.amount);
      remainingAmount -= paymentForThisDebt;

      const expenseIndex = updatedExpenses.findIndex((e) => e.id === debt.expenseId);
      if (expenseIndex !== -1) {
        updatedExpenses[expenseIndex] = {
          ...updatedExpenses[expenseIndex],
          splits: updatedExpenses[expenseIndex].splits.map((split) =>
            split.name === quickPayFrom
              ? { ...split, paid: Math.min(split.paid + paymentForThisDebt, split.amount) }
              : split,
          ),
        };
      }
    });

    setExpenses(updatedExpenses);
    localStorage.setItem("tripExpenses", JSON.stringify(updatedExpenses));
    
    setQuickPayAmount("");
    setShowQuickPay(false);
  };

  // Calculate custom split totals (only include checked members)
  const customTotal = currentTrip.members
    .filter((member) => includedMembers[member])
    .reduce(
      (sum, member) => sum + parseFloat(customSplits[member] || "0"),
      0,
    );
  
  const remaining = expenseAmount 
    ? customSplitMode === "percent" 
      ? 100 - customTotal 
      : parseFloat(expenseAmount) - customTotal 
    : 0;
  
  // Calculate total INCLUDING autofilled values
  const getTotalWithAutofill = () => {
    if (!expenseAmount) return 0;
    
    const includedMembersList = currentTrip.members.filter(m => includedMembers[m] !== false);
    const membersWithValues = includedMembersList.filter(m => customSplits[m] && parseFloat(customSplits[m]) > 0);
    const membersWithoutValues = includedMembersList.filter(m => !customSplits[m] || parseFloat(customSplits[m]) === 0);
    
    // If all members have values, just use customTotal
    if (membersWithoutValues.length === 0) {
      return customTotal;
    }
    
    // Calculate what's allocated manually
    const allocatedTotal = membersWithValues.reduce(
      (sum, member) => sum + parseFloat(customSplits[member] || "0"),
      0
    );
    
    // Calculate auto-split for remaining members
    const remainingToSplit = customSplitMode === "percent" 
      ? 100 - allocatedTotal 
      : parseFloat(expenseAmount || "0") - allocatedTotal;
    
    const autoSplitValue = membersWithoutValues.length > 0 
      ? remainingToSplit / membersWithoutValues.length 
      : 0;
    
    // IMPORTANT: Autofill values can't be negative! If manual entries exceed the total,
    // autofilled members get $0 and we show the "over" error
    const clampedAutoSplitValue = Math.max(0, autoSplitValue);
    
    // Total = manual values + (autofill value × number of autofilled members)
    return allocatedTotal + (clampedAutoSplitValue * membersWithoutValues.length);
  };
  
  const totalWithAutofill = getTotalWithAutofill();
  const remainingWithAutofill = expenseAmount
    ? customSplitMode === "percent"
      ? 100 - totalWithAutofill
      : parseFloat(expenseAmount) - totalWithAutofill
    : 0;

  // Helper function to check if an expense is fully settled
  const isExpenseSettled = (expense: Expense) => {
    return expense.splits.every(split => split.paid >= split.amount);
  };

  // Separate expenses into active and settled
  const activeExpenses = expenses.filter(exp => !isExpenseSettled(exp));
  const settledExpenses = expenses.filter(exp => isExpenseSettled(exp));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Financials</h1>
          <p className="text-gray-600 text-lg">Track group expenses</p>
        </div>

        {/* Action Buttons */}
        {!showAddExpense && !showQuickPay && (
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setShowQuickPay(true)}
              className="flex-1 bg-white border-2 border-purple-600 text-purple-600 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-50 transition shadow-md flex items-center justify-center gap-2"
            >
              <Zap size={22} strokeWidth={2.5} />
              Quick Pay
            </button>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex-1 bg-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <Plus size={24} strokeWidth={2.5} />
              Add Expense
            </button>
          </div>
        )}

        {/* Quick Pay Form */}
        {showQuickPay && (
          <div className="mb-5 bg-white border-2 border-gray-900 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Quick Pay</h3>
              <button
                onClick={() => setShowQuickPay(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Split a payment across all expenses you owe to someone
            </p>

            {/* Who is paying */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">
                I am:
              </label>
              <CustomSelect
                value={quickPayFrom}
                onValueChange={setQuickPayFrom}
                options={currentTrip.members.map((member) => ({
                  value: member,
                  label: member,
                }))}
                placeholder="Select your name"
              />
            </div>

            {/* Who they're paying */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">
                Paying to:
              </label>
              <CustomSelect
                value={quickPayTo}
                onValueChange={setQuickPayTo}
                options={currentTrip.members
                  .filter((m) => m !== quickPayFrom)
                  .map((member) => ({
                    value: member,
                    label: member,
                  }))}
                placeholder="Select recipient"
              />
            </div>

            {/* Show breakdown of what's owed */}
            {(() => {
              const { total, debts } = calculateTotalOwed(quickPayFrom, quickPayTo);
              return (
                <>
                  {debts.length > 0 ? (
                    <div className="mb-4 bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <p className="text-sm font-semibold text-purple-900 mb-2">
                        Total owed: ${total.toFixed(2)}
                      </p>
                      <div className="space-y-1">
                        {debts.map((debt, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-purple-800">
                            <span>{debt.title}</span>
                            <span className="font-semibold">${debt.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 text-center">
                        {quickPayFrom} doesn't owe anything to {quickPayTo}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Payment amount */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">
                Payment Amount
              </label>
              <input
                type="number"
                value={quickPayAmount}
                onChange={(e) => setQuickPayAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={calculateTotalOwed(quickPayFrom, quickPayTo).total}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              {calculateTotalOwed(quickPayFrom, quickPayTo).total > 0 && (
                <button
                  onClick={() => setQuickPayAmount(calculateTotalOwed(quickPayFrom, quickPayTo).total.toFixed(2))}
                  className="mt-2 text-sm text-purple-600 font-semibold hover:underline"
                >
                  Pay full amount (${calculateTotalOwed(quickPayFrom, quickPayTo).total.toFixed(2)})
                </button>
              )}
            </div>

            {/* Preview */}
            {quickPayAmount && parseFloat(quickPayAmount) > 0 && (() => {
              const { debts } = calculateTotalOwed(quickPayFrom, quickPayTo);
              const paymentAmount = parseFloat(quickPayAmount);
              const sortedDebts = [...debts].sort((a, b) => a.amount - b.amount);
              let remaining = paymentAmount;
              
              return (
                <div className="mb-4 bg-green-50 rounded-xl p-3 border border-green-200">
                  <p className="text-sm text-green-900 mb-2">
                    <span className="font-bold">{quickPayFrom}</span> will pay{" "}
                    <span className="font-bold">${paymentAmount.toFixed(2)}</span> to{" "}
                    <span className="font-bold">{quickPayTo}</span>:
                  </p>
                  <div className="space-y-1 pl-2">
                    {sortedDebts.map((debt, idx) => {
                      const payment = Math.min(remaining, debt.amount);
                      remaining -= payment;
                      const isPaidOff = payment >= debt.amount;
                      return (
                        <div key={idx} className="flex justify-between text-xs text-green-800">
                          <span>{debt.title} {isPaidOff && "✓"}</span>
                          <span className="font-semibold">${payment.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2">
              <button
                onClick={handleQuickPay}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-semibold border-2 border-gray-900"
              >
                Record Payment
              </button>
              <button
                onClick={() => {
                  setShowQuickPay(false);
                  setQuickPayAmount("");
                }}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition font-semibold border-2 border-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="mb-5 bg-white border-2 border-gray-900 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">New Expense</h3>
              <button
                onClick={() => {
                  setShowAddExpense(false);
                  setExpenseTitle("");
                  setExpenseAmount("");
                  setExpenseDate("");
                  setSplitType("equal");
                  setCustomSplits({});
                  setCustomSplitMode("dollar");
                  setPaidBy("");
                  // Reset all members to included
                  const resetIncluded: { [key: string]: boolean } = {};
                  currentTrip.members.forEach((member: string) => {
                    resetIncluded[member] = true;
                  });
                  setIncludedMembers(resetIncluded);
                  setSplitErrors({});
                  setFieldErrors({});
                  setShakeFields({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => {
                setExpenseTitle(e.target.value);
                // Clear error when user starts typing
                if (e.target.value.trim() && fieldErrors.title) {
                  setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.title;
                    return newErrors;
                  });
                }
              }}
              placeholder="Expense name (e.g., Dinner)"
              className={`w-full p-3 border-2 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                fieldErrors.title
                  ? `border-red-500 ${shakeFields.title ? 'animate-shake' : ''}` 
                  : 'border-gray-300'
              }`}
            />

            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">
                $
              </span>
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => {
                  setExpenseAmount(e.target.value);
                  // Clear error when user enters a valid amount
                  if (e.target.value && parseFloat(e.target.value || "0") > 0 && fieldErrors.amount) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.amount;
                      return newErrors;
                    });
                  }
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full p-3 pl-7 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  fieldErrors.amount
                    ? `border-red-500 ${shakeFields.amount ? 'animate-shake' : ''}` 
                    : 'border-gray-300'
                }`}
              />
            </div>

            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />

            {/* Who Paid */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">
                Who paid?
              </label>
              <CustomSelect
                value={paidBy}
                onValueChange={setPaidBy}
                options={currentTrip.members.map((member) => ({
                  value: member,
                  label: member,
                }))}
                placeholder="Select who paid"
              />
            </div>

            {/* Split Type */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">
                Split among others:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSplitType("equal")}
                  className={`flex-1 py-2 rounded-xl font-semibold transition ${
                    splitType === "equal"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Split Equally
                </button>
                <button
                  onClick={() => setSplitType("custom")}
                  className={`flex-1 py-2 rounded-xl font-semibold transition ${
                    splitType === "custom"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Custom Split
                </button>
              </div>
            </div>

            {/* Custom Split Inputs */}
            {splitType === "custom" && expenseAmount && (
              <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                {/* Dollar vs Percent Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => {
                      setCustomSplitMode("dollar");
                      setCustomSplits({});
                    }}
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                      customSplitMode === "dollar"
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    $ Dollar
                  </button>
                  <button
                    onClick={() => {
                      setCustomSplitMode("percent");
                      setCustomSplits({});
                    }}
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                      customSplitMode === "percent"
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    % Percent
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">
                    Select members to include in split
                  </p>
                  {(() => {
                    // Calculate auto-split for members without values
                    const includedMembersList = currentTrip.members.filter(m => includedMembers[m] !== false);
                    // Show remaining indicator using autofilled totals
                    // This shows the ACTUAL remaining including what autofilled members would get
                    const tolerance = customSplitMode === "percent" ? 0.1 : 0.01;
                    const isComplete = Math.abs(remainingWithAutofill) <= tolerance;
                    
                    return (
                      <p
                        className={`text-sm font-bold ${
                          shakeRemaining ? 'animate-shake' : ''
                        } ${isComplete ? "text-green-600" : "text-red-600"}`}
                      >
                        {customSplitMode === "percent" ? (
                          remainingWithAutofill > tolerance
                            ? `${remainingWithAutofill.toFixed(1)}% left`
                            : remainingWithAutofill < -tolerance
                              ? `${Math.abs(remainingWithAutofill).toFixed(1)}% over`
                              : "Complete!"
                        ) : (
                          remainingWithAutofill > tolerance
                            ? `$${remainingWithAutofill.toFixed(2)} left`
                            : remainingWithAutofill < -tolerance
                              ? `$${Math.abs(remainingWithAutofill).toFixed(2)} over`
                              : "Complete!"
                        )}
                      </p>
                    );
                  })()}
                </div>
                <div className="space-y-2">
                  {(() => {
                    // Calculate auto-split for members without values
                    const includedMembersList = currentTrip.members.filter(m => includedMembers[m] !== false);
                    const membersWithValues = includedMembersList.filter(m => customSplits[m] && parseFloat(customSplits[m]) > 0);
                    const membersWithoutValues = includedMembersList.filter(m => !customSplits[m] || parseFloat(customSplits[m]) === 0);
                    
                    // Calculate what's already allocated
                    const allocatedTotal = membersWithValues.reduce(
                      (sum, member) => sum + parseFloat(customSplits[member] || "0"),
                      0
                    );
                    
                    // Calculate auto-split for remaining members
                    const remainingToSplit = customSplitMode === "percent" 
                      ? 100 - allocatedTotal 
                      : parseFloat(expenseAmount || "0") - allocatedTotal;
                    
                    const autoSplitValue = membersWithoutValues.length > 0 
                      ? remainingToSplit / membersWithoutValues.length 
                      : 0;
                    
                    return currentTrip.members.map((member) => {
                      const hasCustomValue = customSplits[member] && parseFloat(customSplits[member]) > 0;
                      const inputValue = hasCustomValue ? parseFloat(customSplits[member]) : autoSplitValue;
                      const dollarAmount = customSplitMode === "percent" 
                        ? (inputValue / 100) * parseFloat(expenseAmount)
                        : inputValue;
                      const isIncluded = includedMembers[member] !== false;
                      const displayValue = hasCustomValue ? customSplits[member] : "";
                      const placeholderValue = isIncluded && autoSplitValue > 0
                        ? customSplitMode === "percent"
                          ? autoSplitValue.toFixed(1)
                          : autoSplitValue.toFixed(2)
                        : customSplitMode === "percent" ? "0" : "0.00";
                      
                      return (
                        <div key={member}>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isIncluded}
                              onCheckedChange={() => toggleMemberInclusion(member)}
                              className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                            <label className={`w-20 font-semibold text-sm ${member === paidBy ? 'text-purple-600' : ''} ${!isIncluded ? 'opacity-50' : ''}`}>
                              {member}{member === paidBy ? ' (paid)' : ''}:
                            </label>
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={displayValue}
                                onChange={(e) =>
                                  updateCustomSplit(member, e.target.value)
                                }
                                placeholder={placeholderValue}
                                step={customSplitMode === "percent" ? "1" : "0.01"}
                                min="0"
                                max={customSplitMode === "percent" ? "100" : expenseAmount}
                                disabled={!isIncluded}
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                  splitErrors[member]
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-purple-600 focus:border-transparent'
                                } ${!isIncluded ? 'bg-gray-100 cursor-not-allowed' : ''} ${!hasCustomValue && isIncluded ? 'placeholder:text-gray-400 placeholder:font-normal' : ''}`}
                              />
                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm ${!isIncluded ? 'opacity-50' : ''}`}>
                                {customSplitMode === "percent" ? "%" : "$"}
                              </span>
                            </div>
                          </div>
                          {splitErrors[member] && (
                            <div className="ml-[5.5rem] mt-1">
                              <span className="text-xs text-red-500">
                                {splitErrors[member]}
                              </span>
                            </div>
                          )}
                          {customSplitMode === "percent" && isIncluded && inputValue > 0 && !splitErrors[member] && (
                            <div className="ml-[5.5rem] mt-1">
                              <span className={`text-xs ${hasCustomValue ? 'text-gray-500' : 'text-gray-400'}`}>
                                = ${dollarAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Preview */}
            {splitType === "equal" &&
              expenseAmount &&
              currentTrip.members.length > 0 && (() => {
                const splitMembers = currentTrip.members.filter((m) => m !== paidBy);
                return (
                  <div className="mb-4 bg-purple-50 rounded-xl p-3 border border-purple-200">
                    <p className="text-sm text-purple-900">
                      {paidBy} paid ${expenseAmount}. Split equally among all {currentTrip.members.length} members. Each of{" "}
                      {splitMembers.join(", ")} owes:{" "}
                      <span className="font-bold">
                        $
                        {(
                          parseFloat(expenseAmount) / currentTrip.members.length
                        ).toFixed(2)}
                      </span>
                    </p>
                  </div>
                );
              })()}

            <div className="flex gap-2">
              <button
                onClick={addExpense}
                className={`flex-1 py-3 rounded-xl transition font-semibold border-2 border-gray-900 ${
                  (() => {
                    // Basic validation
                    if (!expenseTitle.trim() || !expenseAmount || parseFloat(expenseAmount || "0") <= 0 || !paidBy) {
                      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
                    }
                    
                    // Split errors
                    if (Object.keys(splitErrors).length > 0) {
                      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
                    }
                    
                    // For custom split, only check remaining if ALL included members have manual values
                    if (splitType === "custom") {
                      const includedMembersList = currentTrip.members.filter(m => includedMembers[m] !== false);
                      const membersWithValues = includedMembersList.filter(m => customSplits[m] && parseFloat(customSplits[m]) > 0);
                      const allMembersHaveValues = includedMembersList.length > 0 && membersWithValues.length === includedMembersList.length;
                      
                      // Only disable if all members have values AND remaining is not 0
                      if (allMembersHaveValues && remaining !== 0) {
                        return 'bg-gray-300 text-gray-500 cursor-not-allowed';
                      }
                    }
                    
                    return 'bg-purple-600 text-white hover:bg-purple-700';
                  })()
                }`}
              >
                Add Expense
              </button>
              <button
                onClick={() => {
                  setShowAddExpense(false);
                  setExpenseTitle("");
                  setExpenseAmount("");
                  setExpenseDate("");
                  setSplitType("equal");
                  setCustomSplits({});
                  setCustomSplitMode("dollar");
                  setPaidBy("");
                  // Reset all members to included
                  const resetIncluded: { [key: string]: boolean } = {};
                  currentTrip.members.forEach((member: string) => {
                    resetIncluded[member] = true;
                  });
                  setIncludedMembers(resetIncluded);
                  setSplitErrors({});
                  setFieldErrors({});
                  setShakeFields({});
                }}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition font-semibold border-2 border-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active Expense Cards */}
        <div>
          {expenses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-900 p-8">
              <p className="text-gray-500 text-lg">No expenses yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Add an expense to get started!
              </p>
            </div>
          ) : (
            <>
              {activeExpenses.length === 0 && settledExpenses.length > 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-green-200 p-8 mb-6">
                  <p className="text-green-600 text-lg font-semibold">✓ All expenses are settled!</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Great job keeping things balanced.
                  </p>
                </div>
              ) : (
                activeExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    title={expense.title}
                    totalAmount={expense.totalAmount}
                    paidBy={expense.paidBy}
                    splits={expense.splits}
                    date={expense.date}
                    onPayment={(payer, amount) =>
                      handlePayment(expense.id, payer, amount)
                    }
                    isSettled={false}
                  />
                ))
              )}

              {/* Settled Expenses Section */}
              {settledExpenses.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-600 mb-4 flex items-center gap-2">
                    <span className="text-green-600">✓</span> Settled Expenses
                  </h2>
                  {settledExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      title={expense.title}
                      totalAmount={expense.totalAmount}
                      paidBy={expense.paidBy}
                      splits={expense.splits}
                      date={expense.date}
                      onPayment={(payer, amount) =>
                        handlePayment(expense.id, payer, amount)
                      }
                      isSettled={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
