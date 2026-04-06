import React, { useState } from 'react';

const AboutPage = () => {
  // --- QUIZ LOGIC STATES ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [quizComplete, setQuizComplete] = useState(false);

  const quizData = [
    { question: "What percentage of their lives do cats spend sleeping?", options: ["10%", "70%", "35%", "Regine Velasquez"], answer: 1 },
    { question: "What is a group of cats called?", options: ["Cat", "Pack", "Gaggle", "Clowder"], answer: 3 },
    { question: "Can cats taste sweetness?", options: ["No", "Maybe", "Yes I", "IDK"], answer: 0 },
    { question: "How many degrees can a cat rotate its ears?", options: ["100%", "86%", "90%", "180%"], answer: 3 },
    { question: "Which bone do cats lack, allowing them to fit into tight spaces?", options: ["Collar Bone", "Boneless", "BoneBone-nan", "Tail Bone"], answer: 2 },
  ];

  // --- HANDLERS ---
  const handleOptionSelect = (index) => {
    if (showResult) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmit = () => {
    if (selectedOptionIndex === null) return;
    const currentData = quizData[currentQuestionIndex];
    
    if (selectedOptionIndex === currentData.answer) {
      setScore(score + 1);
      setResultMessage('Correct!');
    } else {
      setResultMessage(`Wrong! Correct answer: ${currentData.options[currentData.answer]}`);
    }
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestionIndex + 1 < quizData.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOptionIndex(null);
        setShowResult(false);
        setResultMessage('');
      } else {
        setQuizComplete(true);
      }
    }, 1500);
  };

  return (
    <main>
      {/* SECTION 1: Personal Gallery */}
      <section className="hero">
        <h1>The Keeper of the Threshold</h1>
        <p>A cat is a bridge between two worlds: one paw is firmly planted on your living room rug, while the other remains in the tall grass of a thousand years ago.</p>
      </section>

      {/* Row 1: ed6 to ed10 */}
      <section className="preview-grid">
        {["c5.jpg", "c6.jpg", "c7.jpg",].map((img, i) => (
          <div className="card" key={i}><img src={`/photos/${img}`} width="175" height="175" alt="Gallery" /></div>
        ))}
      </section>

   

      {/* SECTION 2: Growth */}
      <section className="hero">
        <h1>The Clockwork of the Wild</h1>
        <p>A cat is a gold-plated watch found in a jungle; intricate, precise, and ticking to a rhythm that predates the invention of time itself. They don't follow your schedule; they simply wait for the world to catch up to theirs.</p>
      </section>

      {/* Row 3: ed11, ed12, ed2, ed13, ed14 */}
      <section className="preview-grid">
        {["c7.jpg", "c8.jpg", "c10.jpg",].map((img, i) => (
          <div className="card" key={i}><img src={`/photos/${img}`} width="175" height="175" alt="Gallery" /></div>
        ))}
      </section>

      {/* SECTION 3: Authenticity */}
      <section className="hero">
        <h1>The Unread Manuscript</h1>
        <p>To look into a cat’s eyes is to browse a library in a dead language. You can sense the depth of the stories and the weight of the history, but you are only ever allowed to admire the cover.</p>
      </section>

  

      {/* Row 5: ed26 to ed28 */}
      <section className="preview-grid">
        {["c11.jpg", "c12.jpg", "c13.jpg", ].map((img, i) => (
          <div className="card" key={i}><img src={`/photos/${img}`} width="175" height="175" alt="Gallery" /></div>
        ))}
      </section>

 

      {/* QUIZ SECTION */}
      
      <section className="quiz-section">
        <div className="quiz-container">
          {!quizComplete ? (
            <>
              <h2 id="question">{quizData[currentQuestionIndex].question}</h2>
              <div className="options" id="options">
                {quizData[currentQuestionIndex].options.map((option, index) => (
                  <div
                    key={index}
                    className={`option ${selectedOptionIndex === index ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    {option}
                  </div>
                ))}
              </div>
              <button 
                id="submitBtn" 
                onClick={handleSubmit} 
                disabled={selectedOptionIndex === null || showResult}
              >
                Submit Answer
              </button>
              {showResult && (
                <div id="result" style={{ color: resultMessage.includes('Correct') ? 'green' : 'red' }}>
                  {resultMessage}
                </div>
              )}
            </>
          ) : (
            <div className="quiz-container">
              <h2>Quiz Complete!</h2>
              <div id="result" style={{ color: 'black' }}>
                Your final score is {score} out of {quizData.length}.
              </div>
              <button onClick={() => window.location.reload()} style={{marginTop: '20px'}}>Restart Quiz</button>
            </div>
          )}
        </div>
      </section>

       <footer>
        <p>&copy; MiIlao. All rights reserved. | Contact: MiIlao@gmail.com</p>
      </footer>
    </main>
  );
};

export default AboutPage;