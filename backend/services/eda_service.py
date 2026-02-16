import os
import pandas as pd
from ydata_profiling import ProfileReport


REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "reports")


def generate_eda_report(csv_path: str) -> str:
    """
    Takes a path to a CSV file, generates a ydata-profiling HTML report,
    and returns the path to the saved report.
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)

    df = pd.read_csv(csv_path)

    # Use the filename (without extension) as the report name
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
    return report_path
