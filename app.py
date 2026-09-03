from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle

app = Flask(__name__)
CORS(app)

# Load trained model and TF-IDF vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))


@app.route("/")
def home():
    return jsonify({
        "message": "TruthLensAI API is running!",
        "model": "TF-IDF + Logistic Regression",
        "status": "ready"
    })


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        article = data.get("news", "").strip()

        if not article:
            return jsonify({
                "error": "Please enter a news article."
            }), 400

        # Convert article into TF-IDF features
        vector = vectorizer.transform([article])

        # Prediction
        prediction = model.predict(vector)[0]

        # Prediction probabilities
        probabilities = model.predict_proba(vector)[0]

        confidence = float(max(probabilities)) * 100

        # 0 = Real News
        # 1 = Fake News
        if prediction == 1:

            result = "Fake News"

            explanation = (
                "The article contains language patterns "
                "associated with previously identified fake news."
            )

        else:

            result = "Real News"

            explanation = (
                "The article contains language patterns "
                "associated with previously identified reliable news."
            )

        return jsonify({
            "prediction": result,
            "label": int(prediction),
            "confidence": round(confidence, 2),
            "explanation": explanation
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


@app.route("/metrics", methods=["GET"])
def metrics():

    try:

        metrics_data = pickle.load(
            open("metrics.pkl", "rb")
        )

        return jsonify(metrics_data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )