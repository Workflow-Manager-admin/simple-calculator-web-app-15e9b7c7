import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Main Calculator Application
 *
 * Minimal, responsive calculator for basic arithmetic (+, -, ×, ÷), clear/reset, keyboard support, and light theme.
 * - Display area at the top
 * - Button grid for numbers and operations
 * - Keyboard & mouse support
 * - Minimalistic light design using theme palette: primary (#1976d2), secondary (#424242), accent (#ff9800)
 */
function App() {
  // Calculator state
  const [display, setDisplay] = useState('0');
  const [operator, setOperator] = useState(null);
  const [operand, setOperand] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastKey, setLastKey] = useState('');
  const inputRef = useRef(null);

  // Focus invisible input for keyboard support
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Keyboard input support
  useEffect(() => {
    const handler = e => {
      if (
        /[0-9]/.test(e.key) ||
        ['+', '-', '*', 'x', 'X', '/', '.', 'Enter', '=', 'Backspace', 'c', 'C', 'Escape', '%'].includes(e.key)
      ) {
        e.preventDefault();
        handleKeyboardInput(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line
  });

  // Map keyboard key to calculator buttons
  // PUBLIC_INTERFACE
  function handleKeyboardInput(key) {
    if (/[0-9]/.test(key)) {
      handleDigit(key);
    } else if (key === '.' || key === ',') {
      handleDot();
    } else if (key === '+' || key === '-') {
      handleOperator(key);
    } else if (key === '*' || key === 'x' || key === 'X') {
      handleOperator('×');
    } else if (key === '/') {
      handleOperator('÷');
    } else if (key === '=' || key === 'Enter') {
      handleEqual();
    } else if (key === '%' || key === '％') {
      handlePercent();
    } else if (key === 'Backspace') {
      handleBackspace();
    } else if (key === 'Escape' || key === 'C' || key === 'c') {
      handleClear();
    }
  }

  // PUBLIC_INTERFACE
  function handleDigit(d) {
    setLastKey(d);
    setDisplay(prev => {
      if (waitingForOperand) {
        setWaitingForOperand(false);
        return d;
      }
      if (prev.length > 14) return prev;
      if (prev === '0' || prev === 'Error') {
        return d;
      }
      return prev + d;
    });
  }

  // PUBLIC_INTERFACE
  function handleDot() {
    setLastKey('.');
    setDisplay(prev => {
      if (waitingForOperand) {
        setWaitingForOperand(false);
        return '0.';
      }
      if (prev.includes('.')) return prev;
      if (prev === 'Error') return '0.';
      return prev + '.';
    });
  }

  // PUBLIC_INTERFACE
  function handleOperator(op) {
    setLastKey(op);
    if (display === 'Error') return;
    if (operator && !waitingForOperand) {
      // Chaining operations: compute on operator press
      const result = compute(Number(operand), Number(display), operator);
      setOperand(result);
      setDisplay(result === 'Error' ? 'Error' : String(result));
    } else {
      setOperand(Number(display));
    }
    setOperator(op);
    setWaitingForOperand(true);
  }

  // PUBLIC_INTERFACE
  function handleEqual() {
    setLastKey('=');
    if (operator && operand !== null && !waitingForOperand) {
      const result = compute(Number(operand), Number(display), operator);
      setDisplay(result === 'Error' ? 'Error' : String(result));
      setOperand(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }

  // PUBLIC_INTERFACE
  function handleClear() {
    setDisplay('0');
    setOperand(null);
    setOperator(null);
    setWaitingForOperand(false);
    setLastKey('C');
  }

  // PUBLIC_INTERFACE
  function handleBackspace() {
    setDisplay(prev => {
      if (prev === 'Error') return '0';
      if (waitingForOperand) return prev;
      return prev.length > 1 ? prev.slice(0, -1) : '0';
    });
    setLastKey('⌫');
  }

  // PUBLIC_INTERFACE
  function handlePercent() {
    setDisplay(prev => {
      if (prev === 'Error') return '0';
      const num = parseFloat(prev);
      return String(num / 100);
    });
    setWaitingForOperand(true);
    setLastKey('%');
  }

  /**
   * PUBLIC_INTERFACE
   * Compute function: executes calculation.
   * @param {number} a - Left operand
   * @param {number} b - Right operand
   * @param {string} op - Operator ('+', '-', '×', '÷')
   * @returns {number|string} Result or 'Error' if divide by zero
   */
  function compute(a, b, op) {
    let r = 0;
    switch (op) {
      case '+':
        r = a + b;
        break;
      case '-':
        r = a - b;
        break;
      case '×':
        r = a * b;
        break;
      case '÷':
        if (b === 0) return 'Error';
        r = a / b;
        break;
      default:
        r = b;
        break;
    }
    // Limit to 8 decimal digits, avoid rounding errors
    return Math.round(r * 1e8) / 1e8;
  }

  // Button grid definition
  const buttons = [
    // [label, gridColumnSpan, type]
    [{ label: 'C', type: 'function', onClick: handleClear, "ariaLabel": 'Clear' },
     { label: '⌫', type: 'function', onClick: handleBackspace, "ariaLabel": 'Backspace' },
     { label: '%', type: "function", onClick: handlePercent, "ariaLabel": 'Percent' },
     { label: '÷', type: "operator", onClick: () => handleOperator('÷'), "ariaLabel": 'Divide' }],
    [{ label: '7', type: 'digit' }, { label: '8', type: 'digit' }, { label: '9', type: 'digit' }, { label: '×', type: 'operator', onClick: () => handleOperator('×') }],
    [{ label: '4', type: 'digit' }, { label: '5', type: 'digit' }, { label: '6', type: 'digit' }, { label: '-', type: 'operator', onClick: () => handleOperator('-') }],
    [{ label: '1', type: 'digit' }, { label: '2', type: 'digit' }, { label: '3', type: 'digit' }, { label: '+', type: 'operator', onClick: () => handleOperator('+') }],
    [{ label: '0', span: 2, type: 'digit' }, { label: '.', type: 'dot' }, { label: '=', type: 'equal', onClick: handleEqual }]
  ];

  // PUBLIC_INTERFACE
  function handleButtonClick(btn) {
    if (btn.type === 'digit') handleDigit(btn.label);
    else if (btn.type === 'dot') handleDot();
    else if (btn.type === 'operator') btn.onClick && btn.onClick();
    else if (btn.type === 'function') btn.onClick && btn.onClick();
    else if (btn.type === 'equal') handleEqual();
  }

  // Theme variables from palette
  // (styles in App.css, but override accent color here on demand)
  useEffect(() => {
    document.documentElement.style.setProperty('--calc-accent', '#ff9800');
    document.documentElement.style.setProperty('--calc-primary', '#1976d2');
    document.documentElement.style.setProperty('--calc-secondary', '#424242');
  }, []);

  return (
    <div className="calc-app-root">
      <div className="calc-container">
        <div
          className="calc-display"
          aria-label="Calculator display"
          title={display}
          tabIndex={0}
        >
          {display}
        </div>
        <div className="visually-hidden" aria-live="polite">
          Last key pressed: {lastKey}
        </div>
        {/* Keyboard focus for accessibility */}
        <input
          ref={inputRef}
          style={{ position: 'absolute', left: '-10000px', opacity: 0, height: 0, width: 0 }}
          aria-hidden="true"
          tabIndex={0}
          onKeyDown={e => handleKeyboardInput(e.key)}
          value=""
          onChange={() => {}}
        />
        <div className="calc-buttons-grid">
          {buttons.map((row, rowIdx) => (
            <div className="calc-btn-row" key={rowIdx}>
              {row.map((btn, idx) =>
                btn.span ? (
                  <button
                    className={`calc-btn calc-btn-digit large-span`}
                    style={{ gridColumn: `span ${btn.span}` }}
                    key={btn.label}
                    onClick={() => handleButtonClick(btn)}
                    aria-label={btn.ariaLabel || btn.label}
                  >
                    {btn.label}
                  </button>
                ) : (
                  <button
                    key={btn.label}
                    className={`calc-btn ${
                      btn.type === 'digit' || btn.type === 'dot'
                        ? 'calc-btn-digit'
                        : btn.type === 'operator'
                        ? 'calc-btn-operator'
                        : btn.type === 'equal'
                        ? 'calc-btn-accent'
                        : 'calc-btn-fn'
                    }`}
                    onClick={() => handleButtonClick(btn)}
                    aria-label={btn.ariaLabel || btn.label}
                  >
                    {btn.label}
                  </button>
                )
              )}
            </div>
          ))}
        </div>
        <footer className="calc-footer">
          <span>Minimal Calculator • React • Kavia</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
