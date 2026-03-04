import React, { useState } from 'react';

type ModalProps = {
    isOpen: boolean;
    type?: 'alert' | 'confirm' | 'prompt';
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm?: (inputValue?: string) => void;
    alertColor?: 'red' | 'green';
};

export default function Modal({
    isOpen,
    type = 'alert',
    title = 'Thông Báo',
    message,
    confirmText = 'OK',
    cancelText = 'Hủy',
    onClose,
    onConfirm,
    alertColor
}: ModalProps) {
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const isAlert = type === 'alert';
    const isConfirm = type === 'confirm';
    const isPrompt = type === 'prompt';

    const modalColor = alertColor || (type === 'alert' ? 'red' : 'green');
    const colorHex = modalColor === 'red' ? '#ff4d4f' : 'var(--primary)';
    const colorRgba = modalColor === 'red' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(68, 214, 44, 0.1)';

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(isPrompt ? inputValue : undefined);
        }
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)'
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes popInModal {
                    0% { opacity: 0; transform: scale(0.9) translateY(-20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes pulseGlowModal {
                    0% { box-shadow: 0 0 10px ${modalColor === 'red' ? 'rgba(255, 77, 79, 0.4)' : 'rgba(68, 214, 44, 0.4)'}; }
                    50% { box-shadow: 0 0 25px ${modalColor === 'red' ? 'rgba(255, 77, 79, 0.8)' : 'rgba(68, 214, 44, 0.8)'}; }
                    100% { box-shadow: 0 0 10px ${modalColor === 'red' ? 'rgba(255, 77, 79, 0.4)' : 'rgba(68, 214, 44, 0.4)'}; }
                }
                `
            }} />
            <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '3rem 2rem',
                maxWidth: '450px',
                width: '90%',
                textAlign: 'center',
                animation: 'popInModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: colorRgba,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    animation: 'pulseGlowModal 2s infinite',
                    color: colorHex,
                    fontSize: '2rem',
                    border: `2px solid ${colorHex}`
                }}>
                    {isAlert ? '!' : '?'}
                </div>

                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {title}
                </h3>

                <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: '1.5', marginBottom: '2rem' }}>
                    {message}
                </p>

                {isPrompt && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 15px',
                            backgroundColor: '#222',
                            border: '1px solid #444',
                            color: '#fff',
                            borderRadius: '6px',
                            marginBottom: '2rem',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                        autoFocus
                    />
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {!isAlert && (
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'transparent',
                                border: '1px solid #ff4d4f',
                                color: '#ff4d4f',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e: any) => { e.target.style.backgroundColor = '#ff4d4f'; e.target.style.color = '#fff'; }}
                            onMouseOut={(e: any) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ff4d4f'; }}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: colorHex,
                            border: 'none',
                            color: modalColor === 'red' ? '#fff' : '#000',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: colorHex }}></div>
            </div>
        </div >
    );
}
