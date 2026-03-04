import { useState, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { ExpenseCard } from "../components/ExpenseCard";
import { Plus, X, ArrowRight } from "lucide-react";

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
      { name: "Sam", amount: 300, paid: 0 },
      { name: "Alex", amount: 300, paid: 0 },
      { name: "Taylor", amount: 300, paid: 0 },
    ],
    date: "March 1, 2026",
  },
  {
    id: "2",
    title: "Flights",
    totalAmount: 2400,
    paidBy: "Alex",
    splits: [
      { name: "Jordan", amount: 600, paid: 0 },
      { name: "Sam", amount: 600, paid: 0 },
      { name: "Taylor", amount: 600, paid: 0 },
    ],
    date: "February 28, 2026",
  },
  {
    id: "3",
    title: "Activities",
    totalAmount: 800,
    paidBy: "Sam",
    splits: [
      { name: "Jordan", amount: 200, paid: 0 },
      { name: "Alex", amount: 200, paid: 0 },
      { name: "Taylor", amount: 200, paid: 0 },
    ],
    date: "March 2, 2026",
  },
];

export default function Financials() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [currentTrip, setCurrentTrip] = useState({ members: ["Jordan", "Sam", "Alex", "Taylor"] });
  
  // Form state
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [customSplits, setCustomSplits] = useState<{ [key: string]: string }>({});

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
      }
    } else {
      setPaidBy(currentTrip.members[0]);
    }
  }, []);

  const addExpense = () => {
    if (!expenseTitle.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0) {
      alert("Please fill in expense name and amount");
      return;
    }

    if (!paidBy) {
      alert("Please select who paid for this expense");
      return;
    }

    const total = parseFloat(expenseAmount);
    const splitMembers = currentTrip.members.filter(m => m !== paidBy);
    let splits: Split[] = [];

    if (splitType === "equal") {
      const perPerson = total / splitMembers.length;
      splits = splitMembers.map(member => ({
        name: member,
        amount: perPerson,
        paid: 0,
      }));
    } else {
      // Custom splits
      splits = splitMembers.map(member => ({
        name: member,
        amount: parseFloat(customSplits[member] || "0"),
        paid: 0,
      }));

      // Validate custom splits total equals expense amount
      const customTotal = splits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(customTotal - total) > 0.01) {
        alert(`Custom splits ($${customTotal.toFixed(2)}) don't match total expense ($${total.toFixed(2)})`);
        return;
      }
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      title: expenseTitle,
      totalAmount: total,
      paidBy,
      splits,
      date: expenseDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
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
    setShowAddExpense(false);
  };

  const updateCustomSplit = (member: string, value: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [member]: value,
    }));
  };

  const handlePayment = (expenseId: string, payer: string, amount: number) => {
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === expenseId) {
        return {
          ...expense,
          splits: expense.splits.map(split =>
            split.name === payer
              ? { ...split, paid: Math.min(split.paid + amount, split.amount) }
              : split
          ),
        };
      }
      return expense;
    });
    setExpenses(updatedExpenses);
    localStorage.setItem("tripExpenses", JSON.stringify(updatedExpenses));
  };

  // Calculate balances - who owes who what
  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    
    // Initialize balances
    currentTrip.members.forEach(member => {
      balances[member] = 0;
    });

    // Calculate net balance for each person
    expenses.forEach(expense => {
      // Person who paid gets credited
      balances[expense.paidBy] += expense.totalAmount;
      
      // People who owe get debited
      expense.splits.forEach(split => {
        balances[split.name] -= split.amount;
        // Add back what they've already paid
        balances[split.name] += split.paid;
      });
    });

    // Create transfers list
    const transfers: { from: string; to: string; amount: number }[] = [];
    const creditors = Object.entries(balances).filter(([_, balance]) => balance > 0.01);
    const debtors = Object.entries(balances).filter(([_, balance]) => balance < -0.01);

    // Simplified debt settlement
    debtors.forEach(([debtor, debtAmount]) => {
      let remaining = Math.abs(debtAmount);
      
      creditors.forEach(([creditor, creditAmount]) => {
        if (remaining > 0.01 && creditAmount > 0.01) {
          const transfer = Math.min(remaining, creditAmount);
          transfers.push({
            from: debtor,
            to: creditor,
            amount: transfer,
          });
          remaining -= transfer;
          balances[creditor] -= transfer;
        }
      });
    });

    return transfers.filter(t => t.amount > 0.01);
  };

  const splitMembers = currentTrip.members.filter(m => m !== paidBy);
  const customTotal = splitMembers.reduce((sum, member) => sum + parseFloat(customSplits[member] || "0"), 0);
  const remaining = expenseAmount ? parseFloat(expenseAmount) - customTotal : 0;

  const balanceTransfers = calculateBalances();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Financials</h1>
          <p className="text-gray-600 text-lg">Track group expenses</p>
        </div>

        {/* Balance Summary */}
        {balanceTransfers.length > 0 && (
          <div className="mb-5 bg-white border-2 border-gray-900 rounded-2xl p-5 shadow-md">
            <h3 className="text-2xl font-bold mb-4">Balances</h3>
            <div className="space-y-3">
              {balanceTransfers.map((transfer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-bold text-lg">{transfer.from}</span>
                    <ArrowRight className="text-purple-600" size={20} />
                    <span className="font-bold text-lg">{transfer.to}</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    ${transfer.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Expense Button */}
        {!showAddExpense && (
          <button
            onClick={() => setShowAddExpense(true)}
            className="w-full mb-5 bg-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
          >
            <Plus size={24} strokeWidth={2.5} />
            Add Expense
          </button>
        )}

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="mb-5 bg-white border-2 border-gray-900 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">New Expense</h3>
              <button
                onClick={() => setShowAddExpense(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="Expense name (e.g., Dinner)"
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />

            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="Total amount"
              step="0.01"
              min="0"
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />

            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />

            {/* Who Paid */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Who paid?</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {currentTrip.members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            {/* Split Type */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Split among others:</label>
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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">
                    Split among: {splitMembers.join(", ")}
                  </p>
                  <p className={`text-sm font-bold ${remaining === 0 ? 'text-green-600' : remaining > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                    {remaining > 0 ? `$${remaining.toFixed(2)} left` : remaining < 0 ? `$${Math.abs(remaining).toFixed(2)} over` : 'Complete!'}
                  </p>
                </div>
                <div className="space-y-2">
                  {splitMembers.map((member) => (
                    <div key={member} className="flex items-center gap-2">
                      <label className="w-20 font-semibold text-sm">{member}:</label>
                      <input
                        type="number"
                        value={customSplits[member] || ""}
                        onChange={(e) => updateCustomSplit(member, e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            {splitType === "equal" && expenseAmount && splitMembers.length > 0 && (
              <div className="mb-4 bg-purple-50 rounded-xl p-3 border border-purple-200">
                <p className="text-sm text-purple-900">
                  {paidBy} paid ${expenseAmount}. Each of {splitMembers.join(", ")} owes: <span className="font-bold">${(parseFloat(expenseAmount) / splitMembers.length).toFixed(2)}</span>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={addExpense}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-semibold border-2 border-gray-900"
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
                }}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition font-semibold border-2 border-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Expense Cards */}
        <div>
          {expenses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-900 p-8">
              <p className="text-gray-500 text-lg">No expenses yet</p>
              <p className="text-gray-400 text-sm mt-2">Add an expense to get started!</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                totalAmount={expense.totalAmount}
                paidBy={expense.paidBy}
                splits={expense.splits}
                date={expense.date}
                onPayment={(payer, amount) => handlePayment(expense.id, payer, amount)}
              />
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
