import React, { useState, useEffect, useReducer } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaSave, FaTimes, FaRupeeSign } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

Chart.register(...registerables);

const initialState = {
  expenses: JSON.parse(localStorage.getItem('expenses')) || [],
  categories: [
    { id: 1, name: 'Food', color: '#FF6B6B' },
    { id: 2, name: 'Transport', color: '#4ECDC4' },
    { id: 3, name: 'Rent', color: '#45B7D1' },
    { id: 4, name: 'Shopping', color: '#96CEB4' },
    { id: 5, name: 'Utilities', color: '#FFEEAD' },
  ],
  budget: JSON.parse(localStorage.getItem('budget')) || 50000,
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(exp => exp.id !== action.payload) };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(exp => 
          exp.id === action.payload.id ? action.payload : exp
        ),
      };
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    default:
      return state;
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
    localStorage.setItem('budget', JSON.stringify(state.budget));
  }, [state.expenses, state.budget]);

  const addExpense = (e) => {
    e.preventDefault();
    if (!title || !amount || !date || !categoryId) {
      toast.error('Please fill all fields!');
      return;
    }

    const newExpense = {
      id: Date.now(),
      title,
      amount: +amount,
      date: format(parseISO(date), 'yyyy-MM-dd'),
      categoryId: +categoryId,
    };

    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    toast.success('Expense added successfully! 🎉');
    resetForm();
  };

  const deleteExpense = (id) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    toast.error('Expense deleted');
  };

  const startEditing = (expense) => {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setDate(format(parseISO(expense.date), 'yyyy-MM-dd'));
    setCategoryId(expense.categoryId);
  };

  const updateExpense = () => {
    const updatedExpense = {
      id: editingId,
      title,
      amount: +amount,
      date: format(parseISO(date), 'yyyy-MM-dd'),
      categoryId: +categoryId,
    };

    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    toast.info('Expense updated successfully! ✔️');
    resetForm();
    setEditingId(null);
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDate('');
    setCategoryId('');
  };

  const filteredExpenses = state.expenses.filter(expense => {
    const matchesYear = expense.date.split('-')[0] === selectedYear;
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="container py-4">
      <header className="text-center mb-5">
        <h1 className="display-4 text-primary fw-bold">
          Expense Tracker
        </h1>
      </header>

      <div className="card budget-card mb-4 shadow">
        <div className="card-body">
          <h2 className="card-title fs-4">
            Monthly Budget: 
            <div className="input-group w-auto d-inline-flex ms-2">
              <span className="input-group-text"><FaRupeeSign /></span>
              <input
                type="number"
                value={state.budget}
                onChange={e => dispatch({ type: 'SET_BUDGET', payload: +e.target.value })}
                className="form-control"
                style={{ maxWidth: '150px' }}
              />
            </div>
          </h2>
          <div className="progress mt-2" style={{ height: '25px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar"
              style={{ width: `${Math.min((totalSpent/state.budget)*100, 100)}%` }}
            >
              Spent: ₹{totalSpent.toLocaleString('en-IN')} / ₹{state.budget.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={editingId ? updateExpense : addExpense} className="row g-3 mb-4">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Expense Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2">
          <div className="input-group">
            <span className="input-group-text"><FaRupeeSign /></span>
            <input
              type="number"
              className="form-control"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {state.categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-primary'} w-100`}>
            {editingId ? <FaSave /> : 'Add Expense'}
          </button>
        </div>
      </form>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ maxWidth: '120px' }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title fs-5 mb-3">Monthly Spending Analysis</h3>
              <div style={{ height: '300px' }}>
                <MonthlyBudgetChart expenses={filteredExpenses} budget={state.budget} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title fs-5 mb-3">Category Distribution</h3>
              <div style={{ height: '300px' }}>
                <CategoryPieChart expenses={filteredExpenses} categories={state.categories} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title fs-4 mb-4">Recent Expenses</h2>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <tbody>
                {filteredExpenses.map(expense => (
                  <tr key={expense.id}>
                    <td style={{ width: '50%' }}>
                      <div className="d-flex align-items-center">
                        <span 
                          className="category-badge me-3"
                          style={{ 
                            backgroundColor: state.categories.find(c => c.id === expense.categoryId)?.color 
                          }}
                        ></span>
                        <div>
                          <div className="fw-bold">{expense.title}</div>
                          <small className="text-muted">{format(parseISO(expense.date), 'dd MMM yyyy')}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-end" style={{ width: '30%' }}>
                      <span className="badge bg-primary fs-6">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="text-end" style={{ width: '20%' }}>
                      <button 
                        onClick={() => startEditing(expense)}
                        className="btn btn-sm btn-outline-secondary me-2"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

const MonthlyBudgetChart = ({ expenses, budget }) => {
  const months = eachMonthOfInterval({
    start: new Date(2023, 0, 1),
    end: new Date(2023, 11, 31),
  });

  const data = {
    labels: months.map(month => format(month, 'MMM')),
    datasets: [
      {
        label: 'Spending',
        type: 'bar',
        data: months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          return expenses
            .filter(exp => {
              const expDate = parseISO(exp.date);
              return expDate >= monthStart && expDate <= monthEnd;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Budget',
        type: 'line',
        data: Array(12).fill(budget),
        borderColor: '#FF6384',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

const CategoryPieChart = ({ expenses, categories }) => {
  const data = {
    labels: categories.map(cat => cat.name),
    datasets: [{
      data: categories.map(cat => 
        expenses.filter(exp => exp.categoryId === cat.id).reduce((sum, exp) => sum + exp.amount, 0)
      ),
      backgroundColor: categories.map(cat => cat.color),
    }],
  };

  return <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

export default App;