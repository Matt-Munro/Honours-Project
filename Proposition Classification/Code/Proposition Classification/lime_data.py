"""
lime.py
Uses LIME to measure the impact of each word on a classifier
"""

import pandas as pd

import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline

import string

from lime import lime_text
from lime.lime_text import LimeTextExplainer

input_file = "../data/data_copy.csv"
class_names = ["Fact", "Value", "Policy"]

# A list of the lime values
lists = []

# Global variable for pandas dataframe
df = pd.DataFrame()

# Global variable for training vectors
train_vectors = ""
test_vectors = ""

# Global variables for training and testing data
X_train = X_test = y_train = y_test = ""

# Global vectorizer variable
vectorizer = ""

# Global model variable
svm_clf = SVC()


def read_data_file():
    """
	Reads in the data file
	"""
    global df
    df = pd.read_csv(input_file)


def process_tfidf():
    """
	Processes the proposition text as tfidf for use by the model
	"""
    global df
    global train_vectors
    global test_vectors
    global X_train, X_test, y_train, y_test
    global vectorizer
    vectorizer = sklearn.feature_extraction.text.TfidfVectorizer(lowercase=False)

    X_train, X_test, y_train, y_test = train_test_split(
        df["fulltext"], df["V_P_F"], random_state=0, test_size=0.2, stratify=df["V_P_F"]
    )

    for i in range(len(X_test)):
        X_test.iloc[i] = X_test.iloc[i].replace("'s", "")
        X_test.iloc[i] = X_test.iloc[i].translate(
            str.maketrans("", "", string.punctuation)
        )

    train_vectors = vectorizer.fit_transform(X_train)
    test_vectors = vectorizer.transform(X_test)


def lime_model():
    """
	Creates and trains the model and retrieves its predictions 
	"""
    global train_vectors
    global test_vectors
    global svm_clf
    svm_clf = SVC(C=10, kernel="linear", probability=True)
    svm_clf.fit(train_vectors, y_train)
    pred = svm_clf.predict(test_vectors)


def get_lime_values():
    """
	Creates a lime explainer and runs on the test data and stores the lime values for significat words
	"""
    global vectorizer
    global svm_clf
    svm_pipeline = make_pipeline(vectorizer, svm_clf)
    explainer = LimeTextExplainer(class_names=class_names)

    probas = []
    for i in range(len(X_test)):
        exp = explainer.explain_instance(
            X_test.iloc[i], svm_pipeline.predict_proba, num_features=6, top_labels=3
        )
        probas.append(exp.predict_proba)
        list = exp.as_list()
        lists.append(list)


def collate_all_lime_values():
    """
	Combines the significant lime values with the 0 values to store the lime value for each word
	"""
    global X_train, X_test, y_train, y_test
    global lists
    index = 0
    word_found = False
    lime_values = [[]]
    for (
        list
    ) in lists:  # List of lists containing words within propositions and lime values
        sentence = X_test.iloc[index].replace(
            "'s", ""
        )  # Remove apostrophe s to avoid missing words from list
        sentence = sentence.translate(str.maketrans("", "", string.punctuation))
        words = sentence.split()
        for i in range(len(words)):
            for x in range(len(list)):
                if (
                    words[i] == list[x][0]
                ):  # If word is found, retrieve LIME value from list
                    lime_values[index].append(list[x][1])
                    word_found = True
            if (
                word_found == False
            ):  # If the word is not found, it has not received a LIME value so is therefore 0
                lime_values[index].append("0")
            word_found = False
        lime_values.append([])
        index += 1


def main():
    """
	Calls the lime functions in order
	"""
    read_data_file()
    process_tfidf()
    lime_model()
    get_lime_values()
    collate_all_lime_values()
    print(lists)


if __name__ == "__main__":
    main()
