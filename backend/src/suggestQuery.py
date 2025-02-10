import os

import numpy as np
import pandas as pd


def read_csv_with_dynamic_separator(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            lines = file.readlines(1000)

        comma_count = sum(line.count(',') for line in lines)
        semicolon_count = sum(line.count(';') for line in lines)

        delimiter = ',' if comma_count > semicolon_count else ';'

        df = pd.read_csv(filename, delimiter=delimiter)
        return df
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
    except pd.errors.EmptyDataError:
        print(f"Error: No data in file '{filename}'.")
    except Exception as e:
        print(f"Error reading CSV with dynamic separator: {e}")
    return pd.DataFrame()


def get_important_numeric_column(df, threshold=0.7):
    correlation_matrix = df.corr().abs()
    important_columns = correlation_matrix.columns[
        (correlation_matrix > threshold).any() & (correlation_matrix < 1.0).any()
    ]
    
    if important_columns.empty:
        # If no columns meet the threshold, select the column with the highest max correlation
        max_corr = correlation_matrix.max().sort_values(ascending=False)
        most_important_column = max_corr.index[0]
        important_columns = [most_important_column]
    else:
        important_columns = [important_columns[0]]  # Select the first important column

    return important_columns[0]

def get_categorical_importance(df, important_numeric_column):
    cat_corr = {}
    for column in df.select_dtypes(include=['object']).columns:
        dummies = pd.get_dummies(df[column], drop_first=True)
        corr = dummies.corrwith(df[important_numeric_column]).abs().max()
        cat_corr[column] = corr
    return pd.Series(cat_corr).sort_values(ascending=False)

def suggestQuery(df_name):
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(script_dir)
        # Construct the full path to the CSV file
        file_path = os.path.join(parent_dir, 'data', f'{df_name}.csv')
        df = read_csv_with_dynamic_separator(file_path)
        #data/restaurants.csv
        if df.empty:
            return []

        numeric_df = df.select_dtypes(include=[np.number])
        date_df = df.select_dtypes(include=['datetime', 'datetime64'])
        text_df = df.select_dtypes(include=['object'])
        boolean_df = df.select_dtypes(include=[bool])

        queries = []

        # Identify the single most important numeric column based on correlation
        important_numeric_column = get_important_numeric_column(numeric_df)

        # Apply rounding logic to the most important numeric column
        mean_value = df[important_numeric_column].mean()
        median_value = df[important_numeric_column].median()
        rounded_mean_floor = df[important_numeric_column][df[important_numeric_column] >= mean_value].min()
        rounded_mean_ceil = df[important_numeric_column][df[important_numeric_column] <= mean_value].max()
        rounded_median_floor = df[important_numeric_column][df[important_numeric_column] >= median_value].min()
        rounded_median_ceil = df[important_numeric_column][df[important_numeric_column] <= median_value].max()
        queries.append(f"{important_numeric_column} >= {rounded_mean_floor}")
        queries.append(f"{important_numeric_column} <= {rounded_mean_ceil}")
        queries.append(f"{important_numeric_column} >= {rounded_median_floor}")
        queries.append(f"{important_numeric_column} <= {rounded_median_ceil}")

        # Categorical columns: Mode filters and value-specific filters
        for feature in text_df.columns:
            value_counts = df[feature].value_counts()
            mode_value = value_counts.idxmax()
            queries.append(f"{feature} == \"{mode_value}\"")

            # Combine the most frequent and most important categories
            if len(value_counts) <= 10:
                top_categories = value_counts.index
            else:
                top_frequent = value_counts.index[:10]
                important_categories = df.groupby(feature)[important_numeric_column].mean().abs().sort_values(ascending=False).index[:10]
                top_categories = pd.Index(list(set(top_frequent).union(set(important_categories))))

            for value in top_categories:
                queries.append(f"{feature} == \"{value}\"")

        # Date columns: Date range filters
        for feature in date_df.columns:
            min_date = df[feature].min().strftime('%Y-%m-%d')
            max_date = df[feature].max().strftime('%Y-%m-%d')
            queries.append(f"{feature} >= \"{min_date}\"")
            queries.append(f"{feature} <= \"{max_date}\"")

        # Boolean columns: True/False filters
        for feature in boolean_df.columns:
            queries.append(f"{feature} = True")
            queries.append(f"{feature} = False")

        # Missing values filters
        missing_features = df.columns[df.isnull().any()].tolist()
        for feature in missing_features:
            queries.append(f"{feature} = NULL")

        return list(dict.fromkeys(queries))
    except Exception as e:
        print(f"Error in suggestQuery function: {e}")
        return []

# Example usage:
# queries = suggestQuery("restaurants")
# print(queries)
