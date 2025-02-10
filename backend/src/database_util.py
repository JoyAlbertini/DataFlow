from pathlib import Path
from typing import Optional

import pandas as pd

from src.file_util import get_data_folder
import csv


def find_delimiter(filename):
    try: 
        sniffer = csv.Sniffer()
        with open(filename) as fp:
            dialect: csv.Dialect = sniffer.sniff(fp.read(100))
            delimiter: str = dialect.delimiter
        return delimiter
    except:
        with open(filename, 'r', encoding='utf-8') as file:
            lines = file.readlines(1000)
        comma_count = sum(line.count(',') for line in lines)
        semicolon_count = sum(line.count(';') for line in lines)

        delimiter = ',' if comma_count > semicolon_count else ';'
        return delimiter


def load_dataframe(dataframe_name: str, index_col=None, nrows=None) -> Optional[pd.DataFrame]:
    data_folder: Path = get_data_folder()
    dataframe_file: Optional[Path] = None
    for file in data_folder.iterdir():
        if file.stem == dataframe_name:
            dataframe_file = data_folder.joinpath(file.name)
    if dataframe_file is None:
        return None
    delimiter: str = find_delimiter(dataframe_file)
    return fill_nan(
        pd.read_csv(filepath_or_buffer=dataframe_file, delimiter=delimiter, index_col=index_col, nrows=nrows))
    # there must be no NaN, otherwise in the front-end the json won't be parsable
    #  normally we should expect the df to be already cleaned, but this is just for safeguard.


def get_sample(df: pd.DataFrame, size: int=10) -> dict:
    index_names = df.index.names.copy()
    if index_names is None:
        index_names = ["index"]
    else:
        index_names[0] = "index"
    return df.reset_index(names=index_names).rename(columns={'index': "id"}).head(size).to_dict(orient="index")


def perform_query(df: pd.DataFrame, query: str) -> pd.DataFrame:
    return df.query(query)


def get_available_df() -> list[str]:
    data_path: Path = get_data_folder()
    files: list[str] = []
    files_candidate = data_path.iterdir()
    for file in files_candidate:
        if file.is_file() and file.suffix == ".csv":  # TODO can we get more file types???
            files.append(file.stem)
    return files


def fill_nan(df: pd.DataFrame) -> pd.DataFrame:
    columns_types: pd.Series = df.dtypes
    default = {"bool": False, "int64": 0, "float64": 0.0, "object": ""}
    mapping: dict = {}
    for key_column, type_column in columns_types.items():
        new_val = default[type_column.name]
        mapping[key_column] = new_val if new_val is not None else ""
    return df.fillna(mapping)