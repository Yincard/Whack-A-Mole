import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import harvardLogo from './uni-logos/harvard.png';
import columbiaLogo from './uni-logos/columbia.png';
import yaleLogo from './uni-logos/yale.png';
import princetonLogo from './uni-logos/princeton.png';
import upennLogo from './uni-logos/upenn.png';

import victoryMusic from './music/columbia.mp3'

function App() {
  const [data, setData] = useState('');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(5); // 1:30 minutes in seconds
  const [gameState, setGameState] = useState('Waiting');
  const [winState, setWinState] = useState(false);
  const [hitCount, setHitCount] = useState({
    harvard: 0,
    columbia: 0,
    yale: 0,
    princeton: 0,
    upenn: 0,
  });
  const timerIntervalRef = useRef(null);
  const winnerThreshold = 10;

  useEffect(() => {
    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    const socket = io('/api');
    socket.on('data', (receivedData) => {
      setData(receivedData);

      if (receivedData.includes('Harvard')) {
        setHitCount((prevCount) => ({ ...prevCount, harvard: prevCount.harvard + 1 }));
      } else if (receivedData.includes('Columbia')) {
        setHitCount((prevCount) => ({ ...prevCount, columbia: prevCount.columbia + 1 }));
      } else if (receivedData.includes('Yale')) {
        setHitCount((prevCount) => ({ ...prevCount, yale: prevCount.yale + 1 }));
      } else if (receivedData.includes('Princeton')) {
        setHitCount((prevCount) => ({ ...prevCount, princeton: prevCount.princeton + 1 }));
      } else if (receivedData.includes('UPenn')) {
        setHitCount((prevCount) => ({ ...prevCount, upenn: prevCount.upenn + 1 }));
      }

      if (receivedData.includes('Start')) {
        setGameState('IP');
      }
      if (receivedData.includes('End')) {
        setGameState('End');
      }
    });

    // Start the timer when the game state is 'In Progress'
    if (gameState === 'IP') {


      timerIntervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime === 0) {
            clearInterval(timerIntervalRef.current);
            setGameState('End');

          }
          return prevTime > 0 ? prevTime - 1 : 0;
        });
      }, 1000);
    }

    // Clear the timer interval when the game state changes or the component unmounts
    return () => {
      socket.disconnect();
      clearInterval(timerIntervalRef.current);
      document.body.style.overflow = 'auto';
    };
  }, [gameState]);

  useEffect(() => {
    const summedScore = hitCount.harvard + hitCount.columbia + hitCount.yale + hitCount.princeton + hitCount.upenn;
    setScore(summedScore);

    if (summedScore > winnerThreshold) {
      setWinState(true);
    } else {
      setWinState(false);
    }

    if (winState && gameState === "End") {
      const audio = new Audio(victoryMusic);
      audio.play();
    }
  }, [hitCount, winState, gameState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `‎ ${mins.toString().padStart(2, '0 ')}:${secs.toString().padStart(2, '0')}`;
  };

  const Badge = ({ count }) => (
    <span style={{
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '50%',
      padding: '5px 10px',
      fontSize: '24px',
      fontWeight: 'bold',
      marginLeft: '5px',
    }}>
      {count}
    </span>
  );

  const Confetti = () => (
    <div>
      <span className="confetti confetti-1"></span>
      <span className="confetti confetti-2"></span>
      <span className="confetti confetti-3"></span>
      <span className="confetti confetti-4"></span>
      <span className="confetti confetti-5"></span>
      <span className="confetti confetti-6"></span>
      <span className="confetti confetti-7"></span>
      <span className="confetti confetti-8"></span>
      <span className="confetti confetti-9"></span>
      <span className="confetti confetti-10"></span>
      <span className="confetti confetti-11"></span>
      <span className="confetti confetti-12"></span>
      <span className="confetti confetti-13"></span>
      <span className="confetti confetti-14"></span>
      <span className="confetti confetti-15"></span>
    </div>
  );


  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', marginBottom: '0px' }}>
        Ivy League Whack-a-Mole
        <img
        src="https://www.cs.columbia.edu/wp-content/uploads/2021/04/engineering-red.gif"
        alt="Columbia Engineering"
        style={{ width: '45px', height: '45px', marginLeft: '1px' }}
      />
      </h1>
      
      <div className="watermark">
        <i>A.O.E - Whack-A-Mole Submission: Mohammed, Jeff, Jose, & Rodrigo</i>
      </div>
      <i>&nbsp;</i>
      <div className="logos">
        <div>
          <img src={harvardLogo} alt="Harvard Logo" className="logo" style={{ width: '200px', height: '200px' }} />
          <Badge count={hitCount.harvard} />
        </div>
        <div>
          <img src={columbiaLogo} alt="Columbia Logo" className="logo" style={{ width: '200px', height: '200px' }} />
          <Badge count={hitCount.columbia} />
        </div>
        <div>
          <img src={yaleLogo} alt="Yale Logo" className="logo" style={{ width: '200px', height: '200px' }} />
          <Badge count={hitCount.yale} />
        </div>
        <div>
          <img src={princetonLogo} alt="Princeton Logo" className="logo" style={{ width: '200px', height: '200px' }} />
          <Badge count={hitCount.princeton} />
        </div>
        <div>
          <img src={upennLogo} alt="Cornell Logo" className="logo" style={{ width: '200px', height: '200px' }} />
          <Badge count={hitCount.upenn} />
        </div>
      </div>
      <div className="score-container">
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        {gameState === 'IP' && (
          <div className="game-info">
            <div className="arcade-score">
              <span className="score-label">Score:</span>
              <span className="score">{score}</span>
            </div>
            <div className="arcade-timer">
              <span className="timer-label">Time Remaining:</span>
              <span className="timer">{formatTime(time)}</span>
            </div>
          </div>
        )}
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        {gameState === 'Waiting' && (
          <div className="waiting-text">
            <div className="game-info">
              Welcome! Which Ivy-League will you dominate? 🔨
              <p style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal', fontSize: 'smaller' }}>Press the Start Button to Get Started!</p>
            </div>
          </div>
        )}
        {gameState === 'End' && (
          <div className="game-over-container">
            <div className="game-info">
              Game Over! Your Final Score: {score}
              {winState ? (
                <>
                  <p>Congrats You Won!</p>
                  <p style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal', fontSize: 'smaller' }}>Press the Start Button to Get Started!</p>
                  <Confetti />
                </>
              ) : (
                <p>Nooo You Lost!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default App;
