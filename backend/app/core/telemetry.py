import time
import logging
from contextlib import contextmanager

logger = logging.getLogger("civoai.telemetry")

@contextmanager
def measure_latency(report_id: str, stage: str):
    start_time_real = time.time()
    start_perf = time.perf_counter()
    success = False
    try:
        yield
        success = True
    finally:
        end_perf = time.perf_counter()
        end_time_real = time.time()
        duration_ms = (end_perf - start_perf) * 1000
        
        status = "SUCCESS" if success else "FAILURE"
        
        log_msg = (
            f"TELEMETRY | report_id={report_id} | stage={stage} | "
            f"start_time={start_time_real:.3f} | end_time={end_time_real:.3f} | "
            f"duration_ms={duration_ms:.2f} | status={status}"
        )
        logger.info(log_msg)
