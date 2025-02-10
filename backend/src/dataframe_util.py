import pandas as pd
from typing import Optional
from src.database_util import load_dataframe


def get_df_columns(dataframe_names: list[str], join_method: Optional[str]) -> list[str]:
    if len(dataframe_names) == 0:
        return list()
    df: Optional[pd.DataFrame] = load_dataframe(dataframe_names.pop(), index_col=None, nrows=1)
    columns = set(list(df))
    for df_name in dataframe_names:
        df: Optional[pd.DataFrame] = load_dataframe(df_name, index_col=None, nrows=1)
        if df is not None:
            if join_method == "intersection":
                columns = columns.intersection(set(list(df)))
            else:
                columns = columns.union(set(list(df)))
    return list(columns)


def clean_string(text: str) -> str:
    print("FUCK YOU", text)
    string = text.replace(u'\xa0', u' ')
    return string
