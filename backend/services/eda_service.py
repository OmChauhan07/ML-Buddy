import os
import pandas as pd
from ydata_profiling import ProfileReport
from services.job_tracker import complete_job, fail_job


REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "reports")


def generate_eda_report(job_id: str, csv_path: str) -> None:
    """
    Takes a job ID and path to a CSV file, generates a ydata-profiling
    HTML report, saves it, and updates the job tracker.
    """
    try:
        os.makedirs(REPORTS_DIR, exist_ok=True)

        df = pd.read_csv(csv_path)

        base_name = os.path.splitext(os.path.basename(csv_path))[0]
        report_filename = f"{base_name}_eda_report.html"
        report_path = os.path.join(REPORTS_DIR, report_filename)

        profile = ProfileReport(
            df,
            title=f"EDA Report — {base_name}",
            explorative=True,
            minimal=False,
        )
        profile.to_file(report_path)

        print(f"EDA report saved to: {report_path}")
        complete_job(job_id, {
            "report_filename": report_filename,
            "report_url": f"/reports/{report_filename}",
        })
    except Exception as e:
        print(f"EDA report failed: {e}")
        fail_job(job_id, str(e))
