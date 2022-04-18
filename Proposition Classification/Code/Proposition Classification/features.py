"""
Creates and loads the features required by the ML model
"""

import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer

import spacy

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.stem import WordNetLemmatizer
from nltk import word_tokenize, pos_tag
from nltk.corpus import wordnet as wn

speciteller_file = "../data/speciteller_results.csv"
stan_parser_file = "../data/text_only.stp"
input_file = "../data/data.csv"

wnl = WordNetLemmatizer()

df = pd.DataFrame()


def read_data_file():
    """
	Reads the pre-processed file into a pandas dataframe
	"""
    global df
    df = pd.read_csv(input_file, index_col=[0])


def feat_sentence_length():
    """
	Creates the sentence length feature
	"""
    global df
    df["length"] = df["fulltext"].str.len()


def feat_avg_word_length():
    """
	Creates the average word length feature
	"""
    global df
    average_word_length = []
    for proposition in df["fulltext"]:
        words = proposition.split()
        average = sum(len(word) for word in words) / len(words)
        average_word_length.append(average)
    df["avg_word_length"] = average_word_length


def feat_word_lengths():
    """
	Creates the word length and longest word features
	"""
    global df
    longest_word = 0
    longest_current_word = 0
    all_lengths = []
    word_lengths = []
    longest_words = []
    for proposition in df["fulltext"]:
        words = proposition.split()
        for word in words:
            length = len(word)
            if length > longest_current_word:
                longest_current_word = length
            if length > longest_word:
                longest_word = length
            if len(word_lengths) < length:
                word_lengths.extend([0] * (length - len(word_lengths)))
            word_lengths[length - 1] += 1
        all_lengths.append(word_lengths[:])
        word_lengths.clear()
        longest_words.append(longest_current_word)
        longest_current_word = 0

    df["longest_word"] = longest_words

    cols = []
    for wl in range(longest_word):
        cols.append("wl_" + str(wl + 1))


def feat_sentiment():
    """
	Creates the sentiment feature
	"""
    global df
    positive = []
    negative = []
    neutral = []
    compound = []
    sid = SentimentIntensityAnalyzer()
    for proposition in df["fulltext"]:
        ss = sid.polarity_scores(proposition)
        positive.append(ss["pos"])
        negative.append(ss["neg"])
        neutral.append(ss["neu"])
        compound.append(ss["compound"])

    df["sentiment_positive"] = positive
    df["sentiment_negative"] = negative
    # df['sentiment_neutral'] = neutral


def feat_pos():
    """
	Creates the Part-of-speech features
	"""
    global df
    nlp = spacy.load("en_core_web_sm")
    pnouns = []
    particles = []
    verbs = []
    nouns = []
    adjectives = []
    numerical = []
    modal_verbs = []
    symbols = []
    modal_present = []

    num_pnouns = 0
    num_particles = 0
    num_adjectives = 0
    num_verbs = 0
    num_nouns = 0
    num_numerical = 0
    num_modal_verbs = 0
    num_symbols = 0
    has_modal = False

    for sentence in df["fulltext"]:
        doc = nlp(sentence)

        for token in doc:
            if token.pos_ == "PROPN":
                num_pnouns += 1
            elif token.pos_ == "VERB":
                num_verbs += 1
            elif token.pos_ == "NOUN":
                num_nouns += 1
            elif token.pos_ == "NUM":
                num_numerical += 1
            elif token.pos_ == "SYM":
                num_symbols += 1
            elif token.pos_ == "ADJ":
                num_adjectives += 1
            elif token.pos_ == "PART":
                num_particles += 1

            if token.tag_ == "MD":
                num_modal_verbs += 1
                has_modal = True

        pnouns.append(num_pnouns)
        particles.append(num_particles)
        adjectives.append(num_adjectives)
        verbs.append(num_verbs)
        nouns.append(num_nouns)
        numerical.append(num_numerical)
        modal_verbs.append(num_modal_verbs)
        modal_present.append(has_modal)
        symbols.append(num_symbols)

        num_pnouns = 0
        num_particles = 0
        num_adjectives = 0
        num_verbs = 0
        num_nouns = 0
        num_numerical = 0
        num_modal_verbs = 0
        num_symbols = 0
        has_modal = False

    df["pos_pnouns"] = pnouns
    df["pos_particles"] = particles
    df["pos_adjectives"] = adjectives
    df["pos_verbs"] = verbs
    df["pos_nouns"] = nouns
    df["pos_numerical"] = numerical
    df["pos_modal_verbs"] = modal_verbs
    df["pos_has_modal"] = modal_present
    df["pos_symbols"] = symbols


def feat_tense():
    """
	Creates the proposition tense features
	"""
    global df
    tense_past = []
    tense_present = []
    tense_future = []
    tense_is_past = False
    tense_is_present = False
    tense_is_future = False

    with open(stan_parser_file) as file_in:
        lines = []
        for line in file_in:
            lines.append(line)

    for line in lines:
        # # Past
        if "VBD" in line:
            tense_is_past = True
        if "VBN" in line:
            tense_is_past = True

        # # Present
        if "VBP" in line:
            tense_is_present = True
        if "VBZ" in line:
            tense_is_present = True

        # # Future
        if "MD" in line:
            tense_is_future = True

        tense_past.append(tense_is_past)
        tense_present.append(tense_is_present)
        tense_future.append(tense_is_future)

        tense_is_past = False
        tense_is_present = False
        tense_is_future = False

    df["tense_past"] = tense_past
    df["tense_present"] = tense_present
    df["tense_future"] = tense_future


def feat_specificity():
    """
	Loads the specificity feature data
	"""
    global df
    df_speciteller = pd.read_csv(speciteller_file)
    df["speciteller"] = df_speciteller


def is_noun(tag):
    """
	Checks is parameter tag is a noun or not 
	
	:param tag: POS tag for the word
	
	:returns bool: True if tab represents noun
	"""
    return tag in ["NN", "NNS", "NNP", "NNPS"]


def is_verb(tag):
    """
	Checks is parameter tag is a verb or not 
	
	:param tag: POS tag for the word
	
	:returns bool: True if tab represents verb
	"""
    return tag in ["VB", "VBD", "VBG", "VBN", "VBP", "VBZ"]


def is_adverb(tag):
    """
	Checks is parameter tag is an adverb or not 
	
	:param tag: POS tag for the word
	
	:returns bool: True if tab represents adverb
	"""
    return tag in ["RB", "RBR", "RBS"]


def is_adjective(tag):
    """
	Checks is parameter tag is an adjective or not 
	
	:param tag: POS tag for the word
	
	:returns bool: True if word tag represents adjective
	"""
    return tag in ["JJ", "JJR", "JJS"]


def penn_to_wn(tag):
    """
	Checks the POS type for a tag
	
	Code for penn_to_wn and is_<postype> (e.g. is_verb(tag)) functions taken from user 'bogs' at: 
	https://stackoverflow.com/questions/25534214/nltk-wordnet-lemmatizer-shouldnt-it-lemmatize-all-inflections-of-a-word
	
	:param tag: POS tag for the word
	
	:returns wordnet word: The root word
	"""
    if is_adjective(tag):
        return wn.ADJ
    elif is_noun(tag):
        return wn.NOUN
    elif is_adverb(tag):
        return wn.ADV
    elif is_verb(tag):
        return wn.VERB
    return None


def lemmatize_words(tfidf_input):
    """
	Lemmatizer for the TFIDF vectorizer. Lemmatizes words to their root form
	
	:param tfidf_input: The words provided by the TFIDF vectorizer
	
	:returns words: The lemmatized words
	"""
    print("input: ", tfidf_input)
    words = []
    tokens = word_tokenize(tfidf_input)

    for token, tag in pos_tag(tokens):
        print("token: ", token)
        print("tag: ", tag)
        word_type = penn_to_wn(tag)
        if word_type is None:
            words.append(wnl.lemmatize(token))
        else:
            words.append(wnl.lemmatize(token, penn_to_wn(tag)))

    return words


def feat_tfidf():
    """
	Creates the term frequency-inverse document frequency feature
	"""
    global df
    tfidf_vectorizer = TfidfVectorizer(
        tokenizer=lemmatize_words, ngram_range=(1, 3)
    )  # with lemmatization
    x = tfidf_vectorizer.fit_transform(df["fulltext"]).todense()
    new_cols = tfidf_vectorizer.get_feature_names()
    df = df.drop("fulltext", axis=1)
    df = df.join(pd.DataFrame(x, columns=new_cols))


def write_to_csv():
    """
	Writes the features dataframe to a CSV file
	"""
    global df
    df.to_csv("../data/data_features.csv")


def main():
    """
	Calls the feature functions in order
	"""
    pd.DataFrame()
    read_data_file()
    feat_sentence_length()
    feat_avg_word_length()
    feat_word_lengths()
    feat_sentiment()
    feat_pos()
    feat_tense()
    feat_specificity()
    feat_tfidf()
    write_to_csv()


if __name__ == "__main__":
    main()
