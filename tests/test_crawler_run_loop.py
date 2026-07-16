from unittest.mock import AsyncMock, patch

import pytest

from api.schemas import CrawlerStartRequest, PlatformEnum
from api.services.crawler_manager import CrawlerManager, CrawlerTask


@pytest.mark.asyncio
async def test_non_looping_task_runs_exactly_once():
    """loop_execution=False must still execute one crawler cycle."""
    config = CrawlerStartRequest(
        platform=PlatformEnum.XHS,
        keywords="test",
        loop_execution=False,
    )
    manager = CrawlerManager()
    task = CrawlerTask("xhs", config)
    task._read_output = AsyncMock()

    fake_process = type("FakeProcess", (), {})()
    with (
        patch(
            "api.services.crawler_manager.analytics_repository.create_run",
            return_value="run-id-12345678",
        ),
        patch(
            "api.services.crawler_manager.load_normalized_contents_from_sqlite",
            return_value=[],
        ),
        patch(
            "api.services.crawler_manager.subprocess.Popen",
            return_value=fake_process,
        ) as popen,
    ):
        await task.run_loop(manager)

    popen.assert_called_once()
    task._read_output.assert_awaited_once_with(manager)
    assert task.status == "idle"
