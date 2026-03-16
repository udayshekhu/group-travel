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
}

const defaultExpenses: Expense[] = [
  {
    id: "1",
    title: "Hotel",
    totalAmount: 1200,
    paidBy: "Sam",
    splits: [
      { name: "Sam", amount: 400, paid: 400 },
      { name: "Alex", amount: 400, paid: 0 },
      { name: "Taylor", amount: 400, paid: 0 },
    ],
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
  },
];

export default function Financials() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [currentTrip, setCurrentTrip] = useState({
    members: ["Jordan", "Sam", "Alex", "Taylor"],
  });

  const currentUser = "Jordan"; // Logged in user

  // Form state
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<
    "equal" | "custom"
  >("equal");
  const [customSplits, setCustomSplits] = useState<{
    [key: string]: string;
  }>({});
  const [customSplitMode, setCustomSplitMode] = useState<
    "dollar" | "percent"
  >("dollar");
  const [includedMembers, setIncludedMembers] = useState<{
    [key: string]: boolean;
  }>({});
  const [manuallyEditedMembers, setManuallyEditedMembers] =
    useState<{ [key: string]: boolean }>({});
  const [splitErrors, setSplitErrors] = useState<{
    [key: string]: string;
  }>({});
  const [shakeRemaining, setShakeRemaining] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [shakeFields, setShakeFields] = useState<{
    [key: string]: boolean;
  }>({});

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
      localStorage.setItem(
        "tripExpenses",
        JSON.stringify(defaultExpenses),
      );
    }

    // Get current trip members
    const storedTrips = localStorage.getItem("trips");
    const storedCurrentTripId =
      localStorage.getItem("currentTripId");
    if (storedTrips && storedCurrentTripId) {
      const trips = JSON.parse(storedTrips);
      const trip = trips.find(
        (t: any) => t.id === storedCurrentTripId,
      );
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
      setQuickPayTo(
        currentTrip.members[1] || currentTrip.members[0],
      );
      // Initialize all members as included by default
      const initialIncluded: { [key: string]: boolean } = {};
      currentTrip.members.forEach((member: string) => {
        initialIncluded[member] = true;
      });
      setIncludedMembers(initialIncluded);
    }
  }, []);

  // Auto-populate splits when expense amount or included members change
  useEffect(() => {
    if (
      !expenseAmount ||
      parseFloat(expenseAmount || "0") <= 0
    ) {
      return;
    }

    const includedMembersList = currentTrip.members.filter(
      (m) => includedMembers[m],
    );
    if (includedMembersList.length === 0) {
      return;
    }

    // Only auto-split if no members have custom values yet
    const hasAnyCustomValues = includedMembersList.some(
      (m) => customSplits[m] && parseFloat(customSplits[m]) > 0,
    );
    if (hasAnyCustomValues) {
      return;
    }

    // Calculate even split
    const evenSplit =
      customSplitMode === "percent"
        ? (100 / includedMembersList.length).toFixed(1)
        : (
            parseFloat(expenseAmount) /
            includedMembersList.length
          ).toFixed(2);

    const newSplits: { [key: string]: string } = {};
    includedMembersList.forEach((member) => {
      newSplits[member] = evenSplit;
    });
    setCustomSplits(newSplits);
  }, [
    expenseAmount,
    includedMembers,
    currentTrip.members,
    customSplitMode,
  ]);

  const addExpense = () => {
    // Validate required fields
    const errors: { [key: string]: boolean } = {};
    const shakes: { [key: string]: boolean } = {};

    if (!expenseTitle.trim()) {
      errors.title = true;
      shakes.title = true;
    }

    if (
      !expenseAmount ||
      parseFloat(expenseAmount || "0") <= 0
    ) {
      errors.amount = true;
      shakes.amount = true;
    }

    if (!paidBy) {
      errors.paidBy = true;
      shakes.paidBy = true;
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

    const total = parseFloat(expenseAmount);
    const includedMembersList = currentTrip.members.filter(
      (m) => includedMembers[m],
    );

    // Validate that at least one member is included
    if (includedMembersList.length === 0) {
      alert(
        "Please select at least one member to split the expense with",
      );
      return;
    }

    // Calculate the total split amount (including auto-splits)
    const membersWithManualValues = includedMembersList.filter(
      (m) =>
        manuallyEditedMembers[m] &&
        customSplits[m] &&
        parseFloat(customSplits[m]) > 0,
    );
    const membersWithoutManualValues = includedMembersList.filter(
      (m) => !manuallyEditedMembers[m],
    );

    // Calculate what's already allocated by manual entries
    const manuallyAllocatedTotal = membersWithManualValues.reduce(
      (sum, member) =>
        sum + parseFloat(customSplits[member] || "0"),
      0,
    );

    // Calculate what would be auto-split among non-manual members
    const remainingToSplit =
      customSplitMode === "percent"
        ? 100 - manuallyAllocatedTotal
        : total - manuallyAllocatedTotal;

    const autoSplitValue =
      membersWithoutManualValues.length > 0
        ? remainingToSplit / membersWithoutManualValues.length
        : 0;

    // Calculate the actual total (manual + auto)
    let actualTotal = manuallyAllocatedTotal;
    if (membersWithoutManualValues.length > 0) {
      actualTotal +=
        autoSplitValue * membersWithoutManualValues.length;
    }

    // Validate the total matches
    const targetTotal =
      customSplitMode === "percent" ? 100 : total;
    const tolerance =
      customSplitMode === "percent" ? 0.1 : 0.01;

    if (Math.abs(actualTotal - targetTotal) > tolerance) {
      setShakeRemaining(true);
      setTimeout(() => setShakeRemaining(false), 600);
      return;
    }

    // IMPORTANT: If more than 1 member is included, none should have $0
    if (includedMembersList.length > 1) {
      // Check if any member would have a $0 value (either manual or auto)
      const hasZeroValue = includedMembersList.some((member) => {
        if (manuallyEditedMembers[member]) {
          // Manual value
          return (
            !customSplits[member] || parseFloat(customSplits[member]) <= 0
          );
        } else {
          // Auto value
          return autoSplitValue <= tolerance;
        }
      });

      if (hasZeroValue) {
        alert(
          "When splitting among multiple members, all members must have an amount greater than $0. Please adjust the split or uncheck members who should not be included.",
        );
        return;
      }
    }

    let splits: Split[] = [];

    // Calculate splits - only include checked members
    const allMemberSplits: { [key: string]: number } = {};

    // First, calculate auto-split for members without custom values
    const sortedMembers = [...currentTrip.members].sort(
      (a, b) => {
        if (a === paidBy) return -1;
        if (b === paidBy) return 1;
        return 0;
      },
    );

    sortedMembers.forEach((member) => {
      // Only calculate splits for included members
      if (includedMembers[member]) {
        // Use the same logic as the UI display
        const isManuallyEdited = manuallyEditedMembers[member];
        const hasCustomValue =
          isManuallyEdited &&
          customSplits[member] &&
          parseFloat(customSplits[member]) > 0;
        
        const inputValue = hasCustomValue
          ? customSplits[member]
          : autoSplitValue.toString();

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

    // Include only members who have a non-zero amount
    // Use sortedMembers to ensure payer is at the top
    splits = sortedMembers
      .filter((m) => includedMembers[m] && allMemberSplits[m] > 0.001) // Only include if amount > 0
      .map((member) => {
        const amount = allMemberSplits[member];
        // If this is the payer, mark them as already paid
        const paid = member === paidBy ? amount : 0;
        return {
          name: member,
          amount: amount,
          paid: paid,
        };
      });

    const newExpense: Expense = {
      id: Date.now().toString(),
      title: expenseTitle,
      totalAmount: total,
      paidBy,
      splits,
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem(
      "tripExpenses",
      JSON.stringify(updatedExpenses),
    );

    // Reset form
    setExpenseTitle("");
    setExpenseAmount("");
    setSplitType("equal");
    setCustomSplits({});
    setCustomSplitMode("dollar");
    // Reset all members to included
    const resetIncluded: { [key: string]: boolean } = {};
    currentTrip.members.forEach((member: string) => {
      resetIncluded[member] = true;
    });
    setIncludedMembers(resetIncluded);
    setManuallyEditedMembers({});
    setSplitErrors({});
    setShowAddExpense(false);
  };

  const updateCustomSplit = (member: string, value: string) => {
    // Update the value first
    setCustomSplits((prev) => ({
      ...prev,
      [member]: value,
    }));

    // If value is empty or 0, remove from manually edited members
    if (value === "" || value === "0") {
      setManuallyEditedMembers((prev) => {
        const newManuallyEdited = { ...prev };
        delete newManuallyEdited[member];
        return newManuallyEdited;
      });

      // Clear any error for this member
      setSplitErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[member];
        return newErrors;
      });
      return;
    }

    // Mark this member as manually edited (only if value is not empty/0)
    setManuallyEditedMembers((prev) => ({
      ...prev,
      [member]: true,
    }));

    // Validate the input
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

  const handlePayment = (
    expenseId: string,
    payer: string,
    amount: number,
  ) => {
    const updatedExpenses = expenses.map((expense) => {
      if (expense.id === expenseId) {
        return {
          ...expense,
          splits: expense.splits.map((split) =>
            split.name === payer
              ? {
                  ...split,
                  paid: Math.min(
                    split.paid + amount,
                    split.amount,
                  ),
                }
              : split,
          ),
        };
      }
      return expense;
    });
    setExpenses(updatedExpenses);
    localStorage.setItem(
      "tripExpenses",
      JSON.stringify(updatedExpenses),
    );
  };

  // Calculate total owed from one person to another across all expenses
  const calculateTotalOwed = (from: string, to: string) => {
    let total = 0;
    const debts: {
      expenseId: string;
      title: string;
      amount: number;
    }[] = [];

    expenses.forEach((expense) => {
      if (expense.paidBy === to) {
        const split = expense.splits.find(
          (s) => s.name === from,
        );
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

    const { total, debts } = calculateTotalOwed(
      quickPayFrom,
      quickPayTo,
    );

    if (total === 0) {
      alert(
        `${quickPayFrom} doesn't owe anything to ${quickPayTo}`,
      );
      return;
    }

    if (amount > total) {
      alert(
        `Payment amount ($${amount.toFixed(2)}) exceeds total owed ($${total.toFixed(2)})`,
      );
      return;
    }

    // Sort debts from smallest to largest and pay them off in order
    const sortedDebts = [...debts].sort(
      (a, b) => a.amount - b.amount,
    );
    const updatedExpenses = [...expenses];
    let remainingAmount = amount;

    sortedDebts.forEach((debt) => {
      if (remainingAmount <= 0) return;

      // Pay as much as possible for this debt
      const paymentForThisDebt = Math.min(
        remainingAmount,
        debt.amount,
      );
      remainingAmount -= paymentForThisDebt;

      const expenseIndex = updatedExpenses.findIndex(
        (e) => e.id === debt.expenseId,
      );
      if (expenseIndex !== -1) {
        updatedExpenses[expenseIndex] = {
          ...updatedExpenses[expenseIndex],
          splits: updatedExpenses[expenseIndex].splits.map(
            (split) =>
              split.name === quickPayFrom
                ? {
                    ...split,
                    paid: Math.min(
                      split.paid + paymentForThisDebt,
                      split.amount,
                    ),
                  }
                : split,
          ),
        };
      }
    });

    setExpenses(updatedExpenses);
    localStorage.setItem(
      "tripExpenses",
      JSON.stringify(updatedExpenses),
    );

    setQuickPayAmount("");
    setShowQuickPay(false);
  };

  // Calculate custom split totals (only include checked members with actual values entered)
  const includedMembersList = currentTrip.members.filter(
    (m) => includedMembers[m],
  );
  const customTotal = includedMembersList.reduce(
    (sum, member) =>
      sum + parseFloat(customSplits[member] || "0"),
    0,
  );

  // Calculate remaining based on BOTH manually edited members AND auto-split members
  const manuallyEditedMembersList = includedMembersList.filter(
    (m) => manuallyEditedMembers[m],
  );
  const autoMembersList = includedMembersList.filter(
    (m) => !manuallyEditedMembers[m],
  );

  const manuallyAllocatedTotal =
    manuallyEditedMembersList.reduce(
      (sum, member) =>
        sum + parseFloat(customSplits[member] || "0"),
      0,
    );

  // Calculate auto-split for remaining members
  const remainingToSplit =
    expenseAmount && customSplitMode === "percent"
      ? 100 - manuallyAllocatedTotal
      : expenseAmount
        ? parseFloat(expenseAmount) - manuallyAllocatedTotal
        : 0;

  const autoSplitValue =
    autoMembersList.length > 0
      ? remainingToSplit / autoMembersList.length
      : 0;

  // Calculate total including auto-split
  const totalWithAuto =
    manuallyAllocatedTotal +
    autoSplitValue * autoMembersList.length;

  // Remaining is the difference between target and total (including auto)
  const targetTotal = expenseAmount
    ? customSplitMode === "percent"
      ? 100
      : parseFloat(expenseAmount)
    : 0;
  const remaining = targetTotal - totalWithAuto;

  // Helper function to check if an expense is fully settled
  const isExpenseSettled = (expense: Expense) => {
    return expense.splits.every(
      (split) => split.paid >= split.amount,
    );
  };

  // Separate expenses into active and settled
  const activeExpenses = expenses.filter(
    (exp) => !isExpenseSettled(exp),
  );
  const settledExpenses = expenses.filter((exp) =>
    isExpenseSettled(exp),
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">
            Financials
          </h1>
          <p className="text-gray-600 text-lg">
            Track group expenses
          </p>
        </div>

        {/* Action Buttons */}
        {!showAddExpense && (
          <div className="mb-5">
            <button
              onClick={() => {
                setShowAddExpense(true);
                // Reset to fresh state
                setExpenseTitle("");
                setExpenseAmount("");
                setSplitType("equal");
                setCustomSplits({});
                setCustomSplitMode("dollar");
                setPaidBy(currentTrip.members[0]);
                // Auto-select all members by default
                const resetIncluded: {
                  [key: string]: boolean;
                } = {};
                currentTrip.members.forEach(
                  (member: string) => {
                    resetIncluded[member] = true;
                  },
                );
                setIncludedMembers(resetIncluded);
                setManuallyEditedMembers({});
                setSplitErrors({});
                setFieldErrors({});
                setShakeFields({});
              }}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-2xl text-base font-semibold hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <Plus size={20} strokeWidth={2.5} />
              Add Expense
            </button>
          </div>
        )}

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div
              className="absolute inset-0"
              onClick={() => {
                setShowAddExpense(false);
                setExpenseTitle("");
                setExpenseAmount("");
                setSplitType("equal");
                setCustomSplits({});
                setCustomSplitMode("dollar");
                setPaidBy("");
                // Reset all members to not included by default
                const resetIncluded: {
                  [key: string]: boolean;
                } = {};
                currentTrip.members.forEach(
                  (member: string) => {
                    resetIncluded[member] = false;
                  },
                );
                setIncludedMembers(resetIncluded);
                setManuallyEditedMembers({});
                setSplitErrors({});
                setFieldErrors({});
                setShakeFields({});
              }}
            />

            {/* Modal Content */}
            <div className="relative bg-white border-2 border-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col z-10">
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-2xl font-bold">
                  New Expense
                </h3>
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setExpenseTitle("");
                    setExpenseAmount("");
                    setSplitType("equal");
                    setCustomSplits({});
                    setCustomSplitMode("dollar");
                    setPaidBy("");
                    // Reset all members to included
                    const resetIncluded: {
                      [key: string]: boolean;
                    } = {};
                    currentTrip.members.forEach(
                      (member: string) => {
                        resetIncluded[member] = true;
                      },
                    );
                    setIncludedMembers(resetIncluded);
                    setManuallyEditedMembers({});
                    setSplitErrors({});
                    setFieldErrors({});
                    setShakeFields({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-5 [-webkit-overflow-scrolling:touch]">
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => {
                    setExpenseTitle(e.target.value);
                    // Clear error when user starts typing
                    if (
                      e.target.value.trim() &&
                      fieldErrors.title
                    ) {
                      setFieldErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.title;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Expense name (e.g., Dinner)"
                  className={`w-full p-3 border-2 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                    fieldErrors.title
                      ? `border-red-500 ${shakeFields.title ? "animate-shake" : ""}`
                      : "border-gray-300"
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
                      if (
                        e.target.value &&
                        parseFloat(e.target.value || "0") > 0 &&
                        fieldErrors.amount
                      ) {
                        setFieldErrors((prev) => {
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
                        ? `border-red-500 ${shakeFields.amount ? "animate-shake" : ""}`
                        : "border-gray-300"
                    }`}
                  />
                </div>

                {/* Who Paid */}
                <div className="mb-4">
                  <label className="block text-lg font-semibold mb-2">
                    Who paid?
                  </label>
                  <CustomSelect
                    value={paidBy}
                    onValueChange={setPaidBy}
                    options={currentTrip.members.map(
                      (member) => ({
                        value: member,
                        label:
                          member === currentUser
                            ? `${member} (me)`
                            : member,
                      }),
                    )}
                    placeholder="Select who paid"
                  />
                </div>

                {/* Split Among Others Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label
                      className={`block text-lg font-semibold ${!expenseAmount || parseFloat(expenseAmount || "0") <= 0 ? "text-gray-400" : ""}`}
                    >
                      Split among others:
                    </label>
                    {expenseAmount &&
                      parseFloat(expenseAmount || "0") > 0 && (
                        <button
                          onClick={() => {
                            // Calculate even split for all included members
                            const includedMembersList =
                              currentTrip.members.filter(
                                (m) => includedMembers[m],
                              );
                            if (
                              includedMembersList.length === 0
                            )
                              return;

                            const evenSplit =
                              customSplitMode === "percent"
                                ? (
                                    100 /
                                    includedMembersList.length
                                  ).toFixed(1)
                                : (
                                    parseFloat(expenseAmount) /
                                    includedMembersList.length
                                  ).toFixed(2);

                            const newSplits: {
                              [key: string]: string;
                            } = {};
                            includedMembersList.forEach(
                              (member) => {
                                newSplits[member] = evenSplit;
                              },
                            );
                            setCustomSplits(newSplits);

                            // Mark all members as manually edited since we just set their values
                            const newManuallyEdited: {
                              [key: string]: boolean;
                            } = {};
                            includedMembersList.forEach(
                              (member) => {
                                newManuallyEdited[member] =
                                  true;
                              },
                            );
                            setManuallyEditedMembers(
                              newManuallyEdited,
                            );
                          }}
                          className="text-sm text-purple-600 font-semibold hover:underline"
                        >
                          Split Evenly
                        </button>
                      )}
                  </div>

                  <div
                    className={`bg-gray-50 rounded-xl p-4 border border-gray-200 ${!expenseAmount || parseFloat(expenseAmount || "0") <= 0 ? "opacity-50 pointer-events-none" : ""}`}
                  >
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
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={currentTrip.members.every(
                            (m) => includedMembers[m] !== false,
                          )}
                          onCheckedChange={(checked) => {
                            const newIncluded: {
                              [key: string]: boolean;
                            } = {};
                            currentTrip.members.forEach(
                              (member: string) => {
                                newIncluded[member] =
                                  checked === true;
                              },
                            );
                            setIncludedMembers(newIncluded);
                          }}
                          className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          Select All
                        </span>
                      </div>
                      {(() => {
                        // Show remaining indicator only when all members are manually edited
                        const tolerance =
                          customSplitMode === "percent"
                            ? 0.1
                            : 0.01;
                        const isComplete =
                          Math.abs(remaining) <= tolerance;

                        // Check if any included members have 0 values
                        const includedMembersList =
                          currentTrip.members.filter(
                            (m) => includedMembers[m],
                          );
                        
                        // Check if any member would have a 0 value (considering both manual and auto)
                        const hasZeroValues = includedMembersList.some((m) => {
                          if (manuallyEditedMembers[m]) {
                            // For manually edited members, check their custom value
                            const value = parseFloat(customSplits[m] || "0");
                            return value <= 0;
                          } else {
                            // For auto members, check the auto-split value
                            return autoSplitValue <= 0;
                          }
                        });

                        // Show error if there are multiple members and any would have 0 values
                        // BUT only if there's actually an expense amount entered
                        if (
                          includedMembersList.length > 1 &&
                          hasZeroValues &&
                          parseFloat(expenseAmount) > 0
                        ) {
                          return (
                            <p
                              className={`text-sm font-bold text-red-600 ${shakeRemaining ? "animate-shake" : ""}`}
                            >
                              All selected must be &gt; 0
                            </p>
                          );
                        }

                        // Show remaining calculation if any members have been manually edited
                        if (
                          manuallyEditedMembersList.length > 0
                        ) {
                          return (
                            <p
                              className={`text-sm font-bold ${
                                shakeRemaining
                                  ? "animate-shake"
                                  : ""
                              } ${isComplete ? "text-green-600" : "text-red-600"}`}
                            >
                              {customSplitMode === "percent"
                                ? remaining > tolerance
                                  ? `${remaining.toFixed(1)}% left`
                                  : remaining < -tolerance
                                    ? `${Math.abs(remaining).toFixed(1)}% over`
                                    : "Complete!"
                                : remaining > tolerance
                                  ? `$${remaining.toFixed(2)} left`
                                  : remaining < -tolerance
                                    ? `$${Math.abs(remaining).toFixed(2)} over`
                                    : "Complete!"}
                            </p>
                          );
                        }

                        return (
                          <p className="text-sm font-bold text-green-600">
                            Complete!
                          </p>
                        );
                      })()}
                    </div>
                    <div className="space-y-2">
                      {(() => {
                        // Calculate auto-split for non-manually-edited members
                        const includedMembersList =
                          currentTrip.members.filter(
                            (m) => includedMembers[m] !== false,
                          );
                        const manuallyEditedMembersList =
                          includedMembersList.filter(
                            (m) => manuallyEditedMembers[m],
                          );
                        const autoMembersList =
                          includedMembersList.filter(
                            (m) => !manuallyEditedMembers[m],
                          );

                        // Calculate what's already allocated by manually edited members
                        const manuallyAllocatedTotal =
                          manuallyEditedMembersList.reduce(
                            (sum, member) =>
                              sum +
                              parseFloat(
                                customSplits[member] || "0",
                              ),
                            0,
                          );

                        // Calculate auto-split for remaining members
                        const remainingToSplit =
                          customSplitMode === "percent"
                            ? 100 - manuallyAllocatedTotal
                            : parseFloat(expenseAmount || "0") -
                              manuallyAllocatedTotal;

                        const autoSplitValue =
                          autoMembersList.length > 0
                            ? remainingToSplit /
                              autoMembersList.length
                            : 0;

                        // Sort members to put the payer at the top
                        const sortedMembers = [
                          ...currentTrip.members,
                        ].sort((a, b) => {
                          if (a === paidBy) return -1;
                          if (b === paidBy) return 1;
                          return 0;
                        });

                        return sortedMembers.map((member) => {
                          const isIncluded =
                            includedMembers[member];
                          const isManuallyEdited =
                            manuallyEditedMembers[member];

                          // Determine the display value and placeholder
                          let displayValue =
                            customSplits[member] || "";
                          let placeholderValue = "";
                          let isAutoCalculated = false;

                          if (
                            isIncluded &&
                            !isManuallyEdited &&
                            autoMembersList.includes(member)
                          ) {
                            // Auto-calculated value - show as placeholder
                            placeholderValue =
                              autoSplitValue > 0
                                ? autoSplitValue.toFixed(
                                    customSplitMode ===
                                      "percent"
                                      ? 1
                                      : 2,
                                  )
                                : "";
                            isAutoCalculated = true;
                          }

                          // Use display value if manually edited, otherwise it's empty
                          const inputValue = isManuallyEdited
                            ? displayValue
                            : "";

                          // Calculate dollar amount for percent mode tooltip (use placeholder if auto)
                          const valueForDollar =
                            inputValue || placeholderValue;
                          const dollarAmount =
                            customSplitMode === "percent" &&
                            valueForDollar
                              ? (parseFloat(valueForDollar) /
                                  100) *
                                parseFloat(expenseAmount)
                              : 0;

                          return (
                            <div key={member}>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isIncluded}
                                  onCheckedChange={() =>
                                    toggleMemberInclusion(
                                      member,
                                    )
                                  }
                                  className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <label
                                  className={`w-20 font-semibold text-sm ${member === paidBy ? "text-purple-600" : ""}`}
                                >
                                  {member === currentUser
                                    ? `${member} (me)`
                                    : member}
                                  {member === paidBy
                                    ? " (paid)"
                                    : ""}
                                  :
                                </label>
                                <div className="relative flex-1">
                                  {customSplitMode ===
                                    "dollar" && (
                                    <span
                                      className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${!isIncluded ? "opacity-50" : "text-gray-500"}`}
                                    >
                                      $
                                    </span>
                                  )}
                                  <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) =>
                                      updateCustomSplit(
                                        member,
                                        e.target.value,
                                      )
                                    }
                                    placeholder={
                                      placeholderValue ||
                                      (customSplitMode ===
                                      "percent"
                                        ? "0"
                                        : "0.00")
                                    }
                                    step={
                                      customSplitMode ===
                                      "percent"
                                        ? "1"
                                        : "0.01"
                                    }
                                    min="0"
                                    max={
                                      customSplitMode ===
                                      "percent"
                                        ? "100"
                                        : expenseAmount
                                    }
                                    disabled={!isIncluded}
                                    className={`w-full p-2 ${customSplitMode === "dollar" ? "pl-7" : ""} border rounded-lg focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                      splitErrors[member]
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-purple-600 focus:border-transparent"
                                    } ${!isIncluded ? "bg-gray-100 cursor-not-allowed opacity-50" : ""}`}
                                  />
                                  {customSplitMode ===
                                    "percent" && (
                                    <span
                                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${!isIncluded ? "opacity-50" : "text-gray-500"}`}
                                    >
                                      %
                                    </span>
                                  )}
                                </div>
                              </div>
                              {splitErrors[member] && (
                                <div className="ml-[5.5rem] mt-1">
                                  <span className="text-xs text-red-500">
                                    {splitErrors[member]}
                                  </span>
                                </div>
                              )}
                              {customSplitMode === "percent" &&
                                isIncluded &&
                                valueForDollar &&
                                !splitErrors[member] && (
                                  <div className="ml-[5.5rem] mt-1">
                                    <span className="text-xs text-gray-500">
                                      = $
                                      {dollarAmount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addExpense}
                    className={`flex-1 py-3 rounded-xl transition font-semibold border-2 border-gray-900 ${(() => {
                      // Basic validation
                      if (
                        !expenseTitle.trim() ||
                        !expenseAmount ||
                        parseFloat(expenseAmount || "0") <= 0 ||
                        !paidBy
                      ) {
                        return "bg-gray-300 text-gray-500 cursor-not-allowed";
                      }

                      // Split errors
                      if (Object.keys(splitErrors).length > 0) {
                        return "bg-gray-300 text-gray-500 cursor-not-allowed";
                      }

                      const includedMembersList =
                        currentTrip.members.filter(
                          (m) => includedMembers[m] !== false,
                        );
                      
                      // Check if any member would have $0 (same logic as the status indicator)
                      const manuallyEditedMembersList =
                        includedMembersList.filter(
                          (m) => manuallyEditedMembers[m],
                        );
                      const autoMembersList =
                        includedMembersList.filter(
                          (m) => !manuallyEditedMembers[m],
                        );

                      const manuallyAllocatedTotal =
                        manuallyEditedMembersList.reduce(
                          (sum, member) =>
                            sum +
                            parseFloat(
                              customSplits[member] || "0",
                            ),
                          0,
                        );

                      const remainingToSplit =
                        customSplitMode === "percent"
                          ? 100 - manuallyAllocatedTotal
                          : parseFloat(expenseAmount || "0") -
                            manuallyAllocatedTotal;

                      const autoSplitValue =
                        autoMembersList.length > 0
                          ? remainingToSplit /
                            autoMembersList.length
                          : 0;

                      const hasZeroValues = includedMembersList.some((m) => {
                        if (manuallyEditedMembers[m]) {
                          // For manually edited members, check their custom value
                          const value = parseFloat(customSplits[m] || "0");
                          return value <= 0;
                        } else {
                          // For auto members, check the auto-split value
                          return autoSplitValue <= 0;
                        }
                      });

                      // Disable if there are multiple members and any would have $0
                      if (
                        includedMembersList.length > 1 &&
                        hasZeroValues
                      ) {
                        return "bg-gray-300 text-gray-500 cursor-not-allowed";
                      }

                      const membersWithValues =
                        includedMembersList.filter(
                          (m) =>
                            customSplits[m] &&
                            parseFloat(customSplits[m]) > 0,
                        );
                      const allMembersHaveValues =
                        includedMembersList.length > 0 &&
                        membersWithValues.length ===
                          includedMembersList.length;

                      // Only disable if all members have values AND remaining is not 0
                      if (
                        allMembersHaveValues &&
                        remaining !== 0
                      ) {
                        return "bg-gray-300 text-gray-500 cursor-not-allowed";
                      }

                      return "bg-purple-600 text-white hover:bg-purple-700";
                    })()}`}
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={() => {
                      setShowAddExpense(false);
                      setExpenseTitle("");
                      setExpenseAmount("");
                      setSplitType("equal");
                      setCustomSplits({});
                      setCustomSplitMode("dollar");
                      setPaidBy("");
                      // Reset all members to included
                      const resetIncluded: {
                        [key: string]: boolean;
                      } = {};
                      currentTrip.members.forEach(
                        (member: string) => {
                          resetIncluded[member] = true;
                        },
                      );
                      setIncludedMembers(resetIncluded);
                      setManuallyEditedMembers({});
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
            </div>
          </div>
        )}

        {/* Active Expense Cards */}
        <div>
          {expenses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-900 p-8">
              <p className="text-gray-500 text-lg">
                No expenses yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Add an expense to get started!
              </p>
            </div>
          ) : (
            <>
              {activeExpenses.length === 0 &&
              settledExpenses.length > 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-green-200 p-8 mb-6">
                  <p className="text-green-600 text-lg font-semibold">
                    ✓ All expenses are paid!
                  </p>
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
                    <span className="text-green-600">✓</span>{" "}
                    Paid Expenses
                  </h2>
                  {settledExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      title={expense.title}
                      totalAmount={expense.totalAmount}
                      paidBy={expense.paidBy}
                      splits={expense.splits}
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