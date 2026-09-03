import pandas as pd
import os


# ============================================
# LOAD DATASETS
# ============================================

fake = pd.read_csv("dataset/Fake.csv")
true = pd.read_csv("dataset/True.csv")


# ============================================
# ADD LABELS
# ============================================

# 1 = Fake
# 0 = Real

fake["label"] = 1
true["label"] = 0


# ============================================
# COMBINE
# ============================================

df = pd.concat(
    [fake, true],
    ignore_index=True
)


# ============================================
# CREATE TEXT COLUMN
# ============================================

df["text"] = (
    df["title"].fillna("") +
    " " +
    df["text"].fillna("")
)


# ============================================
# KEEP REQUIRED COLUMNS
# ============================================

df = df[
    ["text", "label"]
]


# ============================================
# REMOVE MISSING DATA
# ============================================

df = df.dropna(
    subset=["text", "label"]
)


# ============================================
# REMOVE EMPTY ARTICLES
# ============================================

df = df[
    df["text"].str.strip() != ""
]


# ============================================
# REMOVE DUPLICATES
# ============================================

df = df.drop_duplicates(
    subset=["text"]
)


# ============================================
# SHUFFLE
# ============================================

df = df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


# ============================================
# SAVE
# ============================================

df.to_csv(
    "dataset/training_news.csv",
    index=False,
    encoding="utf-8"
)


# ============================================
# INFORMATION
# ============================================

print("\n================================")
print("DATASET PREPARATION COMPLETED")
print("================================")

print("Total records:", len(df))

print("\nClass distribution:")
print(df["label"].value_counts())

print("\nClass percentages:")
print(
    df["label"].value_counts(normalize=True) * 100
)

print("\nSaved to:")
print("dataset/training_news.csv")