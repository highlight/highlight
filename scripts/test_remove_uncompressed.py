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
@pytest.mark.parametrize('do_archive', [False, True])
@pytest.mark.parametrize('do_compress', [False, True])
def test(mocker, session_compressed, console_compressed, network_compressed, do_archive, do_compress):
    files = set(HIGHLIGHT_FILES)
    if session_compressed:
        files.add('session-contents-compressed')
    if console_compressed:
        files.add('console-messages-compressed')
    if network_compressed:
        files.add('network-resources-compressed')

    mock_compress = mocker.patch('remove_uncompressed.compress_uncompressed')
    mock_archive = mocker.patch('remove_uncompressed.archive_uncompressed')
    mocker.patch('remove_uncompressed.boto3')
    create_bucket = mocker.patch('remove_uncompressed.init_bucket')
    create_bucket.return_value.objects.filter.return_value = [
        create_file(p, s, k)
        for p in range(1, 10) for s in range(1, 10) for k in files
    ]
    process('mock-bucket', '1/', debug=True, do_archive=do_archive, do_compress=do_compress)
    if session_compressed and console_compressed and network_compressed:
        mock_archive.assert_has_calls(calls=[
            call(args=('mock-bucket', []),
                 kwds={'project': str(p), 'session': str(s), 'do_archive': do_archive})
            for p in range(1, 10) for s in range(1, 10)
        ])
        mock_compress.assert_has_calls(calls=[
            call(args=('mock-bucket',),
                 kwds={'project': str(p), 'session': str(s), 'do_compress': do_compress})
            for p in range(1, 10) for s in range(1, 10)
        ])
    else:
        mock_archive.assert_not_called()
        mock_compress.assert_not_called()
