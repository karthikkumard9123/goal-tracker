import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './GoalTracker.css';

const GoalTracker = () => {
  const [goalName, setGoalName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarData, setCalendarData] = useState(null);

  const calculateDays = (start, end) => {
    const startDateTime = new Date(start);
    const endDateTime = new Date(end);
    const diffTime = Math.abs(endDateTime - startDateTime);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getDaysRemaining = (start) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateTime = new Date(start);
    startDateTime.setHours(0, 0, 0, 0);
    
    if (today < startDateTime) {
      return null;
    }
    
    const diffTime = Math.abs(today - startDateTime);
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return daysPassed;
  };

  const generateCalendar = () => {
    if (!goalName || !startDate || !endDate) {
      alert('Please fill in all fields');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      alert('End date must be after start date');
      return;
    }

    const totalDays = calculateDays(startDate, endDate);
    const daysPassed = getDaysRemaining(startDate);
    const remainingDays = daysPassed !== null ? totalDays - daysPassed - 1 : totalDays;

    const months = [];
    let currentDate = new Date(start);
    let dayCounter = 1;

    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthName = currentDate.toLocaleString('default', { month: 'long' });
      
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const monthData = {
        year,
        month,
        monthName,
        firstDay,
        daysInMonth,
        days: []
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date >= start && date <= end) {
          monthData.days.push({
            day,
            dayNumber: dayCounter,
            remaining: totalDays - dayCounter
          });
          dayCounter++;
        } else {
          monthData.days.push(null);
        }
      }

      months.push(monthData);
      currentDate = new Date(year, month + 1, 1);
    }

    setCalendarData({
      goalName,
      startDate,
      endDate,
      totalDays,
      remainingDays: remainingDays >= 0 ? remainingDays : totalDays,
      months
    });
    setShowCalendar(true);
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;

    // Optimized settings for smaller file size
    const captureSettings = {
      scale: 1.5,  // Reduced from 2 to 1.5 for smaller size
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: true,
      imageTimeout: 0,
      allowTaint: false
    };

    // Add header page
    const headerElement = document.getElementById('pdf-header');
    if (headerElement) {
      const headerCanvas = await html2canvas(headerElement, captureSettings);
      const headerImgData = headerCanvas.toDataURL('image/jpeg', 0.75);  // JPEG with 75% quality
      const headerImgHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
      pdf.addImage(headerImgData, 'JPEG', 0, 0, pdfWidth, Math.min(headerImgHeight, pdfHeight));
    }

    // Add each month as a separate page
    const monthElements = document.querySelectorAll('.month-calendar');
    for (let i = 0; i < monthElements.length; i++) {
      pdf.addPage();
      const canvas = await html2canvas(monthElements[i], captureSettings);
      const imgData = canvas.toDataURL('image/jpeg', 0.75);  // JPEG with 75% quality
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
    }

    // Save with compression
    pdf.save(`${goalName || 'goal'}-tracker.pdf`, { compress: true });
  };

  return (
    <div className="goal-tracker-container">
      {!showCalendar ? (
        <div className="input-form">
          <h1>Goal Tracker</h1>
          <div className="form-group">
            <label>Goal Name:</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Enter your goal"
            />
          </div>
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="generate-btn" onClick={generateCalendar}>
            Generate Calendar
          </button>
        </div>
      ) : (
        <div className="calendar-view">
          <div className="action-buttons">
            <button className="back-btn" onClick={() => setShowCalendar(false)}>
              ← Back
            </button>
            <button className="download-btn" onClick={downloadPDF}>
              Download PDF
            </button>
          </div>

          <div id="pdf-header" className="calendar-header">
            <h1>TARGET: {calendarData.goalName}</h1>
            <div className="header-info">
              <p><strong>START DATE:</strong> {new Date(calendarData.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>END DATE:</strong> {new Date(calendarData.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>TOTAL DAYS:</strong> {calendarData.totalDays} DAYS</p>
              <p><strong>REMAINING DAYS:</strong> {calendarData.remainingDays} DAYS</p>
            </div>
            
            {/* Legend with static example box */}
            <div className="calendar-legend">
              <div className="legend-example-box">
                <div className="legend-day-number">1</div>
                <div className="legend-date">23</div>
                <div className="legend-remaining">69</div>
              </div>
              
              <div className="legend-explanations">
                <div className="legend-item">
                  <div className="legend-color-box legend-color-red"></div>
                  <span>Day number (top-left)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color-box legend-color-black"></div>
                  <span>Calendar date (center)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color-box legend-color-green"></div>
                  <span>Days remaining (bottom-right)</span>
                </div>
              </div>
            </div>
          </div>

          {calendarData.months.map((monthData, index) => (
            <div key={index} className="month-calendar">
              <h2>{monthData.monthName} {monthData.year}</h2>
              <div className="calendar-grid">
                <div className="day-header">Sunday</div>
                <div className="day-header">Monday</div>
                <div className="day-header">Tuesday</div>
                <div className="day-header">Wednesday</div>
                <div className="day-header">Thursday</div>
                <div className="day-header">Friday</div>
                <div className="day-header">Saturday</div>

                {[...Array(monthData.firstDay)].map((_, i) => (
                  <div key={`empty-${i}`} className="calendar-day empty"></div>
                ))}

                {Array.from({ length: monthData.daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayData = monthData.days.find(d => d && d.day === day);
                  
                  if (!dayData) {
                    return null;
                  }
                  
                  return (
                    <div key={day} className="calendar-day active">
                      <div className="day-number-small">{dayData.dayNumber}</div>
                      <div className="date-large">{day}</div>
                      <div className="remaining-days">{dayData.remaining}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalTracker;