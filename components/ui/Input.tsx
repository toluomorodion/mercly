'use client';

import React, { useId, useState, useRef, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, type, onInput, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const [showPassword, setShowPassword] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const handleInput = useCallback((e: React.InputEvent<HTMLInputElement>) => {
      setHasValue(!!(e.target as HTMLInputElement).value);
      onInput?.(e);
    }, [onInput]);

    const setRef = useCallback((node: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    }, [ref]);

    return (
      <div className={`${styles.wrapper} ${className ?? ''}`}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <div className={styles.inputWrapper}>
          <input
            ref={setRef}
            id={inputId}
            type={inputType}
            className={`${styles.input} ${isPassword ? styles.inputWithToggle : ''} ${error ? styles.inputError : ''}`}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            onInput={handleInput}
            {...props}
          />
          {isPassword && hasValue && (
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <span id={errorId} className={styles.errorText}>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
