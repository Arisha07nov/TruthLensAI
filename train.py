import pandas as pd
import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


# ============================================
# 1. LOAD LARGE TRAINING DATASET
# ============================================

df = pd.read_csv("dataset/training_news.csv")

print("\n================================")
print("TRUTHLENSAI MODEL TRAINING")
print("================================")

print("Dataset loaded successfully!")
print("Total records:", len(df))


# ============================================
# 2. CHECK DATA
# ============================================

print("\nClass Distribution:")
print(df["label"].value_counts())

print("\nMissing Values:")
print(df[["text", "label"]].isnull().sum())


# ============================================
# 3. PREPARE X AND Y
# ============================================

X = df["text"].fillna("").astype(str)
y = df["label"]


# ============================================
# 4. TRAIN / TEST SPLIT
# ============================================

X_train_text, X_test_text, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nDataset Split")
print("-------------------------")
print("Training records:", len(X_train_text))
print("Testing records :", len(X_test_text))


# ============================================
# 5. TF-IDF
# ============================================

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=50000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.95,
    sublinear_tf=True
)

X_train = vectorizer.fit_transform(X_train_text)

X_test = vectorizer.transform(X_test_text)


print("TF-IDF features:", X_train.shape[1])


# ============================================
# 6. TRAIN LOGISTIC REGRESSION
# ============================================

model = LogisticRegression(
    max_iter=1000,
    random_state=42
)

model.fit(X_train, y_train)


# ============================================
# 7. PREDICTION
# ============================================

y_pred = model.predict(X_test)


# ============================================
# 8. MODEL PERFORMANCE
# ============================================

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall = recall_score(y_test, y_pred, zero_division=0)
f1 = f1_score(y_test, y_pred, zero_division=0)

cm = confusion_matrix(y_test, y_pred)


print("\n================================")
print("MODEL PERFORMANCE")
print("================================")

print(f"Accuracy : {accuracy * 100:.2f}%")
print(f"Precision: {precision * 100:.2f}%")
print(f"Recall   : {recall * 100:.2f}%")
print(f"F1 Score : {f1 * 100:.2f}%")


# ============================================
# 9. CONFUSION MATRIX
# ============================================

print("\nConfusion Matrix")
print("-------------------------")
print(cm)


# ============================================
# 10. CLASSIFICATION REPORT
# ============================================

print("\nClassification Report")
print("-------------------------")

print(
    classification_report(
        y_test,
        y_pred,
        target_names=["Real News", "Fake News"],
        zero_division=0
    )
)


# ============================================
# 11. SAVE MODEL
# ============================================

pickle.dump(
    model,
    open("model.pkl", "wb")
)

pickle.dump(
    vectorizer,
    open("vectorizer.pkl", "wb")
)


# ============================================
# 12. SAVE METRICS
# ============================================

metrics = {
    "accuracy": accuracy,
    "precision": precision,
    "recall": recall,
    "f1_score": f1,
    "total_records": len(df),
    "training_records": len(X_train_text),
    "testing_records": len(X_test_text),
    "tfidf_features": X_train.shape[1],
    "confusion_matrix": cm.tolist()
}

pickle.dump(
    metrics,
    open("metrics.pkl", "wb")
)


# ============================================
# 13. FINAL MESSAGE
# ============================================

print("\n================================")
print("MODEL SAVED SUCCESSFULLY!")
print("================================")

print("model.pkl       ✓")
print("vectorizer.pkl  ✓")
print("metrics.pkl     ✓")

print("\nTruthLensAI is now trained on:")
print(f"{len(df):,} news articles")