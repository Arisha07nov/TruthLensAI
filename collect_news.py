import feedparser
import pandas as pd
import os
import re
from datetime import datetime


RSS_FEEDS = {
    "Google News India":
        "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",

    "The Hindu":
        "https://www.thehindu.com/news/national/feeder/default.rss",

    "Indian Express":
        "https://indianexpress.com/section/india/feed/",

    "BBC News":
        "https://feeds.bbci.co.uk/news/rss.xml"
}


def clean_text(text):
    """Remove HTML and unnecessary whitespace."""

    text = str(text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", " ", text)

    # Replace multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def collect_news():

    articles = []

    for source, rss_url in RSS_FEEDS.items():

        print("\n================================")
        print("Collecting from:", source)
        print("================================")

        try:

            feed = feedparser.parse(rss_url)

            count = 0

            for item in feed.entries:

                title = clean_text(
                    item.get("title", "")
                )

                summary = clean_text(
                    item.get(
                        "summary",
                        item.get("description", "")
                    )
                )

                url = item.get(
                    "link",
                    ""
                ).strip()

                published = item.get(
                    "published",
                    item.get("pubDate", "")
                )

                if not title:
                    continue

                # Use title + clean summary
                text = f"{title}. {summary}"

                articles.append({
                    "title": title,
                    "text": text,
                    "source": source,
                    "url": url,
                    "published": published,
                    "collected_at": datetime.now().isoformat(),
                    "label": "",
                    "label_source": ""
                })

                count += 1

            print("Articles collected:", count)

        except Exception as e:

            print("ERROR:", e)


    # Create dataset folder if necessary
    os.makedirs("dataset", exist_ok=True)

    new_data = pd.DataFrame(articles)

    file_path = "dataset/collected_news.csv"


    # Load existing data
    if os.path.exists(file_path):

        old_data = pd.read_csv(
            file_path
        )

        data = pd.concat(
            [old_data, new_data],
            ignore_index=True
        )

    else:

        data = new_data


    # Remove duplicate URLs
    if "url" in data.columns:

        data = data.drop_duplicates(
            subset=["url"],
            keep="first"
        )


    # Remove duplicate titles
    if "title" in data.columns:

        data = data.drop_duplicates(
            subset=["title"],
            keep="first"
        )


    # Save
    data.to_csv(
        file_path,
        index=False,
        encoding="utf-8"
    )


    print("\n========================================")
    print("NEWS COLLECTION COMPLETED")
    print("========================================")

    print("Total unique articles:", len(data))

    print("Saved to:", file_path)

    print("\nArticles by source:")

    print(
        data["source"].value_counts()
    )


if __name__ == "__main__":

    collect_news()