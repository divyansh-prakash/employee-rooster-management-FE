import React, { useEffect } from 'react';
import { HOLIDAYS } from '../constants/holidayList';
import { getDayOfWeekMMDD } from '../utils/dateUtils';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    minWidth: '300px',
    maxWidth: '700px',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    right: '22px',
    top: '12px',
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: 'bold',
    border: 'none',
    background: 'none',
    color: '#333',
    zIndex: 10,
    width: '30px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  thtd: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  },
};

const HolidayModal = ({ onClose }) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.getElementById('holiday-modal');
      if (modal && !modal.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div style={modalStyles.overlay}>
      <div id="holiday-modal" style={modalStyles.modal}>
        <div className="header-bar">
          <h2>Holiday List</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <table style={modalStyles.table}>
          <thead>
            <tr>
              <th style={modalStyles.thtd}>Description</th>
              <th style={modalStyles.thtd}>Date</th>
              <th style={modalStyles.thtd}>Day</th>
            </tr>
          </thead>
          <tbody>
            {HOLIDAYS.map((holiday, idx) => (
              <tr key={idx}>
                <td style={modalStyles.thtd}>{holiday.name}</td>
                <td style={modalStyles.thtd}>{holiday.date}</td>
                <td style={modalStyles.thtd}>{getDayOfWeekMMDD(holiday.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HolidayModal;
