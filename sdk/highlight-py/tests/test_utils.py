import pytest
from highlight_io.utils import utils

request_url = "http://localhost:80/endpoint"


@pytest.mark.parametrize(
    "trace_origins", [True, ["localhost"], ["highlight.io", "localhost"], ["\d{2}"]]
)
def test_truthy_trace_origin_url(trace_origins):
    assert utils.trace_origin_url(trace_origins, request_url) == True


@pytest.mark.parametrize(
    "trace_origins",
    [False, [], ["highlight.io"], ["notlocalhost", "highlight.io"], ["\d{3}"]],
)
def test_falsy_trace_origin_url(trace_origins):
    assert utils.trace_origin_url(trace_origins, request_url) == False
