from unittest import mock
from unittest.mock import call

import pytest

from remove_uncompressed import process, HIGHLIGHT_FILES


def create_file(project, session, k):
    f = mock.MagicMock()
    f.key = f'{project}/{session}/{k}'
    return f


@pytest.mark.parametrize('session_compressed', [False, True])
@pytest.mark.parametrize('console_compressed', [False, True])
@pytest.mark.parametrize('network_compressed', [False, True])
def test(mocker, session_compressed, console_compressed, network_compressed):
    files = set(HIGHLIGHT_FILES)
    if session_compressed:
        files.add('session-contents-compressed')
    if console_compressed:
        files.add('console-messages-compressed')
    if network_compressed:
        files.add('network-resources-compressed')

    p = mocker.patch('remove_uncompressed.process_uncompressed')
    mocker.patch('remove_uncompressed.boto3')
    bucket = mocker.patch('remove_uncompressed.bucket')
    bucket.objects.filter.return_value = [
        create_file(p, s, k)
        for p in range(1, 10) for s in range(1, 10) for k in files
    ]
    process()
    if session_compressed and console_compressed and network_compressed:
        p.assert_has_calls(calls=[call(project=p, session=s) for p in range(1, 10) for s in range(1, 10)])
    else:
        p.assert_not_called()
