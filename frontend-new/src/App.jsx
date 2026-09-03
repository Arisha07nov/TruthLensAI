import React, { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [news, setNews] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [metrics, setMetrics] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const [history, setHistory] = useState([]);

  // ============================================
  // ANALYZE NEWS
  // ============================================
  const analyzeNews = async () => {
    if (!news.trim()) {
      alert("Please enter a news article.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          news: news.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed.");
      }

      setResult(data);

      // Add result to history
      setHistory((previous) => [
        {
          id: Date.now(),
          text: news.trim(),
          prediction: data.prediction,
          label: data.label,
          confidence: data.confidence,
        },
        ...previous,
      ]);
    } catch (error) {
      console.error("Prediction error:", error);

      setResult({
        error:
          error.message ||
          "Unable to connect to TruthLensAI backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD MODEL METRICS
  // ============================================
  const loadMetrics = async () => {
    setMetricsLoading(true);

    try {
      const response = await fetch(`${API_URL}/metrics`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load model metrics."
        );
      }

      console.log("Metrics received:", data);

      setMetrics(data);
      setShowDashboard(true);
    } catch (error) {
      console.error("Metrics error:", error);

      alert(
        "Could not connect to the TruthLensAI backend.\n\n" +
          "Make sure Flask is running on http://127.0.0.1:5000"
      );
    } finally {
      setMetricsLoading(false);
    }
  };

  // ============================================
  // CLEAR NEWS
  // ============================================
  const clearNews = () => {
    setNews("");
    setResult(null);
  };

  // ============================================
  // CONFIDENCE FORMAT
  // ============================================
  const getConfidence = () => {
    if (!result || result.confidence === undefined) {
      return 0;
    }

    let value = Number(result.confidence);

    if (value <= 1) {
      value = value * 100;
    }

    return Math.max(0, Math.min(100, value));
  };

  // ============================================
  // DETERMINE FAKE / REAL
  // ============================================
  const isFake = () => {
    if (!result) return false;

    if (result.prediction) {
      return String(result.prediction).toLowerCase().includes("fake");
    }

    return Number(result.label) === 1;
  };

  // ============================================
  // METRIC FORMATTER
  // ============================================
  const formatMetric = (value) => {
    if (value === undefined || value === null) {
      return "N/A";
    }

    let number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    if (number <= 1) {
      number = number * 100;
    }

    return `${number.toFixed(2)}%`;
  };

  // ============================================
  // GET METRIC FROM DIFFERENT POSSIBLE NAMES
  // ============================================
  const getMetric = (names) => {
    if (!metrics) return null;

    for (const name of names) {
      if (metrics[name] !== undefined) {
        return metrics[name];
      }

      if (
        metrics.model_performance &&
        metrics.model_performance[name] !== undefined
      ) {
        return metrics.model_performance[name];
      }

      if (
        metrics.performance &&
        metrics.performance[name] !== undefined
      ) {
        return metrics.performance[name];
      }
    }

    return null;
  };

  // ============================================
  // DATASET VALUE
  // ============================================
  const getDatasetValue = (names) => {
    if (!metrics) return "N/A";

    for (const name of names) {
      if (metrics[name] !== undefined) {
        return metrics[name];
      }

      if (
        metrics.dataset &&
        metrics.dataset[name] !== undefined
      ) {
        return metrics.dataset[name];
      }

      if (
        metrics.dataset_information &&
        metrics.dataset_information[name] !== undefined
      ) {
        return metrics.dataset_information[name];
      }
    }

    return "N/A";
  };

  // ============================================
  // MAIN UI
  // ============================================
  return (
    <div className="app">
      {/* ======================================
          HEADER
      ======================================= */}
      <header className="header">
        <div className="brand">
          <div className="logo">TL</div>

          <div>
            <h1>TruthLensAI</h1>
            <p>AI-Powered Fake News Detection</p>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          AI Model Online
        </div>
      </header>

      {/* ======================================
          HERO
      ======================================= */}
      <main className="container">
        <section className="hero">
          <div className="hero-badge">
            🛡️ Intelligent News Verification
          </div>

          <h2>
            Detect <span>Fake News</span> with AI
          </h2>

          <p>
            Enter a news article below and TruthLensAI will analyze
            its language patterns using TF-IDF and Logistic Regression.
          </p>
        </section>

        {/* ======================================
            NEWS INPUT
        ======================================= */}
        <section className="card input-card">
          <div className="card-header">
            <div>
              <h3>📰 News Article</h3>
              <p>Paste the article text you want to verify.</p>
            </div>

            <span className="character-count">
              {news.length} characters
            </span>
          </div>

          <textarea
            className="news-input"
            value={news}
            onChange={(e) => setNews(e.target.value)}
            placeholder="Paste a news article here..."
            rows={10}
          />

          <div className="button-row">
            <button
              className="analyze-button"
              onClick={analyzeNews}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>🔍 Analyze News</>
              )}
            </button>

            <button
              className="clear-button"
              onClick={clearNews}
            >
              Clear
            </button>
          </div>
        </section>

        {/* ======================================
            RESULT
        ======================================= */}
        {result && (
          <section className="card result-card">
            {result.error ? (
              <div className="error-box">
                <h3>⚠️ Analysis Failed</h3>
                <p>{result.error}</p>
                <p>
                  Make sure Flask is running on:
                </p>
                <code>http://127.0.0.1:5000</code>
              </div>
            ) : (
              <>
                <div className="result-header">
                  <h3>🔎 Analysis Result</h3>
                </div>

                <div
                  className={`prediction-box ${
                    isFake() ? "fake" : "real"
                  }`}
                >
                  <div className="prediction-icon">
                    {isFake() ? "⚠️" : "✅"}
                  </div>

                  <div className="prediction-content">
                    <span className="prediction-label">
                      Prediction
                    </span>

                    <h2>
                      {result.prediction ||
                        (Number(result.label) === 1
                          ? "Fake News"
                          : "Real News")}
                    </h2>
                  </div>

                  <div className="confidence">
                    <span>Confidence</span>
                    <strong>
                      {getConfidence().toFixed(2)}%
                    </strong>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="confidence-section">
                  <div className="confidence-title">
                    <span>Model Confidence</span>
                    <span>
                      {getConfidence().toFixed(2)}%
                    </span>
                  </div>

                  <div className="confidence-bar">
                    <div
                      className={`confidence-fill ${
                        isFake() ? "fake-fill" : "real-fill"
                      }`}
                      style={{
                        width: `${getConfidence()}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="explanation">
                  <h4>💡 Explanation</h4>

                  <p>
                    {result.explanation ||
                      "The prediction is based on language patterns learned from the training dataset."}
                  </p>
                </div>
              </>
            )}
          </section>
        )}

        {/* ======================================
            DASHBOARD BUTTON
        ======================================= */}
        <section className="dashboard-section">
          <button
            className="dashboard-button"
            onClick={loadMetrics}
            disabled={metricsLoading}
          >
            {metricsLoading
              ? "Loading Dashboard..."
              : "📊 View Model Performance"}
          </button>
        </section>

        {/* ======================================
            MODEL DASHBOARD
        ======================================= */}
        {showDashboard && metrics && (
          <section className="dashboard">
            <div className="dashboard-title">
              <div>
                <h2>📊 Model Performance Dashboard</h2>
                <p>
                  Performance of the TruthLensAI machine learning model
                </p>
              </div>

              <button
                className="close-dashboard"
                onClick={() => setShowDashboard(false)}
              >
                ✕
              </button>
            </div>

            {/* Performance Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-icon">🎯</span>
                <div>
                  <p>Accuracy</p>
                  <h3>
                    {formatMetric(
                      getMetric(["accuracy"])
                    )}
                  </h3>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon">🎯</span>
                <div>
                  <p>Precision</p>
                  <h3>
                    {formatMetric(
                      getMetric(["precision"])
                    )}
                  </h3>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon">🔎</span>
                <div>
                  <p>Recall</p>
                  <h3>
                    {formatMetric(
                      getMetric(["recall"])
                    )}
                  </h3>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon">⚡</span>
                <div>
                  <p>F1 Score</p>
                  <h3>
                    {formatMetric(
                      getMetric([
                        "f1",
                        "f1_score",
                        "f1-score",
                      ])
                    )}
                  </h3>
                </div>
              </div>
            </div>

            {/* Dataset Information */}
            <div className="dashboard-card">
              <h3>📚 Dataset Information</h3>

              <div className="dataset-grid">
                <div className="dataset-item">
                  <span>Total Records</span>
                  <strong>
                    {getDatasetValue([
                      "total_records",
                      "total",
                      "records",
                    ])}
                  </strong>
                </div>

                <div className="dataset-item">
                  <span>Training Records</span>
                  <strong>
                    {getDatasetValue([
                      "training_records",
                      "train_records",
                      "training",
                    ])}
                  </strong>
                </div>

                <div className="dataset-item">
                  <span>Testing Records</span>
                  <strong>
                    {getDatasetValue([
                      "testing_records",
                      "test_records",
                      "testing",
                    ])}
                  </strong>
                </div>

                <div className="dataset-item">
                  <span>TF-IDF Features</span>
                  <strong>
                    {getDatasetValue([
                      "tfidf_features",
                      "tf_idf_features",
                      "features",
                    ])}
                  </strong>
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="dashboard-card">
              <h3>🔢 Confusion Matrix</h3>

              {metrics.confusion_matrix ||
              metrics.confusionMatrix ? (
                <div className="matrix-wrapper">
                  <table className="confusion-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Predicted Real</th>
                        <th>Predicted Fake</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <th>Actual Real</th>
                        <td>
                          {
                            (
                              metrics.confusion_matrix ||
                              metrics.confusionMatrix
                            )[0]?.[0]
                          }
                        </td>
                        <td>
                          {
                            (
                              metrics.confusion_matrix ||
                              metrics.confusionMatrix
                            )[0]?.[1]
                          }
                        </td>
                      </tr>

                      <tr>
                        <th>Actual Fake</th>
                        <td>
                          {
                            (
                              metrics.confusion_matrix ||
                              metrics.confusionMatrix
                            )[1]?.[0]
                          }
                        </td>
                        <td>
                          {
                            (
                              metrics.confusion_matrix ||
                              metrics.confusionMatrix
                            )[1]?.[1]
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">
                  Confusion matrix data is not available.
                </p>
              )}
            </div>

            {/* Model Information */}
            <div className="dashboard-card model-info">
              <h3>🤖 Model Information</h3>

              <div className="info-grid">
                <div>
                  <span>Algorithm</span>
                  <strong>Logistic Regression</strong>
                </div>

                <div>
                  <span>Feature Extraction</span>
                  <strong>TF-IDF</strong>
                </div>

                <div>
                  <span>Classification</span>
                  <strong>Binary Classification</strong>
                </div>

                <div>
                  <span>Classes</span>
                  <strong>Real News / Fake News</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================
            HISTORY
        ======================================= */}
        {history.length > 0 && (
          <section className="card history-card">
            <div className="card-header">
              <div>
                <h3>🕘 Recent Analyses</h3>
                <p>Your latest news verification results.</p>
              </div>

              <button
                className="clear-history"
                onClick={() => setHistory([])}
              >
                Clear History
              </button>
            </div>

            <div className="history-list">
              {history.slice(0, 5).map((item) => (
                <div
                  className="history-item"
                  key={item.id}
                >
                  <div className="history-icon">
                    {String(item.prediction)
                      .toLowerCase()
                      .includes("fake")
                      ? "⚠️"
                      : "✅"}
                  </div>

                  <div className="history-content">
                    <p>
                      {item.text.length > 120
                        ? item.text.substring(0, 120) + "..."
                        : item.text}
                    </p>

                    <span>
                      {item.prediction} •{" "}
                      {Number(item.confidence || 0).toFixed(2)}%
                      confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ======================================
          FOOTER
      ======================================= */}
      <footer className="footer">
        <p>
          © 2026 TruthLensAI • AI-Based Fake News Detection
        </p>

        <p>
          TF-IDF + Logistic Regression
        </p>
      </footer>
    </div>
  );
}

export default App;