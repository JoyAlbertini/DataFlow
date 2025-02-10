from typing import List
import pandas as pd
from dataframe_operator import (Operator, Filter, GroupBy, Aggregation, AggregationType, InputOperator, OutputOperator,
                                Join, Drop, Sort, Merge)
from src.dataframe_operator import perform_pipeline


class OperationsFactory:

    @staticmethod
    def create_operator(operator_obj: dict) -> Operator:
        operator_type: str = operator_obj.get("operator")

        if operator_type == "filter":
            return Filter(operator_obj.get("query"))

        if operator_type == "groupBy":
            return GroupBy(operator_obj.get("on"), operator_obj.get("aggregation"))

        if operator_type == "agg":
            agg_type: AggregationType = AggregationType.from_str(operator_obj.get("type"))
            return Aggregation(agg_type, operator_obj.get("on"))
        if operator_type == "input":
            return InputOperator(df_name=operator_obj.get("dataframe"))
        if operator_type == "output":
            return OutputOperator()
        if operator_type == "join":
            other_operations: list = operator_obj.get("operand")
            # recursively execute the other part of the join operator
            other_operators: List[Operator] = [OperationsFactory.create_operator(op) for op in other_operations]
            other_df: pd.DataFrame = perform_pipeline(operators=other_operators)
            on = operator_obj.get("on")
            how = operator_obj.get("how")
            return Join(how=how, on=on, other=other_df)
        if operator_type == "drop":
            columns: list[str] = operator_obj.get("columns", [])
            return Drop(columns=columns)
        if operator_type == "merge":
            other_operations: list = operator_obj.get("operand")
            other_operators: List[Operator] = [OperationsFactory.create_operator(op) for op in other_operations]
            other_df: pd.DataFrame = perform_pipeline(operators=other_operators)
            left_column: str = operator_obj.get("left_column")
            right_column: str = operator_obj.get("right_column")
            return Merge(left=left_column, right=right_column, other=other_df)
        if operator_type == "sort":
            columns: list[str] = operator_obj.get("columns")
            method: str = operator_obj.get("method")
            return Sort(columns=columns, method=method)
