"""
process_data.py
Conducts pre-processing of the data for use by the models
"""

import pandas as pd
from sklearn import preprocessing

df = pd.DataFrame()


def read_data_file():
    """
	Reads in the data and stores in a pandas dataframe
	"""
    global df
    input_file = "../data/VPF.csv"

    df = pd.read_csv(input_file)


def remove_proposition_spaces():
    """
	Removes the spaces between proposition sentences
	"""
    global df
    df["fulltext"] = (
        df["Text"]
        + " "
        + df["Text2"].fillna("")
        + " "
        + df["Text3"].fillna("")
        + " "
        + df["Text4"].fillna("")
    )
    df = df.drop(columns=["ID", "Text", "Text2", "Text3", "Text4"])
    df["fulltext"] = df["fulltext"].str.strip()


def sort_class_labels():
    """
	Converts the class labels to uppercase and removes propositions with blank labels
	"""
    global df
    df["V_P_F"] = df["V_P_F"].str.upper()
    df = df[df.V_P_F != "B"]


def encode_labels():
    """
	Encodes the Value, Policy, Fact labels as 0, 1, and 2 respectively
	"""
    global df
    # 0 - Fact
    # 1 - Policy
    # 2 - Value
    le = preprocessing.LabelEncoder()
    le.fit(df["V_P_F"])
    le.classes_
    df["V_P_F"] = le.transform(df["V_P_F"])


def write_data_file():
    """
	Writes the updated dataframe to a CSV file
	"""
    global df
    df = df.reset_index(drop=True)
    df.to_csv("../data/data.csv", encoding="utf-8-sig")


def main():
    """
	Calls the pre-processing functions in order
	"""
    read_data_file()
    remove_proposition_spaces()
    sort_class_labels()
    encode_labels()
    write_data_file()


if __name__ == "__main__":
    main()
