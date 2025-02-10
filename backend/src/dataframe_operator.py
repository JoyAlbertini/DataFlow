from abc import ABC, abstractmethod
from typing import Union, List, Optional, Literal
import pandas as pd
from pandas.core.groupby import DataFrameGroupBy
from enum import StrEnum
from src.graphs import GraphOutput
from src.database_util import load_dataframe, fill_nan
from bokeh.models import ColumnDataSource
from dataframe_util import clean_string


class Operator(ABC):
    @abstractmethod
    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return None


def perform_pipeline(operators: List[Operator]) -> Union[pd.DataFrame, DataFrameGroupBy]:
    new_df: Optional[pd.DataFrame] = None
    for operator in operators:
        new_df = operator.apply(new_df)
    return new_df


class InputOperator(Operator):
    def __init__(self, df_name: str) -> None:
        self.df_name = df_name

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return load_dataframe(self.df_name)


class OutputOperator(Operator):
    def __init__(self):
        pass

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return df


class Filter(Operator):
    def __init__(self, query: str) -> None:
        self._query: str = clean_string(query)

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return df.query(self._query)


class GroupBy(Operator):
    def __init__(self, column_name: str, aggregation: str) -> None:
        self._column_name: str = column_name
        self._aggregation: str = aggregation

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        if not set(self._column_name) <= set(df.columns):
            raise ValueError(f"No such columns: {self._column_name}")
        if self._aggregation == "count":
            return pd.DataFrame(df.groupby(self._column_name).size()).rename(columns={0: "Count"})
        if self._aggregation == "count unique":
            return df.groupby(self._column_name).nunique()
        if self._aggregation in ["mean", "max", "std", "min", "sum"]:
            new_df = df.select_dtypes(include="number")
            new_df[self._column_name] = df[self._column_name]
            return new_df.groupby(self._column_name).agg(self._aggregation)
        return df.groupby(self._column_name).agg(self._aggregation)


class AggregationType(StrEnum):
    MAX: str = "max"
    MIN: str = "min"
    COUNT: str = "count"
    AVG: str = "avg"
    STD: str = "std"
    UNIQUE: str = "unique"
    SUM: str = "sum"

    @staticmethod
    def from_str(value: str):
        allowed: dict[str, AggregationType] = {"max": AggregationType.MAX, "min": AggregationType.MIN,
                                               "count": AggregationType.COUNT, "avg": AggregationType.AVG,
                                               "std": AggregationType.STD, "unique": AggregationType.UNIQUE,
                                               "sum": AggregationType.SUM
                                               }
        if value in allowed.keys():
            return allowed[value]
        else:
            return None


class Aggregation(Operator):
    def __init__(self, aggregation: AggregationType, column_name: str) -> None:
        self._aggregation: AggregationType = aggregation
        self._column_name: str = column_name

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        if self._column_name not in df.columns:
            raise ValueError(f"No such column name: {self._column_name}")
        return df.agg([self._aggregation])


class Join(Operator):
    def __init__(self, on: str, how: Literal["left", "right", "inner", "outer", "cross"], other: pd.DataFrame):
        self.on = on
        self.how = how
        self.other = other

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return fill_nan(df.join(other=self.other, on=self.on, how=self.how, lsuffix='_left', rsuffix='_right'))


class Merge(Operator):
    def __init__(self, left: str, right: str, other: pd.DataFrame):
        self.left = left
        self.right = right
        self.other = other

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return pd.merge(df, self.other, left_on=self.left, right_on=self.right)


class Drop(Operator):
    def __init__(self, columns: str):
        self.columns = columns

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return df.drop(columns=self.columns)


class Sort(Operator):
    def __init__(self, columns: list[str], method: str):
        self.columns = columns
        self.method = method

    def apply(self, df: Union[pd.DataFrame, DataFrameGroupBy]) -> Union[pd.DataFrame, DataFrameGroupBy]:
        return df.sort_values(by=self.columns, ascending=self.method == "ascending")


def make_output_graph(out_df: pd.DataFrame, x, y, plot_type, width, height):
    # the plot can be created with different parameters coming from the front-end
    g = GraphOutput(height=height, min_width=width)
    data_source = ColumnDataSource(out_df)
    # it is technically possible to have multiple plots on one figure
    if plot_type == "line":
        g.make_line(x_column=x, y_column=y, source=data_source)
    if plot_type == "scatter":
        g.make_scatter(x_column=x, y_column=y, source=data_source)
    if plot_type == "histogram":
        g.make_histogram(x_column=x, y_column=y, source=data_source)
    if plot_type == "bar":
        g.make_bar(x_column=x, y_column=y, source=out_df)

    script, div = g.get_graph()
    return {
        "div": div,
        "script": script
    }
