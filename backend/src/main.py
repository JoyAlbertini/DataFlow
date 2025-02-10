from typing import Optional, List
import pandas as pd
import flask
from flask_cors import CORS
from http import HTTPStatus
from flask import request, Response, jsonify, make_response
from src.database_util import get_sample, load_dataframe, get_available_df
from src.dataframe_operator import perform_pipeline, Operator, make_output_graph
from src.operator_factory import OperationsFactory
from src.dataframe_util import get_df_columns
from src.suggestQuery import suggestQuery
import graphs
import json
import traceback
from pathlib import Path
from file_util import random_word

app = flask.Flask("Cool app")
CORS(app)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/type-operation-mapping")
def get_type_mapping():
    mapping: dict = {
        "text": {"aggregation": ["max", "min", "count", "unique_count"], },
        "number": {"aggregation": ["max", "min", "count", "unique_count", "mean", "std", "percentile"], },
        "boolean": {"aggregation": ["count"]},
        "coordinates": {}
    }
    return


@app.get("/get-sample/")
def get_dataframe_sample():
    body = request.json
    name_of_dataframe = body.get("dataframe")
    df: Optional[pd.DataFrame] = load_dataframe(name_of_dataframe)
    if df is None:
        return Response(status=HTTPStatus.NOT_FOUND, response="robe")
    user_name: str = body.get("user_name")
    result: dict = get_sample(df=df)
    return {"sample": result}


@app.post("/perform-operations/")
def perform_operations():
    try:
        body = request.json
        body = body.get("data")
        name_of_dataframe = body.get("dataframe")
        df: Optional[pd.DataFrame] = load_dataframe(name_of_dataframe)
        if df is None:
            return Response(status=HTTPStatus.NOT_FOUND, response="Dataframe not found")
        operations: list = body.get("operators")
        operators: List[Operator] = [OperationsFactory.create_operator(op) for op in operations]
        new_df: pd.DataFrame = perform_pipeline(operators=operators)
        sample = {"sample": get_sample(df=new_df, size=1000)}
        res = make_response(sample)
        res.content_type = "application/json"
        return res

    except Exception as e:
        error_message = str(e)
        traceback_str = traceback.format_exc()
        print(f"Error in execute queries: {error_message}")
        print(traceback_str)
        message = f"The following error occurred: {type(e).__name__}, arguments: {e.args})"
        response = {
            "error": message
        }
        return Response(json.dumps(response, indent=4), mimetype='application/json', status=500)


@app.post("/perform-operations-save/")
def perform_operations_save():
    try:
        body = request.json
        body = body.get("data")
        name_of_dataframe = body.get("dataframe")
        df: Optional[pd.DataFrame] = load_dataframe(name_of_dataframe)
        if df is None:
            return Response(status=HTTPStatus.NOT_FOUND, response="Dataframe not found")
        operations: list = body.get("operators")
        operators: List[Operator] = [OperationsFactory.create_operator(op) for op in operations]
        new_df: pd.DataFrame = perform_pipeline(operators=operators)
        tmp_output: Path = Path(f"./../tmp_out/{random_word(26)}.csv")
        new_df.to_csv(path_or_buf=tmp_output, index=False)
        csv_string: str = ''
        with open(tmp_output, 'r') as file:
            csv_string = file.read()
        sample = {"csv": csv_string}
        tmp_output.unlink(missing_ok=True)
        res = make_response(sample)
        res.content_type = "application/json"
        return res

    except Exception as e:
        error_message = str(e)
        traceback_str = traceback.format_exc()
        print(f"Error in execute queries: {error_message}")
        print(traceback_str)
        message = f"The following error occurred: {type(e).__name__}, arguments: {e.args})"
        response = {
            "error": message
        }
        return Response(json.dumps(response, indent=4), mimetype='application/json', status=500)


@app.post("/perform-operations-graph/")
def perform_operations_graph():
    body = request.json
    body = body.get("data")
    graph = body.get("graph")
    name_of_dataframe = body.get("dataframe")
    width = body.get("width", 1000)
    height = body.get("height", 350)
    df: Optional[pd.DataFrame] = load_dataframe(name_of_dataframe)
    if df is None:
        return Response(status=HTTPStatus.NOT_FOUND, response="robe")
    operations: list = body.get("operators")
    operators: List[Operator] = [OperationsFactory.create_operator(op) for op in operations]
    new_df: pd.DataFrame = perform_pipeline(operators=operators)
    graph_components = make_output_graph(out_df=new_df, x=graph.get("x_axis"), y=graph.get("y_axis"),
                                         plot_type=graph.get("type"), width=width, height=height)
    return graph_components


@app.get("/test")
def test():
    return {"message": "robe"}


@app.get("/graph")
def get_graph():
    json_item = graphs.test_graph()
    response = jsonify({"graph": json_item})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.post("/columns")
def get_columns():
    body = request.json
    dataframe_names_list: list = body.get("df_names")
    join_method: Optional[str] = body.get("method")
    if dataframe_names_list is None or len(dataframe_names_list) == 0:
        return Response(status=HTTPStatus.BAD_REQUEST, response="invalid list")
    columns_names: list[str] = get_df_columns(dataframe_names=dataframe_names_list, join_method=join_method)
    response = jsonify({"columns_names": columns_names})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = Response()
        res.headers.add("X-Content-Type-Options", "*")
        return res


@app.get("/availableDF")
def get_all_available_df():
    response = jsonify({"dfs": get_available_df()})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@app.route('/suggestQueries/', methods=['GET'])
def getQueriesNoDatabase():
    response = {
        "database": "",
        "queries": [],
        "error": "No database requested"
    }
    return Response(json.dumps(response, indent=4), mimetype='application/json', status=500)


@app.route('/suggestQueries/<databaseName>', methods=['GET'])
def getQueries(databaseName):
    try:
        queries = suggestQuery(databaseName)
        if queries == "":
            queries = []
        
        response = {
            "database": databaseName,
            "queries": queries
        }
        return Response(json.dumps(response, indent=4), mimetype='application/json')
    except Exception as e:
        error_message = str(e)
        traceback_str = traceback.format_exc()
        print(f"Error in getQueries: {error_message}")
        print(traceback_str)
        
        response = {
            "database": databaseName,
            "queries": [],
            "error": "An error occurred while processing the request."
        }
        return Response(json.dumps(response, indent=4), mimetype='application/json', status=500)


def main():
    Path("./../tmp_out").mkdir(exist_ok=True)
    app.run(host="0.0.0.0", port=3000)


if __name__ == "__main__":
    main()
