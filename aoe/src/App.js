import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import io from 'socket.io-client';
import './assets/styles/App.css';

import harvardLogo from './assets/images/harvard.png';
import brownLogo from './assets/images/brown.png';
import yaleLogo from './assets/images/yale.png';
import princetonLogo from './assets/images/princeton.png';
import upennLogo from './assets/images/upenn.png';

import waitingMusic from './assets/audio/waiting.mp3'
import victoryMusic from './assets/audio/columbia.mp3';
import playingMusic from './assets/audio/playing.mp3';
import hitSound from './assets/audio/hit.mp3'

function App() {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(90); // 1:30 minutes in seconds
  const [gameState, setGameState] = useState('');
  const [winState, setWinState] = useState(false);
  const [hitCount, setHitCount] = useState({
    harvard: 0,
    brown: 0,
    yale: 0,
    princeton: 0,
    upenn: 0,
  });
  const timerIntervalRef = useRef(null);
  const winnerThreshold = 10;

  const waitingAudioRef = useRef(new Audio(waitingMusic));
  const playingAudioRef = useRef(new Audio(playingMusic));
  const victoryAudioRef = useRef(new Audio(victoryMusic));
  const hitAudioRef = useRef(new Audio(hitSound));


  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const socket = io.connect('http://localhost:3001');
  
    socket.on('data', (receivedData) => {
      receivedData = receivedData.trim(); 
      switch(receivedData) { 
        case 'Start':
          setGameState('IP');
          break;
        case 'End':
          setGameState('End');
          break;
        default:
          if (['harvard', 'brown', 'yale', 'princeton', 'upenn'].includes(receivedData.toLowerCase())) {
            setHitCount(prevCount => {
              playHitSound();
              return {
                ...prevCount,
                [receivedData.toLowerCase()]: (prevCount[receivedData.toLowerCase()] || 0) + 1,
              };
            });
          } else {
            setGameState('Waiting');
          }
          break; 
      }
    });
  
    return () => {
      socket.disconnect();
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  useEffect(() => {
    switch(gameState) {
      case 'IP':
        playMusic(playingAudioRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime === 0) {
            clearInterval(timerIntervalRef.current);
            setGameState('End');
            stopMusic();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      break;
      case 'Waiting':
        playMusic(waitingAudioRef.current);
        break;
      case '':
        playMusic(waitingAudioRef.current);
        break; 
      default:
        break; 
    }
    
    return () => {
      clearInterval(timerIntervalRef.current);
      stopMusic();
    };
  }, [gameState]);

  useEffect(() => {
    const summedScore = Object.values(hitCount).reduce((acc, curr) => acc + curr, 0);
    setScore(summedScore);
    setWinState(summedScore > winnerThreshold && gameState === 'End');

    if (winState) {
      stopMusic();
      playMusic(victoryAudioRef.current);
    }
  }, [hitCount, gameState, winState]);

  const playMusic = (audioRef) => {
    audioRef.currentTime = 0;
    audioRef.loop = true;
    const playPromise = audioRef.play();

    if (playPromise !== undefined) {
      playPromise.then(_ => {
      })
        .catch(error => {
          // Autoplay was prevented
          console.error("Play was prevented: ", error);
        });
    }
  };
  const stopMusic = () => {
    playingAudioRef.current.pause();
    playingAudioRef.current.currentTime = 0;
    victoryAudioRef.current.pause();
    victoryAudioRef.current.currentTime = 0;
    waitingAudioRef.current.pause();
    waitingAudioRef.current.currentTime = 0;
  };

  const playHitSound = () => {
    hitAudioRef.current.currentTime = 0;
    hitAudioRef.current.play();
  };

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const memoizedFormatTime = useMemo(() => formatTime(time), [time, formatTime]);

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

  const Confetti = () => {
    const confettiCount = 15;
    const confettiSpans = Array.from({ length: confettiCount }, (_, index) => (
      <span key={index} className={`confetti confetti-${index + 1}`}></span>
    ));

    return <div>{confettiSpans}</div>;
  };

  const Hammer = () => (
    <img
      src="https://www.cs.columbia.edu/wp-content/uploads/2021/04/engineering-red.gif"
      alt="Hammer"
      style={{ width: '350px', position: 'absolute', left: '200px', bottom: '95px' }}
    />
  );

  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', marginBottom: '0px' }}>
        Whack-An-Ivy
        <img
          src="https://www.cs.columbia.edu/wp-content/uploads/2021/04/engineering-red.gif"
          alt="Columbia Engineering"
          style={{ width: '45px', height: '45px', marginLeft: '1px' }}
        />
      </h1>

      <div className="watermark">
        <i>A.O.E - Whack-A-Mole Submission: Mohammed, Jeff, Jose, & Rodrigo</i>
      </div>

      <div className="logos">
        <div>
          <img src={harvardLogo} alt="Harvard Logo" className="logo" style={{ width: '200px', height: '200px' }} />
          <Badge count={hitCount.harvard} />
        </div>
        <div>
          <img src={brownLogo} alt="Brown Logo" className="logo" style={{ width: '200px', height: '200px' }} />
          <Badge count={hitCount.brown} />
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
        {gameState === 'IP' && (
          <>
            <i>&nbsp;</i>
            <i>&nbsp;</i>
            <i>&nbsp;</i>
            <i>&nbsp;</i>
            <i>&nbsp;</i>
            <i>&nbsp;</i>
            <i>&nbsp;</i>
            <i>&nbsp;</i>
            <div className="game-info">
              <Hammer />
              <div className="arcade-score">
                <span className="score-label">Score:</span>
                <span className="score">{score}</span>
              </div>
              <div className="arcade-timer">
                <span className="score-label">Time Remaining:</span>
                <span className="timer">&nbsp;{memoizedFormatTime}</span>
              </div>
            </div>
          </>
        )}
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        <i>&nbsp;</i>
        {( (gameState === 'Waiting') || (gameState === '')) && (
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
                  <p style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal', fontSize: 'smaller' }}>Wanna play again? Press the Start Button!</p>
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
