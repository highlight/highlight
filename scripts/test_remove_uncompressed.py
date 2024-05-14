from unittest import mock

import pytest

from remove_uncompressed import process, HIGHLIGHT_FILES


def create_file(project, session, k):
    f = mock.MagicMock()
    f.key = f"{project}/{session}/{k}"
    return f


def expect_calls(m, files):
    for idx, c in enumerate(m.call_args_list):
        p = (idx // 9) + 1
        s = (idx % 9) + 1
        assert c.args[1:] == ([f"{p}/{s}/{f}" for f in sorted(files)], str(p), str(s))


@pytest.mark.parametrize("session_compressed", [False, True])
@pytest.mark.parametrize("network_compressed", [False, True])
@pytest.mark.parametrize("do_archive", [False, True])
@pytest.mark.parametrize("do_compress", [False, True])
def test(mocker, session_compressed, network_compressed, do_archive, do_compress):
    files = set(HIGHLIGHT_FILES)
    if session_compressed:
        files.add("session-contents-compressed")
    if network_compressed:
        files.add("network-resources-compressed")

    mock_compress = mocker.patch("remove_uncompressed.compress_uncompressed")
    mock_archive = mocker.patch("remove_uncompressed.archive_uncompressed")

    mocker.patch("remove_uncompressed.boto3")
    create_bucket = mocker.patch("remove_uncompressed.init_bucket")
    create_bucket.return_value.objects.filter.return_value = [
        create_file(p, s, k)
        for p in range(1, 10)
        for s in range(1, 10)
        for k in sorted(files)
    ]
    process(
        "mock-bucket", "1/", debug=True, do_archive=do_archive, do_compress=do_compress
    )
    if session_compressed and network_compressed:
        mock_compress.assert_not_called()
        expect_calls(mock_archive, files)
    else:
        if do_compress:
            expect_calls(mock_compress, files)
            if do_archive:
                expect_calls(mock_archive, files)
