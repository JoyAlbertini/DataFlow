from typing import Any
from bokeh.embed import components
from bokeh.plotting import figure, show
from bokeh.models import ColumnDataSource
import database_util
import random
import pandas as pd


# this class is to create bokeh plot figures, first create an instance with the setting of the plot,
# then create a graph by calling any function with make_* in the name. Technically is possible to call them more than
# once to stack different graphs. Finally, call get_grap to get the javascript components to return to the front-end
class GraphOutput:
    def __init__(self, height: int = 350, min_width: int = 1000, expandable_width: bool = True):
        self.expandable_width = expandable_width
        self.min_width = min_width
        self.height = height
        self.fig = figure(height=self.height, width=self.min_width,
                          sizing_mode='scale_width' if self.expandable_width else 'fixed')

    def make_line(self, x_column: str, y_column: str, source: ColumnDataSource) -> None:
        self.fig.line(x=x_column, y=y_column, source=source)

    def make_scatter(self, x_column: str, y_column: str, source: ColumnDataSource) -> None:
        self.fig.scatter(x=x_column, y=y_column, source=source)

    def make_histogram(self, x_column: str, y_column: str, source: ColumnDataSource) -> None:
        self.fig.vbar(x=x_column, top=y_column, source=source, width=0.9)

    def make_bar(self, x_column: str, y_column: str, source: pd.DataFrame):
        source = source.reset_index()
        category = source[x_column].tolist()
        y = source[y_column].tolist()
        #self.fig.x_range=category
        self.fig = figure(height=self.height, width=self.min_width,
                  sizing_mode='scale_width' if self.expandable_width else 'fixed', x_range=category)
        self.fig.vbar(x=category, top=y, width=0.9)
        # TODO: need to make more kinds of graphs

    def get_graph(self) -> tuple[str, Any]:
        return components(self.fig)


#  test functions, delete later
def test_graph():
    df = database_util.load_dataframe("restaurants")

    df_filtered = df[["AverageCostForTwo", "AggregateRating"]]

    source = ColumnDataSource(df_filtered)

    p1 = figure(height=1000, width=1000, title="plot test")

    if random.choice([True, False]):
        p1.line("AverageCostForTwo", "AggregateRating", source=source)
    else:
        p1.scatter("AverageCostForTwo", "AggregateRating", source=source)
    script1, div1 = components(p1)
    return {"script": script1, "div": div1}
