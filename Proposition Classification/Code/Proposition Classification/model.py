"""
model.py
Creates and trains a scikit-learn ML model and outputs accuracy statistics 
"""

import pandas as pd
import numpy as np

from sklearn import metrics
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import LogisticRegressionCV
from sklearn.metrics import f1_score


# Global variables for training and testing data
X_train = X_test = y_train = y_test = ""

# Global model variables
svm_clf = SVC()
knn = KNeighborsClassifier(n_neighbors=3)
nb = MultinomialNB()


def prepare_model_data():
    """
	Builds and runs the model
	"""
    # Read data with features
    # Specify index column to prevent id being loaded as additional column
    df = pd.read_csv("../data/data_features.csv", index_col=[0])

    # If testing on 1D array:
    # .values.reshape(-1,1)
    global X_train
    global X_test
    global y_train
    global y_test
    X_train, X_test, y_train, y_test = train_test_split(
        df[df.columns[1:]],
        df["V_P_F"],
        random_state=0,
        test_size=0.2,
        stratify=df["V_P_F"],
    )


def create_model():
    """
	Creates and trains the model
	"""
    # clf = MultinomialNB().fit(X_train, y_train)

    # clf = KNeighborsClassifier(n_neighbors=3)
    # clf.fit(X_train, y_train)

    # clf = LogisticRegression(random_state=0, max_iter=1000)
    # clf.fit(X_train, y_train)

    # clf = LogisticRegressionCV(cv=5, random_state=0)
    # clf.fit(X_train, y_train)
    global svm_clf
    svm_clf = SVC(C=10, kernel="linear", probability=True)
    # 	svm_clf = SVC()
    svm_clf.fit(X_train, y_train)

    global knn
    knn = KNeighborsClassifier(n_neighbors=11, metric="manhattan", weights="distance")
    knn.fit(X_train, y_train)

    global nb
    nb = MultinomialNB(alpha=0)
    nb.fit(X_train, y_train)


def write_prediction(model_name, prediction, mean, filepath):
    """
	Writes the model accuracy statistics to the terminal and to a text file
	
	:param prediction: The prediction values for the model
	:param mean: The mean average of the model results
	:param filepath: The location of the text file to write to 
	
	"""
    output = "\n"
    output += model_name.center(53, "_") + "\n"
    output += metrics.classification_report(y_test, prediction) + "\n"
    output += (
        "F1 score: " + str(f1_score(y_test, prediction, average="weighted")) + "\n"
    )
    print(output)
    print(metrics.confusion_matrix(y_test, prediction))

    prediction_file = open(filepath, "w")
    prediction_file.write(output)
    prediction_file.close()


def get_model_predictions():
    """
	Gets the model predictions and calls the output function
	"""
    global svm
    global knn
    global nb

    # SVM
    prediction = svm_clf.predict(X_test)
    mean = np.mean(prediction == y_test)
    write_prediction("SVM", prediction, mean, "../predictions/SVM_predictions.txt")
    print("Accuracy: ", metrics.accuracy_score(y_test, prediction))

    # KNN
    prediction = knn.predict(X_test)
    mean = np.mean(prediction == y_test)
    write_prediction("KNN", prediction, mean, "../predictions/KNN_predictions.txt")
    print("Accuracy: ", metrics.accuracy_score(y_test, prediction))

    # NB
    prediction = nb.predict(X_test)
    mean = np.mean(prediction == y_test)
    write_prediction("NB", prediction, mean, "../predictions/Nb_predictions.txt")
    print("Accuracy: ", metrics.accuracy_score(y_test, prediction))


def main():
    """
	Calls the model functions in order
	"""
    prepare_model_data()
    create_model()
    get_model_predictions()


if __name__ == "__main__":
    main()
