import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [spacePressTimestamps, setSpacePressTimestamps] = useState([]);
  const [spacePressIntervals, setSpacePressIntervals] = useState([]);
  const [score, setScore] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        const currentTime = Date.now();
        setSpacePressTimestamps((prevTimestamps) => [...prevTimestamps, currentTime]);
        if (spacePressTimestamps.length > 0) {
          const interval = currentTime - spacePressTimestamps[spacePressTimestamps.length - 1];
          setSpacePressIntervals((prevIntervals) => [...prevIntervals, interval]);
          playSound(interval);
        }
      }
    };

    const updateVisualization = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let newScore = 0;
      for (let i = 0; i < spacePressTimestamps.length; i++) {
        const x = i * 50 + 50;
        const y = 300;
        const width = 40;
        let height = 40;
        if (i > 0) {
          const interval = spacePressIntervals[i - 1];
          height = interval;
          newScore += calculateScore(spacePressIntervals, spacePressTimestamps);
        }
        ctx.fillStyle = 'blue';
        ctx.fillRect(x, y, width, height);
      }
      setScore(newScore);
      requestAnimationFrame(updateVisualization);
    };

    document.addEventListener('keydown', handleKeyDown);
    updateVisualization();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [spacePressTimestamps, spacePressIntervals]);

  const playSound = (interval) => {
    const frequency = 432 + Math.floor(interval * 100);
    const duration = 0.2;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
    }, duration * 1000);
  };

  const calculateScore = (intervals, times) => {
    let score = 0;
    if (intervals.length > 1) {
      score += (1 - Math.abs(intervals[intervals.length - 1] - intervals[intervals.length - 2]) /
        Math.max(intervals[intervals.length - 1], intervals[intervals.length - 2]));
    }
    score += intervals.length;
    score += intervals.reduce((sum, interval) => sum + interval, 0);
    for (let i = 1; i < times.length; i++) {
      const interval = times[i] - times[i - 1];
      const frequency = 432 + Math.floor(interval * 100);
      if (isMusicalNote(frequency)) {
        score += 20;
      }
    }
    return Math.floor(score);
  };

  const isMusicalNote = (frequency) => {
    const musicalNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 432.00, 493.88];
    for (let note of musicalNotes) {
      if (Math.abs(frequency - note) < 10) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="app">
      <h1>Keyboard Space Press Visualization</h1>
      <canvas ref={canvasRef} width="800" height="600" className="canvas" />
      <div className="score">Score: {score}</div>
    </div>
  );
}

export default App;
